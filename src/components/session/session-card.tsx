import { useAppStore } from "../../lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Star, Users, Trash2, Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { format } from "date-fns";
import { Link } from "wouter";
import { toast } from "../../hooks/use-toast";

interface SessionCardProps {
  sessionId: string;
}

export function SessionCard({ sessionId }: SessionCardProps) {
  const { sessions, currentUser, joinSession, showInterest, deleteSession } = useAppStore();
  const session = sessions.find(s => s.id === sessionId);

  if (!session || !currentUser) return null;

  const isHost = session.hostId === currentUser.id;
  const isParticipant = session.participants.includes(currentUser.id);
  const isInterested = session.interestedUsers?.includes(currentUser.id);

  const handleJoin = () => {
    if (!isParticipant && !isHost) {
      joinSession(session.id, currentUser.id);
      toast({
        title: "Joined session!",
        description: "You earned 50 XP.",
      });
    }
  };

  const handleInterest = () => {
    showInterest(session.id, currentUser.id);
  };

  const handleDelete = () => {
    deleteSession(session.id);
    toast({
      title: "Session deleted",
      description: `"${session.title}" has been removed.`,
    });
  };

  const interestedCount = session.interestedUsers?.length || 0;
  const headcount = session.status === "scheduled"
    ? interestedCount
    : session.participants.length;

  return (
    <Card className="flex flex-col h-full bg-card hover:shadow-md transition-shadow duration-200 border-card-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-xs">{session.unitCode}</Badge>
            {session.isPrivate && (
              <Badge variant="outline" className="text-xs flex items-center gap-1 border-amber-300 text-amber-700 bg-amber-50">
                <Lock className="w-3 h-3" /> Private
              </Badge>
            )}
          </div>
          <Badge 
            variant={session.style === "Facilitated" ? "default" : "outline"}
            className="text-xs"
          >
            {session.style}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight line-clamp-2">{session.title}</CardTitle>
        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
          <span>Hosted by {session.hostName}</span>
          {session.style === "Facilitated" && session.hostTeachingScore && (
            <span className="flex items-center text-orange-500 font-medium">
              <Star className="w-3 h-3 fill-current mr-1" />
              {session.hostTeachingScore} / 5
            </span>
          )}
          {session.style !== "Facilitated" && session.hostLevel && (
            <span className="text-xs px-1.5 py-0.5 bg-muted rounded-sm">Lv {session.hostLevel}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {session.status === "scheduled" && session.scheduledFor && (
          <p className="text-sm font-medium mb-3 text-primary">
            {format(new Date(session.scheduledFor), "MMM d, h:mm a")}
          </p>
        )}
        
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Objectives</p>
          <ul className="text-sm space-y-1 list-disc list-inside pl-4 marker:text-muted-foreground">
            {session.objectives.map((obj, i) => (
              <li key={i} className="text-foreground/90">{obj}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center mt-auto border-t border-border/50 px-6 py-4">
        <div className="flex items-center text-muted-foreground text-sm">
          <Users className="w-4 h-4 mr-1" />
          <span>{headcount}</span>
          {session.status === "scheduled" && (
            <span className="ml-1 text-xs">interested</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {session.status === "scheduled" && isHost && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  aria-label="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{session.title}" will be permanently removed. Anyone who showed interest won't see it anymore.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {session.status === "active" ? (
            isParticipant || isHost ? (
              <Button asChild size="sm">
                <Link href={`/sessions/live/${session.id}`}>Enter</Link>
              </Button>
            ) : session.isPrivate ? (
              <Button size="sm" variant="outline" disabled className="opacity-60 gap-1.5">
                <Lock className="w-3 h-3" /> Invite Only
              </Button>
            ) : (
              <Button onClick={handleJoin} size="sm" asChild>
                <Link href={`/sessions/live/${session.id}`}>Join (+50 XP)</Link>
              </Button>
            )
          ) : (
            <Button 
              onClick={handleInterest} 
              variant={isInterested ? "secondary" : "outline"} 
              size="sm"
              className={isInterested ? "bg-primary/10 text-primary border-primary/20" : ""}
            >
              {isInterested ? "Interested" : "Show Interest"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
