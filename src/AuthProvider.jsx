// src/AuthProvider.jsx
import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import api from "./api";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedUser = localStorage.getItem("user");
            const storedUserId = localStorage.getItem("userId");
            const accessToken = localStorage.getItem("accessToken");

            if (storedUser && accessToken) {
                setUser(storedUser);
                setUserId(storedUserId);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.clear();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await api.post("/auth/signin", { email, password });
            const { accessToken, refreshToken, userId } = res.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("user", email);
            localStorage.setItem("userId", userId);
            setUser(email);
            setUserId(userId);
            return res.data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const register = async (email, password) => {
        await api.post("/auth/signup", { email, password });
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setUserId(null);
    };

    const isLoggedIn = !!user;

    return (
        <AuthContext.Provider value={{
            user,
            userId,
            isLoggedIn,
            isLoading, // Добавляем в контекст
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}