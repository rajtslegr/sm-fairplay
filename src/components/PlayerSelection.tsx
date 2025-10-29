import { useState } from 'react';

import { Plus, Copy, Zap, Loader2, RotateCcw } from 'lucide-react';

import { Button } from '@components/Button';
import { Card } from '@components/ui/card';
import { Input } from '@components/ui/input';
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
              disabled={isGenerating}
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
          disabled={isGenerating}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={addNewPlayer}
            disabled={newPlayerName.trim() === '' || isGenerating}
            variant="secondary"
          >
            <Plus className="size-4" />
            Add Player
          </Button>
          <Button
            onClick={handleSubmit}
            variant={
              listChanged && selectedPlayers.length > 5 ? 'default' : 'outline'
            }
            disabled={selectedPlayers.length < 6 || isGenerating}
          >
            <Copy className="size-4" />
            Generate
          </Button>
          <div className="relative">
            <Button
              onClick={handleSubmitWithAI}
              variant={
                listChanged && selectedPlayers.length > 5
                  ? 'default'
                  : 'outline'
              }
              disabled={selectedPlayers.length < 6 || isGenerating}
              onMouseEnter={() => setShowAIInfo(true)}
              onMouseLeave={() => setShowAIInfo(false)}
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Zap className="size-4" />
              )}
              AI Generate
            </Button>
            {showAIInfo && !isGenerating && (
              <Card className="absolute bottom-full left-0 mb-2 w-64 border border-border bg-popover p-3 shadow-lg animate-in">
                <p className="text-xs leading-relaxed text-popover-foreground">
                  Uses OpenAI to analyze all player statistics and create
                  optimally balanced teams.
                  {!getOpenAIKey() &&
                    " You'll be prompted to enter an API key."}
                </p>
              </Card>
            )}
          </div>
          <Button
            onClick={handleReset}
            variant="ghost"
            disabled={
              (selectedPlayers.length === 0 &&
                teamA.length === 0 &&
                teamB.length === 0) ||
              isGenerating
            }
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>
      <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4 shadow-sm">
        <p className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">
            AI
          </span>
          <span className="text-muted-foreground">
            The AI team generation uses all player data including goals,
            assists, points, and matches played to create optimally balanced
            teams.
          </span>
        </p>
      </div>
    </div>
  );
};

export default PlayerSelection;
