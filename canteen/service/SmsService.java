package com.canteen.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromPhoneNumber;

    @PostConstruct
    public void init() {
        // Only initialize if credentials are properly configured
        if (accountSid != null && !accountSid.equals("your_account_sid_here") &&
            authToken != null && !authToken.equals("your_auth_token_here")) {
            Twilio.init(accountSid, authToken);
        }
    }

    public void sendSms(String toPhoneNumber, String message) {
        try {
            // Check if Twilio is properly configured
            if (accountSid == null || accountSid.equals("your_account_sid_here") ||
                authToken == null || authToken.equals("your_auth_token_here") ||
                fromPhoneNumber == null || fromPhoneNumber.equals("your_twilio_phone_number_here")) {
                
                System.out.println("SMS Service not configured. Message would be sent to " + toPhoneNumber + ": " + message);
                return;
            }

            // Ensure phone number is in correct format
            String formattedPhoneNumber = formatPhoneNumber(toPhoneNumber);
            
            Message twilioMessage = Message.creator(
                    new PhoneNumber(formattedPhoneNumber),
                    new PhoneNumber(fromPhoneNumber),
                    message
            ).create();

            System.out.println("SMS sent successfully. SID: " + twilioMessage.getSid());

        } catch (Exception e) {
            System.err.println("Failed to send SMS: " + e.getMessage());
            throw new RuntimeException("Failed to send SMS notification", e);
        }
    }

    private String formatPhoneNumber(String phoneNumber) {
        // Remove any non-digit characters
        String cleanNumber = phoneNumber.replaceAll("[^0-9]", "");
        
        // Add country code if not present (assuming India +91)
        if (cleanNumber.length() == 10) {
            cleanNumber = "+91" + cleanNumber;
        } else if (cleanNumber.length() == 12 && cleanNumber.startsWith("91")) {
            cleanNumber = "+" + cleanNumber;
        } else if (!cleanNumber.startsWith("+")) {
            cleanNumber = "+" + cleanNumber;
        }
        
        return cleanNumber;
    }

    public void sendOrderReadyNotification(String phoneNumber, Long orderId) {
        String message = String.format(
            "🍽️ Your order #%d is ready for pickup! Please collect it from the Smart Canteen counter. Thank you!",
            orderId
        );
        sendSms(phoneNumber, message);
    }

    public void sendOrderConfirmationNotification(String phoneNumber, Long orderId) {
        String message = String.format(
            "✅ Your order #%d has been confirmed! We'll notify you when it's ready for pickup.",
            orderId
        );
        sendSms(phoneNumber, message);
    }
}
