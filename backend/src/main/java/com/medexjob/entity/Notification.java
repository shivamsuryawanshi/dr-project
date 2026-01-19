// AI assisted development
package com.medexjob.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @NotNull
    @Column(name = "to_user_id", nullable = false)
    private UUID toUserId;

    @NotBlank
    @Column(name = "type", nullable = false, length = 50)
    private String type; // job_alert, application_update, interview_scheduled, subscription

    @NotBlank
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @NotBlank
    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "related_job_id")
    private UUID relatedJobId;

    @Column(name = "related_application_id")
    private UUID relatedApplicationId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Notification() {
    }

    public Notification(UUID userId, String type, String message) {
        this.userId = userId;
        this.toUserId = userId; // Set to_user_id to same as user_id (recipient)
        this.type = type;
        this.message = message;
        this.isRead = false;
        // Set default title based on type
        this.title = generateTitleFromType(type);
    }

    public Notification(UUID userId, String type, String title, String message) {
        this.userId = userId;
        this.toUserId = userId; // Set to_user_id to same as user_id (recipient)
        this.type = type;
        this.title = title;
        this.message = message;
        this.isRead = false;
    }

    // Helper method to generate title from type
    private String generateTitleFromType(String type) {
        if (type == null) {
            return "Notification";
        }
        switch (type.toLowerCase()) {
            case "employer_verification":
                return "Employer Verification Update";
            case "job_alert":
                return "Job Alert";
            case "application_update":
                return "Application Update";
            case "interview_scheduled":
                return "Interview Scheduled";
            case "subscription":
                return "Subscription Update";
            case "application_received":
                return "New Application Received";
            default:
                return "Notification";
        }
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

    public UUID getToUserId() {
        return toUserId;
    }

    public void setToUserId(UUID toUserId) {
        this.toUserId = toUserId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public UUID getRelatedJobId() {
        return relatedJobId;
    }

    public void setRelatedJobId(UUID relatedJobId) {
        this.relatedJobId = relatedJobId;
    }

    public UUID getRelatedApplicationId() {
        return relatedApplicationId;
    }

    public void setRelatedApplicationId(UUID relatedApplicationId) {
        this.relatedApplicationId = relatedApplicationId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
