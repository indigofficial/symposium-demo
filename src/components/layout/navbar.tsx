import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../ui/button";
import { useAppStore } from "../../lib/store";
import { Bell, Flame, MessageSquare, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Progress } from "../ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Badge } from "../ui/badge";

export function Navbar() {
  const [location] = useLocation();
  const { currentUser, matchRequests, users } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  if (!currentUser) return null;

  const xpProgress = (currentUser.xp % 200) / 2;
  const incomingRequests = matchRequests.filter(
    (r) => r.toUserId === currentUser.id && r.status === "pending"
  );
  const pendingRequests = incomingRequests.length;

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link href="/dashboard">
        <span onClick={() => mobile && setIsMobileMenuOpen(false)} className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location === "/dashboard" ? "text-primary" : "text-muted-foreground"} ${mobile ? "block py-3 text-lg" : ""}`}>Dashboard</span>
      </Link>
      <Link href="/sessions">
        <span onClick={() => mobile && setIsMobileMenuOpen(false)} className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location.startsWith("/sessions") ? "text-primary" : "text-muted-foreground"} ${mobile ? "block py-3 text-lg" : ""}`}>Sessions</span>
      </Link>
      <Link href="/network">
        <span onClick={() => mobile && setIsMobileMenuOpen(false)} className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location === "/network" ? "text-primary" : "text-muted-foreground"} ${mobile ? "block py-3 text-lg" : ""}`}>Network</span>
      </Link>
      {/* <Link href="/messages">
        <span onClick={() => mobile && setIsMobileMenuOpen(false)} className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer flex items-center justify-between ${location === "/messages" ? "text-primary" : "text-muted-foreground"} ${mobile ? "py-3 text-lg" : ""}`}>
          Messages
          {mobile && pendingRequests > 0 && (
            <Badge variant="destructive" className="ml-2">{pendingRequests}</Badge>
          )}
        </span>
      </Link> */}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="font-serif text-xl text-primary text-left">Symposium</SheetTitle>
              </SheetHeader>
              <div className="py-6 flex flex-col">
                <NavLinks mobile />
              </div>
              <div className="mt-auto border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>{currentUser.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-xs text-muted-foreground">Lv {currentUser.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-orange-500">
                    <Flame className="h-4 w-4 mr-1" />
                    <span className="text-sm font-bold">{currentUser.streak}</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="font-serif font-semibold text-xl text-primary flex-shrink-0">
            Symposium
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 px-2 cursor-pointer hover:bg-muted/50">
                <span className="font-medium text-sm">Lvl {currentUser.level}</span>
                <div className="flex items-center text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-sm">
                  <Flame className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs font-bold">{currentUser.streak}</span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Level {currentUser.level}</h4>
                  <p className="text-xs text-muted-foreground mb-2">Keep studying to level up!</p>
                  <Progress value={xpProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right mt-1">{currentUser.xp % 200} / 200 XP</p>
                </div>
                <div className="text-sm pt-3 border-t">
                  <div className="flex items-center justify-between mb-1">
                    <strong>Current Streak</strong>
                    <div className="flex items-center text-orange-500">
                      <Flame className="h-4 w-4 mr-1" />
                      <span className="font-bold">{currentUser.streak} Days</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Join or host a session daily to keep your streak alive!</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="relative hidden sm:flex" asChild>
              <Link href="/messages">
                <MessageSquare className="h-5 w-5" />
                {pendingRequests > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Link>
            </Button>
            
            <Popover open={isNotifOpen} onOpenChange={setIsNotifOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative cursor-pointer" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  {pendingRequests > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                      {pendingRequests}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="px-4 py-3 border-b">
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-xs text-muted-foreground">
                    {pendingRequests > 0
                      ? `${pendingRequests} pending match request${pendingRequests === 1 ? "" : "s"}`
                      : "You're all caught up."}
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {incomingRequests.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No new notifications.
                    </div>
                  ) : (
                    incomingRequests.map((req) => {
                      const fromUser = users.find((u) => u.id === req.fromUserId);
                      if (!fromUser) return null;
                      return (
                        <Link
                          key={req.id}
                          href="/messages"
                          onClick={() => setIsNotifOpen(false)}
                        >
                          <div className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0">
                            <Avatar className="h-9 w-9 border border-border">
                              <AvatarImage src={fromUser.avatar} />
                              <AvatarFallback>{fromUser.firstName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-medium">{fromUser.firstName} {fromUser.lastName}</span>
                                {" "}sent you a match request.
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">Tap to respond</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
                <div className="px-4 py-2 border-t">
                  <Link href="/messages" onClick={() => setIsNotifOpen(false)}>
                    <span className="text-xs text-primary hover:underline cursor-pointer">
                      View all in Messages
                    </span>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
            
            <Link href={`/profile/${currentUser.id}`}>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 pr-2 rounded-full md:rounded-md transition-colors ml-1 border border-transparent hover:border-border">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.firstName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline-block truncate max-w-[100px]">
                  {currentUser.firstName}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
