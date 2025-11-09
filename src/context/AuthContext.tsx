// src/context/AuthContext.tsx
import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { contestService } from "../api/contestService";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  role: "organizer" | "contestant";
  password: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  role: "organizer" | "contestant";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  registerUser: (data: RegisterData) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Load active user
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await contestService.getMe();
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /** ✅ REGISTER USER */
  const registerUser = useCallback(
    async (data: RegisterData) => {
      if (data.role === "organizer") {
        await contestService.registerOrganizer({
          username: data.username,
          email: data.email,
          password: data.password,
        });
      } else {
        await contestService.registerContestant({
          username: data.username,
          email: data.email,
          password: data.password,
        });
      }

      navigate("/login");
    },
    [navigate]
  );

  /** ✅ LOGIN */
  const login = useCallback(
    async (data: LoginData) => {
      try {
        // Clear any existing user data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Make the login request
        const res = await contestService.login(data);
        const loggedUser: User = res.data.user;
        const token = res.data.token;
        
        console.log('Login successful, user:', loggedUser);
        
        // Store token and user data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);

        if (loggedUser.role === 'organizer') {
          navigate('/organizer');
        } else {
          navigate('/contestant');
        }
      } catch (error) {
        console.error('Login failed:', error);
        throw error; // Re-throw to handle in the component
      }
    },
    [navigate]
  );

  /** ✅ LOGOUT */
  const logout = useCallback(async () => {
    try {
      await contestService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      navigate('/login');
    }
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ user, loading, registerUser, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
