package com.campuscare.service;

import com.campuscare.model.Notification;
import com.campuscare.model.User;
import com.campuscare.repository.NotificationRepository;
import com.campuscare.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public Notification createNotification(String userId, String title, String message,
                                           String relatedComplaintId, String trackingNumber, String type) {
        Notification notification = new Notification(userId, title, message, relatedComplaintId, trackingNumber, type);
        Notification saved = notificationRepository.save(notification);

        // Dev console email logging if user has an email
        userRepository.findById(userId).ifPresent(user -> {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                String emailBody = String.format("Hello %s,\n\n%s\n\nComplaint Reference: %s\n\nBest regards,\nCampusCare Team",
                        user.getFullName(), message, trackingNumber != null ? trackingNumber : "N/A");
                emailService.sendEmailNotification(user.getEmail(), "CampusCare Update: " + title, emailBody);
            }
        });

        return saved;
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
