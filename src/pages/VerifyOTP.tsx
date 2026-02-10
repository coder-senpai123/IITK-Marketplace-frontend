import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyOtp, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { name, email, password } = (location.state as { name: string; email: string; password: string }) || {};

  if (!email) {
    navigate("/register");
    return null;
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length !== 6) {
      toast.error("Please enter the complete OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, otpStr);
      await register({ name, email, password, otp: otpStr });
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-slide-up text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl campus-gradient">
          <ShieldCheck className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Verify your email</h2>
        <p className="mb-8 text-muted-foreground">
          Enter the 6-digit OTP sent to <span className="font-medium text-foreground">{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex justify-center gap-3" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-12 rounded-lg border border-input bg-card text-center font-display text-xl font-bold text-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            ))}
          </div>
          <p className="mb-6 text-xs text-muted-foreground">OTP expires in 5 minutes</p>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg campus-gradient py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              "Verify & Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
