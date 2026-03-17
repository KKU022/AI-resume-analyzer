export const mockAnalysisData = {
  overallScore: 84,
  atsCompatibility: 78,
  skillMatch: 92,
  experienceStrength: 74,
  score: 84,
  ats: {
    score: 78,
    explanation: 'Your resume passes approximately 78% of ATS filters. Add a few missing role keywords to improve visibility.',
    improvements: [
      'Add role keywords naturally in project bullets.',
      'Use measurable outcomes in at least 3 experience bullets.',
      'Move strongest technical stack into top summary section.',
    ],
  },
  skills: {
    matched: ['React', 'TypeScript', 'Next.js', 'Node.js', 'REST API'],
    missing: ['System Design', 'Docker'],
    inferred: ['CI/CD'],
  },
  extracted: {
    skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'Tailwind CSS'],
    experienceLines: [
      'Built and shipped a React dashboard used by 2,000+ weekly users.',
      'Reduced page load time by 32% by optimizing bundle splitting.',
    ],
    projectLines: [
      'Developed a resume analyzer SaaS with Next.js and MongoDB.',
    ],
    educationLines: ['B.Tech in Computer Science'],
  },
  insights: [
    'Strong frontend alignment with good ATS potential.',
    'Biggest gap is architecture-level backend depth.',
    'Impact bullets are present but can be expanded for recruiter clarity.',
  ],
  nextSteps: [
    'Add metrics to 2 more project bullets.',
    'Learn and showcase System Design basics in one case-study project.',
    'Apply to Frontend/UI Engineer roles this week.',
  ],
  problems: [
    'Missing role-critical keywords: System Design, Docker.',
    'Some bullets still describe tasks instead of outcomes.',
  ],
  improvements: [
    'Rewrite bullets in action + scope + metric format.',
    'Add missing keywords where genuinely used.',
    'Keep top 5 skills visible in summary section.',
  ],
  opportunities: [
    'Frontend Developer roles with strong React demand.',
    'UI Engineer positions requiring design-system ownership.',
  ],
  careerPaths: ['Frontend Developer', 'UI Engineer', 'Full Stack Developer'],
  skillsDetected: [
    { name: "React", level: 95 },
    { name: "TypeScript", level: 88 },
    { name: "Next.js", level: 90 },
    { name: "Tailwind CSS", level: 92 },
    { name: "Node.js", level: 75 },
    { name: "REST APIs", level: 83 },
  ],
  missingSkills: [
    { name: "System Design", priority: "High", resources: ["Grokking System Design", "ByteByteGo"] },
    { name: "GraphQL", priority: "Medium", resources: ["Apollo Docs", "Fullstack Open"] },
    { name: "Docker / K8s", priority: "Medium", resources: ["Docker Mastery", "Egghead.io"] },
    { name: "AWS / Cloud", priority: "Low", resources: ["AWS Cloud Practitioner", "A Cloud Guru"] },
  ],
  jobRecommendations: [
    { title: "Senior Frontend Engineer", company: "TechFlow Systems", match: 94, salary: "$140k–$180k", skills: ["React", "TypeScript", "Next.js"] },
    { title: "Full Stack Developer", company: "Innovate AI", match: 88, salary: "$120k–$160k", skills: ["React", "Node.js", "PostgreSQL"] },
    { title: "UI/UX Engineer", company: "Creative Cloud", match: 82, salary: "$110k–$150k", skills: ["Figma", "Tailwind CSS", "React"] },
    { title: "AI Product Engineer", company: "Stealth AI Startup", match: 79, salary: "$130k–$170k", skills: ["TypeScript", "OpenAI API", "Next.js"] },
  ],
  careerRoadmap: [
    { step: "Optimize Resume Keywords", description: "Align job titles and bullet points to target role ATS requirements.", duration: "1 Week" },
    { step: "Learn System Design", description: "Study distributed systems, caching, and load balancing patterns.", duration: "4 Weeks" },
    { step: "Build Cloud Portfolio", description: "Deploy 2 projects on AWS/GCP with Docker for tangible proof.", duration: "6 Weeks" },
    { step: "Network & Apply", description: "Attend 3 meetups, contribute to open-source, send 10 targeted applications.", duration: "Ongoing" },
  ],
  interviewQuestions: [
    { question: "Describe how you would architect a scalable React application for 1M users.", category: "Technical", target: "React / System Design" },
    { question: "How have you improved performance in a production web app? Give metrics.", category: "Technical", target: "Performance" },
    { question: "Tell me about a time you led a feature end-to-end under a tight deadline.", category: "Behavioral", target: "Leadership" },
    { question: "How do you stay current with rapidly changing front-end tooling?", category: "Behavioral", target: "Growth Mindset" },
  ],
  history: [
    { id: "1", date: "2024-03-01", score: 65, file: "resume_v1.pdf" },
    { id: "2", date: "2024-03-05", score: 72, file: "resume_v2.pdf" },
    { id: "3", date: "2024-03-10", score: 84, file: "resume_final.pdf" },
  ],
  suggestions: [
    {
      original: "Responsible for developing web applications.",
      improved: "Architected and deployed 3 high-performance React/Next.js applications, improving user engagement by 24% and reducing load times by 40%.",
    },
    {
      original: "Worked on team projects using Git.",
      improved: "Led a cross-functional team of 5 using Agile methodologies and Git-flow, resulting in a 15% increase in sprint velocity.",
    },
    {
      original: "Helped with backend development.",
      improved: "Engineered RESTful APIs handling 50K+ daily requests with Node.js and MongoDB, achieving 99.9% uptime.",
    },
  ],
};
