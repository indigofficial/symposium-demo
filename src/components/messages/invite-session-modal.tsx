import { useAppStore } from "../../lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Calendar, Radio } from "lucide-react";
import { format } from "date-fns";
import { toast } from "../../hooks/use-toast";

interface InviteSessionModalProps {
  conversationId: string;
  recipientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteSessionModal({ conversationId, recipientName, open, onOpenChange }: InviteSessionModalProps) {
  const { sessions, currentUser, inviteToSession } = useAppStore();
  if (!currentUser) return null;

  const mySessions = sessions.filter(
    s => s.hostId === currentUser.id && (s.status === "active" || s.status === "scheduled")
  );

  const handleInvite = (sessionId: string, title: string) => {
    inviteToSession(conversationId, sessionId, currentUser.id);
    toast({ title: "Invitation sent", description: `Invited ${recipientName} to "${title}".` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Invite to Session</DialogTitle>
          <DialogDescription>
            Choose one of your sessions to invite {recipientName} to.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[360px] -mx-6 px-6">
          {mySessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              You aren't hosting any sessions right now. Host a session first to invite others.
            </div>
          ) : (
            <div className="space-y-2 py-1">
              {mySessions.map(s => (
                <div key={s.id} className="border rounded-lg p-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{s.title}</p>
                        <Badge variant="secondary" className="font-mono text-[10px]">{s.unitCode}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {s.status === "active" ? (
                          <><Radio className="w-3 h-3 text-green-500" /> Live now</>
                        ) : (
                          <><Calendar className="w-3 h-3" /> {s.scheduledFor ? format(new Date(s.scheduledFor), "MMM d, h:mm a") : "Scheduled"}</>
                        )}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleInvite(s.id, s.title)}>Invite</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
