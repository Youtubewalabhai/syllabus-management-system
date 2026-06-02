import { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, Container, Stack, Tab, Tabs } from '@mui/material';
import { AppContext } from './context/AppContext';
import TopBar from './components/TopBar';
import DashboardPage from './pages/DashboardPage';
import SyllabusPage from './pages/SyllabusPage';
import CoursesPage from './pages/CoursesPage';
import CalendarPage from './pages/CalendarPage';
import AssignmentsPage from './pages/AssignmentsPage';
import GradesPage from './pages/GradesPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';

const tabs = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Syllabi', path: '/syllabi' },
  { label: 'Courses', path: '/courses' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Assignments', path: '/assignments' },
  { label: 'Grades', path: '/grades' },
  { label: 'Notifications', path: '/notifications' },
  { label: 'Admin', path: '/admin', role: 'admin' }
];

function App() {
  const { role, setRole, toggleTheme } = useContext(AppContext);

  return (
    <Stack sx={{ minHeight: '100vh' }}>
      <TopBar role={role} onRoleChange={setRole} onThemeToggle={toggleTheme} />
      <Container sx={{ py: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, overflowX: 'auto' }}>
          <Tabs value={false} variant="scrollable" scrollButtons="auto">
            {tabs
              .filter((tab) => !tab.role || tab.role === role)
              .map((tab) => (
                <Tab key={tab.path} label={tab.label} component="a" href={tab.path} />
              ))}
          </Tabs>
        </Box>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage role={role} />} />
          <Route path="/syllabi" element={<SyllabusPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin" element={role === 'admin' ? <AdminPage /> : <Navigate to="/dashboard" replace />} />
        </Routes>
      </Container>
    </Stack>
  );
}

export default App;
