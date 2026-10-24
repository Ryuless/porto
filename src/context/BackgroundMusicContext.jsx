import { useCallback, useEffect, useRef, useState } from 'react';
import backgroundMusic from '../assets/Tiga Detik (Instrumental) - Pinku Rimu.mp3';
import { useBackgroundMusicSettings } from '../hooks/useBackgroundMusicSettings';
import { BackgroundMusicContext } from './BackgroundMusicContextBase';

export const BackgroundMusicProvider = ({ children }) => {
  const audioRef = useRef(null);
  const volumeRef = useRef(0.05);
  const [isPlaying, setIsPlaying] = useState(false);
  const { volume } = useBackgroundMusicSettings();

  useEffect(() => {
    volumeRef.current = volume / 100;
    if (audioRef.current) audioRef.current.volume = volumeRef.current;
  }, [volume]);

  const playMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volumeRef.current;
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, []);

  useEffect(() => {
    const startMusic = event => {
      if (event.target instanceof Element && event.target.closest('button')) return;
      playMusic();
    };

    playMusic();
    window.addEventListener('pointerdown', startMusic);
    window.addEventListener('keydown', startMusic);
    window.addEventListener('touchstart', startMusic);

    return () => {
      window.removeEventListener('pointerdown', startMusic);
      window.removeEventListener('keydown', startMusic);
      window.removeEventListener('touchstart', startMusic);
    };
  }, [playMusic]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      playMusic();
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  return (
    <BackgroundMusicContext.Provider value={{ isPlaying, toggleMusic }}>
      <audio ref={audioRef} loop preload="auto" aria-label="Musik latar">
        <source src={backgroundMusic} type="audio/mpeg" />
      </audio>
      {children}
    </BackgroundMusicContext.Provider>
  );
};
