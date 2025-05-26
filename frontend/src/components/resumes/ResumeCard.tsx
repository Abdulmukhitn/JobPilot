import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import EditIcon from '@mui/icons-material/Edit';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';

interface ResumeCardProps {
  resume: {
    id: number;
    title: string;
    parsed_content: {
      skills: string[];
      experience: any[];
      education: any[];
    };
    created_at: string;
  };
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onDownload: (id: number) => void;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onDelete,
  onEdit,
  onDownload,
  isSelected,
  onSelect,
}) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: isSelected ? 2 : 0,
        borderColor: 'primary.main',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {resume.title}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Uploaded on {new Date(resume.created_at).toLocaleDateString()}
          </Typography>
        </Box>

        {resume.parsed_content.experience?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle2">Experience</Typography>
            </Box>
            {resume.parsed_content.experience.slice(0, 2).map((exp, index) => (
              <Typography key={index} variant="body2" color="text.secondary">
                {exp.title} at {exp.company}
              </Typography>
            ))}
          </Box>
        )}

        {resume.parsed_content.education?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle2">Education</Typography>
            </Box>
            {resume.parsed_content.education.slice(0, 1).map((edu, index) => (
              <Typography key={index} variant="body2" color="text.secondary">
                {edu.degree} - {edu.institution}
              </Typography>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {resume.parsed_content.skills.slice(0, 5).map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              variant="outlined"
            />
          ))}
          {resume.parsed_content.skills.length > 5 && (
            <Chip
              label={`+${resume.parsed_content.skills.length - 5} more`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => onEdit(resume.id)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton onClick={() => onDownload(resume.id)} size="small">
              <CloudDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => onDelete(resume.id)} size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Button
          variant={isSelected ? "contained" : "outlined"}
          size="small"
          onClick={() => onSelect(resume.id)}
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ResumeCard;
