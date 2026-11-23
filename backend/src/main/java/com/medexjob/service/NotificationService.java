// AI assisted development
package com.medexjob.service;

import com.medexjob.entity.Notification;
import com.medexjob.entity.NotificationPreferences;
import com.medexjob.entity.CandidateProfile;
import com.medexjob.entity.Job;
import com.medexjob.entity.JobAlert;
import com.medexjob.repository.CandidateProfileRepository;
import com.medexjob.repository.JobAlertRepository;
import com.medexjob.repository.NotificationRepository;
import com.medexjob.repository.NotificationPreferencesRepository;
import com.medexjob.repository.UserRepository;
import com.medexjob.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationPreferencesRepository preferencesRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired(required = false)
    private JobAlertRepository jobAlertRepository;

    /**
     * Check if user has enabled this type of notification
     */
    private boolean shouldNotify(UUID userId, String notificationType) {
        Optional<NotificationPreferences> prefsOpt = preferencesRepository.findByUserId(userId);

        if (prefsOpt.isEmpty()) {
            // Default: allow all notifications if preferences not set
            return true;
        }

        NotificationPreferences prefs = prefsOpt.get();

        switch (notificationType) {
            case "application_update":
                return prefs.getApplicationUpdateEnabled();
            case "interview_scheduled":
                return prefs.getInterviewScheduledEnabled();
            case "job_alert":
                return prefs.getJobAlertEnabled();
            case "subscription":
                return prefs.getSubscriptionEnabled();
            case "application_received":
                // Employer notifications - always enabled by default
                return true;
            default:
                return true;
        }
    }

    /**
     * Notify candidate about application status update
     */
    public void notifyCandidateApplicationStatus(UUID candidateId, String jobTitle,
            String status, UUID jobId, UUID applicationId) {
        if (candidateId == null) {
            logger.warn("⚠️ Cannot notify: candidateId is null");
            return;
        }

        if (!shouldNotify(candidateId, "application_update")) {
            logger.debug("Notification disabled for candidate: {}", candidateId);
            return;
        }

        try {
            String message = "";
            String notificationType = "application_update";

            switch (status.toUpperCase()) {
                case "SHORTLISTED":
                    message = String.format(
                            "Your application for '%s' was updated to shortlisted.",
                            jobTitle);
                    break;
                case "SELECTED":
                case "HIRED":
                    message = String.format(
                            "Your application for '%s' was updated to hired.",
                            jobTitle);
                    break;
                case "REJECTED":
                    message = String.format(
                            "Your application for '%s' was updated to rejected.",
                            jobTitle);
                    break;
                case "INTERVIEW":
                    message = String.format(
                            "Your application for '%s' was updated to interview.",
                            jobTitle);
                    break;
                case "APPLIED":
                case "PENDING":
                    message = String.format(
                            "Your application for '%s' was updated to pending.",
                            jobTitle);
                    break;
                default:
                    message = String.format(
                            "Your application for '%s' was updated to %s.",
                            jobTitle,
                            status.toLowerCase());
            }

            String title = "Application Status Update";
            Notification notification = new Notification(candidateId, notificationType, title, message);
            if (jobId != null)
                notification.setRelatedJobId(jobId);
            if (applicationId != null)
                notification.setRelatedApplicationId(applicationId);

            notificationRepository.save(notification);
            logger.info("🔔 Notification sent to candidate: {} for application status: {}", candidateId, status);
        } catch (Exception e) {
            logger.error("❌ Error creating notification for candidate: {}", e.getMessage(), e);
        }
    }

    /**
     * Notify candidate about interview scheduled (with meeting link and notes)
     */
    public void notifyCandidateInterviewScheduled(UUID candidateId, String jobTitle,
            String interviewDate, String meetingLink, String notes, UUID jobId, UUID applicationId) {
        if (candidateId == null) {
            logger.warn("⚠️ Cannot notify: candidateId is null");
            return;
        }

        if (!shouldNotify(candidateId, "interview_scheduled")) {
            logger.debug("Interview notification disabled for candidate: {}", candidateId);
            return;
        }

        try {
            StringBuilder message = new StringBuilder();
            message.append(String.format("📅 Interview scheduled for '%s' on %s.", jobTitle, interviewDate != null ? interviewDate : "TBD"));
            if (meetingLink != null && !meetingLink.isBlank()) {
                message.append(" Meeting link: ").append(meetingLink.trim()).append(".");
            }
            if (notes != null && !notes.isBlank()) {
                message.append(" Note: ").append(notes.trim());
            }

            // Truncate to 500 chars if exceeds DB column size
            String finalMsg = message.toString();
            if (finalMsg.length() > 500) {
                finalMsg = finalMsg.substring(0, 497) + "...";
            }

            String title = "Interview Scheduled";
            Notification notification = new Notification(candidateId, "interview_scheduled", title, finalMsg);
            if (jobId != null)
                notification.setRelatedJobId(jobId);
            if (applicationId != null)
                notification.setRelatedApplicationId(applicationId);

            notificationRepository.save(notification);
            logger.info("🔔 Interview notification sent to candidate: {} (job: {})", candidateId, jobTitle);
        } catch (Exception e) {
            logger.error("❌ Error creating interview notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Legacy overload for backwards compatibility
     */
    public void notifyCandidateInterviewScheduled(UUID candidateId, String jobTitle,
            String interviewDate, UUID jobId, UUID applicationId) {
        notifyCandidateInterviewScheduled(candidateId, jobTitle, interviewDate, null, null, jobId, applicationId);
    }

    /**
     * Notify employer about job approval/rejection
     */
    public void notifyEmployerJobStatus(UUID employerUserId, String jobTitle,
            String status, UUID jobId) {
        if (employerUserId == null) {
            logger.warn("⚠️ Cannot notify: employerUserId is null");
            return;
        }

        try {
            String message = "";
            String notificationType = "job_alert";

            switch (status.toUpperCase()) {
                case "ACTIVE":
                    message = String.format(
                            "✅ Your job '%s' has been approved and is now live!",
                            jobTitle);
                    break;
                case "REJECTED":
                case "CLOSED":
                    message = String.format(
                            "Your job '%s' status has been updated to %s",
                            jobTitle,
                            status);
                    break;
                case "PENDING":
                    message = String.format(
                            "Your job '%s' is pending admin approval",
                            jobTitle);
                    break;
                default:
                    message = String.format(
                            "Your job '%s' status has been updated",
                            jobTitle);
            }

            String title = "Job Status Update";
            Notification notification = new Notification(employerUserId, notificationType, title, message);
            if (jobId != null)
                notification.setRelatedJobId(jobId);

            notificationRepository.save(notification);
            logger.info("🔔 Job status notification sent to employer: {}", employerUserId);
        } catch (Exception e) {
            logger.error("❌ Error creating job status notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Notify employer about subscription
     */
    public void notifyEmployerSubscription(UUID employerUserId, String planName,
            String event, UUID subscriptionId) {
        if (employerUserId == null) {
            logger.warn("⚠️ Cannot notify: employerUserId is null");
            return;
        }

        if (!shouldNotify(employerUserId, "subscription")) {
            logger.debug("Subscription notification disabled for employer: {}", employerUserId);
            return;
        }

        try {
            String message = "";
            String notificationType = "subscription";

            switch (event.toLowerCase()) {
                case "activated":
                case "purchased":
                    message = String.format(
                            "✅ Your subscription plan '%s' has been activated!",
                            planName);
                    break;
                case "expiring":
                    message = String.format(
                            "⚠️ Your subscription plan '%s' is expiring soon. Please renew to continue posting jobs.",
                            planName);
                    break;
                case "expired":
                    message = String.format(
                            "❌ Your subscription plan '%s' has expired. Please renew to continue posting jobs.",
                            planName);
                    break;
                case "cancelled":
                    message = String.format(
                            "Your subscription plan '%s' has been cancelled.",
                            planName);
                    break;
                default:
                    message = String.format(
                            "Subscription update for plan '%s'",
                            planName);
            }

            String title = "Subscription Update";
            Notification notification = new Notification(employerUserId, notificationType, title, message);
            notificationRepository.save(notification);
            logger.info("🔔 Subscription notification sent to employer: {}", employerUserId);
        } catch (Exception e) {
            logger.error("❌ Error creating subscription notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Notify admin about pending approvals
     */
    public void notifyAdminPendingApproval(String type, String message, UUID relatedId) {
        try {
            List<User> admins = userRepository.findByRole(User.UserRole.ADMIN);

            String title = "Pending Approval";
            for (User admin : admins) {
                Notification notification = new Notification(admin.getId(), type, title, message);
                if (relatedId != null) {
                    if (type.contains("job")) {
                        notification.setRelatedJobId(relatedId);
                    } else if (type.contains("employer")) {
                        // For employer verification, we can use a custom field or just message
                    }
                }
                notificationRepository.save(notification);
            }

            logger.info("🔔 Admin notifications sent to {} admins", admins.size());
        } catch (Exception e) {
            logger.error("❌ Error creating admin notifications: {}", e.getMessage(), e);
        }
    }

    /**
     * Notify employer about new application (existing - kept for reference)
     */
    public void notifyEmployerApplicationReceived(UUID employerUserId, String jobTitle,
            String candidateName, String candidateEmail,
            UUID jobId, UUID applicationId) {
        if (employerUserId == null) {
            logger.warn("⚠️ Cannot notify: employerUserId is null");
            return;
        }

        try {
            String message = String.format(
                    "New application received for job: %s from %s (%s)",
                    jobTitle,
                    candidateName,
                    candidateEmail);

            String title = "New Application Received";
            Notification notification = new Notification(
                    employerUserId,
                    "application_received",
                    title,
                    message);
            notification.setRelatedJobId(jobId);
            notification.setRelatedApplicationId(applicationId);

            notificationRepository.save(notification);
            logger.info("🔔 Application notification sent to employer: {}", employerUserId);
        } catch (Exception e) {
            logger.error("❌ Error creating application notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Notify candidate about application submission confirmation
     */
    public void notifyCandidateApplicationSubmitted(UUID candidateId, String jobTitle,
            UUID jobId, UUID applicationId) {
        if (candidateId == null) {
            return;
        }

        if (!shouldNotify(candidateId, "application_update")) {
            return;
        }

        try {
            String message = String.format(
                    "✅ Your application for '%s' has been submitted successfully!",
                    jobTitle);

            String title = "Application Submitted";
            Notification notification = new Notification(
                    candidateId,
                    "application_update",
                    title,
                    message);
            notification.setRelatedJobId(jobId);
            notification.setRelatedApplicationId(applicationId);

            notificationRepository.save(notification);
            logger.info("🔔 Application submission confirmation sent to candidate: {}", candidateId);
        } catch (Exception e) {
            logger.error("❌ Error creating application submission notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Notify employer about verification status change
     */
    public void notifyEmployerVerification(UUID employerUserId, String companyName,
            String status, UUID employerId) {
        if (employerUserId == null) {
            logger.warn("⚠️ Cannot notify: employerUserId is null");
            return;
        }

        try {
            String message = "";
            String title = "";
            String notificationType = "employer_verification";

            switch (status.toUpperCase()) {
                case "APPROVED":
                    title = "Employer Account Approved";
                    message = String.format(
                            "✅ Your employer account for '%s' has been verified and approved!",
                            companyName);
                    break;
                case "REJECTED":
                    title = "Employer Account Rejected";
                    message = String.format(
                            "Your employer account for '%s' verification has been rejected. Please contact support.",
                            companyName);
                    break;
                case "PENDING":
                    title = "Employer Verification Pending";
                    message = String.format(
                            "Your employer account for '%s' verification is pending review.",
                            companyName);
                    break;
                default:
                    title = "Employer Verification Update";
                    message = String.format(
                            "Your employer account for '%s' verification status has been updated.",
                            companyName);
            }

            Notification notification = new Notification(employerUserId, notificationType, title, message);
            notificationRepository.save(notification);
            logger.info("🔔 Verification notification sent to employer: {}", employerUserId);
        } catch (Exception e) {
            logger.error("❌ Error creating verification notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Generic method to create a notification
     * Used for employer status changes (discontinue/continue)
     */
    public void createNotification(UUID userId, String title, String message, String type, String relatedId) {
        if (userId == null) {
            logger.warn("⚠️ Cannot create notification: userId is null");
            return;
        }

        try {
            Notification notification = new Notification(userId, type, title, message);
            notificationRepository.save(notification);
            logger.info("🔔 Notification created for user: {} - type: {}", userId, type);
        } catch (Exception e) {
            logger.error("❌ Error creating notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Triggered when a new job is created, published, or activated.
     * Evaluates active JobAlerts and candidate profiles using flexible wildcard rules
     * (e.g. location = "Anywhere in India", roles = "All Relevant", MBBS matching JR/MO posts).
     * Populates notifications and updates job alert match counts.
     */
    public void processNewJobAlerts(Job job) {
        if (job == null || job.getStatus() != Job.JobStatus.ACTIVE) {
            return;
        }

        try {
            logger.info("Processing job alerts and candidate matching for newly active job: {} (ID: {})",
                    job.getTitle(), job.getId());

            String jobTitle = (job.getTitle() != null ? job.getTitle() : "").toLowerCase();
            String jobDesc = (job.getDescription() != null ? job.getDescription() : "").toLowerCase();
            String jobLocation = (job.getLocation() != null ? job.getLocation() : "").toLowerCase();
            String jobQual = (job.getQualification() != null ? job.getQualification() : "").toLowerCase();
            String jobSpeciality = (job.getSpeciality() != null ? job.getSpeciality() : "").toLowerCase();
            String jobSector = (job.getSector() != null ? job.getSector().name() : "").toLowerCase();
            String jobCategory = (job.getCategory() != null ? job.getCategory().name() : "").toLowerCase();
            String employerName = job.getEmployer() != null && job.getEmployer().getCompanyName() != null
                    ? job.getEmployer().getCompanyName() : "MedExJob Platform";

            // 1. Match against explicit JobAlert entities
            if (jobAlertRepository != null) {
                List<JobAlert> activeAlerts = jobAlertRepository.findAll().stream()
                        .filter(a -> Boolean.TRUE.equals(a.getActive()))
                        .collect(Collectors.toList());

                for (JobAlert alert : activeAlerts) {
                    if (isJobMatchingAlert(job, alert, jobTitle, jobDesc, jobLocation, jobSector, jobCategory)) {
                        alert.setMatchCount((alert.getMatchCount() != null ? alert.getMatchCount() : 0) + 1);
                        alert.setLastSent(LocalDateTime.now());
                        jobAlertRepository.save(alert);

                        // Create notification for the user
                        createJobNotificationIfNotExists(alert.getUserId(), job.getId(), job.getTitle(), employerName);
                    }
                }
            }

            // 2. Match against candidate profiles (e.g., candidates who completed profiles like Manoj Kumar)
            if (candidateProfileRepository != null) {
                List<CandidateProfile> profiles = candidateProfileRepository.findAll();
                for (CandidateProfile profile : profiles) {
                    if (profile.getCandidate() == null) continue;
                    UUID candidateUserId = profile.getCandidate().getId();

                    if (isJobMatchingCandidateProfile(job, profile, jobTitle, jobDesc, jobLocation, jobQual, jobSpeciality)) {
                        createJobNotificationIfNotExists(candidateUserId, job.getId(), job.getTitle(), employerName);
                    }
                }
            }

        } catch (Exception e) {
            logger.error("Error processing job alerts pipeline: {}", e.getMessage(), e);
        }
    }

    private boolean isJobMatchingAlert(Job job, JobAlert alert, String jobTitle, String jobDesc,
                                      String jobLocation, String jobSector, String jobCategory) {
        // Sectors check
        if (alert.getSectors() != null && !alert.getSectors().isBlank()) {
            List<String> sectors = Arrays.stream(alert.getSectors().split(","))
                    .map(String::trim).map(String::toLowerCase).filter(s -> !s.isEmpty()).toList();
            if (!sectors.isEmpty() && !sectors.contains(jobSector) && !sectors.contains("both") && !sectors.contains("all")) {
                return false;
            }
        }

        // Location check: WILDCARD SUPPORT!
        if (alert.getLocations() != null && !alert.getLocations().isBlank()) {
            List<String> locations = Arrays.stream(alert.getLocations().split(","))
                    .map(String::trim).map(String::toLowerCase).filter(s -> !s.isEmpty()).toList();
            
            boolean isWildcard = locations.stream().anyMatch(l -> 
                l.contains("anywhere") || l.contains("all india") || l.contains("pan india") || l.equals("india") || l.equals("any"));
            
            if (!isWildcard) {
                boolean locMatch = locations.stream().anyMatch(l -> 
                    jobLocation.contains(l) || l.contains(jobLocation));
                if (!locMatch) return false;
            }
        }

        // Keywords check: WILDCARD SUPPORT!
        if (alert.getKeywords() != null && !alert.getKeywords().isBlank()) {
            List<String> keywords = Arrays.stream(alert.getKeywords().split(","))
                    .map(String::trim).map(String::toLowerCase).filter(s -> !s.isEmpty()).toList();
            
            boolean isWildcard = keywords.stream().anyMatch(k -> 
                k.contains("all relevant") || k.contains("all") || k.equals("any"));
            
            if (!isWildcard) {
                String fullText = (jobTitle + " " + jobDesc + " " + jobLocation).toLowerCase();
                boolean kwMatch = keywords.stream().anyMatch(fullText::contains);
                if (!kwMatch) return false;
            }
        }

        return true;
    }

    private boolean isJobMatchingCandidateProfile(Job job, CandidateProfile profile, String jobTitle,
                                                  String jobDesc, String jobLocation, String jobQual, String jobSpeciality) {
        // 1. Location match (Wildcard check)
        String prefLoc = (profile.getPreferredLocation() != null ? profile.getPreferredLocation() : "").toLowerCase();
        String prefStates = (profile.getPreferredStates() != null ? profile.getPreferredStates() : "").toLowerCase();
        String locType = (profile.getLocationPreferenceType() != null ? profile.getLocationPreferenceType() : "").toLowerCase();

        boolean locationMatches = prefLoc.isEmpty() ||
                prefLoc.contains("anywhere") || prefLoc.contains("india") || prefLoc.contains("all") ||
                prefStates.contains("anywhere") || prefStates.contains("india") || prefStates.contains("all") ||
                locType.contains("anywhere") ||
                (!prefLoc.isEmpty() && (jobLocation.contains(prefLoc) || prefLoc.contains(jobLocation)));

        if (!locationMatches) {
            return false;
        }

        // 2. Candidate Speciality
        String candSpec = (profile.getSpeciality() != null ? profile.getSpeciality() : "").toLowerCase();
        boolean specialityMatches = false;
        if (candSpec.isEmpty() || candSpec.equals("all") || candSpec.contains("general medicine") || candSpec.equals("none")) {
            if (candSpec.contains("general medicine") || candSpec.contains("medicine")) {
                specialityMatches = jobTitle.contains("medicine") || jobTitle.contains("resident") ||
                        jobTitle.contains("medical officer") || jobTitle.contains("gdmo") ||
                        jobDesc.contains("medicine") || jobSpeciality.contains("medicine") ||
                        jobTitle.contains("physician") || jobTitle.contains("general");
            } else {
                specialityMatches = true;
            }
        } else {
            specialityMatches = jobTitle.contains(candSpec) || jobDesc.contains(candSpec) || jobSpeciality.contains(candSpec);
        }

        // 3. Qualification match (MBBS)
        String candQual = (profile.getHighestQualification() != null ? profile.getHighestQualification()
                : (profile.getBasicQualification() != null ? profile.getBasicQualification()
                : (profile.getQualification() != null ? profile.getQualification() : ""))).toLowerCase();

        boolean qualMatches = false;
        if (candQual.isEmpty() || candQual.contains("mbbs")) {
            qualMatches = jobQual.contains("mbbs") || jobTitle.contains("mbbs") || jobDesc.contains("mbbs") ||
                    jobTitle.contains("junior resident") || jobTitle.contains("medical officer") || jobTitle.contains("gdmo") ||
                    jobTitle.contains("resident") || jobTitle.contains("faculty") || jobTitle.contains("senior resident");
        } else {
            qualMatches = jobQual.contains(candQual) || jobTitle.contains(candQual) || jobDesc.contains(candQual);
        }

        // 4. Target Roles check (All Relevant, Junior Resident, etc.)
        String rolesStr = (profile.getPreferredJobRoles() != null ? profile.getPreferredJobRoles()
                : (profile.getPreferredJobRole() != null ? profile.getPreferredJobRole() : "")).toLowerCase();
        boolean roleMatches = rolesStr.isEmpty() || rolesStr.contains("all relevant") || rolesStr.contains("all") ||
                (rolesStr.contains("junior resident") && (jobTitle.contains("junior resident") || jobTitle.contains("resident") || jobTitle.contains("jr"))) ||
                (rolesStr.contains("medical officer") && (jobTitle.contains("medical officer") || jobTitle.contains("mo")));

        return (specialityMatches || qualMatches) && (roleMatches || locationMatches);
    }

    private void createJobNotificationIfNotExists(UUID userId, UUID jobId, String jobTitle, String org) {
        if (userId == null || jobId == null) return;
        
        // Prevent duplicate notification for same user and job
        List<Notification> existing = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        boolean alreadyNotified = existing.stream()
                .anyMatch(n -> jobId.equals(n.getRelatedJobId()));
        if (alreadyNotified) {
            return;
        }

        String title = "New Matching Job: " + (jobTitle.length() > 150 ? jobTitle.substring(0, 150) : jobTitle);
        String msg = String.format("A new opening '%s' was posted at %s. View and apply now.",
                jobTitle.length() > 60 ? jobTitle.substring(0, 60) + "…" : jobTitle, org);
        if (msg.length() > 500) msg = msg.substring(0, 500);

        Notification n = new Notification(userId, "job_alert", title, msg);
        n.setRelatedJobId(jobId);
        notificationRepository.save(n);
        logger.info("Sent job_alert notification to user: {} for job: {}", userId, jobId);
    }
}
