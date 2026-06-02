import { Card, CardContent, Grid, Typography } from '@mui/material';

const reports = [
  'System statistics dashboard',
  'User and role management controls',
  'Course and syllabus analytics',
  'Export reports (PDF/Excel) hooks'
];

function AdminPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Admin Dashboard
        </Typography>
        <Grid container spacing={1}>
          {reports.map((item) => (
            <Grid key={item} size={12}>
              <Typography color="text.secondary">• {item}</Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default AdminPage;
