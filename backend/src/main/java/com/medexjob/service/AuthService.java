package com.medexjob.service;

import com.medexjob.dto.LoginRequest;
import com.medexjob.dto.RegisterRequest;
import com.medexjob.dto.AuthResponse;
import com.medexjob.entity.User;
import com.medexjob.security.AuthException;
import com.medexjob.repository.UserRepository;
import com.medexjob.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    // ---------------- Register ----------------
    public void register(RegisterRequest registerRequest) {
        // Validate role
        if (registerRequest.getRole() == null) {
            throw new AuthException("User role must be specified.");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new AuthException("Email is already registered!");
        }

        // Create new user
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setRole(registerRequest.getRole());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));

        // ---------------- For Testing: skip email verification ----------------
        user.setIsActive(true);
        user.setIsVerified(true);

        // Optional: keep email verification token for later
        user.setEmailVerificationToken(UUID.randomUUID().toString());

        userRepository.save(user);

        // TODO: Send email verification email (for production)
    }

    // ---------------- Login ----------------
    public AuthResponse login(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmailAndIsActiveTrue(loginRequest.getEmail())
                    .orElseThrow(() -> new AuthException("User not found or inactive"));

            if (!user.getIsVerified()) {
                throw new AuthException("Please verify your email before logging in.");
            }

            String token = jwtTokenProvider.generateToken(user.getEmail());

            return new AuthResponse(token, user);

        } catch (AuthenticationException e) {
            throw new AuthException("Invalid email or password");
        }
    }

    // ---------------- Get Current User ----------------
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new AuthException("User not found"));
    }

    // ---------------- Email Verification ----------------
    public boolean verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new AuthException("Invalid verification token"));

        user.setIsVerified(true);
        user.setEmailVerifiedAt(java.time.LocalDateTime.now());
        user.setEmailVerificationToken(null);

        userRepository.save(user);
        return true;
    }

    // ---------------- Forgot Password ----------------
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new AuthException("User not found"));

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpires(java.time.LocalDateTime.now().plusHours(1));

        userRepository.save(user);

        // TODO: Send password reset email
    }

    // ---------------- Reset Password ----------------
    public boolean resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new AuthException("Invalid reset token"));

        if (user.getPasswordResetExpires().isBefore(java.time.LocalDateTime.now())) {
            throw new AuthException("Reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpires(null);

        userRepository.save(user);
        return true;
    }
}






