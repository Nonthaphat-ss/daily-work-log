// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ดักจับสถานะ Login / Logout อัตโนมัติจาก Firebase
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe; // Cleanup listener
    }, []);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// Hook สำหรับดึงไปใช้ในหน้าอื่นๆ
export const useAuth = () => useContext(AuthContext);