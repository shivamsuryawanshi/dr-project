package com.medexjob.repository;

import com.medexjob.entity.NewsUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NewsUpdateRepository extends JpaRepository<NewsUpdate, UUID> {
    List<NewsUpdate> findTop10ByOrderByDateDescCreatedAtDesc();
    List<NewsUpdate> findByShowOnHomepageTrueOrderByDateDescCreatedAtDesc();
}
