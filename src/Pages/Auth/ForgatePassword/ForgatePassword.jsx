import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import mainLogo from "../../../assets/image/main_logo.png";
import { Spinner } from "@/components/ui/spinner";

const ForgatePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending reset email
    setTimeout(() => {
      setLoading(false);
      navigate("/verify-code");
    }, 1500);
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
            <img src={mainLogo} alt="Mooment" className="w-16 h-16 rounded-[20px] object-contain filter drop-shadow-lg" />
          </div>
          <h1 className="text-2xl font-black text-[#1A1A4B] tracking-tight mb-2">Forget Password</h1>
          <p className="text-gray-400 font-medium text-sm text-center">Enter your email to receive reset instructions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] px-1">REGISTERED EMAIL</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                required
                placeholder="example@gmail.com"
                className="w-full bg-[#F8F9FD] border-2 border-transparent focus:border-black/5 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-[#1A1A4B] outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

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
                Send Code
                <Send size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link to="/sign-in" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgatePassword;
