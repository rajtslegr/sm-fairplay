import { useState, useRef, useEffect } from 'react';

import FileUpload from '@components/FileUpload';
import PlayerSelection from '@components/PlayerSelection';
import SoccerBall from '@components/SoccerBall';
import TeamDisplay from '@components/TeamDisplay';
import { selectTeams } from '@utils/teamSelection';
import { parseXlsxData, Player } from '@utils/xlsxParser';

const App = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const teamDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (teamA.length > 0 && teamB.length > 0 && teamDisplayRef.current) {
      const headerHeight = 96; // Adjust this value if your header height changes
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
    try {
      const parsedPlayers = await parseXlsxData(file);
      setPlayers(parsedPlayers);
    } catch (error) {
      console.error('Error parsing XLSX file:', error);
    }
  };

  const handlePlayersSelected = (selectedPlayers: Player[]) => {
    const [newTeamA, newTeamB] = selectTeams(selectedPlayers);
    setTeamA(newTeamA);
    setTeamB(newTeamB);
  };

  const handleResetSelection = () => {
    setTeamA([]);
    setTeamB([]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#242424] font-inter text-gray-50">
      <header className="fixed z-20 w-full">
        <div className="bg-[#242424]/70 shadow-md backdrop-blur-md">
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
                onResetSelection={handleResetSelection}
              />
            )}
            <div ref={teamDisplayRef} className="w-full max-w-4xl">
              {teamA.length > 0 && teamB.length > 0 && (
                <TeamDisplay teamA={teamA} teamB={teamB} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
