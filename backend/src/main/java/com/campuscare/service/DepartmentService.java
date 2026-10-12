package com.campuscare.service;

import com.campuscare.dto.DepartmentDto;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.model.Department;
import com.campuscare.model.User;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.DepartmentRepository;
import com.campuscare.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;

    public DepartmentService(DepartmentRepository departmentRepository,
                             UserRepository userRepository,
                             ComplaintRepository complaintRepository) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
    }

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DepartmentDto> getActiveDepartments() {
        return departmentRepository.findByActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(String id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return mapToDto(dept);
    }

    public DepartmentDto createDepartment(DepartmentDto dto) {
        if (departmentRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Department code already exists: " + dto.getCode());
        }
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department name already exists: " + dto.getName());
        }

        Department dept = new Department(
                dto.getName(),
                dto.getCode().toUpperCase(),
                dto.getDescription(),
                dto.getContactEmail(),
                dto.getHeadOfficerId()
        );
        Department saved = departmentRepository.save(dept);
        return mapToDto(saved);
    }

    public DepartmentDto updateDepartment(String id, DepartmentDto dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (!dept.getName().equalsIgnoreCase(dto.getName()) && departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department name already exists: " + dto.getName());
        }
        if (!dept.getCode().equalsIgnoreCase(dto.getCode()) && departmentRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Department code already exists: " + dto.getCode());
        }

        dept.setName(dto.getName());
        dept.setCode(dto.getCode().toUpperCase());
        dept.setDescription(dto.getDescription());
        dept.setContactEmail(dto.getContactEmail());
        dept.setHeadOfficerId(dto.getHeadOfficerId());
        dept.setActive(dto.isActive());

        Department updated = departmentRepository.save(dept);
        return mapToDto(updated);
    }

    public void deleteDepartment(String id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        dept.setActive(false);
        departmentRepository.save(dept);
    }

    private DepartmentDto mapToDto(Department dept) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(dept.getId());
        dto.setName(dept.getName());
        dto.setCode(dept.getCode());
        dto.setDescription(dept.getDescription());
        dto.setContactEmail(dept.getContactEmail());
        dto.setHeadOfficerId(dept.getHeadOfficerId());
        dto.setActive(dept.isActive());

        if (dept.getHeadOfficerId() != null) {
            userRepository.findById(dept.getHeadOfficerId()).ifPresent(user -> {
                dto.setHeadOfficerName(user.getFullName());
            });
        }

        dto.setComplaintCount(complaintRepository.countByDepartmentId(dept.getId()));
        return dto;
    }
}
