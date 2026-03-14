import Link from "next/link";
import {
  Activity,
  Swords,
  Camera,
  Trophy,
  ShieldCheck,
  Zap,
} from "lucide-react";

const featureCards = [
  {
    title: "Activity Conquest Map",
    desc: "Track walk and cycle sessions on a live map, capture territory with loop routes, and compare regions with other players.",
    icon: Activity,
  },
  {
    title: "Squad Challenges",
    desc: "Join Red or Blue teams, race toward challenge targets, and compete with teammates in timed fitness battles.",
    icon: Swords,
  },
  {
    title: "AI Exercise Tracking",
    desc: "Use camera-based squat and push-up detection for cleaner rep counting, real-time posture cues, and reliable session logs.",
    icon: Camera,
  },
  {
    title: "Live Leaderboards",
    desc: "Rank users by area, distance, and time. Switch daily, weekly, monthly, or overall filters in one place.",
    icon: Trophy,
  },
  {
    title: "Shielded Territories",
    desc: "Top performers secure controlled zones with timed shields, preventing easy takeovers and rewarding consistency.",
    icon: ShieldCheck,
  },
  {
    title: "Solo Workouts",
    desc: "Train independently with AI and manual exercise modes, then save your output to build personal momentum.",
    icon: Zap,
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 pt-24 pb-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 sm:mb-10 flex items-center justify-between gap-4">
          <h1 className="font-mono text-2xl sm:text-4xl font-bold tracking-tight uppercase">
            Features
          </h1>
          <Link
            href="/"
            className="font-mono text-xs font-bold text-zinc-300 border border-white/15 px-4 py-2 uppercase tracking-widest hover:text-white hover:border-white/30 transition-colors no-underline"
          >
            Home
          </Link>
        </div>

        <p className="font-mono text-sm text-zinc-400 max-w-3xl mb-8 sm:mb-10 leading-relaxed">
          FitConquest blends geospatial exploration, team competition, and
          AI-assisted workout tracking into one fitness game loop. Use the map
          for territory play, join squads for challenges, and keep training
          streaks alive with solo routines.
        </p>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="border border-white/10 bg-white/3 p-5 sm:p-6 hover:border-white/25 transition-colors"
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center border border-white/15 text-zinc-300">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="font-mono text-base font-bold uppercase tracking-wide mb-2">
                  {card.title}
                </h2>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                  {card.desc}
                </p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
