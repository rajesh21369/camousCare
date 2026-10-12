package com.campuscare.dto;

import com.campuscare.model.ComplaintPriority;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CategoryDto {

    private String id;

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;

    private String defaultDepartmentId;

    private String defaultDepartmentName;

    private ComplaintPriority defaultPriority = ComplaintPriority.MEDIUM;

    @Min(value = 1, message = "SLA days must be at least 1")
    private int slaDays = 3;

    private boolean active = true;

    private long complaintCount;

    public CategoryDto() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDefaultDepartmentId() {
        return defaultDepartmentId;
    }

    public void setDefaultDepartmentId(String defaultDepartmentId) {
        this.defaultDepartmentId = defaultDepartmentId;
    }

    public String getDefaultDepartmentName() {
        return defaultDepartmentName;
    }

    public void setDefaultDepartmentName(String defaultDepartmentName) {
        this.defaultDepartmentName = defaultDepartmentName;
    }

    public ComplaintPriority getDefaultPriority() {
        return defaultPriority;
    }

    public void setDefaultPriority(ComplaintPriority defaultPriority) {
        this.defaultPriority = defaultPriority;
    }

    public int getSlaDays() {
        return slaDays;
    }

    public void setSlaDays(int slaDays) {
        this.slaDays = slaDays;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public long getComplaintCount() {
        return complaintCount;
    }

    public void setComplaintCount(long complaintCount) {
        this.complaintCount = complaintCount;
    }
}
