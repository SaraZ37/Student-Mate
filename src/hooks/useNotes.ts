import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  subject_id: string;
  title: string;
  content: string | null;
  updated_at: string;
}

export function useNotes() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const { data: subData, error: subError } = await supabase
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: true });

    if (subError) {
      toast({ variant: "destructive", title: "Error", description: subError.message });
      return;
    }

    setSubjects(subData || []);

    const { data: noteData, error: noteError } = await supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false });

    if (noteError) {
      toast({ variant: "destructive", title: "Error", description: noteError.message });
    } else {
      setNotes(noteData || []);
    }

    setLoading(false);
  };

  const addSubject = async (name: string, color: string) => {
    if (!user || !name.trim()) return;

    const { data, error } = await supabase
      .from("subjects")
      .insert({ user_id: user.id, name: name.trim(), color })
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    if (data) {
      setSubjects([...subjects, data]);
      toast({ title: "Subject added!" });
    }
  };

  const deleteSubject = async (id: string) => {
    const { error } = await supabase.from("subjects").delete().eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    setSubjects(subjects.filter((s) => s.id !== id));
    setNotes(notes.filter((n) => n.subject_id !== id));
  };

  const addNote = async (subjectId: string, title: string) => {
    if (!user || !title.trim()) return;

    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: user.id, subject_id: subjectId, title: title.trim(), content: "" })
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    if (data) {
      setNotes([data, ...notes]);
    }
  };

  const updateNote = async (id: string, title: string, content: string) => {
    const { error } = await supabase
      .from("notes")
      .update({ title, content })
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    setNotes(notes.map((n) => (n.id === id ? { ...n, title, content } : n)));
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    setNotes(notes.filter((n) => n.id !== id));
  };

  return {
    subjects,
    notes,
    loading,
    addSubject,
    deleteSubject,
    addNote,
    updateNote,
    deleteNote,
  };
}
