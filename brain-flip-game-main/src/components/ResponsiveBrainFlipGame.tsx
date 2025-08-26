'use client';
import { useEffect, useState } from 'react';
import { useMobile } from '@/hooks/useMobile';
import { useGameStore } from '@/store/gameStore';
import { MobileBrainFlipGame } from './mobile/MobileBrainFlipGame';
import { BrainFlipGameBoard } from './game/BrainFlipGameBoard';
import dynamic from 'next/dynamic';

// Dynamically import desktop version to avoid SSR issues
const DesktopBrainFlipGame = dynamic(() => import('./game/BrainFlipGameBoard'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <div>Loading Brain Flip...</div>
      </div>
    </div>
  )
});

export function ResponsiveBrainFlipGame() {
  const mobile = useMobile();
  const { isActive, hasStarted, startGame, resetGame } = useGameStore();
  const [isClient, setIsClient] = useState(false);
  const [forceDesktop, setForceDesktop] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if user has preference for desktop version
    const desktopPreference = localStorage.getItem('brainflip-force-desktop');
    if (desktopPreference === 'true') {
      setForceDesktop(true);
    }
  }, []);

  // Don't render anything until client-side hydration
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div>Loading Brain Flip...</div>
        </div>
      </div>
    );
  }

  const shouldUseMobile = (mobile.isMobile || mobile.isTablet) && !forceDesktop;

  const toggleVersion = () => {
    const newForceDesktop = !forceDesktop;
    setForceDesktop(newForceDesktop);
    localStorage.setItem('brainflip-force-desktop', newForceDesktop.toString());
  };

  // Show main menu if game hasn't started
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4 relative">
        {/* Version Toggle Button */}
        {(mobile.isMobile || mobile.isTablet) && (
          <button
            onClick={toggleVersion}
            className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/20 hover:bg-black/70 transition-colors"
          >
            {shouldUseMobile ? '🖥️ Desktop' : '📱 Mobile'}
          </button>
        )}

        {/* Main Menu */}
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-8">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Brain
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent">
              Flip
            </span>
          </h1>
          
          <p className="text-xl text-white/80 mb-12 max-w-2xl">
            Can you think backwards? Do the <span className="text-green-400 font-bold">OPPOSITE</span> of every instruction!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => startGame('classic')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-8 rounded-lg text-lg hover:scale-105 transition-transform"
            >
              🎮 Start Classic Game
            </button>
            <button
              onClick={() => startGame('sudden-death')}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-4 px-8 rounded-lg text-lg hover:scale-105 transition-transform"
            >
              💀 Sudden Death
            </button>
            <button
              onClick={() => startGame('duel')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-lg text-lg hover:scale-105 transition-transform"
            >
              ⚔️ Duel Mode
            </button>
          </div>

          <div className="mt-12 text-white/60 text-sm">
            <p>Use keyboard arrows (WASD) or click buttons to play</p>
            <p>Remember: Do the OPPOSITE of what you see!</p>
          </div>
        </div>

        {/* Performance Monitor (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs p-2 rounded border border-white/20">
            <div>Mode: {shouldUseMobile ? 'Mobile' : 'Desktop'}</div>
            <div>Screen: {mobile.screenSize}</div>
            <div>Touch: {mobile.isTouchDevice ? 'Yes' : 'No'}</div>
            <div>Orientation: {mobile.orientation}</div>
            {mobile.hasNotch && <div>Notch: Detected</div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Version Toggle Button */}
      {(mobile.isMobile || mobile.isTablet) && (
        <button
          onClick={toggleVersion}
          className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/20 hover:bg-black/70 transition-colors"
        >
          {shouldUseMobile ? '🖥️ Desktop' : '📱 Mobile'}
        </button>
      )}

      {/* Render appropriate version */}
      {shouldUseMobile ? (
        <MobileBrainFlipGame />
      ) : (
        <BrainFlipGameBoard />
      )}

      {/* Performance Monitor (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs p-2 rounded border border-white/20">
          <div>Mode: {shouldUseMobile ? 'Mobile' : 'Desktop'}</div>
          <div>Screen: {mobile.screenSize}</div>
          <div>Touch: {mobile.isTouchDevice ? 'Yes' : 'No'}</div>
          <div>Orientation: {mobile.orientation}</div>
          {mobile.hasNotch && <div>Notch: Detected</div>}
        </div>
      )}
    </div>
  );
}