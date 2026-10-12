package com.campuscare.service;

import com.campuscare.dto.DashboardStatsDto;
import com.campuscare.model.*;
import com.campuscare.repository.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final FeedbackRepository feedbackRepository;

    public AnalyticsService(ComplaintRepository complaintRepository,
                            DepartmentRepository departmentRepository,
                            ComplaintCategoryRepository categoryRepository,
                            FeedbackRepository feedbackRepository) {
        this.complaintRepository = complaintRepository;
        this.departmentRepository = departmentRepository;
        this.categoryRepository = categoryRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public DashboardStatsDto getDashboardStatistics() {
        List<Complaint> allComplaints = complaintRepository.findAll();
        DashboardStatsDto stats = new DashboardStatsDto();

        stats.setTotalComplaints(allComplaints.size());
        stats.setSubmittedComplaints(allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.SUBMITTED).count());
        stats.setUnderReviewComplaints(allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.UNDER_REVIEW).count());
        stats.setAssignedComplaints(allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.ASSIGNED).count());
        stats.setInProgressComplaints(allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS).count());
        stats.setMoreInfoRequiredComplaints(allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.MORE_INFO_REQUIRED).count());
        stats.setResolvedComplaints(allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED).count());
        stats.setClosedComplaints(allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.CLOSED).count());
        stats.setEscalatedComplaints(allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.ESCALATED).count());
        stats.setRejectedComplaints(allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.REJECTED).count());

        Instant now = Instant.now();
        long overdue = allComplaints.stream()
                .filter(c -> c.getDueDate() != null && c.getDueDate().isBefore(now))
                .filter(c -> c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.CLOSED && c.getStatus() != ComplaintStatus.REJECTED)
                .count();
        stats.setOverdueComplaints(overdue);

        // Average Resolution Hours
        List<Complaint> resolvedList = allComplaints.stream()
                .filter(c -> (c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.CLOSED) && c.getResolutionDate() != null)
                .collect(Collectors.toList());

        if (!resolvedList.isEmpty()) {
            double totalHours = 0;
            for (Complaint c : resolvedList) {
                Duration duration = Duration.between(c.getSubmissionDate() != null ? c.getSubmissionDate() : c.getCreatedAt(), c.getResolutionDate());
                totalHours += Math.max(0, duration.toMinutes() / 60.0);
            }
            stats.setAverageResolutionHours(Math.round((totalHours / resolvedList.size()) * 10.0) / 10.0);
        } else {
            stats.setAverageResolutionHours(0.0);
        }

        // Overall Satisfaction
        List<Feedback> allFeedbacks = feedbackRepository.findAll();
        stats.setTotalFeedbackReceived(allFeedbacks.size());
        if (!allFeedbacks.isEmpty()) {
            double avgRating = allFeedbacks.stream().mapToInt(Feedback::getRating).average().orElse(0.0);
            stats.setOverallSatisfactionRating(Math.round(avgRating * 10.0) / 10.0);
        } else {
            stats.setOverallSatisfactionRating(0.0);
        }

        // Department-wise distribution
        Map<String, Long> deptCounts = new LinkedHashMap<>();
        departmentRepository.findAll().forEach(dept -> {
            long count = allComplaints.stream().filter(c -> dept.getId().equals(c.getDepartmentId())).count();
            deptCounts.put(dept.getName(), count);
        });
        stats.setDepartmentWiseCounts(deptCounts);

        // Category-wise distribution
        Map<String, Long> catCounts = new LinkedHashMap<>();
        categoryRepository.findAll().forEach(cat -> {
            long count = allComplaints.stream().filter(c -> cat.getId().equals(c.getCategoryId())).count();
            catCounts.put(cat.getName(), count);
        });
        stats.setCategoryWiseCounts(catCounts);

        // Status counts map
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (ComplaintStatus st : ComplaintStatus.values()) {
            statusCounts.put(st.name(), allComplaints.stream().filter(c -> c.getStatus() == st).count());
        }
        stats.setStatusWiseCounts(statusCounts);

        // Priority counts map
        Map<String, Long> priorityCounts = new LinkedHashMap<>();
        for (ComplaintPriority p : ComplaintPriority.values()) {
            priorityCounts.put(p.name(), allComplaints.stream().filter(c -> c.getPriority() == p).count());
        }
        stats.setPriorityWiseCounts(priorityCounts);

        // Monthly trends
        stats.setMonthlyTrends(calculateMonthlyTrends(allComplaints));

        return stats;
    }

    private List<DashboardStatsDto.MonthlyTrendDto> calculateMonthlyTrends(List<Complaint> complaints) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy").withZone(ZoneId.systemDefault());
        Map<String, long[]> monthMap = new LinkedHashMap<>();

        // Generate past 6 months keys
        for (int i = 5; i >= 0; i--) {
            Instant monthInstant = Instant.now().minus(i * 30L, java.time.temporal.ChronoUnit.DAYS);
            String key = formatter.format(monthInstant);
            monthMap.put(key, new long[]{0, 0}); // [submitted, resolved]
        }

        for (Complaint c : complaints) {
            if (c.getSubmissionDate() != null) {
                String subMonth = formatter.format(c.getSubmissionDate());
                if (monthMap.containsKey(subMonth)) {
                    monthMap.get(subMonth)[0]++;
                }
            }
            if (c.getResolutionDate() != null) {
                String resMonth = formatter.format(c.getResolutionDate());
                if (monthMap.containsKey(resMonth)) {
                    monthMap.get(resMonth)[1]++;
                }
            }
        }

        List<DashboardStatsDto.MonthlyTrendDto> result = new ArrayList<>();
        monthMap.forEach((month, counts) -> {
            result.add(new DashboardStatsDto.MonthlyTrendDto(month, counts[0], counts[1]));
        });

        return result;
    }
}
