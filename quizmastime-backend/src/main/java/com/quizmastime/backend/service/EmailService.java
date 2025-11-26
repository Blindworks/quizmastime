package com.quizmastime.backend.service;

import com.quizmastime.backend.config.EmailProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailProperties emailProperties;

    /**
     * Sends a simple text email
     *
     * @param to      Recipient email address
     * @param subject Email subject
     * @param text    Email body (plain text)
     */
    public void sendSimpleEmail(String to, String subject, String text) {
        log.info("Sending simple email to: {}", to);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(emailProperties.getAddress());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            log.info("Simple email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Error sending simple email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Sends an HTML email
     *
     * @param to       Recipient email address
     * @param subject  Email subject
     * @param htmlBody Email body (HTML content)
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        log.info("Sending HTML email to: {}", to);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(emailProperties.getAddress(), emailProperties.getName());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates HTML

            mailSender.send(mimeMessage);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Error sending HTML email to: {}", to, e);
            throw new RuntimeException("Failed to send HTML email", e);
        } catch (Exception e) {
            log.error("Error sending HTML email to: {}", to, e);
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    /**
     * Sends an email with both text and HTML content
     *
     * @param to       Recipient email address
     * @param subject  Email subject
     * @param text     Plain text version
     * @param htmlBody HTML version
     */
    public void sendMultipartEmail(String to, String subject, String text, String htmlBody) {
        log.info("Sending multipart email to: {}", to);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(emailProperties.getAddress(), emailProperties.getName());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, htmlBody); // text version, HTML version

            mailSender.send(mimeMessage);
            log.info("Multipart email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Error sending multipart email to: {}", to, e);
            throw new RuntimeException("Failed to send multipart email", e);
        } catch (Exception e) {
            log.error("Error sending multipart email to: {}", to, e);
            throw new RuntimeException("Failed to send multipart email", e);
        }
    }
}
