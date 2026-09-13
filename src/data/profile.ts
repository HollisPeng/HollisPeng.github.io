export const profile = {
  name: 'Hollis Peng',
  statement: 'Computer Science student at CUHK.',
  description: 'Personal website of Hollis Peng, a Computer Science student at CUHK interested in artificial intelligence and algorithms.',
  email: 'hmhollispeng@gmail.com',
  github: 'https://github.com/HollisPeng',
  source: 'https://github.com/HollisPeng/HollisPeng.github.io',
  about: 'I study Computer Science at The Chinese University of Hong Kong. My interests include algorithms and artificial intelligence. This site collects my projects and records some of the things I am working on.',
  college: 'United College, The Chinese University of Hong Kong',
  currently: [
    'Exploring artificial intelligence and algorithms.',
    'Building and refining personal projects.',
    'Learning Python, C++, Java, probability, and discrete mathematics.',
  ],
};

export const navigation = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'GitHub', href: profile.github },
  { label: 'Email', href: `mailto:${profile.email}` },
];

export const featuredProjects = [
  {
    repository: 'cumcm-2026-a-herbal-drying',
    title: 'Herbal Drying — CUMCM 2026 A',
    description: 'A mathematical modeling study of heat and mass transfer in herbal material drying, based on CUMCM 2026 Problem A.',
  },
  {
    repository: 'ncurses-maze-game',
    title: 'ncurses Maze Game',
    description: 'A terminal maze game written in C with ncurses, developed from an ESTR1002 course project.',
  },
];

type Skill = { name: string; learning?: boolean };
export const skills: { category: string; items: Skill[] }[] = [
  { category: 'Programming', items: [{ name: 'C' }, { name: 'Python', learning: true }, { name: 'C++', learning: true }, { name: 'Java', learning: true }] },
  { category: 'Mathematics', items: [{ name: 'Linear Algebra' }, { name: 'Calculus' }, { name: 'Probability', learning: true }, { name: 'Discrete Mathematics', learning: true }] },
  { category: 'Tools', items: [{ name: 'Linux' }, { name: 'Git' }, { name: 'GitHub' }] },
  { category: 'Interests', items: [{ name: 'Artificial Intelligence' }, { name: 'Algorithms' }] },
];
