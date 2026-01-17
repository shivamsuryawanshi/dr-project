package com.medexjob.security;

import com.medexjob.repository.UserRepository;
import com.medexjob.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.medexjob.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain chain) throws ServletException, IOException {
        
        final String requestTokenHeader = request.getHeader("Authorization");
        
        String email = null;
        String jwtToken = null;
        
        // 1. JWT Token is in the form "Bearer token". Remove Bearer word and get only the Token
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                // Get the email/subject from the token
                email = jwtTokenProvider.getEmailFromToken(jwtToken);
                logger.debug("Successfully extracted email from JWT token: {}", email);
            } catch (IllegalArgumentException e) {
                logger.error("Unable to get JWT Token: {}", e.getMessage());
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                logger.warn("JWT Token has expired for request: {}", request.getRequestURI());
            } catch (io.jsonwebtoken.JwtException e) {
                logger.error("JWT Token processing error for request {}: {}", request.getRequestURI(), e.getMessage());
            }
        } else {
            logger.warn("JWT Token does not begin with Bearer String for request: {}. Header: {}", 
                request.getRequestURI(), requestTokenHeader != null ? "Present but invalid format" : "Missing");
        }
        
        // Once we get the token, validate it.
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);
                logger.debug("Loaded user details for email: {}", email);

                // If we were able to get the email, the token is valid.
                // Now, we configure Spring Security to manually set authentication.
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                    .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                logger.debug("Authentication set for user: {}", email);
            } catch (Exception e) {
                logger.error("Error loading user details for email {}: {}", email, e.getMessage());
            }
        } else if (email == null && request.getRequestURI().startsWith("/api/jobs") && 
                   request.getMethod().equals("POST")) {
            logger.warn("POST /api/jobs request without valid JWT token. URI: {}", request.getRequestURI());
        }
        
        chain.doFilter(request, response);
    }
}
