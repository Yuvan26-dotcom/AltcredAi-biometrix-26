/**
 * tts.js — AltCredAI Multilingual Text-to-Speech Utility
 * ========================================================
 * Handles read-aloud functionality for 8 Indian languages.
 * Uses Web Speech API with async voice loading to fix the
 * common issue of Indian language voices being skipped.
 *
 * Supported languages: English, Hindi, Tamil, Telugu,
 * Kannada, Malayalam, Bengali, Marathi
 *
 * Key fix: voices load asynchronously in browsers.
 * getVoices() waits for voiceschanged event before speaking.
 * speakChunked() fixes Chrome's 15-second cut-off bug.
 */

// Language code mapping — must match browser voice names exactly
export const LANG_CODES = {
  english:    { code: 'en-IN', fallback: 'en-US', name: 'English' },
  hindi:      { code: 'hi-IN', fallback: 'hi',    name: 'हिंदी' },
  tamil:      { code: 'ta-IN', fallback: 'ta',    name: 'தமிழ்' },
  telugu:     { code: 'te-IN', fallback: 'te',    name: 'తెలుగు' },
  kannada:    { code: 'kn-IN', fallback: 'kn',    name: 'ಕನ್ನಡ' },
  malayalam:  { code: 'ml-IN', fallback: 'ml',    name: 'മലയാളം' },
  bengali:    { code: 'bn-IN', fallback: 'bn',    name: 'বাংলা' },
  marathi:    { code: 'mr-IN', fallback: 'mr',    name: 'मराठी' },
};

// Wait for voices to be ready — KEY FIX
function getVoices() {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    // Voices not loaded yet — wait for the event
    speechSynthesis.addEventListener('voiceschanged', () => {
      resolve(speechSynthesis.getVoices());
    }, { once: true });
    // Safety timeout — if event never fires, retry
    setTimeout(() => resolve(speechSynthesis.getVoices()), 1000);
  });
}

// Find best matching voice for a language code
function findVoice(voices, langCode, fallbackCode) {
  // Try exact match first (e.g. "ta-IN")
  let voice = voices.find(v => v.lang === langCode);
  if (voice) return voice;
  
  // Try prefix match (e.g. "ta")
  const prefix = langCode.split('-')[0];
  voice = voices.find(v => v.lang.startsWith(prefix));
  if (voice) return voice;
  
  // Try fallback code
  if (fallbackCode) {
    voice = voices.find(v => v.lang === fallbackCode || v.lang.startsWith(fallbackCode));
    if (voice) return voice;
  }
  
  // Last resort — use any available voice
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
}

// Chunked speech for long text (fixes Chrome cut-off bug)
async function speakChunked(text, langCode, voice) {
  // Split on sentence boundaries
  const sentences = text.match(/[^.!?।\n]+[.!?।\n]*/g) || [text];
  
  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    await new Promise((resolve) => {
      const utt = new SpeechSynthesisUtterance(sentence.trim());
      utt.lang = langCode;
      utt.rate = 0.9;
      utt.pitch = 1.0;
      utt.volume = 1.0;
      if (voice) utt.voice = voice;
      utt.onend = resolve;
      utt.onerror = resolve; // Continue even on error
      window.speechSynthesis.speak(utt);
    });
  }
}

// Main speak function
export async function speakText(text, languageKey = 'english') {
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported');
    return;
  }
  
  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();
  
  // Wait for voices to load
  const voices = await getVoices();
  
  const langConfig = LANG_CODES[languageKey] || LANG_CODES.english;
  const voice = findVoice(voices, langConfig.code, langConfig.fallback);
  
  // CRITICAL FIX for Chrome bug — long text gets cut off
  // Chrome has a bug where speechSynthesis pauses after ~15 seconds
  // Fix: use chunked speech for long text
  if (text.length > 200) {
    await speakChunked(text, langConfig.code, voice);
    return;
  }
  
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langConfig.code;
    utterance.rate = 0.9;   // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    if (voice) {
      utterance.voice = voice;
      console.log(`Using voice: ${voice.name} (${voice.lang}) for ${languageKey}`);
    } else {
      console.warn(`No voice found for ${langConfig.code}, using browser default`);
    }

    utterance.onend = resolve;
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      reject(e);
    };
    window.speechSynthesis.speak(utterance);
    
    // Chrome resuming bug fix
    const resumeInterval = setInterval(() => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      if (!window.speechSynthesis.speaking) {
        clearInterval(resumeInterval);
      }
    }, 1000);
  });
}

export function stopSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking() {
  return window.speechSynthesis ? window.speechSynthesis.speaking : false;
}

// Debug helper — call this to see available voices in console
export async function listAvailableVoices() {
  const voices = await getVoices();
  const indian = voices.filter(v => 
    ['hi','ta','te','kn','ml','bn','mr','gu','pa'].some(l => v.lang.startsWith(l))
  );
  console.log('Indian voices available:', indian.map(v => `${v.name} (${v.lang})`));
  console.log('Total voices:', voices.length);
  return voices;
}
