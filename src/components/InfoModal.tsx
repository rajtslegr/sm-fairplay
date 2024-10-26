import { PLAYER_SCORE_WEIGHTS } from '@utils/constants';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 outline-none focus:outline-none">
        <div className="relative mx-auto w-full max-w-md sm:max-w-lg md:max-w-2xl">
          <div className="relative flex w-full flex-col rounded-lg border-0 bg-[#1a1a1a] shadow-lg outline-none focus:outline-none">
            <div className="flex items-start justify-between rounded-t border-b border-solid border-gray-600 p-5">
              <h3 className="text-xl font-semibold sm:text-2xl">
                Calculation Method
              </h3>
              <button
                className="ml-auto border-0 bg-transparent p-1 text-2xl font-semibold leading-none text-gray-300 outline-none focus:outline-none sm:text-3xl"
                onClick={onClose}
              >
                <span className="block size-6 bg-transparent text-2xl text-gray-300 outline-none focus:outline-none">
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
                PlayerScore = (GoalsPerMatch * GoalWeight) + (AssistsPerMatch *
                AssistWeight) + (PointsPerMatch * PointWeight)
              </pre>
              <p className="text-sm sm:text-base">
                Teams are then formed by distributing players based on their
                calculated scores, ensuring that the total team scores are as
                close as possible while maintaining similar team sizes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoModal;
