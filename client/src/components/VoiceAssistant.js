import React, { useState, useEffect } from 'react';
import { processVoiceCommand } from '../services/api';
import './VoiceAssistant.css';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-IN';

      recognitionInstance.onresult = async (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        
        try {
          const res = await processVoiceCommand({ transcript: spokenText });
          setResponse(res.data.response || 'Command processed!');
          speak(res.data.response);
          
          // Reload page after adding expense
          if (res.data.action === 'add_expense') {
            setTimeout(() => window.location.reload(), 2000);
          }
        } catch (error) {
          setResponse('Sorry, I could not process that command.');
          speak('Sorry, I could not process that command.');
        }
        
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setResponse('Error: ' + event.error);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition) {
      setTranscript('');
      setResponse('');
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
    <div className="voice-assistant">
      <button
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={isListening ? stopListening : startListening}
        title="Voice Assistant"
      >
        🎤
      </button>
      
      {(isListening || transcript || response) && (
        <div className="voice-feedback">
          {isListening && (
            <div className="listening-indicator">
              <span className="pulse"></span>
              <p>Listening...</p>
            </div>
          )}
          {transcript && (
            <div className="transcript">
              <strong>You said:</strong> {transcript}
            </div>
          )}
          {response && (
            <div className="response">
              <strong>Response:</strong> {response}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
