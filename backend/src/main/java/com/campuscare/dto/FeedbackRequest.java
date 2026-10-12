package com.campuscare.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FeedbackRequest {

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @NotBlank(message = "Feedback comment is required")
    private String comment;

    private String satisfactionCategory = "Overall";

    public FeedbackRequest() {
    }

    public FeedbackRequest(Integer rating, String comment, String satisfactionCategory) {
        this.rating = rating;
        this.comment = comment;
        this.satisfactionCategory = satisfactionCategory;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
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
}
