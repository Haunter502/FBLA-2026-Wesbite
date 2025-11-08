import { relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

// Helper function for IDs
const cuid = () => createId();

// Enums (stored as text in SQLite)
export const userRoles = ["STUDENT", "TEACHER", "ADMIN"] as const;
export type UserRole = (typeof userRoles)[number];

export const lessonTypes = ["VIDEO", "READING", "EXERCISE"] as const;
export type LessonType = (typeof lessonTypes)[number];

export const progressStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
export type ProgressStatus = (typeof progressStatuses)[number];

export const tutoringRequestTypes = ["SCHEDULED", "IMMEDIATE"] as const;
export type TutoringRequestType = (typeof tutoringRequestTypes)[number];

export const tutoringRequestStatuses = ["PENDING", "MATCHED", "COMPLETED", "CANCELLED"] as const;
export type TutoringRequestStatus = (typeof tutoringRequestStatuses)[number];

// === NEXTAUTH TABLES ===
export const users = sqliteTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    name: text("name"),
    email: text("email").unique().notNull(),
    emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
    image: text("image"),
    password: text("password"), // Hashed password for credentials auth
    role: text("role").$type<UserRole>().default("STUDENT").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    emailIdx: index("user_email_idx").on(table.email),
    roleIdx: index("user_role_idx").on(table.role),
  })
);

export const accounts = sqliteTable(
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
  (table) => ({
    compoundKey: primaryKey({ columns: [table.provider, table.providerAccountId] }),
    userIdIdx: index("account_userId_idx").on(table.userId),
  })
);

export const sessions = sqliteTable(
  "session",
  {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    userIdIdx: index("session_userId_idx").on(table.userId),
  })
);

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.identifier, table.token] }),
  })
);

// === CORE APP TABLES ===
export const units = sqliteTable(
  "unit",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    slug: text("slug").unique().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    order: integer("order").notNull(),
    heroImage: text("heroImage"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    slugIdx: index("unit_slug_idx").on(table.slug),
    orderIdx: index("unit_order_idx").on(table.order),
  })
);

export const lessons = sqliteTable(
  "lesson",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    slug: text("slug").unique().notNull(),
    unitId: text("unitId")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    type: text("type").$type<LessonType>().notNull(),
    khanUrl: text("khanUrl"),
    youtubeId: text("youtubeId"),
    duration: integer("duration"), // minutes
    order: integer("order").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    unitIdIdx: index("lesson_unitId_idx").on(table.unitId),
    slugIdx: index("lesson_slug_idx").on(table.slug),
    orderIdx: index("lesson_order_idx").on(table.order),
  })
);

export const quizzes = sqliteTable(
  "quiz",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    unitId: text("unitId")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    timeLimit: integer("timeLimit"), // minutes
    questions: text("questions", { mode: "json" }).notNull(), // JSON array
    passingScore: integer("passingScore").default(70).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    unitIdIdx: index("quiz_unitId_idx").on(table.unitId),
  })
);

export const tests = sqliteTable(
  "test",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    unitId: text("unitId")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    timeLimit: integer("timeLimit"), // minutes
    questions: text("questions", { mode: "json" }).notNull(), // JSON array
    passingScore: integer("passingScore").default(70).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    unitIdIdx: index("test_unitId_idx").on(table.unitId),
  })
);

export const skills = sqliteTable(
  "skill",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    slug: text("slug").unique().notNull(),
    name: text("name").notNull(),
    unitId: text("unitId")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    description: text("description"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    slugIdx: index("skill_slug_idx").on(table.slug),
    unitIdIdx: index("skill_unitId_idx").on(table.unitId),
  })
);

export const flashcardSets = sqliteTable(
  "flashcardSet",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    lessonId: text("lessonId").references(() => lessons.id, { onDelete: "cascade" }),
    unitId: text("unitId").references(() => units.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    lessonIdIdx: index("flashcardSet_lessonId_idx").on(table.lessonId),
    unitIdIdx: index("flashcardSet_unitId_idx").on(table.unitId),
  })
);

export const flashcards = sqliteTable(
  "flashcard",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    setId: text("setId")
      .notNull()
      .references(() => flashcardSets.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    hint: text("hint"),
    order: integer("order").default(0).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    setIdIdx: index("flashcard_setId_idx").on(table.setId),
  })
);

export const progress = sqliteTable(
  "progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    unitId: text("unitId").references(() => units.id, { onDelete: "cascade" }),
    lessonId: text("lessonId").references(() => lessons.id, { onDelete: "cascade" }),
    quizId: text("quizId").references(() => quizzes.id, { onDelete: "cascade" }),
    testId: text("testId").references(() => tests.id, { onDelete: "cascade" }),
    status: text("status").$type<ProgressStatus>().default("NOT_STARTED").notNull(),
    score: integer("score"),
    lastViewedAt: integer("lastViewedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    completedAt: integer("completedAt", { mode: "timestamp_ms" }),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("progress_userId_idx").on(table.userId),
    unitIdIdx: index("progress_unitId_idx").on(table.unitId),
    lessonIdIdx: index("progress_lessonId_idx").on(table.lessonId),
    quizIdIdx: index("progress_quizId_idx").on(table.quizId),
    testIdIdx: index("progress_testId_idx").on(table.testId),
    uniqueProgress: uniqueIndex("progress_unique_idx").on(
      table.userId,
      table.unitId,
      table.lessonId,
      table.quizId,
      table.testId
    ),
  })
);

export const badges = sqliteTable(
  "badge",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    slug: text("slug").unique().notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    icon: text("icon"), // icon name or URL
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    slugIdx: index("badge_slug_idx").on(table.slug),
  })
);

export const userBadges = sqliteTable(
  "userBadge",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: text("badgeId")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    awardedAt: integer("awardedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    reason: text("reason"),
  },
  (table) => ({
    userIdIdx: index("userBadge_userId_idx").on(table.userId),
    badgeIdIdx: index("userBadge_badgeId_idx").on(table.badgeId),
    uniqueUserBadge: uniqueIndex("userBadge_unique_idx").on(table.userId, table.badgeId),
  })
);

export const streaks = sqliteTable(
  "streak",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    userId: text("userId")
      .unique()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    current: integer("current").default(0).notNull(),
    longest: integer("longest").default(0).notNull(),
    lastActiveAt: integer("lastActiveAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("streak_userId_idx").on(table.userId),
  })
);

export const reviews = sqliteTable(
  "review",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1-5
    comment: text("comment"),
    moderated: integer("moderated", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("review_userId_idx").on(table.userId),
    moderatedIdx: index("review_moderated_idx").on(table.moderated),
  })
);

export const teachers = sqliteTable(
  "teacher",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    name: text("name").notNull(),
    avatar: text("avatar"),
    bio: text("bio").notNull(),
    email: text("email").notNull(),
    officeHours: text("officeHours"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    emailIdx: index("teacher_email_idx").on(table.email),
  })
);

export const tutoringSlots = sqliteTable(
  "tutoringSlot",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    teacherId: text("teacherId")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    start: integer("start", { mode: "timestamp_ms" }).notNull(),
    end: integer("end", { mode: "timestamp_ms" }).notNull(),
    capacity: integer("capacity").default(5).notNull(),
    spotsLeft: integer("spotsLeft").default(5).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    teacherIdIdx: index("tutoringSlot_teacherId_idx").on(table.teacherId),
    startIdx: index("tutoringSlot_start_idx").on(table.start),
  })
);

export const tutoringRequests = sqliteTable(
  "tutoringRequest",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<TutoringRequestType>().notNull(),
    topic: text("topic"),
    status: text("status").$type<TutoringRequestStatus>().default("PENDING").notNull(),
    scheduledSlotId: text("scheduledSlotId"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("tutoringRequest_userId_idx").on(table.userId),
    statusIdx: index("tutoringRequest_status_idx").on(table.status),
    typeIdx: index("tutoringRequest_type_idx").on(table.type),
  })
);

export const eventLogs = sqliteTable(
  "eventLog",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // e.g., "lesson_completed", "quiz_attempted"
    payload: text("payload", { mode: "json" }).notNull(), // Flexible JSON data
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("eventLog_userId_idx").on(table.userId),
    typeIdx: index("eventLog_type_idx").on(table.type),
    createdAtIdx: index("eventLog_createdAt_idx").on(table.createdAt),
  })
);

// === RELATIONS ===
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  progress: many(progress),
  badges: many(userBadges),
  streak: many(streaks),
  reviews: many(reviews),
  tutoringRequests: many(tutoringRequests),
  eventLogs: many(eventLogs),
}));

export const unitsRelations = relations(units, ({ many }) => ({
  lessons: many(lessons),
  quizzes: many(quizzes),
  tests: many(tests),
  skills: many(skills),
  flashcardSets: many(flashcardSets),
  progress: many(progress),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  flashcardSets: many(flashcardSets),
  progress: many(progress),
}));

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

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  set: one(flashcardSets, {
    fields: [flashcards.setId],
    references: [flashcardSets.id],
  }),
}));

export const teachersRelations = relations(teachers, ({ many }) => ({
  tutoringSlots: many(tutoringSlots),
}));

export const tutoringSlotsRelations = relations(tutoringSlots, ({ one }) => ({
  teacher: one(teachers, {
    fields: [tutoringSlots.teacherId],
    references: [teachers.id],
  }),
}));

// Type exports for use in the app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type Test = typeof tests.$inferSelect;
export type NewTest = typeof tests.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type FlashcardSet = typeof flashcardSets.$inferSelect;
export type NewFlashcardSet = typeof flashcardSets.$inferInsert;
export type Flashcard = typeof flashcards.$inferSelect;
export type NewFlashcard = typeof flashcards.$inferInsert;
export type Progress = typeof progress.$inferSelect;
export type NewProgress = typeof progress.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;
export type UserBadge = typeof userBadges.$inferSelect;
export type NewUserBadge = typeof userBadges.$inferInsert;
export type Streak = typeof streaks.$inferSelect;
export type NewStreak = typeof streaks.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
export type TutoringSlot = typeof tutoringSlots.$inferSelect;
export type NewTutoringSlot = typeof tutoringSlots.$inferInsert;
export type TutoringRequest = typeof tutoringRequests.$inferSelect;
export type NewTutoringRequest = typeof tutoringRequests.$inferInsert;
export type EventLog = typeof eventLogs.$inferSelect;
export type NewEventLog = typeof eventLogs.$inferInsert;

