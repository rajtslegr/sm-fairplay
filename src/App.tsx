import { useEffect, useRef } from 'react';

import { toast } from 'sonner';

import FileUpload from '@components/FileUpload';
import InfoModal from '@components/InfoModal';
import PlayerSelection from '@components/PlayerSelection';
import SoccerBall from '@components/SoccerBall';
import TeamDisplay from '@components/TeamDisplay';
import { useStore } from '@store/useStore';
import { selectTeams, calculatePlayerScore } from '@utils/teamSelection';
import { parseXlsxData, Player } from '@utils/xlsxParser';

const App = () => {
  const {
    players,
    teamA,
    teamB,
    bestPlayer,
    showInfo,
    setPlayers,
    setTeams,
    setBestPlayer,
    setShowInfo,
    reset,
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

      const best = parsedPlayers.reduce((prev, current) =>
        calculatePlayerScore(current) > calculatePlayerScore(prev)
          ? current
          : prev,
      );
      setBestPlayer(best);
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
    <div className="flex min-h-screen flex-col bg-background font-inter text-gray-50">
      <header className="fixed z-20 w-full">
        <div className="bg-background/70 shadow-md backdrop-blur-md">
          {' '}
          <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <img
                src="/stemmark-logo.png"
                alt="STEM/MARK logo"
                className="h-8 w-auto"
              />
              <nav>
                <span>Fair Play</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowInfo(true)}
                className="text-gray-300 hover:text-[#982054]"
              >
                Info
              </button>
              <a
                href="https://github.com/rajtslegr/sm-fairplay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#982054]"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>
      <div className="relative z-10">
        <SoccerBall />
        <main className="relative pt-24 sm:pt-16">
          <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-start px-4 py-8 sm:min-h-[calc(100vh-4rem)] sm:py-12">
            <FileUpload onFileUpload={handleFileUpload} />
            {players.length > 0 && (
              <PlayerSelection
                players={players}
                onPlayersSelected={handlePlayersSelected}
                onResetSelection={reset}
              />
            )}
            <div ref={teamDisplayRef} className="w-full max-w-4xl">
              <TeamDisplay
                teamA={teamA}
                teamB={teamB}
                bestPlayer={bestPlayer}
              />
            </div>
          </div>
        </main>
      </div>
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
};

export default App;
