import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useAppStore, type SocialLinks } from "../lib/store";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { FriendsListModal } from "../components/profile/friends-list-modal";
import { toast } from "../hooks/use-toast";
import {
  ArrowLeft,
  Flame,
  MapPin,
  Target,
  AlertCircle,
  Lock,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Pencil,
  Users,
  UserPlus,
  Send,
  Check,
  X,
  Save,
  ShieldOff,
  Trophy,
  BookOpen,
  GraduationCap,
  Clock,
} from "lucide-react";

const STUDY_TIMES = ["Early Morning", "Morning", "Afternoon", "Evening", "Late Night"];

function Panel({ title, icon, children, className = "" }: { title?: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm p-4 sm:p-5 ${className}`}>
      {title && (
        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/60 mb-3">
          {icon}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function StatRow({ label, value, onClick }: { label: string; value: React.ReactNode; onClick?: () => void }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`w-full flex items-center justify-between py-2 border-b border-white/10 last:border-b-0 text-left ${onClick ? "hover:text-white transition-colors" : ""}`}
    >
      <span className="text-sm text-white/60">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </Comp>
  );
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const {
    users,
    currentUser,
    getMatchPercentage,
    sendMatchRequest,
    blockUser,
    updateUser,
  } = useAppStore();

  const user = users.find((u) => u.id === id);
  const isSelf = !!currentUser && !!user && currentUser.id === user.id;

  const [isEditing, setIsEditing] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [note, setNote] = useState("");

  const [bio, setBio] = useState("");
  const [goal, setGoal] = useState("");
  const [challenge, setChallenge] = useState("");
  const [studyTimes, setStudyTimes] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [completedUnits, setCompletedUnits] = useState<string[]>([]);
  const [unitInput, setUnitInput] = useState("");
  const [completedInput, setCompletedInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});

  useEffect(() => {
    if (isSelf && currentUser) {
      setBio(currentUser.bio || "");
      setGoal(currentUser.goal || "");
      setChallenge(currentUser.challenge || "");
      setStudyTimes(currentUser.studyTimes || []);
      setUnits(currentUser.units || []);
      setCompletedUnits(currentUser.completedUnits || []);
      setIsPrivate(!!currentUser.isPrivate);
      setSocialLinks(currentUser.socialLinks || {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelf, currentUser?.id]);

  if (!user || !currentUser) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Profile not found.</p>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const matchPercent = getMatchPercentage(user.id);
  const isFriend = currentUser.friends?.includes(user.id);
  const friendCount = (user.friends || []).length;
  const mutualCount = isSelf
    ? 0
    : (user.friends || []).filter((f) => (currentUser.friends || []).includes(f)).length;
  const isHidden = !!user.isPrivate && !isSelf && !isFriend;

  const displayUnits = isEditing ? units : user.units || [];
  const displayCompleted = isEditing ? completedUnits : user.completedUnits || [];
  const displayStudyTimes = isEditing ? studyTimes : user.studyTimes || [];
  const displaySocials = isEditing ? socialLinks : user.socialLinks || {};
  const hasAnySocial = !!(displaySocials.twitter || displaySocials.github || displaySocials.linkedin || displaySocials.website);
  const ensureUrl = (val: string, prefix: string) =>
    val.startsWith("http://") || val.startsWith("https://") ? val : prefix + val;

  const toggleStudyTime = (t: string) => {
    setStudyTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const addUnit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && unitInput.trim()) {
      e.preventDefault();
      const v = unitInput.trim().toUpperCase();
      if (!units.includes(v)) setUnits([...units, v]);
      setUnitInput("");
    }
  };

  const addCompleted = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && completedInput.trim()) {
      e.preventDefault();
      const v = completedInput.trim().toUpperCase();
      if (!completedUnits.includes(v)) setCompletedUnits([...completedUnits, v]);
      setCompletedInput("");
    }
  };

  const handleSave = () => {
    updateUser({ bio, goal, challenge, studyTimes, units, completedUnits, isPrivate, socialLinks });
    toast({ title: "Profile updated", description: "Your changes have been saved." });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (currentUser) {
      setBio(currentUser.bio || "");
      setGoal(currentUser.goal || "");
      setChallenge(currentUser.challenge || "");
      setStudyTimes(currentUser.studyTimes || []);
      setUnits(currentUser.units || []);
      setCompletedUnits(currentUser.completedUnits || []);
      setIsPrivate(!!currentUser.isPrivate);
      setSocialLinks(currentUser.socialLinks || {});
    }
    setIsEditing(false);
  };

  const handleSendRequest = () => {
    sendMatchRequest(currentUser.id, user.id, note.trim() || undefined);
    toast({ title: "Friend request sent", description: `A request was sent to ${user.firstName}.` });
    setShowNoteForm(false);
    setNote("");
  };

  const handleBlock = () => {
    blockUser(user.id);
    toast({ title: "User blocked", description: `${user.firstName} won't appear in your network.` });
    setLocation("/network");
  };

  return (
    <div className="min-h-full bg-[#0f1621]">
      {/* Banner / hero */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(120,150,200,0.35), transparent), radial-gradient(ellipse 60% 50% at 90% 10%, rgba(90,120,190,0.25), transparent), linear-gradient(180deg, #1b2838 0%, #16202c 60%, #0f1621 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-20 sm:pb-24">
          <button
            onClick={() => setLocation(isSelf ? "/dashboard" : "/network")}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-md border-2 border-white/20 shadow-lg object-cover bg-muted"
                  data-testid="img-profile-avatar"
                />
                <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[#1b2838] ${user.online ? "bg-green-500" : "bg-gray-500"}`} />
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl text-white" data-testid="text-profile-name">
                    {user.firstName} {user.lastName}
                  </h1>
                  {user.isPrivate && (
                    <Badge className="bg-white/10 text-white/80 border border-white/20 text-[10px] uppercase tracking-wide flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Private
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60 mt-1 flex-wrap">
                  {user.timezone && (
                    <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{user.timezone}</span>
                  )}
                  <span className="flex items-center text-orange-400"><Flame className="w-3.5 h-3.5 mr-1" />{user.streak} day streak</span>
                  <button
                    onClick={() => setFriendsOpen(true)}
                    className="flex items-center hover:text-white transition-colors"
                    data-testid="button-view-friends"
                  >
                    <Users className="w-3.5 h-3.5 mr-1" />
                    {friendCount} friend{friendCount === 1 ? "" : "s"}
                    {!isSelf && friendCount > 0 && (
                      <span className="ml-1 text-primary-foreground/80 text-primary">({mutualCount} mutual)</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isSelf && (
                <div className="flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-white/10 border border-white/15">
                  <span className="text-xl font-serif text-white">{matchPercent}%</span>
                  <span className="text-[9px] uppercase font-bold text-white/60 tracking-wider">Match</span>
                </div>
              )}
              <div className="flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-white/10 border border-white/15">
                <span className="text-xl font-serif text-white">Lv {user.level}</span>
                <span className="text-[9px] uppercase font-bold text-white/60 tracking-wider">{user.xp} XP</span>
              </div>

              {isSelf ? (
                isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/10" onClick={handleCancel} data-testid="button-cancel-edit">
                      <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} data-testid="button-save-edit">
                      <Save className="w-3.5 h-3.5 mr-1.5" /> Save
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
                  </Button>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 pb-16">
        {isHidden ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm py-14 text-center space-y-3">
            <Lock className="w-8 h-8 mx-auto text-white/40" />
            <p className="text-sm text-white/60">This profile is private. Become friends to see more details.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Left / main column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              <Panel title="About">
                {isEditing ? (
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Say something about yourself..."
                    className="resize-none bg-white/5 border-white/15 text-white placeholder:text-white/40"
                    data-testid="input-bio"
                  />
                ) : (
                  <p className="text-sm text-white/85 italic" data-testid="text-bio">
                    {user.bio ? `"${user.bio}"` : "No bio yet."}
                  </p>
                )}
              </Panel>

              <Panel title="Study Goals" icon={<Target className="w-3.5 h-3.5" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-white/50 text-[11px] uppercase flex items-center gap-1"><Target className="w-3 h-3" /> Goal</Label>
                    {isEditing ? (
                      <Input value={goal} onChange={(e) => setGoal(e.target.value)} className="bg-white/5 border-white/15 text-white" data-testid="input-goal" />
                    ) : (
                      <p className="text-sm text-white" data-testid="text-goal">{user.goal || "Not specified"}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/50 text-[11px] uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Challenge</Label>
                    {isEditing ? (
                      <Input value={challenge} onChange={(e) => setChallenge(e.target.value)} className="bg-white/5 border-white/15 text-white" data-testid="input-challenge" />
                    ) : (
                      <p className="text-sm text-white" data-testid="text-challenge">{user.challenge || "Not specified"}</p>
                    )}
                  </div>
                </div>
              </Panel>

              <Panel title="Preferred Study Times" icon={<Clock className="w-3.5 h-3.5" />}>
                <div className="flex flex-wrap gap-2">
                  {isEditing
                    ? STUDY_TIMES.map((t) => (
                        <Badge
                          key={t}
                          onClick={() => toggleStudyTime(t)}
                          className={`px-3 py-1 ${studyTimes.includes(t) ? "" : "bg-white/5 text-white/70 border-white/20"}`}
                          data-testid={`badge-studytime-${t}`}
                        >
                          {t}
                        </Badge>
                      ))
                    : displayStudyTimes.length > 0
                    ? displayStudyTimes.map((t) => (
                        <Badge key={t} className="bg-white/10 text-white/80 border border-white/15 font-normal">{t}</Badge>
                      ))
                    : <span className="text-sm text-white/40">Not specified</span>}
                </div>
              </Panel>

              <Panel title="Units">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/50 text-[11px] uppercase flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Enrolled</Label>
                    {isEditing && (
                      <Input
                        value={unitInput}
                        onChange={(e) => setUnitInput(e.target.value)}
                        onKeyDown={addUnit}
                        placeholder="e.g. COMP1010 (press Enter)"
                        className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
                        data-testid="input-add-unit"
                      />
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {displayUnits.length > 0 ? displayUnits.map((u) => (
                        <Badge key={u} className="bg-white/10 text-white/80 border border-white/15 font-mono text-xs flex items-center gap-1">
                          {u}
                          {isEditing && <X className="w-3 h-3 cursor-pointer" onClick={() => setUnits(units.filter((x) => x !== u))} />}
                        </Badge>
                      )) : <span className="text-sm text-white/40">None listed</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/50 text-[11px] uppercase flex items-center gap-1"><Trophy className="w-3 h-3" /> Completed</Label>
                    {isEditing && (
                      <Input
                        value={completedInput}
                        onChange={(e) => setCompletedInput(e.target.value)}
                        onKeyDown={addCompleted}
                        placeholder="e.g. COMP1000 (press Enter)"
                        className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
                        data-testid="input-add-completed"
                      />
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {displayCompleted.length > 0 ? displayCompleted.map((u) => (
                        <Badge key={u} className="bg-white/5 text-white/70 border border-white/15 font-mono text-xs flex items-center gap-1">
                          {u}
                          {isEditing && <X className="w-3 h-3 cursor-pointer" onClick={() => setCompletedUnits(completedUnits.filter((x) => x !== u))} />}
                        </Badge>
                      )) : <span className="text-sm text-white/40">None listed</span>}
                    </div>
                  </div>
                </div>
              </Panel>

              {(hasAnySocial || isEditing) && (
                <Panel title="Links" icon={<Globe className="w-3.5 h-3.5" />}>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Twitter className="w-4 h-4 text-white/40 shrink-0" />
                        <Input placeholder="Twitter / X handle" value={socialLinks.twitter || ""} onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })} className="bg-white/5 border-white/15 text-white placeholder:text-white/40" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-white/40 shrink-0" />
                        <Input placeholder="GitHub username" value={socialLinks.github || ""} onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })} className="bg-white/5 border-white/15 text-white placeholder:text-white/40" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-white/40 shrink-0" />
                        <Input placeholder="LinkedIn handle" value={socialLinks.linkedin || ""} onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })} className="bg-white/5 border-white/15 text-white placeholder:text-white/40" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-white/40 shrink-0" />
                        <Input placeholder="Personal website URL" value={socialLinks.website || ""} onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })} className="bg-white/5 border-white/15 text-white placeholder:text-white/40" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displaySocials.twitter && (
                        <a href={ensureUrl(displaySocials.twitter, "https://twitter.com/")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 transition-colors">
                          <Twitter className="w-3.5 h-3.5" /> {displaySocials.twitter}
                        </a>
                      )}
                      {displaySocials.github && (
                        <a href={ensureUrl(displaySocials.github, "https://github.com/")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 transition-colors">
                          <Github className="w-3.5 h-3.5" /> {displaySocials.github}
                        </a>
                      )}
                      {displaySocials.linkedin && (
                        <a href={ensureUrl(displaySocials.linkedin, "https://linkedin.com/in/")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 transition-colors">
                          <Linkedin className="w-3.5 h-3.5" /> {displaySocials.linkedin}
                        </a>
                      )}
                      {displaySocials.website && (
                        <a href={ensureUrl(displaySocials.website, "https://")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 transition-colors">
                          <Globe className="w-3.5 h-3.5" /> {displaySocials.website}
                        </a>
                      )}
                    </div>
                  )}
                </Panel>
              )}

              {isEditing && (
                <Panel>
                  <div className="flex items-start gap-3">
                    <Checkbox id="private-toggle" checked={isPrivate} onCheckedChange={(c) => setIsPrivate(!!c)} className="mt-1 border-white/30" data-testid="checkbox-private" />
                    <div className="flex-1">
                      <Label htmlFor="private-toggle" className="flex items-center gap-1.5 text-white">
                        <Lock className="w-3.5 h-3.5" /> Private profile
                      </Label>
                      <p className="text-xs text-white/50 mt-1">Only friends can see your bio, goal, challenge, units, and social links.</p>
                    </div>
                  </div>
                </Panel>
              )}

              {!isSelf && (
                <Panel>
                  {isFriend ? (
                    <Button className="w-full" disabled>Already Friends</Button>
                  ) : showNoteForm ? (
                    <div className="space-y-2">
                      <p className="text-xs text-white/50 font-medium">Add a short note with your request (optional)</p>
                      <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={`Hi ${user.firstName}, want to study together?`}
                        className="resize-none text-sm bg-white/5 border-white/15 text-white placeholder:text-white/40"
                        rows={3}
                        maxLength={200}
                      />
                      <p className="text-[10px] text-white/40 text-right">{note.length}/200</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10" onClick={() => { setShowNoteForm(false); setNote(""); }}>Back</Button>
                        <Button size="sm" className="flex-1" onClick={handleSendRequest}>
                          <Send className="w-3.5 h-3.5 mr-1.5" /> Send Request
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button className="flex-1" onClick={() => setShowNoteForm(true)} data-testid="button-add-friend">
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Add Friend
                      </Button>
                      <Button variant="outline" className="flex-1 bg-white/5 border-white/20 text-destructive hover:bg-destructive/10" onClick={handleBlock} data-testid="button-block-user">
                        <ShieldOff className="w-3.5 h-3.5 mr-1.5" /> Block
                      </Button>
                    </div>
                  )}
                </Panel>
              )}
            </div>

            {/* Right / stats sidebar */}
            <div className="space-y-4 sm:space-y-5">
              <Panel title="Stats">
                <StatRow label="Level" value={user.level} />
                <StatRow label="Experience" value={`${user.xp} XP`} />
                <StatRow label="Streak" value={
                  <span className="flex items-center gap-1 text-orange-400"><Flame className="w-3.5 h-3.5" />{user.streak}d</span>
                } />
                <StatRow label="Friends" value={friendCount} onClick={() => setFriendsOpen(true)} />
                {!isSelf && <StatRow label="Mutual friends" value={mutualCount} />}
                <StatRow label="Units enrolled" value={displayUnits.length} />
                <StatRow label="Units completed" value={displayCompleted.length} />
              </Panel>

              <Panel title="Badges" icon={<Trophy className="w-3.5 h-3.5" />}>
                <div className="flex flex-wrap gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-11 w-11 rounded-lg bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-400">
                        <Flame className="w-5 h-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{user.streak} day streak</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-11 w-11 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{displayCompleted.length} units completed</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-11 w-11 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{displayUnits.length} units enrolled</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-11 w-11 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                        <Users className="w-5 h-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{friendCount} friends</TooltipContent>
                  </Tooltip>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>

      <FriendsListModal
        userId={user.id}
        open={friendsOpen}
        onOpenChange={setFriendsOpen}
        onSelectFriend={(fid) => {
          setFriendsOpen(false);
          if (fid !== user.id) setLocation(`/profile/${fid}`);
        }}
      />
    </div>
  );
}
