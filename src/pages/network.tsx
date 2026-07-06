import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAppStore, type User } from "../lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";

type WebUser = User & { match: number };

export default function Network() {
  const { users, currentUser, getMatchPercentage, removedNetworkUsers, blockedUsers, trendingTopics } = useAppStore();
  const [, setLocation] = useLocation();
  const [unitFilter, setUnitFilter] = useState("All");
  const [displayCount, setDisplayCount] = useState<number>(6);
  const [selectedUser, setSelectedUser] = useState<WebUser | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  const hidden = new Set([...removedNetworkUsers, ...blockedUsers]);
  const eligibleUsers = users.filter(u => u.id !== currentUser.id && !hidden.has(u.id));
  const friendSet = new Set(currentUser.friends || []);

  // Calculate match scores for web visualization
  const webUsers: WebUser[] = eligibleUsers
    .map(u => ({ ...u, match: getMatchPercentage(u.id) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, displayCount);

  // Friends list
  const friends = (currentUser.friends || [])
    .map(id => users.find(u => u.id === id))
    .filter((u): u is NonNullable<typeof u> => !!u)
    .map(u => ({ ...u, match: getMatchPercentage(u.id) }))
    .sort((a, b) => b.match - a.match);

  // All unique units for filter
  const allUnits = Array.from(new Set(users.flatMap(u => u.units || [])));

  // Filtered + sorted list for "Users in Unit"
  const unitUsers = eligibleUsers
    .filter(u => unitFilter === "All" || (u.units && u.units.includes(unitFilter)))
    .map(u => ({ ...u, match: getMatchPercentage(u.id) }))
    .sort((a, b) => b.match - a.match);

  const openProfile = (id: string) => {
    setLocation(`/profile/${id}`);
  };

  const handleNodeClick = (u: WebUser) => {
    setSelectedUser(u);
  };

  const getMatchExplanation = (otherUser: typeof users[number]) => {
    const sharedUnits = (currentUser.units || []).filter(unit =>
      (otherUser.units || []).includes(unit)
    );

    const sharedStudyTimes = (currentUser.studyTimes || []).filter(time =>
      (otherUser.studyTimes || []).includes(time)
    );

    const currentGoalWords = (currentUser.goal || "").toLowerCase().split(" ");
    const otherGoalWords = (otherUser.goal || "").toLowerCase().split(" ");
    const sharedGoalWords = currentGoalWords.filter(word =>
      word.length > 3 && otherGoalWords.includes(word)
    );

    return {
      sharedUnits,
      sharedStudyTimes,
      sharedGoalWords,
    };
  };

  // Graph area grows as more matches are shown, and nodes spread further apart.
  const nodeCount = Math.max(webUsers.length, 1);
  const graphHeight = displayCount > 12 ? 680
    : displayCount > 6 ? 580
    : 500;
  const ringRadius = Math.min(320, 130 + nodeCount * 7);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="font-serif text-3xl md:text-4xl">Network</h1>
        <p className="text-muted-foreground mt-1">Connect with students who share your goals and schedule.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Network Web Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            className="bg-card shadow-sm border-card-border overflow-hidden relative flex items-center justify-center transition-[height] duration-300"
            style={{ height: graphHeight }}
          >
            {/* Display count dropdown */}
            <div className="absolute top-3 right-3 z-20">
              <Select value={String(displayCount)} onValueChange={(v) => setDisplayCount(Number(v))}>
                <SelectTrigger className="w-[150px] h-8 text-xs" data-testid="select-top-matches">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Top 6 Matches</SelectItem>
                  <SelectItem value="12">Top 12 Matches</SelectItem>
                  <SelectItem value="18">Top 18 Matches</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blurb, anchored bottom-left of the node box */}
            <div className="absolute bottom-3 left-3 z-20 max-w-[240px] bg-background/85 backdrop-blur-sm border border-card-border rounded-md px-3 py-2 shadow-sm">
              <p className="text-[11px] leading-snug text-muted-foreground">
                Students whose times, units, goals, and challenges align most closely with yours. Click a node to preview &middot; hover the % for details.
              </p>
            </div>

            {/* SVG Network Visualization */}
            <div ref={graphRef} className="absolute inset-0 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="-350 -350 700 700" className="absolute inset-0">
                {webUsers.map((u, i) => {
                  const angle = (i * (360 / nodeCount)) * (Math.PI / 180);
                  const radius = ringRadius - (u.match - 40) * 0.6;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const isFriend = friendSet.has(u.id);
                  return (
                    <line
                      key={`line-${u.id}`}
                      x1="0" y1="0" x2={x} y2={y}
                      stroke={isFriend ? "var(--color-primary, #c1836a)" : "currentColor"}
                      strokeWidth={isFriend ? 3 : 1}
                      strokeDasharray={isFriend ? "none" : "4 4"}
                      opacity={isFriend ? 0.85 : 0.45}
                    />
                  );
                })}
              </svg>

              {/* Center Node (Current User) */}
              <motion.div
                className="absolute z-10 flex flex-col items-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleNodeClick({ ...currentUser, match: 100 })}
              >
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary shadow-lg">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.firstName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                </div>
                <span className="mt-2 font-medium bg-background/90 px-2 py-0.5 rounded-md text-sm shadow-sm">
                  You
                </span>
              </motion.div>

              {/* Peripheral Nodes */}
              {webUsers.map((u, i) => {
                const angle = (i * (360 / nodeCount)) * (Math.PI / 180);
                const radius = ringRadius - (u.match - 40) * 0.6;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={`node-${u.id}`}
                    className="absolute z-10 flex flex-col items-center cursor-pointer"
                    style={{ x, y }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                    whileHover={{ scale: 1.1, zIndex: 20 }}
                    onClick={() => handleNodeClick(u)}
                    data-testid={`node-user-${u.id}`}
                  >
                    <div className="relative">
                      <Avatar className="h-14 w-14 border-2 border-background shadow-md">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.firstName[0]}</AvatarFallback>
                      </Avatar>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-background shadow-sm cursor-help"
                          >
                            {u.match}%
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] text-left">
                          {(() => {
                            const match = getMatchExplanation(u);
                            return (
                              <div className="space-y-1.5">
                                <p className="font-semibold">{u.match}% match</p>
                                <p>
                                  The matching score is an average of estimated alignment across all categories in your user profile including bio, current study goals, preferred study times, and social media information made available.
                                </p>
                                {match.sharedUnits.length > 0 && (
                                  <p>
                                    <span className="font-semibold">Shared units:</span>{" "}
                                    {match.sharedUnits.join(", ")}
                                  </p>
                                )}
                                {match.sharedStudyTimes.length > 0 && (
                                  <p>
                                    <span className="font-semibold">Shared study times:</span>{" "}
                                    {match.sharedStudyTimes.join(", ")}
                                  </p>
                                )}
                                {match.sharedGoalWords.length > 0 && (
                                  <p>
                                    <span className="font-semibold">Similar goal keywords:</span>{" "}
                                    {match.sharedGoalWords.join(", ")}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="mt-1 font-medium bg-background/90 px-1.5 py-0.5 rounded-md text-xs shadow-sm whitespace-nowrap">
                      {u.firstName}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Sidebar Area */}
        <div className="space-y-6">
          {/* Friends */}
          <Card className="bg-card shadow-sm border-card-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Friends</CardTitle>
              <Badge variant="secondary" className="text-xs">{friends.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2">
                {friends.length > 0 ? friends.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedUser(u)}
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.firstName[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${u.online ? "bg-green-500" : "bg-gray-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-muted-foreground">Lv {u.level}</p>
                    </div>
                  </motion.div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No friends yet. Add some from the network.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-card-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Users in Unit</CardTitle>
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="All Units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Units</SelectItem>
                  {allUnits.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {unitUsers.length > 0 ? unitUsers.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedUser(u)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.firstName[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${u.online ? "bg-green-500" : "bg-gray-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-muted-foreground">Lv {u.level}</p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full cursor-help shrink-0"
                        >
                          {u.match}%
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px] text-left">
                        {(() => {
                          const match = getMatchExplanation(u);
                          return (
                            <div className="space-y-1.5">
                              <p className="font-semibold">{u.match}% match</p>
                              <p>
                                The matching score is an average of estimated alignment across all categories in your user profile including bio, current study goals, preferred study times, and social media information made available.
                              </p>
                              {match.sharedUnits.length > 0 && (
                                <p>
                                  <span className="font-semibold">Shared units:</span>{" "}
                                  {match.sharedUnits.join(", ")}
                                </p>
                              )}
                              {match.sharedStudyTimes.length > 0 && (
                                <p>
                                  <span className="font-semibold">Shared study times:</span>{" "}
                                  {match.sharedStudyTimes.join(", ")}
                                </p>
                              )}
                              {match.sharedGoalWords.length > 0 && (
                                <p>
                                  <span className="font-semibold">Similar goal keywords:</span>{" "}
                                  {match.sharedGoalWords.join(", ")}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No users found.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingTopics.map((t, i) => (
                  <motion.div
                    key={t.topic}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <p className="text-sm font-medium">{t.topic}</p>
                      <p className="text-xs text-muted-foreground">{t.mentions} mentions this week</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">{t.unitCode}</Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Node preview popup */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[400px]">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">{selectedUser.firstName} {selectedUser.lastName}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback>{selectedUser.firstName[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-serif text-xl truncate">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-sans">Lv {selectedUser.level}</span>
                    {selectedUser.id !== currentUser.id && (
                      <> &middot; <span className="font-sans font-semibold text-primary">{selectedUser.match}% match</span></>
                    )}
                  </p>
                </div>
              </div>

              {selectedUser.bio && (
                <p className="text-sm text-muted-foreground line-clamp-3">{selectedUser.bio}</p>
              )}

              {selectedUser.units && selectedUser.units.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.units.map((u) => (
                    <Badge key={u} variant="outline" className="text-[10px] font-mono">{u}</Badge>
                  ))}
                </div>
              )}

              <Button
                className="w-full mt-2"
                onClick={() => openProfile(selectedUser.id)}
                data-testid="button-enlarge-profile"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Enlarge Full Profile
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
