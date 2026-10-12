package com.campuscare.dto;

import jakarta.validation.constraints.NotBlank;

public class DepartmentDto {

    private String id;

    @NotBlank(message = "Department name is required")
    private String name;

    @NotBlank(message = "Department code is required")
    private String code;

    private String description;

    private String contactEmail;

    private String headOfficerId;

    private String headOfficerName;

    private boolean active = true;

    private long complaintCount;

    public DepartmentDto() {
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getHeadOfficerId() {
        return headOfficerId;
    }

    public void setHeadOfficerId(String headOfficerId) {
        this.headOfficerId = headOfficerId;
    }

    public String getHeadOfficerName() {
        return headOfficerName;
    }

    public void setHeadOfficerName(String headOfficerName) {
        this.headOfficerName = headOfficerName;
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
