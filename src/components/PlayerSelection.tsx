import { useState } from 'react';

import Button from '@components/Button';
import { useStore } from '@store/useStore';
import { Player } from '@utils/xlsxParser';

interface PlayerSelectionProps {
  players: Player[];
  onPlayersSelected: (selectedPlayers: Player[]) => void;
  onResetSelection: () => void;
}

const PlayerSelection = ({
  onPlayersSelected,
  onResetSelection,
}: PlayerSelectionProps) => {
  const { selectedPlayers, allPlayers, setSelectedPlayers, setAllPlayers } =
    useStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [listChanged, setListChanged] = useState(false);

  const togglePlayerSelection = (player: Player) => {
    const newSelection = selectedPlayers.includes(player)
      ? selectedPlayers.filter((p) => p !== player)
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
            active={selectedPlayers.includes(player)}
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
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={addNewPlayer} disabled={newPlayerName.trim() === ''}>
            Add New Player
          </Button>
          <Button
            onClick={handleSubmit}
            active={listChanged && selectedPlayers.length > 5}
            disabled={selectedPlayers.length < 6}
          >
            Generate Teams
          </Button>
          <Button onClick={handleReset} disabled={selectedPlayers.length === 0}>
            Reset Selection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelection;
