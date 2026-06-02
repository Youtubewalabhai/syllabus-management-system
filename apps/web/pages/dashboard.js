const widgets = [
  'Attendance Overview',
  'Academic Performance',
  'Recent Notices',
  'Upcoming Exams',
  'Tasks and Deadlines',
  'Saved Resources',
  'AI Assistant Access',
  'Placement Status',
  'Internship Tracking',
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Student Dashboard</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <article key={widget} className="rounded-xl bg-white p-4 shadow dark:bg-slate-900 dark:text-slate-100">
              <h2 className="font-medium">{widget}</h2>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
