// Beep sound utility for alerts - USING ASSET AUDIO FILE
// Note: Make sure panic.mp3 is placed in src/assets/sounds/ directory

let panicSound = null;
try {
  panicSound = require('../assets/sounds/panic.wav');
} catch (error) {
  console.log('[BEEP] panic.wav not found in assets/sounds/, using fallback');
}

export const playBeep = (type = 'alert') => {
  try {
    if (panicSound) {
      // Use the actual panic.mp3 file from assets
      const audio = new Audio(panicSound);
      
      // Set moderate volume - not too loud to prevent system alerts
      audio.volume = 0.3;
      
      // Preload the audio to prevent loading delays
      audio.preload = 'auto';
      
      // Play with user interaction context to prevent prompts
      // Use a promise to handle autoplay policies gracefully
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[BEEP] Audio played successfully');
          })
          .catch((error) => {
            console.log('[BEEP] Audio play failed:', error.message);
          });
      }
    } else {
      // Fallback if audio file not found
      console.log('[BEEP] Audio file not available');
    }
    
  } catch (error) {
    console.log('[BEEP] Audio error:', error.message);
  }
};

// Visual fallback for when audio fails
const showVisualAlert = (type = 'alert') => {
  try {
    if (type === 'panic') {
      // Flash the page border for panic alerts
      document.body.style.transition = 'border 0.1s';
      document.body.style.border = '3px solid #dc3545';
      setTimeout(() => {
        document.body.style.border = '';
      }, 200);
    } else if (type === 'overspeed') {
      // Flash yellow for overspeed
      document.body.style.transition = 'border 0.1s';
      document.body.style.border = '3px solid #ffc107';
      setTimeout(() => {
        document.body.style.border = '';
      }, 200);
    }
  } catch (error) {
    // Silent fallback
  }
};

// Continuous beep for critical alerts - USING ASSET AUDIO
export const startContinuousBeep = (type = 'panic') => {
  let intervalId;
  let beepCount = 0;
  const maxBeeps = 5; // Limited beeps to prevent annoyance
  
  const beep = () => {
    playBeep(type);
    beepCount++;
    
    if (beepCount >= maxBeeps) {
      clearInterval(intervalId);
    }
  };
  
  // Start immediate audio alert
  beep();
  
  // Continue audio alerts every 2 seconds
  intervalId = setInterval(beep, 2000);
  
  return intervalId;
};

// Stop continuous beep
export const stopContinuousBeep = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};

// Enhanced silent notification using visual feedback along with audio
export const showSilentNotification = (type = 'alert', message = '') => {
  try {
    // Remove any existing notifications first
    const existingNotifications = document.querySelectorAll('.silent-notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create a visual notification to accompany audio
    const notification = document.createElement('div');
    notification.className = 'silent-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'panic' ? '#dc3545' : type === 'overspeed' ? '#ffc107' : '#17a2b8'};
      color: white;
      padding: 12px 18px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      opacity: 0;
      transition: all 0.3s ease;
      font-family: system-ui, -apple-system, sans-serif;
      border-left: 4px solid ${type === 'panic' ? '#a02522' : type === 'overspeed' ? '#e0a800' : '#138496'};
    `;
    
    const icon = type === 'panic' ? '🚨' : type === 'overspeed' ? '⚠️' : '📢';
    const audioText = type === 'panic' ? ' (Sound Alert)' : ' (Alert)';
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">${icon}</span>
        <span>${message || `${type.toUpperCase()} Alert`}${audioText}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(20px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
    
  } catch (error) {
    // Silent fallback
  }
};
