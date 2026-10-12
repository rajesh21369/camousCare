package com.campuscare.controller;

import com.campuscare.config.CustomUserDetails;
import com.campuscare.dto.ApiResponse;
import com.campuscare.dto.DepartmentDto;
import com.campuscare.service.AuditLogService;
import com.campuscare.service.DepartmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;
    private final AuditLogService auditLogService;

    public DepartmentController(DepartmentService departmentService, AuditLogService auditLogService) {
        this.departmentService = departmentService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getAllDepartments(
            @RequestParam(required = false, defaultValue = "false") boolean all) {
        List<DepartmentDto> list = all ? departmentService.getAllDepartments() : departmentService.getActiveDepartments();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDto>> getDepartmentById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(departmentService.getDepartmentById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDto>> createDepartment(
            @Valid @RequestBody DepartmentDto dto,
            @AuthenticationPrincipal CustomUserDetails admin,
            HttpServletRequest request) {

        DepartmentDto created = departmentService.createDepartment(dto);
        auditLogService.logAction(
                admin.getId(),
                admin.getUsername(),
                admin.getUser().getRole().name(),
                "DEPARTMENT_CREATED",
                "Created department: " + created.getName() + " (" + created.getCode() + ")",
                request.getRemoteAddr()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDto>> updateDepartment(
            @PathVariable String id,
            @Valid @RequestBody DepartmentDto dto,
            @AuthenticationPrincipal CustomUserDetails admin,
            HttpServletRequest request) {

        DepartmentDto updated = departmentService.updateDepartment(id, dto);
        auditLogService.logAction(
                admin.getId(),
                admin.getUsername(),
                admin.getUser().getRole().name(),
                "DEPARTMENT_UPDATED",
                "Updated department: " + updated.getName(),
                request.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.success("Department updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails admin,
            HttpServletRequest request) {

        departmentService.deleteDepartment(id);
        auditLogService.logAction(
                admin.getId(),
                admin.getUsername(),
                admin.getUser().getRole().name(),
                "DEPARTMENT_DEACTIVATED",
                "Deactivated department: " + id,
                request.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.success("Department deactivated successfully", null));
    }
}
