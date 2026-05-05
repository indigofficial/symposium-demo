import { create } from "zustand";
import { persist } from "zustand/middleware";
import student1 from "../assets/avatars/student-1.png";
import student2 from "../assets/avatars/student-2.png";
import student3 from "../assets/avatars/student-3.png";
import student4 from "../assets/avatars/student-4.png";
import student5 from "../assets/avatars/student-5.png";
import student6 from "../assets/avatars/student-6.png";

export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  timezone?: string;
  studyTimes?: string[];
  goal?: string;
  challenge?: string;
  units?: string[];
  completedUnits?: string[];
  socialLinks?: SocialLinks;
  isPrivate?: boolean;
  level: number;
  xp: number;
  streak: number;
  lastActive?: string;
  online: boolean;
  friends: string[];
  avatar?: string;
}

export interface SessionFeedback {
  id: string;
  rating: number;
  text?: string;
}

export interface Session {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  style: "Facilitated" | "Collaborative";
  unitCode: string;
  objectives: string[];
  participants: string[];
  interestedUsers?: string[];
  status: "scheduled" | "active" | "completed";
  scheduledFor?: string;
  hostLevel?: number;
  hostTeachingScore?: number;
  handsUp?: string[];
  everyoneMuted?: boolean;
  feedbacks?: SessionFeedback[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type?: "text" | "session-invite";
  sessionId?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  messages: Message[];
  isGroup: boolean;
  name?: string;
}

export interface MatchRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "ignored";
}

export interface TrendingTopic {
  topic: string;
  mentions: number;
  unitCode: string;
}

export interface LevelUpEvent {
  id: string;
  newLevel: number;
  reason?: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  sessions: Session[];
  conversations: Conversation[];
  matchRequests: MatchRequest[];
  removedNetworkUsers: string[];
  blockedUsers: string[];
  trendingTopics: TrendingTopic[];
  activeSessionId: string | null;
  levelUpEvent: LevelUpEvent | null;

  setCurrentUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  ensureDemoMatchRequest: () => void;

  addSession: (session: Session) => void;
  hostSession: (session: Omit<Session, "id" | "status" | "participants">, isScheduled: boolean, scheduledFor?: string) => string;
  joinSession: (sessionId: string, userId: string) => void;
  showInterest: (sessionId: string, userId: string) => void;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string | null) => void;
  clearActiveSession: () => void;
  toggleHand: (sessionId: string, userId: string) => void;
  setEveryoneMuted: (sessionId: string, muted: boolean) => void;
  addFeedback: (sessionId: string, rating: number, text?: string) => void;

  sendMessage: (conversationId: string, senderId: string, text: string) => void;
  createGroupChat: (name: string, participantIds: string[]) => string;
  inviteToSession: (conversationId: string, sessionId: string, fromUserId: string) => void;

  sendMatchRequest: (fromUserId: string, toUserId: string) => string;
  acceptMatchRequest: (requestId: string) => void;
  ignoreMatchRequest: (requestId: string) => void;
  removeFromNetwork: (userId: string) => void;
  blockUser: (userId: string) => void;

  getMatchPercentage: (otherUserId: string) => number;

  addXp: (amount: number, reason?: string) => void;
  incrementStreak: () => void;
  clearLevelUpEvent: () => void;
}

const generateMockUsers = (): User[] => [
  {
    id: "user_1",
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@uni.edu",
    bio: "Computer Science major, love late night coding.",
    units: ["COMP1010", "MATH101"],
    completedUnits: ["COMP1000", "ENGL101"],
    studyTimes: ["Late Night"],
    goal: "Pass data structures",
    challenge: "Procrastination",
    socialLinks: { github: "alicesmith", twitter: "alice_codes" },
    level: 4,
    xp: 850,
    streak: 3,
    online: true,
    friends: ["user_2"],
    avatar: student1,
  },
  {
    id: "user_2",
    firstName: "Bob",
    lastName: "Jones",
    email: "bob@uni.edu",
    bio: "Pre-med. Always in the library.",
    units: ["BIOL200", "CHEM101"],
    completedUnits: ["BIOL100", "CHEM100"],
    studyTimes: ["Early Morning", "Morning"],
    goal: "Med school applications",
    challenge: "Time management",
    socialLinks: { linkedin: "bobjones" },
    level: 2,
    xp: 450,
    streak: 1,
    online: false,
    friends: ["user_1", "user_3"],
    avatar: student2,
  },
  {
    id: "user_3",
    firstName: "Charlie",
    lastName: "Davis",
    email: "charlie@uni.edu",
    bio: "Engineering student.",
    units: ["MATH101", "PHYS101", "COMP1010"],
    completedUnits: ["MATH100", "PHYS100"],
    studyTimes: ["Afternoon", "Evening"],
    goal: "Build a robot",
    challenge: "Calculus",
    socialLinks: { website: "charliedavis.dev" },
    level: 5,
    xp: 1100,
    streak: 5,
    online: true,
    friends: ["user_2"],
    avatar: student3,
  },
  {
    id: "user_4",
    firstName: "Diana",
    lastName: "Evans",
    email: "diana@uni.edu",
    bio: "Psychology major. Analyzing behavior.",
    units: ["PSYC101", "ECON202"],
    completedUnits: ["PSYC100"],
    studyTimes: ["Morning"],
    goal: "Research assistant position",
    challenge: "Statistics",
    level: 3,
    xp: 600,
    streak: 2,
    online: true,
    friends: ["user_5"],
    avatar: student4,
  },
  {
    id: "user_5",
    firstName: "Ethan",
    lastName: "Ford",
    email: "ethan@uni.edu",
    bio: "Business and Economics.",
    units: ["ECON202", "MATH101"],
    completedUnits: ["ECON101"],
    studyTimes: ["Evening", "Late Night"],
    goal: "Start a company",
    challenge: "Networking",
    level: 1,
    xp: 150,
    streak: 0,
    online: false,
    friends: ["user_4"],
    avatar: student5,
  },
  {
    id: "user_6",
    firstName: "Fiona",
    lastName: "Garcia",
    email: "fiona@uni.edu",
    bio: "Computer Science and Biology double major.",
    units: ["COMP2010", "BIOL200"],
    completedUnits: ["COMP1010", "BIOL100"],
    studyTimes: ["Afternoon", "Late Night"],
    goal: "Bioinformatics research",
    challenge: "Balancing workload",
    socialLinks: { github: "fionag", linkedin: "fionagarcia" },
    level: 6,
    xp: 1300,
    streak: 7,
    online: true,
    friends: [],
    avatar: student6,
  }
];

const generateMockSessions = (): Session[] => [
  {
    id: "session_1",
    title: "COMP1010 Midterm Review",
    hostId: "user_1",
    hostName: "Alice Smith",
    style: "Facilitated",
    unitCode: "COMP1010",
    objectives: ["Review loops", "Go over pointers"],
    participants: ["user_2"],
    interestedUsers: [],
    status: "scheduled",
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    hostTeachingScore: 4.5,
  },
  {
    id: "session_2",
    title: "Cell Biology Study Hall",
    hostId: "user_2",
    hostName: "Bob Jones",
    style: "Collaborative",
    unitCode: "BIOL200",
    objectives: ["Review chapter 4", "Discuss mitosis"],
    participants: [],
    interestedUsers: [],
    status: "active",
    hostLevel: 2,
  },
  {
    id: "session_3",
    title: "Calculus Homework Help",
    hostId: "user_3",
    hostName: "Charlie Davis",
    style: "Collaborative",
    unitCode: "MATH101",
    objectives: ["Derivatives", "Integrals"],
    participants: ["user_1", "user_5"],
    interestedUsers: [],
    status: "active",
    hostLevel: 5,
  },
  {
    id: "session_4",
    title: "Psychology Group Discussion",
    hostId: "user_4",
    hostName: "Diana Evans",
    style: "Collaborative",
    unitCode: "PSYC101",
    objectives: ["Discuss Freud", "Review case studies"],
    participants: [],
    interestedUsers: ["user_1"],
    status: "scheduled",
    scheduledFor: new Date(Date.now() + 172800000).toISOString(),
    hostLevel: 3,
  }
];

const generateMockConversations = (): Conversation[] => [
  {
    id: "conv_1",
    participantIds: ["user_1", "user_2"],
    isGroup: false,
    messages: [
      { id: "m1", senderId: "user_1", text: "Hey Bob, want to study biology later?", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: "m2", senderId: "user_2", text: "Sure Alice, I'll be online around 8 PM.", timestamp: new Date(Date.now() - 3500000).toISOString() },
    ]
  }
];

const generateMockTrendingTopics = (): TrendingTopic[] => [
  { topic: "Midterm Review", mentions: 142, unitCode: "COMP1010" },
  { topic: "Cell Division", mentions: 89, unitCode: "BIOL200" },
  { topic: "Derivatives", mentions: 56, unitCode: "MATH101" },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: generateMockUsers(),
      sessions: generateMockSessions(),
      conversations: generateMockConversations(),
      matchRequests: [
        { id: "req_1", fromUserId: "user_3", toUserId: "user_1", status: "pending" }
      ],
      removedNetworkUsers: [],
      blockedUsers: [],
      trendingTopics: generateMockTrendingTopics(),
      activeSessionId: null,
      levelUpEvent: null,

      setCurrentUser: (user) => {
        if (user) {
          set((s) => {
            const exists = s.users.some((u) => u.id === user.id);
            return {
              currentUser: user,
              users: exists
                ? s.users.map((u) => (u.id === user.id ? user : u))
                : [...s.users, user],
            };
          });
          get().ensureDemoMatchRequest();
        } else {
          set({ currentUser: null });
        }
      },

      ensureDemoMatchRequest: () => {
        const state = get();
        const user = state.currentUser;
        if (!user || user.id === "user_3") return;

        const userInList = state.users.some((u) => u.id === user.id);
        if (!userInList) {
          set((s) => ({ users: [...s.users, user] }));
        }

        const hasIncoming = state.matchRequests.some(
          (r) => r.toUserId === user.id && r.status === "pending"
        );
        if (!hasIncoming) {
          set((s) => ({
            matchRequests: [
              ...s.matchRequests,
              {
                id: "req_sim_" + Date.now(),
                fromUserId: "user_3",
                toUserId: user.id,
                status: "pending",
              },
            ],
          }));
        }
      },

      updateUser: (updates) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
          users: state.currentUser
            ? state.users.map(u => u.id === state.currentUser!.id ? { ...u, ...updates } : u)
            : state.users
        })),

      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),

      hostSession: (sessionData, isScheduled, scheduledFor) => {
        const id = "session_" + Date.now();
        const state = get();
        const newSession: Session = {
          ...sessionData,
          id,
          status: isScheduled ? "scheduled" : "active",
          participants: isScheduled ? [] : [sessionData.hostId],
          interestedUsers: [],
          scheduledFor: isScheduled ? scheduledFor : undefined,
          hostLevel: state.currentUser?.level || 1,
          handsUp: [],
          everyoneMuted: false,
          feedbacks: [],
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
          activeSessionId: isScheduled ? state.activeSessionId : id,
        }));

        get().addXp(70, "Hosted a session");
        get().incrementStreak();

        return id;
      },

      joinSession: (sessionId, userId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId && !s.participants.includes(userId)
              ? { ...s, participants: [...s.participants, userId] }
              : s
          ),
          activeSessionId: sessionId,
        }));

        get().addXp(50, "Joined a session");
        get().incrementStreak();
      },

      showInterest: (sessionId, userId) => {
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id === sessionId) {
              const interested = s.interestedUsers || [];
              if (interested.includes(userId)) {
                return { ...s, interestedUsers: interested.filter(id => id !== userId) };
              } else {
                return { ...s, interestedUsers: [...interested, userId] };
              }
            }
            return s;
          })
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
        }));
      },

      setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
      clearActiveSession: () => set({ activeSessionId: null }),

      toggleHand: (sessionId, userId) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const hands = s.handsUp || [];
            return hands.includes(userId)
              ? { ...s, handsUp: hands.filter(id => id !== userId) }
              : { ...s, handsUp: [...hands, userId] };
          })
        })),

      setEveryoneMuted: (sessionId, muted) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, everyoneMuted: muted } : s
          )
        })),

      addFeedback: (sessionId, rating, text) => {
        const id = "fb_" + Date.now();
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, feedbacks: [...(s.feedbacks || []), { id, rating, text }] }
              : s
          )
        }));
        get().addXp(10, "Left session feedback");
      },

      sendMessage: (conversationId, senderId, text) => {
        const newMessage: Message = {
          id: "msg_" + Date.now(),
          senderId,
          text,
          timestamp: new Date().toISOString(),
          type: "text",
        };
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId ? { ...c, messages: [...c.messages, newMessage] } : c
          )
        }));
      },

      createGroupChat: (name, participantIds) => {
        const id = "conv_" + Date.now();
        const state = get();
        const currentUser = state.currentUser;
        if (!currentUser) return id;

        const allParticipantIds = Array.from(new Set([...participantIds, currentUser.id]));

        const newConv: Conversation = {
          id,
          participantIds: allParticipantIds,
          isGroup: true,
          name,
          messages: []
        };

        set((state) => ({
          conversations: [...state.conversations, newConv]
        }));

        return id;
      },

      inviteToSession: (conversationId, sessionId, fromUserId) => {
        const state = get();
        const session = state.sessions.find(s => s.id === sessionId);
        if (!session) return;
        const newMessage: Message = {
          id: "msg_" + Date.now(),
          senderId: fromUserId,
          text: `Invited you to "${session.title}"`,
          timestamp: new Date().toISOString(),
          type: "session-invite",
          sessionId,
        };
        set((s) => ({
          conversations: s.conversations.map(c =>
            c.id === conversationId ? { ...c, messages: [...c.messages, newMessage] } : c
          )
        }));
      },

      sendMatchRequest: (fromUserId, toUserId) => {
        const id = "req_" + Date.now();
        const state = get();

        set((s) => ({
          matchRequests: [...s.matchRequests, { id, fromUserId, toUserId, status: "pending" }],
        }));

        const existingConv = state.conversations.find(
          (c) =>
            !c.isGroup &&
            c.participantIds.includes(fromUserId) &&
            c.participantIds.includes(toUserId)
        );

        let convId = existingConv?.id;
        if (!existingConv) {
          convId = "conv_" + Date.now();
          set((s) => ({
            conversations: [
              ...s.conversations,
              {
                id: convId!,
                participantIds: [fromUserId, toUserId],
                isGroup: false,
                messages: [],
              },
            ],
          }));
        }

        return convId!;
      },

      acceptMatchRequest: (requestId) => {
        const state = get();
        const req = state.matchRequests.find(r => r.id === requestId);

        if (req && state.currentUser) {
          set((state) => ({
            matchRequests: state.matchRequests.map(r => r.id === requestId ? { ...r, status: "accepted" } : r),
            currentUser: {
              ...state.currentUser!,
              friends: [...(state.currentUser?.friends || []), req.fromUserId]
            },
            users: state.users.map(u => {
              if (u.id === state.currentUser?.id) {
                return { ...u, friends: [...(u.friends || []), req.fromUserId] };
              }
              if (u.id === req.fromUserId) {
                return { ...u, friends: [...(u.friends || []), state.currentUser!.id] };
              }
              return u;
            })
          }));

          const existingConv = state.conversations.find(c =>
            !c.isGroup && c.participantIds.includes(req.fromUserId) && c.participantIds.includes(state.currentUser!.id)
          );

          if (!existingConv) {
            set((state) => ({
              conversations: [...state.conversations, {
                id: "conv_" + Date.now(),
                participantIds: [req.fromUserId, state.currentUser!.id],
                isGroup: false,
                messages: []
              }]
            }));
          }

          get().addXp(20, "Made a new friend");
        }
      },

      ignoreMatchRequest: (requestId) => {
        const state = get();
        const req = state.matchRequests.find((r) => r.id === requestId);
        if (!req) return;

        set((s) => ({
          matchRequests: s.matchRequests.map((r) =>
            r.id === requestId ? { ...r, status: "ignored" } : r
          ),
          conversations: s.conversations.filter(
            (c) =>
              !(
                !c.isGroup &&
                c.messages.length === 0 &&
                c.participantIds.includes(req.fromUserId) &&
                c.participantIds.includes(req.toUserId)
              )
          ),
        }));
      },

      removeFromNetwork: (userId) => {
        set((state) => ({
          removedNetworkUsers: [...state.removedNetworkUsers, userId]
        }));
      },

      blockUser: (userId) => {
        set((state) => ({
          blockedUsers: [...state.blockedUsers, userId],
          removedNetworkUsers: [...state.removedNetworkUsers, userId],
        }));
      },

      getMatchPercentage: (otherUserId) => {
        const state = get();
        const currentUser = state.currentUser;
        const otherUser = state.users.find(u => u.id === otherUserId);

        if (!currentUser || !otherUser) return 40;

        // Deterministic per-pair variance (0–18 pts) based on both user IDs
        const pairKey = [currentUser.id, otherUser.id].sort().join("");
        const idHash = pairKey.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const pairVariance = idHash % 19; // 0–18

        let score = 30 + pairVariance; // Base score now varies 30–48

        // Shared units (up to 36 pts, 12 per unit)
        const sharedUnits = (currentUser.units || []).filter(u => (otherUser.units || []).includes(u));
        if (sharedUnits.length > 0) {
          score += Math.min(36, sharedUnits.length * 12);
        }

        // Study time overlap (up to 12 pts)
        const sharedTimes = (currentUser.studyTimes || []).filter(t => (otherUser.studyTimes || []).includes(t));
        score += Math.min(12, sharedTimes.length * 6);

        // Goals/challenges overlap (up to 8 pts) - simple keyword match
        const myGoalWords = (currentUser.goal || "").toLowerCase().split(" ");
        const otherGoalWords = (otherUser.goal || "").toLowerCase().split(" ");
        const sharedWords = myGoalWords.filter(w => w.length > 3 && otherGoalWords.includes(w));
        if (sharedWords.length > 0) score += 8;

        // Level proximity bonus (up to 6 pts) — closer levels = more in common
        const levelDiff = Math.abs(currentUser.level - otherUser.level);
        score += Math.max(0, 6 - levelDiff * 2);

        return Math.min(99, Math.max(32, score));
      },

      addXp: (amount, reason) =>
        set((state) => {
          if (!state.currentUser) return state;
          const oldLevel = state.currentUser.level;
          const newXp = state.currentUser.xp + amount;
          const newLevel = Math.floor(newXp / 200) + 1;

          const updatedUser = {
            ...state.currentUser,
            xp: newXp,
            level: newLevel,
          };

          const leveledUp = newLevel > oldLevel;

          return {
            currentUser: updatedUser,
            users: state.users.map(u => u.id === state.currentUser?.id ? updatedUser : u),
            levelUpEvent: leveledUp
              ? { id: "lvl_" + Date.now(), newLevel, reason }
              : state.levelUpEvent,
          };
        }),

      clearLevelUpEvent: () => set({ levelUpEvent: null }),

      incrementStreak: () =>
        set((state) => {
          if (!state.currentUser) return state;

          const now = new Date();
          const today = now.toISOString().split('T')[0];

          const lastActiveDate = state.currentUser.lastActive
            ? state.currentUser.lastActive.split('T')[0]
            : null;

          if (lastActiveDate === today) {
            return state; // Already active today
          }

          let newStreak = state.currentUser.streak;

          if (lastActiveDate) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastActiveDate === yesterday.toISOString().split('T')[0]) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }

          const updatedUser = {
            ...state.currentUser,
            streak: newStreak,
            lastActive: now.toISOString(),
          };

          return {
            currentUser: updatedUser,
            users: state.users.map(u => u.id === state.currentUser?.id ? updatedUser : u)
          };
        }),
    }),
    {
      name: "symposium-state",
    }
  )
);
