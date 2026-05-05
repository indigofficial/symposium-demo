import { useState } from "react";
import { useAppStore } from "../../lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "../../hooks/use-toast";

interface HostSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HostSessionModal({ open, onOpenChange }: HostSessionModalProps) {
  const [, setLocation] = useLocation();
  const { currentUser, hostSession } = useAppStore();
  
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [style, setStyle] = useState<"Facilitated" | "Collaborative">("Collaborative");
  const [unitCode, setUnitCode] = useState("");
  
  const [objectiveInput, setObjectiveInput] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);

  const handleAddObjective = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (objectiveInput.trim()) {
      setObjectives([...objectives, objectiveInput.trim()]);
      setObjectiveInput("");
    }
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleStartNow = () => {
    if (!currentUser || !title || !unitCode) return;
    
    const sessionId = hostSession({
      title,
      hostId: currentUser.id,
      hostName: `${currentUser.firstName} ${currentUser.lastName}`,
      style,
      unitCode: unitCode.toUpperCase(),
      objectives: objectives.length ? objectives : ["General study"],
    }, false);
    
    toast({ title: "Session started!", description: "You earned 80 XP." });
    onOpenChange(false);
    setLocation(`/sessions/live/${sessionId}`);
  };

  const handleSchedule = () => {
    if (!currentUser || !title || !unitCode || !date || !time) return;
    
    // Combine date and time
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours || 0, minutes || 0, 0, 0);
    
    hostSession({
      title,
      hostId: currentUser.id,
      hostName: `${currentUser.firstName} ${currentUser.lastName}`,
      style,
      unitCode: unitCode.toUpperCase(),
      objectives: objectives.length ? objectives : ["General study"],
    }, true, scheduledDate.toISOString());
    
    toast({ title: "Session scheduled!", description: "You earned 80 XP." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Host a Session</DialogTitle>
          <DialogDescription>
            Create a room for others to join and study together.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Session Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Midterm Prep" />
            </div>
            
            <div className="space-y-2">
              <Label>Unit / Course Code</Label>
              <Input value={unitCode} onChange={e => setUnitCode(e.target.value)} placeholder="e.g. COMP1010" />
            </div>
            
            <div className="space-y-2">
              <Label>Study Style</Label>
              <Select value={style} onValueChange={(v: any) => setStyle(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facilitated">Facilitated (Teaching)</SelectItem>
                  <SelectItem value="Collaborative">Collaborative (Group Work)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date (Optional for Start Now)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Time (HH:MM)</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label>Objectives</Label>
              <div className="flex gap-2">
                <Input 
                  value={objectiveInput} 
                  onChange={e => setObjectiveInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleAddObjective(e)}
                  placeholder="e.g. Review Chapter 4" 
                />
                <Button type="button" variant="secondary" onClick={handleAddObjective}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {objectives.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {objectives.map((obj, i) => (
                    <li key={i} className="flex justify-between items-center text-sm bg-muted/50 px-3 py-2 rounded-md">
                      <span>{obj}</span>
                      <button onClick={() => removeObjective(i)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={handleSchedule} disabled={!title || !unitCode || !date || !time}>
            Schedule
          </Button>
          <Button onClick={handleStartNow} disabled={!title || !unitCode}>
            Start Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
