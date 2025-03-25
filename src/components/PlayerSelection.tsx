import { useState } from 'react';

import Button from '@components/Button';
import { useStore } from '@store/useStore';
import { Player } from '@utils/xlsxParser';

interface PlayerSelectionProps {
  players: Player[];
  onPlayersSelected: (selectedPlayers: Player[]) => void;
  onPlayersSelectedWithAI: (selectedPlayers: Player[]) => void;
  onResetSelection: () => void;
  isGenerating?: boolean;
}

const PlayerSelection = ({
  onPlayersSelected,
  onPlayersSelectedWithAI,
  onResetSelection,
  isGenerating = false,
}: PlayerSelectionProps) => {
  const {
    selectedPlayers,
    allPlayers,
    setSelectedPlayers,
    setAllPlayers,
    teamA,
    teamB,
    getOpenAIKey,
  } = useStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [listChanged, setListChanged] = useState(false);
  const [showAIInfo, setShowAIInfo] = useState(false);

  const togglePlayerSelection = (player: Player) => {
    const newSelection = selectedPlayers.some((p) => p.name === player.name)
      ? selectedPlayers.filter((p) => p.name !== player.name)
      : [...selectedPlayers, player];

    setSelectedPlayers(newSelection);
    setListChanged(true);
  };

  const addNewPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        name: newPlayerName.trim(),
        goals: 0,
        assists: 0,
        points: 0,
        matches: 1,
        goalsPerMatch: 0,
        assistsPerMatch: 0,
        pointsPerMatch: 0,
      };
      setAllPlayers([...allPlayers, newPlayer]);
      setSelectedPlayers([...selectedPlayers, newPlayer]);
      setNewPlayerName('');
      setListChanged(true);
    }
  };

  const handleSubmit = () => {
    onPlayersSelected(selectedPlayers);
    setListChanged(false);
  };

  const handleSubmitWithAI = () => {
    onPlayersSelectedWithAI(selectedPlayers);
    setListChanged(false);
  };

  const handleReset = () => {
    setSelectedPlayers([]);
    onResetSelection();
    setListChanged(false);
  };

  return (
    <div className="mb-8 w-full max-w-4xl sm:mb-12">
      <div className="mb-6 grid grid-cols-2 gap-2 sm:mb-8 sm:grid-cols-3 md:grid-cols-4">
        {allPlayers.map((player) => (
          <Button
            key={player.name}
            onClick={() => togglePlayerSelection(player)}
            active={selectedPlayers.some((p) => p.name === player.name)}
            disabled={isGenerating}
          >
            {player.name}
          </Button>
        ))}
      </div>
      <div className="mb-2 flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="New player name"
          className="w-full rounded border p-2 text-black sm:w-auto"
          disabled={isGenerating}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={addNewPlayer}
            disabled={newPlayerName.trim() === '' || isGenerating}
          >
            <div className="flex items-center gap-2">
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Player
            </div>
          </Button>
          <Button
            onClick={handleSubmit}
            active={listChanged && selectedPlayers.length > 5}
            disabled={selectedPlayers.length < 6 || isGenerating}
          >
            <div className="flex items-center gap-2">
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Generate
            </div>
          </Button>
          <div className="relative">
            <Button
              onClick={handleSubmitWithAI}
              active={listChanged && selectedPlayers.length > 5}
              disabled={selectedPlayers.length < 6 || isGenerating}
              onMouseEnter={() => setShowAIInfo(true)}
              onMouseLeave={() => setShowAIInfo(false)}
            >
              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <svg
                    className="size-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                )}
                AI Generate
              </div>
            </Button>
            {showAIInfo && !isGenerating && (
              <div className="absolute bottom-full left-0 mb-2 w-64 rounded bg-gray-800 p-2 text-xs text-gray-200 shadow-lg">
                Uses OpenAI to analyze all player statistics and create
                optimally balanced teams.
                {!getOpenAIKey() && " You'll be prompted to enter an API key."}
              </div>
            )}
          </div>
          <Button
            onClick={handleReset}
            disabled={
              (selectedPlayers.length === 0 &&
                teamA.length === 0 &&
                teamB.length === 0) ||
              isGenerating
            }
          >
            <div className="flex items-center gap-2">
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset Selection
            </div>
          </Button>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <p className="flex items-center gap-1">
          <span className="rounded-full bg-primary px-1 text-xs font-semibold">
            AI
          </span>
          The AI team generation uses all player data including goals, assists,
          points, and matches played to create optimally balanced teams.
        </p>
      </div>
    </div>
  );
};

export default PlayerSelection;
