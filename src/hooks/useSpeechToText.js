import { useState, useEffect, useRef } from 'react';

export function useSpeechToText() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results for faster updates
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0.7;
        
        // Lower confidence threshold for faster updates
        if (confidence > 0.3) {
          if (result.isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            // Show interim results immediately for faster feedback
            interimTranscript += transcript;
          }
        }
      }

      // Combine final and interim - show interim immediately for speed
      const combined = finalTranscript.trim() + (interimTranscript ? ' ' + interimTranscript : '');
      // Update immediately without checking length for faster response
      setTranscript(combined);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if continuous mode is enabled
      // Only restart if we're still supposed to be listening
      if (recognitionRef.current) {
        const shouldRestart = recognitionRef.current.continuous;
        if (shouldRestart) {
          // Reduced delay for faster restart
          setTimeout(() => {
            try {
              if (recognitionRef.current) {
                recognitionRef.current.start();
                setIsListening(true);
              }
            } catch (error) {
              // Ignore errors when restarting (might already be started)
            }
          }, 50);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript
  };
}

