import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';

const assignments = [
  { title: 'Operating System Case Study', status: 'Pending' },
  { title: 'React Dashboard Project', status: 'Submitted' }
];

function AssignmentsPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Assignment Tracking
        </Typography>
        <Stack spacing={2}>
          {assignments.map((assignment) => (
            <Stack key={assignment.title} direction="row" justifyContent="space-between">
              <Typography>{assignment.title}</Typography>
              <Chip label={assignment.status} color={assignment.status === 'Pending' ? 'warning' : 'success'} size="small" />
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default AssignmentsPage;
