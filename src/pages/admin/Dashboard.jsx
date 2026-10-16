import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Web Development', short: 'Web', color: 'cyan', icon: '⌁' },
  { name: 'Design/Editing', short: 'Design', color: 'violet', icon: '✦' },
  { name: 'Fotografi', short: 'Photo', color: 'amber', icon: '◉' },
  { name: 'Game Development', short: 'Game', color: 'emerald', icon: '◆' },
];

const withTimeout = (promise, ms, message) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
]);

const formatProjectDate = timestamp => {
  if (!timestamp) return 'Tanggal belum tersedia';
  const date = timestamp.toDate?.() || (timestamp instanceof Date ? timestamp : new Date(timestamp));
  if (Number.isNaN(date.getTime())) return 'Tanggal belum tersedia';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const Dashboard = () => {
  const { logout } = useAuth();
  const { projects, loading } = usePortfolioData();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [projectUrl, setProjectUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [softwareUsed, setSoftwareUsed] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const fileInputRef = useRef(null);

  const totalProjects = projects.length;
  const categoryCount = name => projects.filter(project => project.category === name).length;
  const getProcessedImageUrl = url => url || '';

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
    setUploadMode('upload');
  };

  const handleEdit = project => {
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description || '');
    setCategory(project.category);
    setTechStack((project.technologies || []).join(', '));
    setSoftwareUsed((project.softwareUsed || []).join(', '));
    setProjectUrl(project.projectUrl || '');
    if (project.imageUrl) {
      setUploadMode('link');
      setImageUrl(project.imageUrl);
      setImagePreview(project.imageUrl);
    } else {
      setUploadMode('upload');
      setImageUrl('');
      setImagePreview('');
    }
    setActiveTab('add');
  };

  const processFile = file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Harap masukkan file gambar!');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddProject = async event => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = '';
      if (uploadMode === 'link') {
        finalImageUrl = getProcessedImageUrl(imageUrl);
      } else if (imageFile) {
        const extension = imageFile.name.split('.').pop();
        const storageRef = ref(storage, `projects/${Date.now()}_${Math.random().toString(36).substring(2)}.${extension}`);
        await withTimeout(uploadBytes(storageRef, imageFile), 10000, 'Upload gambar pending (Timeout).');
        finalImageUrl = await getDownloadURL(storageRef);
      }

      const isWebDev = category === 'Web Development';
      const tags = (isWebDev ? techStack : softwareUsed).split(',').map(tag => tag.trim()).filter(Boolean);
      const projectData = {
        title,
        description,
        watermark: '© 2026 Hak Cipta Paten Nexus - Tidak dapat diubah',
        category,
        imageUrl: finalImageUrl,
        ...(isWebDev && projectUrl ? { projectUrl } : {}),
        updatedAt: serverTimestamp(),
        ...(isWebDev ? { technologies: tags } : { softwareUsed: tags }),
      };

      if (editingId) {
        await withTimeout(updateDoc(doc(db, 'projects', editingId), projectData), 10000, 'Database tidak merespon (Timeout).');
        alert('Proyek berhasil diperbarui!');
      } else {
        await withTimeout(addDoc(collection(db, 'projects'), { ...projectData, createdAt: serverTimestamp() }), 10000, 'Database tidak merespon (Timeout).');
        alert('Proyek berhasil ditambahkan!');
      }
      clearForm();
      setActiveTab('list');
    } catch (error) {
      console.error(error);
      alert(`Gagal mempublish proyek!\n\nError: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Yakin ingin menghapus proyek ini?')) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus proyek');
    }
  };

  const handleDuplicate = async project => {
    if (isDuplicating) return;
    setIsDuplicating(true);
    try {
      const duplicateData = {
        title: `${project.title || 'Untitled project'} (Copy)`,
        description: project.description || '',
        watermark: project.watermark || '© 2026 Hak Cipta Paten Nexus - Tidak dapat diubah',
        category: project.category || 'Web Development',
        imageUrl: project.imageUrl || '',
        ...(project.projectUrl ? { projectUrl: project.projectUrl } : {}),
        ...(project.technologies ? { technologies: [...project.technologies] } : {}),
        ...(project.softwareUsed ? { softwareUsed: [...project.softwareUsed] } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await withTimeout(addDoc(collection(db, 'projects'), duplicateData), 10000, 'Database tidak merespon (Timeout).');
      alert('Salinan proyek berhasil dibuat!');
    } catch (error) {
      console.error(error);
      alert(`Gagal menduplikasi proyek!\n\nError: ${error.message}`);
    } finally {
      setIsDuplicating(false);
    }
  };

  const exportProjects = () => {
    const exportData = projects.map(({ id, ...project }) => ({
      ...project,
      id,
      createdAt: project.createdAt?.toDate?.()?.toISOString?.() || null,
      updatedAt: project.updatedAt?.toDate?.()?.toISOString?.() || null,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = `portfolio-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const changeTab = (tab, reset = false) => {
    setActiveTab(tab);
    if (reset) clearForm();
    setIsSidebarOpen(false);
  };

  const sidebar = (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-xl text-cyan-300">✦</div>
        <div><p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">Workspace</p><h1 className="font-bold text-white">Nexus<span className="text-cyan-300">Admin</span></h1></div>
      </div>
      <div className="px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Manage portfolio</p>
        <div className="space-y-1.5">
          <NavButton active={activeTab === 'overview'} onClick={() => changeTab('overview')} icon="▦">Overview</NavButton>
          <NavButton active={activeTab === 'add' && !editingId} onClick={() => changeTab('add', true)} icon="+">New project</NavButton>
          <NavButton active={activeTab === 'list'} onClick={() => changeTab('list')} icon="☷">Project library</NavButton>
        </div>
      </div>
      <div className="mt-auto space-y-2 border-t border-white/10 p-4">
        <Link to="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"><span>↗</span> View live site</Link>
        <button onClick={() => { setIsSidebarOpen(false); logout(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-rose-300 transition hover:bg-rose-400/10"><span>↪</span> Sign out</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#07101c] font-sans text-slate-100 selection:bg-cyan-300 selection:text-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-[120px]" /><div className="absolute -bottom-48 right-0 h-[32rem] w-[32rem] rounded-full bg-violet-500/10 blur-[140px]" /></div>
      <button type="button" onClick={() => setIsSidebarOpen(true)} className="fixed left-4 top-4 z-40 rounded-xl border border-white/10 bg-[#0c1828]/90 px-3 py-2 text-sm text-slate-200 shadow-xl backdrop-blur md:hidden">☰ Menu</button>
      <AnimatePresence>
        {isSidebarOpen && <><motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm" aria-label="Close menu" /><motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-[300px] flex-col bg-[#0b1727] shadow-2xl md:hidden"><div className="flex justify-end p-3"><button onClick={() => setIsSidebarOpen(false)} className="rounded-lg px-3 py-1 text-slate-400 hover:text-white">✕</button></div>{sidebar}</motion.aside></>}
      </AnimatePresence>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#0b1727]/95 md:flex">{sidebar}</aside>

      <main className="relative min-h-screen md:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#07101c]/85 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="pl-14 md:pl-0"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Nexus Admin / <span className="text-cyan-300">{activeTab}</span></p><h2 className="mt-1 text-lg font-bold text-white sm:text-xl">{activeTab === 'overview' ? 'Good to see you, Ryuu.' : activeTab === 'add' ? (editingId ? 'Edit project' : 'Create something new') : 'Project library'}</h2></div>
          <div className="flex items-center gap-3"><span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Firebase live</span><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 text-sm font-bold text-slate-950">R</div></div>
        </header>

        <div className="mx-auto max-w-7xl px-5 pb-12 pt-7 sm:px-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <Overview key="overview" projects={projects} loading={loading} totalProjects={totalProjects} categoryCount={categoryCount} onAdd={() => changeTab('add', true)} onList={() => changeTab('list')} />}
            {activeTab === 'add' && <ProjectForm key="add" {...{ title, setTitle, description, setDescription, category, setCategory, projectUrl, setProjectUrl, techStack, setTechStack, softwareUsed, setSoftwareUsed, uploadMode, setUploadMode, imageUrl, setImageUrl, imagePreview, isDragging, setIsDragging, processFile, fileInputRef, isSubmitting, editingId, handleAddProject, clearForm, getProcessedImageUrl }} />}
            {activeTab === 'list' && <ProjectLibrary key="list" projects={projects} loading={loading} isDuplicating={isDuplicating} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} onAdd={() => changeTab('add', true)} onExport={exportProjects} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, children }) => <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active ? 'bg-cyan-300/10 text-cyan-200 shadow-[inset_3px_0_0_#67e8f9]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><span className={`flex h-7 w-7 items-center justify-center rounded-lg text-base ${active ? 'bg-cyan-300/15 text-cyan-300' : 'bg-white/5 text-slate-500'}`}>{icon}</span>{children}</button>;

const Panel = ({ children, className = '' }) => <div className={`rounded-3xl border border-white/10 bg-[#0d1a2b]/80 shadow-2xl shadow-black/10 ${className}`}>{children}</div>;

const Overview = ({ projects, loading, totalProjects, categoryCount, onAdd, onList }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-slate-400">Your portfolio at a glance</p><h3 className="mt-1 text-3xl font-black tracking-tight text-white">Command center</h3></div><button onClick={onAdd} className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">+ Add project</button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total projects" value={totalProjects} meta="Published records" icon="◈" accent="cyan" />
      <StatCard label="Web development" value={categoryCount('Web Development')} meta="Live experiences" icon="⌁" accent="violet" />
      <StatCard label="Creative work" value={categoryCount('Design/Editing') + categoryCount('Fotografi')} meta="Visual projects" icon="✦" accent="amber" />
      <StatCard label="Game development" value={categoryCount('Game Development')} meta="Interactive worlds" icon="◆" accent="emerald" />
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <Panel className="p-6"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Live analytics</p><h3 className="mt-1 text-lg font-bold text-white">Category distribution</h3></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">Realtime</span></div>{loading ? <LoadingLine /> : <div className="space-y-5">{categories.map(item => <Ratio key={item.name} {...item} count={categoryCount(item.name)} total={totalProjects} />)}</div>}</Panel>
      <Panel className="flex flex-col justify-between overflow-hidden p-6"><div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Latest signal</p><h3 className="mt-1 text-lg font-bold text-white">Portfolio health</h3><div className="mt-8 flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-2xl text-cyan-300">✓</div><div><p className="text-2xl font-black text-white">{projects.length ? 'Active' : 'Ready'}</p><p className="text-sm text-slate-400">{projects.length ? 'Your work is online' : 'Add your first project'}</p></div></div></div><button onClick={onList} className="mt-8 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200">Open project library <span>→</span></button></Panel>
    </div>
    <Panel className="p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recent work</p><h3 className="mt-1 text-lg font-bold text-white">Latest projects</h3></div><button onClick={onList} className="text-sm text-cyan-300 hover:text-cyan-200">View all →</button></div>{loading ? <LoadingLine /> : projects.length === 0 ? <EmptyState text="No projects yet. Start building your library." /> : <div className="grid gap-3 md:grid-cols-3">{projects.slice(0, 3).map(project => <ProjectMini key={project.id} project={project} />)}</div>}</Panel>
  </motion.div>
);

const accentStyles = {
  cyan: { glow: 'bg-cyan-400/10', icon: 'bg-cyan-400/10 text-cyan-300' },
  violet: { glow: 'bg-violet-400/10', icon: 'bg-violet-400/10 text-violet-300' },
  amber: { glow: 'bg-amber-400/10', icon: 'bg-amber-400/10 text-amber-300' },
  emerald: { glow: 'bg-emerald-400/10', icon: 'bg-emerald-400/10 text-emerald-300' },
};

const ratioStyles = {
  cyan: { text: 'text-cyan-300', bar: 'bg-cyan-400' },
  violet: { text: 'text-violet-300', bar: 'bg-violet-400' },
  amber: { text: 'text-amber-300', bar: 'bg-amber-400' },
  emerald: { text: 'text-emerald-300', bar: 'bg-emerald-400' },
};

const StatCard = ({ label, value, meta, icon, accent }) => {
  const styles = accentStyles[accent] || accentStyles.cyan;
  return <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1a2b]/80 p-5"><div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${styles.glow} blur-2xl`} /><div className="relative flex items-start justify-between"><div><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-4xl font-black text-white">{value}</p><p className="mt-2 text-xs text-slate-500">{meta}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${styles.icon}`}>{icon}</span></div></div>;
};

const Ratio = ({ name, count, total, color }) => {
  const styles = ratioStyles[color] || ratioStyles.cyan;
  return <div><div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{name}</span><span className={`font-mono ${styles.text}`}>{count} <span className="text-slate-500">/ {total}</span></span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><motion.div initial={{ width: 0 }} animate={{ width: total ? `${(count / total) * 100}%` : '0%' }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${styles.bar}`} /></div></div>;
};
const LoadingLine = () => <div className="h-24 animate-pulse rounded-2xl bg-white/5" />;
const EmptyState = ({ text }) => <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">{text}</div>;
const ProjectMini = ({ project }) => <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"><div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-800">{project.imageUrl && <img src={project.imageUrl} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-200">{project.title}</p><p className="mt-1 truncate text-xs text-slate-500">{project.category}</p></div></div>;

const ProjectForm = props => {
  const { title, setTitle, description, setDescription, category, setCategory, projectUrl, setProjectUrl, techStack, setTechStack, softwareUsed, setSoftwareUsed, uploadMode, setUploadMode, imageUrl, setImageUrl, imagePreview, isDragging, setIsDragging, processFile, fileInputRef, isSubmitting, editingId, handleAddProject, clearForm, getProcessedImageUrl } = props;
  const tagValue = category === 'Web Development' ? techStack : softwareUsed;
  const setTagValue = category === 'Web Development' ? setTechStack : setSoftwareUsed;
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="mx-auto max-w-5xl">
    <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm text-slate-400">Portfolio library / editor</p><h3 className="mt-1 text-3xl font-black text-white">{editingId ? 'Edit project' : 'New project'}</h3></div>{editingId && <button onClick={clearForm} className="text-sm text-slate-400 hover:text-white">Cancel edit</button>}</div>
    <form onSubmit={handleAddProject} className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
      <Panel className="space-y-5 p-6">
        <Field label="Project title"><input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Nexus Dashboard v2" className="admin-input" /></Field>
        <Field label="Description"><textarea required value={description} onChange={e => setDescription(e.target.value)} rows="6" placeholder="Describe the idea, process, or outcome..." className="admin-input resize-none" /></Field>
        <div className="grid gap-5 sm:grid-cols-2"><Field label="Category"><select value={category} onChange={e => setCategory(e.target.value)} className="admin-input"><option>Web Development</option><option>Design/Editing</option><option>Fotografi</option><option>Game Development</option></select></Field>{category === 'Web Development' && <Field label="Live URL"><input type="url" value={projectUrl} onChange={e => setProjectUrl(e.target.value)} placeholder="https://..." className="admin-input" /></Field>}</div>
        <Field label={category === 'Web Development' ? 'Tech stack' : 'Tools used'}><input required value={tagValue} onChange={e => setTagValue(e.target.value)} placeholder="Separate items with commas..." className="admin-input" /></Field>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs text-slate-500">LICENSE WATERMARK</p><p className="mt-2 text-sm text-slate-400">© 2026 Hak Cipta @Kanzaki.Ryuu</p></div>
      </Panel>
      <Panel className="p-6"><div className="mb-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Project cover</p><h4 className="mt-1 font-bold text-white">Visual preview</h4></div><div className="mb-4 flex rounded-xl bg-white/5 p-1"><button type="button" onClick={() => setUploadMode('upload')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${uploadMode === 'upload' ? 'bg-cyan-300 text-slate-950' : 'text-slate-400'}`}>Upload file</button><button type="button" onClick={() => setUploadMode('link')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${uploadMode === 'link' ? 'bg-cyan-300 text-slate-950' : 'text-slate-400'}`}>Image URL</button></div>{uploadMode === 'link' ? <div className="space-y-4"><input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://image-address..." className="admin-input" />{imageUrl && <img src={getProcessedImageUrl(imageUrl)} alt="Preview" className="h-56 w-full rounded-2xl object-cover" />}</div> : <><div onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={e => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files?.[0]); }} onClick={() => fileInputRef.current?.click()} className={`flex h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${isDragging ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/10 bg-white/[0.03] hover:border-cyan-300/40'}`}>{imagePreview ? <img src={imagePreview} alt="Upload preview" className="h-full w-full object-cover" /> : <><span className="text-3xl text-cyan-300">↑</span><p className="mt-3 text-sm text-slate-300">Drop an image here</p><p className="mt-1 text-xs text-slate-500">or browse from your device</p></>}</div><input ref={fileInputRef} type="file" accept="image/*" onChange={e => processFile(e.target.files?.[0])} className="hidden" /></>}<button disabled={isSubmitting} type="submit" className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 py-3.5 font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-50">{isSubmitting ? 'Publishing...' : editingId ? 'Update project' : 'Publish project'}</button></Panel>
    </form>
  </motion.div>;
};

const Field = ({ label, children }) => <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span>{children}</label>;

const ProjectLibrary = ({ projects, loading, isDuplicating, onEdit, onDelete, onDuplicate, onAdd, onExport }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [sortOrder, setSortOrder] = useState('newest');

  const visibleProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return [...projects]
      .filter(project => categoryFilter === 'All categories' || project.category === categoryFilter)
      .filter(project => {
        if (!normalizedSearch) return true;
        const tags = (project.technologies || project.softwareUsed || []).join(' ');
        return `${project.title || ''} ${project.description || ''} ${tags}`.toLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (sortOrder === 'alphabetical') return (a.title || '').localeCompare(b.title || '');
        const getTime = project => project.createdAt?.toMillis?.() || 0;
        return sortOrder === 'oldest' ? getTime(a) - getTime(b) : getTime(b) - getTime(a);
      });
  }, [projects, search, categoryFilter, sortOrder]);

  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}>
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-slate-400">All published work</p><h3 className="mt-1 text-3xl font-black text-white">Project library</h3></div><div className="flex flex-wrap gap-2"><button onClick={onExport} disabled={!projects.length} className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-40">Export JSON</button><button onClick={onAdd} className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950">+ New project</button></div></div>
    <Panel className="mb-4 p-4"><div className="grid gap-3 md:grid-cols-[1fr_0.65fr_0.55fr]"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search title, description, or tools..." className="admin-input" /><select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} className="admin-input"><option>All categories</option>{categories.map(item => <option key={item.name}>{item.name}</option>)}</select><select value={sortOrder} onChange={event => setSortOrder(event.target.value)} className="admin-input"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="alphabetical">A-Z</option></select></div><p className="mt-3 text-xs text-slate-500">Showing {visibleProjects.length} of {projects.length} projects</p></Panel>
    <Panel className="overflow-hidden">{loading ? <LoadingLine /> : visibleProjects.length === 0 ? <EmptyState text={projects.length ? 'No projects match your filters.' : 'No projects found.'} /> : <div className="divide-y divide-white/10">{visibleProjects.map(project => <div key={project.id} className="flex flex-col gap-4 p-4 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:p-5"><div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-800">{project.imageUrl ? <img src={project.imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-slate-600">No image</span>}</div><div className="min-w-0 flex-1"><h4 className="truncate font-bold text-white">{project.title}</h4><div className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[11px] text-cyan-200">{project.category}</span><span className="truncate text-xs text-slate-500">{(project.technologies || project.softwareUsed || []).join(' · ')}</span><span className="text-xs text-slate-500">Posted {formatProjectDate(project.createdAt)}</span></div></div><div className="flex flex-wrap gap-2 sm:justify-end"><button onClick={() => onEdit(project)} className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-300/20">Edit</button><button onClick={() => onDuplicate(project)} disabled={isDuplicating} className="rounded-lg border border-violet-300/20 bg-violet-300/10 px-3 py-2 text-xs font-semibold text-violet-200 hover:bg-violet-300/20 disabled:opacity-50">Duplicate</button><button onClick={() => onDelete(project.id)} className="rounded-lg border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-300/20">Delete</button></div></div>)}</div>}</Panel>
  </motion.div>;
};

export default Dashboard;
