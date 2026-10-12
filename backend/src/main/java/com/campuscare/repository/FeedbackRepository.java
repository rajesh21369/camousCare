package com.campuscare.repository;

import com.campuscare.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {

    Optional<Feedback> findByComplaintId(String complaintId);

    List<Feedback> findByStudentId(String studentId);

    boolean existsByComplaintId(String complaintId);
}
