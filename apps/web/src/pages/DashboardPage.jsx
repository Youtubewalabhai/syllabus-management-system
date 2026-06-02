import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';

const metricsByRole = {
  student: [
    { label: 'Registered Courses', value: 6 },
    { label: 'Pending Assignments', value: 4 },
    { label: 'Current GPA', value: '8.7' }
  ],
  teacher: [
    { label: 'Active Courses', value: 5 },
    { label: 'Assignments to Review', value: 14 },
    { label: 'Upcoming Deadlines', value: 3 }
  ],
  admin: [
    { label: 'Total Users', value: 1200 },
    { label: 'Total Courses', value: 90 },
    { label: 'System Alerts', value: 2 }
  ]
};

function DashboardPage({ role }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Overview</Typography>
      <Grid container spacing={2}>
        {metricsByRole[role].map((card) => (
          <Grid key={card.label} size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{card.label}</Typography>
                <Typography variant="h4">{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default DashboardPage;
