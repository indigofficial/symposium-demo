import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ProfileModal } from "../components/profile/profile-modal";
import { Button } from "../components/ui/button";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    setLocation("/dashboard");
  };

  if (!id) return null;

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Viewing profile...</p>
        <Button variant="outline" onClick={handleClose}>Back to Dashboard</Button>
      </div>
      <ProfileModal 
        userId={id} 
        mode="default" 
        open={open} 
        onOpenChange={(val) => {
          if (!val) handleClose();
        }} 
      />
    </div>
  );
}
