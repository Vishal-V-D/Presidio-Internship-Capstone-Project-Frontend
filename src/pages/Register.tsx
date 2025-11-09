import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { SplitScreenLayout } from "./SplitScreenLayout";
import { showToast } from "../utils/toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const registerSchema = yup.object({
  name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  email: yup
    .string()
    .email("Must be a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .required("Password is required"),
  role: yup
    .string()
    .oneOf(["organizer", "contestant"], "Invalid role")
    .required("Role is required"),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export default function Register() {
  const { registerUser } = useContext(AuthContext)!;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: { role: "contestant" },
  });

  const selectedRole = watch("role");

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await registerUser({
        username: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      showToast("Registration Successful! You can now sign in.", "success");
      reset();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Registration failed!", "error");
    } finally {
      setLoading(false);
    }
  };

  const formSide = (
    <div className="w-full max-w-sm animate-fade-in-slide-up">
      <h1 className="text-4xl font-bold mb-10 text-theme-primary text-center">
        Create Account
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* ✅ Role Selection Card */}
        <div className="bg-theme-secondary border border-theme rounded-xl p-4 shadow-md">
          <p className="text-sm font-medium text-theme-primary mb-3 text-center">
            Select your role
          </p>

          <div className="flex items-center justify-between gap-4">

            {/* Organizer */}
            <label
              className={`flex-1 border rounded-lg p-3 cursor-pointer text-center transition 
                ${
                  selectedRole === "organizer"
                    ? "border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent)/0.1)]"
                    : "border-theme"
                }`}
            >
              <input
                type="radio"
                value="organizer"
                {...register("role")}
                className="hidden"
              />
              <span className="font-medium">Organizer</span>
            </label>

            {/* Contestant */}
            <label
              className={`flex-1 border rounded-lg p-3 cursor-pointer text-center transition 
                ${
                  selectedRole === "contestant"
                    ? "border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent)/0.1)]"
                    : "border-theme"
                }`}
            >
              <input
                type="radio"
                value="contestant"
                {...register("role")}
                className="hidden"
              />
              <span className="font-medium">Contestant</span>
            </label>
          </div>

          {errors.role && (
            <p className="text-[hsl(var(--color-error))] text-sm mt-1">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* ✅ Dynamic Name Field */}
        <div className="relative">
          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary opacity-60" />

          <input
            type="text"
            placeholder={
              selectedRole === "organizer" ? "Organizer Name" : "Full Name"
            }
            {...register("name")}
            className="input-field pl-12 w-full border-theme rounded-xl p-3 bg-theme-secondary"
          />
          {errors.name && (
            <p className="text-[hsl(var(--color-error))] text-sm mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary opacity-60" />
          <input
            type="email"
            placeholder="Email Address"
            {...register("email")}
            className="input-field pl-12 w-full border-theme rounded-xl p-3 bg-theme-secondary"
          />
          {errors.email && (
            <p className="text-[hsl(var(--color-error))] text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary opacity-60" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password")}
            className="input-field pl-12 pr-14 w-full border-theme rounded-xl p-3 bg-theme-secondary"
          />

          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-theme-secondary hover:text-theme-primary transition-colors"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>

          {errors.password && (
            <p className="text-[hsl(var(--color-error))] text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="button-theme mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                5.291A7.962 7.962 0 014 12H0c0 
                3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-theme-secondary">
        Already registered?{" "}
        <Link
          to="/login"
          className="text-[hsl(var(--color-accent))] font-medium hover:underline transition-colors"
        >
          Sign in!
        </Link>
      </p>
    </div>
  );

  return <SplitScreenLayout formSide={formSide} isLogin={false} />;
}
