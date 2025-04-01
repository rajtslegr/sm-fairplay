import { useState } from 'react';

import { toast } from 'sonner';

import Button from '@components/Button';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
}

const ApiKeyInput = ({ apiKey, onApiKeyChange }: ApiKeyInputProps) => {
  const [inputValue, setInputValue] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onApiKeyChange(inputValue.trim());
      toast.success('API key applied!');
    } else {
      onApiKeyChange('');
      toast.error('API key cleared');
    }
  };

  return (
    <div className="mb-8 w-full max-w-4xl rounded-lg bg-[#1a1a1a] p-4 sm:mb-12">
      <h2 className="mb-4 text-lg font-semibold">OpenAI API Key</h2>
      <p className="mb-4 text-sm text-gray-300">
        Enter your OpenAI API key to use AI for team formation. Your key is only
        used for the current session and is never stored or sent to our servers.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative grow">
          <input
            type={showKey ? 'text' : 'password'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
        <Button onClick={handleSubmit}>Use API Key</Button>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        {apiKey ? (
          <span className="text-green-400">
            ✓ API key is set for this session
          </span>
        ) : (
          <span className="text-yellow-400">
            ⚠ No API key set. AI team generation won&apos;t work.
          </span>
        )}
      </div>
    </div>
  );
};

export default ApiKeyInput;
