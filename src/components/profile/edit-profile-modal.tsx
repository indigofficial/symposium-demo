import { useEffect, useState } from "react";
import { useAppStore, type SocialLinks } from "../../lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { X, Lock, Globe, Twitter, Github, Linkedin } from "lucide-react";
import { toast } from "../../hooks/use-toast";

const STUDY_TIMES = ["Early Morning", "Morning", "Afternoon", "Evening", "Late Night"];

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { currentUser, updateUser } = useAppStore();

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
    if (open && currentUser) {
      setBio(currentUser.bio || "");
      setGoal(currentUser.goal || "");
      setChallenge(currentUser.challenge || "");
      setStudyTimes(currentUser.studyTimes || []);
      setUnits(currentUser.units || []);
      setCompletedUnits(currentUser.completedUnits || []);
      setIsPrivate(!!currentUser.isPrivate);
      setSocialLinks(currentUser.socialLinks || {});
    }
  }, [open, currentUser]);

  if (!currentUser) return null;

  const toggleStudyTime = (t: string) => {
    setStudyTimes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
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
    updateUser({
      bio,
      goal,
      challenge,
      studyTimes,
      units,
      completedUnits,
      isPrivate,
      socialLinks,
    });
    toast({ title: "Profile updated", description: "Your changes have been saved." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit Profile</DialogTitle>
          <DialogDescription>Update your profile details and privacy preferences.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-3 -mr-3">
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={e => setBio(e.target.value)} className="resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Goal</Label>
                <Input value={goal} onChange={e => setGoal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Challenge</Label>
                <Input value={challenge} onChange={e => setChallenge(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Study Times</Label>
              <div className="flex flex-wrap gap-2">
                {STUDY_TIMES.map(t => (
                  <Badge
                    key={t}
                    variant={studyTimes.includes(t) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => toggleStudyTime(t)}
                  >{t}</Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Enrolled Units (Press Enter)</Label>
                <Input
                  value={unitInput}
                  onChange={e => setUnitInput(e.target.value)}
                  onKeyDown={addUnit}
                  placeholder="e.g. COMP1010"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {units.map(u => (
                    <Badge key={u} variant="secondary" className="font-mono text-xs flex items-center gap-1">
                      {u}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setUnits(units.filter(x => x !== u))} />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Completed Units (Press Enter)</Label>
                <Input
                  value={completedInput}
                  onChange={e => setCompletedInput(e.target.value)}
                  onKeyDown={addCompleted}
                  placeholder="e.g. COMP1000"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {completedUnits.map(u => (
                    <Badge key={u} variant="outline" className="font-mono text-xs flex items-center gap-1">
                      {u}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setCompletedUnits(completedUnits.filter(x => x !== u))} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Social Links (optional)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="Twitter / X handle" value={socialLinks.twitter || ""}
                    onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="GitHub username" value={socialLinks.github || ""}
                    onChange={e => setSocialLinks({ ...socialLinks, github: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="LinkedIn handle" value={socialLinks.linkedin || ""}
                    onChange={e => setSocialLinks({ ...socialLinks, linkedin: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="Personal website URL" value={socialLinks.website || ""}
                    onChange={e => setSocialLinks({ ...socialLinks, website: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
              <Checkbox
                id="private-toggle"
                checked={isPrivate}
                onCheckedChange={(c) => setIsPrivate(!!c)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="private-toggle" className="cursor-pointer flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Private profile
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Only friends can see your bio, goal, challenge, units, and social links.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-3 border-t">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
