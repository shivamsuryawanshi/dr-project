package com.medexjob;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MedexjobBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedexjobBackendApplication.class, args);
        System.out.println("🚀 MedExJob.com Backend Server is running!");
        System.out.println("📊 API Documentation: http://localhost:8082/api/actuator/health");
        System.out.println("🌐 Frontend URL: http://localhost:3000");
    }
}
