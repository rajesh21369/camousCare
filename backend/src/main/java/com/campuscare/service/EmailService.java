package com.campuscare.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendEmailNotification(String toEmail, String subject, String body) {
        // Development console-based email logging
        logger.info("================== [DEV EMAIL NOTIFICATION] ==================");
        logger.info("To: {}", toEmail);
        logger.info("Subject: {}", subject);
        logger.info("Body:\n{}", body);
        logger.info("==============================================================");
    }
}
