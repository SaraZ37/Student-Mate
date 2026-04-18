import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUBJECT_COLORS = [
  "#8b5cf6",
  "#0ea5e9",
  "#10b981",
  "#f97316",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
];

export function StudyNotes() {
  const {
    subjects,
    notes,
    loading,
    addSubject,
    deleteSubject,
    addNote,
    updateNote,
    deleteNote,
  } = useNotes();

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState(SUBJECT_COLORS[0]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  const currentSubject = subjects.find((s) => s.id === selectedSubject);
  const currentNote = notes.find((n) => n.id === selectedNote);
  const subjectNotes = notes.filter((n) => n.subject_id === selectedSubject);

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      addSubject(newSubjectName, newSubjectColor);
      setNewSubjectName("");
      setNewSubjectColor(SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)]);
      setDialogOpen(false);
    }
  };

  const handleAddNote = () => {
    if (newNoteTitle.trim() && selectedSubject) {
      addNote(selectedSubject, newNoteTitle);
      setNewNoteTitle("");
      setNoteDialogOpen(false);
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

  // Note editing view
  if (selectedNote && currentNote) {
    return (
      <Card className="glass-card animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedNote(null)}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Input
              value={currentNote.title}
              onChange={(e) => updateNote(currentNote.id, e.target.value, currentNote.content || "")}
              className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={currentNote.content || ""}
            onChange={(e) => updateNote(currentNote.id, currentNote.title, e.target.value)}
            placeholder="Start writing your notes..."
            className="min-h-[300px] resize-none"
          />
        </CardContent>
      </Card>
    );
  }

  // Subject notes view
  if (selectedSubject && currentSubject) {
    return (
      <Card className="glass-card animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSubject(null)}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentSubject.color }}
              />
              <CardTitle className="text-lg font-semibold">{currentSubject.name}</CardTitle>
            </div>
            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary">
                  <Plus className="h-4 w-4 mr-1" /> Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Note Title</Label>
                    <Input
                      placeholder="Lecture 1, Chapter Summary..."
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                    />
                  </div>
                  <Button className="w-full gradient-primary" onClick={handleAddNote}>
                    Create Note
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {subjectNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notes yet</p>
              <p className="text-sm">Add your first note to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {subjectNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer group transition-colors"
                  onClick={() => setSelectedNote(note.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {note.content?.slice(0, 50) || "Empty note"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Subjects list view
  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-success p-2 rounded-xl">
              <BookOpen className="h-5 w-5 text-success-foreground" />
            </div>
            <CardTitle className="text-lg font-semibold">Study Notes</CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary">
                <Plus className="h-4 w-4 mr-1" /> Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Subject</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input
                    placeholder="Math 101, Swedish Language..."
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {SUBJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-8 h-8 rounded-full transition-transform",
                          newSubjectColor === color && "ring-2 ring-offset-2 ring-primary scale-110"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewSubjectColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <Button className="w-full gradient-primary" onClick={handleAddSubject}>
                  Create Subject
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No subjects yet</p>
            <p className="text-sm">Add your first subject to organize your notes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {subjects.map((subject) => {
              const noteCount = notes.filter((n) => n.subject_id === subject.id).length;
              return (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer group transition-colors"
                  style={{ borderLeft: `4px solid ${subject.color}` }}
                  onClick={() => setSelectedSubject(subject.id)}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {noteCount} {noteCount === 1 ? "note" : "notes"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSubject(subject.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
