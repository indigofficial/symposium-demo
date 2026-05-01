import { useAppStore } from "../lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const XP_TABLE: { label: string; xp: number }[] = [
  { label: "Host a session", xp: 70 },
  { label: "Join a session", xp: 50 },
  { label: "Make a new friend", xp: 20 },
  { label: "Rate a session", xp: 10 },
];

export function LevelUpModal() {
  const { levelUpEvent, clearLevelUpEvent } = useAppStore();
  const open = !!levelUpEvent;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) clearLevelUpEvent(); }}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader className="text-center items-center pt-2">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-2"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <DialogTitle className="font-serif text-3xl">Level Up!</DialogTitle>
          <DialogDescription>
            You've reached <span className="font-semibold text-foreground">Level {levelUpEvent?.newLevel}</span>
            {levelUpEvent?.reason ? ` — ${levelUpEvent.reason}.` : "."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">
            Earn more XP
          </p>
          <div className="rounded-lg border bg-muted/40 divide-y">
            {XP_TABLE.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>{row.label}</span>
                <span className="font-mono font-medium text-primary">+{row.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={clearLevelUpEvent} className="w-full">Keep Going</Button>
      </DialogContent>
    </Dialog>
  );
}
