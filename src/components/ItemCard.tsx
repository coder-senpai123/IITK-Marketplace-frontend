import { MessageCircle } from "lucide-react";

interface ItemCardProps {
  item: {
    _id: string;
    title: string;
    price: number;
    category: string;
    condition: string;
    location: string;
    images: string[];
    seller?: { name: string; email?: string; _id: string };
  };
  onChat?: () => void;
  onClick?: () => void;
}

const conditionColors: Record<string, string> = {
  New: "bg-green-100 text-green-700",
  "Like New": "bg-emerald-100 text-emerald-700",
  Good: "bg-blue-100 text-blue-700",
  Fair: "bg-yellow-100 text-yellow-700",
  Poor: "bg-red-100 text-red-700",
};

const ItemCard = ({ item, onChat, onClick }: ItemCardProps) => {
  const imgSrc = item.images?.[0]
    ? item.images[0].startsWith("http")
      ? item.images[0]
      : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/${item.images[0]}`
    : "/placeholder.svg";

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imgSrc}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${conditionColors[item.condition] || "bg-muted text-muted-foreground"}`}>
          {item.condition}
        </span>
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-display text-base font-semibold text-card-foreground">
            {item.title}
          </h3>
          <span className="shrink-0 font-display text-lg font-bold text-accent">
            ₹{item.price.toLocaleString("en-IN")}
          </span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          {item.category} · {item.location}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-card-foreground">
              {item.seller?.name || "Seller"}
            </span>
            {item.seller?.email && (
              <span className="text-[11px] text-muted-foreground">
                {item.seller.email}
              </span>
            )}
          </div>
          {onChat && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChat();
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
