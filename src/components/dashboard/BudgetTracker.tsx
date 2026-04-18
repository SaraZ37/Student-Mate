import { useState } from "react";
import { useBudget } from "@/hooks/useBudget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet, Plus, TrendingDown, TrendingUp, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BudgetTracker() {
  const {
    categories,
    expenses,
    monthlyBudget,
    loading,
    updateMonthlyBudget,
    addExpense,
    deleteExpense,
    totalSpent,
    remaining,
    expensesByCategory,
  } = useBudget();

  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddExpense = () => {
    if (expenseDesc && expenseAmount) {
      addExpense(expenseCategory || null, expenseDesc, parseFloat(expenseAmount));
      setExpenseDesc("");
      setExpenseAmount("");
      setExpenseCategory("");
      setDialogOpen(false);
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
            <div className="gradient-primary p-2 rounded-xl">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle className="text-lg font-semibold">Budget Tracker</CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="What did you spend on?"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (SEK)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full gradient-primary" onClick={handleAddExpense}>
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Monthly Budget</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onBlur={() => updateMonthlyBudget(parseFloat(budgetInput) || 0)}
                className="h-8 text-lg font-bold p-1"
              />
              <span className="text-sm text-muted-foreground">SEK</span>
            </div>
          </div>
          <div
            className={cn(
              "p-3 rounded-xl",
              remaining >= 0 ? "bg-success/10" : "bg-destructive/10"
            )}
          >
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p
              className={cn(
                "text-lg font-bold flex items-center gap-1",
                remaining >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {remaining >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {remaining.toLocaleString()} SEK
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Spending by Category</p>
          <div className="grid grid-cols-2 gap-2">
            {expensesByCategory.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                style={{ borderLeft: `3px solid ${cat.color}` }}
              >
                <span className="text-lg">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{cat.name}</p>
                  <p className="text-sm font-semibold">{cat.total.toLocaleString()} SEK</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Recent Expenses</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No expenses yet this month
              </p>
            ) : (
              expenses.slice(0, 5).map((expense) => {
                const cat = categories.find((c) => c.id === expense.category_id);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 group"
                  >
                    <div className="flex items-center gap-2">
                      <span>{cat?.emoji || "💰"}</span>
                      <span className="text-sm">{expense.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        -{expense.amount.toLocaleString()} SEK
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
