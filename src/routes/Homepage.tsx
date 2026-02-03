import { useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import ApiKeyModal from '@components/ApiKeyModal';
import FileUpload from '@components/FileUpload';
import PlayerSelection from '@components/PlayerSelection';
import TeamDisplay from '@components/TeamDisplay';
import { useStore } from '@store/useStore';
import { selectTeamsWithAI } from '@utils/AiTeamSelection';
import { selectTeams } from '@utils/teamSelection';
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
    getApiKey,
    isApiKeyValid,
    setMatchHistory,
    matchHistory,
  } = useStore();

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [pendingSelectedPlayers, setPendingSelectedPlayers] = useState<
    Player[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const generateTeamsWithAI = async (
    selectedPlayers: Player[],
    apiKey: string,
  ) => {
    if (isGenerating) {
      toast.error('Team generation already in progress');
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading(
      'AI is generating teams and creating player assessments...',
    );

    try {
      if (!apiKey || apiKey.trim() === '') {
        toast.error('OpenRouter API key is missing or invalid.');
        toast.dismiss(toastId);
        setIsGenerating(false);
        return;
      }

      const result = await selectTeamsWithAI(
        selectedPlayers,
        apiKey,
        matchHistory,
      );

      if (result.teamA.length === 0 || result.teamB.length === 0) {
        throw new Error('AI failed to generate valid teams');
      }

      setTeams(
        result.teamA,
        result.teamB,
        result.teamExplanation,
        result.playerAssessments,
      );

      toast.success('AI teams and player assessments generated successfully!');
    } catch (error) {
      console.error('Error generating teams with AI:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error generating teams with AI. Please try again.');
      }
    } finally {
      toast.dismiss(toastId);
      setIsGenerating(false);
    }
  };

  const handlePlayersSelectedWithAI = (selectedPlayers: Player[]) => {
    if (!isApiKeyValid()) {
      setPendingSelectedPlayers(selectedPlayers);
      setIsApiKeyModalOpen(true);
    } else {
      const apiKey = getApiKey();
      generateTeamsWithAI(selectedPlayers, apiKey);
    }
  };

  const handleApiKeySuccess = (savedApiKey: string) => {
    setIsApiKeyModalOpen(false);

    if (pendingSelectedPlayers.length > 0 && savedApiKey) {
      setTimeout(() => {
        generateTeamsWithAI(pendingSelectedPlayers, savedApiKey);
        setPendingSelectedPlayers([]);
      }, 100);
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
            onPlayersSelectedWithAI={handlePlayersSelectedWithAI}
            onResetSelection={resetSelection}
            isGenerating={isGenerating}
          />
        )}
        <div ref={teamDisplayRef} className="w-full max-w-4xl">
          <TeamDisplay teamA={teamA} teamB={teamB} />
        </div>
      </div>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSuccess={handleApiKeySuccess}
      />
    </main>
  );
};
