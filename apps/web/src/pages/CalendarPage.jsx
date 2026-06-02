import dayjs from 'dayjs';
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';

const events = [
  { title: 'Midterm Exam', date: dayjs().add(7, 'day').format('DD MMM YYYY') },
  { title: 'Assignment Deadline', date: dayjs().add(3, 'day').format('DD MMM YYYY') }
];

function CalendarPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Academic Calendar & Schedule
        </Typography>
        <Stack divider={<Divider />} spacing={1}>
          {events.map((event) => (
            <Stack key={event.title} direction="row" justifyContent="space-between">
              <Typography>{event.title}</Typography>
              <Typography color="text.secondary">{event.date}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default CalendarPage;
