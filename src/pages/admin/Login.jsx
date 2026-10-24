import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const authErrorMessages = {
  'auth/invalid-credential': 'Email atau password belum cocok.',
  'auth/invalid-email': 'Format email belum valid.',
  'auth/user-disabled': 'Akun ini sedang dinonaktifkan.',
  'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa saat.',
};
const RECAPTCHA_SITE_KEY = '6Lfm7v4tAAAAACmwL2dtNfjlg3jJrJ3i1XArJZ3RF';
const LOGIN_LIMIT = 5;
const LOGIN_LOCKOUT_MS = 60_000;
const LOGIN_ATTEMPTS_KEY = 'admin-login-attempts';

const Login = () => {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [captchaReady, setCaptchaReady] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const captchaScriptRef = useRef(null);

  useEffect(() => {
    if (window.grecaptcha?.ready) {
      const readyTimer = window.setTimeout(() => setCaptchaReady(true), 0);
      return () => window.clearTimeout(readyTimer);
    }

    const existingScript = document.querySelector('script[data-recaptcha="admin-login"]');
    const script = existingScript || document.createElement('script');
    if (!existingScript) {
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      script.dataset.recaptcha = 'admin-login';
      document.head.appendChild(script);
    }
    captchaScriptRef.current = script;
    const handleLoad = () => setCaptchaReady(Boolean(window.grecaptcha?.ready));
    script.addEventListener('load', handleLoad);
    return () => script.removeEventListener('load', handleLoad);
  }, []);

  const clearFeedback = () => setNotice(null);

  const getCaptchaToken = async () => {
    if (!captchaReady || !window.grecaptcha) throw new Error('CAPTCHA belum siap. Tunggu sebentar lalu coba lagi.');
    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'admin_login' })
          .then(resolve)
          .catch(() => reject(new Error('Verifikasi CAPTCHA gagal.')));
      });
    });
  };

  const getLoginState = () => {
    try {
      const state = JSON.parse(sessionStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
      return { count: Number(state.count) || 0, lockedUntil: Number(state.lockedUntil) || 0 };
    } catch {
      return { count: 0, lockedUntil: 0 };
    }
  };

  const registerFailedLogin = () => {
    const state = getLoginState();
    const count = state.count + 1;
    const lockedUntil = count >= LOGIN_LIMIT ? Date.now() + LOGIN_LOCKOUT_MS : 0;
    sessionStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({ count, lockedUntil }));
    return lockedUntil;
  };

  const clearLoginState = () => sessionStorage.removeItem(LOGIN_ATTEMPTS_KEY);

  const handleLogin = async event => {
    event.preventDefault();
    clearFeedback();
    const loginState = getLoginState();
    if (loginState.lockedUntil > Date.now()) {
      setNotice({ type: 'error', text: 'Login dikunci sementara setelah beberapa percobaan gagal. Coba lagi nanti.' });
      return;
    }
    if (honeypot) return;
    setLoading(true);
    try {
      await getCaptchaToken();
      await login(email.trim(), password);
      clearLoginState();
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      const lockedUntil = error.code?.startsWith('auth/') ? registerFailedLogin() : 0;
      setNotice({ type: 'error', text: lockedUntil ? 'Terlalu banyak percobaan gagal. Login dikunci selama 1 menit.' : authErrorMessages[error.code] || error.message || 'Login gagal. Coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async event => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setNotice({ type: 'success', text: 'Jika email terdaftar, tautan reset password sudah dikirim. Periksa inbox dan folder spam.' });
    } catch (error) {
      console.error(error);
      setNotice({ type: 'error', text: authErrorMessages[error.code] || 'Email reset password gagal dikirim. Coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  const showLogin = () => {
    clearFeedback();
    setMode('login');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b16] px-5 py-8 text-slate-100 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute -left-32 top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/10 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-40 right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-violet-500/10 blur-[120px]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-cyan-950/20 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]"
        >
          <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-gradient-to-br from-cyan-300/[0.14] via-slate-950/20 to-violet-400/[0.12] p-10 lg:flex">
            <div className="absolute -right-24 top-24 h-64 w-64 rounded-full border border-cyan-300/20" />
            <div className="absolute -right-12 top-36 h-40 w-40 rounded-full border border-cyan-300/20" />
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-xl font-black text-slate-950">✦</span>
                <div><p className="text-[10px] uppercase tracking-[0.25em] text-cyan-200">Ryuu / Workspace</p><p className="font-bold text-white">Nexus Admin</p></div>
              </div>
              <div className="relative mt-28 max-w-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Private area</p>
                <h1 className="mt-4 text-5xl font-black leading-[0.98] tracking-[-0.05em] text-white">Build small.<br /><span className="text-cyan-300">Make it real.</span></h1>
                <p className="mt-6 max-w-xs text-sm leading-7 text-slate-300/70">Satu ruang untuk merapikan project, mengatur portfolio, dan menjaga detail tetap hidup.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Secure workspace <span className="text-slate-600">/</span> Firebase Auth</div>
          </aside>

          <section className="p-7 sm:p-10 lg:p-14">
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 text-slate-950">✦</span><p className="font-bold text-white">Nexus Admin</p></div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Sign in</span>
            </div>

            {mode === 'login' && (
              <>
                <div className="mb-9"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Welcome back</p><h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Masuk ke workspace.</h2><p className="mt-3 text-sm leading-6 text-slate-400">Kelola karya dan pengaturan portfolio dari satu tempat.</p></div>
                {notice && <Feedback {...notice} />}
                <form onSubmit={handleLogin} className="space-y-5">
                  <input type="text" tabIndex="-1" autoComplete="off" value={honeypot} onChange={event => setHoneypot(event.target.value)} aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
                  <Field label="Email admin" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                  <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-semibold text-slate-300">Password</label><button type="button" onClick={() => { clearFeedback(); setMode('reset'); }} className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-200">Lupa password?</button></div><input id="password" type="password" value={password} onChange={event => setPassword(event.target.value)} required placeholder="Masukkan password" className="auth-input" /></div>
                  <button disabled={loading || !captchaReady} type="submit" className="auth-primary">{loading ? 'Memverifikasi...' : !captchaReady ? 'Menyiapkan keamanan...' : 'Masuk ke dashboard'} <span aria-hidden="true">→</span></button>
                </form>
                <button type="button" onClick={() => { clearFeedback(); setMode('email-help'); }} className="mt-8 text-sm text-slate-500 transition hover:text-slate-300">Tidak ingat email akun?</button>
              </>
            )}

            {mode === 'reset' && (
              <>
                <div className="mb-9"><button type="button" onClick={showLogin} className="mb-7 text-sm text-slate-400 transition hover:text-white">← Kembali ke login</button><p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Account recovery</p><h2 className="mt-3 text-3xl font-black tracking-tight text-white">Reset password.</h2><p className="mt-3 text-sm leading-6 text-slate-400">Masukkan email akun admin. Kami akan mengirim tautan untuk membuat password baru.</p></div>
                {notice && <Feedback {...notice} />}
                <form onSubmit={handleResetPassword} className="space-y-5"><Field label="Email akun admin" type="email" value={email} onChange={setEmail} placeholder="you@example.com" /><button disabled={loading} type="submit" className="auth-primary">{loading ? 'Mengirim tautan...' : 'Kirim reset link'} <span aria-hidden="true">↗</span></button></form>
              </>
            )}

            {mode === 'email-help' && (
              <>
                <div className="mb-9"><button type="button" onClick={showLogin} className="mb-7 text-sm text-slate-400 transition hover:text-white">← Kembali ke login</button><p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Need a hand?</p><h2 className="mt-3 text-3xl font-black tracking-tight text-white">Lupa email akun?</h2><p className="mt-4 text-sm leading-7 text-slate-400">Demi keamanan, Firebase tidak menampilkan atau mencari email akun dari halaman publik.</p></div>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-slate-300"><p className="font-semibold text-white">Coba cek:</p><p>• Password manager atau browser autofill.</p><p>• Inbox dengan kata kunci “Firebase” atau “Nexus Admin”.</p><p>• Email yang digunakan saat membuat akun admin.</p></div>
                <button type="button" onClick={showLogin} className="auth-secondary mt-6">Kembali ke login</button>
              </>
            )}
          </section>
        </motion.section>
      </div>
    </main>
  );
};

const Field = ({ label, type, value, onChange, placeholder }) => (
  <div><label htmlFor={label} className="mb-2 block text-sm font-semibold text-slate-300">{label}</label><input id={label} type={type} value={value} onChange={event => onChange(event.target.value)} required className="auth-input" placeholder={placeholder} /></div>
);

const Feedback = ({ type, text }) => <div role={type === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${type === 'error' ? 'border-rose-400/25 bg-rose-400/10 text-rose-200' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'}`}>{text}</div>;

export default Login;
