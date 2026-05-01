import { useAppStore } from "../../lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Star } from "lucide-react";

interface SessionFeedbackListModalProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionFeedbackListModal({ sessionId, open, onOpenChange }: SessionFeedbackListModalProps) {
  const { sessions } = useAppStore();
  const session = sessions.find(s => s.id === sessionId);
  const feedbacks = session?.feedbacks || [];

  const avg = feedbacks.length > 0
    ? Math.round(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Anonymous Feedback</DialogTitle>
          <DialogDescription>
            What participants said about this session. All responses are anonymous.
          </DialogDescription>
        </DialogHeader>

        {feedbacks.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No feedback has been submitted yet.
          </div>
        ) : (
          <>
            <div className="p-4 bg-muted/40 rounded-lg text-center border">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Average Rating</p>
              <p className="text-3xl font-serif text-primary mt-1">{avg}%</p>
              <p className="text-xs text-muted-foreground mt-1">{feedbacks.length} response{feedbacks.length === 1 ? "" : "s"}</p>
            </div>

            <ScrollArea className="max-h-[300px] pr-2">
              <div className="space-y-2 py-1">
                {feedbacks.map((f) => (
                  <div key={f.id} className="border rounded-lg p-3 bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Anonymous</span>
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                        <span className="font-medium">{f.rating}%</span>
                      </span>
                    </div>
                    {f.text ? (
                      <p className="text-sm text-foreground/90 italic">"{f.text}"</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No comment.</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
