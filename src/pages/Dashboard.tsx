import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import ItemCard from "@/components/ItemCard";
import SkeletonCard from "@/components/SkeletonCard";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = ["All", "Electronics", "Books", "Furniture", "Cycles", "Clothing", "Other"];

const Dashboard = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"none" | "low" | "high">("none");
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/items?_=${Date.now()}`);
      const fetched = (data.data || []).filter((i: any) => i.seller);

      fetched.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
      setItems(fetched);
    } catch {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleChat = (itemId: string) => {
    navigate(`/chats/item/${itemId}`);
  };

  const filtered = items
    .filter((item) => {
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || item.category === category;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "low") return a.price - b.price;
      if (sortBy === "high") return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none rounded-lg border border-input bg-card py-2.5 pl-10 pr-8 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="none">Sort by</option>
                <option value="low">Price: Low → High</option>
                <option value="high">Price: High → Low</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${category === cat
                  ? "campus-gradient text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:border-ring hover:text-foreground"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="mb-2 font-display text-xl font-semibold text-foreground">No items found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                onChat={
                  item.seller?._id !== user?._id
                    ? () => handleChat(item._id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
