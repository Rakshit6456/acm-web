import type { AchievementDoc, EventDoc, MemberDoc, ResourceDoc, SettingsDoc } from "./types"

const ev = (f: string[]) => f.map((x) => `/images/events/${x}`)

export const seedEvents: EventDoc[] = [
  {
    id: "joining-interview-2025", title: "ACM Joining Interview 2025", status: "upcoming", date: "29 September 2025", sortDate: "2025-09-29", time: "1:30 – 3:00 PM",
    type: "Recruitment", venue: "IILM University", speaker: "",
    summary: "Open interviews for students who want to contribute to the chapter. Candidates are assessed on technical knowledge, problem-solving and teamwork.",
    attendees: 0, highlights: [], image: "/images/events/ai.jpg", gallery: [],
  },
  {
    id: "killzone", title: "KILLZONE: GameDev & Gaming Arena", status: "past", date: "16 September 2025", sortDate: "2025-09-16", type: "Competition",
    venue: "Auditorium, IILM University", speaker: "Avnish Gupta & Manvendra Singh Deora",
    summary: "A day that brought gamers and developers together for competitive tournaments and creative game-development showcases.",
    attendees: 67, highlights: ["Game development", "App design", "Competitive gaming"], image: "/images/events/killzone.jpg",
    gallery: ev(["kill1.jpg", "kill2.jpg", "kill3.jpg", "kill-win.jpg"]),
  },
  {
    id: "cybersecurity", title: "Cyber Security in Different Ages", status: "past", date: "19 February 2025", sortDate: "2025-02-19", type: "Seminar",
    venue: "Room 93, IILM University", speaker: "Maj. Vineet Kumar",
    summary: "A seminar on cybersecurity best practices, ethical hacking and digital privacy, with a live demonstration.",
    attendees: 76, highlights: ["Live hacking demonstration", "Security tools overview", "Career guidance"], image: "/images/events/cyber.jpg",
    gallery: ev(["cyber.jpg", "cyber1.jpg", "cyber2.jpg", "cyber3.jpg", "cyber4.jpg"]),
  },
  {
    id: "robotify", title: "Robotify: Build, Code, Innovate", status: "past", date: "6 February 2025", sortDate: "2025-02-06", type: "Workshop & Contest",
    venue: "Room 94, IILM University", speaker: "Siddharth Bhatter",
    summary: "A robotics challenge where students designed and programmed autonomous robots to solve real-world tasks.",
    attendees: 71, highlights: ["Hands-on robotics", "AI & robotics intelligence", "Automation careers"], image: "/images/events/robo.jpg",
    gallery: ev(["robo-2.jpg", "robo1.jpg", "robo-1.jpg", "robo-4.jpeg"]),
  },
]

const m = (id: string, name: string, role: string, group: MemberDoc["group"], order: number, skills: string[], extra: Partial<MemberDoc> = {}): MemberDoc =>
  ({ id, name, role, group, order, skills, image: `/images/team/${id}.jpg`, ...extra })

export const seedMembers: MemberDoc[] = [
  m("shamik", "Dr. Shamik Tiwari", "Head of Department", "faculty", 1, ["Artificial Intelligence", "Data Science"], { dept: "Computer Science & Engineering", email: "shamik.tiwari@iilm.edu" }),
  m("preeti", "Dr. Preeti Mehta", "Faculty Mentor", "faculty", 2, ["Software Engineering", "Web Development", "Databases"], { dept: "Computer Science & Engineering", email: "preeti.mehta@iilm.edu" }),
  m("tanvi", "Tanvi Rao", "Chapter Chair", "officer", 1, ["Robotics", "Leadership"], { linkedin: "https://www.linkedin.com/in/tanvi-rao-0831b52b3/" }),
  m("mehar", "Mehar Bhargava", "Vice Chair", "officer", 2, ["UI/UX Design", "Event Management"], { linkedin: "https://www.linkedin.com/in/mehar-bhargava-76900632a/" }),
  m("tanushi", "Tanushi Bedi", "General Secretary", "officer", 3, ["Event Planning", "Public Relations"], { linkedin: "https://www.linkedin.com/in/tanushi-bedi-231226317/" }),
  m("gautam", "Gautam Budhiraja", "Vice Secretary", "officer", 4, ["Event Planning", "Content"], { linkedin: "https://www.linkedin.com/in/gautam-budhiraja-b099a7363/" }),
  m("arvind", "Arvind Khanna", "Treasurer", "officer", 5, ["Finance", "Operations"], { linkedin: "https://www.linkedin.com/in/arvind-khanna-8842a7232/" }),
  m("pulkit", "Pulkit Sharma", "Webmaster", "lead", 1, ["Full Stack", "DevOps"], { linkedin: "https://www.linkedin.com/in/pulkit-sharma-91826231b/" }),
  m("ryan", "Ryan Joshi", "Technical Lead", "lead", 2, ["Frontend", "AI"]),
  m("harsh", "Harsh Doyal", "Logistics Head", "lead", 3, ["Operations", "Event Management"]),
  m("pranav", "Pranav Rattan", "Design & Media Head", "lead", 4, ["Graphic Design", "Frontend"], { linkedin: "https://www.linkedin.com/in/pranav-rattan-11aa93323/" }),
  m("varnyaa", "Varnya Sharma", "Social Media Head", "lead", 5, ["UI/UX", "Social Media"], { linkedin: "https://www.linkedin.com/in/varnyaa-sharma-441461343/" }),
  { id: "jahanvi", name: "K. Jahanvi", role: "Social Media", group: "volunteer", order: 1, skills: [], image: "" },
  { id: "daksh", name: "Daksh Kataria", role: "Logistics", group: "volunteer", order: 2, skills: [], image: "" },
  { id: "payal", name: "Payal Yadav", role: "Logistics", group: "volunteer", order: 3, skills: [], image: "" },
  { id: "kriti", name: "Kriti", role: "Team Secretary", group: "volunteer", order: 4, skills: [], image: "" },
]

export const seedAchievements: AchievementDoc[] = [
  { id: "robotify-winners", title: "Robotify Winners", note: "Team Pulkit won the Robotify contest.", image: "/images/events/robo2.jpeg", order: 1 },
  { id: "killzone-champions", title: "KILLZONE Champions", note: "Team Chole Bhature won the KILLZONE tournament.", image: "/images/events/kill-win.jpg", order: 2 },
  { id: "killzone-runners-up", title: "KILLZONE Runners-up", note: "Team FireBolts finished second.", image: "/images/events/kill-run.jpg", order: 3 },
]

export const seedSettings: SettingsDoc = {
  email: "acm.studentchapter@iilm.edu",
  address: ["IILM University", "Sector 53, Golf Course Road", "Gurugram, Haryana 122003", "India"],
  mapUrl: "https://www.google.com/maps/place/IILM+University,+Gurugram/@28.4335512,77.1035548,16z",
}

const r = (order: number, category: string, title: string, url: string, description: string): ResourceDoc =>
  ({ id: `${category}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, ""), order, category, title, url, description })

export const seedResources: ResourceDoc[] = [
  r(1, "ACM", "ACM Digital Library", "https://dl.acm.org", "The world's largest collection of computing research. Included with ACM student membership."),
  r(2, "ACM", "ACM Learning Center", "https://learning.acm.org", "Online courses, books, and videos for members across programming, AI, security and more."),
  r(3, "ACM", "ACM Student Membership", "https://www.acm.org/membership", "Join ACM to unlock the library, learning resources, scholarships and discounts."),
  r(4, "ACM", "ACM Code of Ethics", "https://www.acm.org/code-of-ethics", "The professional standards that guide computing practitioners."),
  r(5, "Learn to code", "CS50: Introduction to Computer Science", "https://cs50.harvard.edu/x", "Harvard's free introductory course, a strong foundation for any beginner."),
  r(6, "Learn to code", "MIT OpenCourseWare", "https://ocw.mit.edu/search/?d=Electrical%20Engineering%20and%20Computer%20Science", "Free lecture notes and videos from MIT's computer science courses."),
  r(7, "Learn to code", "roadmap.sh", "https://roadmap.sh", "Step-by-step learning paths for frontend, backend, DevOps, AI and more."),
  r(8, "Learn to code", "freeCodeCamp", "https://www.freecodecamp.org", "Free, project-based curriculum for web development and data skills."),
  r(9, "Learn to code", "The Odin Project", "https://www.theodinproject.com", "A free full-stack web development curriculum built around projects."),
  r(10, "Practice", "LeetCode", "https://leetcode.com", "Practise data structures and algorithms for coding interviews."),
  r(11, "Practice", "Codeforces", "https://codeforces.com", "Regular competitive programming contests and a large problem archive."),
  r(12, "Practice", "Kaggle Learn", "https://www.kaggle.com/learn", "Short hands-on lessons in Python, machine learning and data analysis."),
  r(13, "Career & open source", "GitHub Student Developer Pack", "https://education.github.com/pack", "Free developer tools and credits for verified students."),
  r(14, "Career & open source", "Google Summer of Code", "https://summerofcode.withgoogle.com", "Contribute to open source projects over the summer, with a stipend."),
  r(15, "Career & open source", "Major League Hacking", "https://mlh.io", "Find student hackathons and build projects with a global community."),
]
