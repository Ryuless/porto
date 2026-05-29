import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export const usePortfolioData = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mengambil data secara realtime dari Firestore
  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // DYNAMIC SKILL SYSTEM: Kalkulasi otomatis berdasarkan data project
  const computedSkills = useMemo(() => {
    const skillCounts = {};
    const totalProjects = projects.length || 1; // Mencegah pembagian dengan nol
    let maxUsage = 1;

    projects.forEach(project => {
      // Ambil tag/teknologi yang digunakan (handle juga kalau formatnya beda/string)
      let tags = [];
      if (Array.isArray(project.technologies)) {
        tags.push(...project.technologies);
      } else if (typeof project.technologies === 'string') {
        tags.push(...project.technologies.split(',').map(t => t.trim()));
      }
      
      if (Array.isArray(project.softwareUsed)) {
        tags.push(...project.softwareUsed);
      } else if (typeof project.softwareUsed === 'string') {
        tags.push(...project.softwareUsed.split(',').map(t => t.trim()));
      }

      // Hapus duplikat tag di dalam satu project yang sama
      const uniqueTags = [...new Set(tags)];

      uniqueTags.forEach(tag => {
        if (!tag) return;
        skillCounts[tag] = (skillCounts[tag] || 0) + 1;
        if (skillCounts[tag] > maxUsage) {
          maxUsage = skillCounts[tag];
        }
      });
    });

    // Format output untuk UI, skill di-scale berdasarkan pembagian semua project
    return Object.entries(skillCounts)
      .map(([name, count]) => ({
        name,
        count,
        // Scale dinamis: membandingkan kemunculan skill dengan total keseluruhan project yang ada di database
        progress: totalProjects > 0 ? Math.min((count / totalProjects) * 100, 100) : 0
      }))
      .sort((a, b) => b.progress - a.progress) // Urutkan dari persentase tertinggi
      .slice(0, 15); // Batasi maksimal 15 skill teratas di Home
  }, [projects]);

  return { projects, skills: computedSkills, loading };
};
