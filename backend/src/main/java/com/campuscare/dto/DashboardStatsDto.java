package com.campuscare.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {

    private long totalComplaints;
    private long submittedComplaints;
    private long underReviewComplaints;
    private long assignedComplaints;
    private long inProgressComplaints;
    private long moreInfoRequiredComplaints;
    private long resolvedComplaints;
    private long closedComplaints;
    private long overdueComplaints;
    private long escalatedComplaints;
    private long rejectedComplaints;

    private double averageResolutionHours;
    private double overallSatisfactionRating; // Out of 5.0
    private long totalFeedbackReceived;

    private Map<String, Long> departmentWiseCounts;
    private Map<String, Long> categoryWiseCounts;
    private Map<String, Long> statusWiseCounts;
    private Map<String, Long> priorityWiseCounts;

    private List<MonthlyTrendDto> monthlyTrends;

    public static class MonthlyTrendDto {
        private String month; // e.g., "2026-05" or "May 2026"
        private long submitted;
        private long resolved;

        public MonthlyTrendDto() {
        }

        public MonthlyTrendDto(String month, long submitted, long resolved) {
            this.month = month;
            this.submitted = submitted;
            this.resolved = resolved;
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public long getSubmitted() {
            return submitted;
        }

        public void setSubmitted(long submitted) {
            this.submitted = submitted;
        }

        public long getResolved() {
            return resolved;
        }

        public void setResolved(long resolved) {
            this.resolved = resolved;
        }
    }

    public DashboardStatsDto() {
    }

    public long getTotalComplaints() {
        return totalComplaints;
    }

    public void setTotalComplaints(long totalComplaints) {
        this.totalComplaints = totalComplaints;
    }

    public long getSubmittedComplaints() {
        return submittedComplaints;
    }

    public void setSubmittedComplaints(long submittedComplaints) {
        this.submittedComplaints = submittedComplaints;
    }

    public long getUnderReviewComplaints() {
        return underReviewComplaints;
    }

    public void setUnderReviewComplaints(long underReviewComplaints) {
        this.underReviewComplaints = underReviewComplaints;
    }

    public long getAssignedComplaints() {
        return assignedComplaints;
    }

    public void setAssignedComplaints(long assignedComplaints) {
        this.assignedComplaints = assignedComplaints;
    }

    public long getInProgressComplaints() {
        return inProgressComplaints;
    }

    public void setInProgressComplaints(long inProgressComplaints) {
        this.inProgressComplaints = inProgressComplaints;
    }

    public long getMoreInfoRequiredComplaints() {
        return moreInfoRequiredComplaints;
    }

    public void setMoreInfoRequiredComplaints(long moreInfoRequiredComplaints) {
        this.moreInfoRequiredComplaints = moreInfoRequiredComplaints;
    }

    public long getResolvedComplaints() {
        return resolvedComplaints;
    }

    public void setResolvedComplaints(long resolvedComplaints) {
        this.resolvedComplaints = resolvedComplaints;
    }

    public long getClosedComplaints() {
        return closedComplaints;
    }

    public void setClosedComplaints(long closedComplaints) {
        this.closedComplaints = closedComplaints;
    }

    public long getOverdueComplaints() {
        return overdueComplaints;
    }

    public void setOverdueComplaints(long overdueComplaints) {
        this.overdueComplaints = overdueComplaints;
    }

    public long getEscalatedComplaints() {
        return escalatedComplaints;
    }

    public void setEscalatedComplaints(long escalatedComplaints) {
        this.escalatedComplaints = escalatedComplaints;
    }

    public long getRejectedComplaints() {
        return rejectedComplaints;
    }

    public void setRejectedComplaints(long rejectedComplaints) {
        this.rejectedComplaints = rejectedComplaints;
    }

    public double getAverageResolutionHours() {
        return averageResolutionHours;
    }

    public void setAverageResolutionHours(double averageResolutionHours) {
        this.averageResolutionHours = averageResolutionHours;
    }

    public double getOverallSatisfactionRating() {
        return overallSatisfactionRating;
    }

    public void setOverallSatisfactionRating(double overallSatisfactionRating) {
        this.overallSatisfactionRating = overallSatisfactionRating;
    }

    public long getTotalFeedbackReceived() {
        return totalFeedbackReceived;
    }

    public void setTotalFeedbackReceived(long totalFeedbackReceived) {
        this.totalFeedbackReceived = totalFeedbackReceived;
    }

    public Map<String, Long> getDepartmentWiseCounts() {
        return departmentWiseCounts;
    }

    public void setDepartmentWiseCounts(Map<String, Long> departmentWiseCounts) {
        this.departmentWiseCounts = departmentWiseCounts;
    }

    public Map<String, Long> getCategoryWiseCounts() {
        return categoryWiseCounts;
    }

    public void setCategoryWiseCounts(Map<String, Long> categoryWiseCounts) {
        this.categoryWiseCounts = categoryWiseCounts;
    }

    public Map<String, Long> getStatusWiseCounts() {
        return statusWiseCounts;
    }

    public void setStatusWiseCounts(Map<String, Long> statusWiseCounts) {
        this.statusWiseCounts = statusWiseCounts;
    }

    public Map<String, Long> getPriorityWiseCounts() {
        return priorityWiseCounts;
    }

    public void setPriorityWiseCounts(Map<String, Long> priorityWiseCounts) {
        this.priorityWiseCounts = priorityWiseCounts;
    }

    public List<MonthlyTrendDto> getMonthlyTrends() {
        return monthlyTrends;
    }

    public void setMonthlyTrends(List<MonthlyTrendDto> monthlyTrends) {
        this.monthlyTrends = monthlyTrends;
    }
}
