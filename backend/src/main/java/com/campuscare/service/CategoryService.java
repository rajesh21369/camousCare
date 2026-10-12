package com.campuscare.service;

import com.campuscare.dto.CategoryDto;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.model.ComplaintCategory;
import com.campuscare.repository.ComplaintCategoryRepository;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final ComplaintCategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;

    public CategoryService(ComplaintCategoryRepository categoryRepository,
                           DepartmentRepository departmentRepository,
                           ComplaintRepository complaintRepository) {
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.complaintRepository = complaintRepository;
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CategoryDto getCategoryById(String id) {
        ComplaintCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToDto(category);
    }

    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Category name already exists: " + dto.getName());
        }

        ComplaintCategory category = new ComplaintCategory(
                dto.getName(),
                dto.getDescription(),
                dto.getDefaultDepartmentId(),
                dto.getDefaultPriority(),
                dto.getSlaDays()
        );
        ComplaintCategory saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    public CategoryDto updateCategory(String id, CategoryDto dto) {
        ComplaintCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!category.getName().equalsIgnoreCase(dto.getName()) && categoryRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Category name already exists: " + dto.getName());
        }

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setDefaultDepartmentId(dto.getDefaultDepartmentId());
        category.setDefaultPriority(dto.getDefaultPriority());
        category.setSlaDays(dto.getSlaDays());
        category.setActive(dto.isActive());

        ComplaintCategory updated = categoryRepository.save(category);
        return mapToDto(updated);
    }

    public void deleteCategory(String id) {
        ComplaintCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.setActive(false);
        categoryRepository.save(category);
    }

    private CategoryDto mapToDto(ComplaintCategory category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setDefaultDepartmentId(category.getDefaultDepartmentId());
        dto.setDefaultPriority(category.getDefaultPriority());
        dto.setSlaDays(category.getSlaDays());
        dto.setActive(category.isActive());

        if (category.getDefaultDepartmentId() != null) {
            departmentRepository.findById(category.getDefaultDepartmentId()).ifPresent(dept -> {
                dto.setDefaultDepartmentName(dept.getName());
            });
        }

        dto.setComplaintCount(complaintRepository.countByCategoryId(category.getId()));
        return dto;
    }
}
