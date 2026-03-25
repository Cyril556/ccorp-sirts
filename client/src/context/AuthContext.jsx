import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Mock users matching the seeded database
const MOCK_USERS = [
  { id: 'mock-admin-1', name: 'Alice Admin', email: 'admin@ccorp.local', password: 'Admin@1234', role: 'ADMIN' },
  { id: 'mock-lead-1', name: 'Sam Lead', email: 'lead@ccorp.local', password: 'Lead@1234', role: 'SOC_LEAD' },
  { id: 'mock-analyst-1', name: 'John Analyst', email: 'analyst@ccorp.local', password: 'Analyst@1234', role: 'ANALYST' },
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sirts_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) throw new Error('Invalid credentials');
    const { password: _, ...safeUser } = user;
    localStorage.setItem('sirts_user', JSON.stringify(safeUser));
    setCurrentUser(safeUser);
    return safeUser;
  };

  const logout = () => {
    localStorage.removeItem('sirts_user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
