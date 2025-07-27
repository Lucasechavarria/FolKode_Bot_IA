
import { useState, useRef, useCallback, useEffect } from 'react';
import { Language, SpeechRecognition } from '../types';
import { locales } from '../i18n/locales';

export const useSpeech = (
    language: Language | null,
    onSpeechResult: (transcript: string) => void,
    isConversationMode: boolean,
) => {
    const [isListening, setIsListening] = useState<boolean>(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const startListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            return;
        }

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            alert(locales.voiceNotSupported?.[language || 'en']);
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language || 'en-US';
        recognitionRef.current = recognition;

        let finalTranscript = '';
        recognition.onresult = (event) => {
            finalTranscript = event.results[0][0].transcript;
        };

        recognition.onend = () => {
            setIsListening(false);
            if (finalTranscript.trim()) {
                onSpeechResult(finalTranscript.trim());
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.start();
        setIsListening(true);
    }, [isListening, language, onSpeechResult]);

    const speak = useCallback((textToSpeak: string) => {
        if ('speechSynthesis' in window && textToSpeak) {
            speechSynthesis.cancel(); // Cancel any previous speech
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            if (language) utterance.lang = language;
            
            if (isConversationMode) {
                utterance.onend = () => {
                    startListening();
                };
            }
            speechSynthesis.speak(utterance);
        }
    }, [language, isConversationMode, startListening]);
    
    // Cleanup speechSynthesis on component unmount or mode change
    useEffect(() => {
        return () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
        }
    }, [isConversationMode]);

    return {
        isListening,
        startListening,
        speak,
    };
};