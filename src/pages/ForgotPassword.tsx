import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Mail, ArrowRight, Store } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        setLoading(true);
        try {
            await API.post("/auth/forgot-password", { email });
            toast.success("OTP sent to your email");
            navigate("/reset-password", { state: { email } });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
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
                        Forgot Password?
                    </h1>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Enter your IITK email and we'll send you a 6-digit OTP to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="yourname@iitk.ac.in"
                                    required
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
                                <>
                                    Send OTP <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-accent hover:underline"
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
