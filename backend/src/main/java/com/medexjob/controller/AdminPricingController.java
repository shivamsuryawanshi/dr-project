// AI assisted development
package com.medexjob.controller;

import com.medexjob.entity.SubscriptionPlan;
import com.medexjob.repository.SubscriptionPlanRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/pricing")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminPricingController {

    private static final Logger logger = LoggerFactory.getLogger(AdminPricingController.class);

    private final SubscriptionPlanRepository planRepository;

    public AdminPricingController(SubscriptionPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    /**
     * Health check endpoint for admin pricing
     * GET /api/admin/pricing/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        logger.info("Admin Pricing health check called");
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "service", "Admin Pricing Management",
            "endpoint", "/api/admin/pricing/plans",
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    /**
     * Get all subscription plans with pricing details
     * GET /api/admin/pricing/plans
     */
    @GetMapping("/plans")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllPlans() {
        logger.info("=== Admin Pricing API Called ===");
        logger.info("Endpoint: GET /api/admin/pricing/plans");
        logger.info("Repository instance: {}", planRepository != null ? "Initialized" : "NULL");
        
        try {
            logger.info("Fetching all subscription plans for admin pricing management");
            
            // Check if repository is accessible
            if (planRepository == null) {
                logger.error("SubscriptionPlanRepository is null");
                // Return 200 with error info instead of 500
                Map<String, Object> errorResponse = new LinkedHashMap<>();
                errorResponse.put("plans", new ArrayList<>());
                errorResponse.put("count", 0);
                errorResponse.put("error", true);
                errorResponse.put("message", "Database repository not initialized. Please check backend configuration.");
                errorResponse.put("timestamp", LocalDateTime.now().toString());
                return ResponseEntity.ok(errorResponse);
            }

            List<SubscriptionPlan> plans = new ArrayList<>();
            try {
                // Try the ordered query first
                try {
                    logger.debug("Attempting to fetch plans using findAllByOrderByDisplayOrderAsc()");
                    plans = planRepository.findAllByOrderByDisplayOrderAsc();
                    if (plans == null) {
                        plans = new ArrayList<>();
                    }
                    logger.info("Successfully fetched {} plans from database using ordered query", plans.size());
                } catch (Exception methodException) {
                    logger.warn("Ordered query failed: {}", methodException.getMessage());
                    // Fallback to findAll() if custom method fails
                    try {
                        logger.debug("Attempting fallback to findAll()");
                        plans = planRepository.findAll();
                        if (plans == null) {
                            plans = new ArrayList<>();
                        } else if (!plans.isEmpty()) {
                            // Manual sort by displayOrder
                            plans.sort((p1, p2) -> {
                                Integer order1 = p1.getDisplayOrder() != null ? p1.getDisplayOrder() : 0;
                                Integer order2 = p2.getDisplayOrder() != null ? p2.getDisplayOrder() : 0;
                                return order1.compareTo(order2);
                            });
                        }
                        logger.info("Successfully fetched {} plans using fallback method", plans.size());
                    } catch (Exception fallbackException) {
                        logger.error("Both query methods failed. Fallback exception: {}", fallbackException.getMessage());
                        // Return empty array instead of error - better UX
                        plans = new ArrayList<>();
                        logger.warn("Returning empty plans array due to database query failures");
                    }
                }
            } catch (Exception dbException) {
                logger.error("Database error while fetching plans - Stack trace:", dbException);
                logger.error("Exception type: {}, Message: {}", dbException.getClass().getName(), dbException.getMessage());
                if (dbException.getCause() != null) {
                    logger.error("Root cause: {}", dbException.getCause().getMessage());
                }
                // Return empty array with warning instead of error - allows UI to show empty state
                plans = new ArrayList<>();
                logger.warn("Database error occurred, returning empty plans array. Error: {}", dbException.getMessage());
            }

            // Handle empty plans list gracefully
            if (plans == null) {
                logger.warn("Plans list is null, returning empty array");
                return ResponseEntity.ok(Map.of("plans", new ArrayList<>()));
            }
            
            // Handle empty list
            if (plans.isEmpty()) {
                logger.info("No subscription plans found in database, returning empty array");
                return ResponseEntity.ok(Map.of("plans", new ArrayList<>()));
            }

            // Convert plans to response format with error handling
            List<Map<String, Object>> plansResponse = new ArrayList<>();
            for (SubscriptionPlan plan : plans) {
                try {
                    // Validate plan has required fields
                    if (plan == null || plan.getId() == null) {
                        logger.warn("Skipping invalid plan (null or missing ID)");
                        continue;
                    }
                    
                    // Ensure basePrice is initialized for existing records (backward compatibility)
                    // Don't save during read operation - just calculate for response
                    if (plan.getBasePrice() == null && plan.getPrice() != null) {
                        plan.setBasePrice(plan.getPrice());
                        logger.debug("Initialized basePrice for plan {}: {}", plan.getId(), plan.getBasePrice());
                    }
                    
                    // Recalculate final price if needed (in-memory only, don't persist)
                    if (plan.getFinalPrice() == null) {
                        try {
                            plan.calculateFinalPrice();
                        } catch (Exception calcException) {
                            logger.warn("Could not calculate final price for plan {}: {}", plan.getId(), calcException.getMessage());
                            // Set finalPrice to price as fallback
                            if (plan.getPrice() != null) {
                                plan.setFinalPrice(plan.getPrice());
                            }
                        }
                    }
                    
                    // Convert to response format
                    Map<String, Object> planResponse = planToResponse(plan);
                    plansResponse.add(planResponse);
                } catch (Exception planException) {
                    logger.error("Error converting plan {} to response: {}", 
                        plan != null && plan.getId() != null ? plan.getId() : "unknown", 
                        planException.getMessage(), 
                        planException);
                    // Continue with other plans instead of failing completely
                }
            }

            logger.info("Returning {} plans to admin (out of {} total plans)", plansResponse.size(), plans.size());
            
            // Always return valid JSON structure
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("plans", plansResponse);
            response.put("count", plansResponse.size());
            response.put("timestamp", LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("=== CRITICAL ERROR in getAllPlans ===");
            logger.error("Exception type: {}", e.getClass().getName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Full stack trace:", e);
            if (e.getCause() != null) {
                logger.error("Root cause: {}", e.getCause().getMessage());
                logger.error("Root cause type: {}", e.getCause().getClass().getName());
            }
            
            // Return 200 OK with error info instead of 500 to prevent "No static resource" errors
            Map<String, Object> errorResponse = new LinkedHashMap<>();
            errorResponse.put("plans", new ArrayList<>()); // Always return plans array
            errorResponse.put("count", 0);
            errorResponse.put("error", true);
            errorResponse.put("status", 500);
            errorResponse.put("message", "Unable to load pricing plans. Please check backend logs.");
            errorResponse.put("details", e.getMessage() != null ? e.getMessage() : "Internal server error");
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            
            logger.warn("Returning error response with empty plans array (200 OK)");
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Update plan pricing
     * PUT /api/admin/pricing/plans/{id}
     */
    @PutMapping("/plans/{id}")
    public ResponseEntity<Map<String, Object>> updatePlanPricing(
            @PathVariable("id") java.util.UUID id,
            @RequestBody Map<String, Object> request
    ) {
        try {
            Optional<SubscriptionPlan> planOpt = planRepository.findById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Subscription plan not found"));
            }

            SubscriptionPlan plan = planOpt.get();

            // Update base price
            if (request.containsKey("basePrice")) {
                Object basePriceObj = request.get("basePrice");
                BigDecimal basePrice;
                if (basePriceObj instanceof Number) {
                    basePrice = BigDecimal.valueOf(((Number) basePriceObj).doubleValue());
                } else if (basePriceObj instanceof String) {
                    basePrice = new BigDecimal((String) basePriceObj);
                } else {
                    return ResponseEntity.status(400).body(Map.of("error", "Invalid basePrice format"));
                }
                
                if (basePrice.compareTo(BigDecimal.ZERO) < 0) {
                    return ResponseEntity.status(400).body(Map.of("error", "Base price cannot be negative"));
                }
                
                plan.setBasePrice(basePrice);
            }

            // Update discount type
            if (request.containsKey("discountType")) {
                String discountType = (String) request.get("discountType");
                if (discountType != null && !discountType.isEmpty()) {
                    if (!"PERCENTAGE".equalsIgnoreCase(discountType) && !"FIXED".equalsIgnoreCase(discountType)) {
                        return ResponseEntity.status(400).body(Map.of("error", "Discount type must be PERCENTAGE or FIXED"));
                    }
                    plan.setDiscountType(discountType.toUpperCase());
                } else {
                    // Remove discount
                    plan.setDiscountType(null);
                    plan.setDiscountValue(null);
                }
            }

            // Update discount value
            if (request.containsKey("discountValue")) {
                Object discountValueObj = request.get("discountValue");
                if (discountValueObj == null) {
                    plan.setDiscountValue(null);
                    plan.setDiscountType(null);
                } else {
                    BigDecimal discountValue;
                    if (discountValueObj instanceof Number) {
                        discountValue = BigDecimal.valueOf(((Number) discountValueObj).doubleValue());
                    } else if (discountValueObj instanceof String) {
                        discountValue = new BigDecimal((String) discountValueObj);
                    } else {
                        return ResponseEntity.status(400).body(Map.of("error", "Invalid discountValue format"));
                    }
                    
                    if (discountValue.compareTo(BigDecimal.ZERO) < 0) {
                        return ResponseEntity.status(400).body(Map.of("error", "Discount value cannot be negative"));
                    }
                    
                    // Validate percentage discount (0-100)
                    if (plan.getDiscountType() != null && "PERCENTAGE".equalsIgnoreCase(plan.getDiscountType())) {
                        if (discountValue.compareTo(new BigDecimal("100")) > 0) {
                            return ResponseEntity.status(400).body(Map.of("error", "Percentage discount cannot exceed 100%"));
                        }
                    }
                    
                    plan.setDiscountValue(discountValue);
                }
            }

            // Update plan status
            if (request.containsKey("isActive")) {
                Boolean isActive = (Boolean) request.get("isActive");
                plan.setIsActive(isActive != null ? isActive : true);
            }

            // Update plan features (optional)
            if (request.containsKey("features")) {
                String features = (String) request.get("features");
                plan.setFeatures(features);
            }

            // Update job posts allowed (optional)
            if (request.containsKey("jobPostsAllowed")) {
                Object jobPostsObj = request.get("jobPostsAllowed");
                if (jobPostsObj instanceof Number) {
                    plan.setJobPostsAllowed(((Number) jobPostsObj).intValue());
                }
            }

            // Update duration/validity period (optional)
            if (request.containsKey("duration")) {
                String duration = (String) request.get("duration");
                if (duration != null && !duration.trim().isEmpty()) {
                    plan.setDuration(duration.trim());
                }
            }

            // Save plan (this will trigger final price calculation)
            plan = planRepository.save(plan);

            // Get admin user for audit log
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = authentication != null ? authentication.getName() : "system";
            logger.info("Plan pricing updated by admin {}: Plan ID={}, Base Price={}, Discount Type={}, Discount Value={}, Final Price={}",
                    adminEmail, plan.getId(), plan.getBasePrice(), plan.getDiscountType(), plan.getDiscountValue(), plan.getFinalPrice());

            return ResponseEntity.ok(Map.of(
                    "message", "Plan pricing updated successfully",
                    "plan", planToResponse(plan)
            ));
        } catch (NumberFormatException e) {
            logger.error("Invalid number format in pricing update", e);
            return ResponseEntity.status(400).body(Map.of("error", "Invalid number format"));
        } catch (Exception e) {
            logger.error("Error updating plan pricing", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update plan pricing: " + e.getMessage()));
        }
    }

    /**
     * Remove discount from a plan
     * DELETE /api/admin/pricing/plans/{id}/discount
     */
    @DeleteMapping("/plans/{id}/discount")
    public ResponseEntity<Map<String, Object>> removeDiscount(@PathVariable("id") java.util.UUID id) {
        try {
            Optional<SubscriptionPlan> planOpt = planRepository.findById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Subscription plan not found"));
            }

            SubscriptionPlan plan = planOpt.get();
            plan.setDiscountType(null);
            plan.setDiscountValue(null);
            plan = planRepository.save(plan);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = authentication != null ? authentication.getName() : "system";
            logger.info("Discount removed by admin {}: Plan ID={}", adminEmail, plan.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Discount removed successfully",
                    "plan", planToResponse(plan)
            ));
        } catch (Exception e) {
            logger.error("Error removing discount", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to remove discount"));
        }
    }

    /**
     * Toggle plan availability
     * PUT /api/admin/pricing/plans/{id}/toggle-status
     */
    @PutMapping("/plans/{id}/toggle-status")
    public ResponseEntity<Map<String, Object>> togglePlanStatus(@PathVariable("id") java.util.UUID id) {
        try {
            Optional<SubscriptionPlan> planOpt = planRepository.findById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Subscription plan not found"));
            }

            SubscriptionPlan plan = planOpt.get();
            plan.setIsActive(!plan.getIsActive());
            plan = planRepository.save(plan);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = authentication != null ? authentication.getName() : "system";
            logger.info("Plan status toggled by admin {}: Plan ID={}, Status={}", adminEmail, plan.getId(), plan.getIsActive());

            return ResponseEntity.ok(Map.of(
                    "message", "Plan status updated successfully",
                    "plan", planToResponse(plan)
            ));
        } catch (Exception e) {
            logger.error("Error toggling plan status", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to toggle plan status"));
        }
    }

    /**
     * Convert plan to response map with null safety
     */
    private Map<String, Object> planToResponse(SubscriptionPlan plan) {
        Map<String, Object> response = new LinkedHashMap<>();
        
        try {
            // Validate plan
            if (plan == null) {
                logger.error("Attempted to convert null plan to response");
                return Map.of("error", "Invalid plan data");
            }
            
            // ID and name (required fields)
            response.put("id", plan.getId() != null ? plan.getId().toString() : "unknown");
            response.put("name", plan.getName() != null ? plan.getName() : "Unnamed Plan");
            
            // Handle basePrice - use price as fallback
            BigDecimal basePrice = plan.getBasePrice();
            if (basePrice == null) {
                basePrice = plan.getPrice();
            }
            response.put("basePrice", basePrice != null ? basePrice.doubleValue() : 0.0);
            
            // Handle price (required field)
            BigDecimal price = plan.getPrice();
            if (price == null) {
                logger.warn("Plan {} has null price, using 0.0", plan.getId());
                price = BigDecimal.ZERO;
            }
            response.put("price", price.doubleValue());
            
            // Handle finalPrice - calculate if null (in-memory only)
            BigDecimal finalPrice = plan.getFinalPrice();
            if (finalPrice == null) {
                try {
                    // Create a temporary calculation without modifying the entity
                    if (basePrice == null) {
                        basePrice = price;
                    }
                    BigDecimal calculatedFinalPrice = calculateFinalPriceInMemory(
                        basePrice, 
                        plan.getDiscountType(), 
                        plan.getDiscountValue()
                    );
                    finalPrice = calculatedFinalPrice;
                } catch (Exception calcException) {
                    logger.warn("Could not calculate final price for plan {}: {}", plan.getId(), calcException.getMessage());
                    finalPrice = price; // Fallback to price
                }
            }
            response.put("finalPrice", finalPrice != null ? finalPrice.doubleValue() : price.doubleValue());
            
            // Discount fields
            response.put("discountType", plan.getDiscountType());
            response.put("discountValue", plan.getDiscountValue() != null ? plan.getDiscountValue().doubleValue() : null);
            
            // Other fields
            response.put("duration", plan.getDuration() != null ? plan.getDuration() : "N/A");
            response.put("jobPostsAllowed", plan.getJobPostsAllowed() != null ? plan.getJobPostsAllowed() : 0);
            response.put("isActive", plan.getIsActive() != null ? plan.getIsActive() : true);
            response.put("displayOrder", plan.getDisplayOrder() != null ? plan.getDisplayOrder() : 0);
            
            // Handle features
            if (plan.getFeatures() != null && !plan.getFeatures().trim().isEmpty()) {
                try {
                    String[] featureArray = plan.getFeatures().split(",");
                    List<String> featureList = new ArrayList<>();
                    for (String feature : featureArray) {
                        String trimmed = feature.trim();
                        if (!trimmed.isEmpty()) {
                            featureList.add(trimmed);
                        }
                    }
                    response.put("features", featureList);
                } catch (Exception e) {
                    logger.warn("Error parsing features for plan {}: {}", plan.getId(), e.getMessage());
                    response.put("features", new ArrayList<>());
                }
            } else {
                response.put("features", new ArrayList<>());
            }
            
            // Add timestamps
            response.put("createdAt", plan.getCreatedAt() != null ? plan.getCreatedAt().toString() : null);
            response.put("updatedAt", plan.getUpdatedAt() != null ? plan.getUpdatedAt().toString() : null);
            
            // Add status field (for frontend compatibility)
            response.put("status", plan.getIsActive() != null && plan.getIsActive() ? "active" : "inactive");
        } catch (Exception e) {
            logger.error("Error converting plan to response: {}", e.getMessage(), e);
            // Return minimal response to prevent complete failure
            response.put("id", plan != null && plan.getId() != null ? plan.getId().toString() : "unknown");
            response.put("name", plan != null && plan.getName() != null ? plan.getName() : "Error loading plan");
            response.put("error", "Error loading plan details");
            response.put("basePrice", 0.0);
            response.put("price", 0.0);
            response.put("finalPrice", 0.0);
            response.put("features", new ArrayList<>());
        }
        
        return response;
    }
    
    /**
     * Calculate final price in memory without modifying the entity
     */
    private BigDecimal calculateFinalPriceInMemory(BigDecimal basePrice, String discountType, BigDecimal discountValue) {
        if (basePrice == null) {
            return BigDecimal.ZERO;
        }
        
        if (discountType == null || discountValue == null || discountValue.compareTo(BigDecimal.ZERO) == 0) {
            return basePrice;
        }
        
        BigDecimal discount = BigDecimal.ZERO;
        if ("PERCENTAGE".equalsIgnoreCase(discountType)) {
            discount = basePrice.multiply(discountValue).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
        } else if ("FIXED".equalsIgnoreCase(discountType)) {
            discount = discountValue;
        }
        
        BigDecimal finalPrice = basePrice.subtract(discount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        return finalPrice;
    }
}

