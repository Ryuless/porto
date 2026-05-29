import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { logout } = useAuth();
  const { projects, skills, loading } = usePortfolioData();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [projectUrl, setProjectUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [softwareUsed, setSoftwareUsed] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Picture Upload State
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'link'
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Helper to get image from regular URL
  const getProcessedImageUrl = (url) => {
    if (!url) return '';
    // Jika url berakhiran gambar, render langsung
    if (url.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i)) return url;
    // Jika tidak, asumsikan ini image URL tanpa ekstensi, render aja langsung.
    return url;
  };

  const webProjects = projects.filter(p => p.category === 'Web Development').length;
  const designProjects = projects.filter(p => p.category === 'Design/Editing').length;
  const totalProjects = projects.length;

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Web Development');
    setTechStack('');
    setSoftwareUsed('');
    setProjectUrl('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description || '');
    setCategory(project.category);
    
    if (project.category === 'Web Development') {
      setTechStack((project.technologies || []).join(', '));
      setProjectUrl(project.projectUrl || '');
    } else {
      setSoftwareUsed((project.softwareUsed || []).join(', '));
    }

    if (project.imageUrl) {
      setUploadMode('link');
      setImageUrl(project.imageUrl);
      setImagePreview(project.imageUrl);
    }
    
    setActiveTab('add'); // Ganti tab ka form
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Harap masukkan file gambar!");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const withTimeout = (promise, ms, message) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
      ]);
    };

    try {
      let finalImageUrl = '';

      if (uploadMode === 'link') {
        finalImageUrl = getProcessedImageUrl(imageUrl);
      } else if (imageFile) {
        // Mode Upload File to Storage
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `projects/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
        const storageRef = ref(storage, fileName);
        
        await withTimeout(
          uploadBytes(storageRef, imageFile), 
          10000, 
          "Upload gambar pending (Timeout). Cek Storage Rules Firebase Anda."
        );
        finalImageUrl = await getDownloadURL(storageRef);
      }

      const isWebDev = category === 'Web Development';
      const tagsArray = isWebDev 
        ? techStack.split(',').map(tag => tag.trim()).filter(Boolean)
        : softwareUsed.split(',').map(tag => tag.trim()).filter(Boolean);

      const projectData = {
        title,
        description,
        watermark: "© 2026 Hak Cipta Paten Nexus - Tidak dapat diubah",
        category,
        imageUrl: finalImageUrl,
        ...(isWebDev && projectUrl ? { projectUrl } : {}),
        updatedAt: serverTimestamp(),
        ...(isWebDev ? { technologies: tagsArray } : { softwareUsed: tagsArray }),
      };

      if (editingId) {
        await withTimeout(
          updateDoc(doc(db, 'projects', editingId), projectData), 
          10000, 
          "Database tidak merespon (Timeout). Cek Firestore Rules Anda."
        );
        alert('Proyek berhasil diperbarui!');
      } else {
        projectData.createdAt = serverTimestamp();
        await withTimeout(
          addDoc(collection(db, 'projects'), projectData), 
          10000, 
          "Database tidak merespon (Timeout). Cek Firestore Rules Anda."
        );
        alert('Proyek berhasil ditambahkan!');
      }
      
      clearForm();
      setActiveTab('list');
    } catch (error) {
      console.error(error);
      alert(`Gagal mempublish proyek!\n\nError: ${error.message}\n\nPastikan aturan Firestore & Firebase Storage Anda diizinkan untuk 'write'.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus proyek ini?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (error) {
        console.error(error);
        alert('Gagal menghapus proyek');
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
            Nexus<span className="text-slate-100">Admin</span>
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            📊 Dashboard Overview
          </button>
          <button 
            onClick={() => {
              setActiveTab('add');
              clearForm();
            }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'add' && !editingId ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            ✨ Add New Project
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'list' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            📁 Projects List
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link to="/" className="block w-full text-center py-2 px-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors text-slate-300">
            👁️ View Live Website
          </Link>
          <button 
            onClick={logout}
            className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
          >
            Logout Securely
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Glow Effects */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto z-10 relative">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex gap-6 flex-wrap">
                  {/* Stat Cards */}
                  <div className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center">
                    <h3 className="text-slate-400 text-sm font-semibold tracking-wider mb-2">TOTAL PROJECTS</h3>
                    <div className="text-5xl font-black text-white">{totalProjects}</div>
                  </div>
                  <div className="flex-[2] min-w-[300px] bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-slate-400 text-sm font-semibold tracking-wider mb-4">PROJECT RATIO</h3>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-cyan-400">Web Dev</span>
                          <span>{webProjects}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: totalProjects ? `${(webProjects/totalProjects)*100}%` : '0%' }} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-purple-400">Design</span>
                          <span>{designProjects}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400" style={{ width: totalProjects ? `${(designProjects/totalProjects)*100}%` : '0%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Realtime Skills Preview */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Realtime Skills Preview</h3>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">Live from User Page</span>
                  </div>
                  
                  {loading ? (
                    <div className="text-slate-500 animate-pulse">Computing skills data...</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                      {skills.length === 0 && <div className="text-slate-500">No skills data. Add projects first.</div>}
                      {skills.map(skill => (
                        <div key={skill.name} className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                          <div className="flex justify-between mb-2 text-sm">
                            <span className="font-semibold text-slate-200">{skill.name}</span>
                            <span className="text-cyan-400 font-mono">{Math.round(skill.progress)}%</span>
                          </div>
                          <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000" 
                              style={{ width: `${skill.progress}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

              {/* ADD/EDIT TAB */}
            {activeTab === 'add' && (
              <motion.div 
                key="add"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
                  <h2 className="text-2xl font-bold mb-6 text-white">
                    {editingId ? "Edit Project" : "Create New Project"}
                  </h2>
                  <form onSubmit={handleAddProject} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-400">Project Title</label>
                      <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        placeholder="e.g. Nexus Dashboard v2"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-400">Description</label>
                      <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                        placeholder="Tuliskan deskripsi proyek..."
                        rows="3"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-400">Watermark Lisensi</label>
                      <input 
                        type="text" 
                        value="© 2026 Hak Cipta @Kanzaki.Ryuu - Tidak dapat diubah" 
                        readOnly 
                        className="w-full bg-slate-900 border border-slate-800 text-slate-500 rounded-xl px-4 py-3 cursor-not-allowed select-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-400">Category</label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
                      >
                        <option value="Web Development">💻 Web Development</option>
                        <option value="Design/Editing">🎨 Design / Multimedia</option>
                        <option value="Fotografi">📸 Fotografi</option>
                        <option value="Game Development">🎮 Game Development</option>
                      </select>
                    </div>

                    {category === 'Web Development' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <label className="block text-sm font-semibold mb-2 text-slate-400">Live Website URL</label>
                        <input 
                          type="url" 
                          value={projectUrl} 
                          onChange={(e) => setProjectUrl(e.target.value)} 
                          placeholder="https://mywebsite.com"
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </motion.div>
                    )}

                    {/* Image Upload Feature: Multi-Input */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-slate-400">Image Cover</label>
                        <div className="flex bg-slate-800 rounded-lg p-1">
                          <button 
                            type="button" 
                            onClick={() => setUploadMode('upload')} 
                            className={`px-3 py-1 text-xs rounded-md transition ${uploadMode === 'upload' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                          >
                            Upload/Drag
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setUploadMode('link')} 
                            className={`px-3 py-1 text-xs rounded-md transition ${uploadMode === 'link' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                          >
                            Via URL Link
                          </button>
                        </div>
                      </div>

                      {uploadMode === 'link' ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <input 
                            type="url" 
                            value={imageUrl} 
                            onChange={(e) => setImageUrl(e.target.value)} 
                            placeholder="Contoh: https://i.pinimg.com/xxx/image.jpg (Harus Alamat Gambar / Image Address)"
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
                          />
                          {imageUrl && (
                            <div className="mt-4 relative">
                              <p className="text-xs text-cyan-400 mb-2 font-medium">✨ Live Image Preview</p>
                              <img src={getProcessedImageUrl(imageUrl)} alt="Pastikan link yang dicopy adalah 'Copy Image Address'" className="w-full h-48 object-cover rounded-xl border border-slate-800 bg-slate-900" />
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                              isDragging ? 'border-cyan-400 bg-cyan-400/10' : 'border-slate-700 bg-slate-950 hover:bg-slate-900 hover:border-slate-500'
                            }`}
                          >
                            {imagePreview ? (
                              <img src={imagePreview} alt="upload preview" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <>
                                <div className="text-3xl mb-2">📁</div>
                                <p className="text-sm font-medium text-slate-300">Drag & Drop image here</p>
                                <p className="text-xs text-slate-500 mt-1">or click to browse local file</p>
                              </>
                            )}
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            ref={fileInputRef} 
                            className="hidden" 
                          />
                          {imagePreview && (
                            <button 
                              type="button" 
                              onClick={() => { setImageFile(null); setImagePreview(''); }}
                              className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              Remove Image
                            </button>
                          )}
                        </motion.div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      {category === 'Web Development' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <label className="block text-sm font-semibold mb-2 text-cyan-400">Coding Tech Stack</label>
                          <p className="text-xs text-slate-500 mb-2">Separate with commas. E.g: React, Node.js, Tailwind</p>
                          <input 
                            type="text" 
                            value={techStack} 
                            onChange={(e) => setTechStack(e.target.value)} 
                            required 
                            className="w-full bg-slate-950 border border-cyan-500/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
                          />
                        </motion.div>
                      )}
                      
                      {category === 'Design/Editing' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <label className="block text-sm font-semibold mb-2 text-purple-400">Design Software Used</label>
                          <p className="text-xs text-slate-500 mb-2">Separate with commas. E.g: Photoshop, Figma, Illustrator</p>
                          <input 
                            type="text" 
                            value={softwareUsed} 
                            onChange={(e) => setSoftwareUsed(e.target.value)} 
                            required 
                            className="w-full bg-slate-950 border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all"
                          />
                        </motion.div>
                      )}

                      {category === 'Game Development' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <label className="block text-sm font-semibold mb-2 text-emerald-400">Game Engine & Tools</label>
                          <p className="text-xs text-slate-500 mb-2">Separate with commas. E.g: Unity, Unreal Engine, Blender</p>
                          <input 
                            type="text" 
                            value={softwareUsed} 
                            onChange={(e) => setSoftwareUsed(e.target.value)} 
                            required 
                            className="w-full bg-slate-950 border border-emerald-500/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all"
                          />
                        </motion.div>
                      )}

                      {category === 'Fotografi' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <label className="block text-sm font-semibold mb-2 text-amber-400">Camera & Gear Used</label>
                          <p className="text-xs text-slate-500 mb-2">Separate with commas. E.g: Sony A7III, 50mm f/1.8, Lightroom</p>
                          <input 
                            type="text" 
                            value={softwareUsed} 
                            onChange={(e) => setSoftwareUsed(e.target.value)} 
                            required 
                            className="w-full bg-slate-950 border border-amber-500/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-all"
                          />
                        </motion.div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-4 mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.2)] disabled:opacity-50"
                    >
                      {isSubmitting ? 'Publishing to Database...' : editingId ? 'Update Project' : 'Publish Project'}
                    </button>
                    {editingId && (
                      <button 
                        type="button" 
                        onClick={clearForm}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all mt-2"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </form>
                </div>
              </motion.div>
            )}

            {/* LIST TAB */}
            {activeTab === 'list' && (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h2 className="text-2xl font-bold mb-6">Database Records</h2>
                  
                  {loading ? (
                    <div className="text-center py-10 opacity-50">Fetching from Firebase...</div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-10 opacity-50">No projects found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-sm">
                            <th className="py-3 px-4 font-normal">Cover</th>
                            <th className="py-3 px-4 font-normal">Project Name</th>
                            <th className="py-3 px-4 font-normal">Category</th>
                            <th className="py-3 px-4 font-normal">Tags (Skill Trigger)</th>
                            <th className="py-3 px-4 font-normal text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.map(p => (
                            <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 px-4">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt="cover" className="w-12 h-12 object-cover rounded-lg bg-slate-800" />
                                ) : (
                                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-xs opacity-50">N/A</div>
                                )}
                              </td>
                              <td className="py-3 px-4 font-medium">{p.title}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs rounded-lg ${p.category === 'Web Development' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                                  {p.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 max-w-[200px] truncate text-slate-400 text-sm">
                                {(p.technologies || p.softwareUsed || []).join(', ')}
                              </td>
                              <td className="py-3 px-4 text-right flex justify-end gap-2">
                                <button 
                                  onClick={() => handleEdit(p)}
                                  className="text-cyan-400 hover:text-cyan-300 text-sm px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-colors border border-cyan-500/20"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDelete(p.id)}
                                  className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;