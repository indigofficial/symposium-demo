import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAppStore } from "../lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { currentUser, sessions, matchRequests } = useAppStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
    }
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [currentUser, setLocation]);

  if (!currentUser) return null;

  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const mySessions = sessions.filter(s => s.participants.includes(currentUser.id) || s.hostId === currentUser.id);
  const nextSession = mySessions.find(s => s.status === "scheduled");
  const pendingRequests = matchRequests.filter(r => r.toUserId === currentUser.id && r.status === "pending");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-6 space-y-16"
    >
      <div className="text-center space-y-6">
        <h1 className="font-serif text-7xl md:text-9xl font-light text-foreground/90 tracking-tight">
          {format(time, 'h:mm a')}
        </h1>
        <h2 className="text-2xl md:text-3xl text-muted-foreground font-medium">
          {greeting}, {currentUser.firstName}.
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card className="bg-card border-card-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-muted-foreground">Up Next</CardTitle>
          </CardHeader>
          <CardContent>
            {nextSession ? (
              <div className="space-y-2">
                <p className="font-medium text-lg">{nextSession.title}</p>
                <p className="text-sm text-muted-foreground">
                  {nextSession.scheduledFor ? format(new Date(nextSession.scheduledFor), 'MMM d, h:mm a') : 'TBD'}
                </p>
                <Button asChild variant="outline" className="w-full mt-4">
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
                <span className="text-sm">Level</span>
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
    </motion.div>
  );
}
