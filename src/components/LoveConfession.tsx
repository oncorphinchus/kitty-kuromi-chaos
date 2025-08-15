import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import helloKittyHopeful from '@/assets/hello-kitty-hopeful.png';
import helloKittySad from '@/assets/hello-kitty-sad.png';
import kittyKuromiHappy from '@/assets/kitty-kuromi-happy.png';
import kuromiWink from '@/assets/kuromi-wink.png';

type GameState = 'initial' | 'chase' | 'first-click' | 'second-click' | 'third-click' | 'final-takeover' | 'happy-ending';

interface NoButtonState {
  id: string;
  x: number;
  y: number;
  size: number;
  text: string;
  isReal: boolean;
}

const LoveConfession: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('initial');
  const [noButtons, setNoButtons] = useState<NoButtonState[]>([
    { id: 'main', x: 0, y: 0, size: 100, text: 'No', isReal: true }
  ]);
  const [showKuromiWink, setShowKuromiWink] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; delay: number; emoji: string }>>([]);

  const getRandomPosition = useCallback(() => {
    const padding = 100;
    const maxX = window.innerWidth - padding * 2;
    const maxY = window.innerHeight - padding * 2;
    return {
      x: Math.random() * maxX + padding,
      y: Math.random() * maxY + padding,
    };
  }, []);

  const triggerGlitch = useCallback(() => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 500);
  }, []);

  const showKuromiWinkEffect = useCallback(() => {
    setShowKuromiWink(true);
    setTimeout(() => setShowKuromiWink(false), 1500);
  }, []);

  const generateConfetti = useCallback(() => {
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        delay: Math.random() * 2,
        emoji: Math.random() > 0.5 ? '💖' : '💀'
      });
    }
    setConfettiPieces(pieces);
    setTimeout(() => setConfettiPieces([]), 3000);
  }, []);

  const handleNoButtonHover = useCallback(() => {
    if (gameState === 'initial') {
      setGameState('chase');
      const newPosition = getRandomPosition();
      setNoButtons([{ 
        id: 'main', 
        x: newPosition.x, 
        y: newPosition.y, 
        size: 100, 
        text: 'No', 
        isReal: true 
      }]);
    }
  }, [gameState, getRandomPosition]);

  const handleNoButtonClick = useCallback((buttonId: string) => {
    const clickedButton = noButtons.find(btn => btn.id === buttonId);
    if (!clickedButton?.isReal) return;

    switch (gameState) {
      case 'initial':
      case 'chase':
        // First click
        setGameState('first-click');
        setNoButtons([{ 
          id: 'main', 
          x: noButtons[0].x, 
          y: noButtons[0].y, 
          size: 50, 
          text: 'Really?', 
          isReal: true 
        }]);
        showKuromiWinkEffect();
        triggerGlitch();
        break;

      case 'first-click':
        // Second click
        setGameState('second-click');
        const newButtons = [];
        for (let i = 0; i < 5; i++) {
          const pos = getRandomPosition();
          newButtons.push({
            id: `fake-${i}`,
            x: pos.x,
            y: pos.y,
            size: 50,
            text: 'Really?',
            isReal: i === 2 // Only one is real
          });
        }
        setNoButtons(newButtons);
        break;

      case 'second-click':
        // Third click
        setGameState('third-click');
        const pos = getRandomPosition();
        setNoButtons([{ 
          id: 'main', 
          x: pos.x, 
          y: pos.y, 
          size: 50, 
          text: 'Last chance...', 
          isReal: true 
        }]);
        document.body.classList.add('tilt', 'corrupted-cursor');
        break;

      case 'third-click':
        // Final takeover
        setGameState('final-takeover');
        setNoButtons([]);
        document.body.classList.remove('tilt', 'corrupted-cursor');
        break;
    }
  }, [gameState, noButtons, getRandomPosition, showKuromiWinkEffect, triggerGlitch]);

  const handleYesClick = useCallback(() => {
    setGameState('happy-ending');
    setNoButtons([]);
    generateConfetti();
    document.body.classList.remove('tilt', 'corrupted-cursor');
  }, [generateConfetti]);

  const handleFakeButtonClick = useCallback((buttonId: string) => {
    setNoButtons(prev => prev.filter(btn => btn.id !== buttonId));
  }, []);

  // Background flash effect for state 3
  useEffect(() => {
    if (gameState === 'second-click') {
      document.body.style.background = 'hsl(280, 65%, 25%)';
      setTimeout(() => {
        document.body.style.background = '';
      }, 100);
    }
  }, [gameState]);

  const getCharacterImage = () => {
    switch (gameState) {
      case 'happy-ending':
        return kittyKuromiHappy;
      case 'second-click':
      case 'third-click':
        return helloKittySad;
      case 'final-takeover':
        return helloKittySad;
      default:
        return helloKittyHopeful;
    }
  };

  const getHeadingText = () => {
    switch (gameState) {
      case 'final-takeover':
        return 'YOU SHOULDN\'T HAVE DONE THAT. STUPID NIGGER';
      case 'happy-ending':
        return 'YAY! I LOVE YOU TOO! NIGGABITCH';
      default:
        return 'Do you love me?';
    }
  };

  const getHeadingClass = () => {
    const baseClass = gameState === 'final-takeover' ? 'heading-corrupted' : 'heading-sweet';
    const glitchClass = isGlitching ? 'glitch' : '';
    return `${baseClass} ${glitchClass}`.trim();
  };

  const getBackgroundClass = () => {
    return gameState === 'final-takeover' ? 'background-corrupted' : 'background-sweet';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${getBackgroundClass()}`}>
      {/* Confetti */}
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="absolute text-4xl confetti pointer-events-none"
          style={{
            left: `${piece.x}px`,
            animationDelay: `${piece.delay}s`,
            zIndex: 1000
          }}
        >
          {piece.emoji}
        </div>
      ))}

      {/* Kuromi Wink Effect */}
      {showKuromiWink && (
        <div className="absolute top-10 right-10 z-50 animate-bounce">
          <img src={kuromiWink} alt="Kuromi winking" className="w-20 h-20" />
        </div>
      )}

      {/* Main Content */}
      <div className="text-center z-10 px-4">
        <h1 className={getHeadingClass()}>
          {getHeadingText()}
        </h1>

        {/* Character Image */}
        <div className="mb-12 flex justify-center">
          <img 
            src={getCharacterImage()} 
            alt="Hello Kitty" 
            className={`w-64 h-64 object-contain transition-all duration-500 ${gameState === 'happy-ending' ? 'pulse-heart' : ''}`}
          />
        </div>

        {/* Buttons Container */}
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center relative">
          {/* Yes Button */}
          {gameState !== 'final-takeover' ? (
            <Button
              onClick={handleYesClick}
              className={`btn-yes ${gameState === 'happy-ending' ? 'animate-pulse scale-110' : ''}`}
            >
              Yes! 💖
            </Button>
          ) : (
            <Button
              onClick={handleYesClick}
              className="btn-yes-final"
            >
              YES! 💖
            </Button>
          )}
        </div>
      </div>

      {/* No Buttons (positioned absolutely) */}
      {noButtons.map(button => (
        <Button
          key={button.id}
          className={`${button.size === 50 ? 'btn-no-small' : 'btn-no'} absolute teleport z-20`}
          style={{
            left: `${button.x}px`,
            top: `${button.y}px`,
            transform: `scale(${button.size / 100})`,
          }}
          onMouseEnter={button.id === 'main' ? handleNoButtonHover : undefined}
          onTouchStart={button.id === 'main' ? handleNoButtonHover : undefined}
          onClick={() => button.isReal ? handleNoButtonClick(button.id) : handleFakeButtonClick(button.id)}
        >
          {button.text}
        </Button>
      ))}

      {/* Initial No Button (only visible in initial state) */}
      {gameState === 'initial' && (
        <Button
          className="btn-no ml-4"
          onMouseEnter={handleNoButtonHover}
          onTouchStart={handleNoButtonHover}
          onClick={() => handleNoButtonClick('main')}
        >
          No
        </Button>
      )}
    </div>
  );
};

export default LoveConfession;
