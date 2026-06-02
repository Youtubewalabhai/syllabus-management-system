import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, MenuItem, Select, Stack, Typography } from '@mui/material';
import api from '../services/api';

function AdminPage() {
  const [filters, setFilters] = useState({ semester: '', batch: '' });
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  async function loadReports() {
    try {
      setError('');
      const response = await api.get('/syllabi/reports/summary', { params: filters });
      setSummary(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load admin reports');
    }
  }

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadCsv = async () => {
    try {
      const response = await api.get('/syllabi/reports/summary', { params: { ...filters, export: 'csv' }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'syllabus-summary.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to export CSV');
    }
  };

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Syllabus Reports
            </Typography>
            <Select size="small" value={filters.semester} displayEmpty onChange={(event) => setFilters((prev) => ({ ...prev, semester: event.target.value }))}>
              <MenuItem value="">All Semesters</MenuItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                <MenuItem key={semester} value={semester}>
                  Semester {semester}
                </MenuItem>
              ))}
            </Select>
            <Select size="small" value={filters.batch} displayEmpty onChange={(event) => setFilters((prev) => ({ ...prev, batch: event.target.value }))}>
              <MenuItem value="">All Batches</MenuItem>
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
            </Select>
            <Button variant="outlined" onClick={loadReports}>
              Apply
            </Button>
            <Button variant="contained" onClick={downloadCsv}>
              Export CSV
            </Button>
            <Button variant="contained" color="secondary" onClick={() => window.print()}>
              Export PDF
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {summary && (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Total Syllabi</Typography>
                  <Typography variant="h4">{summary.summary.totalSyllabi}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Avg Completion</Typography>
                  <Typography variant="h4">{summary.summary.averageCompletionPercentage}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Pending Topics</Typography>
                  <Typography variant="h4">{summary.summary.pendingTopics}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Overdue / Low Progress</Typography>
                  <Typography variant="h4">
                    {summary.summary.overdueTopics} / {summary.summary.lowProgressAlerts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completion Report
              </Typography>
              <Stack spacing={1}>
                {summary.reports.completion.map((item) => (
                  <Box key={item.syllabusId} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography>
                      {item.title} ({item.courseCode})
                    </Typography>
                    <Typography color="text.secondary">
                      Completion {item.completionPercentage}% • Pending {item.pending} • Overdue {item.overdue}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}

export default AdminPage;
