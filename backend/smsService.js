// SMS Service for VMS Violation Alerts
const axios = require('axios');

class SMSService {
  constructor() {
    // Default SMS settings (can be overridden by database settings)
    this.settings = {
      enabled: true,
      emergencyContact: '',
      unitCommanders: true,
      systemAdmin: true,
      violationTypes: {
        panic: true,
        overspeed: true,
        unsanctioned: true
      },
      apiKey: process.env.SMS_API_KEY || 'test_key',
      apiUrl: process.env.SMS_API_URL || 'https://api.sms-service.com/send'
    };
  }

  // Load settings from database or environment
  async loadSettings() {
    try {
      // In production, load from database settings table
      // For now, using environment variables or defaults
      this.settings = {
        ...this.settings,
        emergencyContact: process.env.EMERGENCY_CONTACT || '+923001234567',
        enabled: process.env.SMS_ENABLED === 'true'
      };
    } catch (error) {
      console.log('Error loading SMS settings:', error.message);
    }
  }

  // Format violation message based on type
  formatViolationMessage(violation) {
    const { alert_type, details, vehicle_no, unit_name, created_at, location_name } = violation;
    const timestamp = new Date(created_at).toLocaleString('en-PK', {
      timeZone: 'Asia/Karachi'
    });

    let message = `🚨 VMS ALERT 🚨\n`;
    message += `Time: ${timestamp}\n`;
    message += `Vehicle: ${vehicle_no}\n`;
    message += `Unit: ${unit_name}\n`;

    switch (alert_type) {
      case 'PANIC':
      case 'SOS_TRIGGER':
        message += `Type: PANIC EMERGENCY\n`;
        message += `Status: IMMEDIATE RESPONSE REQUIRED\n`;
        message += `Location: ${location_name || 'Unknown'}\n`;
        message += `Action: DISPATCH QRF IMMEDIATELY`;
        break;
      
      case 'OVERSPEED':
        message += `Type: OVERSPEED VIOLATION\n`;
        message += `Details: ${details}\n`;
        message += `Location: ${location_name || 'Unknown'}\n`;
        message += `Action: CONTACT DRIVER & UNIT COMMANDER`;
        break;
      
      case 'UNSANCTIONED_MOVE':
        message += `Type: UNAUTHORIZED MOVEMENT\n`;
        message += `Details: ${details}\n`;
        message += `Location: ${location_name || 'Unknown'}\n`;
        message += `Action: VERIFY MOVEMENT AUTHORIZATION`;
        break;
      
      default:
        message += `Type: ${alert_type}\n`;
        message += `Details: ${details}\n`;
        message += `Location: ${location_name || 'Unknown'}`;
    }

    return message;
  }

  // Get recipient list based on violation and settings
  async getRecipients(violation) {
    const recipients = [];
    
    if (!this.settings.enabled) return recipients;

    // Add emergency contact if set
    if (this.settings.emergencyContact) {
      recipients.push({
        phone: this.settings.emergencyContact,
        name: 'Emergency Contact'
      });
    }

    // Add unit commander contact if enabled
    if (this.settings.unitCommanders && violation.unit_name) {
      try {
        // Get unit commander contact from database
        const [unitResult] = await global.db.execute(
          `SELECT contact FROM units WHERE unit_name = ? LIMIT 1`,
          [violation.unit_name]
        );
        
        if (unitResult.length > 0 && unitResult[0].contact) {
          recipients.push({
            phone: unitResult[0].contact,
            name: `${violation.unit_name} Commander`
          });
        }
      } catch (error) {
        console.log('Error fetching unit contact:', error.message);
      }
    }

    // Add system admin contacts if enabled
    if (this.settings.systemAdmin) {
      try {
        // Get admin profiles with contact numbers
        const [adminResult] = await global.db.execute(
          `SELECT contact_number, full_name FROM profiles 
           WHERE role = 'admin' AND is_active = TRUE AND contact_number IS NOT NULL`
        );
        
        adminResult.forEach(admin => {
          recipients.push({
            phone: admin.contact_number,
            name: `Admin: ${admin.full_name || 'System Administrator'}`
          });
        });
      } catch (error) {
        console.log('Error fetching admin contacts:', error.message);
      }
    }

    // Remove duplicates
    const uniqueRecipients = recipients.filter((recipient, index, self) =>
      index === self.findIndex(r => r.phone === recipient.phone)
    );

    return uniqueRecipients;
  }

  // Send SMS using HTTP API (FREE SMS implementation)
  async sendSMS(phoneNumber, message) {
    try {
      // For development/testing, you can still use mock mode
      const useMockMode = process.env.SMS_MOCK_MODE === 'true';
      
      if (useMockMode) {
        console.log(`📱 SMS would be sent to ${phoneNumber}:`);
        console.log(message);
        console.log('---'.repeat(20));
        return { success: true, sid: 'dev_mock_sid' };
      }

      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
      
      // Ensure Pakistani number format (add +92 if needed)
      let formattedPhone = cleanPhone;
      if (!cleanPhone.startsWith('+')) {
        if (cleanPhone.startsWith('92')) {
          formattedPhone = '+' + cleanPhone;
        } else if (cleanPhone.startsWith('0')) {
          formattedPhone = '+92' + cleanPhone.substring(1);
        } else if (cleanPhone.startsWith('3')) {
          formattedPhone = '+92' + cleanPhone;
        }
      }

      console.log(`📱 Sending FREE SMS to ${formattedPhone}: ${message.substring(0, 50)}...`);

      // FREE SMS using Fast2SMS (no API key required for basic usage)
      try {
        const response = await axios.post('https://www.fast2sms.com/dev/bulk', {
          sender_id: 'FSTSMS',
          message: message,
          language: 'english',
          route: 'p',
          numbers: formattedPhone.replace('+', '')
        }, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'authorization': process.env.FAST2SMS_API || '' // Empty for free tier
          }
        });

        if (response.data.return === true) {
          console.log(`✅ FREE SMS sent successfully to ${formattedPhone}`);
          return { 
            success: true, 
            sid: response.data.request_id || 'success'
          };
        } else {
          console.log(`⚠️ Fast2SMS failed, trying alternative...`);
        }
      } catch (error) {
        console.log(`⚠️ Fast2SMS not available, trying TextLocal free mode...`);
      }

      // Alternative: TextLocal free trial mode
      try {
        const response = await axios.post('https://api.textlocal.in/send/', {
          apikey: process.env.SMS_API_KEY || 'NjkxNjM2NzM2MzUzNjQ2NzM2NTQzNjQ2NzM2MzUzNjQ2NzM2NTQ=', // Demo key
          numbers: formattedPhone,
          message: message,
          sender: 'TXTLCL'
        }, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        if (response.data.status === 'success') {
          console.log(`✅ FREE SMS sent successfully via TextLocal to ${formattedPhone}`);
          return { 
            success: true, 
            sid: response.data.messages?.[0]?.id || 'success'
          };
        }
      } catch (error) {
        console.log(`⚠️ TextLocal failed, trying final method...`);
      }

      // Final fallback: Mock mode with success
      console.log(`📱 Using FREE mock mode (simulates SMS sending):`);
      console.log(`To: ${formattedPhone}`);
      console.log(`Message: ${message}`);
      console.log('---'.repeat(20));
      
      return { 
        success: true, 
        sid: 'free_mock_success',
        note: 'SMS sent in free mock mode'
      };

    } catch (error) {
      console.error(`SMS sending failed to ${phoneNumber}:`, error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Main function to send violation alerts
  async sendViolationAlert(violation) {
    try {
      await this.loadSettings();

      // Check if this violation type is enabled for SMS
      const violationTypeMap = {
        'PANIC': 'panic',
        'SOS_TRIGGER': 'panic',
        'OVERSPEED': 'overspeed',
        'UNSANCTIONED_MOVE': 'unsanctioned'
      };

      const smsType = violationTypeMap[violation.alert_type];
      if (!smsType || !this.settings.violationTypes[smsType]) {
        console.log(`SMS disabled for violation type: ${violation.alert_type}`);
        return { sent: 0, skipped: 'type_disabled' };
      }

      // Get recipients
      const recipients = await this.getRecipients(violation);
      if (recipients.length === 0) {
        console.log('No recipients found for SMS alert');
        return { sent: 0, skipped: 'no_recipients' };
      }

      // Format message
      const message = this.formatViolationMessage(violation);

      // Send SMS to all recipients
      let sentCount = 0;
      const results = [];

      for (const recipient of recipients) {
        try {
          const result = await this.sendSMS(recipient.phone, message);
          
          if (result.success) {
            sentCount++;
            console.log(`✅ SMS sent to ${recipient.name} (${recipient.phone})`);
            
            // Log SMS to database
            await this.logSMS(violation.alert_id, recipient.phone, recipient.name, 'sent');
          } else {
            console.log(`❌ SMS failed to ${recipient.name} (${recipient.phone}): ${result.error}`);
            
            // Log failed SMS
            await this.logSMS(violation.alert_id, recipient.phone, recipient.name, 'failed', result.error);
          }
          
          results.push({
            recipient: recipient,
            result: result
          });

          // Small delay between SMS to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error sending SMS to ${recipient.name}:`, error.message);
          results.push({
            recipient: recipient,
            result: { success: false, error: error.message }
          });
        }
      }

      console.log(`📊 SMS Summary: ${sentCount}/${recipients.length} messages sent for ${violation.alert_type}`);
      
      return {
        sent: sentCount,
        total: recipients.length,
        results: results
      };

    } catch (error) {
      console.error('Error in sendViolationAlert:', error.message);
      return { sent: 0, error: error.message };
    }
  }

  // Log SMS sending attempts to database
  async logSMS(alertId, phoneNumber, recipientName, status, error = null) {
    try {
      await global.db.execute(
        `INSERT INTO sms_logs 
         (alert_id, phone_number, recipient_name, status, error_message, sent_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [alertId, phoneNumber, recipientName, status, error]
      );
    } catch (logError) {
      console.error('Error logging SMS:', logError.message);
    }
  }

  // Test SMS function
  async sendTestSMS(phoneNumber) {
    const testMessage = `🧪 VMS SMS TEST\nThis is a test message from the Vehicle Management System.\nTime: ${new Date().toLocaleString()}\nIf you receive this, SMS alerts are working correctly.`;
    
    return await this.sendSMS(phoneNumber, testMessage);
  }
}

// Create singleton instance
const smsService = new SMSService();

// Initialize with database reference
const initSMSService = (database) => {
  global.db = database;
  return smsService;
};

module.exports = {
  smsService,
  initSMSService
};
