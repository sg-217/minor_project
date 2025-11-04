import React, { useState, useEffect } from "react";
import { processVoiceCommand } from "../services/api";
import "./VoiceAssistant.css";

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [messages, setMessages] = useState([]); // {role, text}
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();

      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-IN"; // Supports Hindi + English + Hinglish

      rec.onresult = async (event) => {
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (!event.results[i].isFinal) {
            setLiveText(transcript);
          } else {
            finalText += transcript;
          }
        }

        if (finalText.trim() === "") return;

        setLiveText("");
        addMessage("user", finalText);

        try {
          const res = await processVoiceCommand({ transcript: finalText });

          const reply =
            res?.data?.response || "Sorry, I didn’t understand that.";
          const lang = res?.data?.lang || "en"; // from backend "hi" or "en"

          addMessage("assistant", reply);
          speak(reply, lang);

          // If an expense was added → refresh UI
          if (res?.data?.action === "add_expense") {
            setTimeout(() => window.location.reload(), 1500);
          }
        } catch (err) {
          addMessage("assistant", "Error processing your request.");
          speak("Error processing your request.", "en");
        }

        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      setRecognition(rec);
    }
  }, []);

  // ✅ Add chat messages
  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  // ✅ Smart voice output with Hindi/English auto voice selection
  const speak = (text, lang = "en") => {
    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // ✅ Start / Stop mic
  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel();
      setLiveText("");
      setIsListening(true);
      recognition.start();
    }
  };

  if (!recognition) return null;

  return (
    <div className="va-root fixed bottom-6 right-6 z-50">
      {(isListening || messages.length > 0) && (
        <div className="va-panel">
          <div className="va-header">
            <div className="va-title">Assistant</div>
            <div className={`va-dot ${isListening ? "active" : ""}`} />
          </div>

          <div className="va-body">
            {messages.slice(-5).map((m, index) => (
              <div
                key={index}
                className={`va-bubble ${
                  m.role === "user" ? "user" : "assistant"
                }`}
              >
                {m.text}
              </div>
            ))}

            {isListening && (
              <div className="va-wave">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

            {liveText && <div className="va-bubble user live">{liveText}</div>}
          </div>
        </div>
      )}

      <button
        onClick={toggleListening}
        className={`va-mic ${isListening ? "active" : ""}`}
        title="Voice Assistant"
      >
        <span className="material-symbols-outlined">
          {isListening ? "mic" : "mic_none"}
        </span>
      </button>
    </div>
  );
};

export default VoiceAssistant;
