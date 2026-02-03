package com.medexjob.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "news_updates")
@EntityListeners(AuditingEntityListener.class)
public class NewsUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Size(max = 200)
    @Column(name = "title", nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private NewsType type;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "is_breaking", nullable = false)
    private boolean breaking = false;

    @Column(name = "full_story", columnDefinition = "TEXT")
    private String fullStory;

    @Column(name = "show_on_homepage", nullable = false, columnDefinition = "BOOLEAN DEFAULT 0")
    private Boolean showOnHomepage = false;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public NewsUpdate() {
        this.showOnHomepage = false; // Ensure default value
    }

    public NewsUpdate(String title, NewsType type, LocalDate date, boolean breaking) {
        this.title = title;
        this.type = type;
        this.date = date;
        this.breaking = breaking;
        this.showOnHomepage = false; // Ensure default value
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public NewsType getType() {
        return type;
    }

    public void setType(NewsType type) {
        this.type = type;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public boolean isBreaking() {
        return breaking;
    }

    public void setBreaking(boolean breaking) {
        this.breaking = breaking;
    }

    public String getFullStory() {
        return fullStory;
    }

    public void setFullStory(String fullStory) {
        this.fullStory = fullStory;
    }

    public Boolean isShowOnHomepage() {
        return showOnHomepage;
    }

    public void setShowOnHomepage(Boolean showOnHomepage) {
        this.showOnHomepage = showOnHomepage != null ? showOnHomepage : false;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public enum NewsType {
        GOVT,
        PRIVATE,
        EXAM,
        DEADLINE,
        UPDATE
    }
}
