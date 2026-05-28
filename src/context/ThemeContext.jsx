import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default Cyberpunk Dark

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Palet Warna untuk Ambient Fading Background
  // Cyberpunk/Deep Space
  const darkBackgrounds = [
    'linear-gradient(135deg, #0f172a 0%, #171727 100%)',   // Deep slate
    'linear-gradient(135deg, #111827 0%, #0a0b10 100%)',   // Charcoal void
    'linear-gradient(135deg, #090e17 0%, #161122 100%)'    // Purple-ish space
  ];

  // Minimalist Nordic/Neo-Brutalism
  const lightBackgrounds = [
    'linear-gradient(135deg, #fdfbf7 0%, #f3f4f6 100%)',   // Warm cream
    'linear-gradient(135deg, #fafaf9 0%, #eef2f6 100%)',   // Nordic cool grey
    'linear-gradient(135deg, #fefbfc 0%, #f4eee2 100%)'    // Soft earth tone
  ];

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isDarkMode ? 'dark' : 'light'}
          animate={{
            background: isDarkMode ? darkBackgrounds : lightBackgrounds,
          }}
          transition={{
            duration: 10,       // Transisi lambat untuk efek ambient
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'linear'
          }}
          className={`min-h-screen w-full transition-colors duration-500 ease-in-out ${
            isDarkMode 
              ? 'text-cyan-50 dark-theme-cyberpunk' 
              : 'text-gray-900 light-theme-brutalism'
          }`}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </ThemeContext.Provider>
  );
};
