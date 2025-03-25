import { useState } from 'react';

import { toast } from 'sonner';

import Button from '@components/Button';
import { useStore } from '@store/useStore';

const ApiKeyInput = () => {
  const { getOpenAIKey, setOpenAIKey } = useStore();
  const [apiKey, setApiKey] = useState(getOpenAIKey() || '');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      setOpenAIKey(apiKey.trim());
      toast.success('API key saved!');
    } else {
      setOpenAIKey('');
      toast.error('API key cleared');
    }
  };

  return (
    <div className="mb-8 w-full max-w-4xl rounded-lg bg-[#1a1a1a] p-4 sm:mb-12">
      <h2 className="mb-4 text-lg font-semibold">OpenAI API Key</h2>
      <p className="mb-4 text-sm text-gray-300">
        Enter your OpenAI API key to use AI for team formation. Your key is
        stored locally and is never sent to our servers.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative grow">
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
        <Button onClick={handleSave}>Save API Key</Button>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        {getOpenAIKey() ? (
          <span className="text-green-400">✓ API key is set</span>
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
