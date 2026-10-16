import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useTheme } from '../../context/ThemeContext';
import heroImage from '../../assets/yue.png';
import poseOne from '../../assets/pose1.png';

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

const formatProjectDate = timestamp => {
  if (!timestamp) return 'Date unavailable';
  const date = timestamp.toDate?.() || (timestamp instanceof Date ? timestamp : new Date(timestamp));
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const SectionHeading = ({ eyebrow, title, description }) => (
  <motion.div
    variants={reveal}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.25 }}
    className="mb-10 max-w-2xl"
  >
    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
    <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">{title}</h2>
    <p className="mt-4 text-base leading-7 text-slate-300/75">{description}</p>
  </motion.div>
);

const ProfileShuffleCard = () => {
  const cards = [
    { image: heroImage, label: 'YUE / CHARACTER' },
    { image: poseOne, label: 'RYUU / DEVELOPER' },
    // { image: poseTwo, label: 'RYUU / EXPLORER' },
  ];
  const [order, setOrder] = useState(cards.map((_, index) => index));
  const lastTapRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOrder(current => [...current.slice(1), current[0]]);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const handleCardTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 1200) return;

    lastTapRef.current = now;
    setOrder(current => [...current.slice(1), current[0]]);
  };

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rotate-3 rounded-[2rem] border border-cyan-300/15 bg-cyan-300/5" />
      <div className="relative rounded-[2rem] border border-white/15 bg-slate-900 p-4 shadow-2xl shadow-cyan-950/40">
        <div className="mb-5 flex items-center justify-between text-xs text-slate-400">
          <span>RYUU / SHUFFLE DECK</span>
          <span className="text-emerald-300">● Alive</span>
        </div>
        <div className="relative aspect-square rounded-2xl bg-slate-950/70">
          {order.map((cardIndex, stackIndex) => {
            const card = cards[cardIndex];
            const isTopCard = stackIndex === 0;
            return (
              <motion.div
                key={cardIndex}
                layout
                animate={{
                  scale: 1 - stackIndex * 0.035,
                  y: stackIndex * 10,
                  x: stackIndex * 5,
                  rotate: stackIndex === 0 ? 0 : stackIndex % 2 === 0 ? -3 : 3,
                  opacity: 1 - stackIndex * 0.12,
                }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                className={`absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 ${isTopCard ? 'z-30 cursor-pointer' : 'z-20'}`}
                onClick={isTopCard ? handleCardTap : undefined}
              >
                <img
                  src={card.image}
                  alt={`${card.label} profile card`}
                  className={`h-full w-full object-center object-contain origin-center ${card.image === poseOne ? 'scale-[1.35] -translate-y-[12%]' : ''}`}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent px-4 pb-4 pt-10">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-cyan-300">{card.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="flex items-center justify-between px-2 pb-1 pt-5">
          <span className="text-sm font-semibold text-slate-100">Ryuu</span>
          <span className="text-xs uppercase tracking-[0.18em] text-cyan-300">Creator / Builder</span>
        </div>
      </div>
    </div>
  );
};

const HeroProfileCard = () => (
  <div className="relative mx-auto w-full max-w-sm">
    <div className="absolute -inset-5 rounded-[2rem] border border-cyan-300/10 bg-cyan-300/5 blur-sm" />
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/[0.06] p-5 shadow-2xl shadow-cyan-950/40 backdrop-blur-md">
      <div className="mb-5 flex items-center justify-between text-xs text-slate-400">
        <span>RYUU / YUE</span>
        <span className="text-emerald-300">● Alive</span>
      </div>
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-slate-950/70">
        <img
          src={heroImage}
          alt="Yue character illustration"
          className="w-4/5"
        />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Currently sleeping</p>
          <p className="mt-1 font-semibold text-slate-100">ALIVE FOR YUE</p>
        </div>
        <span className="text-3xl text-cyan-300">✦</span>
      </div>
    </div>
  </div>
);

const Topbar = () => {
  const { toggleTheme, isDarkMode } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#top" className="text-lg font-bold tracking-tight text-white">
          Ryuu<span className="text-cyan-300">Portofolio.</span>
        </a>
        <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <a href="#profile" className="transition-colors hover:text-cyan-300">About</a>
          <a href="#projects" className="transition-colors hover:text-cyan-300">Work</a>
          <a href="#tools" className="transition-colors hover:text-cyan-300">Tools</a>
          <a href="#social" className="transition-colors hover:text-cyan-300">Connect</a>
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-200"
          title="Toggle theme"
        >
          {isDarkMode ? '☀ Light' : '☾ Dark'}
        </button>
      </nav>
    </header>
  );
};

const HeroSection = () => (
  <section id="top" className="relative overflow-hidden">
    <div className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
    <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:pb-32 lg:pt-28">
      <motion.div initial="hidden" animate="visible" variants={reveal}>
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          Available for Sleepy
        </p>
        <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
          Beginner <span className="text-cyan-300">Programmer.</span>
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300/80">
          I&apos;m Ryuu, a full-stack developer, designer, and game-developer. I hate coding,
          but i want make something.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#projects" className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200">
            Explore my world <span aria-hidden="true">↓</span>
          </a>
          <a href="#contact" className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200">
            Let&apos;s talk
          </a>
        </div>
        <div className="mt-12 flex gap-8 border-t border-white/10 pt-5 text-sm text-slate-400">
          <span><strong className="mr-1 text-xl text-white">01</strong> Hate coding</span>
          <span><strong className="mr-1 text-xl text-white">02</strong> Love yue</span>
          <span><strong className="mr-1 text-xl text-white">03</strong> Love coffee</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        className="relative mx-auto w-full max-w-md"
      >
        <HeroProfileCard />
      </motion.div>
    </div>
  </section>
);

const SkillsSection = () => {
  const { projects, categories, loading } = usePortfolioData();

  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="A little context"
        title="I like building things that make sense."
        description="My portfolio grows with every experiment. Here is a live look at the kinds of work I have been exploring."
      />
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="rounded-3xl border border-white/10 bg-white/[0.045] p-7">
          <p className="text-sm leading-7 text-slate-300/80">
            From a blank mind to a working experience, I care about the details in between:
            clear structure, expressive visuals, and an experience that feels natural to use.
          </p>
          <div className="mt-8 flex items-center gap-8 border-t border-white/10 pt-6">
            <div><p className="text-3xl font-bold text-cyan-300">{projects.length}</p><p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Projects</p></div>
            <div><p className="text-3xl font-bold text-cyan-300">{categories.length}</p><p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Categories</p></div>
          </div>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">
          {loading ? <div className="animate-pulse text-slate-400">Computing categories...</div> : categories.map((category, index) => (
            <motion.div
              key={category.name}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 transition-colors hover:border-cyan-300/30"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold text-slate-100">{category.name}</span>
                <span className="font-mono text-sm text-cyan-300">{Math.round(category.progress)}%</span>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${category.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">{category.count} project{category.count === 1 ? '' : 's'}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => (
  <section id="profile" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
    <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="relative mx-auto w-full max-w-sm"
      >
        <ProfileShuffleCard />
      </motion.div>
      <div>
        <SectionHeading
          eyebrow="Beyond the screen"
          title="A person behind the pixels."
          description="I enjoy the balance between structure and expression: solving a real problem, then giving it a voice through thoughtful design."
        />
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          {[
            ['01', 'Curiosity', 'Always learning something new.'],
            ['02', 'Craft', 'Careful with the details that matter.'],
            ['03', 'Clarity', 'Making complex things easier to use.'],
          ].map(([number, title, text]) => (
            <div key={number} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <span className="font-mono text-xs text-cyan-300">{number}</span>
              <h3 className="mt-4 font-semibold text-slate-100">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

const SoftwareSection = () => {
  const software = [
    { name: 'VS Code', detail: 'Development', mark: '</>' },
    { name: 'Photoshop', detail: 'Visual design', mark: 'Ps' },
    { name: 'After Effects', detail: 'Motion design', mark: 'Ae' },
    { name: 'Figma', detail: 'Interface design', mark: 'Fg' },
    { name: 'Blender', detail: '3D experiments', mark: 'B' },
    { name: 'Git', detail: 'Version control', mark: '⌘' },
  ];

  return (
    <section id="tools" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="My toolkit"
        title="The tools I use to bring ideas to life."
        description="A practical mix of development, design, and creative tools that helps me move from a rough thought to a finished experience."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {software.map((tool, index) => (
          <motion.div
            key={tool.name}
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.06 }}
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:-translate-y-1 hover:border-cyan-300/35"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 font-mono text-sm font-bold text-cyan-300 transition group-hover:bg-cyan-300 group-hover:text-slate-950">
              {tool.mark}
            </span>
            <div>
              <h3 className="font-semibold text-slate-100">{tool.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{tool.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const ExperienceCarousel = () => {
  const { projects, loading } = usePortfolioData();
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = projects.filter(project => project.imageUrl).slice(0, 8);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setActiveIndex(index => (index + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeProject = slides[activeIndex];

  return (
    <section id="experience" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="In the process"
        title="Snapshots from the journey."
        description="A small carousel of project moments. The selection updates automatically as new image-backed projects are added."
      />
      {loading ? (
        <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.045] p-12 text-center text-slate-400">Loading project snapshots...</div>
      ) : activeProject ? (
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <motion.div
            key={activeProject.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-900">
              <img src={activeProject.imageUrl} alt={`${activeProject.title} project screenshot`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
              <div className="carousel-caption absolute bottom-5 left-5 right-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{activeProject.category}</p>
                <h3 className="mt-2 text-2xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.85)]">{activeProject.title}</h3>
                <p className="mt-1 text-xs font-medium text-white/80">Posted {formatProjectDate(activeProject.createdAt)}</p>
              </div>
            </div>
          </motion.div>
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <div>
              <p className="text-sm leading-7 text-slate-300/75">
                {activeProject.description || 'A glimpse into an experiment, project, or visual direction from the portfolio.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {(activeProject.technologies || activeProject.softwareUsed || []).map(tag => (
                  <span key={tag} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-400">{tag}</span>
                ))}
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="flex gap-1.5">
                {slides.map((slide, index) => (
                  <button key={slide.id} onClick={() => setActiveIndex(index)} aria-label={`Show ${slide.title}`} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-cyan-300' : 'w-2 bg-slate-700 hover:bg-slate-500'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveIndex(index => (index - 1 + slides.length) % slides.length)} className="rounded-full border border-white/10 px-3 py-1.5 text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-200" aria-label="Previous project">←</button>
                <button onClick={() => setActiveIndex(index => (index + 1) % slides.length)} className="rounded-full border border-white/10 px-3 py-1.5 text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-200" aria-label="Next project">→</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-12 text-center text-slate-500">
          Add an image to a project from the admin dashboard to see it here.
        </div>
      )}
    </section>
  );
};

const ProjectCard = ({ project }) => {
  const isWeb = project.category === 'Web Development';
  const targetUrl = isWeb && project.projectUrl ? project.projectUrl : `/project/${project.id}`;
  const content = (
    <>
      <div className="relative h-52 overflow-hidden bg-slate-900">
        {project.imageUrl ? <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-sm text-slate-600">No preview yet</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
        <span className="absolute bottom-4 left-5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{project.category}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-slate-100">{project.title}</h3>
          <span className="shrink-0 text-right text-[11px] font-medium text-slate-400">{formatProjectDate(project.createdAt)}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{(project.technologies || project.softwareUsed || []).slice(0, 4).map(tag => <span key={tag} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-400">{tag}</span>)}</div>
      </div>
    </>
  );

  return isWeb && project.projectUrl ? <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40">{content}</a> : <Link to={targetUrl} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40">{content}</Link>;
};

const ProjectsSection = () => {
  const { projects, loading } = usePortfolioData();
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Web Development', 'Design/Editing', 'Fotografi', 'Game Development'];
  const filteredProjects = filter === 'All' ? projects : projects.filter(project => project.category === filter);

  return (
    <section id="projects" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <SectionHeading eyebrow="Selected work" title="A few things I have made." description="Browse the projects that have shaped my skills and my point of view." />
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map(category => <button key={category} onClick={() => setFilter(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${filter === category ? 'bg-cyan-300 font-semibold text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/40'}`}>{category}</button>)}
      </div>
      {loading ? <div className="animate-pulse text-slate-400">Loading projects...</div> : <motion.div layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredProjects.slice(0, 6).map(project => <ProjectCard key={project.id} project={project} />)}</motion.div>}
      {!loading && filteredProjects.length === 0 && <p className="py-10 text-center text-slate-500">No projects found for this category.</p>}
      {!loading && projects.length > 6 && <div className="mt-10 text-center"><Link to="/projects" className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">View the full archive →</Link></div>}
    </section>
  );
};

const SocialMediaSection = () => {
  const socials = [
    { name: 'Instagram', url: 'https://www.instagram.com/kanzaki.ryuu', color: 'from-pink-500 to-orange-400' },
    { name: 'Linktree', url: 'https://linktr.ee/yuukanzaki', color: 'from-green-500 to-emerald-400' },
    { name: 'Discord', url: 'https://discord.gg/FqzHvqvFcp', color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <section id="social" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <SectionHeading eyebrow="Around the web" title="Say hello, wherever you are." description="A few places where I share work, ideas, and whatever I am learning next." />
      <div className="grid gap-4 sm:grid-cols-3">
        {socials.map((social, index) => (
          <motion.a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: index * 0.1 }} className={`group rounded-3xl bg-gradient-to-br ${social.color} p-6 text-white shadow-lg transition hover:-translate-y-1`}>
            <div className="flex items-center justify-between"><span className="text-lg font-bold">{social.name}</span><span className="transition group-hover:translate-x-1">↗</span></div>
            <p className="mt-10 text-sm text-white/75">Connect with me</p>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

const ContactSection = () => (
  <section id="contact" className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
    <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.06] p-8 text-center sm:p-12">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Have an idea?</p>
      <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Let&apos;s make it feel right.</h2>
      <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300/75">Tell me what you are working on, what is not working yet, or simply say hello.</p>
      <a href="mailto:hello@ryuu.dev" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">Start a conversation →</a>
    </div>
  </section>
);

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <AnimatePresence>{visible && <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-40 rounded-full border border-white/20 bg-slate-900/90 p-3 text-cyan-300 shadow-xl backdrop-blur" title="Back to top">↑</motion.button>}</AnimatePresence>;
};

const Home = () => (
  <div className="home-page min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-cyan-300 selection:text-slate-950">
    <Topbar />
    <main>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <SoftwareSection />
      <ExperienceCarousel />
      <ProjectsSection />
      <SocialMediaSection />
      <ContactSection />
    </main>
    <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} Ryuu. Made with intention.
    </footer>
    <ScrollToTopButton />
  </div>
);

export default Home;
