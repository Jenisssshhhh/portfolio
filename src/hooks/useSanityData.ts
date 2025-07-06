import { useState, useEffect } from 'react';
import { getResearch, getProfile, getSkills, getProjects, getCurrentlyWorking, getTimeline } from '@/sanityQueries';

export function useSanityData() {
  const [data, setData] = useState({
    researchItems: [],
    profile: null,
    skills: [],
    projects: [],
    currentlyWorking: null,
    timeline: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [researchItems, profile, skills, projects, currentlyWorking, timeline] = await Promise.all([
          getResearch(),
          getProfile(),
          getSkills(),
          getProjects(),
          getCurrentlyWorking(),
          getTimeline()
        ]);

        setData({
          researchItems,
          profile,
          skills,
          projects,
          currentlyWorking,
          timeline
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
} 