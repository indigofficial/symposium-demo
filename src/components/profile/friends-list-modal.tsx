import { useAppStore } from "../../lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

interface FriendsListModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFriend?: (friendId: string) => void;
}

export function FriendsListModal({ userId, open, onOpenChange, onSelectFriend }: FriendsListModalProps) {
  const { users, currentUser } = useAppStore();
  const user = users.find(u => u.id === userId);

  if (!user || !currentUser) return null;

  const friendIds = user.friends || [];
  const myFriendIds = currentUser.friends || [];
  const isSelf = currentUser.id === user.id;

  const friends = friendIds
    .map(id => users.find(u => u.id === id))
    .filter(Boolean) as typeof users;

  const mutualCount = friends.filter(f => myFriendIds.includes(f.id)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {isSelf ? "Your Friends" : `${user.firstName}'s Friends`}
          </DialogTitle>
          <DialogDescription>
            {friends.length} friend{friends.length === 1 ? "" : "s"}
            {!isSelf && friends.length > 0 && (
              <> • {mutualCount} mutual</>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-2">
          {friends.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No friends yet.
            </p>
          ) : (
            <div className="space-y-1">
              {friends.map(f => {
                const isMutual = !isSelf && myFriendIds.includes(f.id);
                const isMe = f.id === currentUser.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onSelectFriend?.(f.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/60 transition-colors text-left"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={f.avatar} />
                      <AvatarFallback>{f.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {f.firstName} {f.lastName} {isMe && <span className="text-muted-foreground">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">Lv {f.level}</p>
                    </div>
                    {isMutual && (
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                        Mutual
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
