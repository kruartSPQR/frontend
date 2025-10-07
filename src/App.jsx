import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import PrivateRoute from "./PrivateRoute";
import ProtectedLayout from "./ProtectedLayout.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import OrderForm from "./pages/OrderForm";

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <ProtectedLayout>
                                        <Dashboard />
                                    </ProtectedLayout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/orders"
                            element={
                                <PrivateRoute>
                                    <ProtectedLayout>
                                        <Orders />
                                    </ProtectedLayout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/orders/new"
                            element={
                                <PrivateRoute>
                                    <ProtectedLayout>
                                        <OrderForm />
                                    </ProtectedLayout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/orders/edit/:id"
                            element={
                                <PrivateRoute>
                                    <ProtectedLayout>
                                        <OrderForm />
                                    </ProtectedLayout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/payments"
                            element={
                                <PrivateRoute>
                                    <ProtectedLayout>
                                        <Payments />
                                    </ProtectedLayout>
                                </PrivateRoute>
                            }
                        />

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}