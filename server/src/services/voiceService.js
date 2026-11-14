import axios from 'axios';

/**
 * QR SHIELD Multilingual Announcement Dictionary
 * Natural human-like phrasing for Kannada, English, and Hindi.
 */
export const ANNOUNCEMENTS = {
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

export const SUPPORTED_LANGUAGES = ['en', 'kn', 'hi'];
export const SUPPORTED_RESULTS = ['safe', 'suspicious', 'dangerous', 'failed'];

// Default ElevenLabs voice ID (Rachel - clear, natural, professional multilingual voice)
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

// In-memory binary cache for generated announcements
// Key: `${language}_${resultType}`
const audioCache = new Map();

/**
 * Generate or retrieve cached announcement audio using ElevenLabs Multilingual v2
 * Never sends URLs or sensitive user data to ElevenLabs.
 */
export async function getAnnouncementSpeech(language = 'en', resultType = 'safe') {
  const langKey = SUPPORTED_LANGUAGES.includes(language) ? language : 'en';
  const resKey = SUPPORTED_RESULTS.includes(resultType) ? resultType : 'safe';

  const text = ANNOUNCEMENTS[langKey][resKey];
  const cacheKey = `${langKey}_${resKey}`;

  // 1. Serve from Cache if available
  if (audioCache.has(cacheKey)) {
    const cached = audioCache.get(cacheKey);
    return {
      success: true,
      audioBase64: cached.audioBase64,
      mimeType: 'audio/mpeg',
      language: langKey,
      resultType: resKey,
      text,
      source: 'elevenlabs_cache',
      cached: true
    };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;

  // 2. If no API key configured, signal client to use browser speech synthesis fallback
  if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
    return {
      success: true,
      fallback: true,
      audioBase64: null,
      language: langKey,
      resultType: resKey,
      text,
      source: 'browser_speech_synthesis',
      message: 'ElevenLabs API key not configured in environment. Using browser multilingual speech engine.'
    };
  }

  // 3. Request speech generation from ElevenLabs Multilingual v2 API
  try {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey.trim()
      },
      data: {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        }
      },
      responseType: 'arraybuffer',
      timeout: 12000
    });

    const buffer = Buffer.from(response.data);
    const audioBase64 = buffer.toString('base64');

    // Store in cache to prevent duplicate billing and minimize latency
    audioCache.set(cacheKey, {
      audioBase64,
      mimeType: 'audio/mpeg',
      generatedAt: Date.now()
    });

    return {
      success: true,
      audioBase64,
      mimeType: 'audio/mpeg',
      language: langKey,
      resultType: resKey,
      text,
      source: 'elevenlabs',
      cached: false
    };
  } catch (error) {
    const errorMsg = error.response?.data
      ? Buffer.from(error.response.data).toString('utf-8')
      : error.message;

    console.warn('[ElevenLabs Service] Voice generation failed, using fallback:', errorMsg);

    return {
      success: true,
      fallback: true,
      audioBase64: null,
      language: langKey,
      resultType: resKey,
      text,
      source: 'browser_speech_synthesis',
      message: 'ElevenLabs service unavailable or quota reached. Seamlessly using browser speech engine.',
      error: error.message
    };
  }
}
