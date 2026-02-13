import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Mail, GraduationCap, Code2, Heart, ExternalLink } from "lucide-react";

const Credits = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-16">
                {/* Back link */}
                <Link
                    to="/"
                    className="mb-10 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </Link>

                {/* Page heading */}
                <div className="mx-auto max-w-2xl text-center mb-10">
                    <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                        Credits
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        The Person behind IITK-Marketplace
                    </p>
                </div>

                {/* Profile card */}
                <div className="mx-auto max-w-md">
                    <div className="overflow-hidden rounded-2xl border border-border bg-card card-shadow">
                        {/* Photo */}
                        <div className="relative h-[420px] overflow-hidden bg-muted">
                            <img
                                src="/yash-pathak.jpg"
                                alt="Yash Pathak"
                                className="h-full w-full object-cover object-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h2 className="font-display text-2xl font-bold text-white">
                                    Yash Pathak
                                </h2>
                                <p className="mt-0.5 text-sm font-medium text-white/80">
                                    Creator & Developer
                                </p>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-4">
                            <div className="grid gap-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg campus-gradient">
                                        <Code2 className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Project</p>
                                        <p className="font-semibold text-foreground">IITK-Marketplace</p>
                                    </div>
                                </div>

                                <div className="h-px bg-border" />

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <GraduationCap className="h-4 w-4 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Roll Number</p>
                                        <p className="font-semibold text-foreground">231188</p>
                                    </div>
                                </div>

                                <div className="h-px bg-border" />

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <Mail className="h-4 w-4 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <a
                                            href="mailto:yashp23@iitk.ac.in"
                                            className="inline-flex items-center gap-1 font-semibold text-foreground transition-colors hover:text-accent"
                                        >
                                            yashp23@iitk.ac.in
                                            <ExternalLink className="h-3 w-3 opacity-50" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Tagline */}
                            <div className="pt-2">
                                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                                    Built with <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> for the IITK community
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Credits;
