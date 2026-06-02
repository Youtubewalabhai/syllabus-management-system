import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RoleSelector from './RoleSelector';

function TopBar({ role, onRoleChange, onThemeToggle }) {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Syllabus Management Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <RoleSelector role={role} onChange={onRoleChange} />
          <IconButton color="inherit" aria-label="notifications">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" aria-label="toggle theme" onClick={onThemeToggle}>
            <Brightness4Icon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
