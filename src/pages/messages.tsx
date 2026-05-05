import { useState } from "react";
import { Link } from "wouter";
import { useAppStore } from "../lib/store";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Check, X, Send, Lock, Plus, Users as UsersIcon, Eye, Radio, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { ProfileModal } from "../components/profile/profile-modal";
import { InviteSessionModal } from "../components/messages/invite-session-modal";
import { useIsMobile } from "../hooks/use-mobile";

export default function Messages() {
  const {
    currentUser,
    users,
    conversations,
    sessions,
    matchRequests,
    acceptMatchRequest,
    ignoreMatchRequest,
    sendMessage,
    createGroupChat
  } = useAppStore();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const isMobileView = useIsMobile();

  // Group modal state
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  if (!currentUser) return null;

  const pendingRequests = matchRequests.filter(r => r.toUserId === currentUser.id && r.status === "pending");

  // Get all conversations user is part of
  const myConversations = conversations
    .filter(c => c.participantIds.includes(currentUser.id))
    .sort((a, b) => {
      const lastMsgA = a.messages[a.messages.length - 1];
      const lastMsgB = b.messages[b.messages.length - 1];
      const timeA = lastMsgA ? new Date(lastMsgA.timestamp).getTime() : 0;
      const timeB = lastMsgB ? new Date(lastMsgB.timestamp).getTime() : 0;
      return timeB - timeA;
    });

  const activeConv = myConversations.find(c => c.id === activeConvId);

  const getConvDisplayInfo = (conv: typeof myConversations[0]) => {
    if (conv.isGroup) {
      return {
        name: conv.name || "Group Chat",
        avatar: undefined,
        initials: undefined,
        isLocked: false,
        lockDirection: null as null | "outgoing" | "incoming",
        otherId: null as string | null,
      };
    }

    const otherId = conv.participantIds.find(id => id !== currentUser.id) || null;
    const otherUser = users.find(u => u.id === otherId);

    const isFriend = currentUser.friends?.includes(otherId || "");
    const isLocked = !isFriend;

    let lockDirection: null | "outgoing" | "incoming" = null;
    if (isLocked && otherId) {
      const outgoing = matchRequests.find(
        r => r.fromUserId === currentUser.id && r.toUserId === otherId && r.status === "pending"
      );
      const incoming = matchRequests.find(
        r => r.fromUserId === otherId && r.toUserId === currentUser.id && r.status === "pending"
      );
      if (outgoing) lockDirection = "outgoing";
      else if (incoming) lockDirection = "incoming";
    }

    return {
      name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Unknown User",
      avatar: otherUser?.avatar,
      initials: otherUser?.firstName[0],
      isLocked,
      lockDirection,
      otherId,
    };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConvId) return;
    sendMessage(activeConvId, currentUser.id, messageInput.trim());
    setMessageInput("");
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedFriends.length > 0) {
      const id = createGroupChat(groupName.trim(), selectedFriends);
      setIsGroupModalOpen(false);
      setGroupName("");
      setSelectedFriends([]);
      setActiveConvId(id);
    }
  };

  // Mobile layout switch
  const showList = !isMobileView || !activeConvId;
  const showChat = !isMobileView || activeConvId;

  const activeConvInfo = activeConv ? getConvDisplayInfo(activeConv) : null;

  return (
    <div className="container mx-auto p-0 md:p-4 max-w-6xl h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0 overflow-hidden md:border rounded-lg bg-card md:shadow-sm">

        {/* Left Pane - List */}
        {showList && (
          <div className="w-full md:w-80 flex flex-col min-h-0 border-r bg-background/50 shrink-0">
            <div className="p-4 border-b bg-card flex justify-between items-center shrink-0">
              <h2 className="font-serif text-xl">Messages</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsGroupModalOpen(true)} aria-label="New group chat">
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-3 space-y-4">

                {/* Friend Requests */}
                {pendingRequests.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase px-2">Friend Requests</h3>
                    {pendingRequests.map(req => {
                      const requester = users.find(u => u.id === req.fromUserId);
                      if (!requester) return null;
                      return (
                        <Card key={req.id} className="p-3 shadow-none border-border bg-card">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => setProfileUserId(requester.id)}
                              className="shrink-0"
                              aria-label={`View ${requester.firstName}'s profile`}
                            >
                              <Avatar className="h-10 w-10 hover:ring-2 hover:ring-primary/30 transition-all">
                                <AvatarImage src={requester.avatar} />
                                <AvatarFallback>{requester.firstName[0]}</AvatarFallback>
                              </Avatar>
                            </button>
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => setProfileUserId(requester.id)}
                                className="text-sm font-medium truncate hover:underline text-left block w-full"
                              >
                                {requester.firstName} {requester.lastName}
                              </button>
                              <p className="text-[11px] text-muted-foreground">wants to be your friend</p>
                              <div className="flex gap-1.5 mt-2">
                                <Button size="sm" className="h-7 text-xs flex-1" onClick={() => acceptMatchRequest(req.id)}>
                                  <Check className="w-3 h-3 mr-1" /> Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-2"
                                  onClick={() => setProfileUserId(requester.id)}
                                  aria-label="View profile"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-2 text-destructive hover:text-destructive"
                                  onClick={() => ignoreMatchRequest(req.id)}
                                  aria-label="Ignore"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Conversations */}
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase px-2 mb-2">Conversations</h3>
                  {myConversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-2 py-4">No messages yet.</p>
                  ) : (
                    myConversations.map(conv => {
                      const info = getConvDisplayInfo(conv);
                      const lastMsg = conv.messages[conv.messages.length - 1];
                      const isActive = activeConvId === conv.id;
                      const lastPreview = lastMsg
                        ? (lastMsg.type === "session-invite" ? "Sent a session invite" : lastMsg.text)
                        : "No messages yet";

                      return (
                        <button
                          key={conv.id}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            isActive ? "bg-muted" : "hover:bg-muted/50"
                          }`}
                          onClick={() => setActiveConvId(conv.id)}
                        >
                          <Avatar className="h-12 w-12 border border-border shrink-0">
                            {info.avatar && <AvatarImage src={info.avatar} />}
                            <AvatarFallback>{conv.isGroup ? <UsersIcon className="w-5 h-5" /> : info.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-sm truncate flex items-center gap-1">
                                {info.name}
                                {info.isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                              </p>
                              {lastMsg && (
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                  {format(new Date(lastMsg.timestamp), "h:mm a")}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs truncate mt-0.5 ${!lastMsg ? "italic text-muted-foreground/70" : "text-muted-foreground"}`}>
                              {info.isLocked ? "Friend request pending" : lastPreview}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

              </div>
            </ScrollArea>
          </div>
        )}

        {/* Right Pane - Chat */}
        {showChat && (
          <div className="flex-1 min-h-0 flex flex-col bg-card">
            {activeConvId && activeConv && activeConvInfo ? (
              <>
                <div className="min-h-16 border-b flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shrink-0">
                  {isMobileView && (
                    <Button variant="ghost" size="icon" className="-ml-2 mr-1" onClick={() => setActiveConvId(null)}>
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                  <Avatar className="h-10 w-10 border border-border">
                    {activeConvInfo.avatar && <AvatarImage src={activeConvInfo.avatar} />}
                    <AvatarFallback>{activeConv.isGroup ? <UsersIcon className="w-4 h-4" /> : activeConvInfo.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{activeConvInfo.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {activeConv.isGroup ? `${activeConv.participantIds.length} members` : (activeConvInfo.isLocked ? "Pending friend request" : "Connected")}
                    </p>
                  </div>
                  {!activeConv.isGroup && !activeConvInfo.isLocked && (
                    <Button variant="outline" size="sm" onClick={() => setIsInviteOpen(true)}>
                      <Radio className="w-3.5 h-3.5 mr-1.5" /> Invite to Session
                    </Button>
                  )}
                </div>

                <ScrollArea className="flex-1 min-h-0 p-4">
                  <div className="space-y-4">
                    {activeConv.messages.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm mt-10">
                        No messages yet. Send a message to start the conversation!
                      </div>
                    ) : (
                      activeConv.messages.map(msg => {
                        const isMe = msg.senderId === currentUser.id;
                        const sender = users.find(u => u.id === msg.senderId);

                        if (msg.type === "session-invite" && msg.sessionId) {
                          const session = sessions.find(s => s.id === msg.sessionId);
                          return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                              <div className="flex items-center gap-2 mb-1">
                                {!isMe && activeConv.isGroup && <span className="text-xs text-muted-foreground ml-1">{sender?.firstName}</span>}
                                <span className="text-[10px] text-muted-foreground">
                                  {format(new Date(msg.timestamp), "h:mm a")}
                                </span>
                              </div>
                              <div className="max-w-[90%] sm:max-w-[85%] border-2 border-primary/30 bg-primary/5 rounded-2xl p-3 space-y-2 break-words">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1">
                                  <Radio className="w-3 h-3" /> Session Invite
                                </p>
                                {session ? (
                                  <>
                                    <p className="text-sm font-medium">{session.title}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      {session.status === "active" ? (
                                        <>Live now • {session.unitCode}</>
                                      ) : (
                                        <><Calendar className="w-3 h-3" />{session.scheduledFor ? format(new Date(session.scheduledFor), "MMM d, h:mm a") : "Scheduled"} • {session.unitCode}</>
                                      )}
                                    </p>
                                    {!isMe && (
                                      <Button asChild size="sm" className="w-full mt-1">
                                        <Link href={`/sessions/live/${session.id}`}>Join Session</Link>
                                      </Button>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">This session is no longer available.</p>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {!isMe && activeConv.isGroup && <span className="text-xs text-muted-foreground ml-1">{sender?.firstName}</span>}
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(msg.timestamp), "h:mm a")}
                              </span>
                            </div>
                            <div
                              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2 text-sm break-words ${
                                isMe
                                  ? "bg-primary text-primary-foreground rounded-br-none"
                                  : "bg-muted text-foreground rounded-bl-none"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background/50 shrink-0">
                  {activeConvInfo.isLocked ? (
                    <div className="bg-muted p-3 rounded-md text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      {activeConvInfo.lockDirection === "outgoing"
                        ? `Waiting for ${activeConvInfo.name?.split(" ")[0]} to accept your friend request`
                        : "Accept the friend request to start chatting"}
                    </div>
                  ) : (
                    <form onSubmit={handleSend} className="flex gap-2">
                      <Input
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        placeholder="Message..."
                        className="bg-card"
                      />
                      <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex-col items-center justify-center text-muted-foreground p-6 text-center hidden md:flex">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 opacity-50" />
                </div>
                <p className="font-medium text-lg">Your Messages</p>
                <p className="text-sm max-w-[250px] mt-2">Select a conversation from the sidebar or start a new group chat.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Group Modal */}
      <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>New Group Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="e.g. COMP1010 Study Group"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Friends</label>
              <ScrollArea className="h-48 border rounded-md p-2">
                {currentUser.friends && currentUser.friends.length > 0 ? (
                  <div className="space-y-2">
                    {currentUser.friends.map(friendId => {
                      const friend = users.find(u => u.id === friendId);
                      if (!friend) return null;
                      return (
                        <div key={friendId} className="flex items-center space-x-3 p-1">
                          <Checkbox
                            id={`friend-${friendId}`}
                            checked={selectedFriends.includes(friendId)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFriends([...selectedFriends, friendId]);
                              } else {
                                setSelectedFriends(selectedFriends.filter(id => id !== friendId));
                              }
                            }}
                          />
                          <label htmlFor={`friend-${friendId}`} className="flex items-center gap-2 cursor-pointer flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={friend.avatar} />
                              <AvatarFallback>{friend.firstName[0]}</AvatarFallback>
                            </Avatar>
                            {friend.firstName} {friend.lastName}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Add friends from the network first to add them to a group chat.
                  </div>
                )}
              </ScrollArea>
            </div>
            <Button className="w-full" onClick={handleCreateGroup} disabled={!groupName.trim() || selectedFriends.length === 0}>
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite To Session */}
      {activeConv && activeConvInfo && !activeConv.isGroup && (
        <InviteSessionModal
          conversationId={activeConv.id}
          recipientName={activeConvInfo.name?.split(" ")[0] || "your friend"}
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
        />
      )}

      {profileUserId && (
        <ProfileModal
          userId={profileUserId}
          mode="default"
          open={!!profileUserId}
          onOpenChange={(open) => { if (!open) setProfileUserId(null); }}
        />
      )}
    </div>
  );
}
