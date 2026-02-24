// AI assisted development
package com.medexjob.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class RazorpayService {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayService.class);
    
    @Value("${razorpay.key-id}")
    private String razorpayKeyId;
    
    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.webhook-secret:}")
    private String razorpayWebhookSecret;
    
    private RazorpayClient razorpayClient;
    
    /**
     * Initialize Razorpay client
     */
    private RazorpayClient getRazorpayClient() throws RazorpayException {
        if (razorpayClient == null) {
            razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        }
        return razorpayClient;
    }
    
    /**
     * Create Razorpay order
     * @param amount Amount in paise (e.g., 99900 for ₹999)
     * @param currency Currency code (default: INR)
     * @param receipt Receipt ID for tracking
     * @return Order details
     */
    public Map<String, Object> createOrder(BigDecimal amount, String currency, String receipt) {
        try {
            // Convert amount to paise (multiply by 100)
            int amountInPaise = amount.multiply(new BigDecimal("100")).intValue();
            
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise); // Amount in paise
            orderRequest.put("currency", currency != null ? currency : "INR");
            orderRequest.put("receipt", receipt);
            orderRequest.put("payment_capture", 1); // Auto capture payment
            
            RazorpayClient client = getRazorpayClient();
            Order order = client.orders.create(orderRequest);
            
            Map<String, Object> orderDetails = new HashMap<>();
            orderDetails.put("id", order.get("id"));
            orderDetails.put("amount", order.get("amount"));
            orderDetails.put("currency", order.get("currency"));
            orderDetails.put("receipt", order.get("receipt"));
            orderDetails.put("status", order.get("status"));
            orderDetails.put("created_at", order.get("created_at"));
            
            String orderId = order.get("id") != null ? order.get("id").toString() : "unknown";
            logger.info("Razorpay order created: {}", orderId);
            return orderDetails;
            
        } catch (RazorpayException e) {
            logger.error("Error creating Razorpay order", e);
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error creating Razorpay order", e);
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }
    
    /**
     * Verify payment signature
     * @param orderId Razorpay order ID
     * @param paymentId Razorpay payment ID
     * @param signature Payment signature
     * @return true if signature is valid
     */
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            // Create JSONObject with payment details as required by Razorpay SDK
            JSONObject paymentData = new JSONObject();
            paymentData.put("razorpay_order_id", orderId);
            paymentData.put("razorpay_payment_id", paymentId);
            paymentData.put("razorpay_signature", signature);
            
            // Verify signature using Razorpay SDK
            boolean isValid = com.razorpay.Utils.verifyPaymentSignature(paymentData, razorpayKeySecret);
            return isValid;
        } catch (Exception e) {
            logger.error("Error verifying payment signature", e);
            return false;
        }
    }

    /**
     * Verify Razorpay webhook signature using HMAC SHA256
     * @param payload Raw request body
     * @param receivedSignature Signature from X-Razorpay-Signature header
     * @return true if signature is valid
     */
    public boolean verifyWebhookSignature(String payload, String receivedSignature) {
        try {
            if (razorpayWebhookSecret == null || razorpayWebhookSecret.isEmpty()) {
                logger.error("Razorpay webhook secret is not configured");
                return false;
            }
            if (payload == null || receivedSignature == null) {
                return false;
            }

            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec =
                    new javax.crypto.spec.SecretKeySpec(razorpayWebhookSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] digest = mac.doFinal(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String computedSignature = java.util.Base64.getEncoder().encodeToString(digest);

            boolean valid = computedSignature.equals(receivedSignature);
            if (!valid) {
                logger.warn("Invalid Razorpay webhook signature");
            }
            return valid;
        } catch (Exception e) {
            logger.error("Error verifying Razorpay webhook signature", e);
            return false;
        }
    }
    
    /**
     * Get Razorpay key ID for frontend
     * @return Key ID
     */
    public String getKeyId() {
        return razorpayKeyId;
    }
}

