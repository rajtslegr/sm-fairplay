import { useState, useEffect } from 'react';

import Button from '@components/Button';
import { Player } from '@utils/xlsxParser';

interface PlayerSelectionProps {
  players: Player[];
  onPlayersSelected: (selectedPlayers: Player[]) => void;
  onResetSelection: () => void;
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  players,
  onPlayersSelected,
  onResetSelection,
}) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [allPlayers, setAllPlayers] = useState<Player[]>(players);
  const [listChanged, setListChanged] = useState(false);

  useEffect(() => {
    setAllPlayers(players);
  }, [players]);

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers((prev) => {
      const newSelection = prev.includes(player)
        ? prev.filter((p) => p !== player)
        : [...prev, player];
      setListChanged(true);
      return newSelection;
    });
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
      setAllPlayers((prev) => [...prev, newPlayer]);
      setSelectedPlayers((prev) => [...prev, newPlayer]);
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
          <Button onClick={addNewPlayer}>Add New Player</Button>
          <Button
            onClick={handleSubmit}
            active={listChanged && selectedPlayers.length > 5}
            disabled={selectedPlayers.length < 6}
          >
            Generate Teams
          </Button>
          <Button onClick={handleReset}>Reset Selection</Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelection;
