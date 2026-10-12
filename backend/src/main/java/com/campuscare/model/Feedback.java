package com.campuscare.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "feedback")
public class Feedback {

    @Id
    private String id;

    @Indexed(unique = true)
    private String complaintId;

    private String trackingNumber;

    @Indexed
    private String studentId;

    private String studentName;

    private int rating; // 1 to 5

    private String comment;

    private String satisfactionCategory; // e.g. "Timeliness", "Quality of Work", "Communication", "Overall"

    private Instant createdAt = Instant.now();

    public Feedback() {
    }

    public Feedback(String complaintId, String trackingNumber, String studentId, String studentName,
                    int rating, String comment, String satisfactionCategory) {
        this.complaintId = complaintId;
        this.trackingNumber = trackingNumber;
        this.studentId = studentId;
        this.studentName = studentName;
        this.rating = rating;
        this.comment = comment;
        this.satisfactionCategory = satisfactionCategory;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(String complaintId) {
        this.complaintId = complaintId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getSatisfactionCategory() {
        return satisfactionCategory;
    }

    public void setSatisfactionCategory(String satisfactionCategory) {
        this.satisfactionCategory = satisfactionCategory;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
