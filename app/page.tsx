import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  LayoutDashboard,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Admin and Member roles with granular permissions for projects and tasks.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    description:
      "Get an overview of all tasks, deadlines, and project progress at a glance.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Invite team members, assign roles, and collaborate seamlessly.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: CheckCircle2,
    title: "Task Tracking",
    description:
      "Create, assign, and track tasks with status, priority, and due dates.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description:
      "Instant feedback on task status changes and project milestones.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Visual progress tracking with completion rates and overdue alerts.",
    gradient: "from-indigo-500 to-violet-600",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">TaskFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              Streamline your workflow
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in stagger-1">
            Manage Projects
            <br />
            <span className="gradient-text">Like Never Before</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in stagger-2">
            Create projects, assign tasks, track progress, and collaborate
            with your team — all in one beautiful, powerful workspace.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-in stagger-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-all shadow-xl shadow-primary/25"
            >
              Start Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl border border-border text-foreground hover:bg-secondary/50 transition-all"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">ship faster</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful features designed for modern teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`
                  clay-card rounded-2xl p-6 hover:border-primary/30
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5
                  animate-fade-in stagger-${i + 1}
                `}
              >
                <div
                  className={`
                    h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient}
                    flex items-center justify-center mb-4
                    shadow-lg
                  `}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="clay-card rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 gradient-bg opacity-5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                Join thousands of teams already using TaskFlow to ship projects
                faster.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-all shadow-xl shadow-primary/25"
              >
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg gradient-bg flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold gradient-text">TaskFlow</span>
            </div>
            <p>© 2026 TaskFlow. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

