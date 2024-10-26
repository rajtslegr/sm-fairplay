import { useState, useEffect } from 'react';

const SoccerBall = () => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState('text-3xl');

  useEffect(() => {
    const moveBall = () => {
      setPosition({
        x: Math.random() * 100,
        y: Math.random() * 100,
      });
      const sizes = ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl'];
      setSize(sizes[Math.floor(Math.random() * sizes.length)]);
    };

    const interval = setInterval(moveBall, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed ${size} z-0 flex items-center justify-center opacity-20 transition-all duration-1000 ease-in-out`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      ⚽
    </div>
  );
};

export default SoccerBall;
