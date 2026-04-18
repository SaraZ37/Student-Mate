import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

const DEFAULT_ITEMS = [
  "Get Swedish personal insurance (Försäkringskassan)",
  "Set up home internet connection",
  "Register address change (Skatteverket)",
  "Get a Swedish bank account",
  "Register at the university",
  "Get a student ID card",
];

export function useChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("checklist_items")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    if (data.length === 0) {
      // Initialize with default items
      const defaultItems = DEFAULT_ITEMS.map((title) => ({
        user_id: user.id,
        title,
        completed: false,
      }));

      const { data: newItems, error: insertError } = await supabase
        .from("checklist_items")
        .insert(defaultItems)
        .select();

      if (insertError) {
        toast({ variant: "destructive", title: "Error", description: insertError.message });
      } else if (newItems) {
        setItems(newItems);
      }
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  const toggleItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const { error } = await supabase
      .from("checklist_items")
      .update({ completed: !item.completed })
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    setItems(items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)));
  };

  const addItem = async (title: string) => {
    if (!user || !title.trim()) return;

    const { data, error } = await supabase
      .from("checklist_items")
      .insert({ user_id: user.id, title: title.trim(), completed: false })
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    if (data) {
      setItems([...items, data]);
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("checklist_items").delete().eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    setItems(items.filter((i) => i.id !== id));
  };

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;

  return { items, loading, toggleItem, addItem, deleteItem, completedCount, totalCount };
}
