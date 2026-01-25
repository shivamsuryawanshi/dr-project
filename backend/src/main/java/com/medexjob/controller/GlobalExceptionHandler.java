package com.medexjob.controller;

import com.medexjob.security.AuthException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.net.URI;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<?> handleNoHandlerFound(NoHandlerFoundException ex, WebRequest request) {
        String path = ex.getRequestURL();
        logger.warn("No handler found for path: {}", path);
        logger.warn("Request method: {}", ex.getHttpMethod());
        
        // Check if it's an admin endpoint
        if (path != null && path.contains("/api/admin/")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "Admin endpoint not found",
                "message", "The requested admin endpoint does not exist or is not properly configured.",
                "path", path,
                "suggestion", "Please verify the endpoint path and ensure the backend controller is properly registered."
            ));
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
            "error", "Endpoint not found",
            "message", "The requested resource does not exist.",
            "path", path != null ? path : "unknown"
        ));
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<?> handleAuthException(AuthException ex, WebRequest request) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed. Please check your input.");
        problemDetail.setTitle("Validation Error");
        problemDetail.setType(URI.create("https://medexjob.com/errors/validation"));

        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        fieldError -> fieldError.getField(),
                        fieldError -> fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "Invalid value"
                ));
        problemDetail.setProperty("errors", errors);
        return ResponseEntity.badRequest().body(problemDetail);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String message = ex.getMessage();
        if (message != null && message.contains("role")) {
            return new ResponseEntity<>(Map.of("error", "Invalid role value. Valid roles are: CANDIDATE, EMPLOYER, ADMIN"), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(Map.of("error", "Invalid request body. Please check your input.", "details", ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException ex) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex, WebRequest request) {
        // Log the exception for debugging purposes
        ex.printStackTrace(); // Add this to see the actual error in logs
        return new ResponseEntity<>(Map.of("error", "An unexpected error occurred.", "details", ex.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
