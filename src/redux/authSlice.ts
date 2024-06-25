import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AuthState {
    uid: string | null
}

const initialState: AuthState = {
    uid: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUid: (state, action: PayloadAction<string | null>) => {
            if (action.payload) {
                state.uid = action.payload;
            }
        },
        clearUid: (state) => {
            state.uid = null
        }
    },
});

export const { setUid, clearUid } = authSlice.actions;
export default authSlice.reducer;