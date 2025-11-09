// src/components/Login.tsx
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import { SplitScreenLayout } from "./SplitScreenLayout";
import { FaEnvelope, FaLock, FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";

const loginSchema = yup.object({
  email: yup.string().email("Must be a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export default function Login() {
  const { login } = useContext(AuthContext)!;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(loginSchema) });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await login(data);
      showToast("Logged in!", "success");
    } catch (err: any) {
      showToast("Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const formSide = (
    <div className="w-full max-w-sm animate-fade-in-slide-up">
      <h1 className="text-4xl font-bold mb-10 text-theme-primary text-center">
        Sign In
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Email */}
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary opacity-60" />
          <input 
            type="email" 
            placeholder="Email Address" 
            {...register("email")} 
            className="input-field pl-12 w-full border-theme rounded-xl p-3 bg-theme-secondary focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-accent))] focus:border-transparent"
          />
          {errors.email && <p className="text-[hsl(var(--color-error))] text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary opacity-60" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password")}
            className="input-field pl-12 pr-14 w-full border-theme rounded-xl p-3 bg-theme-secondary focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-accent))] focus:border-transparent"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-theme-secondary hover:text-theme-primary transition-colors"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && <p className="text-[hsl(var(--color-error))] text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="button-theme flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <FaUserShield /> Sign In
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-theme-secondary">
        New here?{" "}
        <Link to="/register" className="text-[hsl(var(--color-accent))] font-medium hover:underline transition-colors">
          Create an account
        </Link>
      </p>
    </div>
  );

  return (
    <SplitScreenLayout
      isLogin
      formSide={formSide}
    />
  );
}