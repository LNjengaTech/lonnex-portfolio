import Link from "next/link";
import Image from "next/image";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { ArrowRight, MapPin } from "lucide-react";

interface AuthorCardProps {
  profile: {
    name: string;
    shortBio: string;
    photoUrl: string;
    location: string;
  } | null;
}

export function ArticleAuthorCard({ profile }: AuthorCardProps) {
  const name = profile?.name || "Lonnex Njenga";
  const shortBio = profile?.shortBio || "Full-stack engineer, spatial UX designer, and technical writer based in Nairobi.";
  const location = profile?.location || "Nairobi, Kenya";
  const photoUrl = profile?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="bg-surface border border-border p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Hex Frame Photo */}
        <div className="relative flex-shrink-0">
          <div
            className="w-16 h-18 sm:w-20 sm:h-22 bg-border p-0.5"
            style={{ clipPath: HEX_CLIP_PATH }}
          >
            <div
              className="relative w-full h-full bg-background overflow-hidden"
              style={{ clipPath: HEX_CLIP_PATH }}
            >
              <img
                src={photoUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Author Bio & Links */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                Written by
              </p>
              <h4 className="text-lg font-bold text-foreground">{name}</h4>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{location}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {shortBio}
          </p>

          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline underline-offset-4"
            >
              <span>More about the author</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
