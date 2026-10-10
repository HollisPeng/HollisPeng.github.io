export const profile = {
  name: 'Hollis Peng',
  statement: 'Computer Science student at CUHK, interested in generative AI.',
  status: 'Studying energy-based models and variational methods',
  description: 'Personal website of Hollis Peng, a Computer Science student at CUHK interested in generative AI and currently studying energy-based models and variational methods.',
  email: 'hmhollispeng@gmail.com',
  github: 'https://github.com/HollisPeng',
  source: 'https://github.com/HollisPeng/HollisPeng.github.io',
  about: 'I study Computer Science at The Chinese University of Hong Kong. My interest is in generative AI, and I am currently studying energy-based models and variational methods. This site collects my projects and records some of the things I am working on.',
  college: 'United College, The Chinese University of Hong Kong',
  currently: [
    'Studying generative AI through energy-based models and variational methods.',
    'Building and refining personal projects.',
    'Learning Python, Java, probability, and discrete mathematics.',
  ],
};

export const navigation = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'GitHub', href: profile.github },
  { label: 'Email', href: `mailto:${profile.email}` },
];

// Ordered by scope and impact. `owner` marks a repository that belongs to someone else.
// Work that is not public has no `repository` and is described without a link.
export type FeaturedProject = {
  title: string;
  role: string;
  description: string;
  tags?: string[];
  repository?: string;
  owner?: string;
  pullRequest?: number;
};
export const featuredProjects: FeaturedProject[] = [
  {
    title: 'Agent Nexus',
    role: 'Core contributor',
    description: 'A collaboration platform for AI agents, built with a small team. I contribute across the backend, the web and desktop clients, and the project’s build and CI tooling.',
    tags: ['Team project', 'Private repository'],
  },
  {
    repository: 'cumcm-2026-a-herbal-drying',
    title: 'Herbal Drying — CUMCM 2026 A',
    role: 'Author',
    description: 'A personal study of CUMCM 2026 Problem A: heat and moisture transport in drying medicinal herbs, modeled with axisymmetric finite volumes and an implicit BDF solver. Includes the paper, code, data, and numerical results.',
  },
  {
    repository: 'ncurses-maze-game',
    title: 'ncurses Maze Game',
    role: 'Author',
    description: 'A terminal maze game in C11 and ncurses with teleporters, timed spikes, powerups, and a moving exit. Developed from my ESTR1002 final project, with game rules kept separate from the interface and covered by tests and sanitizer builds.',
  },
  {
    repository: 'euclid_maths',
    owner: 'LongxuanWangHSY',
    pullRequest: 2,
    title: 'Euclid’s Gate',
    role: 'Contributor',
    description: 'The content repository and AI writing workflow behind a mathematics education publication. I reorganized the repository by content type, repaired article indexes and image references, and added licensing and project configuration.',
    tags: ['Python', 'Open-source contribution'],
  },
];

// Ordered by relevance to research on energy-based models and variational methods,
// with skills still being learned placed after established ones.
type Skill = { name: string; learning?: boolean };
export const skills: { category: string; items: Skill[] }[] = [
  { category: 'Mathematics', items: [{ name: 'Calculus' }, { name: 'Linear Algebra' }, { name: 'Probability', learning: true }, { name: 'Discrete Mathematics', learning: true }] },
  { category: 'Programming', items: [{ name: 'C' }, { name: 'Python', learning: true }, { name: 'Java', learning: true }] },
  { category: 'Tools', items: [{ name: 'Linux' }, { name: 'Git' }, { name: 'GitHub' }] },
  { category: 'Generative AI', items: [{ name: 'Energy-Based Models', learning: true }, { name: 'Variational Methods', learning: true }] },
];
