// src/AuthContext.jsx
import { createContext } from "react";

export const AuthContext = createContext({
    user: null,
    userId: null,
    isLoggedIn: false,
    isLoading: true,
    login: () => {},
    register: () => {},
    logout: () => {}
});