"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dumbbell, ChevronRight } from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  category: string;
  tracking: "ai" | "manual";
  description: string;
};

const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: "squat",
    name: "Squats",
    category: "lower-body",
    tracking: "ai",
    description: "AI-tracked lower-body strength builder.",
  },
  {
    id: "pushup",
    name: "Push-ups",
    category: "upper-body",
    tracking: "ai",
    description: "AI-tracked upper-body strength and core.",
  },
  {
    id: "jumping_jack",
    name: "Jumping Jacks",
    category: "cardio",
    tracking: "manual",
    description: "Simple cardio warm-up and stamina booster.",
  },
  {
    id: "burpee",
    name: "Burpees",
    category: "full-body",
    tracking: "manual",
    description: "High intensity full-body conditioning.",
  },
  {
    id: "lunge",
    name: "Lunges",
    category: "lower-body",
    tracking: "manual",
    description: "Leg strength, control, and stability work.",
  },
  {
    id: "plank",
    name: "Plank",
    category: "core",
    tracking: "manual",
    description: "Timed core stability hold.",
  },
  {
    id: "mountain_climber",
    name: "Mountain Climbers",
    category: "cardio-core",
    tracking: "manual",
    description: "Core + cardio movement for fast pacing.",
  },
];

export default function SoloWorkoutsPage() {
  const [exercises, setExercises] = useState<Exercise[]>(FALLBACK_EXERCISES);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/workouts/exercises`,
          {
            headers: { "ngrok-skip-browser-warning": "true" },
          },
        );

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setExercises(data);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadExercises();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 pt-24 pb-14">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/feature2"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold text-zinc-300 border border-white/15 px-4 py-2 uppercase tracking-widest hover:text-white hover:border-white/35 transition-colors no-underline mb-8"
        >
          Back to Challenges
        </Link>

        <div className="w-full text-center mb-8 sm:mb-10 border border-white/10 bg-white/3 p-6 sm:p-7">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center border border-white/15 text-zinc-300">
            <Dumbbell className="h-5 w-5" />
          </div>
          <h1 className="font-mono text-2xl sm:text-4xl font-bold uppercase tracking-tight">
            Individual Workouts
          </h1>
          <p className="font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed mt-3 mx-auto max-w-2xl">
            Choose any exercise and train solo. Squats and push-ups use AI
            camera tracking, while the others use quick manual logging.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/feature2/solo/${exercise.id}`}
              className="no-underline text-inherit border border-white/10 bg-white/3 p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-base font-bold uppercase tracking-tight text-white m-0">
                  {exercise.name}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-white/15 text-zinc-400">
                  {exercise.tracking}
                </span>
              </div>

              <p className="m-0 font-mono text-xs text-zinc-400 leading-relaxed">
                {exercise.description}
              </p>

              <div className="flex justify-between items-center mt-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  {exercise.category}
                </span>
                <span className="font-mono text-xs text-zinc-200 font-bold inline-flex items-center gap-1">
                  Start <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
