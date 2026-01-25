// AI assisted development
package com.medexjob.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscription_plans")
@EntityListeners(AuditingEntityListener.class)
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NotNull
    @Positive
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice; // Original price before discount

    @Column(name = "discount_type", length = 20)
    private String discountType; // "PERCENTAGE" or "FIXED" or null

    @Column(name = "discount_value", precision = 10, scale = 2)
    private BigDecimal discountValue; // Discount amount (percentage or fixed)

    @Column(name = "final_price", precision = 10, scale = 2)
    private BigDecimal finalPrice; // Computed price after discount

    @NotBlank
    @Column(name = "duration", nullable = false, length = 50)
    private String duration; // "per post", "monthly", "yearly"

    @NotNull
    @Column(name = "job_posts_allowed", nullable = false)
    private Integer jobPostsAllowed;

    @Column(name = "features", columnDefinition = "TEXT")
    private String features; // Comma-separated or JSON string

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public SubscriptionPlan() {
    }

    public SubscriptionPlan(String name, BigDecimal price, String duration, Integer jobPostsAllowed) {
        this.name = name;
        this.price = price;
        this.basePrice = price; // Initialize base price same as price
        this.finalPrice = price; // Initialize final price same as price
        this.duration = duration;
        this.jobPostsAllowed = jobPostsAllowed;
        this.isActive = true;
    }

    /**
     * PostLoad callback to ensure basePrice is initialized for existing records
     */
    @PostLoad
    private void initializeBasePrice() {
        if (basePrice == null && price != null) {
            basePrice = price;
        }
        if (finalPrice == null) {
            calculateFinalPrice();
        }
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
        // If basePrice is not set, set it to price
        if (this.basePrice == null) {
            this.basePrice = price;
        }
        // Recalculate final price if discount exists
        calculateFinalPrice();
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
        calculateFinalPrice();
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
        calculateFinalPrice();
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
        calculateFinalPrice();
    }

    public BigDecimal getFinalPrice() {
        return finalPrice != null ? finalPrice : price;
    }

    public void setFinalPrice(BigDecimal finalPrice) {
        this.finalPrice = finalPrice;
    }

    /**
     * Calculate final price based on base price and discount
     */
    public void calculateFinalPrice() {
        if (basePrice == null) {
            basePrice = price;
        }
        
        if (discountType == null || discountValue == null || discountValue.compareTo(BigDecimal.ZERO) == 0) {
            // No discount
            this.finalPrice = basePrice;
            this.price = basePrice;
        } else {
            BigDecimal discount = BigDecimal.ZERO;
            if ("PERCENTAGE".equalsIgnoreCase(discountType)) {
                // Percentage discount
                discount = basePrice.multiply(discountValue).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
            } else if ("FIXED".equalsIgnoreCase(discountType)) {
                // Fixed amount discount
                discount = discountValue;
            }
            
            // Calculate final price (base price - discount)
            this.finalPrice = basePrice.subtract(discount);
            // Ensure final price is not negative
            if (this.finalPrice.compareTo(BigDecimal.ZERO) < 0) {
                this.finalPrice = BigDecimal.ZERO;
            }
            // Update price to final price
            this.price = this.finalPrice;
        }
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public Integer getJobPostsAllowed() {
        return jobPostsAllowed;
    }

    public void setJobPostsAllowed(Integer jobPostsAllowed) {
        this.jobPostsAllowed = jobPostsAllowed;
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

