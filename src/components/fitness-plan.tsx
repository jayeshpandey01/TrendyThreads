"use client";

import { 
  Dumbbell, 
  Utensils, 
  Droplets, 
  Moon, 
  Flame, 
  Activity,
  Calendar,
  ChevronRight,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FitnessPlan() {
  const workoutPlan = [
    {
      day: "Monday",
      focus: "Chest and Triceps",
      exercises: [
        { name: "Barbell bench press", sets: "3", reps: "8-12" },
        { name: "Incline dumbbell press", sets: "3", reps: "10-15" },
        { name: "Cable flyes", sets: "3", reps: "12-15" },
        { name: "Tricep pushdowns", sets: "3", reps: "10-12" },
      ]
    },
    {
      day: "Tuesday",
      focus: "Back and Biceps",
      exercises: [
        { name: "Pull-ups or lat pulldowns", sets: "3", reps: "8-12" },
        { name: "Barbell rows", sets: "3", reps: "8-12" },
        { name: "Dumbbell curls", sets: "3", reps: "10-12" },
        { name: "Hammer curls", sets: "3", reps: "10-12" },
      ]
    },
    {
      day: "Thursday",
      focus: "Legs",
      exercises: [
        { name: "Squats", sets: "3", reps: "8-12" },
        { name: "Leg press", sets: "3", reps: "10-12" },
        { name: "Lunges", sets: "3", reps: "10-12 per leg" },
        { name: "Calf raises", sets: "3", reps: "12-15" },
      ]
    },
    {
      day: "Friday",
      focus: "Shoulders and Abs",
      exercises: [
        { name: "Dumbbell shoulder press", sets: "3", reps: "8-12" },
        { name: "Lateral raises", sets: "3", reps: "10-12" },
        { name: "Planks", sets: "3", reps: "30-60s" },
        { name: "Russian twists", sets: "3", reps: "10-12" },
      ]
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Target Deficit", value: "500-1000", unit: "kcal", icon: Flame, color: "text-orange-500" },
          { label: "Protein Goal", value: "80-100", unit: "g/day", icon: Activity, color: "text-blue-500" },
          { label: "Sleep Target", value: "7-9", unit: "hours", icon: Moon, color: "text-purple-500" },
          { label: "Hydration", value: "Plenty", unit: "water", icon: Droplets, color: "text-cyan-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-neon-lime/30 transition-colors group">
            <div className={`p-3 rounded-2xl bg-white/5 w-fit mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</div>
            <div className="text-2xl font-black mt-1">
              {stat.value} <span className="text-sm font-normal text-white/20">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Diet & Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-lime/10 rounded-xl">
              <Utensils className="w-5 h-5 text-neon-lime" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase italic">Macro <span className="text-neon-lime">Balance</span></h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-[#111] border-white/5 hover:border-white/10 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black">P</div>
                  <div>
                    <div className="font-bold">Protein</div>
                    <div className="text-xs text-white/40">Muscle mass & satiety</div>
                  </div>
                </div>
                <div className="text-lg font-black text-blue-500">80-100g</div>
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-white/5 hover:border-white/10 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-black">C</div>
                  <div>
                    <div className="font-bold">Carbohydrates</div>
                    <div className="text-xs text-white/40">Whole grains & fruits</div>
                  </div>
                </div>
                <div className="text-lg font-black text-orange-500">Complex</div>
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-white/5 hover:border-white/10 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 font-black">F</div>
                  <div>
                    <div className="font-bold">Healthy Fats</div>
                    <div className="text-xs text-white/40">Seeds, Nuts, Avocados</div>
                  </div>
                </div>
                <div className="text-lg font-black text-green-500">Essential</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-lime/10 rounded-xl">
              <Calendar className="w-5 h-5 text-neon-lime" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase italic">Sample <span className="text-neon-lime">Meal Plan</span></h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Utensils className="w-16 h-16" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-neon-lime mb-2">Breakfast (300 kcal)</div>
              <h3 className="text-xl font-bold mb-3">Overnight Oats</h3>
              <ul className="grid grid-cols-2 gap-2 text-sm text-white/40">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-neon-lime" /> 1/2 cup rolled oats</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-neon-lime" /> Almond milk</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-neon-lime" /> Chia seeds</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-neon-lime" /> Mixed berries</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 group">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Mid-Morning Snack (150 kcal)</div>
              <h3 className="text-xl font-bold">Apple & Peanut Butter</h3>
              <p className="text-sm text-white/40 italic">"Focus on long-term lifestyle changes."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Plan */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-lime/10 rounded-xl">
              <Dumbbell className="w-5 h-5 text-neon-lime" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase italic">Training <span className="text-neon-lime">Program</span></h2>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            150 min / Week
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workoutPlan.map((session, i) => (
            <Card key={i} className="bg-[#111] border-white/5 hover:border-neon-lime/20 transition-all overflow-hidden group">
              <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-neon-lime">{session.day}</div>
                  <CardTitle className="text-xl font-black">{session.focus}</CardTitle>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-neon-lime group-hover:text-black transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {session.exercises.map((ex, j) => (
                    <div key={j} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="font-medium text-sm">{ex.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded">
                        {ex.sets} x {ex.reps}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Final Note */}
      <div className="bg-gradient-to-br from-neon-lime/20 to-transparent border border-neon-lime/20 p-8 rounded-[3rem] text-center space-y-4">
        <h3 className="text-2xl font-black italic uppercase">Safe & <span className="text-neon-lime">Sustainable</span></h3>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed">
          A safe and sustainable rate of weight loss is 1-2 pounds per week. 
          Focus on making long-term lifestyle changes rather than quick fixes. 
          Consult a professional before starting any new supplement routine.
        </p>
      </div>
    </div>
  );
}
