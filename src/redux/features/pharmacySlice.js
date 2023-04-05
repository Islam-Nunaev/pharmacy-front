import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  pharmacy: {},
  pharmacies: [],
  token: window.localStorage.getItem("token") || null,
  isLoading: false,
  status: null,
}

export const authExit = createAsyncThunk("auth/exit", async (_, thunkAPI) => {
  localStorage.removeItem("token");
});

export const registratePharmacy = createAsyncThunk(
  "auth/registrate",
  async ({ data }, thunkAPI) => {
    const response = await fetch("http://localhost:4141/registrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pharmacyName: data.get('pharmacyName'),
        password: data.get('password'),
        logo: data.get('logo'),
        address: data.get('address'),
        license: data.get('license'),
        ogrn: data.get('ogrn'),
        inn: data.get('inn'),
      }),
    });
    const res = await response.json();
      if (res.token) {
      window.localStorage.setItem('token', res.token)
    }
    return res;
  }
);

export const loginPharmacy = createAsyncThunk("auth/login", async ({ pharmacyName, password }) => {
  const response = await fetch("http://localhost:4141/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pharmacyName, password }),
  });
  const data = await response.json();
  if (data.token) {
    window.localStorage.setItem("token", data.token);
  }
  return data;
});

export const getPharmacies = createAsyncThunk("get/Pharmacies", async () => {
  const response = await fetch("http://localhost:4141/pharmacy");
  return await response.json();
});

export const getPharmacy = createAsyncThunk("get/pharmacy", async () => {
  const response = await fetch(`http://localhost:4141/me`);
  return await response.json();
});

export const deletePharmacyByName = createAsyncThunk("delete/pharmacy", async (name) => {
  await fetch(`http://localhost:4141/${name}`, { method: "DELETE" });
  return name;
});

const pharmacySlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(authExit.pending, (state, action) => {
        state.isLoading = true;
        state.status = null;
        state.status = action.payload.message;
      })
      .addCase(authExit.fulfilled, (state, action) => {
        state.token = null;
        state.pharmacy = null;
        state.isLoading = false;
        state.status = action.payload.message;

      })
      .addCase(registratePharmacy.pending, (state) => {
        state.isLoading = true;
        state.status = null;
      })
      .addCase(registratePharmacy.fulfilled, (state, action) => {
        state.pharmacy = action.payload.pharmacy;
        state.token = action.payload.token;
        state.isLoading = false;
        state.status = action.payload.message;
      })
      .addCase(registratePharmacy.rejected, (state, action) => {
        state.isLoading = false;
        state.status = action.payload.message;
      })
      .addCase(loginPharmacy.pending, (state) => {
        state.isLoading = true;
        state.status = null;
      })
      .addCase(loginPharmacy.fulfilled, (state, action) => {
        state.pharmacy = action.payload.pharmacy;
        state.token = action.payload.token;
        state.isLoading = false;
        state.status = action.payload.message;
      })
      .addCase(loginPharmacy.rejected, (state, action) => {
        state.isLoading = false;
        state.status = action.error.message;
      })
      .addCase(getPharmacies.fulfilled, (state, action) => {
        state.pharmacies = action.payload;
      })
      .addCase(getPharmacy.fulfilled, (state, action) => {
        state.pharmacy = action.payload.pharmacy;
      })
      .addCase(deletePharmacyByName.fulfilled, (state, action) => {
        state.pharmacies = state.pharmacies.filter((pharmacy) => pharmacy.pharmacyName !== action.payload);
        state.status = action.error.message;
      })
      
  },
});

export const checkIsAuth = (state) => Boolean(state.pharmacy.token)
export const { logout } = pharmacySlice.actions;
export default pharmacySlice.reducer;
