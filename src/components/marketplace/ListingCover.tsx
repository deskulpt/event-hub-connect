import { cn } from "@/lib/utils";

const palette = ["sunset", "aurora", "ocean", "mint"] as const;
type Palette = (typeof palette)[number];

const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const ListingCover = ({
  seed,
  initials,
  className,
  photoUrl,
}: {
  seed: string;
  initials: string;
  className?: string;
  photoUrl?: string | null;
}) => {
  const tone: Palette = palette[hash(seed) % palette.length];
  const map: Record<Palette, string> = {
    sunset: "bg-gradient-sunset",
    aurora: "bg-gradient-aurora",
    ocean: "bg-gradient-ocean",
    mint: "bg-gradient-mint",
  };
  return (
    <div className={cn("relative h-24 overflow-hidden rounded-t-[var(--radius)]", map[tone], className)}>
      {photoUrl && (
        <img src={photoUrl} alt="" className="h-full w-full object-cover opacity-95" loading="lazy" />
      )}
      {!photoUrl && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.35),_transparent_50%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-3xl font-semibold text-white drop-shadow">{initials}</span>
          </div>
        </>
      )}
    </div>
  );
};
