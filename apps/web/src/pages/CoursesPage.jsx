import { Card, CardContent, List, ListItem, ListItemText, Typography } from '@mui/material';

const courses = [
  { code: 'CS101', title: 'Data Structures', batch: '2026-A' },
  { code: 'MA201', title: 'Discrete Mathematics', batch: '2026-A' }
];

function CoursesPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Course Management
        </Typography>
        <List>
          {courses.map((course) => (
            <ListItem key={course.code}>
              <ListItemText primary={`${course.code} - ${course.title}`} secondary={`Batch: ${course.batch}`} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default CoursesPage;
