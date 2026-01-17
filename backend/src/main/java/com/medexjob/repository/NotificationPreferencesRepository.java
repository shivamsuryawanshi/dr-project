// AI assisted development
package com.medexjob.repository;

import com.medexjob.entity.NotificationPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationPreferencesRepository extends JpaRepository<NotificationPreferences, UUID> {

    // Find preferences by user ID
    Optional<NotificationPreferences> findByUserId(UUID userId);
}

