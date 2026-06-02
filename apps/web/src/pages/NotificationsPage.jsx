import { Card, CardContent, List, ListItem, ListItemText, Typography } from '@mui/material';

const notices = [
  { title: 'Syllabus updated for CS101', channel: 'In-app' },
  { title: 'Assignment deadline reminder', channel: 'Email/SMS' }
];

function NotificationsPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notification Center
        </Typography>
        <List>
          {notices.map((notice) => (
            <ListItem key={notice.title}>
              <ListItemText primary={notice.title} secondary={notice.channel} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default NotificationsPage;
