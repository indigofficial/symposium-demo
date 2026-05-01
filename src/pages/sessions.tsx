import { useState } from "react";
import { useAppStore } from "../lib/store";
import { SessionCard } from "../components/session/session-card";
import { HostSessionModal } from "../components/session/host-session-modal";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { motion } from "framer-motion";
import { Plus, Radio } from "lucide-react";
import { Link } from "wouter";

export default function Sessions() {
  const { sessions, activeSessionId } = useAppStore();
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const activeSession = activeSessionId ? sessions.find(s => s.id === activeSessionId) : null;
  
  const [styleFilter, setStyleFilter] = useState("All");
  const [unitFilter, setUnitFilter] = useState("All");

  const uniqueUnits = Array.from(new Set(sessions.map(s => s.unitCode)));

  const filteredSessions = sessions.filter(s => {
    if (styleFilter !== "All" && s.style !== styleFilter) return false;
    if (unitFilter !== "All" && s.unitCode !== unitFilter) return false;
    return true;
  });

  const activeSessions = filteredSessions.filter(s => s.status === "active");
  const scheduledSessions = filteredSessions.filter(s => s.status === "scheduled");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Study Sessions</h1>
          <p className="text-muted-foreground mt-1">Join a room or start your own.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Styles</SelectItem>
              <SelectItem value="Facilitated">Facilitated</SelectItem>
              <SelectItem value="Collaborative">Collaborative</SelectItem>
            </SelectContent>
          </Select>

          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Units</SelectItem>
              {uniqueUnits.map(u => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setIsHostModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Host Session
          </Button>
        </div>
      </div>

      {activeSession && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-primary">You're in a session</p>
              <p className="font-medium">{activeSession.title} <span className="text-muted-foreground font-normal">· {activeSession.unitCode}</span></p>
            </div>
          </div>
          <Button asChild size="sm">
            <Link href={`/sessions/live/${activeSession.id}`}>
              <Radio className="w-4 h-4 mr-2" />
              Return to Session
            </Link>
          </Button>
        </div>
      )}

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-medium mb-4 flex items-center">
            Active Now 
            <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
              {activeSessions.length}
            </span>
          </h2>
          {activeSessions.length > 0 ? (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {activeSessions.map(session => (
                <motion.div key={session.id} variants={item}>
                  <SessionCard sessionId={session.id} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border/60">
              <p className="text-muted-foreground">No active sessions matching your filters.</p>
              <Button variant="link" onClick={() => setIsHostModalOpen(true)} className="mt-2 text-primary">
                Host one to get started
              </Button>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-medium mb-4 flex items-center">
            Scheduled 
          </h2>
          {scheduledSessions.length > 0 ? (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {scheduledSessions.map(session => (
                <motion.div key={session.id} variants={item}>
                  <SessionCard sessionId={session.id} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No scheduled sessions.</p>
            </div>
          )}
        </section>
      </div>

      <HostSessionModal open={isHostModalOpen} onOpenChange={setIsHostModalOpen} />
    </div>
  );
}
