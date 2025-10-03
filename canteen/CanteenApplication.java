package com.canteen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CanteenApplication {

    public static void main(String[] args) {
        SpringApplication.run(CanteenApplication.class, args);
        System.out.println("\n" + "=".repeat(60));
        System.out.println("🚀 Smart Canteen Backend Started Successfully!");
        System.out.println("🌐 API Base URL: http://localhost:8080/api");
        System.out.println("🗄️ H2 Console: http://localhost:8080/api/h2-console");
        System.out.println("❤️ Health Check: http://localhost:8080/api/health");
        System.out.println("=".repeat(60));
        System.out.println("🔑 Demo Credentials:");
        System.out.println("  👨‍💼 Admin: username='admin', password='admin123'");
        System.out.println("  👤 User: username='user', password='user123'");
        System.out.println("=".repeat(60));
    }

}
