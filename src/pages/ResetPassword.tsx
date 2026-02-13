import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Lock, KeyRound, Store } from "lucide-react";

const ResetPassword = () => {
    const location = useLocation();
    const emailFromState = (location.state as any)?.email || "";

    const [email, setEmail] = useState(emailFromState);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !otp || !newPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await API.post("/auth/reset-password", {
                email,
                otp,
                newPassword,
            });
            toast.success("Password reset successfully! Please login.");
            navigate("/login");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl campus-gradient">
                            <Store className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="font-display text-2xl font-bold text-foreground">
                            IITK <span className="text-accent">Market</span>
                        </span>
                    </Link>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                    <h1 className="mb-2 font-display text-xl font-bold text-card-foreground">
                        Reset Password
                    </h1>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Enter the 6-digit OTP sent to your email and choose a new password.
                        You have 5 attempts.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!emailFromState && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="yourname@iitk.ac.in"
                                    required
                                    className="w-full rounded-lg border border-input bg-background py-2.5 px-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                OTP Code
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    required
                                    className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground tracking-[0.3em] outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    required
                                    minLength={6}
                                    className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    required
                                    minLength={6}
                                    className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg campus-gradient py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/forgot-password"
                            className="text-sm font-medium text-accent hover:underline"
                        >
                            Need a new OTP?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
