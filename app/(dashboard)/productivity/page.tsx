"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Zap, Trophy, TrendingUp, CheckCircle2, Flame, Medal } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

interface ProductivityData {
  totalCompleted: number;
  currentStreak: number;
  dailyTrend: Array<{ date: string; completed: number }>;
  leaderboard: Array<{
    rank: number;
    user: { id: string; name: string; email: string };
    tasksCompleted: number;
  }>;
}

export default function ProductivityPage() {
  const [data, setData] = useState<ProductivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/productivity")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-secondary rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-32 bg-secondary rounded-2xl" />
          <div className="h-32 bg-secondary rounded-2xl" />
        </div>
        <div className="h-64 bg-secondary rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Failed to load productivity data.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          <Zap className="h-7 w-7 text-accent" />
          Productivity Hub
        </h1>
        <p className="text-muted-foreground">
          Track your progress, build streaks, and see how you rank among the team.
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="clay-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-6 -top-6 h-32 w-32 bg-primary/20 blur-3xl rounded-full" />
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-4xl font-black gradient-text mb-1">
                {data.totalCompleted}
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Total Tasks Completed
              </p>
            </div>
          </div>
        </div>

        <div className="clay-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-orange-500/20 blur-3xl rounded-full" />
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-4xl font-black gradient-text-warm mb-1">
                {data.currentStreak} <span className="text-lg text-muted-foreground">Days</span>
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Current Activity Streak
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 clay-card rounded-2xl p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            7-Day Activity Trend
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyTrend} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30,20,50,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px', 
                    color: '#fff',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ color: '#8EEBFF', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  name="Tasks Completed"
                  stroke="#8EEBFF" 
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#8EEBFF', strokeWidth: 2, stroke: '#1e1432' }}
                  activeDot={{ r: 6, fill: '#A66CFF', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="clay-card rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-amber-400" />
            Weekly Top Performers
          </h2>
          
          {data.leaderboard.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-60">
               <Medal className="h-12 w-12 mb-2" />
               <p>No tasks completed this week</p>
             </div>
          ) : (
            <div className="space-y-4 flex-1">
              {data.leaderboard.map((entry) => (
                <div 
                  key={entry.user.id} 
                  className="flex items-center gap-4 p-3 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all duration-300"
                >
                  <div className={`
                    h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${entry.rank === 1 ? 'bg-amber-400 text-amber-950 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 
                      entry.rank === 2 ? 'bg-slate-300 text-slate-800' : 
                      entry.rank === 3 ? 'bg-amber-700 text-white' : 
                      'bg-secondary text-foreground'}
                  `}>
                    {entry.rank}
                  </div>
                  
                  <Avatar name={entry.user.name} size="md" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{entry.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{entry.user.email}</p>
                  </div>
                  
                  <Badge variant="purple" className="px-3 py-1 text-sm font-bold">
                    {entry.tasksCompleted}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
