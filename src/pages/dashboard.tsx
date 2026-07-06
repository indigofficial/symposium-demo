import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAppStore } from "../lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { HelpCircle, Target, AlertCircle, Check } from "lucide-react";
import { toast } from "../hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { currentUser, sessions, matchRequests, updateUser } = useAppStore();
  const [time, setTime] = useState(new Date());
  const [goalDraft, setGoalDraft] = useState("");
  const [challengeDraft, setChallengeDraft] = useState("");

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
    }
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [currentUser, setLocation]);

  useEffect(() => {
    if (currentUser) {
      setGoalDraft(currentUser.goal || "");
      setChallengeDraft(currentUser.challenge || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  if (!currentUser) return null;

  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const upNextSessions = sessions
    .filter(s => s.status === "scheduled" && (
      s.participants.includes(currentUser.id) ||
      s.hostId === currentUser.id ||
      (s.interestedUsers || []).includes(currentUser.id)
    ))
    .sort((a, b) => new Date(a.scheduledFor || 0).getTime() - new Date(b.scheduledFor || 0).getTime());
  const nextSession = upNextSessions[0];
  const pendingRequests = matchRequests.filter(r => r.toUserId === currentUser.id && r.status === "pending");

  const goalDirty = goalDraft !== (currentUser.goal || "");
  const challengeDirty = challengeDraft !== (currentUser.challenge || "");

  const handleSaveGoal = () => {
    updateUser({ goal: goalDraft });
    toast({ title: "Goal updated", description: "This will help us match you with like-minded students." });
  };

  const handleSaveChallenge = () => {
    updateUser({ challenge: challengeDraft });
    toast({ title: "Challenge updated", description: "This will help us match you with like-minded students." });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-full flex flex-col items-center justify-center px-4 py-8 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto overflow-x-hidden"
    >
      <div className="text-center space-y-2 sm:space-y-3">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-muted-foreground tracking-medium">
          {format(time, 'h:mm a')}
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground/90 font-medium leading-tight">
          {greeting}, {currentUser.firstName}.
        </h2>
      </div>

      <div className="w-full max-w-5xl">
        <div className="w-full border border-border rounded-lg px-3 sm:px-6 py-2 text-center text-[11px] sm:text-xs text-muted-foreground bg-muted/20">
          You are connected to the University of X Learning Management System
        </div>
      </div>
            
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl">
        <Card className="bg-card border-card-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-muted-foreground">Up Next</CardTitle>
          </CardHeader>
          <CardContent>
            {upNextSessions.length > 0 ? (
              <div className="space-y-3">
                {upNextSessions.slice(0, 2).map((s) => {
                  const isInterestedOnly = !s.participants.includes(currentUser.id) && s.hostId !== currentUser.id;
                  return (
                    <div key={s.id} className="space-y-1 pb-2 border-b border-border last:border-0 last:pb-0">
                      <p className="font-medium text-base leading-snug">{s.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.scheduledFor ? format(new Date(s.scheduledFor), 'MMM d, h:mm a') : 'TBD'}
                        {isInterestedOnly && <span className="ml-1.5 text-xs text-primary">(Interested)</span>}
                      </p>
                    </div>
                  );
                })}
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link href={`/sessions`}>View Sessions</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/sessions">Find a Session</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-muted-foreground">Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Study Buddies</span>
                <span className="font-medium">{currentUser.friends?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Friend Requests</span>
                <span className="font-medium">{pendingRequests.length}</span>
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/network">Grow Network</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-muted-foreground">Activity</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">Level</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[260px] text-left">
                      <div className="space-y-1">
                        <p className="font-semibold">How levelling works</p>
                        <p>Earn XP by joining sessions, hosting sessions, making friends, and leaving feedback.</p>
                        <p>Every 200 XP increases your level.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="font-medium">{currentUser.level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Streak</span>
                <span className="font-medium text-orange-500">{currentUser.streak} Days</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${(currentUser.xp % 200) / 2}%` }} />
              </div>
              <p className="text-xs text-center text-muted-foreground pt-1">{currentUser.xp % 200} / 200 to next level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-5xl">
        <Card className="bg-card border-card-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-muted-foreground">Your Goal & Challenge</CardTitle>
            <p className="text-xs text-muted-foreground pt-1">
              Keeping these up to date helps us match you with study buddies who share your goals and can help with what you're struggling with.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dashboard-goal" className="flex items-center gap-1.5 text-sm">
                  <Target className="w-3.5 h-3.5" /> Current Goal
                </Label>
                <Textarea
                  id="dashboard-goal"
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  placeholder="e.g. Revise for COSC100 exam"
                  className="resize-none bg-background"
                  rows={2}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={!goalDirty}
                  onClick={handleSaveGoal}
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Save Goal
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dashboard-challenge" className="flex items-center gap-1.5 text-sm">
                  <AlertCircle className="w-3.5 h-3.5" /> Current Challenge
                </Label>
                <Textarea
                  id="dashboard-challenge"
                  value={challengeDraft}
                  onChange={(e) => setChallengeDraft(e.target.value)}
                  placeholder="e.g. Understanding relational algebra"
                  className="resize-none bg-background"
                  rows={2}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={!challengeDirty}
                  onClick={handleSaveChallenge}
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Save Challenge
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
