// AI assisted development
package com.medexjob.controller;

import com.medexjob.entity.Notification;
import com.medexjob.entity.NotificationPreferences;
import com.medexjob.entity.User;
import com.medexjob.repository.NotificationRepository;
import com.medexjob.repository.NotificationPreferencesRepository;
import com.medexjob.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationRepository notificationRepository;
    private final NotificationPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationRepository notificationRepository,
            NotificationPreferencesRepository preferencesRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.preferencesRepository = preferencesRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get user's notifications
     * GET /api/notifications
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean unreadOnly
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            UUID userId = userOpt.get().getId();
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

            Page<Notification> notifications;
            if (unreadOnly != null && unreadOnly) {
                notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable);
            } else if (type != null && !type.isEmpty()) {
                notifications = notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);
            } else {
                notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("content", notifications.getContent().stream()
                    .map(this::toResponse)
                    .collect(java.util.stream.Collectors.toList()));
            response.put("page", notifications.getNumber());
            response.put("size", notifications.getSize());
            response.put("totalElements", notifications.getTotalElements());
            response.put("totalPages", notifications.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching notifications", e);
            // Return empty list instead of 500 error to prevent frontend issues
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("content", new java.util.ArrayList<>());
            errorResponse.put("page", 0);
            errorResponse.put("size", 20);
            errorResponse.put("totalElements", 0);
            errorResponse.put("totalPages", 0);
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Get unread count
     * GET /api/notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthorized access attempt to unread-count endpoint");
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            logger.debug("Fetching unread count for user: {}", email);
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                logger.warn("User not found for email: {}", email);
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            UUID userId = userOpt.get().getId();
            logger.debug("Fetching unread count for user ID: {}", userId);
            
            try {
                long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);
                logger.info("Unread count for user {}: {}", userId, unreadCount);
                return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
            } catch (Exception dbException) {
                logger.error("Database error while fetching unread count for user {}: {}", userId, dbException.getMessage(), dbException);
                // Return 0 if table doesn't exist or query fails
                logger.warn("Returning 0 as fallback for unread count");
                return ResponseEntity.ok(Map.of("unreadCount", 0));
            }
        } catch (Exception e) {
            logger.error("Error fetching unread count", e);
            // Return 0 instead of 500 error to prevent frontend issues
            return ResponseEntity.ok(Map.of("unreadCount", 0, "error", "Unable to fetch count, defaulting to 0"));
        }
    }

    /**
     * Mark notification as read
     * PUT /api/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable("id") UUID id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            UUID userId = userOpt.get().getId();
            Optional<Notification> notificationOpt = notificationRepository.findById(id);

            if (notificationOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Notification not found"));
            }

            Notification notification = notificationOpt.get();
            if (!notification.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            notification.setIsRead(true);
            notificationRepository.save(notification);

            return ResponseEntity.ok(toResponse(notification));
        } catch (Exception e) {
            logger.error("Error marking notification as read", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to mark notification as read"));
        }
    }

    /**
     * Mark all notifications as read
     * PUT /api/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            UUID userId = userOpt.get().getId();
            notificationRepository.markAllAsRead(userId);

            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            logger.error("Error marking all notifications as read", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to mark all notifications as read"));
        }
    }

    /**
     * Delete notification
     * DELETE /api/notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNotification(@PathVariable("id") UUID id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            UUID userId = userOpt.get().getId();
            Optional<Notification> notificationOpt = notificationRepository.findById(id);

            if (notificationOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Notification not found"));
            }

            Notification notification = notificationOpt.get();
            if (!notification.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            notificationRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting notification", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete notification"));
        }
    }

    /**
     * Get notification preferences
     * GET /api/notifications/preferences
     */
    @GetMapping("/preferences")
    public ResponseEntity<Map<String, Object>> getPreferences() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            UUID userId = userOpt.get().getId();
            Optional<NotificationPreferences> preferencesOpt = preferencesRepository.findByUserId(userId);

            NotificationPreferences preferences;
            if (preferencesOpt.isEmpty()) {
                // Create default preferences if not exists
                preferences = new NotificationPreferences(userId);
                preferences = preferencesRepository.save(preferences);
            } else {
                preferences = preferencesOpt.get();
            }

            return ResponseEntity.ok(toPreferencesResponse(preferences));
        } catch (Exception e) {
            logger.error("Error fetching preferences", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch preferences"));
        }
    }

    /**
     * Update notification preferences
     * PUT /api/notifications/preferences
     */
    @PutMapping("/preferences")
    public ResponseEntity<Map<String, Object>> updatePreferences(@RequestBody Map<String, Object> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            UUID userId = userOpt.get().getId();
            Optional<NotificationPreferences> preferencesOpt = preferencesRepository.findByUserId(userId);

            NotificationPreferences preferences;
            if (preferencesOpt.isEmpty()) {
                preferences = new NotificationPreferences(userId);
            } else {
                preferences = preferencesOpt.get();
            }

            // Update preferences from request
            if (request.containsKey("emailEnabled")) {
                preferences.setEmailEnabled((Boolean) request.get("emailEnabled"));
            }
            if (request.containsKey("smsEnabled")) {
                preferences.setSmsEnabled((Boolean) request.get("smsEnabled"));
            }
            if (request.containsKey("pushEnabled")) {
                preferences.setPushEnabled((Boolean) request.get("pushEnabled"));
            }
            if (request.containsKey("jobAlertEnabled")) {
                preferences.setJobAlertEnabled((Boolean) request.get("jobAlertEnabled"));
            }
            if (request.containsKey("applicationUpdateEnabled")) {
                preferences.setApplicationUpdateEnabled((Boolean) request.get("applicationUpdateEnabled"));
            }
            if (request.containsKey("interviewScheduledEnabled")) {
                preferences.setInterviewScheduledEnabled((Boolean) request.get("interviewScheduledEnabled"));
            }
            if (request.containsKey("subscriptionEnabled")) {
                preferences.setSubscriptionEnabled((Boolean) request.get("subscriptionEnabled"));
            }

            preferences = preferencesRepository.save(preferences);
            return ResponseEntity.ok(toPreferencesResponse(preferences));
        } catch (Exception e) {
            logger.error("Error updating preferences", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update preferences"));
        }
    }

    /**
     * Create test notification for current user (for testing)
     * POST /api/notifications/test
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> createTestNotification() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            UUID userId = userOpt.get().getId();
            String message = "🧪 Test notification - System is working correctly!";
            String notificationType = "application_update";

            Notification notification = new Notification(userId, notificationType, message);
            notification = notificationRepository.save(notification);

            logger.info("✅ Test notification created for user: {}", userId);
            return ResponseEntity.ok(toResponse(notification));
        } catch (Exception e) {
            logger.error("Error creating test notification", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create test notification"));
        }
    }

    /**
     * Send notification (admin/system only)
     * POST /api/notifications/send
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendNotification(@RequestBody Map<String, Object> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty() || userOpt.get().getRole() != User.UserRole.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
            }

            UUID userId = UUID.fromString((String) request.get("userId"));
            String notificationType = (String) request.get("type");
            String message = (String) request.get("message");
            String title = request.containsKey("title") ? (String) request.get("title") : null;
            UUID relatedJobId = request.containsKey("relatedJobId") 
                ? UUID.fromString((String) request.get("relatedJobId")) : null;
            UUID relatedApplicationId = request.containsKey("relatedApplicationId")
                ? UUID.fromString((String) request.get("relatedApplicationId")) : null;

            Notification notification;
            if (title != null && !title.trim().isEmpty()) {
                notification = new Notification(userId, notificationType, title, message);
            } else {
                notification = new Notification(userId, notificationType, message);
            }
            if (relatedJobId != null) {
                notification.setRelatedJobId(relatedJobId);
            }
            if (relatedApplicationId != null) {
                notification.setRelatedApplicationId(relatedApplicationId);
            }

            notification = notificationRepository.save(notification);
            return ResponseEntity.ok(toResponse(notification));
        } catch (Exception e) {
            logger.error("Error sending notification", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send notification"));
        }
    }

    // Helper methods
    private Map<String, Object> toResponse(Notification notification) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", notification.getId().toString());
        response.put("userId", notification.getUserId().toString());
        response.put("type", notification.getType());
        response.put("title", notification.getTitle());
        response.put("message", notification.getMessage());
        response.put("read", notification.getIsRead());
        if (notification.getRelatedJobId() != null) {
            response.put("relatedJobId", notification.getRelatedJobId().toString());
        }
        if (notification.getRelatedApplicationId() != null) {
            response.put("relatedApplicationId", notification.getRelatedApplicationId().toString());
        }
        response.put("createdAt", notification.getCreatedAt().toString());
        return response;
    }

    private Map<String, Object> toPreferencesResponse(NotificationPreferences preferences) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", preferences.getId().toString());
        response.put("userId", preferences.getUserId().toString());
        response.put("emailEnabled", preferences.getEmailEnabled());
        response.put("smsEnabled", preferences.getSmsEnabled());
        response.put("pushEnabled", preferences.getPushEnabled());
        response.put("jobAlertEnabled", preferences.getJobAlertEnabled());
        response.put("applicationUpdateEnabled", preferences.getApplicationUpdateEnabled());
        response.put("interviewScheduledEnabled", preferences.getInterviewScheduledEnabled());
        response.put("subscriptionEnabled", preferences.getSubscriptionEnabled());
        response.put("createdAt", preferences.getCreatedAt().toString());
        if (preferences.getUpdatedAt() != null) {
            response.put("updatedAt", preferences.getUpdatedAt().toString());
        }
        return response;
    }
}

