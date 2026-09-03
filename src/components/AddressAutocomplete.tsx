"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Search } from "lucide-react";

export type SelectedAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type Suggestion = {
  place_id: number;
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    pedestrian?: string;
    footway?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
};

const US_STATE_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS",
  Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD", Massachusetts: "MA",
  Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO", Montana: "MT",
  Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM",
  "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
  "District of Columbia": "DC",
};

const COUNTRY_NAME: Record<string, string> = {
  us: "United States of America",
  ca: "Canada",
  mx: "Mexico",
};

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  inputStyle,
  containerStyle,
  dropdownBg = "#ffffff",
  dropdownText = "#1F2937",
  dropdownBorder = "#E5E7EB",
  disabled,
  autoComplete = "street-address",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (addr: SelectedAddress) => void;
  placeholder?: string;
  inputStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  dropdownBg?: string;
  dropdownText?: string;
  dropdownBorder?: string;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  const search = (q: string) => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    if (q.trim().length < 2) {
      setSuggestions([]); setOpen(false); setLoading(false);
      return;
    }
    setLoading(true);
    timeoutRef.current = window.setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=us,ca,mx&limit=6&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data: Suggestion[] = res.ok ? await res.json() : [];
        setSuggestions(data);
        setOpen(data.length > 0);
        setActive(-1);
      } catch {
        setSuggestions([]); setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const pick = (s: Suggestion) => {
    const a = s.address || {};
    const street = [a.house_number, a.road || a.pedestrian || a.footway].filter(Boolean).join(" ").trim();
    const city = a.city || a.town || a.village || a.hamlet || a.county || "";
    const stateName = a.state || "";
    const state = US_STATE_ABBR[stateName] ?? stateName;
    const zip = a.postcode || "";
    const cc = (a.country_code || "").toLowerCase();
    const country = COUNTRY_NAME[cc] || a.country || "";
    onSelect({
      street: street || s.display_name.split(",")[0].trim(),
      city, state, zip, country,
    });
    setOpen(false);
    setSuggestions([]);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(p => Math.min(p + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(p => Math.max(p - 1, 0)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(suggestions[active]); }
    else if (e.key === "Escape") setOpen(false);
  };

  // Break each suggestion into a bold primary line (the street /
  // named place) and a muted secondary line (city / state / zip),
  // so results read the same way as the reference Mailing Address
  // picker in the app: pin icon, name, locality underneath.
  const formatSuggestion = (s: Suggestion) => {
    const a = s.address || {};
    const streetish = [a.house_number, a.road || a.pedestrian || a.footway].filter(Boolean).join(" ").trim();
    const chunks = s.display_name.split(",").map(x => x.trim()).filter(Boolean);
    const primary = streetish || chunks[0] || s.display_name;
    const city = a.city || a.town || a.village || a.hamlet || "";
    const stateAbbr = a.state ? (US_STATE_ABBR[a.state] ?? a.state) : "";
    const zip = a.postcode || "";
    const secondary = [city, stateAbbr, zip].filter(Boolean).join(", ");
    return { primary, secondary };
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", ...containerStyle }}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); search(e.target.value); }}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        onKeyDown={onKey}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        style={{ ...inputStyle, paddingRight: 36 }}
        className={className}
      />
      <Search
        aria-hidden
        style={{
          position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)",
          width: 14, height: 14, color: "#9CA3AF", pointerEvents: "none",
        }}
      />
      {open && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            zIndex: 50, maxHeight: 320, overflowY: "auto",
            background: dropdownBg, color: dropdownText,
            border: `1px solid ${dropdownBorder}`, borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: "4px 0",
          }}
          onMouseDown={e => e.preventDefault()}
        >
          {suggestions.map((s, idx) => {
            const { primary, secondary } = formatSuggestion(s);
            const isActive = idx === active;
            return (
              <div
                key={s.place_id}
                onClick={() => pick(s)}
                onMouseEnter={() => setActive(idx)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "10px 16px", cursor: "pointer",
                  background: isActive ? "#F9FAFB" : "transparent",
                  transition: "background 0.15s ease",
                }}
              >
                <MapPin style={{ width: 14, height: 14, color: "#9CA3AF", flexShrink: 0, marginTop: 2 }} strokeWidth={1.75} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{primary}</div>
                  {secondary && (
                    <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{secondary}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {loading && !open && value.trim().length >= 3 && (
        <div style={{
          position: "absolute", top: "50%", right: 32, transform: "translateY(-50%)",
          fontSize: 11, color: "#9CA3AF", pointerEvents: "none",
        }}>…</div>
      )}
    </div>
  );
}
