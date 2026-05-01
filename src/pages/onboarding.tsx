import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useAppStore, type SocialLinks } from "../lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { X, Twitter, Github, Linkedin, Globe } from "lucide-react";

const STUDY_TIMES = ["Early Morning", "Morning", "Afternoon", "Evening", "Late Night"];
const TIMEZONES = [
  "America/Los_Angeles", "America/New_York", "America/Chicago",
  "Europe/London", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney",
  "Pacific/Auckland"
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { currentUser, updateUser } = useAppStore();

  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("");
  const [studyTimes, setStudyTimes] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [challenge, setChallenge] = useState("");

  const [unitInput, setUnitInput] = useState("");
  const [units, setUnits] = useState<string[]>([]);
  const [completedInput, setCompletedInput] = useState("");
  const [completedUnits, setCompletedUnits] = useState<string[]>([]);

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});

  const handleAddUnit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && unitInput.trim()) {
      e.preventDefault();
      const v = unitInput.trim().toUpperCase();
      if (!units.includes(v)) setUnits([...units, v]);
      setUnitInput("");
    }
  };

  const handleAddCompleted = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && completedInput.trim()) {
      e.preventDefault();
      const v = completedInput.trim().toUpperCase();
      if (!completedUnits.includes(v)) setCompletedUnits([...completedUnits, v]);
      setCompletedInput("");
    }
  };

  const removeUnit = (u: string) => setUnits(units.filter(x => x !== u));
  const removeCompleted = (u: string) => setCompletedUnits(completedUnits.filter(x => x !== u));

  const toggleStudyTime = (time: string) => {
    if (studyTimes.includes(time)) {
      setStudyTimes(studyTimes.filter(t => t !== time));
    } else {
      setStudyTimes([...studyTimes, time]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      bio,
      timezone,
      studyTimes,
      goal,
      challenge,
      units,
      completedUnits,
      socialLinks,
    });
    setLocation("/dashboard");
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl shadow-lg border-primary/10 my-8">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="font-serif text-3xl font-medium">Tell us about your studies</CardTitle>
          <CardDescription>We'll use this to match you with study buddies.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="A little about yourself..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="bg-card resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Enrolled Units (Press Enter)</Label>
                <Input
                  value={unitInput}
                  onChange={e => setUnitInput(e.target.value)}
                  onKeyDown={handleAddUnit}
                  placeholder="e.g. COMP1010"
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  {units.map(u => (
                    <Badge key={u} variant="secondary" className="flex items-center gap-1 font-mono">
                      {u}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeUnit(u)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Completed Units (Press Enter)</Label>
                <Input
                  value={completedInput}
                  onChange={e => setCompletedInput(e.target.value)}
                  onKeyDown={handleAddCompleted}
                  placeholder="e.g. COMP1000"
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  {completedUnits.map(u => (
                    <Badge key={u} variant="outline" className="flex items-center gap-1 font-mono">
                      {u}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeCompleted(u)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Study Times</Label>
              <div className="flex flex-wrap gap-2">
                {STUDY_TIMES.map(time => (
                  <Badge
                    key={time}
                    variant={studyTimes.includes(time) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => toggleStudyTime(time)}
                  >
                    {time}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Goal</Label>
                <Input
                  placeholder="e.g. Pass Calculus"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Challenge</Label>
                <Input
                  placeholder="e.g. Procrastination"
                  value={challenge}
                  onChange={e => setChallenge(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Social Links <span className="text-muted-foreground font-normal">(optional)</span></Label>
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

            <Button type="submit" className="w-full mt-6">Complete Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
