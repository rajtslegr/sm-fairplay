import { useState } from 'react';

import { Plus, Copy, Zap, RotateCcw } from 'lucide-react';

import { Button } from '@components/Button';
import { Input } from '@components/ui/input';
import { useStore } from '@store/useStore';
import { Player } from '@utils/xlsxParser';

interface PlayerSelectionProps {
  onGenerateTeams: (selectedPlayers: Player[]) => void;
  onCopyPrompt: () => void;
  onResetSelection: () => void;
}

const PlayerSelection = ({
  onGenerateTeams,
  onCopyPrompt,
  onResetSelection,
}: PlayerSelectionProps) => {
  const {
    selectedPlayers,
    allPlayers,
    setSelectedPlayers,
    setAllPlayers,
    teamA,
    teamB,
  } = useStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [listChanged, setListChanged] = useState(false);

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

  const handleGenerateTeams = () => {
    onGenerateTeams(selectedPlayers);
    setListChanged(false);
  };

  const handleReset = () => {
    setSelectedPlayers([]);
    onResetSelection();
    setListChanged(false);
  };

  const teamsGenerated = teamA.length > 0 && teamB.length > 0;

  return (
    <div className="mb-12 w-full max-w-6xl">
      <div className="mb-8 grid grid-cols-2 gap-3 sm:mb-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {allPlayers.map((player) => {
          const isSelected = selectedPlayers.some(
            (p) => p.name === player.name,
          );
          return (
            <Button
              key={player.name}
              onClick={() => togglePlayerSelection(player)}
              variant={isSelected ? 'default' : 'outline'}
              className="w-full"
            >
              {player.name}
            </Button>
          );
        })}
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="New player name"
          className="w-full sm:w-auto sm:flex-1"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={addNewPlayer}
            disabled={newPlayerName.trim() === ''}
            variant="secondary"
          >
            <Plus className="size-4" />
            Add Player
          </Button>
          <Button
            onClick={handleGenerateTeams}
            variant={
              listChanged && selectedPlayers.length > 5 ? 'default' : 'outline'
            }
            disabled={selectedPlayers.length < 6}
          >
            <Copy className="size-4" />
            Generate Teams
          </Button>
          <Button
            onClick={onCopyPrompt}
            variant={teamsGenerated ? 'default' : 'outline'}
            disabled={!teamsGenerated}
          >
            <Zap className="size-4" />
            Copy Prompt
          </Button>
          <Button
            onClick={handleReset}
            variant="ghost"
            disabled={
              selectedPlayers.length === 0 &&
              teamA.length === 0 &&
              teamB.length === 0
            }
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelection;
