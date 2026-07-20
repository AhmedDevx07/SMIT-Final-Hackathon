import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchAssets = createAsyncThunk('assets/fetchAll', async (filters = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/assets?${params}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch assets');
  }
});

export const createAsset = createAsyncThunk('assets/create', async (assetData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/assets', assetData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create asset');
  }
});

export const deleteAsset = createAsyncThunk('assets/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/assets/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete asset');
  }
});

export const updateAsset = createAsyncThunk('assets/update', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/assets/${id}`, updates);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update asset');
  }
});

const assetSlice = createSlice({
  name: 'assets',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        const index = state.items.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a._id !== action.payload);
      });
  },
});

export default assetSlice.reducer;