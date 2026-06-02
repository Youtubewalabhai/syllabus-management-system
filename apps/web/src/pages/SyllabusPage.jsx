import { useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { AppContext } from '../context/AppContext';
import api from '../services/api';

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed'
};

const periodTypes = ['weekly', 'monthly'];

function SyllabusPage() {
  const { role } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [syllabi, setSyllabi] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ semester: '', batch: '', course: '' });
  const [createForm, setCreateForm] = useState({
    course: '',
    semester: '',
    batch: '',
    title: '',
    allocatedTeacher: '',
    topicsText: ''
  });
  const [topicUpdates, setTopicUpdates] = useState({});
  const [teacherSelection, setTeacherSelection] = useState({});

  const canManage = role === 'admin' || role === 'teacher';

  const teacherOptions = useMemo(() => teachers.map((teacher) => ({ value: teacher._id, label: teacher.name })), [teachers]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [coursesResponse, syllabiResponse] = await Promise.all([
        api.get('/courses'),
        api.get('/syllabi', { params: filters })
      ]);
      setCourses(coursesResponse.data);
      setSyllabi(syllabiResponse.data);
      if (role === 'admin') {
        const teachersResponse = await api.get('/users', { params: { role: 'teacher' } });
        setTeachers(teachersResponse.data);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load syllabus data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [role]);

  const handleCreate = async () => {
    const parsedTopics = createForm.topicsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title, expectedCompletionDate] = line.split('|').map((item) => item.trim());
        return { title, expectedCompletionDate };
      });

    if (!parsedTopics.length || parsedTopics.some((topic) => !topic.title || !topic.expectedCompletionDate)) {
      setError('Topic format should be: Topic title | YYYY-MM-DD');
      return;
    }

    try {
      await api.post('/syllabi', {
        course: createForm.course,
        semester: Number(createForm.semester),
        batch: createForm.batch,
        title: createForm.title,
        allocatedTeacher: createForm.allocatedTeacher || undefined,
        topics: parsedTopics
      });
      setCreateForm({ course: '', semester: '', batch: '', title: '', allocatedTeacher: '', topicsText: '' });
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create syllabus');
    }
  };

  const handleAllocation = async (syllabusId) => {
    try {
      await api.patch(`/syllabi/${syllabusId}/allocation`, { teacherId: teacherSelection[syllabusId] });
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to allocate teacher');
    }
  };

  const handleProgress = async (syllabusId, topicId) => {
    const values = topicUpdates[topicId] || {};
    if (!values.status || !values.periodType) {
      setError('Please select status and period type before saving');
      return;
    }
    try {
      await api.patch(`/syllabi/${syllabusId}/topics/${topicId}/progress`, values);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update topic progress');
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Syllabus Tracking</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              size="small"
              label="Semester"
              value={filters.semester}
              onChange={(event) => setFilters((prev) => ({ ...prev, semester: event.target.value }))}
            />
            <TextField size="small" label="Batch" value={filters.batch} onChange={(event) => setFilters((prev) => ({ ...prev, batch: event.target.value }))} />
            <Select
              size="small"
              value={filters.course}
              displayEmpty
              onChange={(event) => setFilters((prev) => ({ ...prev, course: event.target.value }))}
            >
              <MenuItem value="">All Courses</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.code} - {course.title}
                </MenuItem>
              ))}
            </Select>
            <Button variant="outlined" onClick={loadData} disabled={loading}>
              Apply Filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {canManage && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">New Allocation</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Select
                    fullWidth
                    size="small"
                    value={createForm.course}
                    displayEmpty
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, course: event.target.value }))}
                  >
                    <MenuItem value="">Select Course</MenuItem>
                    {courses.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {course.code} - {course.title}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Semester"
                    value={createForm.semester}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, semester: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth size="small" label="Batch" value={createForm.batch} onChange={(event) => setCreateForm((prev) => ({ ...prev, batch: event.target.value }))} />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth size="small" label="Syllabus Title" value={createForm.title} onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))} />
                </Grid>
                {role === 'admin' && (
                  <Grid size={12}>
                    <Select
                      fullWidth
                      size="small"
                      value={createForm.allocatedTeacher}
                      displayEmpty
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, allocatedTeacher: event.target.value }))}
                    >
                      <MenuItem value="">Unallocated</MenuItem>
                      {teacherOptions.map((teacher) => (
                        <MenuItem key={teacher.value} value={teacher.value}>
                          {teacher.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                )}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Topics (one per line: Topic | YYYY-MM-DD)"
                    value={createForm.topicsText}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, topicsText: event.target.value }))}
                  />
                </Grid>
              </Grid>
              <Button variant="contained" onClick={handleCreate}>
                Create Syllabus Plan
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {syllabi.map((syllabus) => (
        <Card key={syllabus._id}>
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
                <Box>
                  <Typography variant="h6">{syllabus.title}</Typography>
                  <Typography color="text.secondary">
                    {syllabus.course?.code} • Sem {syllabus.semester} • Batch {syllabus.batch || syllabus.course?.batch || '-'}
                  </Typography>
                  <Typography color="text.secondary">Teacher: {syllabus.allocatedTeacher?.name || 'Unallocated'}</Typography>
                </Box>
                <Chip color={syllabus.report?.completionPercentage >= 70 ? 'success' : 'warning'} label={`Completion ${syllabus.report?.completionPercentage || 0}%`} />
              </Stack>

              {role === 'admin' && (
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center">
                  <Select
                    size="small"
                    value={teacherSelection[syllabus._id] || ''}
                    displayEmpty
                    onChange={(event) => setTeacherSelection((prev) => ({ ...prev, [syllabus._id]: event.target.value }))}
                  >
                    <MenuItem value="">Select Teacher</MenuItem>
                    {teacherOptions.map((teacher) => (
                      <MenuItem key={teacher.value} value={teacher.value}>
                        {teacher.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <Button variant="outlined" onClick={() => handleAllocation(syllabus._id)} disabled={!teacherSelection[syllabus._id]}>
                    Allocate / Reallocate
                  </Button>
                </Stack>
              )}

              <Divider />
              <Grid container spacing={1}>
                {syllabus.topics?.map((topic) => (
                  <Grid key={topic._id} size={12}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} justifyContent="space-between">
                      <Box>
                        <Typography>{topic.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expected: {topic.expectedCompletionDate ? new Date(topic.expectedCompletionDate).toLocaleDateString() : '-'} • Status:{' '}
                          {statusLabels[topic.status]}
                        </Typography>
                      </Box>
                      {canManage && (
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                          <Select
                            size="small"
                            value={topicUpdates[topic._id]?.status || topic.status}
                            onChange={(event) =>
                              setTopicUpdates((prev) => ({
                                ...prev,
                                [topic._id]: { ...prev[topic._id], status: event.target.value }
                              }))
                            }
                          >
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <MenuItem key={value} value={value}>
                                {label}
                              </MenuItem>
                            ))}
                          </Select>
                          <Select
                            size="small"
                            value={topicUpdates[topic._id]?.periodType || ''}
                            displayEmpty
                            onChange={(event) =>
                              setTopicUpdates((prev) => ({
                                ...prev,
                                [topic._id]: { ...prev[topic._id], periodType: event.target.value }
                              }))
                            }
                          >
                            <MenuItem value="">Period</MenuItem>
                            {periodTypes.map((period) => (
                              <MenuItem key={period} value={period}>
                                {period}
                              </MenuItem>
                            ))}
                          </Select>
                          <Button variant="contained" onClick={() => handleProgress(syllabus._id, topic._id)}>
                            Save
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export default SyllabusPage;
