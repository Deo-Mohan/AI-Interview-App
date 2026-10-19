import { useState, useEffect, useRef, useCallback } from 'react';
import { ConversationState, ConversationMessage } from '../types/engine';

interface UseConversationEngineProps {
  modeId?: string;
  mode?: string;
  initialWelcomeText?: string;
  onSessionEnded?: (messages: ConversationMessage[]) => void;
  onSessionEnd?: (messages: ConversationMessage[]) => void;
}

export function useConversationEngine({
  modeId,
  mode,
  initialWelcomeText = "Hello Krish! I'm Rachel, your English communication mentor. I'm listening closely and ready whenever you'd like to begin.",
  onSessionEnded,
  onSessionEnd,
}: UseConversationEngineProps) {
  const activeModeId = modeId || mode || 'general_conversation';
  const handleSessionEndCallback = onSessionEnded || onSessionEnd;
  // 1. Explicit Lifecycle States: idle, requesting_permission, connecting, listening, processing, speaking, paused, ending, completed, failed
  const [state, setState] = useState<ConversationState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. Transcript Stores (Separating partial streaming from finalized messages)
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [partialTranscript, setPartialTranscript] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Active session timer
  useEffect(() => {
    let interval: any;
    if (state === 'listening' || state === 'speaking' || state === 'processing') {
      interval = setInterval(() => {
        setDurationSeconds(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  // 3. Audio & Speech Recognition References
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isComponentMounted = useRef(true);
  const isInterruptedRef = useRef(false);

  // Initialize SpeechSynthesis on mount
  useEffect(() => {
    isComponentMounted.current = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      isComponentMounted.current = false;
      stopAudioPlayback();
      stopSpeechRecognition();
    };
  }, []);

  // Stop current audio playback
  const stopAudioPlayback = useCallback(() => {
    if (synthRef.current) {
      isInterruptedRef.current = true;
      synthRef.current.cancel();
      currentUtteranceRef.current = null;
    }
  }, []);

  // Stop speech recognition
  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore already stopped error
      }
      recognitionRef.current = null;
    }
  }, []);

  // Format current timestamp (e.g., 01:24)
  const getFormattedTime = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0].substring(3, 8);
  };

  // Speak AI response with cancellation support
  const speakAIResponse = useCallback((text: string, onDone?: () => void) => {
    if (!synthRef.current || typeof window === 'undefined') {
      if (onDone) onDone();
      return;
    }

    stopAudioPlayback();
    isInterruptedRef.current = false;
    setState('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef.current = utterance;
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = synthRef.current.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')) && v.lang.startsWith('en'));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      if (!isComponentMounted.current || isInterruptedRef.current) return;
      currentUtteranceRef.current = null;
      setState('listening');
      if (onDone) onDone();
      startSpeechRecognition();
    };

    utterance.onerror = (e) => {
      console.warn('[TTS] Synthesis error or cancellation:', e);
      if (!isComponentMounted.current || isInterruptedRef.current) return;
      currentUtteranceRef.current = null;
      setState('listening');
      if (onDone) onDone();
      startSpeechRecognition();
    };

    synthRef.current.speak(utterance);
  }, [stopAudioPlayback]);

  // Request AI response from Backend Mentor Service (Phase 3)
  const requestAIResponse = useCallback(async (userText: string) => {
    setState('processing');
    stopSpeechRecognition();

    try {
      const response = await fetch('http://localhost:5000/api/conversation/mentor-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `sess-${Date.now()}`,
          userMessage: userText,
          history: messages.map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', text: m.text })),
          context: {
            modeId: modeId as any,
            targetRole: 'Senior Full Stack Engineer',
            resumeSummary: 'Experienced frontend and systems developer with React and Node.js expertise.',
            interviewRound: 'mixed',
            workplaceContext: 'general',
            scenarioType: 'customer_service'
          },
          preferences: {
            feedbackMode: 'balanced',
            mentorTone: 'supportive',
            speechRate: 'natural',
            targetCefrLevel: 'B2'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const spokenText = data.spoken_response || data.replyText;

      const aiMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: spokenText,
        timestamp: getFormattedTime(),
        grammarFeedback: data.correction ? {
          original: data.correction.original,
          suggested: data.correction.suggested,
          explanation: data.correction.explanation
        } : data.grammarFeedback,
        naturalAlternative: data.natural_alternative || data.naturalAlternative,
        vocabularyHighlight: data.useful_phrase || data.vocabularyHighlight
      };

      setMessages(prev => [...prev, aiMessage]);
      speakAIResponse(spokenText);
    } catch (err: any) {
      console.error('[Engine] AI Reply generation failed:', err);
      // Graceful local fallback reply
      const fallbackReply = "I understand your point completely. Could you explain what key considerations guided that choice?";
      const aiFallbackMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackReply,
        timestamp: getFormattedTime()
      };
      setMessages(prev => [...prev, aiFallbackMessage]);
      speakAIResponse(fallbackReply);
    }
  }, [messages, modeId, speakAIResponse, stopSpeechRecognition]);

  // Start Speech Recognition
  const startSpeechRecognition = useCallback(() => {
    if (isMuted) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Speech Recognition is not supported in this browser. Please use Google Chrome or Edge.");
      setState('failed');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        if (!isComponentMounted.current) return;
        setState('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        // Show partial streaming transcript live without duplicating
        if (interim) {
          setPartialTranscript(interim);
          // If user starts speaking while AI is talking, handle interruption!
          if (synthRef.current && synthRef.current.speaking) {
            stopAudioPlayback();
          }
        }

        // When a segment is finalized
        if (final.trim()) {
          setPartialTranscript('');
          const userMsg: ConversationMessage = {
            id: `usr-${Date.now()}`,
            sender: 'user',
            text: final.trim(),
            timestamp: getFormattedTime()
          };
          setMessages(prev => [...prev, userMsg]);
          requestAIResponse(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[STT] Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please allow microphone permissions in your browser bar.');
          setState('failed');
        } else if (event.error === 'no-speech') {
          // Normal timeout, resume if still listening
          if (state === 'listening' && !isMuted) {
            try { recognition.start(); } catch (e) {}
          }
        }
      };

      recognition.onend = () => {
        // Auto-restart if we are still meant to be listening
        if (isComponentMounted.current && state === 'listening' && !isMuted) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or busy
          }
        }
      };

      recognition.start();
    } catch (err: any) {
      console.warn('[STT] Failed to initialize recognition:', err);
    }
  }, [isMuted, state, stopAudioPlayback, requestAIResponse]);

  // Public Action: Start Conversation
  const startConversation = useCallback(async () => {
    setState('requesting_permission');
    setErrorMessage(null);

    try {
      // 1. Request microphone permission explicitly
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately stop this initial probe stream
        stream.getTracks().forEach(track => track.stop());
      }

      setState('connecting');

      // 2. Initial mentor welcome message
      const welcomeMsg: ConversationMessage = {
        id: `ai-init-${Date.now()}`,
        sender: 'ai',
        text: initialWelcomeText,
        timestamp: getFormattedTime()
      };
      setMessages([welcomeMsg]);

      // 3. Speak welcome and begin listening
      speakAIResponse(initialWelcomeText);
    } catch (err: any) {
      console.error('[Engine] Microphone permission failed:', err);
      setErrorMessage('Microphone permission was denied. Please grant microphone access to begin voice practice.');
      setState('failed');
    }
  }, [initialWelcomeText, speakAIResponse]);

  // Public Action: Pause / Resume
  const togglePause = useCallback(() => {
    if (state === 'paused') {
      setState('listening');
      startSpeechRecognition();
    } else if (state === 'listening' || state === 'speaking') {
      stopAudioPlayback();
      stopSpeechRecognition();
      setState('paused');
    }
  }, [state, startSpeechRecognition, stopAudioPlayback, stopSpeechRecognition]);

  const pauseConversation = useCallback(() => {
    if (state !== 'paused') togglePause();
  }, [state, togglePause]);

  const resumeConversation = useCallback(() => {
    if (state === 'paused') togglePause();
  }, [state, togglePause]);

  const interruptSpeech = useCallback(() => {
    stopAudioPlayback();
    if (state === 'speaking') {
      setState('listening');
      startSpeechRecognition();
    }
  }, [stopAudioPlayback, state, startSpeechRecognition]);

  // Public Action: Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        stopSpeechRecognition();
      } else if (state === 'listening') {
        startSpeechRecognition();
      }
      return next;
    });
  }, [state, startSpeechRecognition, stopSpeechRecognition]);

  // Public Action: End Conversation
  const endConversation = useCallback(() => {
    setState('ending');
    stopAudioPlayback();
    stopSpeechRecognition();

    // Finalize pending partial if any
    let finalMessages = [...messages];
    if (partialTranscript.trim()) {
      finalMessages.push({
        id: `usr-final-${Date.now()}`,
        sender: 'user',
        text: partialTranscript.trim(),
        timestamp: getFormattedTime()
      });
      setPartialTranscript('');
    }

    setState('completed');
    if (handleSessionEndCallback) {
      handleSessionEndCallback(finalMessages);
    }
  }, [handleSessionEndCallback, messages, partialTranscript, stopAudioPlayback, stopSpeechRecognition]);

  return {
    state,
    messages,
    partialTranscript,
    isMuted,
    isPaused: state === 'paused',
    durationSeconds,
    errorMessage,
    startConversation,
    togglePause,
    pauseConversation,
    resumeConversation,
    toggleMute,
    endConversation,
    retry: startConversation,
    interruptSpeech,
  };
}
