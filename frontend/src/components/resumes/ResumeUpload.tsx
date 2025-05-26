import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { uploadResume } from '../../features/resume/resumeSlice';

interface ResumeUploadProps {
  onClose: () => void;
}

const ResumeUpload = ({ onClose }: ResumeUploadProps) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.resume);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const result = await dispatch(uploadResume(formData));
        if (!result.hasOwnProperty('error')) {
          onClose();
        }
      }
    },
    [dispatch, onClose]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
  });

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Upload Resume
        </Typography>

        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            mt: 2,
            mb: 2,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          {isDragActive ? (
            <Typography>Drop the resume here...</Typography>
          ) : (
            <Typography>
              Drag and drop a resume here, or click to select a file
            </Typography>
          )}
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Supported formats: PDF, DOC, DOCX
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </Box>

        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default ResumeUpload;
