// AI assisted development
package com.medexjob.repository;

import com.medexjob.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    // Find payments by user
    Page<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    // Find payments by subscription
    List<Payment> findBySubscriptionIdOrderByCreatedAtDesc(UUID subscriptionId);

    // Find payment by transaction ID
    java.util.Optional<Payment> findByTransactionId(String transactionId);

    // Find payment by gateway order ID
    java.util.Optional<Payment> findByGatewayOrderId(String gatewayOrderId);

    // Find payments by status
    Page<Payment> findByStatusOrderByCreatedAtDesc(Payment.PaymentStatus status, Pageable pageable);
}

