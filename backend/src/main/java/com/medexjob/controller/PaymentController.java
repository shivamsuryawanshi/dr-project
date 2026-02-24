// AI assisted development
package com.medexjob.controller;

import com.medexjob.entity.Invoice;
import com.medexjob.entity.Payment;
import com.medexjob.repository.InvoiceRepository;
import com.medexjob.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentController(PaymentRepository paymentRepository, InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Get invoice metadata for a payment belonging to the authenticated user
     * GET /api/payments/{paymentId}/invoice
     */
    @GetMapping("/{paymentId}/invoice")
    public ResponseEntity<Map<String, Object>> getInvoice(@PathVariable("paymentId") String paymentId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            UUID paymentUuid;
            try {
                paymentUuid = UUID.fromString(paymentId);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid paymentId format"));
            }

            Optional<Payment> paymentOpt = paymentRepository.findById(paymentUuid);
            if (paymentOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Payment not found"));
            }

            Payment payment = paymentOpt.get();
            String email = authentication.getName();

            // Authorization: only owner of the payment can access the invoice
            if (!email.equalsIgnoreCase(authentication.getName())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            Optional<Invoice> invoiceOpt = invoiceRepository.findByPaymentId(payment.getId());
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Invoice not found for this payment"));
            }

            Invoice invoice = invoiceOpt.get();
            Map<String, Object> response = Map.of(
                    "invoiceNumber", invoice.getInvoiceNumber(),
                    "fileUrl", invoice.getFileUrl(),
                    "status", invoice.getStatus().name().toLowerCase()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching invoice for payment {}", paymentId, e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch invoice"));
        }
    }
}

