import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/auth";
axios.defaults.withCredentials = true; // for sending cookies

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null }); // setter func 
        try {
            const response = await axios.post(`${API_URL}/signup`, { email, password, name });
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error.reponse.data.message || "Error in signing up",
                isLoading: false
            });
            throw error;
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/verify-email`, { code });
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false
            });
            return response.data
        } catch (error) {
            set({
                error: error.reponse.data.message || "Error in verifying email",
                isLoading: false
            });
            throw error;
        }
    }
}));
