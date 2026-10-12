package com.campuscare.repository;

import com.campuscare.model.Complaint;
import com.campuscare.model.ComplaintPriority;
import com.campuscare.model.ComplaintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends MongoRepository<Complaint, String> {

    Optional<Complaint> findByTrackingNumber(String trackingNumber);

    List<Complaint> findByStudentIdOrderByCreatedAtDesc(String studentId);

    Page<Complaint> findByStudentId(String studentId, Pageable pageable);

    List<Complaint> findByDepartmentId(String departmentId);

    List<Complaint> findByAssignedOfficerId(String assignedOfficerId);

    List<Complaint> findByStatus(ComplaintStatus status);

    long countByStatus(ComplaintStatus status);

    long countByDepartmentId(String departmentId);

    long countByCategoryId(String categoryId);

    long countByStudentId(String studentId);

    List<Complaint> findByDueDateBeforeAndStatusNotIn(Instant now, List<ComplaintStatus> resolvedOrClosedStatuses);

    long countByDueDateBeforeAndStatusNotIn(Instant now, List<ComplaintStatus> resolvedOrClosedStatuses);
}
