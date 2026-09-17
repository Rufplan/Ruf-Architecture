// Work history. Project files in src/content/projects reference these by key.
export interface Role {
  key: string;
  firm: string;
  role: string;
  location: string;
  dates: string;
  /** First-person description of the role. Leave empty if not public. */
  description?: string;
}

export const experience: Role[] = [
  {
    key: 'arg',
    firm: 'Architectural Resources Group',
    role: 'Senior Designer',
    location: 'San Francisco, CA',
    dates: 'Jan 2025 – Present',
  },
  {
    key: 'huntsman',
    firm: 'Huntsman Architectural Group',
    role: 'Job Captain',
    location: 'San Francisco, CA',
    dates: 'Jan 2021 – Jan 2023',
  },
  {
    key: 'vinoly',
    firm: 'Rafael Viñoly Architects',
    role: 'Team Leader',
    location: 'San Francisco, CA',
    dates: 'Mar 2019 – Oct 2021',
    description:
      "At Rafael Viñoly Architects, I served as team leader for the commercial buildings on The Hills at Vallco, later renamed The Rise, the redevelopment of Cupertino's Vallco Shopping Mall into a mixed-use district of offices, retail, and housing beneath a 30-acre rooftop park. Working from the project's on-site office, I carried the office buildings from schematic design through construction documents, managing their Revit models, coordinating with structural and MEP consultants, and keeping the commercial package aligned with the residential and retail teams.",
  },
  {
    key: 'heller-manus',
    firm: 'Heller Manus',
    role: 'Designer',
    location: 'San Francisco, CA',
    dates: 'Jul 2018 – Feb 2019',
    description:
      'At Heller Manus, a San Francisco firm known for its high-rise, mixed-use, and corporate work, I was dedicated to a single project: the Fortinet Corporate Campus in Sunnyvale, a multi-building headquarters for the cybersecurity company. It was my first large-scale commercial project in Revit, and I focused on documentation, building out and coordinating the model through design development and construction documents, including floor plans, sections, enlarged plans, and details. Carrying one project from start to finish established the Revit workflows I have used on every project since.',
  },
  {
    key: 'ward-young',
    firm: 'Ward-Young Architecture',
    role: 'Designer',
    location: 'Truckee, CA',
    dates: 'Oct 2016 – Jul 2018',
  },
  {
    key: 'arthur-page',
    firm: 'Arthur Page Company',
    role: 'Designer',
    location: 'Santa Monica, CA',
    dates: 'Jul 2015 – Oct 2016',
    description:
      'As a Project Designer at Arthur Page Company, I managed commercial tenant improvement and design-build projects from design development through construction. My role combined project management with hands-on technical design, including developing construction documents, detailing architectural assemblies, coordinating with consultants and contractors, managing schedules and deliverables, and overseeing construction administration. I worked closely with clients and project teams to resolve technical and field conditions while maintaining design intent, constructability, and project requirements.',
  },
  {
    key: 'studio-pch',
    firm: 'Studio PCH',
    role: 'Drafter',
    location: 'Malibu, CA',
    dates: 'Mar 2015 – Jul 2015',
    description:
      'As a Drafter at Studio PCH, I supported the architectural team in the development and documentation of high-end hospitality and residential projects. My responsibilities included producing architectural drawings and construction documents, developing plans, elevations, sections, and details, coordinating design information with project teams and consultants, and assisting with construction administration. I contributed to projects from design development through construction, including Nobu Ryokan Malibu.',
  },
  {
    key: 'rsp',
    firm: 'RSP Architects',
    role: 'Concept Designer / Renderer',
    location: 'Minneapolis, MN',
    dates: 'May 2012 – Jan 2015',
    description:
      "At RSP Architects, I worked as a concept designer and renderer across the firm's commercial, healthcare, and international portfolio. Embedded in early-phase design, I developed massing studies and schematic options with project teams, then translated them into the renderings and presentation graphics used to win and advance work. My projects included the Olympus Surgical Innovation Center in Brooklyn Park, the Mayo Clinic Square repositioning in downtown Minneapolis, and the Vestfield Plaza waterfront development in Johor Bahru, Malaysia. The role built my fluency in moving quickly from concept to compelling image, and in parametric modeling as a design tool.",
  },
  {
    key: 'borel',
    firm: 'Frédéric Borel Architecte',
    role: 'Intern',
    location: 'Paris, France',
    dates: 'Aug 2009 – Dec 2009',
    description:
      'During the fall semester of my final year at the University of Kansas, I had the great opportunity to travel to Paris, France and work as an intern for Frédéric Borel Architecte. The internship program was set up through Professor Wojciech Lesnikowski, who maintains close relationships with many of the top architecture firms in Paris. Frédéric Borel runs a small boutique firm with only three full-time employees working directly under him, providing me with the opportunity to work closely with the team and gain firsthand experience within the practice.',
  },
];

export const roleByKey = (key: string) => {
  const r = experience.find((e) => e.key === key);
  if (!r) throw new Error(`Unknown experience key "${key}" — add it to src/data/experience.ts`);
  return r;
};

export const expertise = ['3D Modeling (Revit)', 'Schematic Design', 'Permit Drawings'];

export const software = [
  { name: 'Revit', level: 'Expert' },
  { name: 'AutoCAD', level: 'Advanced' },
  { name: 'SketchUp', level: 'Advanced' },
  { name: 'V-Ray', level: 'Proficient' },
  { name: 'Rhino', level: 'Beginner' },
];

export const languages = ['English', 'Spanish', 'French'];
