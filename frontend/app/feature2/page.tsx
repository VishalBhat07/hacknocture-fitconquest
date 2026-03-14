"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LogOut,
  Swords,
  ShoppingBag,
  Trophy,
  ChevronRight,
  Users,
  Lock,
  Dumbbell,
} from "lucide-react";

export default function Feature2() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("vishal");
  const [password, setPassword] = useState("password123");
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isChallengesLoading, setIsChallengesLoading] = useState(false);
  const [challengesError, setChallengesError] = useState<string | null>(null);
  const [joiningTeamKey, setJoiningTeamKey] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("fit_token");
    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        fetchChallenges();
      } else {
        localStorage.removeItem("fit_token");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ username, password }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("fit_token", data.token);
        setUser(data.user);
        fetchChallenges();
      } else {
        alert("Invalid login");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChallenges = async () => {
    setIsChallengesLoading(true);
    setChallengesError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/challenges`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      if (res.ok) {
        setChallenges(await res.json());
      } else {
        setChallengesError("Failed to load squad challenges.");
      }
    } catch (e) {
      console.error(e);
      setChallengesError("Unable to load challenges right now.");
    } finally {
      setIsChallengesLoading(false);
    }
  };

  const joinTeam = async (challengeId: string, teamName: string) => {
    const key = `${challengeId}-${teamName}`;
    setJoiningTeamKey(key);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/challenges/${challengeId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("fit_token")}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ userId: user._id || user.id, teamName }),
        },
      );
      if (res.ok) {
        fetchChallenges();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Could not join team. Please try again.");
    } finally {
      setJoiningTeamKey(null);
    }
  };

  const getExerciseLabel = (c: any) => {
    const type = c.exerciseType || "squat";
    if (type === "squat") return `${c.targetSquats} Squats`;
    if (type === "pushup") return `${c.targetPushups} Pushups`;
    if (type === "mixed")
      return `${c.targetSquats} Squats + ${c.targetPushups} Pushups`;
    return "";
  };

  const cleanLabel = (value: string) =>
    (value || "")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/\s{2,}/g, " ")
      .trim();

  // ── Login ───────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-md border border-white/10 p-8 relative">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/40" />

          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-zinc-500" />
            <h2 className="font-mono text-xl sm:text-2xl font-bold text-white uppercase tracking-tighter">
              Squad Arena
            </h2>
          </div>
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-8">
            Authentication Required
          </p>

          <form onSubmit={login} className="flex flex-col gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="font-mono w-full px-4 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="font-mono w-full px-4 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
            />
            <button
              type="submit"
              className="font-mono w-full py-3 bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Login
            </button>
          </form>
          <p className="font-mono mt-6 text-xs text-zinc-500 leading-relaxed">
            Demo users: vishal, arjun, priya, rahul
            <br />
            Password: password123
          </p>
        </div>
      </div>
    );
  }

  // ── Logged In ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8" id="feature-2-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 sm:mb-20">
          <div className="max-w-3xl">
            <span className="font-mono inline-block mb-4 px-4 py-1.5 border border-white/20 text-white text-sm font-bold tracking-widest uppercase">
              Competitive Zone
            </span>
            <h1 className="font-mono text-4xl sm:text-7xl font-bold text-white uppercase tracking-tighter leading-[0.9] mb-6">
              Squad <br />
              <span className="text-zinc-500">Arena</span>
            </h1>
            <p className="font-mono text-sm sm:text-lg text-zinc-400 uppercase tracking-widest leading-relaxed">
              Welcome back, {user.username}. Engage in high-intensity squad challenges or maintain your streak in the solo zone.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap lg:mb-2">
            <Link
              href="/feature2/leaderboard"
              className="font-mono text-xs font-bold text-white border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all uppercase tracking-widest no-underline flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" /> Board
            </Link>
            <Link
              href="/feature2/shop"
              className="font-mono text-xs font-bold text-white border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all uppercase tracking-widest no-underline flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Shop
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("fit_token");
                setUser(null);
              }}
              className="font-mono text-xs font-bold text-rose-500 border border-rose-500/30 px-6 py-3 hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest cursor-pointer bg-transparent flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Individual Workout Banner */}
        <div className="border border-white/10 bg-white/5 p-8 sm:p-12 mb-16 sm:mb-20 relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/30" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/30" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Dumbbell className="w-6 h-6 text-zinc-400" />
                <h2 className="font-mono text-2xl sm:text-3xl font-bold text-white uppercase tracking-tighter">Individual Training</h2>
              </div>
              <p className="font-mono text-sm sm:text-lg text-zinc-500 leading-relaxed uppercase tracking-wide">
                Not in the mood for team battles? Access the AI-powered solo zone to track squats and pushups at your own pace.
              </p>
            </div>
            <Link
              href="/feature2/solo"
              className="font-mono text-sm font-bold text-black bg-white px-8 py-5 hover:bg-zinc-200 transition-all uppercase tracking-widest no-underline flex items-center gap-2 shrink-0 group-hover:scale-105"
            >
              Start Solo Session <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {isChallengesLoading && (
          <div className="border border-white/10 p-12 text-center">
            <p className="font-mono text-sm text-zinc-500 uppercase tracking-widest">Loading challenges</p>
          </div>
        )}

        {!isChallengesLoading && challengesError && (
          <div className="border border-rose-300/20 bg-rose-500/5 p-8 text-center">
            <p className="font-mono text-xs sm:text-sm text-rose-200 uppercase tracking-wider mb-4">
              {challengesError}
            </p>
            <button
              onClick={fetchChallenges}
              className="font-mono text-xs font-bold border border-white/20 text-white px-4 py-2 uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isChallengesLoading && !challengesError && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {challenges.map((c) => {
              const redTeam = c?.teams?.[0];
              const blueTeam = c?.teams?.[1];
              if (!redTeam || !blueTeam) return null;

              const userId = user._id || user.id;
              const isInRed = redTeam.members.find(
                (m: any) => m._id === userId || m === userId,
              );
              const isInBlue = blueTeam.members.find(
                (m: any) => m._id === userId || m === userId,
              );
              const isParticipant = isInRed || isInBlue;

              return (
                <div
                  key={c._id}
                  className="border border-white/10 bg-white/5 p-8 sm:p-12 relative group hover:border-white/25 transition-colors min-h-[450px] flex flex-col"
                >
                  {/* Corner decorative accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/20" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />

                  <div className="flex justify-between items-start mb-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center border border-white/15 text-zinc-300 bg-white/3">
                      <Swords className="h-5 w-5" />
                    </div>
                    <span
                      className={`font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border ${
                        c.status === "active"
                          ? "border-white/20 text-white/70"
                          : c.status === "completed"
                            ? "border-white/10 text-zinc-500"
                            : "border-white/15 text-zinc-400"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="mb-auto">
                    <h3 className="font-mono text-3xl sm:text-4xl font-bold text-white uppercase tracking-tighter leading-tight mb-4">
                      {cleanLabel(c.title)}
                    </h3>
                    <div className="font-mono text-sm text-zinc-400 mb-8 max-w-md leading-relaxed">
                      Squad up for the <span className="text-white">{getExerciseLabel(c)}</span> challenge. 
                      Collaborate with teammates to hit the target first.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="border border-white/10 p-5 bg-white/2">
                      <h4 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        Team Red
                      </h4>
                      <p className="font-mono text-sm text-white font-bold flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> {redTeam.members.length}
                      </p>
                      {!isParticipant && c.status === "upcoming" && (
                        <button
                          onClick={() => joinTeam(c._id, "Red")}
                          disabled={joiningTeamKey !== null}
                          className="mt-4 font-mono text-xs font-bold text-black bg-white px-4 py-2 hover:bg-zinc-200 transition-colors uppercase tracking-wider cursor-pointer w-full"
                        >
                          {joiningTeamKey === `${c._id}-Red`
                            ? "Joining..."
                            : "Join Red"}
                        </button>
                      )}
                    </div>
                    <div className="border border-white/10 p-5 bg-white/2">
                      <h4 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        Team Blue
                      </h4>
                      <p className="font-mono text-sm text-white font-bold flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> {blueTeam.members.length}
                      </p>
                      {!isParticipant && c.status === "upcoming" && (
                        <button
                          onClick={() => joinTeam(c._id, "Blue")}
                          disabled={joiningTeamKey !== null}
                          className="mt-4 font-mono text-xs font-bold text-black bg-white px-4 py-2 hover:bg-zinc-200 transition-colors uppercase tracking-wider cursor-pointer w-full"
                        >
                          {joiningTeamKey === `${c._id}-Blue`
                            ? "Joining..."
                            : "Join Blue"}
                        </button>
                      )}
                    </div>
                  </div>

                  {isParticipant && (
                    <Link
                      href={`/feature2/${c._id}`}
                      className="font-mono block w-full text-center bg-white text-black py-4 font-bold text-base uppercase tracking-widest hover:bg-zinc-200 transition-colors no-underline"
                    >
                      Enter Arena <ChevronRight className="w-4 h-4 inline" />
                    </Link>
                  )}
                </div>
              );
            })}
            {/* Placeholder / Upcoming Arena Cards to fill the screen if needed */}
            {challenges.length < 4 && Array.from({ length: 4 - challenges.length }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="border border-white/5 bg-white/[0.02] p-8 sm:p-12 relative opacity-30 min-h-[450px] flex flex-col justify-center items-center text-center group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10" />
                
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center border border-white/5 text-zinc-500">
                  <Swords className="h-5 w-5 opacity-20" />
                </div>
                <h3 className="font-mono text-xl font-bold text-zinc-700 uppercase tracking-widest mb-2">
                  Scanning...
                </h3>
                <p className="font-mono text-[10px] text-zinc-800 uppercase tracking-[0.2em]">
                  Next Arena Initializing
                </p>
                
                {/* Decorative scanning line effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent h-1/2 w-full -translate-y-full group-hover:animate-scan" />
              </div>
            ))}
          </div>
        )}

        {!isChallengesLoading && !challengesError && challenges.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`empty-placeholder-${i}`}
                className="border border-white/5 bg-white/[0.01] p-12 relative min-h-[450px] flex flex-col justify-center items-center text-center"
              >
                <Swords className="h-8 w-8 text-zinc-800 mb-6" />
                <p className="font-mono text-xs text-zinc-600 uppercase tracking-[0.3em]">
                  No Active Battles
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
