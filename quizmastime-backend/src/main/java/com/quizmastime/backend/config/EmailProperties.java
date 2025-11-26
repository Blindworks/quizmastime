package com.quizmastime.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "mail.from")
@Data
public class EmailProperties {

    /**
     * Email address to use as sender
     */
    private String address;

    /**
     * Name to use as sender
     */
    private String name;
}
