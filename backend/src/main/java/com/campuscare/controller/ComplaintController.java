package com.campuscare.controller;

import com.campuscare.config.CustomUserDetails;
import com.campuscare.dto.*;
import com.campuscare.model.ComplaintPriority;
import com.campuscare.model.ComplaintStatus;
import com.campuscare.model.Role;
import com.campuscare.service.ComplaintService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody ComplaintCreateRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        ComplaintResponse created = complaintService.createComplaint(req, userDetails.getUser(), request.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint registered successfully. Tracking number: " + created.getTrackingNumber(), created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getComplaints(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) ComplaintPriority priority,
            @RequestParam(required = false) Boolean overdueOnly,
            @RequestParam(required = false) String search) {

        List<ComplaintResponse> list = complaintService.getComplaintsForUser(
                userDetails.getUser(),
                status,
                departmentId,
                categoryId,
                priority,
                overdueOnly,
                search
        );
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        ComplaintResponse complaint = complaintService.getComplaintById(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success(complaint));
    }

    @GetMapping("/public/track/{trackingNumber}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> publicTrackComplaint(
            @PathVariable String trackingNumber,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        ComplaintResponse complaint = complaintService.getComplaintByTrackingNumber(
                trackingNumber,
                userDetails != null ? userDetails.getUser() : null
        );
        return ResponseEntity.ok(ApiResponse.success(complaint));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assignComplaint(
            @PathVariable String id,
            @Valid @RequestBody ComplaintAssignRequest req,
            @AuthenticationPrincipal CustomUserDetails admin,
            HttpServletRequest request) {

        ComplaintResponse updated = complaintService.assignComplaint(id, req, admin.getUser(), request.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Complaint assigned successfully", updated));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateStatus(
            @PathVariable String id,
            @RequestBody ComplaintUpdateRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        ComplaintResponse updated = complaintService.updateStatus(id, req, userDetails.getUser(), request.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated successfully", updated));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_OFFICER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> rejectComplaint(
            @PathVariable String id,
            @Valid @RequestBody ComplaintRejectRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        ComplaintResponse rejected = complaintService.rejectComplaint(id, req, userDetails.getUser(), request.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Complaint marked as rejected", rejected));
    }

    @PutMapping("/{id}/reopen")
    public ResponseEntity<ApiResponse<ComplaintResponse>> reopenComplaint(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        String reason = body.getOrDefault("reason", "Requested by student");
        ComplaintResponse reopened = complaintService.reopenComplaint(id, reason, userDetails.getUser(), request.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Complaint reopened successfully", reopened));
    }
}
