import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { motion } from 'framer-motion';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProject(null);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse text-xl">Lagi membuka detail project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <h1 className="text-3xl font-bold mb-4">Project-nya nggak ketemu</h1>
        <Link to="/" className="text-cyan-400 hover:underline">Balik ke home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <nav className="p-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
        >
          &larr; Kembali ke portfolio
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              {project.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-black mt-6 mb-4">{project.title}</h1>
            
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {(project.softwareUsed || project.technologies || []).map(tag => (
                <span key={tag} className="text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-md text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-8 shadow-2xl relative group">
            {project.imageUrl && (
              <img 
                src={project.imageUrl} 
                alt={project.title} 
                className="w-full h-auto rounded-xl object-contain mx-auto"
                style={{ maxHeight: '70vh' }}
              />
            )}
            
            {/* Watermark Overlay shown if image exists */}
            {project.imageUrl && project.watermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                <p className="text-white text-base md:text-xl font-bold tracking-widest text-center px-4 rotate-[-15deg] select-none opacity-50 bg-black/30 w-full py-4 backdrop-blur-sm">
                  {project.watermark}
                </p>
              </div>
            )}
          </div>

          <div className="max-w-3xl mx-auto bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <h2 className="text-2xl font-bold mb-4 border-b border-slate-800 pb-4">Tentang project ini</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {project.description || "Belum ada deskripsi untuk project ini."}
            </p>

            {project.watermark && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-xs text-center text-slate-500 font-mono">
                  {project.watermark}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProjectDetail;