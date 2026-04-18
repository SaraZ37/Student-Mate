import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MovingChecklist } from "@/components/dashboard/MovingChecklist";
import { BudgetTracker } from "@/components/dashboard/BudgetTracker";
import { StudyNotes } from "@/components/dashboard/StudyNotes";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        <DashboardHeader />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <MovingChecklist />
            <BudgetTracker />
          </div>
          <div>
            <StudyNotes />
          </div>
        </div>
      </div>
    </div>
  );
}
