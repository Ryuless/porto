import { useContext } from 'react';
import { BackgroundMusicContext } from '../context/BackgroundMusicContextBase';

export const useBackgroundMusic = () => useContext(BackgroundMusicContext);
