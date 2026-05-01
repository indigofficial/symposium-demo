import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { useAppStore } from "../lib/store";

export default function Home() {
  const [, setLocation] = useLocation();
  const currentUser = useAppStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser) {
      setLocation("/dashboard");
    }
  }, [currentUser, setLocation]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full p-6 flex justify-between items-center">
        <h1 className="font-serif text-2xl font-bold text-primary">Symposium</h1>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-foreground">
            A calm place to study, <br/>
            <span className="text-primary italic">together.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
            Find study buddies, join focused sessions, and build your academic network in a space designed for students.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto text-md px-8">
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-md px-8 bg-transparent">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
