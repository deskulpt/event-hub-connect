import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, Locate } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  type CitySuggestion,
  searchCities,
  reverseGeocode,
  getCurrentPosition,
} from "@/services/places";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string, suggestion?: CitySuggestion) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
  showLocate?: boolean;
  iconClassName?: string;
}

export const CityAutocomplete = ({
  value,
  onChange,
  placeholder = "City",
  className,
  inputClassName,
  id,
  showLocate = true,
  iconClassName,
}: CityAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!value || value.trim().length < 2) {
      setItems([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const results = await searchCities(value, ctrl.signal);
        setItems(results);
        if (results.length > 0) setOpen(true);
      } catch {
        /* aborted or network */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [value]);

  const pick = (s: CitySuggestion) => {
    onChange(s.short, s);
    setOpen(false);
    setItems([]);
    inputRef.current?.blur();
  };

  const handleLocate = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      const r = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      if (r) onChange(r.short, r);
    } catch {
      /* user denied or unavailable */
    } finally {
      setLocating(false);
    }
  };

  return (
    <Popover open={open && items.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <MapPin className={cn("pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary", iconClassName)} />
          <Input
            id={id}
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => items.length > 0 && setOpen(true)}
            placeholder={placeholder}
            className={cn("pl-10", showLocate && "pr-10", inputClassName)}
            autoComplete="off"
          />
          {showLocate && (
            <button
              type="button"
              onClick={handleLocate}
              aria-label="Use my location"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {loading && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Searching…
          </div>
        )}
        {!loading &&
          items.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => pick(s)}
              className="flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{s.short}</span>
                <span className="block truncate text-xs text-muted-foreground">{s.label}</span>
              </span>
            </button>
          ))}
      </PopoverContent>
    </Popover>
  );
};
