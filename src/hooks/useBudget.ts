import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface BudgetCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface Expense {
  id: string;
  category_id: string | null;
  description: string;
  amount: number;
  date: string;
}

const DEFAULT_CATEGORIES = [
  { name: "Rent", emoji: "🏠", color: "#8b5cf6" },
  { name: "Food & Groceries", emoji: "🍕", color: "#f97316" },
  { name: "Transport", emoji: "🚇", color: "#0ea5e9" },
  { name: "Phone & Internet", emoji: "📱", color: "#10b981" },
  { name: "Entertainment", emoji: "🎉", color: "#ec4899" },
  { name: "Study Materials", emoji: "📚", color: "#6366f1" },
];

export function useBudget() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch categories
    const { data: catData, error: catError } = await supabase
      .from("budget_categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (catError) {
      toast({ variant: "destructive", title: "Error", description: catError.message });
      return;
    }

    if (catData.length === 0) {
      // Initialize with default categories
      const defaultCats = DEFAULT_CATEGORIES.map((cat) => ({
        user_id: user.id,
        ...cat,
      }));

      const { data: newCats, error: insertError } = await supabase
        .from("budget_categories")
        .insert(defaultCats)
        .select();

      if (insertError) {
        toast({ variant: "destructive", title: "Error", description: insertError.message });
      } else if (newCats) {
        setCategories(newCats);
      }
    } else {
      setCategories(catData);
    }

    // Fetch expenses for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: expData, error: expError } = await supabase
      .from("expenses")
      .select("*")
      .gte("date", startOfMonth.toISOString().slice(0, 10))
      .order("date", { ascending: false });

    if (expError) {
      toast({ variant: "destructive", title: "Error", description: expError.message });
    } else if (expData) {
      setExpenses(expData.map(e => ({ ...e, amount: Number(e.amount) })));
    }

    // Fetch monthly budget
    const { data: budgetData } = await supabase
      .from("monthly_budgets")
      .select("*")
      .eq("month", currentMonth)
      .single();

    if (budgetData) {
      setMonthlyBudget(Number(budgetData.amount));
    }

    setLoading(false);
  };

  const updateMonthlyBudget = async (amount: number) => {
    if (!user) return;

    const { error } = await supabase
      .from("monthly_budgets")
      .upsert({ user_id: user.id, month: currentMonth, amount }, { onConflict: "user_id,month" });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    setMonthlyBudget(amount);
    toast({ title: "Budget updated!" });
  };

  const addExpense = async (categoryId: string | null, description: string, amount: number) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        category_id: categoryId,
        description,
        amount,
        date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    if (data) {
      setExpenses([{ ...data, amount: Number(data.amount) }, ...expenses]);
      toast({ title: "Expense added!" });
    }
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const addCategory = async (name: string, emoji: string, color: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("budget_categories")
      .insert({ user_id: user.id, name, emoji, color })
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    if (data) {
      setCategories([...categories, data]);
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = monthlyBudget - totalSpent;

  const expensesByCategory = categories.map((cat) => ({
    ...cat,
    total: expenses.filter((e) => e.category_id === cat.id).reduce((sum, e) => sum + e.amount, 0),
  }));

  return {
    categories,
    expenses,
    monthlyBudget,
    loading,
    updateMonthlyBudget,
    addExpense,
    deleteExpense,
    addCategory,
    totalSpent,
    remaining,
    expensesByCategory,
  };
}
