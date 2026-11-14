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

const DEFAULT_ELEVENLABS_KEY = 'sk_0bcfe5f407f9ec46661ee3ec51d11f08bb127c3e7e71f134';
const DEFAULT_VOICE_ID = 'lGMJWfnL2SVUwU7i6zQ7';

function base64ToBlobUrl(base64, mimeType = 'audio/mpeg') {
  try {
    const binStr = atob(base64);
    const len = binStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (e) {
    return `data:${mimeType};base64,${base64}`;
  }
}

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
    this.engine = 'elevenlabs'; // 'elevenlabs' | 'browser_fallback'
    this.subscribers = new Set();

    // Auto-unlock audio permission on user's first interaction
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        try {
          if (!this.audioElement) {
            this.audioElement = new Audio();
          }
          // Resume Web Audio Context if suspended
          if (window.AudioContext || window.webkitAudioContext) {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();
          }
        } catch (_) {}
      };
      window.addEventListener('click', unlockAudio, { once: true, passive: true });
      window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
      window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    }
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
      engine: this.engine,
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

    // Prefetch common announcements for newly chosen language in background
    this.prefetchAnnouncements(newLang);

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

  // Helper to fetch direct from ElevenLabs if backend route is unavailable or offline
  async fetchDirectElevenLabs(text) {
    const directKey = (import.meta.env.VITE_ELEVENLABS_API_KEY || DEFAULT_ELEVENLABS_KEY || '').trim();
    const voiceId = (import.meta.env.VITE_ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID || '').trim();

    if (!directKey || directKey === 'your_elevenlabs_api_key_here') {
      return null;
    }

    try {
      const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': directKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!resp.ok) {
        console.warn('[Voice Assistant] Direct ElevenLabs status:', resp.status);
        return null;
      }

      const blob = await resp.blob();
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn('[Voice Assistant] Direct ElevenLabs fetch error:', e);
      return null;
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
        // 1. Try Backend API first (with server cache)
        try {
          const res = await api.post('/voice/announce', {
            language: this.language,
            resultType: normalizedType
          });

          if (res.data?.audioBase64) {
            audioUrl = base64ToBlobUrl(res.data.audioBase64, res.data.mimeType || 'audio/mpeg');
            this.audioCache.set(cacheKey, audioUrl);
            this.engine = 'elevenlabs';
          }
        } catch (apiErr) {
          console.warn('[Voice Assistant] Backend voice endpoint unreachable/404, using direct ElevenLabs fallback...');
        }

        // 2. Direct ElevenLabs Client Fallback if backend was offline or didn't return audio
        if (!audioUrl) {
          audioUrl = await this.fetchDirectElevenLabs(this.currentText);
          if (audioUrl) {
            this.audioCache.set(cacheKey, audioUrl);
            this.engine = 'elevenlabs';
          }
        }
      }

      if (audioUrl) {
        this.engine = 'elevenlabs';
        this.playAudioSource(audioUrl);
      } else {
        this.engine = 'browser_fallback';
        this.speakBrowserSpeech(this.currentText, this.language);
      }
    } catch (err) {
      console.warn('[Voice Assistant] Voice generation failed, using browser speech:', err);
      this.engine = 'browser_fallback';
      this.speakBrowserSpeech(this.currentText, this.language);
    }
  }

  playAudioSource(src) {
    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
      }

      // Stop any existing playback and reset playhead
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (_) {}

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
        this.engine = 'browser_fallback';
        this.speakBrowserSpeech(this.currentText, this.language);
      };

      this.audioElement.load();
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.state = 'speaking';
            this.notify();
          })
          .catch((e) => {
            console.warn('[Voice Assistant] Playback blocked by browser autoplay policy, attempting speech synthesis:', e);
            this.engine = 'browser_fallback';
            this.speakBrowserSpeech(this.currentText, this.language);
          });
      }
    } catch (err) {
      this.engine = 'browser_fallback';
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
    const targetType = this.currentResultType || 'safe';
    this.logActivity(`Voice announcement replayed (${targetType})`);
    this.announce(targetType, null, true);
  }

  playPreview(resultType = 'safe') {
    this.logActivity(`Voice sample preview (${this.language.toUpperCase()} - ${resultType})`);
    this.announce(resultType, null, true);
  }

  // Background pre-fetch for instant audio playback upon scan
  async prefetchAnnouncements(lang = this.language) {
    if (!this.enabled || typeof window === 'undefined') return;
    const types = ['safe', 'suspicious', 'dangerous'];
    for (const type of types) {
      const cacheKey = `${lang}_${type}`;
      if (!this.audioCache.has(cacheKey)) {
        let audioUrl = null;
        try {
          const res = await api.post('/voice/announce', { language: lang, resultType: type });
          if (res.data?.audioBase64) {
            audioUrl = base64ToBlobUrl(res.data.audioBase64, res.data.mimeType || 'audio/mpeg');
            this.audioCache.set(cacheKey, audioUrl);
          }
        } catch (_) {}

        // Direct fetch fallback if backend fails
        if (!audioUrl) {
          const text = ANNOUNCEMENT_TEXTS[lang]?.[type];
          if (text) {
            const directUrl = await this.fetchDirectElevenLabs(text);
            if (directUrl) {
              this.audioCache.set(cacheKey, directUrl);
            }
          }
        }
      }
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
