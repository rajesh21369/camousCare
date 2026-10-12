package com.campuscare.service;

import com.campuscare.dto.FeedbackRequest;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.model.*;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.FeedbackRepository;
import com.campuscare.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           ComplaintRepository complaintRepository,
                           UserRepository userRepository,
                           NotificationService notificationService) {
        this.feedbackRepository = feedbackRepository;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Feedback submitFeedback(String complaintId, FeedbackRequest request, String studentId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (!complaint.getStudentId().equals(studentId)) {
            throw new UnauthorizedException("You are not authorized to submit feedback for this complaint");
        }

        if (complaint.getStatus() != ComplaintStatus.RESOLVED && complaint.getStatus() != ComplaintStatus.CLOSED) {
            throw new BadRequestException("Feedback can only be submitted once the complaint is Resolved or Closed");
        }

        if (complaint.isFeedbackSubmitted() || feedbackRepository.existsByComplaintId(complaintId)) {
            throw new BadRequestException("Feedback has already been submitted for this complaint");
        }

        User student = userRepository.findById(studentId).orElse(null);
        String studentName = student != null ? student.getFullName() : complaint.getStudentName();

        Feedback feedback = new Feedback(
                complaintId,
                complaint.getTrackingNumber(),
                studentId,
                studentName,
                request.getRating(),
                request.getComment(),
                request.getSatisfactionCategory() != null ? request.getSatisfactionCategory() : "Overall"
        );

        Feedback saved = feedbackRepository.save(feedback);

        complaint.setFeedbackSubmitted(true);
        complaintRepository.save(complaint);

        // Notify assigned officer if any
        if (complaint.getAssignedOfficerId() != null) {
            notificationService.createNotification(
                    complaint.getAssignedOfficerId(),
                    "Feedback Received (" + complaint.getTrackingNumber() + ")",
                    "Student rated the resolution: " + request.getRating() + "/5 stars. Comment: " + request.getComment(),
                    complaint.getId(),
                    complaint.getTrackingNumber(),
                    "FEEDBACK"
            );
        }

        return saved;
    }

    public Feedback getFeedbackByComplaintId(String complaintId) {
        return feedbackRepository.findByComplaintId(complaintId)
                .orElse(null);
    }

    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }
}
