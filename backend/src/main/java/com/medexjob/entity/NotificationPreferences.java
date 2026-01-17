// AI assisted development
package com.medexjob.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@EntityListeners(AuditingEntityListener.class)
public class NotificationPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "email_enabled", nullable = false)
    private Boolean emailEnabled = true;

    @Column(name = "sms_enabled", nullable = false)
    private Boolean smsEnabled = false;

    @Column(name = "push_enabled", nullable = false)
    private Boolean pushEnabled = true;

    @Column(name = "job_alert_enabled", nullable = false)
    private Boolean jobAlertEnabled = true;

    @Column(name = "application_update_enabled", nullable = false)
    private Boolean applicationUpdateEnabled = true;

    @Column(name = "interview_scheduled_enabled", nullable = false)
    private Boolean interviewScheduledEnabled = true;

    @Column(name = "subscription_enabled", nullable = false)
    private Boolean subscriptionEnabled = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public NotificationPreferences() {
    }

    public NotificationPreferences(UUID userId) {
        this.userId = userId;
        this.emailEnabled = true;
        this.smsEnabled = false;
        this.pushEnabled = true;
        this.jobAlertEnabled = true;
        this.applicationUpdateEnabled = true;
        this.interviewScheduledEnabled = true;
        this.subscriptionEnabled = true;
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

    public Boolean getEmailEnabled() {
        return emailEnabled;
    }

    public void setEmailEnabled(Boolean emailEnabled) {
        this.emailEnabled = emailEnabled;
    }

    public Boolean getSmsEnabled() {
        return smsEnabled;
    }

    public void setSmsEnabled(Boolean smsEnabled) {
        this.smsEnabled = smsEnabled;
    }

    public Boolean getPushEnabled() {
        return pushEnabled;
    }

    public void setPushEnabled(Boolean pushEnabled) {
        this.pushEnabled = pushEnabled;
    }

    public Boolean getJobAlertEnabled() {
        return jobAlertEnabled;
    }

    public void setJobAlertEnabled(Boolean jobAlertEnabled) {
        this.jobAlertEnabled = jobAlertEnabled;
    }

    public Boolean getApplicationUpdateEnabled() {
        return applicationUpdateEnabled;
    }

    public void setApplicationUpdateEnabled(Boolean applicationUpdateEnabled) {
        this.applicationUpdateEnabled = applicationUpdateEnabled;
    }

    public Boolean getInterviewScheduledEnabled() {
        return interviewScheduledEnabled;
    }

    public void setInterviewScheduledEnabled(Boolean interviewScheduledEnabled) {
        this.interviewScheduledEnabled = interviewScheduledEnabled;
    }

    public Boolean getSubscriptionEnabled() {
        return subscriptionEnabled;
    }

    public void setSubscriptionEnabled(Boolean subscriptionEnabled) {
        this.subscriptionEnabled = subscriptionEnabled;
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

