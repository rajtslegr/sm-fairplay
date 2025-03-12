import { useEffect, useRef } from 'react';

import { toast } from 'sonner';

import FileUpload from '@components/FileUpload';
import PlayerSelection from '@components/PlayerSelection';
import TeamDisplay from '@components/TeamDisplay';
import { useStore } from '@store/useStore';
import { getOnFirePlayer } from '@utils/onFirePlayer';
import { selectTeams } from '@utils/teamSelection';
import { parseXlsxData, Player } from '@utils/xlsxParser';

export const Homepage = () => {
  const {
    players,
    teamA,
    teamB,
    bestPlayer,
    setPlayers,
    setTeams,
    setBestPlayer,
    reset,
    resetSelection,
  } = useStore();

  const teamDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (teamA.length > 0 && teamB.length > 0 && teamDisplayRef.current) {
      const headerHeight = 96;
      const teamDisplayRect = teamDisplayRef.current.getBoundingClientRect();
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
      const parsedPlayers = await parseXlsxData(file);
      setPlayers(parsedPlayers);

      if (parsedPlayers.length > 0) {
        const best = getOnFirePlayer(parsedPlayers);
        setBestPlayer(best);
      } else {
        setBestPlayer(null);
      }
      toast.success('File processed successfully!');
    } catch (error) {
      console.error('Error parsing XLSX file:', error);
      toast.error('Error processing file. Please try again.');
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handlePlayersSelected = (selectedPlayers: Player[]) => {
    try {
      const [newTeamA, newTeamB] = selectTeams(selectedPlayers);
      setTeams(newTeamA, newTeamB);
      toast.success('Teams generated successfully!');
    } catch (error) {
      console.error('Error generating teams:', error);
      toast.error('Error generating teams. Please try again.');
    }
  };

  return (
    <main className="relative">
      <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-start px-4 py-8 sm:min-h-[calc(100vh-4rem)] sm:py-12">
        <FileUpload onFileUpload={handleFileUpload} />
        {players.length > 0 && (
          <PlayerSelection
            players={players}
            onPlayersSelected={handlePlayersSelected}
            onResetSelection={resetSelection}
          />
        )}
        <div ref={teamDisplayRef} className="w-full max-w-4xl">
          <TeamDisplay teamA={teamA} teamB={teamB} bestPlayer={bestPlayer} />
        </div>
      </div>
    </main>
  );
};
