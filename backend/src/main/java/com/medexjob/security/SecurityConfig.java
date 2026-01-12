// AI assisted development
package com.medexjob.security;

import com.medexjob.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String allowedMethods;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authz -> authz
                        // Allow OPTIONS requests for CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/jobs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/news/**").permitAll()
                        // Admin-only endpoints
                        .requestMatchers(HttpMethod.POST, "/api/jobs").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/jobs/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/jobs/**").hasRole("ADMIN")
                        // Application endpoints
                        .requestMatchers(HttpMethod.POST, "/api/applications").authenticated() // Any logged-in user can
                                                                                               // apply
                        .requestMatchers(HttpMethod.GET, "/api/applications").hasRole("ADMIN") // Only admin can list
                                                                                               // all
                        .requestMatchers(HttpMethod.PUT, "/api/applications/**/status").hasRole("ADMIN") // Only admin
                                                                                                         // can update
                                                                                                         // status
                        .requestMatchers(HttpMethod.DELETE, "/api/applications/**").hasRole("ADMIN") // Only admin can
                                                                                                     // delete
                        .requestMatchers("/api/analytics/**").permitAll()
                        .requestMatchers("/api/actuator/**").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Parse allowed origins from configuration (comma-separated)
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        // Check if wildcard is used (allows all origins)
        boolean allowAllOrigins = origins.isEmpty() || origins.contains("*");

        // Add default localhost origins for development if not using wildcard
        if (!allowAllOrigins) {
            List<String> defaultLocalhostOrigins = Arrays.asList(
                    "http://localhost:3000", "http://localhost:3001", "http://localhost:3002",
                    "http://localhost:3003", "http://localhost:5173", "http://localhost:5174",
                    "http://localhost:5175", "http://localhost:5176", "http://localhost:5177",
                    "http://localhost:5178", "http://localhost:5179", "http://localhost:5180");
            // Combine configured origins with default localhost origins
            origins.addAll(defaultLocalhostOrigins);
        }

        // Use setAllowedOrigins for exact match, or setAllowedOriginPatterns for
        // pattern matching
        // For production, allow all origins if needed (less secure but works)
        if (allowAllOrigins) {
            configuration.addAllowedOriginPattern("*");
        } else {
            configuration.setAllowedOriginPatterns(origins);
        }

        // Parse allowed methods from configuration
        List<String> methods = Arrays.stream(allowedMethods.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        configuration.setAllowedMethods(methods);

        configuration.setAllowedHeaders(Arrays.asList("*"));
        // Cannot use allow-credentials with wildcard origins (browser security
        // restriction)
        configuration.setAllowCredentials(!allowAllOrigins);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
