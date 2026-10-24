import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Home from './pages/public/Home';
import ProjectDetail from './pages/public/ProjectDetail';
import ProjectsPage from './pages/public/ProjectsPage';
import yueImage from './assets/yue.png';
import poseOneImage from './assets/pose1.png';
import { BackgroundMusicProvider } from './context/BackgroundMusicContext';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Menyiapkan interface');
  const [signal, setSignal] = useState({ label: 'STANDARD', color: 'text-emerald-300', icon: '●' });

  useEffect(() => {
    const minimumDisplayTime = 1800;
    const completedDisplayTime = 700;
    const startedAt = Date.now();
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const getSignal = () => {
      const downlink = Number(connection?.downlink || 0);
      const type = connection?.effectiveType?.toLowerCase() || '';

      if (type === 'slow-2g' || type === '2g' || (downlink > 0 && downlink < 1.5)) {
        return { label: 'LOW', color: 'text-red-400', icon: '●' };
      }
      if (type === '4g' || downlink >= 10) {
        return { label: 'FAST', color: 'text-blue-400', icon: '⚡' };
      }
      return { label: 'STANDARD', color: 'text-emerald-300', icon: '●' };
    };
    const updateSignal = () => setSignal(getSignal());
    const completedTasks = new Set();
    const totalTasks = 4;
    let previewFinished = false;
    let completionScheduled = false;
    let paintFrame;
    let previewFrame;
    let previewTimer;
    let completionTimer;
    let displayedProgress = 0;

    const setMonotonicProgress = (nextProgress) => {
      displayedProgress = Math.max(displayedProgress, nextProgress);
      setProgress(displayedProgress);
    };

    const scheduleCompletion = () => {
      if (completionScheduled || !previewFinished || completedTasks.size !== totalTasks) return;

      completionScheduled = true;
      setMonotonicProgress(100);
      setStatus('Siap dijelajahi');
      completionTimer = setTimeout(onComplete, completedDisplayTime);
    };

    const finishPreview = () => {
      previewFinished = true;
      setMonotonicProgress(100);
      scheduleCompletion();
    };

    const completeTask = (task) => {
      if (completedTasks.has(task)) return;
      completedTasks.add(task);
      setStatus([
        'Menyiapkan interface',
        'Mengumpulkan ide kecil',
        'Merapikan detail',
        'Siap dijelajahi',
      ][completedTasks.size - 1]);
      scheduleCompletion();
    };

    const waitForWindow = () => {
      if (document.readyState === 'complete') {
        completeTask('window');
        return undefined;
      }
      const handleLoad = () => completeTask('window');
      window.addEventListener('load', handleLoad, { once: true });
      return () => window.removeEventListener('load', handleLoad);
    };

    const waitForImage = (source, task) => {
      const image = new Image();
      image.onload = () => completeTask(task);
      image.onerror = () => completeTask(task);
      image.src = source;
    };

    updateSignal();
    const animatePreview = () => {
      const elapsed = Date.now() - startedAt;
      const previewProgress = Math.min(100, Math.round((elapsed / minimumDisplayTime) * 100));
      setMonotonicProgress(previewProgress);
      if (elapsed < minimumDisplayTime) {
        previewFrame = requestAnimationFrame(animatePreview);
      }
    };
    previewFrame = requestAnimationFrame(animatePreview);
    previewTimer = setTimeout(finishPreview, minimumDisplayTime);
    waitForWindow();
    waitForImage(yueImage, 'hero image');
    waitForImage(poseOneImage, 'profile image');

    if (connection) connection.addEventListener('change', updateSignal);
    const fonts = document.fonts?.ready || Promise.resolve();
    paintFrame = requestAnimationFrame(() => {
      fonts.then(() => completeTask('paint'));
    });

    return () => {
      if (connection) connection.removeEventListener('change', updateSignal);
      cancelAnimationFrame(paintFrame);
      cancelAnimationFrame(previewFrame);
      clearTimeout(previewTimer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.55, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[200] flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-slate-100"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[100px]" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="absolute h-64 w-64 rounded-full border border-cyan-300/15 border-t-cyan-300/80"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-10 flex items-center justify-between text-xs tracking-[0.22em] text-slate-500">
          <span>RYUU / PORTFOLIO</span>
          <span className={signal.color}> {signal.icon} SIGNAL / {signal.label}</span>
        </div>
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/30 bg-cyan-300/10 text-4xl text-cyan-200 shadow-[0_0_45px_rgba(103,232,249,0.2)]"
          >
            ✦
          </motion.div>
          <h1 className="mt-8 text-3xl font-black tracking-tight text-white">Small world, loading...</h1>
          <p className="mt-3 text-sm text-slate-400">{status}...</p>
        </div>
        <div className="mt-10">
          <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500">
            <span>Menyiapkan experience</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.12, ease: 'linear' }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const finishLoading = useCallback(() => setIsLoading(false), []);

  return (
    <BackgroundMusicProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
          <AnimatePresence>
            {isLoading && <LoadingScreen onComplete={finishLoading} />}
          </AnimatePresence>
        </AuthProvider>
      </ThemeProvider>
    </BackgroundMusicProvider>
  );
}

export default App;
