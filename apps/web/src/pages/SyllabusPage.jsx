import { Button, Card, CardContent, Stack, Typography } from '@mui/material';

function SyllabusPage() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Syllabus Management</Typography>
          <Typography color="text.secondary">
            Upload PDF syllabi, maintain version history, and search by course or semester.
          </Typography>
          <Button variant="contained">Upload PDF Syllabus</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default SyllabusPage;
