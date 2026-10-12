package com.campuscare.controller;

import com.campuscare.config.CustomUserDetails;
import com.campuscare.dto.ApiResponse;
import com.campuscare.dto.FeedbackRequest;
import com.campuscare.model.Feedback;
import com.campuscare.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/{complaintId}")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse<Feedback>> submitFeedback(
            @PathVariable String complaintId,
            @Valid @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal CustomUserDetails student) {

        Feedback saved = feedbackService.submitFeedback(complaintId, request, student.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thank you for your rating and feedback!", saved));
    }

    @GetMapping("/{complaintId}")
    public ResponseEntity<ApiResponse<Feedback>> getFeedbackByComplaint(@PathVariable String complaintId) {
        Feedback fb = feedbackService.getFeedbackByComplaintId(complaintId);
        return ResponseEntity.ok(ApiResponse.success(fb));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGEMENT')")
    public ResponseEntity<ApiResponse<List<Feedback>>> getAllFeedbacks() {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getAllFeedbacks()));
    }
}
