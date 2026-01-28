// AI assisted development
package com.medexjob.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from the uploads directory
        String uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize().toString();
        // Serve from /uploads/ path
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
        // Also serve from /api/uploads/ path for API consistency
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}

