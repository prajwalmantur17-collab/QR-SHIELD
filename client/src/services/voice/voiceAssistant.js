import api from '../../api/client';

export const LANGUAGES = [
  { id: 'en', label: 'English', native: 'English', code: 'en-IN' },
  { id: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', code: 'kn-IN' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी', code: 'hi-IN' }
];

export const ANNOUNCEMENT_TEXTS = {
  en: {
    safe: "Your QR code has been scanned successfully. The destination appears safe. You can proceed.",
    suspicious: "Warning! This QR code leads to a potentially suspicious website. Please verify the destination before proceeding.",
    dangerous: "Security alert! A potentially dangerous website has been detected. We strongly recommend that you do not open this link.",
    failed: "Sorry, we couldn't complete the security analysis. Please try scanning again."
  },
  kn: {
    safe: "ನಿಮ್ಮ QR ಕೋಡ್ ಯಶಸ್ವಿಯಾಗಿ ಸ್ಕ್ಯಾನ್ ಆಗಿದೆ. ಈ ವೆಬ್ಸೈಟ್ ಸುರಕ್ಷಿತವಾಗಿ ಕಾಣುತ್ತಿದೆ. ನೀವು ಮುಂದುವರಿಯಬಹುದು.",
    suspicious: "ಎಚ್ಚರಿಕೆ! ಈ QR ಕೋಡ್ ಅನುಮಾನಾಸ್ಪದ ವೆಬ್ಸೈಟ್ಗೆ ಕರೆದೊಯ್ಯಬಹುದು. ಮುಂದುವರಿಯುವ ಮೊದಲು ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.",
    dangerous: "ಭದ್ರತಾ ಎಚ್ಚರಿಕೆ! ಅಪಾಯಕಾರಿ ವೆಬ್ಸೈಟ್ ಪತ್ತೆಯಾಗಿದೆ. ಈ ಲಿಂಕ್ ತೆರೆಯದಂತೆ ನಾವು ಬಲವಾಗಿ ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ.",
    failed: "ಕ್ಷಮಿಸಿ, ಭದ್ರತಾ ಪರಿಶೀಲನೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ."
  },
  hi: {
    safe: "आपका QR कोड सफलतापूर्वक स्कैन हो गया है। यह वेबसाइट सुरक्षित दिखाई देती है। आप आगे बढ़ सकते हैं।",
    suspicious: "चेतावनी! यह QR कोड किसी संदिग्ध वेबसाइट पर ले जा सकता है। आगे बढ़ने से पहले कृपया इसकी जाँच करें।",
    dangerous: "सुरक्षा चेतावनी! एक संभावित खतरनाक वेबसाइट का पता चला है। हम इस लिंक को न खोलने की सलाह देते हैं।",
    failed: "क्षमा करें, सुरक्षा जाँच पूरी नहीं हो सकी। कृपया दोबारा स्कैन करें।"
  }
};

class VoiceAssistantService {
  constructor() {
    this.language = localStorage.getItem('qrshield_voice_lang') || 'en';
    this.enabled = localStorage.getItem('qrshield_voice_enabled') !== 'false';
    this.muted = localStorage.getItem('qrshield_voice_muted') === 'true';
    this.volume = parseFloat(localStorage.getItem('qrshield_voice_volume') || '1.0');

    this.audioElement = null;
    this.audioCache = new Map(); // key -> objectUrl or dataUri
    this.currentText = '';
    this.currentResultType = null;
    this.lastAnnouncedKey = null;
    this.state = 'ready'; // 'ready' | 'generating' | 'speaking' | 'paused' | 'completed' | 'error'
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => this.subscribers.delete(callback);
  }

  notify() {
    const currentState = this.getState();
    this.subscribers.forEach(cb => {
      try { cb(currentState); } catch (e) { console.warn(e); }
    });
  }

  getState() {
    return {
      language: this.language,
      enabled: this.enabled,
      muted: this.muted,
      volume: this.volume,
      state: this.state,
      currentText: this.currentText,
      currentResultType: this.currentResultType
    };
  }

  setLanguage(newLang) {
    if (!['en', 'kn', 'hi'].includes(newLang)) return;
    const oldLang = this.language;
    this.language = newLang;
    localStorage.setItem('qrshield_voice_lang', newLang);

    const langName = LANGUAGES.find(l => l.id === newLang)?.native || newLang;
    this.logActivity(`Language changed to ${langName}`);

    // If currently playing or showing text, update transcript
    if (this.currentResultType && ANNOUNCEMENT_TEXTS[newLang]?.[this.currentResultType]) {
      this.currentText = ANNOUNCEMENT_TEXTS[newLang][this.currentResultType];
    }

    this.notify();

    // If was actively speaking, replay immediately in newly chosen language
    if (this.state === 'speaking' || this.state === 'generating') {
      this.stop();
      if (this.currentResultType) {
        this.announce(this.currentResultType, null, true);
      }
    }
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
    localStorage.setItem('qrshield_voice_enabled', String(this.enabled));
    if (!this.enabled) {
      this.stop();
    }
    this.notify();
  }

  setMuted(val) {
    this.muted = Boolean(val);
    localStorage.setItem('qrshield_voice_muted', String(this.muted));
    if (this.audioElement) {
      this.audioElement.muted = this.muted;
    }
    if (this.muted && this.state === 'speaking') {
      this.stop();
    }
    this.notify();
  }

  setVolume(vol) {
    const v = Math.max(0, Math.min(1, vol));
    this.volume = v;
    localStorage.setItem('qrshield_voice_volume', String(v));
    if (this.audioElement) {
      this.audioElement.volume = v;
    }
    this.notify();
  }

  // Stop any active audio / speech synthesis
  stop() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (_) {}
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    if (this.state === 'speaking' || this.state === 'generating' || this.state === 'paused') {
      this.state = 'ready';
      this.notify();
    }
  }

  pause() {
    if (this.state === 'speaking') {
      if (this.audioElement && !this.audioElement.paused) {
        this.audioElement.pause();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
      }
      this.state = 'paused';
      this.notify();
    }
  }

  resume() {
    if (this.state === 'paused') {
      if (this.audioElement && this.audioElement.paused) {
        this.audioElement.play().catch(() => {});
      } else if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      this.state = 'speaking';
      this.notify();
    }
  }

  // Announce security scan result
  async announce(resultType, scanHash = null, forceReplay = false) {
    if (!this.enabled || this.muted) return;

    // Normalization: 'safe' | 'suspicious' | 'dangerous' | 'failed'
    const normalizedType = ['safe', 'suspicious', 'dangerous', 'failed'].includes(resultType)
      ? resultType
      : 'safe';

    // Prevent duplicate announcement for identical scan unless forced
    const dedupeKey = `${scanHash || 'scan'}_${normalizedType}_${this.language}`;
    if (!forceReplay && scanHash && this.lastAnnouncedKey === dedupeKey) {
      return;
    }
    this.lastAnnouncedKey = dedupeKey;

    this.stop();
    this.currentResultType = normalizedType;
    this.currentText = ANNOUNCEMENT_TEXTS[this.language]?.[normalizedType] || '';
    this.state = 'generating';
    this.notify();

    // Log event to Recent Activity
    const typeLabel = normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);
    this.logActivity(`QR scanned – ${typeLabel} result announced`);

    try {
      const cacheKey = `${this.language}_${normalizedType}`;
      let audioUrl = this.audioCache.get(cacheKey);

      if (!audioUrl) {
        const res = await api.post('/voice/announce', {
          language: this.language,
          resultType: normalizedType
        });

        if (res.data?.audioBase64) {
          audioUrl = `data:audio/mpeg;base64,${res.data.audioBase64}`;
          this.audioCache.set(cacheKey, audioUrl);
        } else if (res.data?.fallback) {
          // ElevenLabs unavailable or not configured: trigger Web Speech API fallback
          this.speakBrowserSpeech(this.currentText, this.language);
          return;
        }
      }

      if (audioUrl) {
        this.playAudioSource(audioUrl);
      } else {
        this.speakBrowserSpeech(this.currentText, this.language);
      }
    } catch (err) {
      console.warn('[Voice Assistant] ElevenLabs API error, falling back to browser speech:', err);
      this.speakBrowserSpeech(this.currentText, this.language);
    }
  }

  playAudioSource(src) {
    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
      }

      this.audioElement.src = src;
      this.audioElement.volume = this.volume;
      this.audioElement.muted = this.muted;

      this.audioElement.onplay = () => {
        this.state = 'speaking';
        this.notify();
      };

      this.audioElement.onended = () => {
        this.state = 'completed';
        this.notify();
      };

      this.audioElement.onerror = (e) => {
        console.warn('[Voice Assistant] Audio element error, attempting speech synthesis fallback:', e);
        this.speakBrowserSpeech(this.currentText, this.language);
      };

      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn('[Voice Assistant] Playback blocked by browser autoplay policy:', e);
          this.speakBrowserSpeech(this.currentText, this.language);
        });
      }
    } catch (err) {
      this.speakBrowserSpeech(this.currentText, this.language);
    }
  }

  // High-fidelity client-side Speech Synthesis fallback
  speakBrowserSpeech(text, lang) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.state = 'completed';
      this.notify();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;
      utterance.rate = 0.95; // slightly slower, natural cadence
      utterance.pitch = 1.0;

      // Select appropriate language tag
      const langConfig = LANGUAGES.find(l => l.id === lang);
      utterance.lang = langConfig?.code || 'en-IN';

      // Pick matching Indian or native voice if present
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchingVoice = voices.find(v => 
          v.lang === utterance.lang || 
          v.lang.startsWith(lang) || 
          (lang === 'kn' && /kannada/i.test(v.name)) ||
          (lang === 'hi' && /hindi/i.test(v.name))
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        this.state = 'speaking';
        this.notify();
      };

      utterance.onend = () => {
        this.state = 'completed';
        this.notify();
      };

      utterance.onerror = (err) => {
        console.warn('[Voice Assistant] Speech synthesis error:', err);
        this.state = 'completed';
        this.notify();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      this.state = 'error';
      this.notify();
    }
  }

  replay() {
    if (this.currentResultType) {
      this.logActivity('Voice announcement played');
      this.announce(this.currentResultType, null, true);
    }
  }

  // Record voice events in the local Recent Activity store
  logActivity(title) {
    try {
      const stored = localStorage.getItem('qrshield_voice_activity');
      const list = stored ? JSON.parse(stored) : [];
      const newEntry = {
        id: 'voice_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        title,
        language: this.language,
        timestamp: new Date().toISOString()
      };
      const updated = [newEntry, ...list.slice(0, 19)];
      localStorage.setItem('qrshield_voice_activity', JSON.stringify(updated));

      // Dispatch custom storage event so other components update reactively
      window.dispatchEvent(new Event('qrshield_voice_activity_updated'));
    } catch (_) {}
  }

  getActivityLogs() {
    try {
      const stored = localStorage.getItem('qrshield_voice_activity');
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  }

  clearActivityLogs() {
    localStorage.removeItem('qrshield_voice_activity');
    window.dispatchEvent(new Event('qrshield_voice_activity_updated'));
  }
}

// Global Singleton Instance
export const voiceAssistant = new VoiceAssistantService();
export default voiceAssistant;
