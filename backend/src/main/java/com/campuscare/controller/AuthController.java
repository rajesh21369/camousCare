package com.campuscare.controller;

import com.campuscare.config.CustomUserDetails;
import com.campuscare.config.JwtTokenProvider;
import com.campuscare.dto.*;
import com.campuscare.model.User;
import com.campuscare.service.AuditLogService;
import com.campuscare.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserService userService,
                          JwtTokenProvider tokenProvider,
                          AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.tokenProvider = tokenProvider;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        String jwt = tokenProvider.generateToken(authentication, user.getId(), user.getRole().name());

        JwtAuthResponse authResponse = new JwtAuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getDepartmentId()
        );

        auditLogService.logAction(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                "USER_LOGIN",
                "User successfully logged in",
                request.getRemoteAddr()
        );

        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserProfileDto>> registerStudent(
            @Valid @RequestBody RegisterRequest registerRequest,
            HttpServletRequest request) {

        User registered = userService.registerStudent(registerRequest);

        auditLogService.logAction(
                registered.getId(),
                registered.getUsername(),
                registered.getRole().name(),
                "USER_REGISTERED",
                "New student registered: " + registered.getUsername(),
                request.getRemoteAddr()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful. Please log in.", userService.mapToProfileDto(registered)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }
        UserProfileDto profile = userService.getUserProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
