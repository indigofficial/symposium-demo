import { useState } from "react";
import { useAppStore } from "../../lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Check, UserPlus } from "lucide-react";
import { toast } from "../../hooks/use-toast";

interface InviteFriendsModalProps {
  sessionId: string;
  sessionTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteFriendsModal({ sessionId, sessionTitle, open, onOpenChange }: InviteFriendsModalProps) {
  const { currentUser, users, inviteFriendsToSession } = useAppStore();
  const [invited, setInvited] = useState<string[]>([]);

  if (!currentUser) return null;

  const friends = (currentUser.friends || [])
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => !!u);

  const handleInvite = (friendId: string, name: string) => {
    inviteFriendsToSession(sessionId, [friendId], currentUser.id);
    setInvited((prev) => [...prev, friendId]);
    toast({ title: "Invitation sent", description: `Invited ${name} to "${sessionTitle}".` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Invite to Session</DialogTitle>
          <DialogDescription>
            Invite friends to join "{sessionTitle}".
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[360px] -mx-6 px-6">
          {friends.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              You don't have any friends yet. Add some from the Network tab.
            </div>
          ) : (
            <div className="space-y-2 py-1">
              {friends.map((f) => {
                const alreadyInvited = invited.includes(f.id);
                return (
                  <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg border hover:bg-muted/40 transition-colors">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={f.avatar} />
                      <AvatarFallback>{f.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.firstName} {f.lastName}</p>
                      <p className="text-xs text-muted-foreground">Lv {f.level}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={alreadyInvited ? "secondary" : "default"}
                      disabled={alreadyInvited}
                      onClick={() => handleInvite(f.id, f.firstName)}
                      data-testid={`button-invite-friend-${f.id}`}
                    >
                      {alreadyInvited ? (
                        <><Check className="w-3.5 h-3.5 mr-1.5" /> Invited</>
                      ) : (
                        <><UserPlus className="w-3.5 h-3.5 mr-1.5" /> Invite</>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
