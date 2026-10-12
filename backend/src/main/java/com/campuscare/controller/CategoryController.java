package com.campuscare.controller;

import com.campuscare.config.CustomUserDetails;
import com.campuscare.dto.ApiResponse;
import com.campuscare.dto.CategoryDto;
import com.campuscare.service.AuditLogService;
import com.campuscare.service.CategoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final AuditLogService auditLogService;

    public CategoryController(CategoryService categoryService, AuditLogService auditLogService) {
        this.categoryService = categoryService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories(
            @RequestParam(required = false, defaultValue = "false") boolean all) {
        List<CategoryDto> list = all ? categoryService.getAllCategories() : categoryService.getActiveCategories();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(
            @Valid @RequestBody CategoryDto dto,
            @AuthenticationPrincipal CustomUserDetails admin,
            HttpServletRequest request) {

        CategoryDto created = categoryService.createCategory(dto);
        auditLogService.logAction(
                admin.getId(),
                admin.getUsername(),
                admin.getUser().getRole().name(),
                "CATEGORY_CREATED",
                "Created category: " + created.getName(),
                request.getRemoteAddr()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable String id,
            @Valid @RequestBody CategoryDto dto,
            @AuthenticationPrincipal CustomUserDetails admin,
            HttpServletRequest request) {

        CategoryDto updated = categoryService.updateCategory(id, dto);
        auditLogService.logAction(
                admin.getId(),
                admin.getUsername(),
                admin.getUser().getRole().name(),
                "CATEGORY_UPDATED",
                "Updated category: " + updated.getName(),
                request.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails admin,
            HttpServletRequest request) {

        categoryService.deleteCategory(id);
        auditLogService.logAction(
                admin.getId(),
                admin.getUsername(),
                admin.getUser().getRole().name(),
                "CATEGORY_DEACTIVATED",
                "Deactivated category: " + id,
                request.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.success("Category deactivated successfully", null));
    }
}
