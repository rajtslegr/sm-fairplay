import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@components/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
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
    <Card className="mb-8 w-full max-w-4xl sm:mb-12">
      <CardHeader>
        <CardTitle>OpenAI API Key</CardTitle>
        <CardDescription>
          Enter your OpenAI API key to use AI for team formation. Your key is
          stored locally and is never sent to our servers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative grow">
            <Label htmlFor="api-key-input" className="sr-only">
              API Key
            </Label>
            <Input
              id="api-key-input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <Button onClick={handleSave}>Save API Key</Button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {getOpenAIKey() ? (
            <span className="text-green-400">✓ API key is set</span>
          ) : (
            <span className="text-yellow-400">
              ⚠ No API key set. AI team generation won&apos;t work.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
