import { useEffect, useRef } from 'react';

import { toast } from 'sonner';

import FileUpload from '@components/FileUpload';
import PlayerSelection from '@components/PlayerSelection';
import TeamDisplay from '@components/TeamDisplay';
import { useStore } from '@store/useStore';
import { buildPromptFromTeams } from '@utils/promptBuilder';
import { selectTeamsWithStats } from '@utils/teamSelectionCore';
import { parseXlsxData, Player } from '@utils/xlsxParser';

export const Homepage = () => {
  const {
    players,
    teamA,
    teamB,
    setPlayers,
    setTeams,
    reset,
    resetSelection,
    setMatchHistory,
    matchHistory,
    debugInfo,
  } = useStore();

  const teamsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (teamA.length > 0 && teamB.length > 0 && teamsRef.current) {
      const headerHeight = 96;
      const teamDisplayRect = teamsRef.current.getBoundingClientRect();
      const scrollPosition =
        window.scrollY + teamDisplayRect.top - headerHeight;

      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [teamA, teamB]);

  const handleFileUpload = async (file: File) => {
    reset();
    const toastId = toast.loading('Processing file...');

    try {
      const { players: parsedPlayers, matches } = await parseXlsxData(file);
      setPlayers(parsedPlayers);
      setMatchHistory(matches);

      toast.success('File processed successfully!');
    } catch (error) {
      console.error('Error parsing XLSX file:', error);
      toast.error('Error processing file. Please try again.');
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleGenerateTeams = (selectedPlayers: Player[]) => {
    try {
      const {
        teams: [newTeamA, newTeamB],
        debugInfo: newSelectionStats,
      } = selectTeamsWithStats(selectedPlayers, matchHistory);
      setTeams(newTeamA, newTeamB, newSelectionStats);
      toast.success('Teams generated successfully!');
    } catch (error) {
      console.error('Error generating teams:', error);
      toast.error('Error generating teams. Please try again.');
    }
  };

  const handleCopyPrompt = async () => {
    if (teamA.length === 0 || teamB.length === 0) {
      toast.error('Generate teams first');
      return;
    }

    try {
      const promptText = buildPromptFromTeams({
        teamA,
        teamB,
        matchHistory,
      });
      await navigator.clipboard.writeText(promptText);
      toast.success('Prompt copied to clipboard!');
    } catch (error) {
      console.error('Error copying prompt:', error);
      toast.error('Failed to copy prompt');
    }
  };

  return (
    <main className="relative">
      <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-start px-4 py-8 sm:min-h-[calc(100vh-4rem)] sm:py-12">
        <FileUpload onFileUpload={handleFileUpload} />
        {players.length > 0 && (
          <PlayerSelection
            onGenerateTeams={handleGenerateTeams}
            onCopyPrompt={handleCopyPrompt}
            onResetSelection={resetSelection}
          />
        )}

        <div ref={teamsRef} className="w-full max-w-4xl">
          <TeamDisplay teamA={teamA} teamB={teamB} selectionStats={debugInfo} />
        </div>
      </div>
    </main>
  );
};
