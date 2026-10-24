import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { Link, useNavigate } from 'react-router-dom';

const ProjectsPage = () => {
  const { projects, loading } = usePortfolioData();
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Web Development', 'Design/Editing', 'Fotografi', 'Game Development'];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <nav className="p-6 sticky top-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-between border-b border-white/5">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 font-medium hover:text-cyan-400 transition-colors"
        >
          &larr; Kembali ke home
        </button>
        <div className="font-black text-xl tracking-tighter hidden sm:block">
          ALL<span className="text-cyan-400">PROJECTS</span>
        </div>
        <div className="w-[100px]"></div> {/* spacer for centering */}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Semua project, no filter
          </h1>
          <p className="mt-4 opacity-70 text-lg">Kumpulan work dan eksperimen yang pernah dibuat.</p>
        </div>

        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
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
          <div className="text-center animate-pulse py-20 text-xl">Lagi membuka semua project...</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            <AnimatePresence>
              {filteredProjects.map((project) => {
                const isWeb = project.category === 'Web Development';
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
                      <div className="h-56 bg-black/30 flex items-center justify-center p-0 overflow-hidden relative">
                        {project.imageUrl ? (
                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform duration-500">
                            Belum ada thumbnail
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isWeb ? '↗ Buka site' : '👁️ Lihat detail'}
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
            {filteredProjects.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-500">
                Belum ada project untuk {filter}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;