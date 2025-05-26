import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import JobCard from '../../components/jobs/JobCard';
import JobFilter from '../../components/jobs/JobFilter';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchJobs, matchJobsWithResume, type Job } from '../../features/jobs/jobsSlice';
import RefreshIcon from '@mui/icons-material/Refresh';

const JobList = () => {
  const dispatch = useAppDispatch();
  const { filteredJobs, isLoading, error } = useAppSelector((state) => state.jobs);
  const { selectedResume } = useAppSelector((state) => state.resume);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [minMatchScore, setMinMatchScore] = useState(0);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleRefreshJobs = () => {
    dispatch(fetchJobs());
  };

  const handleApplyToJob = (jobId: number) => {
    // TODO: Implement job application logic
    console.log('Applying to job:', jobId);
  };

  const handleMatchWithResume = () => {
    if (selectedResume) {
      dispatch(matchJobsWithResume(selectedResume.id));
    }
  };

  const filteredAndSortedJobs = filteredJobs
    .filter((job: Job) => {
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScore = !job.match_score || job.match_score >= minMatchScore;
      return matchesSearch && matchesScore;
    })
    .sort((a: Job, b: Job) => {
      switch (sortBy) {
        case 'match_score':
          return (b.match_score || 0) - (a.match_score || 0);
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'salary_high':
          return (
            parseFloat(b.salary_range.split('-')[1]) -
            parseFloat(a.salary_range.split('-')[1])
          );
        case 'salary_low':
          return (
            parseFloat(a.salary_range.split('-')[0]) -
            parseFloat(b.salary_range.split('-')[0])
          );
        default:
          return 0;
      }
    });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Job Listings
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshJobs}
          >
            Refresh Jobs
          </Button>
          {selectedResume && (
            <Button
              variant="contained"
              onClick={handleMatchWithResume}
              disabled={isLoading}
            >
              Match with Resume
            </Button>
          )}
        </Box>
      </Box>

      <Box component="div" sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '250px 1fr' } }}>
        <Box>
          <JobFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            minMatchScore={minMatchScore}
            onMatchScoreChange={setMinMatchScore}
          />
        </Box>

        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredAndSortedJobs.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              }}
            >
              {filteredAndSortedJobs.map((job: Job) => (
                <JobCard key={job.id} job={job} onApply={handleApplyToJob} />
              ))}
            </Box>
          ) : (
            <Alert severity="info">No jobs found matching your criteria.</Alert>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default JobList;
