import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import './VideoInterview.css';

function VideoInterview({ isActive, onStart, onStop, onTranscriptUpdate, onAnswerComplete, canProceed }) {
  const [stream, setStream] = useState(null);
  const [timer, setTimer] = useState(0);
  const [silenceTimer, setSilenceTimer] = useState(0);
  const videoRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const silenceIntervalRef = useRef(null);
  const lastTranscriptLengthRef = useRef(0);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechToText();

  const transcriptRef = useRef(null);

  useEffect(() => {
    onTranscriptUpdate(transcript);
    // Auto-scroll transcript to bottom only if user hasn't manually scrolled up
    if (transcriptRef.current) {
      const textarea = transcriptRef.current;
      const isNearBottom = textarea.scrollHeight - textarea.scrollTop - textarea.clientHeight < 50;
      
      // Only auto-scroll if user is near the bottom (hasn't scrolled up manually)
      if (isNearBottom || transcript.length === 0) {
        textarea.scrollTop = textarea.scrollHeight;
      }
    }
  }, [transcript, onTranscriptUpdate]);

  const handleNextQuestion = useCallback(() => {
    if (transcript.trim().length > 0) {
      stopListening();
      onAnswerComplete(transcript);
      resetTranscript();
      setSilenceTimer(0);
      lastTranscriptLengthRef.current = 0;
      
      // Restart listening after a short delay
      setTimeout(() => {
        if (isActive) {
          startListening();
        }
      }, 1500);
    }
  }, [transcript, stopListening, onAnswerComplete, resetTranscript, isActive, startListening]);

  // Improved auto-advance logic with silence detection
  useEffect(() => {
    if (isActive && isListening && transcript.trim().length > 0) {
      const currentLength = transcript.trim().length;
      const wordCount = transcript.trim().split(/\s+/).filter(w => w.length > 0).length;
      
      // Check if transcript has changed
      if (currentLength !== lastTranscriptLengthRef.current) {
        lastTranscriptLengthRef.current = currentLength;
        setSilenceTimer(0);
      }

      // Auto-advance after 4 seconds of silence and minimum 15 words
      // More lenient to avoid cutting off answers
      if (silenceTimer >= 4 && wordCount >= 15 && currentLength > 80) {
        handleNextQuestion();
      }
    }
  }, [transcript, isActive, isListening, silenceTimer, handleNextQuestion]);

  // Reset silence timer when transcript changes
  useEffect(() => {
    if (transcript.trim().length > 0) {
      const newLength = transcript.trim().length;
      if (newLength !== lastTranscriptLengthRef.current) {
        lastTranscriptLengthRef.current = newLength;
        setSilenceTimer(0);
      }
    }
  }, [transcript]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      alert('Please allow camera and microphone access to continue.');
      return Promise.reject(error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleStart = async () => {
    try {
      // Start camera first
      await startCamera();
      
      // Call onStart to update parent state
      onStart();
      
      // Clear any existing timer first
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      // Start timer with stable reference
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          // Use functional update to prevent glitches
          return prev + 1;
        });
      }, 1000);
      
      // Start listening after a small delay to ensure everything is ready
      // This prevents the mic state glitch
      setTimeout(() => {
        startListening();
      }, 100);
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const handleStop = () => {
    stopCamera();
    stopListening();
    onStop();
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
    }
    setTimer(0);
    setSilenceTimer(0);
    lastTranscriptLengthRef.current = 0;
    resetTranscript();
  };

  useEffect(() => {
    // Silence detection timer
    if (isActive && isListening) {
      silenceIntervalRef.current = setInterval(() => {
        setSilenceTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (silenceIntervalRef.current) {
        clearInterval(silenceIntervalRef.current);
      }
    }
    return () => {
      if (silenceIntervalRef.current) {
        clearInterval(silenceIntervalRef.current);
      }
    };
  }, [isActive, isListening]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (silenceIntervalRef.current) {
        clearInterval(silenceIntervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-interview">
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="video-preview"
        />
        {!stream && (
          <div className="video-placeholder">
            <p>Camera will appear here</p>
          </div>
        )}
      </div>

      <div className="video-controls">
        <div className="control-item">
          <div className={`mic-indicator ${isActive && isListening ? 'active' : ''}`}>
            <span className="mic-icon">🎤</span>
            <span>{isActive && isListening ? 'Recording' : 'Mic Off'}</span>
            {isActive && isListening && <span className="recording-dot"></span>}
          </div>
        </div>

        <div className="control-item">
          <div className="timer-display">
            <span className="timer-icon">⏱️</span>
            <span>{formatTime(timer)}</span>
          </div>
        </div>

        <div className="control-item">
          {!isActive ? (
            <button className="start-btn" onClick={handleStart}>
              Start Interview
            </button>
          ) : (
            <button className="stop-btn" onClick={handleStop}>
              Stop Interview
            </button>
          )}
        </div>
      </div>

      <div className="transcript-section">
        <div className="transcript-header">
          <h3>Live Transcript</h3>
          {isActive && transcript.trim().length > 0 && (
            <button 
              className="next-question-btn" 
              onClick={handleNextQuestion}
              disabled={!canProceed}
            >
              Next Question →
            </button>
          )}
        </div>
        <div className="transcript-wrapper">
          <textarea
            ref={transcriptRef}
            className="transcript-textarea"
            value={transcript}
            readOnly
            placeholder="Your speech will appear here... Speak clearly and naturally."
            autoFocus={false}
          />
        </div>
        {isActive && transcript.trim().length > 0 && (
          <div className="transcript-footer">
            <span className="word-count">{transcript.trim().split(/\s+/).filter(w => w.length > 0).length} words</span>
            {silenceTimer >= 2 && (
              <span className="auto-advance-hint">Auto-advancing in {4 - silenceTimer} seconds...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoInterview;

