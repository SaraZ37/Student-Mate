import { useState } from "react";
import { useChecklist } from "@/hooks/useChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Plus, Trash2, ClipboardList, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MovingChecklist() {
  const { items, loading, toggleItem, addItem, deleteItem, completedCount, totalCount } =
    useChecklist();
  const [newItem, setNewItem] = useState("");

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAdd = () => {
    if (newItem.trim()) {
      addItem(newItem);
      setNewItem("");
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="gradient-secondary p-2 rounded-xl">
              <ClipboardList className="h-5 w-5 text-secondary-foreground" />
            </div>
            <CardTitle className="text-lg font-semibold">Moving Checklist</CardTitle>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {completedCount}/{totalCount} done
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          {progress === 100 && (
            <p className="text-sm text-success font-medium flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> All tasks completed!
            </p>
          )}
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all group",
                item.completed ? "bg-success/10" : "bg-muted/50 hover:bg-muted"
              )}
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
                className={cn(
                  "transition-all",
                  item.completed && "animate-check-bounce data-[state=checked]:bg-success data-[state=checked]:border-success"
                )}
              />
              <span
                className={cn(
                  "flex-1 text-sm transition-all",
                  item.completed && "line-through text-muted-foreground"
                )}
              >
                {item.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Input
            placeholder="Add new task..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1"
          />
          <Button onClick={handleAdd} size="icon" className="gradient-primary shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
