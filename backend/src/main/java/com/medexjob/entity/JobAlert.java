// AI assisted development
package com.medexjob.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_alerts")
@EntityListeners(AuditingEntityListener.class)
public class JobAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @NotBlank
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "keywords", columnDefinition = "TEXT")
    private String keywords; // Comma-separated keywords

    @Column(name = "locations", columnDefinition = "TEXT")
    private String locations; // Comma-separated locations

    @Column(name = "categories", columnDefinition = "TEXT")
    private String categories; // Comma-separated categories

    @Column(name = "sectors", columnDefinition = "TEXT")
    private String sectors; // Comma-separated sectors (government, private)

    @Column(name = "salary_min")
    private Integer salaryMin;

    @Column(name = "salary_max")
    private Integer salaryMax;

    @Column(name = "experience", length = 100)
    private String experience;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false)
    private AlertFrequency frequency = AlertFrequency.DAILY;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "last_sent")
    private LocalDateTime lastSent;

    @Column(name = "match_count", nullable = false)
    private Integer matchCount = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AlertFrequency {
        INSTANT, DAILY, WEEKLY
    }

    // Constructors
    public JobAlert() {
    }

    public JobAlert(UUID userId, String name) {
        this.userId = userId;
        this.name = name;
        this.active = true;
        this.matchCount = 0;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public String getLocations() {
        return locations;
    }

    public void setLocations(String locations) {
        this.locations = locations;
    }

    public String getCategories() {
        return categories;
    }

    public void setCategories(String categories) {
        this.categories = categories;
    }

    public String getSectors() {
        return sectors;
    }

    public void setSectors(String sectors) {
        this.sectors = sectors;
    }

    public Integer getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(Integer salaryMin) {
        this.salaryMin = salaryMin;
    }

    public Integer getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(Integer salaryMax) {
        this.salaryMax = salaryMax;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public AlertFrequency getFrequency() {
        return frequency;
    }

    public void setFrequency(AlertFrequency frequency) {
        this.frequency = frequency;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getLastSent() {
        return lastSent;
    }

    public void setLastSent(LocalDateTime lastSent) {
        this.lastSent = lastSent;
    }

    public Integer getMatchCount() {
        return matchCount;
    }

    public void setMatchCount(Integer matchCount) {
        this.matchCount = matchCount;
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

