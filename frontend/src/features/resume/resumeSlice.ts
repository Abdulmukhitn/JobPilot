import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Resume {
  id: number;
  title: string;
  content: string;
  parsed_content: {
    skills: string[];
    experience: any[];
    education: any[];
  };
  created_at: string;
  updated_at: string;
}

interface ResumeState {
  resumes: Resume[];
  selectedResume: Resume | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ResumeState = {
  resumes: [],
  selectedResume: null,
  isLoading: false,
  error: null,
};

export const fetchResumes = createAsyncThunk(
  'resume/fetchResumes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/resumes/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const uploadResume = createAsyncThunk(
  'resume/uploadResume',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/resumes/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteResume = createAsyncThunk(
  'resume/deleteResume',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/resumes/${id}/`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setSelectedResume: (state, action) => {
      state.selectedResume = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResumes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResumes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resumes = action.payload;
      })
      .addCase(fetchResumes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resumes.push(action.payload);
        state.selectedResume = action.payload;
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resumes = state.resumes.filter((resume) => resume.id !== action.payload);
      })
      .addCase(deleteResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedResume } = resumeSlice.actions;
export default resumeSlice.reducer;
