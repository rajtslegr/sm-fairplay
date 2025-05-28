import { useRef, useEffect, useState } from 'react';

import { toast } from 'sonner';

import Button from '@components/Button';
import { useStore } from '@store/useStore';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (apiKey: string) => void;
}

const ApiKeyModal = ({ isOpen, onClose, onSuccess }: ApiKeyModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { getOpenAIKey, setOpenAIKey } = useStore();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setApiKey(getOpenAIKey() || '');
  }, [getOpenAIKey, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (apiKey.trim()) {
      const trimmedKey = apiKey.trim();

      if (!trimmedKey.startsWith('sk-')) {
        toast.error('Invalid API key format. OpenAI API keys start with "sk-"');
        return;
      }

      setOpenAIKey(trimmedKey);
      toast.success('API key saved!');
      onSuccess(trimmedKey);
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <div
          ref={modalRef}
          className="w-full max-w-md rounded-lg bg-[#1a1a1a] p-6 shadow-xl"
        >
          <h2 className="mb-4 text-xl font-semibold">
            OpenAI API Key Required
          </h2>
          <p className="mb-4 text-sm text-gray-300">
            Enter your OpenAI API key to use AI for team formation. The AI will
            analyze all player statistics to create optimally balanced teams.
          </p>

          <div className="mb-4 rounded-md border border-amber-400 bg-amber-900/30 p-3">
            <h3 className="mb-1 font-medium text-amber-400">
              ⚠️ Security Warning
            </h3>
            <ul className="list-disc pl-5 text-sm text-amber-200">
              <li className="mb-1">
                <strong>Use restricted API keys</strong> with usage limits set
                in your OpenAI dashboard
              </li>
              <li className="mb-1">
                Your key will be stored encrypted in your browser
              </li>
            </ul>
          </div>

          <p className="mb-4 text-sm text-gray-300">
            Your key is stored locally in your browser and is never sent to our
            servers. You can get an API key from{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              OpenAI&apos;s website
            </a>
            .
          </p>
          <div className="mb-4">
            <div className="relative w-full">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded border p-2 text-black"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} active>
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApiKeyModal;
