import React, { useEffect, useRef, useState, useMemo } from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { getResearch, getProfile, getSkills, getProjects, getCurrentlyWorking, getTimeline } from "@/sanityQueries";

export const getStaticProps: GetStaticProps = async () => {
  try {
    const [researchItems, profile, skills, projects, currentlyWorking, timeline] = await Promise.allSettled([
      getResearch(),
      getProfile(),
      getSkills(),
      getProjects(),
      getCurrentlyWorking(),
      getTimeline()
    ]);

    return {
      props: {
        researchItems: researchItems.status === 'fulfilled' ? researchItems.value : [],
        profile: profile.status === 'fulfilled' ? profile.value : null,
        skills: skills.status === 'fulfilled' ? skills.value : [],
        projects: projects.status === 'fulfilled' ? projects.value : [],
        currentlyWorking: currentlyWorking.status === 'fulfilled' ? currentlyWorking.value : {},
        timeline: timeline.status === 'fulfilled' ? timeline.value : []
      },
      revalidate: 60 // Revalidate every 60 seconds
    };
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching data:', error);
    }
    return {
      props: {
        researchItems: [],
        profile: null,
        skills: [],
        projects: [],
        currentlyWorking: {},
        timeline: []
      },
      revalidate: 60
    };
  }
};

type Profile = {
  name: string;
  degree: string;
  title: string;
  openToOpportunities: boolean;
};

type PortfolioProps = {
  researchItems: { _id?: string; title: string; year: string; description: string; link?: string }[];
  profile: Profile;
  skills: { name: string; _id?: string }[];
  projects: { _id?: string; title: string; description: string; link: string; preview?: { asset?: { url?: string } } }[];
  currentlyWorking: {
    title?: string;
    projectTitle?: string;
    description?: string;
    techs?: string[];
    progress?: string;
    excitement?: string;
  };
  timeline: { _id?: string; year: string; title: string; desc: string }[];
};

export default function Portfolio({ researchItems, profile, skills, projects, currentlyWorking, timeline }: PortfolioProps) {
  // All hooks at the top
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const sectionIds = useMemo(() => [
    'home', 'skills', 'ongoing-project', 'research', 'projects', 'about', 'contact'
  ], []);
  const [message, setMessage] = useState("");
  const showMatrixRef = useRef(false); // Ref to track matrix state without causing re-renders
  
  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    let t = 0;
    let animationId: number;
    let isVisible = true;
    
    // Check if canvas is visible
    const checkVisibility = () => {
      const rect = canvas.getBoundingClientRect();
      isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    };
    
    const draw = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(29, 29, 31, 0.04)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(29, 29, 31, 0.15)";
      ctx.lineWidth = 1.5;
      let first = true;
      for (let i = 0; i < 1000; i++) {
        const x = canvas.width / 2 + 200 * Math.sin(3 * t + i * 0.01 + Math.PI / 2);
        const y = canvas.height / 2 + 200 * Math.sin(2 * t + i * 0.01) + canvas.height / 2;
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      // Matrix effect overlay (doesn't interfere with main animation)
      if (showMatrixRef.current) {
        ctx.font = "16px monospace";
        ctx.fillStyle = "rgba(29, 29, 31, 0.18)";
        ctx.shadowColor = "rgba(29,29,31,0.14)";
        ctx.shadowBlur = 2;
        for (let i = 0; i < canvas.width; i += 25) {
          const char = Math.random() > 0.5 ? "0" : "1";
          const y = (Math.sin(t + i * 0.05) * canvas.height) / 2 + canvas.height / 2;
          ctx.fillText(char, i, y);
        }
        ctx.shadowBlur = 0;
      }
      
      t += 0.01;
      animationId = requestAnimationFrame(draw);
    };
    
    draw();
    
    // Check visibility on scroll
    window.addEventListener('scroll', checkVisibility, { passive: true });
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener('scroll', checkVisibility);
    };
  }, []); // Removed showMatrix dependency to prevent animation restart

  useEffect(() => {
    const handleScroll = () => {
      let found = 'home';
      const scrollThreshold = Math.max(80, window.innerHeight * 0.1); // Responsive threshold
      for (let i = 0; i < sectionIds.length; i++) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (
            (i === sectionIds.length - 1 && (rect.top <= scrollThreshold || rect.bottom <= window.innerHeight))
            || (rect.top <= scrollThreshold)
          ) {
            found = id;
          }
        }
      }
      setActiveSection(found);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
    }, [sectionIds]);

  useEffect(() => {
    const showMatrixHover = () => {
      showMatrixRef.current = true;
    };
    const hideMatrixHover = () => {
      showMatrixRef.current = false;
    };
    const elements = document.querySelectorAll('[data-matrix-hover]');
    elements.forEach(el => {
      el.addEventListener('mouseenter', showMatrixHover);
      el.addEventListener('mouseleave', hideMatrixHover);
      el.addEventListener('touchstart', showMatrixHover);
      el.addEventListener('touchend', hideMatrixHover);
    });
    return () => {
      elements.forEach(el => {
        el.removeEventListener('mouseenter', showMatrixHover);
        el.removeEventListener('mouseleave', hideMatrixHover);
        el.removeEventListener('touchstart', showMatrixHover);
        el.removeEventListener('touchend', hideMatrixHover);
      });
    };
  }, []);


  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d1d1f] mx-auto mb-4"></div>
          <p className="text-[#1d1d1f]">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!message.trim() || message.trim().length < 20) return;
    const email = 'jenishkshetri131@gmail.com';
    const mailto = `mailto:${email}?subject=Portfolio Contact&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  return (
    <>
      <Head>
        <title>{profile.name || 'Jenish Kshetri'} | Portfolio</title>
        <meta name="description" content="ML Engineer, Developer, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="ML Engineer, Developer, Portfolio, Jenish Kshetri, Machine Learning" />
        <meta name="author" content="Jenish Kshetri" />
        <meta property="og:title" content="Jenish Kshetri | Portfolio" />
        <meta property="og:description" content="ML Engineer, Developer, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://jenishkshetri.com.np/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Jenish Kshetri | Portfolio" />
        <meta name="twitter:description" content="ML Engineer, Developer, and more." />
        <link rel="canonical" href="https://jenishkshetri.com.np" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Skip to content link for accessibility */}
      <a href="#home" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#1d1d1f] text-white px-4 py-2 rounded z-50">
        Skip to content
      </a>
      {/* Top Nav - Outside main container for proper sticky behavior */}
      <nav className="fixed top-0 left-0 w-full z-50 flex gap-2 sm:gap-4 justify-center items-center py-1 sm:py-3 px-1 sm:px-6 text-[#1d1d1f] text-xs sm:text-sm select-none font-sans glass shadow-sm">
        <a data-matrix-hover href="#home" onClick={e => handleNavClick(e, 'home')} className={`hover:text-[#1d1d1f] transition-colors rounded px-2 py-1 ${activeSection === 'home' ? 'font-bold underline underline-offset-8' : ''} break-words`}>Home</a>
        <a data-matrix-hover href="#skills" onClick={e => handleNavClick(e, 'skills')} className={`hover:text-[#1d1d1f] transition-colors rounded px-2 py-1 ${activeSection === 'skills' ? 'font-bold underline underline-offset-8' : ''} break-words`}>Skills</a>
        <a data-matrix-hover href="#ongoing-project" onClick={e => handleNavClick(e, 'ongoing-project')} className={`hover:text-[#1d1d1f] transition-colors rounded px-2 py-1 ${activeSection === 'ongoing-project' ? 'font-bold underline underline-offset-8' : ''} break-words`}>Ongoing Project</a>
        <a data-matrix-hover href="#research" onClick={e => handleNavClick(e, 'research')} className={`hover:text-[#1d1d1f] transition-colors rounded px-2 py-1 ${activeSection === 'research' ? 'font-bold underline underline-offset-8' : ''} break-words`}>Research</a>
        <a data-matrix-hover href="#projects" onClick={e => handleNavClick(e, 'projects')} className={`hover:text-[#1d1d1f] transition-colors rounded px-2 py-1 ${activeSection === 'projects' ? 'font-bold underline underline-offset-8' : ''} break-words`}>Projects</a>
        {/* Right-edge fade for scroll hint */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white via-white/80 to-transparent" />
      </nav>
      
      <div className="relative w-full min-h-screen font-sans overflow-x-hidden" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      />

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto glass" id="home">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1d1d1f] mb-6 break-words">
          {profile.title}
        </h1>
        <div className="bg-[#f5f5f7] p-6 mt-8 rounded-lg border border-[#e5e5ea] text-left shadow-sm">
          <pre className="text-xs sm:text-sm md:text-base text-[#1d1d1f] whitespace-pre-wrap font-mono break-words max-w-full">
{`class Developer:
    def __init__(self):
        self.name = "${profile.name}"
        self.degree = "${profile.degree}"
        self.title = "${profile.title}"
        self.open_to_opportunities = ${profile.openToOpportunities ? "True" : "False"}`}
          </pre>
        </div>
      </section>

      {/* Skills Section */}
      <section className="px-6 py-20 max-w-4xl mx-auto glass mt-10" id="skills">
        <motion.h2
          className="text-2xl font-semibold text-[#1d1d1f] mb-4 inline-block break-words"
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          whileInView={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
        >
          Skills
          <motion.div
            className="h-[3px] rounded mt-2"
            animate={{ scaleX: activeSection === 'skills' ? 1 : 0, backgroundColor: activeSection === 'skills' ? '#1d1d1f' : 'rgba(0,0,0,0)' }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
            style={{ originX: 0, width: '100%' }}
          />
        </motion.h2>
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          {(skills as { name: string; _id?: string }[]).map((skill: { name: string; _id?: string }, idx: number) => (
            <motion.div
              key={skill._id || idx}
              className="px-5 py-2 rounded-full bg-[#f5f5f7] border border-[#e5e5ea] text-[#1d1d1f] font-mono text-xs sm:text-base md:text-lg break-words shadow-sm"
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: idx * 0.05 }}
            >
              {skill.name}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Currently Working On Section (replaces Job Fit Predictor) */}
      <section className="px-6 py-20 max-w-4xl mx-auto glass mt-10" id="ongoing-project">
        <motion.h2
          className="text-2xl font-semibold text-[#1d1d1f] mb-4 inline-block break-words"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {currentlyWorking?.title || 'Ongoing Project'}
          <motion.div
            className="h-[3px] rounded mt-2"
            animate={{ scaleX: activeSection === 'ongoing-project' ? 1 : 0, backgroundColor: activeSection === 'ongoing-project' ? '#1d1d1f' : 'rgba(0,0,0,0)' }}
            transition={{ duration: 0.4 }}
            style={{ originX: 0, width: '100%' }}
          />
        </motion.h2>
        <div className="bg-[#f5f5f7] p-6 rounded-lg border border-[#e5e5ea] shadow-sm">
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">{currentlyWorking?.projectTitle || 'Project Title'}</h3>
          <p className="text-sm text-[#1d1d1f] mb-2">
            {currentlyWorking?.description || 'Brief description of what you are currently working on.'}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {(currentlyWorking?.techs || ['Tech 1', 'Tech 2', 'Tech 3']).map((tech: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-[#e5e5ea] rounded-full text-xs font-mono">{tech}</span>
            ))}
          </div>
          <p className="text-xs text-[#888] mb-2">Progress: {currentlyWorking?.progress || 'Progress update.'}</p>
          <p className="text-xs text-[#1d1d1f] italic">Why I&apos;m excited: {currentlyWorking?.excitement || 'Your excitement or motivation.'}</p>
        </div>
      </section>

      {/* Research Section */}
      <section className="px-6 py-20 max-w-4xl mx-auto glass mt-10" id="research">
        <motion.h2
          className="text-2xl font-semibold text-[#1d1d1f] mb-4 inline-block break-words"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Research
          <motion.div
            className="h-[3px] rounded mt-2"
            animate={{ scaleX: activeSection === 'research' ? 1 : 0, backgroundColor: activeSection === 'research' ? '#1d1d1f' : 'rgba(0,0,0,0)' }}
            transition={{ duration: 0.4 }}
            style={{ originX: 0, width: '100%' }}
          />
        </motion.h2>
        <div className="space-y-6">
          {(researchItems as { _id?: string; title: string; year: string; description: string; link?: string }[]).map((research: { _id?: string; title: string; year: string; description: string; link?: string }, idx: number) => (
            <div key={research._id || idx} className="bg-[#f5f5f7] border border-[#e5e5ea] rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d1d1f] break-words">{research.title}</h3>
                <span className="text-xs text-[#888] font-mono break-words">{research.year}</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm md:text-base text-[#1d1d1f] break-words">{research.description}</p>
              {research.link && (
                <a href={research.link} target="_blank" rel="noopener noreferrer" className="text-[#1d1d1f] underline text-xs sm:text-sm md:text-base mt-2 inline-block break-words">
                  View Paper
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="px-6 py-20 max-w-4xl mx-auto glass mt-10" id="projects">
        <motion.h2
          className="text-2xl font-semibold text-[#1d1d1f] mb-4 inline-block break-words"
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          whileInView={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
        >
          Projects
          <motion.div
            className="h-[3px] rounded mt-2"
            animate={{ scaleX: activeSection === 'projects' ? 1 : 0, backgroundColor: activeSection === 'projects' ? '#1d1d1f' : 'rgba(0,0,0,0)' }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
            style={{ originX: 0, width: '100%' }}
          />
        </motion.h2>
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto p-6 scrollbar-hidden group relative"
          style={{ scrollBehavior: "smooth" }}
          onScroll={() => {
            const el = scrollRef.current;
            if (el && el.scrollWidth > el.clientWidth) {
              setScrollPercent(el.scrollLeft / (el.scrollWidth - el.clientWidth));
            } else {
              setScrollPercent(0);
            }
          }}
        >
          {(projects as { _id?: string; title: string; description: string; link: string; preview?: { asset?: { url?: string } } }[]).map((project: { _id?: string; title: string; description: string; link: string; preview?: { asset?: { url?: string } } }, idx: number) => (
            <motion.a
              key={project._id || idx}
              data-matrix-hover
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[20rem] glass p-4 text-[#1d1d1f] flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] focus:ring-offset-2"
              aria-label={`${project.title} project link`}
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              whileInView={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={prefersReducedMotion ? { duration: 0 } : { 
                duration: 0.4, 
                delay: Math.min(idx * 0.05, 0.3), 
                ease: "easeOut" 
              }}
              whileHover={prefersReducedMotion ? {} : { 
                scale: 1.02, 
                y: -4,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              whileFocus={prefersReducedMotion ? {} : { 
                scale: 1.02, 
                y: -4,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
            >
              <div className="relative h-32 mb-2 overflow-hidden rounded-lg">
                <Image
                  src={project.preview?.asset?.url || '/vercel.svg'}
                  alt={project.title + ' preview'}
                  fill
                  className="absolute inset-0 w-full h-full object-contain opacity-100 scale-100 transition-transform duration-300 ease-out"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/vercel.svg';
                  }}
                />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#1d1d1f] font-sans mb-2 break-words">{project.title}</h3>
              <p className="text-xs sm:text-sm md:text-base mt-2 text-[#1d1d1f] font-sans break-words">{project.description}</p>
            </motion.a>
          ))}
        </div>
        {/* Scroll indicator */}
        <div className="w-full flex justify-center mt-4">
          <div className="h-2 w-40 bg-[#e5e5ea] rounded-full relative overflow-hidden shadow-inner">
            <motion.div
              className="h-2 bg-[#1d1d1f] rounded-full absolute left-0 shadow-sm"
              animate={{ width: `${Math.max(scrollPercent * 100, 5)}%` }}
              transition={{ duration: 0.2 }}
              style={{ minWidth: 24 }}
            />
          </div>
        </div>
        <style>{`
          .scrollbar-hidden::-webkit-scrollbar { display: none; }
          .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </section>

      {/* Timeline Section */}
      <section className="px-6 py-20 max-w-4xl mx-auto glass mt-10" id="about">
        <motion.h2
          className="text-2xl font-semibold text-[#1d1d1f] mb-4 inline-block break-words"
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          whileInView={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
        >
          Timeline
          <motion.div
            className="h-[3px] rounded mt-2"
            animate={{ scaleX: activeSection === 'about' ? 1 : 0, backgroundColor: activeSection === 'about' ? '#1d1d1f' : 'rgba(0,0,0,0)' }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
            style={{ originX: 0, width: '100%' }}
          />
        </motion.h2>
        <div className="relative border-l-2 border-[#e5e5ea] ml-6 rounded-xl p-4">
          {(timeline as { _id?: string; year: string; title: string; desc: string }[]).map((t: { _id?: string; year: string; title: string; desc: string }, idx: number) => (
            <motion.div
              key={t._id || t.year}
              className="mb-12 ml-6 relative"
              initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              whileInView={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={prefersReducedMotion ? { duration: 0 } : { 
                duration: 0.4, 
                delay: Math.min(idx * 0.05, 0.3), 
                ease: "easeOut" 
              }}
            >
              <div className="absolute -left-7 top-0 w-5 h-5 rounded-full bg-[#1d1d1f] border-2 border-[#f5f5f7] shadow-lg" />
              <div className="bg-[#f5f5f7] rounded-lg shadow p-6 border border-[#e5e5ea]">
                <div className="text-xs text-[#888] font-mono mb-1 break-words">{t.year}</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#1d1d1f] mb-1 break-words">{t.title}</div>
                <div className="text-xs sm:text-sm md:text-base text-[#1d1d1f] break-words">{t.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Me */}
      <section className="px-6 py-20 max-w-4xl mx-auto glass mt-10" id="contact">
        <motion.h2
          className="text-2xl font-semibold text-[#1d1d1f] mb-4 inline-block break-words"
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          whileInView={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
        >
          Contact Me
          <motion.div
            className="h-[3px] rounded mt-2"
            animate={{ scaleX: activeSection === 'contact' ? 1 : 0, backgroundColor: activeSection === 'contact' ? '#1d1d1f' : 'rgba(0,0,0,0)' }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
            style={{ originX: 0, width: '100%' }}
          />
        </motion.h2>
        <div className="bg-[#f5f5f7] p-6 rounded-lg border border-[#e5e5ea] relative">
          <label htmlFor="contact-message" className="mb-2 select-none text-[#1d1d1f] font-sans text-xs sm:text-sm md:text-base break-words block">&gt; Type your message and press send:</label>
          <textarea
            id="contact-message"
            data-matrix-hover
            className="w-full h-40 p-4 bg-[#f5f5f7] border border-[#e5e5ea] text-[#1d1d1f] rounded-md placeholder:text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] font-sans resize-none text-base sm:text-sm md:text-base break-words"
            rows={4}
            placeholder="Hello Jenish, I wanted to reach out about..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            aria-describedby="message-help"
          />
          <Button
            data-matrix-hover
            onClick={handleSend}
            className="mt-2 shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 bg-[#1d1d1f] text-white hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={message.trim().length < 20}
          >
            Send Message
          </Button>
          {message.trim().length > 0 && message.trim().length < 20 && (
            <div id="message-help" className="text-xs text-red-500 mt-1">Please write at least a sentence before sending.</div>
          )}
          {/* Social Links Bottom Right */}
          <div className="absolute bottom-6 right-6 flex gap-4 text-[#1d1d1f] hover:text-[#1d1d1f]">
            <a data-matrix-hover href="https://github.com/Jenisssshhhh" target="_blank" rel="noopener noreferrer" aria-label="Visit Jenish's GitHub profile">
              <FaGithub size={20} className="hover:text-[#1d1d1f] hover:scale-110 transition-all duration-200" />
            </a>
            <a data-matrix-hover href="https://linkedin.com/in/jenish-kshetri" target="_blank" rel="noopener noreferrer" aria-label="Visit Jenish's LinkedIn profile">
              <FaLinkedin size={20} className="hover:text-[#1d1d1f] hover:scale-110 transition-all duration-200" />
            </a>
            <a data-matrix-hover href="mailto:jenishkshetri131@gmail.com" aria-label="Send email to Jenish Kshetri">
              <FaEnvelope size={20} className="hover:text-[#1d1d1f] hover:scale-110 transition-all duration-200" />
            </a>
          </div>
        </div>
      </section>
    </div>
    {/* Copyright Footer */}
    <footer className="w-full text-center py-4 text-xs sm:text-sm md:text-base text-[#888] bg-transparent select-none mt-10 break-words">
      © {new Date().getFullYear()} Jenish Kshetri. All rights reserved.
    </footer>
    </>
  );
}