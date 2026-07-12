import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchIssues = createAsyncThunk('issues/fetchAll', async (filters = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/issues?${params}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
  }
});

export const assignIssue = createAsyncThunk('issues/assign', async ({ id, technicianId }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/issues/${id}/assign`, { technicianId });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to assign issue');
  }
});

export const updateIssueStatus = createAsyncThunk('issues/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/issues/${id}/status`, { status });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update status');
  }
});

const issueSlice = createSlice({
  name: 'issues',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(assignIssue.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export default issueSlice.reducer;
