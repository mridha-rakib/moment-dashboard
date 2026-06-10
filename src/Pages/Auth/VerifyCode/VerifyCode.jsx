import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import mainLogo from "../../../assets/image/main_logo.png";
import { Spinner } from "@/components/ui/spinner";

const VerifyCode = () => {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 5);
  }, []);

  const handleChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(0, 1);
    setCode(newCode);
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/new-password");
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
          <h1 className="text-2xl font-black text-[#1A1A4B] tracking-tight mb-2 text-center">Verify Your Code</h1>
          <p className="text-gray-400 font-medium text-sm text-center px-4">
            We sent a 5-digit code to your email. Enter it below to continue.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-10">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3, 4].map((index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                value={code[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-16 md:w-16 md:h-20 text-2xl font-black text-center text-[#1A1A4B] bg-[#F8F9FD] border-2 border-transparent focus:border-black/20 focus:bg-white rounded-2xl outline-none transition-all"
                maxLength={1}
                inputMode="numeric"
              />
            ))}
          </div>

          <div className="space-y-6">
            <button 
              type="submit"
              disabled={loading || code.some(c => !c)}
              className="w-full bg-[#0C0B10] text-white rounded-2xl py-4 font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-black/20 hover:bg-black transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <Spinner className="size-5 text-white" />
              ) : (
                <>
                  Verify Code
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm font-bold text-gray-400">
                Didn't receive the email?{" "}
                <button type="button" className="text-black hover:underline font-black">Resend Code</button>
              </p>
            </div>
          </div>
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

export default VerifyCode;
