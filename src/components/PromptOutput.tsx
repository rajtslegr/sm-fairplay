import { useState } from 'react';

import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

interface PromptOutputProps {
  promptText: string;
}

const PromptOutput = ({ promptText }: PromptOutputProps) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    if (!promptText) return;

    try {
      await navigator.clipboard.writeText(promptText);
      setHasCopied(true);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setHasCopied(false), 1200);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      toast.error('Failed to copy prompt');
    }
  };

  if (!promptText) return null;

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-lg">Prompt</CardTitle>
        <Button onClick={handleCopy} size="sm">
          {hasCopied ? (
            <Check className="size-4" />
          ) : (
            <Copy className="size-4" />
          )}
          {hasCopied ? 'Copied' : 'Copy'}
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="max-h-[480px] overflow-auto rounded-md border border-border bg-muted/40 p-4 text-xs leading-relaxed">
          {promptText}
        </pre>
      </CardContent>
    </Card>
  );
};

export default PromptOutput;
