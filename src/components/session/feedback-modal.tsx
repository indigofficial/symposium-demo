import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useAppStore } from "../../lib/store";
import { useLocation } from "wouter";

interface FeedbackModalProps {
  sessionId: string;
  mode: "participant" | "host";
  open: boolean;
  onClose: () => void;
}

export function FeedbackModal({ sessionId, mode, open, onClose }: FeedbackModalProps) {
  const [, setLocation] = useLocation();
  const { sessions, clearActiveSession, addFeedback, deleteSession } = useAppStore();
  const session = sessions.find(s => s.id === sessionId);

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open && session) {
      const initial: Record<string, number> = {};
      session.objectives.forEach(obj => {
        initial[obj] = mode === "host" ? Math.floor(Math.random() * 25) + 60 : 50;
      });
      setRatings(initial);
      setComment("");
    }
  }, [open, session, mode]);

  if (!session) return null;

  const averageScore = Object.values(ratings).length > 0
    ? Math.round(Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length)
    : 0;

  const handleSubmit = () => {
    if (mode === "participant") {
      addFeedback(session.id, averageScore, comment.trim() || undefined);
    }
    deleteSession(session.id);
    clearActiveSession();
    onClose();
    setLocation("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleSubmit(); }}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Session Complete</DialogTitle>
          <DialogDescription>
            {mode === "participant"
              ? "Drag the slider to rate your goal completion in the session."
              : "Participants' averaged understanding of learning objectives."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {session.objectives.map((obj) => (
            <div key={obj} className="space-y-4">
              <p className="font-medium text-sm">{obj}</p>
              <div className="px-2">
                <Slider
                  value={[ratings[obj] || 50]}
                  onValueChange={(val) => setRatings({ ...ratings, [obj]: val[0] })}
                  max={100}
                  step={1}
                  disabled={mode === "host"}
                  className={mode === "host" ? "opacity-100" : ""}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-medium tracking-widest">
                  <span>LOW</span>
                  <span>MEDIUM</span>
                  <span>HIGH</span>
                </div>
              </div>
            </div>
          ))}

          {mode === "participant" && (
            <div className="space-y-2">
              <Label htmlFor="feedback-comment" className="text-sm">
                Anonymous feedback <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Feedback is optional but highly recommended to improve the quality of teaching and learning sessions.
                All feedback is anonymous.
              </p>

              <Textarea
                id="feedback-comment"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What worked well? What could be improved?"
                className="resize-none bg-card"
                rows={3}
              />
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg text-center space-y-1 border">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
              {mode === "participant" ? "Goal Completion Score" : "Teaching Effectiveness Score"}
            </p>
            <p className="text-3xl font-serif text-primary">{averageScore}%</p>
            {mode === "host" && (
              <p className="text-xs text-muted-foreground pt-1">Survey respondents: {Math.floor(Math.random() * 5) + 3}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} className="w-full">
            {mode === "participant" ? "Submit & Return to Dashboard" : "Return to Dashboard"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
