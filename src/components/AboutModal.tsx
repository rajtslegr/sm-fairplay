import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { useStore } from '@store/useStore';
import { PLAYER_SCORE_WEIGHTS } from '@utils/constants';

const AboutModal = () => {
  const { showAbout, setShowAbout } = useStore();

  return (
    <Dialog open={showAbout} onOpenChange={setShowAbout}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Calculation Method</DialogTitle>
          <DialogDescription>
            The team selection process uses a weighted scoring system to
            evaluate player performance and create balanced teams.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm sm:text-base">
            The calculation is based on the following factors:
          </p>
          <ul className="list-inside list-disc text-sm sm:text-base">
            <li>Goals per match</li>
            <li>Assists per match</li>
            <li>Points per match</li>
          </ul>
          <p className="text-sm sm:text-base">
            Each factor is assigned a weight to determine its importance in the
            overall player score:
          </p>
          <ul className="list-inside list-disc text-sm sm:text-base">
            <li>Goal weight: {PLAYER_SCORE_WEIGHTS.goalWeight}</li>
            <li>Assist weight: {PLAYER_SCORE_WEIGHTS.assistWeight}</li>
            <li>Point weight: {PLAYER_SCORE_WEIGHTS.pointWeight}</li>
          </ul>
          <p className="text-sm sm:text-base">
            The player&apos;s score is calculated using the formula:
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs sm:text-sm">
            {`PlayerScore = \n  (GoalsPerMatch * GoalWeight) +\n  (AssistsPerMatch * AssistWeight) +\n  (PointsPerMatch * PointWeight)`}
          </pre>
          <p className="text-sm sm:text-base">
            Teams are formed using an advanced dynamic programming algorithm
            that optimizes for balanced team scores. The process starts by
            sorting players by their calculated scores, then systematically
            evaluates different team combinations to find the optimal
            distribution that minimizes the score difference between teams while
            maintaining equal team sizes (or at most one player difference).
            This approach ensures the most competitive and fair team matchups
            possible.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AboutModal;
