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
    const maxProjectsFor100Percent = 5; // Asumsi: 5 proyek dengan skill X membuat bar 100%

    projects.forEach(project => {
      const tags = project.category === 'Web Development' 
        ? project.technologies || [] 
        : project.softwareUsed || [];

      tags.forEach(tag => {
        // Setiap kali skill digunakan di project, persentasenya naik 20%
        skillCounts[tag] = (skillCounts[tag] || 0) + (100 / maxProjectsFor100Percent);
      });
    });

    // Format output untuk UI dan batasi maksimal 100%
    return Object.entries(skillCounts)
      .map(([name, progress]) => ({
        name,
        progress: Math.min(progress, 100)
      }))
      .sort((a, b) => b.progress - a.progress); // Urutkan dari persentase tertinggi
  }, [projects]);

  return { projects, skills: computedSkills, loading };
};
