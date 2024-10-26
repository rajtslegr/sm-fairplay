import { useState, useRef, useEffect } from 'react';

import FileUpload from '@components/FileUpload';
import PlayerSelection from '@components/PlayerSelection';
import TeamDisplay from '@components/TeamDisplay';
import { selectTeams } from '@utils/teamSelection';
import { parseXlsxData, Player } from '@utils/xlsxParser';

const App = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const teamDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      teamA.length > 0 &&
      teamB.length > 0 &&
      teamDisplayRef.current &&
      contentRef.current
    ) {
      const headerHeight = 96;
      const teamDisplayTop = teamDisplayRef.current.offsetTop;
      const scrollContainer = contentRef.current;

      scrollContainer.scrollTo({
        top: teamDisplayTop - headerHeight,
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
    <div className="flex min-h-screen flex-col bg-[#242424] font-inter text-base font-normal leading-6 text-gray-50">
      <header className="fixed inset-x-0 top-0 z-10 bg-[#242424] p-4">
        <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex">⚽</div>
            <nav>
              <span>STEM/MARK Fair Play</span>
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
      </header>
      <main className="mt-24 flex grow flex-col sm:mt-16">
        <div
          ref={contentRef}
          className="flex h-[calc(100vh-6rem)] flex-col items-center justify-start overflow-y-auto px-4 py-8 sm:h-[calc(100vh-4rem)] sm:py-12"
        >
          <h1 className="mb-4 text-xl font-bold sm:text-2xl">
            Soccer Team Selection
          </h1>
          <FileUpload onFileUpload={handleFileUpload} />
          {players.length > 0 && (
            <PlayerSelection
              players={players}
              onPlayersSelected={handlePlayersSelected}
              onResetSelection={handleResetSelection}
            />
          )}
          <div ref={teamDisplayRef} className="w-full max-w-4xl" />
          {teamA.length > 0 && teamB.length > 0 && (
            <TeamDisplay teamA={teamA} teamB={teamB} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
