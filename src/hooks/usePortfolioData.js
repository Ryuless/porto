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

  // DISTRIBUSI KATEGORI: Kalkulasi otomatis berdasarkan data project
  const computedCategories = useMemo(() => {
    const categoryCounts = {};
    const totalProjects = projects.length || 1; // Mencegah pembagian dengan nol

    projects.forEach(project => {
      const category = project.category?.trim();
      if (!category) return;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Format output untuk UI, persentase berdasarkan total project
    return Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count,
        progress: totalProjects > 0 ? Math.min((count / totalProjects) * 100, 100) : 0
      }))
      .sort((a, b) => b.progress - a.progress);
  }, [projects]);

  return { projects, categories: computedCategories, loading };
};
