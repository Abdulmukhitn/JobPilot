import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ResumeUpload from '../../components/resumes/ResumeUpload';
import ResumeCard from '../../components/resumes/ResumeCard';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchResumes,
  setSelectedResume,
  deleteResume,
  type Resume,
} from '../../features/resume/resumeSlice';

const ResumeList = () => {
  const dispatch = useAppDispatch();
  const { resumes, selectedResume, isLoading, error } = useAppSelector(
    (state) => state.resume
  );
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    dispatch(fetchResumes());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    dispatch(deleteResume(id));
  };

  const handleSelect = (resume: Resume) => {
    dispatch(setSelectedResume(resume));
  };

  const handleEdit = (id: number) => {
    // TODO: Implement resume editing
    console.log('Edit resume:', id);
  };

  const handleDownload = (id: number) => {
    // TODO: Implement resume download
    console.log('Download resume:', id);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Resumes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowUpload(true)}
        >
          Upload Resume
        </Button>
      </Box>

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
      ) : resumes.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              isSelected={selectedResume?.id === resume.id}
              onSelect={() => handleSelect(resume)}
              onDelete={() => handleDelete(resume.id)}
              onEdit={() => handleEdit(resume.id)}
              onDownload={() => handleDownload(resume.id)}
            />
          ))}
        </Box>
      ) : (
        <Alert severity="info">No resumes found. Upload your first resume!</Alert>
      )}

      {showUpload && <ResumeUpload onClose={() => setShowUpload(false)} />}
    </Container>
  );
};

export default ResumeList;
