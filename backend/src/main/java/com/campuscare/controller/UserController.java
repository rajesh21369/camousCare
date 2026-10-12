package com.campuscare.controller;

import com.campuscare.config.CustomUserDetails;
import com.campuscare.dto.*;
import com.campuscare.model.Role;
import com.campuscare.model.User;
import com.campuscare.service.AuditLogService;
import com.campuscare.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuditLogService auditLogService;

    public UserController(UserService userService, AuditLogService auditLogService) {
        this.userService = userService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UserProfileDto profile = userService.getUserProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UserUpdateDto dto,
            HttpServletRequest request) {

        // Students & Officers can update their contact info, but not role or active status directly
        dto.setRole(null);
        dto.setActive(null);

        UserProfileDto updated = userService.updateUser(userDetails.getId(), dto);
        auditLogService.logAction(
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getUser().getRole().name(),
                "PROFILE_UPDATED",
                "Updated personal profile",
                request.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest req,
            HttpServletRequest request) {

        userService.changePassword(userDetails.getId(), req);
        auditLogService.logAction(
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getUser().getRole().name(),
                "PASSWORD_CHANGED",
                "User changed password",
                request.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @GetMapping("/officers")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getOfficers(
            @RequestParam(required = false) String departmentId) {
        if (departmentId != null && !departmentId.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(userService.getOfficersByDepartment(departmentId)));
        }
        return ResponseEntity.ok(ApiResponse.success(userService.getUsersByRole(Role.ROLE_OFFICER)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDto>> createUser(
            @RequestBody User user,
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            HttpServletRequest request) {

        User created = userService.createUser(user);
        auditLogService.logAction(
                adminDetails.getId(),
                adminDetails.getUsername(),
                adminDetails.getUser().getRole().name(),
                "USER_CREATED",
                "Created user: " + created.getUsername() + " with role: " + created.getRole(),
                request.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.success("User created successfully", userService.mapToProfileDto(created)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateUserByAdmin(
            @PathVariable String id,
            @RequestBody UserUpdateDto dto,
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            HttpServletRequest request) {

        UserProfileDto updated = userService.updateUser(id, dto);
        auditLogService.logAction(
                adminDetails.getId(),
                adminDetails.getUsername(),
                adminDetails.getUser().getRole().name(),
                "USER_MODIFIED",
                "Admin updated user " + id + " (Role: " + updated.getRole() + ", Active: " + updated.isActive() + ")",
                request.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }
}
