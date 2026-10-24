import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export const backgroundMusicFileName = 'Tiga Detik (Instrumental) - Pinku Rimu.mp3';
export const defaultBackgroundMusicVolume = 5;

export const useBackgroundMusicSettings = () => {
  const [volume, setVolume] = useState(defaultBackgroundMusicVolume);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'siteSettings', 'backgroundMusic'), snapshot => {
      const nextVolume = Number(snapshot.data()?.volume);
      setVolume(Number.isFinite(nextVolume) ? Math.min(100, Math.max(0, nextVolume)) : defaultBackgroundMusicVolume);
      setError(null);
    }, snapshotError => {
      console.error('Firestore background music settings error:', snapshotError);
      setError(snapshotError);
    });

    return unsubscribe;
  }, []);

  return { volume, setVolume, error };
};
