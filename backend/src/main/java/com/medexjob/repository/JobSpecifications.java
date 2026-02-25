package com.medexjob.repository;

import com.medexjob.entity.Job;
import com.medexjob.entity.Employer;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specifications for dynamic job search filtering.
 */
public class JobSpecifications {

    public static Specification<Job> buildSearchSpec(String searchQuery, String location, Job.JobStatus status) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Join with employer for company name search
            Join<Job, Employer> employerJoin = root.join("employer", JoinType.LEFT);

            // Status filter
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // Location filter
            if (location != null && !location.trim().isEmpty()) {
                String locationPattern = "%" + location.trim().toLowerCase() + "%";
                predicates.add(
                        cb.like(
                                cb.lower(root.get("location")),
                                locationPattern
                        )
                );
            }

            // Search filter (title OR company OR description OR speciality OR qualification)
            if (searchQuery != null && !searchQuery.trim().isEmpty()) {

                String searchPattern = "%" + searchQuery.trim().toLowerCase() + "%";

                Predicate titleMatch = cb.like(
                        cb.lower(root.get("title")),
                        searchPattern
                );

                Predicate companyMatch = cb.like(
                        cb.lower(employerJoin.get("companyName")),
                        searchPattern
                );

                Predicate descriptionMatch = cb.like(
                        cb.lower(root.get("description")),
                        searchPattern
                );

                Predicate specialityMatch = cb.like(
                        cb.lower(cb.coalesce(root.get("speciality"), "")),
                        searchPattern
                );

                Predicate qualificationMatch = cb.like(
                        cb.lower(root.get("qualification")),
                        searchPattern
                );

                predicates.add(
                        cb.or(titleMatch, companyMatch, descriptionMatch, specialityMatch, qualificationMatch)
                );

                // ORDERING FIXED (GENERIC TYPE FIX APPLIED HERE)
                Expression<Integer> titleOrder = cb.<Integer>selectCase()
                        .when(titleMatch, 1)
                        .otherwise(2);

                query.orderBy(
                        cb.asc(titleOrder),
                        cb.desc(root.get("createdAt"))
                );

            } else {
                query.orderBy(cb.desc(root.get("createdAt")));
            }

            query.distinct(true);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Job> hasStatus(Job.JobStatus status) {
        return (root, query, cb) -> {
            if (status == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<Job> titleContains(String title) {
        return (root, query, cb) -> {
            if (title == null || title.trim().isEmpty()) {
                return cb.conjunction();
            }
            return cb.like(
                    cb.lower(root.get("title")),
                    "%" + title.trim().toLowerCase() + "%"
            );
        };
    }

    public static Specification<Job> companyNameContains(String companyName) {
        return (root, query, cb) -> {
            if (companyName == null || companyName.trim().isEmpty()) {
                return cb.conjunction();
            }
            Join<Job, Employer> employerJoin = root.join("employer", JoinType.LEFT);
            return cb.like(
                    cb.lower(employerJoin.get("companyName")),
                    "%" + companyName.trim().toLowerCase() + "%"
            );
        };
    }

    public static Specification<Job> locationContains(String location) {
        return (root, query, cb) -> {
            if (location == null || location.trim().isEmpty()) {
                return cb.conjunction();
            }
            return cb.like(
                    cb.lower(root.get("location")),
                    "%" + location.trim().toLowerCase() + "%"
            );
        };
    }
}