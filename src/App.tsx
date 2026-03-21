import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { Renderer } from './game/Renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './game/constants';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Shield, Move, Zap, Volume2, VolumeX, Play, RotateCcw, Target } from 'lucide-react';
import { VirtualJoystick } from './components/VirtualJoystick';
import { audioManager } from './game/AudioManager';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        if (screen.orientation && (screen.orientation as any).lock) {
          (screen.orientation as any).lock('landscape').catch((err: any) => {
            console.warn(`Orientation lock failed: ${err.message}`);
          });
        }
      }).catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const unlockAudio = () => {
      audioManager.resume();
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('touchstart', unlockAudio);
    return () => window.removeEventListener('touchstart', unlockAudio);
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    let animationFrameId: number;
    
    const initGame = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(initGame);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      engineRef.current = new GameEngine();
      rendererRef.current = new Renderer(ctx);

      let lastTime = performance.now();
      const loop = (currentTime: number) => {
        const dt = Math.min(currentTime - lastTime, 100);
        lastTime = currentTime;

        if (engineRef.current && rendererRef.current) {
          const input = engineRef.current.inputManager;
          
          if (input.isPressed('KeyP')) {
            engineRef.current.state.isPaused = !engineRef.current.state.isPaused;
            input.setKey('KeyP', false);
          }

          if (input.isPressed('KeyR') && engineRef.current.state.isGameOver) {
            engineRef.current.state = engineRef.current.resetState();
          }

          engineRef.current.update(dt);
          rendererRef.current.render(engineRef.current.state);
          setGameState({ ...engineRef.current.state });
        }
        animationFrameId = requestAnimationFrame(loop);
      };

      animationFrameId = requestAnimationFrame(loop);
    };

    initGame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameStarted]);

  const handleStartGame = () => {
    setGameStarted(true);
    toggleFullScreen();
    audioManager.resume();
    audioManager.playSFX('kick');
    audioManager.startMusic();
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.state = engineRef.current.resetState();
      audioManager.playSFX('kick');
    }
  };

  const handleTogglePause = () => {
    if (engineRef.current) {
      engineRef.current.state.isPaused = !engineRef.current.state.isPaused;
    }
  };

  const handleToggleMute = () => {
    setIsMuted(audioManager.toggleMute());
  };

  return (
    <div 
      ref={containerRef}
      className={`w-screen h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-2 sm:p-4 font-mono overflow-hidden relative ${gameStarted ? 'touch-none' : ''}`}
    >
      <AnimatePresence mode="wait">
        {!gameStarted ? (
          <motion.div
            key="start-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl w-full bg-neutral-900 border-2 border-neutral-800 p-4 sm:p-8 pb-8 sm:pb-12 rounded-2xl shadow-2xl text-center z-50 overflow-y-auto max-h-[90vh] no-scrollbar"
          >
            <h1 className="text-4xl sm:text-6xl font-black mb-2 tracking-tighter text-red-600 italic uppercase">
              Leo's Brookling Adventures
            </h1>
            <p className="text-neutral-400 mb-4 sm:mb-8 text-sm sm:text-lg">
              As ruas são difíceis. Recupere seu bairro das gangues.
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-8 text-left">
              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Move size={20} />
                  <span className="font-bold uppercase text-xs">Movimentação</span>
                </div>
                <p className="text-sm text-neutral-300">Use o joystick virtual para se mover.</p>
              </div>
              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <div className="flex items-center gap-2 mb-2 text-red-400">
                  <Sword size={20} />
                  <span className="font-bold uppercase text-xs">Ações</span>
                </div>
                <p className="text-sm text-neutral-300">Toque nos botões para atacar, pular e arremessar.</p>
              </div>
              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <div className="flex items-center gap-2 mb-2 text-yellow-400">
                  <Zap size={20} />
                  <span className="font-bold uppercase text-xs">Objetivo</span>
                </div>
                <p className="text-sm text-neutral-300">Sobreviva o máximo possível. Pontue alto.</p>
              </div>
              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <div className="flex items-center gap-2 mb-2 text-green-400">
                  <Shield size={20} />
                  <span className="font-bold uppercase text-xs">Saúde</span>
                </div>
                <p className="text-sm text-neutral-300">Cuidado com seu HP. Não deixe eles te cercarem.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={handleStartGame}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-2xl rounded-xl transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] pointer-events-auto"
              >
                Iniciar Luta
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
              <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 invisible">
                {/* Spacer to maintain layout? or just use different structure */}
              </div>
              
              {/* Centered Controls */}
              <div className="absolute left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
                <button 
                  onClick={handleTogglePause}
                  className="bg-black/40 backdrop-blur-sm p-2 rounded-xl border border-white/10 active:bg-white/20 transition-colors"
                >
                  {gameState?.isPaused ? <Play size={18} /> : <span className="text-lg leading-none">⏸️</span>}
                </button>
                <button 
                  onClick={handleToggleMute}
                  className="bg-black/40 backdrop-blur-sm p-2 rounded-xl border border-white/10 active:bg-white/20 transition-colors"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>

              <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">NY, 1989</span>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="border-2 sm:border-8 border-neutral-900 rounded-xl sm:rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-neutral-900 p-0.5 sm:p-2">
              <div className="rounded-lg sm:rounded-2xl overflow-hidden border border-neutral-800">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="max-w-full max-h-[70vh] sm:max-h-none h-auto block touch-none"
                />
              </div>
            </div>

            {/* Touch Controls */}
            <div className="fixed inset-0 pointer-events-none flex items-end justify-between p-4 sm:p-6 z-20 select-none">
                {/* Joystick */}
                <div className="pointer-events-auto">
                  <VirtualJoystick 
                    onMove={(dir) => {
                      if (!engineRef.current) return;
                      engineRef.current.inputManager.handleJoystickMove(dir);
                    }}
                    onEnd={() => {
                      if (!engineRef.current) return;
                      engineRef.current.inputManager.handleJoystickEnd();
                    }}
                  />
                </div>

                {/* Action Buttons Circular Layout */}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 pointer-events-auto mb-4 mr-4">
                  {/* Attack (Top) - Larger */}
                  <button 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-red-600/20 backdrop-blur-md rounded-full flex items-center justify-center active:bg-red-600/40 active:scale-90 transition-all border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.2)] touch-none z-10"
                    onTouchStart={(e) => { e.preventDefault(); engineRef.current?.inputManager.setKey('KeyF', true); }}
                    onTouchEnd={(e) => { e.preventDefault(); engineRef.current?.inputManager.setKey('KeyF', false); }}
                  >
                    <Sword className="text-white" size={28} />
                  </button>

                  {/* Jump (Right) */}
                  <button 
                    className="absolute top-1/2 right-0 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center active:bg-white/20 active:scale-90 transition-all border border-white/20 shadow-lg touch-none"
                    onTouchStart={(e) => { e.preventDefault(); engineRef.current?.inputManager.setKey('Space', true); }}
                    onTouchEnd={(e) => { e.preventDefault(); engineRef.current?.inputManager.setKey('Space', false); }}
                  >
                    <Zap className="rotate-90 text-white/80" size={18} />
                  </button>

                  {/* Stone Attack (Left) */}
                  <button 
                    className="absolute top-1/2 left-0 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center active:bg-white/20 active:scale-90 transition-all border border-white/20 shadow-lg touch-none"
                    onTouchStart={(e) => { e.preventDefault(); engineRef.current?.inputManager.setKey('KeyG', true); }}
                    onTouchEnd={(e) => { e.preventDefault(); engineRef.current?.inputManager.setKey('KeyG', false); }}
                  >
                    <Target className="text-white/80" size={20} />
                  </button>

                  {/* Run (Bottom) */}
                  <button 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center active:bg-white/20 active:scale-90 transition-all border border-white/20 shadow-lg touch-none"
                    onTouchStart={(e) => { e.preventDefault(); engineRef.current?.inputManager.setKey('ShiftLeft', true); }}
                    onTouchEnd={(e) => { e.preventDefault(); engineRef.current?.inputManager.setKey('ShiftLeft', false); }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-white/80">Correr</span>
                  </button>

                  {/* Restart Button (Floating above/below if game over) */}
                  {gameState?.isGameOver && (
                    <button 
                      className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center active:bg-red-500/40 active:scale-95 transition-all border border-red-500/30 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-400 touch-none flex gap-2 items-center whitespace-nowrap"
                      onClick={handleRestart}
                    >
                      <RotateCcw size={12} />
                      Reiniciar
                    </button>
                  )}
                </div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

