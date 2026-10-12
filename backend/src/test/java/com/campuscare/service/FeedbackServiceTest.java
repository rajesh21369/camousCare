package com.campuscare.service;

import com.campuscare.dto.FeedbackRequest;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.model.Complaint;
import com.campuscare.model.ComplaintStatus;
import com.campuscare.model.Feedback;
import com.campuscare.model.User;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.FeedbackRepository;
import com.campuscare.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private FeedbackService feedbackService;

    private Complaint complaint;
    private final String studentId = "student-123";

    @BeforeEach
    void setUp() {
        complaint = new Complaint();
        complaint.setId("comp-1");
        complaint.setTrackingNumber("CMP-2026-0001");
        complaint.setStudentId(studentId);
        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setFeedbackSubmitted(false);
    }

    @Test
    @DisplayName("Submit feedback succeeds for resolved complaint by the complaint owner")
    void testSubmitFeedbackSuccess() {
        FeedbackRequest req = new FeedbackRequest(5, "Quick resolution and clear communication!", "Timeliness");

        when(complaintRepository.findById("comp-1")).thenReturn(Optional.of(complaint));
        when(feedbackRepository.existsByComplaintId("comp-1")).thenReturn(false);
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(i -> i.getArgument(0));

        Feedback feedback = feedbackService.submitFeedback("comp-1", req, studentId);

        assertNotNull(feedback);
        assertEquals(5, feedback.getRating());
        assertEquals("Quick resolution and clear communication!", feedback.getComment());
        assertTrue(complaint.isFeedbackSubmitted());
        verify(complaintRepository, times(1)).save(complaint);
    }

    @Test
    @DisplayName("Feedback fails if complaint is not resolved or closed")
    void testFeedbackFailsIfNotResolved() {
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        FeedbackRequest req = new FeedbackRequest(4, "Good", "Overall");

        when(complaintRepository.findById("comp-1")).thenReturn(Optional.of(complaint));

        assertThrows(BadRequestException.class, () -> {
            feedbackService.submitFeedback("comp-1", req, studentId);
        });
    }

    @Test
    @DisplayName("Feedback fails if submitted by a different student")
    void testFeedbackFailsForDifferentStudent() {
        FeedbackRequest req = new FeedbackRequest(4, "Good", "Overall");

        when(complaintRepository.findById("comp-1")).thenReturn(Optional.of(complaint));

        assertThrows(UnauthorizedException.class, () -> {
            feedbackService.submitFeedback("comp-1", req, "another-student-id");
        });
    }

    @Test
    @DisplayName("Feedback fails if already submitted")
    void testDuplicateFeedbackFails() {
        complaint.setFeedbackSubmitted(true);
        FeedbackRequest req = new FeedbackRequest(4, "Good", "Overall");

        when(complaintRepository.findById("comp-1")).thenReturn(Optional.of(complaint));

        assertThrows(BadRequestException.class, () -> {
            feedbackService.submitFeedback("comp-1", req, studentId);
        });
    }
}
