package com.driveinsights;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class DriveInsightsApplication {

    public static void main(String[] args) {
        SpringApplication.run(DriveInsightsApplication.class, args);
    }

    @RestController
    static class HomeController {
        @GetMapping("/")
        public String home() {
            return "Drive Insights API is running!";
        }
    }
} 