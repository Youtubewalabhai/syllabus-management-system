import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

function RoleSelector({ role, onChange }) {
  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel id="role-label">Role</InputLabel>
      <Select labelId="role-label" value={role} label="Role" onChange={(e) => onChange(e.target.value)}>
        <MenuItem value="student">Student</MenuItem>
        <MenuItem value="teacher">Teacher</MenuItem>
        <MenuItem value="admin">Admin</MenuItem>
      </Select>
    </FormControl>
  );
}

export default RoleSelector;
