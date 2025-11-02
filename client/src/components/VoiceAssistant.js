import React, { useState, useEffect } from "react";
import { processVoiceCommand } from "../services/api";
import "./VoiceAssistant.css";

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-IN";

      recognitionInstance.onresult = async (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);

        try {
          const res = await processVoiceCommand({ transcript: spokenText });
          setResponse(res.data.response || "Command processed!");
          speak(res.data.response);

          // Reload page after adding expense
          if (res.data.action === "add_expense") {
            setTimeout(() => window.location.reload(), 2000);
          }
        } catch (error) {
          setResponse("Sorry, I could not process that command.");
          speak("Sorry, I could not process that command.");
        }

        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setResponse("Error: " + event.error);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition) {
      setTranscript("");
      setResponse("");
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  if (!recognition) {
    return null; // Browser doesn't support speech recognition
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className={`flex items-center justify-center size-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors ${
          isListening ? "animate-pulse ring-4 ring-primary/30" : ""
        }`}
        onClick={isListening ? stopListening : startListening}
        title="Voice Assistant"
      >
        <span className="material-symbols-outlined">
          {isListening ? "mic" : "mic_none"}
        </span>
      </button>

      {(isListening || transcript || response) && (
        <div className="absolute bottom-full right-0 mb-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          {isListening && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="relative">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/30"></span>
                <span className="relative block size-2 rounded-full bg-primary"></span>
              </div>
              <p className="text-sm font-medium">Listening...</p>
            </div>
          )}
          {transcript && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                You said:
              </p>
              <p className="text-sm text-gray-900 dark:text-white">
                {transcript}
              </p>
            </div>
          )}
          {response && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Response:
              </p>
              <p className="text-sm text-gray-900 dark:text-white">
                {response}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
