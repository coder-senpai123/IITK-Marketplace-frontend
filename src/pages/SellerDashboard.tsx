import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
    Package, ShoppingBag, MessageCircle, Settings, Trash2,
    CheckCircle, Tag, MapPin, Eye, AlertTriangle
} from "lucide-react";

type TabId = "listings" | "sold" | "chats" | "account";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "listings", label: "My Listings", icon: <Package className="h-4 w-4" /> },
    { id: "sold", label: "Sold Items", icon: <ShoppingBag className="h-4 w-4" /> },
    { id: "chats", label: "My Chats", icon: <MessageCircle className="h-4 w-4" /> },
    { id: "account", label: "Account", icon: <Settings className="h-4 w-4" /> },
];

const SellerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState<TabId>("listings");
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Password change
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [pwLoading, setPwLoading] = useState(false);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await API.get("/items/mine");
            setItems(Array.isArray(data.data) ? data.data : []);
        } catch {
            toast.error("Failed to load your items");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const activeItems = items.filter((i) => i.status === "active");
    const soldItems = items.filter((i) => i.status === "sold");

    const handleMarkSold = async (id: string) => {
        try {
            await API.patch(`/items/${id}/sold`);
            toast.success("Item marked as sold");
            fetchItems();
        } catch {
            toast.error("Failed to mark as sold");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await API.delete(`/items/${id}`);
            toast.success("Item deleted");
            fetchItems();
        } catch {
            toast.error("Failed to delete item");
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPw !== confirmPw) {
            toast.error("New passwords do not match");
            return;
        }
        if (newPw.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setPwLoading(true);
        try {
            await API.post("/auth/change-password", {
                currentPassword: currentPw,
                newPassword: newPw,
            });
            toast.success("Password changed successfully");
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setPwLoading(false);
        }
    };

    const conditionColors: Record<string, string> = {
        New: "bg-green-100 text-green-700",
        "Like New": "bg-emerald-100 text-emerald-700",
        Good: "bg-blue-100 text-blue-700",
        Fair: "bg-yellow-100 text-yellow-700",
        Poor: "bg-red-100 text-red-700",
    };

    const renderItemCard = (item: any, actions?: React.ReactNode) => {
        const imgSrc = item.images?.[0]
            ? item.images[0].startsWith("http")
                ? item.images[0]
                : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/${item.images[0]}`
            : "/placeholder.svg";

        return (
            <div
                key={item._id}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg"
            >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                        src={imgSrc}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${conditionColors[item.condition] || "bg-muted text-muted-foreground"
                            }`}
                    >
                        {item.condition}
                    </span>
                    {item.status === "sold" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-red-600">
                                SOLD
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 font-display text-base font-semibold text-card-foreground">
                            {item.title}
                        </h3>
                        <span className="shrink-0 font-display text-lg font-bold text-accent">
                            ₹{item.price?.toLocaleString("en-IN")}
                        </span>
                    </div>
                    <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <Tag className="h-3 w-3" /> {item.category}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {item.location}
                        </span>
                    </div>
                    {actions && <div className="flex gap-2">{actions}</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-6">
                {/* Header Stats */}
                <div className="mb-8">
                    <h1 className="mb-2 font-display text-2xl font-bold text-foreground">
                        Seller Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your listings, track sales, and update your account
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-card-foreground">{activeItems.length}</p>
                                    <p className="text-xs text-muted-foreground">Active</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-card-foreground">{soldItems.length}</p>
                                    <p className="text-xs text-muted-foreground">Sold</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                    <Eye className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-card-foreground">{items.length}</p>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                    <ShoppingBag className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-card-foreground">
                                        ₹{soldItems.reduce((s, i) => s + (i.price || 0), 0).toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Revenue</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === t.id
                                ? "campus-gradient text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {tab === "listings" && (
                    <div>
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                        ) : activeItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                <p className="mb-1 font-display text-lg font-semibold text-foreground">No active listings</p>
                                <p className="mb-4 text-sm text-muted-foreground">Start selling by listing your first item</p>
                                <button
                                    onClick={() => navigate("/sell")}
                                    className="rounded-lg campus-gradient px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                                >
                                    List an Item
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {activeItems.map((item) =>
                                    renderItemCard(
                                        item,
                                        <>
                                            <button
                                                onClick={() => handleMarkSold(item._id)}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-3.5 w-3.5" /> Mark Sold
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                )}

                {tab === "sold" && (
                    <div>
                        {soldItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                <p className="font-display text-lg font-semibold text-foreground">No sold items yet</p>
                                <p className="text-sm text-muted-foreground">Items you mark as sold will appear here</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {soldItems.map((item) => renderItemCard(item))}
                            </div>
                        )}
                    </div>
                )}

                {tab === "chats" && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <MessageCircle className="mb-3 h-12 w-12 text-muted-foreground/50" />
                        <p className="mb-1 font-display text-lg font-semibold text-foreground">Your Conversations</p>
                        <p className="mb-4 text-sm text-muted-foreground">View and respond to buyer messages</p>
                        <button
                            onClick={() => navigate("/chats")}
                            className="rounded-lg campus-gradient px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                        >
                            Open Chats
                        </button>
                    </div>
                )}

                {tab === "account" && (
                    <div className="mx-auto max-w-lg space-y-6">
                        {/* Account Info */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="mb-4 font-display text-lg font-semibold text-card-foreground">
                                Account Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                                    <p className="mt-0.5 text-sm font-medium text-card-foreground">{user?.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Role</label>
                                    <p className="mt-0.5 text-sm font-medium text-card-foreground capitalize">{user?.role || "student"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Change Password */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="mb-4 font-display text-lg font-semibold text-card-foreground">
                                Change Password
                            </h3>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPw}
                                        onChange={(e) => setCurrentPw(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-input bg-background py-2.5 px-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
                                    <input
                                        type="password"
                                        value={newPw}
                                        onChange={(e) => setNewPw(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full rounded-lg border border-input bg-background py-2.5 px-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPw}
                                        onChange={(e) => setConfirmPw(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full rounded-lg border border-input bg-background py-2.5 px-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={pwLoading}
                                    className="w-full rounded-lg campus-gradient py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                                >
                                    {pwLoading ? "Changing..." : "Change Password"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SellerDashboard;
