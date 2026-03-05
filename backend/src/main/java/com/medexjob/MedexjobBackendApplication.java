package com.medexjob;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class MedexjobBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedexjobBackendApplication.class, args);
        System.out.println("🚀 MedExJob.com Backend Server is running!");
        System.out.println("📊 API Base: /api");
        System.out.println("🌐 Frontend: https://medexjob.com");
    }
}
