import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SectionCard from '../components/SectionCard';
import { toggleTheme } from '../store';

const sections = [
  { title: 'Hero', items: ['Single platform for academics, AI, placements, and community'] },
  { title: 'University Updates', items: ['BEU Notices', 'College Notices', 'Exam Alerts'] },
  { title: 'Academic Resources', items: ['Syllabus', 'Notes', 'Question Papers', 'Lab Manuals'] },
  { title: 'Student Success', items: ['Placement Updates', 'Career Guidance', 'Alumni Mentorship'] },
  { title: 'Productivity', items: ['Attendance Tracking', 'Timetable', 'CGPA/GPA Calculators'] },
  { title: 'Community', items: ['Discussion Forums', 'Branch Groups', 'Events & Hackathons'] },
];

export default function Home() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900 transition dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 p-8 text-white">
          <p className="text-sm uppercase tracking-wide">StudentOS</p>
          <h1 className="mt-2 text-3xl font-bold">Complete Student Ecosystem Platform</h1>
          <p className="mt-3 max-w-3xl text-sm text-blue-100">
            One platform for academic resources, notices, AI assistant, attendance, placements, career development,
            and student community.
          </p>
          <button
            onClick={() => dispatch(toggleTheme())}
            className="mt-4 rounded-md bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30"
          >
            Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <SectionCard key={section.title} title={section.title} items={section.items} />
          ))}
        </section>
      </div>
    </main>
  );
}
