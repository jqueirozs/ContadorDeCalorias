import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, placeholder = "Clique no microfone e fale...", className, disabled }: VoiceInputProps) {
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    language: 'pt-BR'
  });

  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    if (transcript && transcript.trim()) {
      onTranscript(transcript);
      setHasSpoken(true);
    }
  }, [transcript, onTranscript]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setHasSpoken(false);
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className={cn("p-4 border-2 border-dashed border-neutral-300 rounded-lg text-center", className)}>
        <MicOff className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
        <p className="text-sm text-neutral-500">
          Reconhecimento de voz não está disponível neste navegador.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-center">
        <Button
          type="button"
          onClick={handleToggleListening}
          disabled={disabled}
          className={cn(
            "w-16 h-16 rounded-full transition-all duration-200",
            isListening 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      <div className="text-center">
        {isListening ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Volume2 className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Ouvindo...
              </span>
            </div>
            {(interimTranscript || transcript) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-blue-500 opacity-70">
                      {interimTranscript}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        ) : hasSpoken && transcript ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              Texto capturado: "{transcript}"
            </p>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}