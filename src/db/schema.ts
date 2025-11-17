import {
  pgTable,
  sqlite3Table,
  text,
  integer,
  boolean,
  timestamp,
  json,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Detect database type from environment
const isPostgres = process.env.DATABASE_URL?.includes("postgresql");

// Database table factory
const table = isPostgres ? pgTable : sqlite3Table;

// ========== AUTH TABLES (NextAuth/Auth.js) ==========

export const users = table("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified"),
  image: text("image"),
  password: text("password"), // For credentials auth
  role: text("role", { enum: ["STUDENT", "TEACHER", "ADMIN"] }).default("STUDENT"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  progress: many(progress),
  badges: many(userBadges),
  streaks: many(streaks),
  reviews: many(reviews),
  tutoringRequests: many(tutoringRequests),
  eventLogs: many(eventLogs),
}));

export const accounts = table(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
    index("account_userId_idx").on(account.userId),
  ]
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessions = table(
  "session",
  {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires").notNull(),
  },
  (session) => [index("session_userId_idx").on(session.userId)]
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const verificationTokens = table(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires").notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ========== LEARNING CONTENT TABLES ==========

export const units = table(
  "unit",
  {
    id: text("id").primaryKey(),
    slug: text("slug").unique().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    order: integer("order").notNull(),
    heroImage: text("heroImage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (unit) => [
    index("unit_slug_idx").on(unit.slug),
    index("unit_order_idx").on(unit.order),
  ]
);

export const unitsRelations = relations(units, ({ many }) => ({
  lessons: many(lessons),
  quizzes: many(quizzes),
  tests: many(tests),
  skills: many(skills),
  flashcardSets: many(flashcardSets),
  progress: many(progress),
}));

export const lessons = table(
  "lesson",
  {
    id: text("id").primaryKey(),
    slug: text("slug").unique().notNull(),
    unitId: text("unitId")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    type: text("type", { enum: ["VIDEO", "READING", "EXERCISE"] }).notNull(),
    khanUrl: text("khanUrl"),
    youtubeId: text("youtubeId"),
    duration: integer("duration"), // minutes
    order: integer("order").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (lesson) => [
    index("lesson_unitId_idx").on(lesson.unitId),
    index("lesson_slug_idx").on(lesson.slug),
    index("lesson_order_idx").on(lesson.order),
  ]
);

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  flashcardSets: many(flashcardSets),
  progress: many(progress),
}));

export const quizzes = table(
  "quiz",
  {
    id: text("id").primaryKey(),
    unitId: text("unitId")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    timeLimit: integer("timeLimit"), // minutes
    questions: text("questions").notNull(), // JSON string
    passingScore: integer("passingScore").default(70).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (quiz) => [index("quiz_unitId_idx").on(quiz.unitId)]
);

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  unit: one(units, {
    fields: [quizzes.unitId],
    references: [units.id],
  }),
  progress: many(progress),
}));

export const tests = table(
  "test",
  {
    id: text("id").primaryKey(),
    unitId: text("unitId")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    timeLimit: integer("timeLimit"), // minutes
    questions: text("questions").notNull(), // JSON string
    passingScore: integer("passingScore").default(70).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (test) => [index("test_unitId_idx").on(test.unitId)]
);

export const testsRelations = relations(tests, ({ one, many }) => ({
  unit: one(units, {
    fields: [tests.unitId],
    references: [units.id],
  }),
  progress: many(progress),
}));

export const skills = table(
  "skill",
  {
    id: text("id").primaryKey(),
    slug: text("slug").unique().notNull(),
    name: text("name").notNull(),
    unitId: text("unitId")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (skill) => [
    index("skill_slug_idx").on(skill.slug),
    index("skill_unitId_idx").on(skill.unitId),
  ]
);

export const skillsRelations = relations(skills, ({ one }) => ({
  unit: one(units, {
    fields: [skills.unitId],
    references: [units.id],
  }),
}));

export const flashcardSets = table(
  "flashcardSet",
  {
    id: text("id").primaryKey(),
    lessonId: text("lessonId").references(() => lessons.id, {
      onDelete: "cascade",
    }),
    unitId: text("unitId").references(() => units.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (fcs) => [
    index("flashcardSet_lessonId_idx").on(fcs.lessonId),
    index("flashcardSet_unitId_idx").on(fcs.unitId),
  ]
);

export const flashcardSetsRelations = relations(flashcardSets, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [flashcardSets.lessonId],
    references: [lessons.id],
  }),
  unit: one(units, {
    fields: [flashcardSets.unitId],
    references: [units.id],
  }),
  flashcards: many(flashcards),
}));

export const flashcards = table(
  "flashcard",
  {
    id: text("id").primaryKey(),
    setId: text("setId")
      .notNull()
      .references(() => flashcardSets.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    hint: text("hint"),
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (fc) => [index("flashcard_setId_idx").on(fc.setId)]
);

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  set: one(flashcardSets, {
    fields: [flashcards.setId],
    references: [flashcardSets.id],
  }),
}));

// ========== PROGRESS TRACKING ==========

export const progress = table(
  "progress",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    unitId: text("unitId").references(() => units.id, { onDelete: "cascade" }),
    lessonId: text("lessonId").references(() => lessons.id, {
      onDelete: "cascade",
    }),
    quizId: text("quizId").references(() => quizzes.id, { onDelete: "cascade" }),
    testId: text("testId").references(() => tests.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
    })
      .default("NOT_STARTED")
      .notNull(),
    score: integer("score"),
    lastViewedAt: timestamp("lastViewedAt").defaultNow(),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (p) => [
    index("progress_userId_idx").on(p.userId),
    index("progress_unitId_idx").on(p.unitId),
    index("progress_lessonId_idx").on(p.lessonId),
    index("progress_quizId_idx").on(p.quizId),
    index("progress_testId_idx").on(p.testId),
  ]
);

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, {
    fields: [progress.userId],
    references: [users.id],
  }),
  unit: one(units, {
    fields: [progress.unitId],
    references: [units.id],
  }),
  lesson: one(lessons, {
    fields: [progress.lessonId],
    references: [lessons.id],
  }),
  quiz: one(quizzes, {
    fields: [progress.quizId],
    references: [quizzes.id],
  }),
  test: one(tests, {
    fields: [progress.testId],
    references: [tests.id],
  }),
}));

// ========== GAMIFICATION ==========

export const badges = table(
  "badge",
  {
    id: text("id").primaryKey(),
    slug: text("slug").unique().notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    icon: text("icon"), // icon name or URL
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (badge) => [index("badge_slug_idx").on(badge.slug)]
);

export const badgesRelations = relations(badges, ({ many }) => ({
  users: many(userBadges),
}));

export const userBadges = table(
  "userBadge",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: text("badgeId")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    awardedAt: timestamp("awardedAt").defaultNow().notNull(),
    reason: text("reason"),
  },
  (ub) => [
    index("userBadge_userId_idx").on(ub.userId),
    index("userBadge_badgeId_idx").on(ub.badgeId),
    uniqueIndex("userBadge_userId_badgeId_unique").on(ub.userId, ub.badgeId),
  ]
);

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const streaks = table(
  "streak",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .unique()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    current: integer("current").default(0).notNull(),
    longest: integer("longest").default(0).notNull(),
    lastActiveAt: timestamp("lastActiveAt").defaultNow(),
  },
  (streak) => [index("streak_userId_idx").on(streak.userId)]
);

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id],
  }),
}));

// ========== REVIEWS ==========

export const reviews = table(
  "review",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1-5
    comment: text("comment"),
    moderated: boolean("moderated").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (review) => [
    index("review_userId_idx").on(review.userId),
    index("review_moderated_idx").on(review.moderated),
  ]
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

// ========== TUTORING ==========

export const teachers = table(
  "teacher",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    avatar: text("avatar"),
    bio: text("bio").notNull(),
    email: text("email").notNull(),
    officeHours: text("officeHours"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (teacher) => [index("teacher_email_idx").on(teacher.email)]
);

export const teachersRelations = relations(teachers, ({ many }) => ({
  tutoringSlots: many(tutoringSlots),
}));

export const tutoringSlots = table(
  "tutoringSlot",
  {
    id: text("id").primaryKey(),
    teacherId: text("teacherId")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    start: timestamp("start").notNull(),
    end: timestamp("end").notNull(),
    capacity: integer("capacity").default(5).notNull(),
    spotsLeft: integer("spotsLeft").default(5).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (slot) => [
    index("tutoringSlot_teacherId_idx").on(slot.teacherId),
    index("tutoringSlot_start_idx").on(slot.start),
  ]
);

export const tutoringSlotsRelations = relations(tutoringSlots, ({ one }) => ({
  teacher: one(teachers, {
    fields: [tutoringSlots.teacherId],
    references: [teachers.id],
  }),
}));

export const tutoringRequests = table(
  "tutoringRequest",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["SCHEDULED", "IMMEDIATE"] }).notNull(),
    topic: text("topic"),
    status: text("status", {
      enum: ["PENDING", "MATCHED", "COMPLETED", "CANCELLED"],
    })
      .default("PENDING")
      .notNull(),
    scheduledSlotId: text("scheduledSlotId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (tr) => [
    index("tutoringRequest_userId_idx").on(tr.userId),
    index("tutoringRequest_status_idx").on(tr.status),
    index("tutoringRequest_type_idx").on(tr.type),
  ]
);

export const tutoringRequestsRelations = relations(tutoringRequests, ({ one }) => ({
  user: one(users, {
    fields: [tutoringRequests.userId],
    references: [users.id],
  }),
}));

// ========== ANALYTICS ==========

export const eventLogs = table(
  "eventLog",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // e.g., "lesson_completed", "quiz_attempted"
    payload: text("payload").notNull(), // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (el) => [
    index("eventLog_userId_idx").on(el.userId),
    index("eventLog_type_idx").on(el.type),
    index("eventLog_createdAt_idx").on(el.createdAt),
  ]
);

export const eventLogsRelations = relations(eventLogs, ({ one }) => ({
  user: one(users, {
    fields: [eventLogs.userId],
    references: [users.id],
  }),
}));

