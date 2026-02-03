import { useState, useMemo } from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@components/Button';
import { Alert, AlertTitle, AlertDescription } from '@components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { useStore } from '@store/useStore';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (apiKey: string) => void;
}

const ApiKeyInput = ({
  initialValue,
  onSave,
  onClose,
}: {
  initialValue: string;
  onSave: (key: string) => void;
  onClose: () => void;
}) => {
  const [apiKey, setApiKey] = useState(initialValue);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      const trimmedKey = apiKey.trim();

      if (!trimmedKey.startsWith('sk-or-')) {
        toast.error(
          'Invalid API key format. OpenRouter API keys start with "sk-or-"',
        );
        return;
      }

      onSave(trimmedKey);
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="api-key">API Key</Label>
        <div className="relative">
          <Input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-..."
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
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save & Continue</Button>
      </DialogFooter>
    </>
  );
};

const ApiKeyModal = ({ isOpen, onClose, onSuccess }: ApiKeyModalProps) => {
  const { getApiKey, setApiKey } = useStore();

  const handleSave = (key: string) => {
    setApiKey(key);
    toast.success('API key saved!');
    onSuccess(key);
  };

  const initialValue = isOpen ? getApiKey() || '' : '';
  const inputKey = useMemo(
    () => `api-key-${isOpen}-${initialValue}`,
    [isOpen, initialValue],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OpenRouter API Key Required</DialogTitle>
          <DialogDescription>
            Enter your OpenRouter API key to use AI for team formation. The AI
            will analyze all player statistics to create optimally balanced
            teams using Kimi K2.5.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
          <AlertTitle className="text-amber-900 dark:text-amber-400">
            ⚠️ Security Warning
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            <ul className="list-disc pl-5 text-sm">
              <li className="mb-1">
                <strong>Use restricted API keys</strong> with usage limits set
                in your OpenRouter dashboard
              </li>
              <li className="mb-1">
                Your key will be stored encrypted in your browser
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <p className="text-sm text-muted-foreground">
          Your key is stored locally in your browser and is never sent to our
          servers. You can get an API key from{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            OpenRouter&apos;s website
          </a>
          .
        </p>

        {isOpen && (
          <ApiKeyInput
            key={inputKey}
            initialValue={initialValue}
            onSave={handleSave}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
