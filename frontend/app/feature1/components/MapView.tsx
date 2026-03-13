"use client";

import Link from "next/link";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ActivityMode, getLeaderboardUsers } from "../data/leaderboardData";

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };
const DEFAULT_ZOOM = 8;
const MIN_ZOOM = 10;
const MAX_ZOOM = 19;
const SEARCH_DELAY_MS = 400;

const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const BANGALORE_BOUNDING_BOX = {
    north: 13.2,
    south: 12.7,
    west: 77.3,
    east: 77.85,
};

// ============================================================================
// SEARCH TYPES
// ============================================================================

interface SearchSuggestion {
    id: number;
    label: string;
    primary: string;
    secondary: string;
    latitude: number;
    longitude: number;
}

type MapTheme = "dark";

// ============================================================================
// CUSTOM MARKER FACTORY
// ============================================================================

function createCustomIcon(rank: number): L.DivIcon {
    const isTop3 = rank <= 3;
    const size = isTop3 ? 48 : 38;
    const colors: Record<number, { bg: string; glow: string }> = {
        1: { bg: "linear-gradient(135deg, #ffd700, #f59e0b)", glow: "rgba(255, 215, 0, 0.6)" },
        2: { bg: "linear-gradient(135deg, #e2e8f0, #94a3b8)", glow: "rgba(148, 163, 184, 0.5)" },
        3: { bg: "linear-gradient(135deg, #f59e0b, #d97706)", glow: "rgba(217, 119, 6, 0.45)" },
    };

    const defaultColor = { bg: "linear-gradient(135deg, #6366f1, #818cf8)", glow: "rgba(99, 102, 241, 0.4)" };

    const color = isTop3 ? colors[rank] : defaultColor;
    const borderColor = "rgba(255,255,255,0.9)";
    const textColor = isTop3 && rank <= 2 ? "#1a1a2e" : "#fff";

    return L.divIcon({
        className: "custom-fitness-marker",
        html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color.bg};
        border: 3px solid ${borderColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isTop3 ? 18 : 14}px;
        font-weight: 800;
        color: ${textColor};
        box-shadow: 0 6px 20px ${color.glow}, 0 0 0 6px ${color.glow};
        transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
        cursor: pointer;
        animation: markerPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: ${rank * 0.08}s;
        position: relative;
      ">${rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : rank}</div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2 + 4)],
    });
}

function createPopupHTML(
    user: ReturnType<typeof getLeaderboardUsers>[number],
    rank: number,
    theme: MapTheme,
): string {
    const medal = rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`;
    const isDark = theme === "dark";
    const textPrimary = isDark ? "#fff" : "#1a1a2e";
    const textSecondary = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
    const textAccent = isDark ? "#818cf8" : "#4f46e5";
    const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const activityBg = isDark ? "rgba(99,102,241,0.1)" : "rgba(79,70,229,0.08)";
    const activityColor = isDark ? "#a5b4fc" : "#4f46e5";

    return `
    <div style="padding: 6px 2px; min-width: 180px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
        <span style="font-size:1.5rem;">${medal}</span>
        <div>
          <div style="font-size:0.95rem; font-weight:700; color:${textPrimary};">${user.username}</div>
          <div style="font-size:0.72rem; color:${textSecondary};">📍 ${user.location}</div>
        </div>
      </div>
      <div style="display:flex; gap:16px; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid ${divider};">
        <div style="text-align:center;">
          <div style="font-size:1rem; font-weight:700; color:${textAccent};">${user.squats.toLocaleString("en-IN")}</div>
          <div style="font-size:0.65rem; color:${textSecondary}; text-transform:uppercase; letter-spacing:0.05em;">squats</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1rem; font-weight:700; color:${textAccent};">${user.challengesWon}</div>
          <div style="font-size:0.65rem; color:${textSecondary}; text-transform:uppercase; letter-spacing:0.05em;">wins</div>
        </div>
      </div>
      <div style="font-size:0.75rem; padding:6px 10px; background:${activityBg}; border-radius:8px; color:${activityColor}; font-weight:600; text-align:center;">
        🏃 ${user.activity}
      </div>
    </div>
  `;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function MapView() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const searchMarkerRef = useRef<L.Marker | null>(null);
    const mapReadyRef = useRef(false);
    const searchTimerRef = useRef<number | null>(null);
    const searchAbortRef = useRef<AbortController | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [theme] = useState<MapTheme>("dark");
    const [mode, setMode] = useState<ActivityMode>("walk");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const users = useMemo(() => getLeaderboardUsers(mode, "daily"), [mode]);

    // ========================================================================
    // PLACE MARKERS (static mock data — no backend)
    // ========================================================================

    const placeMarkers = useCallback((currentTheme: MapTheme) => {
        const map = mapInstanceRef.current;
        if (!map || !mapReadyRef.current) return;

        // Remove old markers
        markersRef.current.forEach((m) => {
            try { map.removeLayer(m); } catch { /* ignore */ }
        });
        markersRef.current = [];

        users.forEach((user, idx) => {
            const rank = idx + 1;

            try {
                const marker = L.marker(user.coords, {
                    icon: createCustomIcon(rank),
                })
                    .bindPopup(createPopupHTML(user, rank, currentTheme), {
                        maxWidth: 260,
                        className: "fitness-popup",
                    })
                    .addTo(map);

                markersRef.current.push(marker);
            } catch (err) {
                console.warn("Failed to add marker:", err);
            }
        });
    }, [users]);

    const handleSelectSuggestion = useCallback((suggestion: SearchSuggestion) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (searchMarkerRef.current) {
            map.removeLayer(searchMarkerRef.current);
        }

        map.flyTo([suggestion.latitude, suggestion.longitude], 14, { animate: true });
        searchMarkerRef.current = L.marker([suggestion.latitude, suggestion.longitude]).addTo(map);
        searchMarkerRef.current.bindPopup(`📍 ${suggestion.label}`).openPopup();

        setSearchQuery(suggestion.label);
        setSearchSuggestions([]);
    }, []);

    // ========================================================================
    // INITIALIZE MAP
    // ========================================================================

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
            zoom: DEFAULT_ZOOM,
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            zoomControl: true,
        });

        L.tileLayer(TILE_LAYER_URL, {
            attribution: TILE_ATTRIBUTION,
            maxZoom: MAX_ZOOM,
        }).addTo(map);

        mapInstanceRef.current = map;

        map.whenReady(() => {
            mapReadyRef.current = true;
            setIsLoading(false);
            placeMarkers("dark");
        });

        return () => {
            mapReadyRef.current = false;
            if (searchMarkerRef.current) {
                map.removeLayer(searchMarkerRef.current);
                searchMarkerRef.current = null;
            }
            map.remove();
            mapInstanceRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        placeMarkers(theme);
    }, [placeMarkers, theme]);

    useEffect(() => {
        const query = searchQuery.trim();

        if (searchTimerRef.current) {
            window.clearTimeout(searchTimerRef.current);
        }

        if (searchAbortRef.current) {
            searchAbortRef.current.abort("replaced");
            searchAbortRef.current = null;
        }

        if (query.length < 2) {
            setSearchSuggestions([]);
            setSearchLoading(false);
            return;
        }

        searchTimerRef.current = window.setTimeout(async () => {
            const controller = new AbortController();
            searchAbortRef.current = controller;
            setSearchLoading(true);

            try {
                const url = new URL("https://nominatim.openstreetmap.org/search");
                url.searchParams.set("format", "json");
                url.searchParams.set("addressdetails", "1");
                url.searchParams.set("limit", "8");
                url.searchParams.set("dedupe", "1");
                url.searchParams.set("namedetails", "1");
                url.searchParams.set("accept-language", "en");
                url.searchParams.set("countrycodes", "in");
                url.searchParams.set("q", query);

                if (query.length <= 4) {
                    url.searchParams.set(
                        "viewbox",
                        `${BANGALORE_BOUNDING_BOX.west},${BANGALORE_BOUNDING_BOX.north},${BANGALORE_BOUNDING_BOX.east},${BANGALORE_BOUNDING_BOX.south}`,
                    );
                    url.searchParams.set("bounded", "1");
                } else {
                    url.searchParams.set("bounded", "0");
                }

                const response = await fetch(url.toString(), {
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });

                if (!response.ok) {
                    throw new Error(`Geocoding failed with status ${response.status}`);
                }

                const json = await response.json();
                const suggestions = Array.isArray(json)
                    ? json
                        .map((item: { place_id: number; display_name: string; lat: string; lon: string }) => {
                            const latitude = Number(item.lat);
                            const longitude = Number(item.lon);

                            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                                return null;
                            }

                            const displayParts = (item.display_name || "").split(", ");
                            const [primary, ...rest] = displayParts;

                            return {
                                id: item.place_id,
                                label: primary || item.display_name,
                                primary: primary || item.display_name,
                                secondary: rest.join(", "),
                                latitude,
                                longitude,
                            };
                        })
                        .filter((item): item is SearchSuggestion => item !== null)
                    : [];

                setSearchSuggestions(suggestions);
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                    return;
                }
                setSearchSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        }, SEARCH_DELAY_MS);

        return () => {
            if (searchTimerRef.current) {
                window.clearTimeout(searchTimerRef.current);
            }
        };
    }, [searchQuery]);

    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                window.clearTimeout(searchTimerRef.current);
            }
            if (searchAbortRef.current) {
                searchAbortRef.current.abort("unmount");
            }
        };
    }, []);

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <section className="feature1-map-shell" id="feature1-map">
            <div className="feature1-map-controls">
                <div className="map-top-bar">
                    <div className="feature1-map-overlay">
                        <div className="pulse-dot" />
                        <span>Daily Map</span>
                    </div>

                    <div className="map-active-badge">
                        <span className="map-active-count">{users.length}</span>
                        <span className="map-active-label">Active Now</span>
                    </div>

                    <Link className="map-leaderboard-link" href="/feature1/leaderboard">
                        🏆 Leaderboard Page
                    </Link>
                </div>

                <div className="map-search-wrap">
                    <div className="map-search-box">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search places in Bengaluru"
                            aria-label="Search places"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="map-search-clear"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSearchSuggestions([]);
                                }}
                                aria-label="Clear place search"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {(searchLoading || searchSuggestions.length > 0) && (
                        <ul className="map-search-suggestions" role="listbox" aria-label="Place suggestions">
                            {searchLoading && <li className="map-search-status">Searching places…</li>}
                            {!searchLoading && searchSuggestions.map((suggestion) => (
                                <li key={suggestion.id}>
                                    <button type="button" onClick={() => handleSelectSuggestion(suggestion)}>
                                        <span className="map-search-primary">{suggestion.primary}</span>
                                        {suggestion.secondary && (
                                            <span className="map-search-secondary">{suggestion.secondary}</span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="map-filter-wrap" aria-label="Activity and period filters">
                    <div className="map-filter-group">
                        {(["walk", "cycle"] as const).map((activity) => (
                            <button
                                key={activity}
                                type="button"
                                className={`map-filter-tab ${mode === activity ? "map-filter-tab--active" : ""}`}
                                onClick={() => setMode(activity)}
                            >
                                {activity === "walk" ? "By Walk" : "By Cycle"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="feature1-map">
                {isLoading && (
                    <div className="map-loading">
                        <div className="map-loading-spinner" />
                        <span>Loading Bengaluru map…</span>
                    </div>
                )}

                <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
            </div>
        </section>
    );
}
