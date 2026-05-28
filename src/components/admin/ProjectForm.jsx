import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { motion } from 'framer-motion';

const ProjectForm = () => {
  const [category, setCategory] = useState('Web Development');
  const [title, setTitle] = useState('');
  const [techStack, setTechStack] = useState('');
  const [softwareUsed, setSoftwareUsed] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mengubah string comma-separated menjadi array
      const tagsArray = category === 'Web Development' 
        ? techStack.split(',').map(tag => tag.trim())
        : softwareUsed.split(',').map(tag => tag.trim());

      const projectData = {
        title,
        category,
        description: "", // Tambahkan form deskripsi jika dibutuhkan
        createdAt: serverTimestamp(),
        ...(category === 'Web Development' 
            ? { technologies: tagsArray } 
            : { softwareUsed: tagsArray }),
      };

      await addDoc(collection(db, 'projects'), projectData);
      
      // Reset Form
      setTitle('');
      setTechStack('');
      setSoftwareUsed('');
      alert('Proyek berhasil ditambahkan!');
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Gagal menambahkan proyek');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
      <h2 className="text-2xl font-bold mb-6">Tambah Proyek Baru</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Judul Proyek</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            className="w-full p-2 bg-transparent border-2 border-slate-400 rounded focus:border-cyan-400 outline-none transition"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Kategori</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 bg-slate-800 text-white border-2 border-slate-400 rounded focus:border-cyan-400 outline-none"
          >
            <option value="Web Development">Web Development</option>
            <option value="Design/Editing">Design / Multimedia</option>
          </select>
        </div>

        {/* Conditional Fields berdasarkan Kategori */}
        {category === 'Web Development' ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="block mb-2 font-medium">Tech Stack / Codebase (Pisahkan dengan koma)</label>
            <input 
              type="text" 
              placeholder="React, Tailwind, Firebase..."
              value={techStack} 
              onChange={(e) => setTechStack(e.target.value)} 
              required 
              className="w-full p-2 bg-transparent border-2 border-slate-400 rounded focus:border-emerald-400 outline-none transition"
            />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="block mb-2 font-medium">Software Used (Pisahkan dengan koma)</label>
            <input 
              type="text" 
              placeholder="Photoshop, Premiere Pro, Figma..."
              value={softwareUsed} 
              onChange={(e) => setSoftwareUsed(e.target.value)} 
              required 
              className="w-full p-2 bg-transparent border-2 border-slate-400 rounded focus:border-purple-400 outline-none transition"
            />
          </motion.div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded shadow-lg hover:shadow-cyan-500/50 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Simpan Proyek'}
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;
