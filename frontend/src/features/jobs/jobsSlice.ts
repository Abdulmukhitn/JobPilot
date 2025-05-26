import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  salary_range: string;
  match_score?: number;
  created_at: string;
}

interface JobsState {
  jobs: Job[];
  filteredJobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  filteredJobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/jobs/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const matchJobsWithResume = createAsyncThunk(
  'jobs/matchWithResume',
  async (resumeId: number, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/jobs/match/${resumeId}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },
    filterJobs: (state, action) => {
      const { query } = action.payload;
      state.filteredJobs = state.jobs.filter(job => 
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.description.toLowerCase().includes(query.toLowerCase())
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
        state.filteredJobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(matchJobsWithResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(matchJobsWithResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
        state.filteredJobs = action.payload;
      })
      .addCase(matchJobsWithResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedJob, filterJobs } = jobsSlice.actions;
export default jobsSlice.reducer;
