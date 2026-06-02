import { Card, CardContent, Stack, Typography } from '@mui/material';

function GradesPage() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6">Grade Management</Typography>
          <Typography>Current GPA: 8.7</Typography>
          <Typography color="text.secondary">Generate reports, review transcripts, and monitor student progress.</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default GradesPage;
