package com.medexjob.controller;

import com.medexjob.entity.Job;
import com.medexjob.repository.EmployerRepository;
import com.medexjob.repository.JobRepository;
import com.medexjob.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;

    public AnalyticsController(JobRepository jobRepository, UserRepository userRepository, EmployerRepository employerRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.employerRepository = employerRepository;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> overview() {
        long totalJobs = jobRepository.count();
        long totalUsers = userRepository.count();
        long totalEmployers = employerRepository.count();
        long totalApplications = jobRepository.findAll().stream().mapToLong(j -> Optional.ofNullable(j.getApplicationsCount()).orElse(0)).sum();
        Map<String, Object> resp = new HashMap<>();
        resp.put("totalJobs", totalJobs);
        resp.put("totalApplications", totalApplications);
        resp.put("totalUsers", totalUsers);
        resp.put("totalEmployers", totalEmployers);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/jobs-by-category")
    public ResponseEntity<List<Map<String, Object>>> jobsByCategory() {
        List<Job> all = jobRepository.findAll();
        Map<String, long[]> agg = new HashMap<>(); // [0]=jobs, [1]=applications
        for (Job j : all) {
            String key = mapCategoryToLabel(j.getCategory());
            long[] arr = agg.computeIfAbsent(key, k -> new long[]{0, 0});
            arr[0] += 1;
            arr[1] += Optional.ofNullable(j.getApplicationsCount()).orElse(0);
        }
        List<Map<String, Object>> out = agg.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getKey());
                    m.put("value", e.getValue()[0]); // for Pie value
                    m.put("count", e.getValue()[0]);
                    return m;
                })
                .sorted(Comparator.comparing(m -> (String)m.get("name")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    @GetMapping("/jobs-by-location")
    public ResponseEntity<List<Map<String, Object>>> jobsByLocation() {
        List<Job> all = jobRepository.findAll();
        Map<String, long[]> agg = new HashMap<>(); // [0]=jobs, [1]=applications
        for (Job j : all) {
            String key = Optional.ofNullable(j.getLocation()).orElse("Unknown");
            long[] arr = agg.computeIfAbsent(key, k -> new long[]{0, 0});
            arr[0] += 1;
            arr[1] += Optional.ofNullable(j.getApplicationsCount()).orElse(0);
        }
        List<Map<String, Object>> out = agg.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("location", e.getKey());
                    m.put("jobs", e.getValue()[0]);
                    m.put("applications", e.getValue()[1]);
                    return m;
                })
                .sorted(Comparator.comparing(m -> ((String)m.get("location")).toLowerCase()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    @GetMapping("/top-jobs")
    public ResponseEntity<List<Map<String, Object>>> topJobs() {
        // Top by views
        List<Job> top = jobRepository.findTopViewedJobs(Job.JobStatus.ACTIVE, PageRequest.of(0, 5)).getContent();
        List<Map<String, Object>> out = top.stream().map(j -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", j.getTitle());
            m.put("views", j.getViews());
            m.put("applications", j.getApplicationsCount());
            // Simple derived conversion rate (applications/views * 100)
            double conv = j.getViews() > 0 ? (j.getApplicationsCount() * 100.0 / j.getViews()) : 0.0;
            m.put("conversion", Math.round(conv * 10.0) / 10.0);
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    private String mapCategoryToLabel(Job.JobCategory c) {
        if (c == null) return "Unknown";
        return switch (c) {
            case JUNIOR_RESIDENT -> "Junior Resident";
            case SENIOR_RESIDENT -> "Senior Resident";
            case MEDICAL_OFFICER -> "Medical Officer";
            case FACULTY -> "Faculty";
            case SPECIALIST -> "Specialist";
            case AYUSH -> "AYUSH";
            case PARAMEDICAL_NURSING -> "Paramedical / Nursing";
        };
    }
}
