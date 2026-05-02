import { useState } from "react";
import { useAppStore } from "../../lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { Flame, Clock, MapPin, Target, AlertCircle, Lock, Globe, Twitter, Github, Linkedin, Pencil, Users } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { FriendsListModal } from "../profile/friends-list-modal";
import { EditProfileModal } from "../profile/edit-profile-modal";

interface ProfileModalProps {
  userId: string;
  mode?: "default" | "network";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ userId, mode = "default", open, onOpenChange }: ProfileModalProps) {
  const { users, currentUser, getMatchPercentage, sendMatchRequest, blockUser } = useAppStore();
  const user = users.find(u => u.id === userId);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [nestedProfileId, setNestedProfileId] = useState<string | null>(null);

  if (!user || !currentUser) return null;

  const matchPercent = getMatchPercentage(user.id);

  const sharedUnits = (currentUser.units || []).filter(unit =>
  (user.units || []).includes(unit)
  );

  const sharedStudyTimes = (currentUser.studyTimes || []).filter(time =>
    (user.studyTimes || []).includes(time)
  );

  const currentGoalWords = (currentUser.goal || "").toLowerCase().split(" ");
  const otherGoalWords = (user.goal || "").toLowerCase().split(" ");
  const sharedGoalWords = currentGoalWords.filter(word =>
    word.length > 3 && otherGoalWords.includes(word)
  );

  const isSelf = currentUser.id === user.id;
  const isFriend = currentUser.friends?.includes(user.id);
  const friendCount = (user.friends || []).length;
  const mutualCount = isSelf
    ? 0
    : (user.friends || []).filter(f => (currentUser.friends || []).includes(f)).length;

  // Privacy gate: show limited info if private and not self/friend
  const isHidden = !!user.isPrivate && !isSelf && !isFriend;

  const handleAddFriend = () => {
    sendMatchRequest(currentUser.id, user.id);
    toast({ title: "Friend request sent", description: `A request was sent to ${user.firstName}.` });
    onOpenChange(false);
  };

  const handleBlock = () => {
    blockUser(user.id);
    toast({ title: "User blocked", description: `${user.firstName} won't appear in your network.` });
    onOpenChange(false);
  };

  const socials = user.socialLinks || {};
  const hasAnySocial = !!(socials.twitter || socials.github || socials.linkedin || socials.website);
  const ensureUrl = (val: string, prefix: string) =>
    val.startsWith("http://") || val.startsWith("https://") ? val : prefix + val;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row justify-between items-start pt-4">
          <div className="flex gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.firstName[0]}</AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background ${user.online ? "bg-green-500" : "bg-gray-400"}`} />
            </div>
            <div className="space-y-1 mt-1">
              <DialogTitle className="text-2xl font-serif flex items-center gap-2 flex-wrap">
                {user.firstName} {user.lastName}
                <Badge variant="secondary" className="text-xs">Lv {user.level}</Badge>
                {user.isPrivate && (
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Private
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex gap-3 text-sm text-muted-foreground font-medium flex-wrap">
                {user.timezone && (
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{user.timezone}</span>
                )}
                <span className="flex items-center text-orange-500"><Flame className="w-3.5 h-3.5 mr-1" />{user.streak} days</span>
                <button
                  onClick={() => setFriendsOpen(true)}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  <Users className="w-3.5 h-3.5 mr-1" />
                  {friendCount} friend{friendCount === 1 ? "" : "s"}
                  {!isSelf && friendCount > 0 && (
                    <span className="ml-1 text-xs text-primary">({mutualCount} mutual)</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {!isSelf && mode === "network" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center p-2 bg-primary/5 rounded-lg border border-primary/10 cursor-help">
                  <span className="text-2xl font-serif text-primary">{matchPercent}%</span>
                  <span className="text-[10px] uppercase font-bold text-primary/80 tracking-wider">Match</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px] text-left">
                <div className="space-y-1.5">
                  <p className="font-semibold">{matchPercent}% match</p>
                  <p>
                    Matched using shared enrolled units, preferred study times, and similar study goals.
                  </p>
                  {sharedUnits.length > 0 && (
                    <p>
                      <span className="font-semibold">Shared units:</span>{" "}
                      {sharedUnits.join(", ")}
                    </p>
                  )}
                  {sharedStudyTimes.length > 0 && (
                    <p>
                      <span className="font-semibold">Shared study times:</span>{" "}
                      {sharedStudyTimes.join(", ")}
                    </p>
                  )}
                  {sharedGoalWords.length > 0 && (
                    <p>
                      <span className="font-semibold">Similar goal keywords:</span>{" "}
                      {sharedGoalWords.join(", ")}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </DialogHeader>

        {isHidden ? (
          <div className="py-10 text-center space-y-3 border rounded-lg bg-muted/30">
            <Lock className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              This profile is private. Become friends to see more details.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {user.bio && (
              <p className="text-sm text-foreground/90 italic border-l-2 border-primary/30 pl-3">
                "{user.bio}"
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {user.goal && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1"><Target className="w-3 h-3" /> Goal</h4>
                  <p className="text-sm">{user.goal}</p>
                </div>
              )}
              {user.challenge && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Challenge</h4>
                  <p className="text-sm">{user.challenge}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Study Times</h4>
              <div className="flex flex-wrap gap-1.5">
                {user.studyTimes?.map(t => (
                  <Badge key={t} variant="outline" className="text-xs font-normal">{t}</Badge>
                ))}
                {(!user.studyTimes || user.studyTimes.length === 0) && (
                  <span className="text-sm text-muted-foreground">Not specified</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase">Enrolled Units</h4>
                <div className="flex flex-wrap gap-1.5">
                  {user.units?.map(u => (
                    <Badge key={u} variant="secondary" className="font-mono text-xs">{u}</Badge>
                  ))}
                  {(!user.units || user.units.length === 0) && (
                    <span className="text-sm text-muted-foreground">None listed</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase">Completed Units</h4>
                <div className="flex flex-wrap gap-1.5">
                  {user.completedUnits?.map(u => (
                    <Badge key={u} variant="outline" className="font-mono text-xs">{u}</Badge>
                  ))}
                  {(!user.completedUnits || user.completedUnits.length === 0) && (
                    <span className="text-sm text-muted-foreground">None listed</span>
                  )}
                </div>
              </div>
            </div>

            {hasAnySocial && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase">Links</h4>
                <div className="flex flex-wrap gap-2">
                  {socials.twitter && (
                    <a href={ensureUrl(socials.twitter, "https://twitter.com/")} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-sm text-foreground/90 hover:text-primary px-2.5 py-1 rounded-md border bg-card transition-colors">
                      <Twitter className="w-3.5 h-3.5" /> {socials.twitter}
                    </a>
                  )}
                  {socials.github && (
                    <a href={ensureUrl(socials.github, "https://github.com/")} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-sm text-foreground/90 hover:text-primary px-2.5 py-1 rounded-md border bg-card transition-colors">
                      <Github className="w-3.5 h-3.5" /> {socials.github}
                    </a>
                  )}
                  {socials.linkedin && (
                    <a href={ensureUrl(socials.linkedin, "https://linkedin.com/in/")} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-sm text-foreground/90 hover:text-primary px-2.5 py-1 rounded-md border bg-card transition-colors">
                      <Linkedin className="w-3.5 h-3.5" /> {socials.linkedin}
                    </a>
                  )}
                  {socials.website && (
                    <a href={ensureUrl(socials.website, "https://")} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-sm text-foreground/90 hover:text-primary px-2.5 py-1 rounded-md border bg-card transition-colors">
                      <Globe className="w-3.5 h-3.5" /> {socials.website}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {isSelf && (
          <div className="flex pt-4 border-t mt-2">
            <Button variant="outline" className="w-full" onClick={() => setEditOpen(true)}>
              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Profile
            </Button>
          </div>
        )}

        {!isSelf && mode === "network" && (
          <div className="flex gap-3 pt-4 border-t mt-2">
            <Button className="flex-1" onClick={handleAddFriend} disabled={isFriend}>
              {isFriend ? "Already Friends" : "Add Friend"}
            </Button>
            <Button variant="outline" className="flex-1 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5" onClick={handleBlock}>Block</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <FriendsListModal
      userId={user.id}
      open={friendsOpen}
      onOpenChange={setFriendsOpen}
      onSelectFriend={(id) => {
        setFriendsOpen(false);
        if (id !== user.id) setNestedProfileId(id);
      }}
    />

    {isSelf && (
      <EditProfileModal open={editOpen} onOpenChange={setEditOpen} />
    )}

    {nestedProfileId && (
      <ProfileModal
        userId={nestedProfileId}
        mode="default"
        open={!!nestedProfileId}
        onOpenChange={(o) => { if (!o) setNestedProfileId(null); }}
      />
    )}
    </>
  );
}
