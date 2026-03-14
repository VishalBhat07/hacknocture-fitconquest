import Link from "next/link";
import { Mail, Globe, MessageSquare, Github, Users } from "lucide-react";

const channels = [
  {
    title: "General Support",
    detail: "help@fitconquest.app",
    note: "For account access, login issues, and bug reports.",
    icon: Mail,
  },
  {
    title: "Community",
    detail: "discord.gg/fitconquest",
    note: "Share progress, challenge friends, and get workout tips.",
    icon: Users,
  },
  {
    title: "Partnerships",
    detail: "partners@fitconquest.app",
    note: "Collaborations, events, and sponsorship opportunities.",
    icon: MessageSquare,
  },
  {
    title: "Project Hub",
    detail: "github.com/fitconquest",
    note: "Track releases, roadmap updates, and known issues.",
    icon: Github,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 pt-24 pb-14">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 sm:mb-10 flex items-center justify-between gap-4">
          <h1 className="font-mono text-2xl sm:text-4xl font-bold tracking-tight uppercase">
            Contact
          </h1>
          <Link
            href="/"
            className="font-mono text-xs font-bold text-zinc-300 border border-white/15 px-4 py-2 uppercase tracking-widest hover:text-white hover:border-white/30 transition-colors no-underline"
          >
            Home
          </Link>
        </div>

        <div className="border border-white/10 bg-white/3 p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-2 text-zinc-300">
            <Globe className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-widest">
              Response Window
            </span>
          </div>
          <p className="font-mono text-xs text-zinc-400 leading-relaxed">
            We typically respond within 24-48 hours on weekdays. Include your
            username, challenge ID, and a short issue summary so we can help
            faster.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <article
                key={channel.title}
                className="border border-white/10 p-5 hover:border-white/25 transition-colors"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center border border-white/15 text-zinc-300">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="font-mono text-sm font-bold uppercase tracking-wide mb-1">
                  {channel.title}
                </h2>
                <p className="font-mono text-xs text-white mb-2">
                  {channel.detail}
                </p>
                <p className="font-mono text-xs text-zinc-500 leading-relaxed">
                  {channel.note}
                </p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
