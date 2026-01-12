// AI assisted development
package com.medexjob.controller;

import com.medexjob.entity.NewsUpdate;
import com.medexjob.repository.NewsUpdateRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "http://localhost:3000")
public class NewsController {

    private final NewsUpdateRepository newsUpdateRepository;

    public NewsController(NewsUpdateRepository newsUpdateRepository) {
        this.newsUpdateRepository = newsUpdateRepository;
    }

    @PostConstruct
    public void seedData() {
        if (newsUpdateRepository.count() > 0) return;

        List<NewsUpdate> samples = Arrays.asList(
                new NewsUpdate("AIIMS Delhi opens senior resident positions in critical care", NewsUpdate.NewsType.GOVT, LocalDate.now().plusDays(5), true),
                new NewsUpdate("Fortis Bangalore hiring ICU nursing staff (night shift allowance)", NewsUpdate.NewsType.PRIVATE, LocalDate.now().plusDays(3), false),
                new NewsUpdate("NEET PG 2026 tentative schedule released", NewsUpdate.NewsType.EXAM, LocalDate.now().plusDays(12), true),
                new NewsUpdate("Rajasthan Health Services extends MO application deadline", NewsUpdate.NewsType.DEADLINE, LocalDate.now().plusDays(2), true),
                new NewsUpdate("Apollo Hospitals starts cardiology fellowship intake", NewsUpdate.NewsType.UPDATE, LocalDate.now().plusDays(7), false),
                new NewsUpdate("UP NHM announces 150 paramedical vacancies", NewsUpdate.NewsType.GOVT, LocalDate.now().plusDays(9), false),
                new NewsUpdate("Private multispecialty chain hiring 40 junior residents", NewsUpdate.NewsType.PRIVATE, LocalDate.now().plusDays(4), false),
                new NewsUpdate("AIIMS Rishikesh releases walk-in interview dates", NewsUpdate.NewsType.GOVT, LocalDate.now().plusDays(6), false),
                new NewsUpdate("JIPMER issues notice on document verification", NewsUpdate.NewsType.DEADLINE, LocalDate.now().plusDays(1), true),
                new NewsUpdate("NBEMS publishes exam city allocation FAQ", NewsUpdate.NewsType.EXAM, LocalDate.now().plusDays(8), false)
        );

        newsUpdateRepository.saveAll(samples);
    }

    @GetMapping("/pulse")
    public ResponseEntity<List<NewsUpdate>> getPulseUpdates() {
        List<NewsUpdate> updates = newsUpdateRepository.findTop10ByOrderByDateDescCreatedAtDesc();
        return ResponseEntity.ok(updates);
    }

    // Admin: Get all news updates
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllNews() {
        List<NewsUpdate> updates = newsUpdateRepository.findAll(Sort.by(Sort.Direction.DESC, "date", "createdAt"));
        List<Map<String, Object>> response = updates.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Admin: Create News
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody NewsRequest req) {
        NewsUpdate news = new NewsUpdate();
        news.setTitle(req.title());
        news.setType(parseNewsType(req.type()));
        news.setDate(parseDate(req.date()));
        news.setBreaking(Optional.ofNullable(req.breaking()).orElse(false));
        NewsUpdate saved = newsUpdateRepository.save(news);
        return ResponseEntity.ok(toResponse(saved));
    }

    // Admin: Update News
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable("id") UUID id, @RequestBody NewsRequest req) {
        return newsUpdateRepository.findById(id)
                .map(existing -> {
                    if (req.title() != null) existing.setTitle(req.title());
                    if (req.type() != null) existing.setType(parseNewsType(req.type()));
                    if (req.date() != null) existing.setDate(parseDate(req.date()));
                    if (req.breaking() != null) existing.setBreaking(req.breaking());
                    NewsUpdate saved = newsUpdateRepository.save(existing);
                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Admin: Delete News
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        if (!newsUpdateRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        newsUpdateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private NewsUpdate.NewsType parseNewsType(String type) {
        if (type == null || type.isBlank()) {
            return NewsUpdate.NewsType.UPDATE;
        }
        try {
            return NewsUpdate.NewsType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return NewsUpdate.NewsType.UPDATE;
        }
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            return LocalDate.now();
        }
    }

    private Map<String, Object> toResponse(NewsUpdate news) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", news.getId().toString());
        map.put("title", news.getTitle());
        map.put("type", news.getType().name());
        map.put("date", news.getDate().toString());
        map.put("breaking", news.isBreaking());
        if (news.getCreatedAt() != null) {
            map.put("createdAt", news.getCreatedAt().toString());
        }
        return map;
    }

    private record NewsRequest(
            String title,
            String type,
            String date,
            Boolean breaking
    ) {}
}
