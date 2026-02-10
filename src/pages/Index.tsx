import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { ArrowRight, ShoppingBag, MessageCircle, Shield } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 campus-gradient opacity-[0.03]" />
        <div className="container mx-auto px-4 py-20 text-center lg:py-32">
          <h1 className="mx-auto mb-6 max-w-3xl font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
            Your Campus,{" "}
            <span className="bg-gradient-to-r from-[hsl(220,55%,22%)] to-[hsl(30,90%,55%)] bg-clip-text text-transparent">
              Your Marketplace
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            Buy, sell, and trade within the IIT Kanpur community. Safe, verified, and exclusively for IITK students.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 rounded-xl campus-gradient px-8 py-3 font-semibold text-primary-foreground shadow-elevated transition-all hover:opacity-90 hover:-translate-y-0.5"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-3 font-semibold text-foreground transition-all hover:bg-muted hover:-translate-y-0.5"
            >
              Browse Items
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ShoppingBag,
              title: "List in Seconds",
              desc: "Upload photos, set a price, and your item is live for the entire campus.",
            },
            {
              icon: MessageCircle,
              title: "Chat Instantly",
              desc: "Message sellers directly. No phone numbers, no awkward emails.",
            },
            {
              icon: Shield,
              title: "IITK Verified",
              desc: "Only @iitk.ac.in emails. Trade with people you trust.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-8 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl campus-gradient transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-card-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
