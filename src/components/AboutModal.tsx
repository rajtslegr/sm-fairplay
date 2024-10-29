import { useRef, useEffect } from 'react';

import { useStore } from '@store/useStore';
import { PLAYER_SCORE_WEIGHTS } from '@utils/constants';

const AboutModal = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { showAbout, setShowAbout } = useStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowAbout(false);
      }
    };

    if (showAbout) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener(
        'touchstart',
        handleClickOutside as unknown as EventListener,
      );
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener(
        'touchstart',
        handleClickOutside as unknown as EventListener,
      );
    };
  }, [showAbout, setShowAbout]);

  if (!showAbout) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 outline-none focus:outline-none">
        <div className="relative mx-auto w-full max-w-md sm:max-w-lg md:max-w-2xl">
          <div
            ref={modalRef}
            className="relative flex w-full flex-col rounded-lg border-0 bg-[#1a1a1a] shadow-lg outline-none focus:outline-none"
          >
            <div className="flex items-start justify-between rounded-t border-b border-solid border-gray-600 p-5">
              <h3 className="text-xl font-semibold text-gray-300 sm:text-2xl">
                Calculation Method
              </h3>
              <button
                className="ml-auto border-0 bg-transparent p-1 text-2xl font-semibold leading-none text-gray-300 outline-none focus:outline-none sm:text-3xl"
                onClick={() => setShowAbout(false)}
              >
                <span className="flex size-6 items-center justify-center bg-transparent text-2xl text-gray-300 outline-none focus:outline-none">
                  ×
                </span>
              </button>
            </div>
            <div className="relative flex-auto overflow-y-auto p-6 text-gray-300">
              <p className="mb-2 text-sm sm:text-base">
                The team selection process uses a weighted scoring system to
                evaluate player performance and create balanced teams. The
                calculation is based on the following factors:
              </p>
              <ul className="mb-4 list-inside list-disc text-sm sm:text-base">
                <li>Goals per match</li>
                <li>Assists per match</li>
                <li>Points per match</li>
              </ul>
              <p className="mb-2 text-sm sm:text-base">
                Each factor is assigned a weight to determine its importance in
                the overall player score:
              </p>
              <ul className="mb-4 list-inside list-disc text-sm sm:text-base">
                <li>Goal weight: {PLAYER_SCORE_WEIGHTS.goalWeight}</li>
                <li>Assist weight: {PLAYER_SCORE_WEIGHTS.assistWeight}</li>
                <li>Point weight: {PLAYER_SCORE_WEIGHTS.pointWeight}</li>
              </ul>
              <p className="mb-2 text-sm sm:text-base">
                The player&apos;s score is calculated using the formula:
              </p>
              <pre className="mb-4 overflow-x-auto bg-[#242424] p-2 text-xs sm:text-sm">
                {`PlayerScore = \n  (GoalsPerMatch * GoalWeight) +\n  (AssistsPerMatch * AssistWeight) +\n  (PointsPerMatch * PointWeight)`}
              </pre>
              <p className="text-sm sm:text-base">
                Teams are then formed by distributing players based on their
                calculated scores. The algorithm starts with the highest-scoring
                players and alternates assigning them to teams to ensure
                balance. This &quot;snake draft&quot; approach (e.g., Team A,
                Team B, Team B, Team A) helps achieve similar total team scores.
                The process continues until all players are assigned,
                maintaining equal team sizes whenever possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutModal;
