import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Mic, MicOff, Send, Volume2, Globe } from 'lucide-react';

const SYSTEM_RESPONSES = {
  'en-IN': {
    greetings: "Hi there! I am your AltCred AI Assistant. I can help clarify how our alternative credit scoring models work.",
    model: "AltCred uses an XGBoost algorithm. We evaluate non-traditional signals like UPI transaction velocity, consistent bill payments, and digital wallet usage instead of relying purely on a traditional CIBIL score.",
    shap: "SHAP values explain our model's decisions visually. The green bars indicate features that reduce default risk, while red bars show features that increase the applicant's risk. Longer bars mean a higher impact.",
    score: "The risk score represents the Probability of Default. A score near 0% is Low Risk/Approved, while a score near 100% means High Risk to lenders.",
    default: "I'm your AI guide for AltCred! Feel free to ask me to explain the models, how SHAP charts work, or about alternative credit scoring."
  },
  'hi-IN': {
    greetings: "नमस्ते! मैं आपका AltCred AI सहायक हूँ। मैं हमारे वैकल्पिक क्रेडिट मॉडल को समझने में मदद कर सकता हूँ।",
    model: "AltCred XGBoost एल्गोरिदम का उपयोग करता है। हम सिबिल (CIBIL) के बजाय यूपीआई लेन-देन और बिल भुगतान जैसे नए डेटा का विश्लेषण करते हैं।",
    shap: "SHAP (शैप) मूल्य मॉडल के फैसले को समझाते हैं। हरी पट्टियाँ डिफ़ॉल्ट जोखिम को कम करती हैं, जबकि लाल पट्टियाँ आवेदक के जोखिम को बढ़ाती हैं।",
    score: "क्रेडिट ऱिस्क स्कोर डिफ़ॉल्ट की संभावना को दर्शाता है। 0% के करीब कम जोखिम है, जबकि 100% के करीब का मतलब उच्च जोखिम है।",
    default: "मैं आपका AI सहायक हूँ। मुझसे क्रेडिट मॉडल या SHAP चार्ट के बारे में पूछें!"
  },
  'ta-IN': {
    greetings: "வணக்கம்! நான் உங்கள் AltCred AI உதவியாளர். எங்கள் மாடல்கள் எவ்வாறு செயல்படுகின்றன என்பதை விளக்க நான் உதவ முடியும்.",
    model: "AltCred XGBoost அல்காரிதத்தைப் பயன்படுத்துகிறது. நாங்கள் CIBIL ஸ்கோருக்குப் பதிலாக UPI மற்றும் பில்களை பகுப்பாய்வு செய்கிறோம்.",
    shap: "SHAP மாடலின் முடிவை விளக்குகிறது. பச்சை பட்டை ஆபத்தை குறைக்கிறது, சிவப்பு பட்டை ஆபத்தை அதிகரிக்கிறது. நீளமான பட்டைகள் அதிக தாக்கத்தை குறிக்கின்றன.",
    score: "ஸ்கோர் 0% க்கு அருகில் இருந்தால், அது குறைந்த ஆபத்து (Low Risk). ஸ்கோர் 100% க்கு அருகில் இருந்தால் அதிக ஆபத்து (High Risk).",
    default: "நான் உங்கள் AI உதவியாளர். மாடல் அல்லது SHAP சார்ட் பற்றி ஏதேனும் கேட்கலாம்!"
  },
  'te-IN': {
    greetings: "నమస్కారం! నేను మీ AltCred AI అసిస్టెంట్‌ని. మా క్రెడిట్ స్కోరింగ్ మోడల్‌లు ఎలా పనిచేస్తాయో నేను వివరించగలను.",
    model: "AltCred XGBoost అల్గారిథమ్‌ని ఉపయోగిస్తుంది. CIBIL స్కోర్‌కి బదులుగా మేము UPI లావాదేవీలు మరియు బిల్ చెల్లింపులను విశ్లేషిస్తాము.",
    shap: "SHAP విలువలు మోడల్ నిర్ణయాలను వివరిస్తాయి. ఆకుపచ్చ బ్యాంకులు ప్రమాదాన్ని తగ్గిస్తాయి, ఎరుపు బ్యాంకులు ప్రమాదాన్ని పెంచుతాయి.",
    score: "రిస్క్ స్కోర్ డిఫాల్ట్ సంభావ్యతను సూచిస్తుంది. 0% అంటే తక్కువ ప్రమాదం, 100% అంటే అధిక ప్రమాదం.",
    default: "నేను మీ AI అసిస్టెంట్‌ని. మోడల్ లేదా SHAP గురించి ఏమైనా అడగండి!"
  },
  'mr-IN': {
    greetings: "नमस्कार! मी तुमचा AltCred AI सहाय्यक आहे. आमचे क्रेडिट मॉडेल कसे काम करते हे मी स्पष्ट करू शकेन.",
    model: "AltCred XGBoost अल्गोरिदम वापरते. सिबिल (CIBIL) ऐवजी आम्ही UPI व्यवहार आणि बिल पेमेंटचे विश्लेषण करतो.",
    shap: "SHAP मूल्ये आमच्या निर्णय प्रक्रियेचे स्पष्टीकरण देतात. हिरवी पट्टी धोका कमी करते, लाल पट्टी धोका वाढवते.",
    score: "क्रेडिट जोखीम स्कोअर बुडीत होण्याची शक्यता दर्शवतो. ०% म्हणजे कमी धोका, १००% म्हणजे जास्त धोका.",
    default: "मी तुमचा AI सहाय्यक आहे. मला मॉडेल किंवा SHAP चार्टबद्दल विचारा!"
  },
  'bn-IN': {
    greetings: "নমস্কার! আমি আপনার AltCred AI সহকারী। আমাদের মডেল কীভাবে কাজ করে তা আমি ব্যাখ্যা করতে পারি।",
    model: "AltCred XGBoost অ্যালগরিদম ব্যবহার করে। আমরা CIBIL-এর পরিবর্তে UPI লেনদেন এবং বিল পেমেন্ট বিশ্লেষণ করি।",
    shap: "SHAP আমাদের সিদ্ধান্তগুলি কেন নেওয়া হয়েছে তা ব্যাখ্যা করে। সবুজ বার ঝুঁকি কমায়, লাল বার ঝুঁকি বাড়ায়।",
    score: "রিস্ক স্কোর ডিফল্ট হওয়ার সম্ভাবনা দেখায়। শূন্য শতাংশ মানে কম ঝুঁকি, ১০০% মানে উচ্চ ঝুঁকি।",
    default: "আমি আপনার এআই সহকারী। মডেল বা শ্যাপ চার্ট সম্পর্কে আমাকে জিজ্ঞাসা করুন!"
  },
  'gu-IN': {
    greetings: "નમસ્તે! હું તમારો AltCred AI સહાયક છું. આપણા મોડલ કેવી રીતે કાર્ય કરે છે તે સમજાવવામાં હું મદદ કરી શકું છું.",
    model: "AltCred XGBoost નો ઉપયોગ કરે છે. CIBIL સ્કોરને બદલે અમે UPI વ્યવહારો અને બિલ ચુકવણીનું વિશ્લેષણ કરીએ છીએ.",
    shap: "SHAP સમજાવે છે કે આ સ્કોર શા માટે આપવામાં આવ્યો હતો. લીલા રંગથી જોખમ ઘટે છે, લાલ રંગથી જોખમ વધે છે.",
    score: "જોખમ સ્કોર ડિફોલ્ટની સંભાવના દર્શાવે છે. શૂન્યની નજીક એટલે ઓછું જોખમ, ૧૦૦% એટલે ઉચ્ચ જોખમ.",
    default: "હું તમારો AI સહાયક છું. મોડેલ અથવા SHAP વિશે કોઈપણ પ્રશ્ન પૂછો!"
  },
  'kn-IN': {
    greetings: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AltCred AI ಸಹಾಯಕ. ನಮ್ಮ ರೇಟಿಂಗ್‌ಗಳು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ ಎಂಬುದನ್ನು ನಾನು ವಿವರಿಸಬಲ್ಲೆ.",
    model: "AltCred XGBoost ಅಲ್ಗಾರಿದಮ್ ಅನ್ನು ಬಳಸುತ್ತದೆ. CIBIL ಬದಲಿಗೆ ಯುಪಿಐ (UPI) ಮತ್ತು ಬ್ಯಾಂಕ್ ಪಾವತಿಗಳನ್ನು ನಾವು ವಿಶ್ಲೇಷಿಸುತ್ತೇವೆ.",
    shap: "SHAP ಮೌಲ್ಯಗಳು ನಿರ್ಧಾರಗಳನ್ನು ವಿವರಿಸುತ್ತವೆ. ಹಸಿರು ಬಣ್ಣ ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ, ಕೆಂಪು ಬಣ್ಣ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
    score: "ಸ್ಕೋರ್ ವಂಚನೆಯ ಸಾಧ್ಯತೆಯನ್ನು ತೋರಿಸುತ್ತದೆ. ಸೊನ್ನೆಗೆ ಹತ್ತಿರ ಅಂದರೆ ಕಡಿಮೆ ಅಪಾಯ, ೧೦೦% ಎಂದರೆ ಹೆಚ್ಚಿನ ಅಪಾಯ.",
    default: "ನಾನು ನಿಮ್ಮ ಎಐ ಸಹಾಯಕ. ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದಲ್ಲಿ ಕೇಳಿ!"
  },
  'ml-IN': {
    greetings: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AltCred AI അസിസ്റ്റന്റാണ്. ഞങ്ങളുടെ മോഡലുകൾ എങ്ങനെ പ്രവർത്തിക്കുന്നുവെന്ന് ഞാൻ വിശദീകരിക്കാം.",
    model: "AltCred XGBoost ഉപയോഗിക്കുന്നു. പാരമ്പര്യമായി ഉപയോഗിക്കുന്ന CIBIL സ്‌കോറിന് പകരം ഞങ്ങൾ UPI, ബിൽ തിരിച്ചടവുകൾ എന്നിവ വിലയിരുത്തുന്നു.",
    shap: "തീരുമാനങ്ങൾ എന്തുകൊണ്ടാണെന്ന് SHAP വ്യക്തമാക്കുന്നു. പച്ച നിറം റിസ്ക് കുറയ്ക്കുന്നു, ചുവപ്പ് റിസ്ക് കൂട്ടുന്നു.",
    score: "റിസ്ക് സ്കോർ കടം തിരിച്ചടക്കാത്ത സാഹചര്യങ്ങളെ കാണിക്കുന്നു. 0% കുറഞ്ഞ റിസ്ക് ആണ്, 100% വളരെ കൂടിയ റിസ്ക് ആണ്.",
    default: "ഞാൻ നിങ്ങളുടെ AI അസിസ്റ്റന്റ് ആണ്. എന്നോട് മോഡൽ കുറിച്ചോ SHAP കുറിച്ചോ ചോദിക്കുക!"
  }
};

const KEYWORD_MAP = {
  model: ['model', 'xgboost', 'how it works', 'how does', 'algorithm', 'evaluate', 'मॉडल', 'மாடல்', 'మోడల్', 'एल्गोरिदम', 'মডেল', 'મોડેલ', 'ಮಾಡೆಲ್', 'മോഡൽ'],
  shap: ['shap', 'explain', 'chart', 'red', 'green', 'bar', 'impact', 'शैप', 'பச்சை', 'விளக்கு', 'பட்டை', 'వివరించండి', 'स्पष्ट', 'ব্যাখ্যা', 'સમજાવે', 'ವಿವರಿಸಬಲ್ಲೆ', 'വിശദീകരിക്കാം'],
  score: ['score', 'probability', 'default', 'high risk', 'low risk', 'स्कोर', 'ஸ்கோர்', 'స్కోర్', 'স্কোর', 'સ્કોર', 'ಸ್ಕೋರ್', 'സ്കോർ']
};

  // Setup Centralized TTS
  import { speakText, stopSpeech, listAvailableVoices, LANG_CODES } from '../utils/tts';

  export default function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    
    // Map existing lang codes to the new keys
    const langKeyMap = {
      'en-IN': 'english',
      'hi-IN': 'hindi',
      'ta-IN': 'tamil',
      'te-IN': 'telugu',
      'mr-IN': 'marathi',
      'bn-IN': 'bengali',
      'gu-IN': 'gujarati',
      'kn-IN': 'kannada',
      'ml-IN': 'malayalam'
    };

    const [lang, setLang] = useState('en-IN');
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [voiceWarning, setVoiceWarning] = useState(false);
    const messagesEndRef = useRef(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionRef = useRef(null);

    // Initial greeting
    useEffect(() => {
      setMessages([{ sender: 'bot', text: SYSTEM_RESPONSES[lang].greetings }]);
    }, []);

    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages]);

    useEffect(() => {
      const checkVoices = async () => {
        const voices = await listAvailableVoices();
        const hasIndianVoices = voices.some(v => 
          ['hi-IN','ta-IN','te-IN'].includes(v.lang) || v.lang.startsWith('hi') || v.lang.startsWith('ta') || v.lang.startsWith('te')
        );
        if (!hasIndianVoices && voices.length > 0) {
          setVoiceWarning(true);
        }
      };
      checkVoices();
    }, []);

    // Setup Web Speech API for Multilingual Voice Assistant
    useEffect(() => {
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          handleUserMessage(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }, [lang, SpeechRecognition]);

    const startListening = () => {
      if (!recognitionRef.current) {
        alert("Voice recognition is not supported in this browser. Try Chrome/Edge.");
        return;
      }
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        try {
          recognitionRef.current.lang = lang; // Set voice assistant lang
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {}
      }
    };

    const handleUserMessage = async (msg) => {
      if (!msg.trim()) return;
      
      // Add user message
      setMessages(prev => [...prev, { sender: 'user', text: msg }]);
      setText('');

      // Small delay to feel natural
      setTimeout(async () => {
        const lower = msg.toLowerCase();
        let replyKey = 'default';

        if (KEYWORD_MAP.model.some(k => lower.includes(k))) replyKey = 'model';
        else if (KEYWORD_MAP.shap.some(k => lower.includes(k))) replyKey = 'shap';
        else if (KEYWORD_MAP.score.some(k => lower.includes(k))) replyKey = 'score';

        const botReply = SYSTEM_RESPONSES[lang][replyKey];
        setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
        
        const langKey = langKeyMap[lang] || 'english';
        await speakText(botReply, langKey);
      }, 600);
    };

    return (
      <>
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-[90px] right-6 w-[340px] h-[520px] bg-[var(--bg2)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999]"
            >
              {/* Header */}
              <div className="bg-[var(--bg3)] px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--orange-glow)] flex items-center justify-center">
                    <Volume2 size={16} className="text-[var(--orange)]" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-sm text-[var(--text)]">AltCred Assistant</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]"></span>
                      <span className="font-dm text-[9px] uppercase tracking-wider text-[var(--green)]">Voice AI Online</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => {
                  setIsOpen(false);
                  stopSpeech();
                }} className="text-[var(--text3)] hover:text-[var(--text)]">
                  <X size={18} />
                </button>
              </div>

              {/* Language Selector */}
              <div className="bg-[var(--bg)] px-4 py-2 border-b border-[var(--border)] flex justify-between items-center">
                <div className="flex items-center gap-2 text-[var(--text3)] font-dm text-xs">
                  <Globe size={14} />
                  <span>Lang:</span>
                </div>
                <select 
                  value={lang} 
                  onChange={async (e) => {
                    const newLang = e.target.value;
                    setLang(newLang);
                    const greeting = SYSTEM_RESPONSES[newLang].greetings;
                    setMessages([{ sender: 'bot', text: greeting }]);
                    await speakText(greeting, langKeyMap[newLang] || 'english');
                  }}
                  className="bg-[var(--bg3)] text-[var(--text)] font-dm text-[11px] rounded px-2 py-1 outline-none border border-[var(--border)] cursor-pointer"
                >
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">Hindi (हिन्दी)</option>
                  <option value="ta-IN">Tamil (தமிழ்)</option>
                  <option value="te-IN">Telugu (తెలుగు)</option>
                  <option value="mr-IN">Marathi (मराठी)</option>
                  <option value="bn-IN">Bengali (বাংলা)</option>
                  <option value="gu-IN">Gujarati (ગુજરાતી)</option>
                  <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
                  <option value="ml-IN">Malayalam (മലയാളം)</option>
                </select>
              </div>

              {/* Voice Warning Banner */}
              {voiceWarning && (
                <div className="bg-[rgba(255,71,87,0.1)] border-b border-[rgba(255,71,87,0.2)] p-2 px-3 flex flex-col justify-center items-center text-center leading-tight">
                  <p className="font-dm text-[9px] text-[var(--red)] font-medium">Indian language voices not detected on this device.</p>
                  <p className="font-dm text-[8px] text-[var(--text3)] mt-0.5">For best results, use Chrome on Android or enable Indian language voices in your OS settings.</p>
                </div>
              )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--bg)]">
              {messages.map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 font-dm text-[13px] leading-relaxed shadow-md ${
                    m.sender === 'user' 
                      ? 'bg-[var(--orange)] text-white rounded-br-none' 
                      : 'bg-[var(--bg3)] text-[var(--text)] border border-[var(--border)] rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[var(--bg3)] border-t border-[var(--border)] flex items-center gap-2">
              <button 
                onClick={startListening}
                className={`p-2.5 rounded-full transition-colors flex flex-shrink-0 ${isListening ? 'bg-[var(--red)] text-white animate-pulse' : 'bg-[var(--bg)] text-[var(--text2)] hover:text-[var(--orange)]'}`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input 
                type="text" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUserMessage(text)}
                placeholder="Ask about AltCredAI..."
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-full px-4 py-2 font-dm text-[13px] text-[var(--text)] focus:border-[var(--orange)] outline-none"
              />
              <button 
                onClick={() => handleUserMessage(text)}
                disabled={!text.trim()}
                className="p-2.5 bg-[var(--orange)] text-white rounded-full hover:bg-[#E55A1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={16} className="-ml-0.5 mt-0.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--orange)] text-white rounded-full shadow-lg flex items-center justify-center z-[9999] hover:shadow-[0_0_15px_var(--orange)] transition-shadow"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </>
  );
}
