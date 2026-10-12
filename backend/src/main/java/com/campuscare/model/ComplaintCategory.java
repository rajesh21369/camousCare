package com.campuscare.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "complaintCategories")
public class ComplaintCategory {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String description;

    private String defaultDepartmentId;

    private ComplaintPriority defaultPriority = ComplaintPriority.MEDIUM;

    private int slaDays = 3;

    private boolean active = true;

    private Instant createdAt = Instant.now();

    public ComplaintCategory() {
    }

    public ComplaintCategory(String name, String description, String defaultDepartmentId,
                             ComplaintPriority defaultPriority, int slaDays) {
        this.name = name;
        this.description = description;
        this.defaultDepartmentId = defaultDepartmentId;
        this.defaultPriority = defaultPriority != null ? defaultPriority : ComplaintPriority.MEDIUM;
        this.slaDays = slaDays > 0 ? slaDays : 3;
        this.active = true;
        this.createdAt = Instant.now();
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
