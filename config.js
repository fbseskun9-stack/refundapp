// config.js
var CONFIG = {
    TELEGRAM_BOT_TOKEN:'8161644789:AAGUDo2trAIuLL5MSDOWF6_3XEYXc1hvT8k', // Ganti dengan token asli
    TELEGRAM_CHAT_ID: '8494965854', // Ganti dengan chat ID asli
    TELEGRAM_RETRY_ATTEMPTS: 3,
    TELEGRAM_RETRY_DELAY_MS: 1000,
    
    // SMS API Configuration - Pilih salah satu provider
    SMS_PROVIDER: 'FONNTE', // Options: 'FONNTE', 'ZENZIVA', 'TWILIO', 'VONAGE'
    
    // FONNTE Configuration (Indonesian SMS Gateway)
    FONNTE_TOKEN: 'YOUR_FONNTE_TOKEN_HERE', // Dapatkan dari https://fonnte.com
    
    // ZENZIVA Configuration (Indonesian SMS Gateway)
    ZENZIVA_USERKEY: 'YOUR_ZENZIVA_USERKEY',
    ZENZIVA_PASSKEY: 'YOUR_ZENZIVA_PASSKEY',
    
    // TWILIO Configuration (International)
    TWILIO_ACCOUNT_SID: 'YOUR_TWILIO_ACCOUNT_SID',
    TWILIO_AUTH_TOKEN: 'YOUR_TWILIO_AUTH_TOKEN',
    TWILIO_PHONE_NUMBER: 'YOUR_TWILIO_PHONE', // Format: +1234567890
    
    // VONAGE (Nexmo) Configuration (International)
    VONAGE_API_KEY: 'YOUR_VONAGE_API_KEY',
    VONAGE_API_SECRET: 'YOUR_VONAGE_API_SECRET',
    VONAGE_FROM_NUMBER: 'YOUR_VONAGE_FROM_NUMBER',
    
    // OTP Settings
    OTP_LENGTH: 6,
    OTP_EXPIRY_MINUTES: 5
};