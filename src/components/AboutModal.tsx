import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { useStore } from '@store/useStore';

const AboutModal = () => {
  const { showAbout, setShowAbout } = useStore();

  return (
    <Dialog open={showAbout} onOpenChange={setShowAbout}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>How It Works</DialogTitle>
          <DialogDescription>
            This app builds a ready-to-paste prompt for ChatGPT (or any other
            LLM) based on your XLSX player stats.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm sm:text-base">
            1) Upload an XLSX file with player stats (drag & drop / click /
            paste).
          </p>
          <p className="text-sm sm:text-base">
            2) Select the players participating in the match.
          </p>
          <p className="text-sm sm:text-base">
            3) Click <strong>Generate Teams</strong> to create balanced teams.
          </p>
          <p className="text-sm sm:text-base">
            4) Click <strong>Copy Prompt</strong> to copy a detailed prompt for
            your LLM chat.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AboutModal;
