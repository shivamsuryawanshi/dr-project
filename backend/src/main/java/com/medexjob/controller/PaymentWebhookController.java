// AI assisted development
package com.medexjob.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medexjob.entity.Payment;
import com.medexjob.entity.Subscription;
import com.medexjob.entity.SubscriptionPlan;
import com.medexjob.repository.PaymentRepository;
import com.medexjob.repository.SubscriptionPlanRepository;
import com.medexjob.repository.SubscriptionRepository;
import com.medexjob.service.InvoiceService;
import com.medexjob.service.RazorpayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments/razorpay")
public class PaymentWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentWebhookController.class);

    private final RazorpayService razorpayService;
    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final InvoiceService invoiceService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaymentWebhookController(
            RazorpayService razorpayService,
            PaymentRepository paymentRepository,
            SubscriptionRepository subscriptionRepository,
            SubscriptionPlanRepository subscriptionPlanRepository,
            InvoiceService invoiceService) {
        this.razorpayService = razorpayService;
        this.paymentRepository = paymentRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.invoiceService = invoiceService;
    }

    /**
     * Razorpay webhook endpoint (permitAll in security config)
     * Path: POST /api/payments/razorpay/webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(name = "X-Razorpay-Signature", required = false) String signatureHeader) {
        try {
            if (signatureHeader == null || signatureHeader.isEmpty()) {
                logger.warn("Missing X-Razorpay-Signature header on webhook");
                return ResponseEntity.status(400).body(Map.of("error", "Missing signature header"));
            }

            boolean valid = razorpayService.verifyWebhookSignature(payload, signatureHeader);
            if (!valid) {
                logger.warn("Webhook signature verification failed");
                return ResponseEntity.status(400).body(Map.of("error", "Invalid webhook signature"));
            }

            JsonNode root = objectMapper.readTree(payload);
            String event = root.path("event").asText("");
            JsonNode payloadNode = root.path("payload");

            String razorpayPaymentId = null;
            String razorpayOrderId = null;

            if (payloadNode.has("payment")) {
                JsonNode paymentEntity = payloadNode.path("payment").path("entity");
                razorpayPaymentId = paymentEntity.path("id").asText(null);
                razorpayOrderId = paymentEntity.path("order_id").asText(null);
            } else if (payloadNode.has("order")) {
                JsonNode orderEntity = payloadNode.path("order").path("entity");
                razorpayOrderId = orderEntity.path("id").asText(null);
            }

            if (razorpayOrderId == null && razorpayPaymentId == null) {
                logger.warn("Webhook payload missing order/payment identifiers");
                return ResponseEntity.ok(Map.of("message", "Ignored webhook without order/payment reference"));
            }

            Optional<Payment> paymentOpt = Optional.empty();
            if (razorpayOrderId != null) {
                paymentOpt = paymentRepository.findByGatewayOrderId(razorpayOrderId);
            }
            if (paymentOpt.isEmpty() && razorpayPaymentId != null) {
                paymentOpt = paymentRepository.findByGatewayPaymentId(razorpayPaymentId);
            }

            if (paymentOpt.isEmpty()) {
                logger.warn("No payment found for Razorpay webhook. orderId={}, paymentId={}", razorpayOrderId, razorpayPaymentId);
                return ResponseEntity.ok(Map.of("message", "No matching payment found"));
            }

            Payment payment = paymentOpt.get();

            boolean successEvent = "payment.captured".equals(event) || "order.paid".equals(event);
            boolean failureEvent = "payment.failed".equals(event);

            if (successEvent) {
                if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
                    logger.info("Webhook received for already successful payment {}", payment.getId());
                    return ResponseEntity.ok(Map.of("message", "Payment already marked as success"));
                }
                if (payment.getStatus() == Payment.PaymentStatus.FAILED) {
                    logger.warn("Success webhook received for payment {} currently marked as FAILED", payment.getId());
                    return ResponseEntity.ok(Map.of("message", "Conflicting payment state, no changes applied"));
                }

                if (razorpayPaymentId != null) {
                    payment.setGatewayPaymentId(razorpayPaymentId);
                }
                payment.setStatus(Payment.PaymentStatus.SUCCESS);
                payment.setPaidAt(LocalDateTime.now());

                UUID planId = payment.getPlanId();
                if (planId != null) {
                    Optional<SubscriptionPlan> planOpt = subscriptionPlanRepository.findById(planId);
                    if (planOpt.isPresent()) {
                        SubscriptionPlan plan = planOpt.get();
                        BigDecimal expectedAmount = plan.getFinalPrice() != null ? plan.getFinalPrice() : plan.getPrice();
                        if (expectedAmount != null && payment.getAmount() != null
                                && payment.getAmount().compareTo(expectedAmount) == 0) {
                            if (payment.getSubscription() == null) {
                                Optional<Subscription> existing = subscriptionRepository
                                        .findActiveSubscriptionByUser(payment.getUserId(), LocalDate.now());
                                existing.ifPresent(sub -> {
                                    sub.setStatus(Subscription.SubscriptionStatus.CANCELLED);
                                    sub.setAutoRenew(false);
                                    subscriptionRepository.save(sub);
                                });

                                Subscription subscription = new Subscription(payment.getUserId(), plan, LocalDate.now(),
                                        calculateEndDate(LocalDate.now(), plan.getDuration()));
                                subscription = subscriptionRepository.save(subscription);
                                payment.setSubscription(subscription);
                            }
                        } else {
                            logger.warn("Amount mismatch on webhook for payment {}", payment.getId());
                        }
                    } else {
                        logger.warn("Plan not found for payment {} during webhook processing", payment.getId());
                    }
                }

                payment = paymentRepository.save(payment);
                try {
                    invoiceService.createInvoiceForPayment(payment);
                } catch (Exception e) {
                    logger.error("Failed to generate invoice from webhook for payment {}", payment.getId(), e);
                }

                return ResponseEntity.ok(Map.of("message", "Payment marked as success via webhook"));

            } else if (failureEvent) {
                if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
                    logger.warn("Failure webhook received for payment {} already marked SUCCESS", payment.getId());
                    return ResponseEntity.ok(Map.of("message", "Conflicting payment state, no changes applied"));
                }
                payment.setStatus(Payment.PaymentStatus.FAILED);
                JsonNode errorNode = payloadNode.path("payment").path("entity").path("error_description");
                if (!errorNode.isMissingNode()) {
                    payment.setFailureReason(errorNode.asText());
                }
                paymentRepository.save(payment);
                return ResponseEntity.ok(Map.of("message", "Payment marked as failed via webhook"));
            }

            return ResponseEntity.ok(Map.of("message", "Webhook event ignored", "event", event));
        } catch (Exception e) {
            logger.error("Error processing Razorpay webhook", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process webhook"));
        }
    }

    private LocalDate calculateEndDate(LocalDate startDate, String duration) {
        if (duration == null) {
            return startDate.plusMonths(1);
        }
        switch (duration.toLowerCase()) {
            case "per post":
            case "monthly":
                return startDate.plusMonths(1);
            case "yearly":
                return startDate.plusYears(1);
            default:
                return startDate.plusMonths(1);
        }
    }
}

