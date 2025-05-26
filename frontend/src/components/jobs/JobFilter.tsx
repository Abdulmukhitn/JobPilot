import React from 'react';
import {
  Paper,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  SelectChangeEvent,
} from '@mui/material';

interface JobFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  minMatchScore: number;
  onMatchScoreChange: (value: number) => void;
}

const JobFilter: React.FC<JobFilterProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  minMatchScore,
  onMatchScoreChange,
}) => {
  const handleSortChange = (event: SelectChangeEvent) => {
    onSortChange(event.target.value);
  };

  const handleMatchScoreChange = (_event: Event, value: number | number[]) => {
    onMatchScoreChange(value as number);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Search Jobs"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, company, or keywords..."
        />

        <FormControl fullWidth>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={handleSortChange}>
            <MenuItem value="relevance">Most Relevant</MenuItem>
            <MenuItem value="match_score">Match Score</MenuItem>
            <MenuItem value="recent">Most Recent</MenuItem>
            <MenuItem value="salary_high">Salary (High to Low)</MenuItem>
            <MenuItem value="salary_low">Salary (Low to High)</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography gutterBottom>Minimum Match Score</Typography>
          <Slider
            value={minMatchScore}
            onChange={handleMatchScoreChange}
            valueLabelDisplay="auto"
            step={10}
            marks
            min={0}
            max={100}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default JobFilter;
