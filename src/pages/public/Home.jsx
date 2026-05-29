import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Typewriter = ({ text, delay = 100 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span>{currentText}</span>;
};

const HeroSection = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 pt-24 pb-10 relative overflow-hidden">
      {/* 3D / Floating Elements Background (Abstract visual) */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full top-20 left-10 pointer-events-none"
      />
      <motion.div 
        animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-80 h-80 bg-emerald-500/20 blur-[120px] rounded-full bottom-20 right-10 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10"
      >
        <h2 className="text-xl md:text-2xl font-semibold mb-4 tracking-widest uppercase opacity-80">
          Welcome to my universe
        </h2>
        <h1 className="text-5xl md:text-7xl font-black mb-6 pb-2 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
          <Typewriter text="I'm a Full-Stack Developer & Designer." delay={60} />
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 opacity-75">
          Crafting premium digital experiences through seamless code and striking visual design.
        </p>

        <div className="flex flex-wrap gap-4 justify-center w-full max-w-4xl mx-auto">
          <motion.button 
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
          >
            Explore Work
          </motion.button>
          <motion.button 
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-3 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 font-bold rounded-full transition-all"
          >
            Skills Matrix
          </motion.button>
          <motion.button 
            onClick={() => document.getElementById('social')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-3 border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-bold rounded-full transition-all"
          >
            Social Media
          </motion.button>
          <motion.button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-3 border border-cyan-500/50 hover:bg-cyan-500/10 font-bold rounded-full transition-all"
          >
            Contact Me
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

const SkillsSection = () => {
  const { projects, skills, loading } = usePortfolioData();
  const totalProjects = projects.length;

  return (
    <section id="about" className="py-20 px-6 max-w-5xl mx-auto">
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 inline-block">
          Dynamic Skill Matrix
        </h2>
        <div className="mt-4 flex flex-col items-center justify-center space-y-2">
          <p className="opacity-70">Skills leveled up based on completed projects.</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <span className="text-sm opacity-70">Total Portfolio Projects:</span>
            <span className="font-mono text-lg text-cyan-400 font-bold">{totalProjects}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center animate-pulse">Computing skills...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((skill, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={skill.name} 
              className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg">{skill.name}</span>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/70">
                    {skill.count} Project{skill.count > 1 ? 's' : ''}
                  </span>
                </div>
                <span className="font-mono text-cyan-400">{Math.round(skill.progress)}%</span>
              </div>
              <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

const ProjectsSection = () => {
  const { projects, loading } = usePortfolioData();
  const [filter, setFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(3);

  const categories = ['All', 'Web Development', 'Design/Editing', 'Fotografi', 'Game Development'];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);
  const displayedProjects = filteredProjects.slice(0, visibleCount);

  const handleFilterChange = (cat) => {
    setFilter(cat);
    setVisibleCount(3); // Reset to 3 when switching category
  };

  return (
    <section id="projects" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Featured Projects
        </h2>
      </div>

      <div className="flex justify-start md:justify-center gap-2 md:gap-4 mb-12 overflow-x-auto md:overflow-visible pb-4 md:pb-0 px-2 md:px-0 flex-nowrap md:flex-wrap snap-x hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleFilterChange(cat)}
            className={`whitespace-nowrap snap-center text-sm md:text-base px-5 py-2 md:px-6 md:py-2 rounded-full font-medium transition-all ${
              filter === cat 
                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center animate-pulse">Loading projects...</div>
      ) : (
        <>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {displayedProjects.map((project) => {
              const isWeb = project.category === 'Web Development';
              // Jika Web Dev dan punya URL, arahkan ke URL eksternalnya. Jika Design, ke halaman detail.
              const targetUrl = isWeb ? (project.projectUrl || '#') : `/project/${project.id}`;

              const CardWrapper = isWeb && project.projectUrl ? 'a' : Link;

              return (
                <CardWrapper
                  href={isWeb && project.projectUrl ? project.projectUrl : undefined}
                  to={!isWeb || !project.projectUrl ? targetUrl : undefined}
                  target={isWeb && project.projectUrl ? "_blank" : undefined}
                  rel={isWeb && project.projectUrl ? "noopener noreferrer" : undefined}
                  key={project.id}
                  className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-cyan-500/50 transition-colors block cursor-pointer"
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <div className="h-48 bg-black/30 flex items-center justify-center p-0 overflow-hidden relative">
                      {project.imageUrl ? (
                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform duration-500">
                          [No Thumbnail]
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                      {/* Hint for interaction */}
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isWeb ? '↗ Visit Site' : '👁️ View Details'}
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                        {project.category}
                      </span>
                      <h3 className="text-2xl font-bold mt-2 mb-4">{project.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {(project.technologies || project.softwareUsed || []).map(tag => (
                          <span key={tag} className="text-xs bg-white/10 px-2 py-1 rounded-md text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </CardWrapper>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* View More Button */}
        {filteredProjects.length > visibleCount && (
          <div className="mt-12 text-center">
            <Link 
              to="/projects"
              className="inline-block px-8 py-3 bg-white/5 border border-white/20 hover:bg-white/10 hover:border-cyan-500/50 rounded-full font-bold transition-all shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-50"
            >
              View More Projects &rarr;
            </Link>
          </div>
        )}
        </>
      )}
    </section>
  );
};

const SocialMediaSection = () => {
  const [popupData, setPopupData] = useState(null);

  const socials = [
    { 
      name: 'Instagram', 
      label: 'Instagram', 
      accounts: [
        { label: 'First Account', url: 'https://www.instagram.com/kanzaki.ryuu' },
        { label: 'Second Account', url: 'https://www.instagram.com/yuu__kanzaki' }
      ],
      color: 'from-pink-500 to-orange-400' 
    },
    { name: 'TikTok', label: 'TikTok', url: '#', color: 'from-black to-slate-800' },
    { name: 'LinkedIn', label: 'LinkedIn', url: '#', color: 'from-blue-600 to-blue-400' },
    { name: 'Linktree', label: 'Linktree', url: 'https://linktr.ee/yuukanzaki', color: 'from-green-500 to-emerald-400' },
    { name: 'Discord Profile', label: 'Discord', desc: 'Profile', url: 'https://discord.gg/rC42hrxV', color: 'from-indigo-500 to-purple-500' },
    { name: 'Discord Server', label: 'Discord', desc: 'Tempat Nongkrong', url: 'https://discord.gg/jGNGWm8wFp', color: 'from-indigo-600 to-purple-600' }
  ];

  const CardContent = ({ social }) => (
    <>
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300" />
      <div className="relative z-10 text-white flex flex-col items-center">
        <span className="font-bold text-xl tracking-wide">{social.name}</span>
        {social.desc && (
          <span className="mt-2 text-xs py-1 px-3 bg-white/20 rounded-full font-medium">
            {social.desc}
          </span>
        )}
      </div>
    </>
  );

  return (
    <section id="social" className="py-20 px-6 max-w-5xl mx-auto text-center relative">
      <div className="mb-16">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 inline-block">
          Connect With Me
        </h2>
        <p className="mt-4 opacity-70">Find me across the digital universe.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {socials.map((social, idx) => {
          const cardClass = `p-6 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br ${social.color} shadow-lg relative overflow-hidden group w-full cursor-pointer`;
          
          if (social.accounts) {
            return (
              <motion.button
                key={social.name}
                onClick={() => setPopupData(social)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={cardClass}
              >
                <CardContent social={social} />
              </motion.button>
            );
          }

          return (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={cardClass}
            >
              <CardContent social={social} />
            </motion.a>
          );
        })}
      </div>

      <AnimatePresence>
        {popupData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPopupData(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700/50 p-8 rounded-3xl flex flex-col gap-4 w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.5)]"
            >
              <div className="text-center mb-2">
                <h3 className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${popupData.color}`}>
                  {popupData.name}
                </h3>
                <p className="text-slate-400 text-sm mt-2">Pilih akun yang ingin dituju</p>
              </div>
              
              <div className="flex flex-col gap-3">
                {popupData.accounts.map(acc => (
                  <a 
                    key={acc.label} 
                    href={acc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-center font-bold text-white transition-all border border-slate-600 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    {acc.label}
                  </a>
                ))}
              </div>

              <button 
                onClick={() => setPopupData(null)} 
                className="mt-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 px-6 max-w-3xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-8">Let's Collaborate</h2>
      <p className="mb-10 opacity-70">Have a project in mind? Let's build something amazing together.</p>
      
      <form className="space-y-4 text-left">
        <div>
          <label className="block mb-2 font-medium opacity-80">Name</label>
          <input type="text" className="w-full p-4 bg-black/20 border border-white/10 rounded-xl focus:border-cyan-400 outline-none transition-all placeholder:text-slate-500" placeholder="John Doe" />
        </div>
        <div>
          <label className="block mb-2 font-medium opacity-80">Email</label>
          <input type="email" className="w-full p-4 bg-black/20 border border-white/10 rounded-xl focus:border-cyan-400 outline-none transition-all placeholder:text-slate-500" placeholder="john@example.com" />
        </div>
        <div>
          <label className="block mb-2 font-medium opacity-80">Message</label>
          <textarea rows="4" className="w-full p-4 bg-black/20 border border-white/10 rounded-xl focus:border-cyan-400 outline-none transition-all placeholder:text-slate-500" placeholder="Tell me about your project..."></textarea>
        </div>
        <button type="button" className="w-full py-4 mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all font-mono tracking-widest">
          SEND MESSAGE
        </button>
      </form>
    </section>
  );
};

const Topbar = () => {
  const { toggleTheme, isDarkMode } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center bg-transparent backdrop-blur-[2px]">
      <div className="font-black text-2xl tracking-tighter">
        RYUU<span className="text-cyan-400"> PORTOFOLIO</span>
      </div>
        <div className="flex gap-4 items-center">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
          title="Toggle Theme"
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </nav>
  );
};

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button if scrolled past 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-colors focus:outline-none"
          title="Scroll to Top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const Home = () => {
  return (
    <div className="relative">
      <Topbar />
      <HeroSection />
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <SkillsSection />
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <ProjectsSection />
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <SocialMediaSection />
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <ContactSection />
      
      <footer className="text-center py-8 opacity-50 text-sm">
        © {new Date().getFullYear()} Portfolio. All rights reserved.
      </footer>

      <ScrollToTopButton />
    </div>
  );
};

export default Home;
