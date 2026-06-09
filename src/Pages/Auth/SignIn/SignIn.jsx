import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import mainLogo from "../../../assets/image/main_logo.png";
import { useAuthStore } from "../../../features/auth";
import { Spinner } from "@/components/ui/spinner";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      const redirectPath = location.state?.from?.pathname || "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch {
      // The store exposes a user-friendly error below the form.
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-[540px] bg-white rounded-[48px] p-10 md:p-16 shadow-2xl shadow-black/[0.03] border border-white relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Branding Header with Dark Contrast Container */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="w-24 h-24 bg-[#0C0B10] rounded-[28px] flex items-center justify-center mb-6 shadow-2xl shadow-black/20 transform hover:scale-105 transition-all duration-500">
            <img src={mainLogo} alt="Mooment" className="w-auto h-14 object-contain filter drop-shadow-lg" />
          </div>
          <h2 className="text-2xl font-black text-[#1A1A4B] tracking-tight mb-1">Welcome Back!</h2>
          <p className="text-gray-400 font-medium text-sm">Please enter your details to continue</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] px-1">EMAIL ADDRESS</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                required
                placeholder="example@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-[#F8F9FD] border-2 border-transparent focus:border-black/5 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-[#1A1A4B] outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">PASSWORD</label>
              <Link to="/forgate-password" strokeWidth={3} className="text-[11px] font-black text-gray-400 uppercase tracking-wider hover:text-black transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-[#F8F9FD] border-2 border-transparent focus:border-black/5 focus:bg-white rounded-2xl py-4 pl-14 pr-14 text-sm font-bold text-[#1A1A4B] outline-none transition-all placeholder:text-gray-300"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3 px-1">
            <label className="relative flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-5 h-5 bg-[#F8F9FD] rounded-md border-2 border-transparent peer-checked:bg-black peer-checked:border-black transition-all" />
              <svg className="absolute w-3 h-3 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </label>
            <span className="text-sm font-bold text-gray-400">Remember me</span>
          </div>

          {authError && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {authError}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#0C0B10] text-white rounded-2xl py-4 font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-black/20 hover:bg-black transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none"
          >
            {loading ? (
              <Spinner className="size-5 text-white" />
            ) : (
              <>
                Sign In
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default SignIn;
