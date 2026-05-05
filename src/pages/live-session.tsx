import { useEffect, useState } from "react";
import { useAppStore } from "../lib/store";
import { useParams } from "wouter";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Type, Pencil, Eraser, RotateCcw, RotateCw,
  Mic, MicOff, Video, VideoOff, MonitorUp, Send,
  LogOut, StopCircle, ChevronRight, Hand, MicOff as MuteAllIcon, MessageSquare
} from "lucide-react";
import { FeedbackModal } from "../components/session/feedback-modal";
import { SessionFeedbackListModal } from "../components/session/session-feedback-list-modal";
import { toast } from "../hooks/use-toast";

export default function LiveSession() {
  const { id } = useParams<{ id: string }>();
  const { sessions, users, currentUser, setActiveSession, toggleHand, setEveryoneMuted } = useAppStore();

  const session = sessions.find(s => s.id === id);
  const host = users.find(u => u.id === session?.hostId);

  const [activeTool, setActiveTool] = useState("pencil");
  const [currentObjectiveIdx, setCurrentObjectiveIdx] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [chat, setChat] = useState([
    { sender: "System", text: "Welcome to the session!", time: "Now" }
  ]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<"host" | "participant">("participant");
  const [isFeedbackListOpen, setIsFeedbackListOpen] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [screenShareOn, setScreenShareOn] = useState(false);

  useEffect(() => {
    if (session && currentUser) {
      setActiveSession(session.id);
    }
  }, [session, currentUser, setActiveSession]);

  if (!session || !currentUser || !host) {
    return <div className="p-8 text-center">Session not found or you don't have access.</div>;
  }

  const isHost = session.hostId === currentUser.id;
  const isFacilitated = session.style === "Facilitated";
  const handsUp = session.handsUp || [];
  const isHandRaised = handsUp.includes(currentUser.id);
  const everyoneMuted = !!session.everyoneMuted;
  const effectiveMicOn = micOn && !(everyoneMuted && !isHost);

  // Collect all participants (mock + actual)
  const participantUsers = session.participants
    .map(pid => users.find(u => u.id === pid))
    .filter(Boolean) as typeof users;

  // If no one joined yet, just show the host and current user
  const displayParticipants = Array.from(new Set([...participantUsers, currentUser])).filter(u => u.id !== host.id);

  const raisedHandUsers = handsUp
    .map(uid => users.find(u => u.id === uid))
    .filter(Boolean) as typeof users;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChat([...chat, { sender: currentUser.firstName, text: chatMessage, time: "Now" }]);
    setChatMessage("");
  };

  const handleLeave = () => {
    setFeedbackMode("participant");
    setIsFeedbackOpen(true);
  };

  const handleEnd = () => {
    setFeedbackMode(session.style === "Facilitated" ? "host" : "participant");
    setIsFeedbackOpen(true);
  };

  const handleToggleHand = () => {
    toggleHand(session.id, currentUser.id);
    if (!isHandRaised) {
      toast({ title: "Hand raised", description: "The facilitator can see your raised hand." });
    }
  };

  const handleMuteAll = () => {
    setEveryoneMuted(session.id, !everyoneMuted);
    toast({
      title: !everyoneMuted ? "Everyone muted" : "Mute lifted",
      description: !everyoneMuted ? "All participants have been muted." : "Participants can unmute themselves.",
    });
  };

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-3.5rem)] flex flex-col bg-background overflow-y-auto lg:overflow-hidden">
      {/* Top Bar */}
      <header className="min-h-14 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-3 sm:py-0 bg-card shrink-0">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-3">
            <h1 className="font-medium truncate">{session.title}</h1>
            <span className="text-xs px-2 py-1 bg-secondary rounded-full font-mono text-secondary-foreground shrink-0">
              {session.unitCode}
            </span>
          </div>
        </div>

        <div className="w-full sm:flex-1 flex justify-start sm:justify-center items-center min-w-0 sm:px-4">
          <div className="flex items-center gap-2 max-w-full">
            <span className="text-xs text-muted-foreground uppercase font-bold shrink-0">Objective:</span>
            <span className="text-sm font-medium truncate">{session.objectives[currentObjectiveIdx] || "Study"}</span>
            {session.objectives.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => setCurrentObjectiveIdx((i) => (i + 1) % session.objectives.length)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="w-full sm:flex-1 flex justify-start sm:justify-end gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
          {isHost && isFacilitated && (
            <Button
              variant={everyoneMuted ? "default" : "outline"}
              size="sm"
              onClick={handleMuteAll}
              title="Mute everyone"
            >
              <MuteAllIcon className="w-4 h-4 mr-2" />
              {everyoneMuted ? "Unmute All" : "Mute All"}
            </Button>
          )}
          {isHost && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFeedbackListOpen(true)}
              title="View anonymous feedback"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Feedback
              {(session.feedbacks?.length || 0) > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 text-[10px] px-1.5">
                  {session.feedbacks?.length}
                </Badge>
              )}
            </Button>
          )}
          {isHost ? (
            <Button variant="destructive" size="sm" onClick={handleEnd}>
              <StopCircle className="w-4 h-4 mr-2" />
              End Session
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleLeave}>
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          )}
        </div>
      </header>

      {/* Hands raised banner — visible to facilitator */}
      {isHost && isFacilitated && raisedHandUsers.length > 0 && (
        <div className="px-4 py-2 bg-primary/10 border-b flex items-center gap-2 text-sm shrink-0">
          <Hand className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium">Hands raised:</span>
          <div className="flex gap-1.5 flex-wrap">
            {raisedHandUsers.map(u => (
              <Badge key={u.id} variant="secondary" className="text-xs">{u.firstName}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Mute-all banner for participants */}
      {!isHost && everyoneMuted && (
        <div className="px-4 py-2 bg-muted border-b flex items-center gap-2 text-sm text-muted-foreground shrink-0">
          <MicOff className="w-4 h-4" />
          The facilitator has muted everyone.
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-[680px] lg:min-h-0 overflow-visible lg:overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 min-h-[520px] lg:min-h-0 flex flex-col relative overflow-hidden bg-muted/30">

          {/* Faux Whiteboard */}
          <div className="absolute inset-0 m-2 sm:m-4 bg-card rounded-xl border shadow-sm" style={{ backgroundImage: 'radial-gradient(hsl(var(--muted-foreground)/0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            {/* Toolbar */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-background border rounded-lg shadow-sm p-1 flex flex-row sm:flex-col gap-1 max-w-[calc(100%-1.5rem)] overflow-x-auto">
              <Button variant={activeTool === "pencil" ? "secondary" : "ghost"} size="icon" onClick={() => setActiveTool("pencil")}><Pencil className="h-4 w-4" /></Button>
              <Button variant={activeTool === "type" ? "secondary" : "ghost"} size="icon" onClick={() => setActiveTool("type")}><Type className="h-4 w-4" /></Button>
              <Button variant={activeTool === "eraser" ? "secondary" : "ghost"} size="icon" onClick={() => setActiveTool("eraser")}><Eraser className="h-4 w-4" /></Button>
              <div className="h-px bg-border my-1 mx-2" />
              <Button variant="ghost" size="icon"><RotateCcw className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><RotateCw className="h-4 w-4" /></Button>
            </div>

            <div className="w-full h-full flex items-center justify-center pointer-events-none opacity-50">
              <p className="font-serif text-xl sm:text-2xl text-muted-foreground">Collaborative Canvas</p>
            </div>
          </div>

          {/* Media Controls (centered above video strip) */}
          <div className="z-20 relative mt-auto flex justify-center px-2 pb-2">
            <div className="flex max-w-full items-center gap-2 overflow-x-auto bg-card border rounded-full shadow-md px-2 py-1.5">
              <Button
                variant={effectiveMicOn ? "secondary" : "destructive"}
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setMicOn(v => !v)}
                disabled={!isHost && everyoneMuted}
                aria-label={effectiveMicOn ? "Mute microphone" : "Unmute microphone"}
                title={!isHost && everyoneMuted ? "Muted by facilitator" : (effectiveMicOn ? "Mute microphone" : "Unmute microphone")}
              >
                {effectiveMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={cameraOn ? "secondary" : "destructive"}
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setCameraOn(v => !v)}
                aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={screenShareOn ? "default" : "secondary"}
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setScreenShareOn(v => !v)}
                aria-label={screenShareOn ? "Stop sharing" : "Share screen"}
              >
                <MonitorUp className="h-4 w-4" />
              </Button>
              <Button
                variant={isHandRaised ? "default" : "secondary"}
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={handleToggleHand}
                aria-label={isHandRaised ? "Lower hand" : "Raise hand"}
                title={isHandRaised ? "Lower hand" : "Raise hand"}
              >
                <Hand className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Video Strip (Bottom) */}
          <div className="h-36 sm:h-40 shrink-0 border-t bg-card p-3 sm:p-4 flex gap-3 sm:gap-4 overflow-x-auto z-10 relative">
            {/* Host Tile */}
            <div className="relative w-40 sm:w-48 h-full bg-muted rounded-lg overflow-hidden border-2 border-primary shrink-0 flex items-center justify-center">
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium z-10">Host</div>
              {handsUp.includes(host.id) && (
                <div className="absolute top-2 right-2 z-10 bg-amber-400 text-amber-950 rounded-full p-1 shadow">
                  <Hand className="w-3 h-3" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-10">
                <span className="text-sm font-medium text-white drop-shadow-md">{host.firstName}</span>
                <div className="flex gap-1">
                  <span className="bg-black/50 p-1 rounded-md"><Mic className="w-3 h-3 text-white" /></span>
                </div>
              </div>
              <Avatar className="h-16 w-16 border-2 border-background/50">
                <AvatarImage src={host.avatar} />
                <AvatarFallback>{host.firstName[0]}</AvatarFallback>
              </Avatar>
            </div>

            {/* Participant Tiles */}
            {displayParticipants.map((p, i) => {
              const pHandUp = handsUp.includes(p.id);
              const pIsMe = p.id === currentUser.id;
              const pMicShown = pIsMe ? effectiveMicOn : (everyoneMuted ? false : i % 2 === 0);
              return (
                <div key={p.id + i} className="relative w-40 sm:w-48 h-full bg-muted rounded-lg overflow-hidden border shrink-0 flex items-center justify-center">
                  {pHandUp && (
                    <div className="absolute top-2 right-2 z-10 bg-amber-400 text-amber-950 rounded-full p-1 shadow">
                      <Hand className="w-3 h-3" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-10">
                    <span className="text-sm font-medium text-white drop-shadow-md">{p.firstName} {pIsMe ? "(You)" : ""}</span>
                    <div className="flex gap-1">
                      <span className="bg-black/50 p-1 rounded-md">
                        {pMicShown ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-red-400" />}
                      </span>
                    </div>
                  </div>
                  <Avatar className="h-16 w-16 border border-background/50">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback>{p.firstName[0]}</AvatarFallback>
                  </Avatar>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-full lg:w-80 h-[360px] lg:h-auto border-t lg:border-t-0 lg:border-l bg-card flex flex-col shrink-0">
          <div className="p-3 border-b font-medium text-sm">Session Chat</div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chat.map((msg, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{msg.sender}</span>
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="text-sm bg-muted/50 p-2 rounded-lg rounded-tl-none">{msg.text}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t bg-background">
            <form onSubmit={handleSendChat} className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="text-sm h-9"
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0"><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </div>
      </div>

      <FeedbackModal
        sessionId={session.id}
        mode={feedbackMode}
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <SessionFeedbackListModal
        sessionId={session.id}
        open={isFeedbackListOpen}
        onOpenChange={setIsFeedbackListOpen}
      />
    </div>
  );
}
