package com.campuscare.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;

    private String message;

    private String relatedComplaintId;

    private String trackingNumber;

    private String type; // SUBMISSION, ASSIGNMENT, STATUS_UPDATE, INFO_REQUEST, RESOLUTION, ESCALATION

    @Indexed
    private boolean read = false;

    @Indexed
    private Instant createdAt = Instant.now();

    public Notification() {
    }

    public Notification(String userId, String title, String message, String relatedComplaintId,
                        String trackingNumber, String type) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.relatedComplaintId = relatedComplaintId;
        this.trackingNumber = trackingNumber;
        this.type = type;
        this.read = false;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRelatedComplaintId() {
        return relatedComplaintId;
    }

    public void setRelatedComplaintId(String relatedComplaintId) {
        this.relatedComplaintId = relatedComplaintId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
