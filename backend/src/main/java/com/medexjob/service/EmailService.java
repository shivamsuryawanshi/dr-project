// AI assisted development
package com.medexjob.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            logger.info("═══════════════════════════════════════════════════════");
            logger.info("Attempting to send OTP email to: {}", toEmail);
            logger.info("OTP: {}", otp);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("shivamsuryawanshi51@gmail.com"); // Using configured Gmail account
            message.setTo(toEmail);
            message.setSubject("Password Reset OTP - MedExJob.com");
            message.setText(
                    "Hello,\n\n" +
                            "You have requested to reset your password for your MedExJob.com account.\n\n" +
                            "Your OTP (One-Time Password) is: " + otp + "\n\n" +
                            "This OTP will expire in 10 minutes.\n\n" +
                            "If you did not request this password reset, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "MedExJob.com Team");

            logger.info("Sending email via SMTP: smtp.gmail.com:587");
            mailSender.send(message);
            logger.info("✅ OTP email sent successfully to: {}", toEmail);
            logger.info("═══════════════════════════════════════════════════════");

        } catch (org.springframework.mail.MailAuthenticationException e) {
            logger.error("❌ Email authentication failed!");
            logger.error("Error: {}", e.getMessage());
            logger.error("Please check:");
            logger.error("1. Gmail 2-Step Verification is enabled");
            logger.error("2. App Password is used (not regular password)");
            logger.error("3. App Password is correct");
            e.printStackTrace();
            throw new RuntimeException("Email authentication failed. Please check Gmail App Password configuration.");
        } catch (org.springframework.mail.MailSendException e) {
            logger.error("❌ Failed to send email to: {}", toEmail);
            logger.error("Error: {}", e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        } catch (Exception e) {
            logger.error("❌ Unexpected error sending OTP email to: {}", toEmail);
            logger.error("Error: {}", e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }
}
