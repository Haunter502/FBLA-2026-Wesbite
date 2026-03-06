import { relations } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/sqlite-core';

// User & Auth Tables
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: integer('emailVerified', { mode: 'timestamp' }),
    image: text('image'),
    password: text('password'), // Hashed password for credentials auth
    role: text('role', { enum: ['STUDENT', 'TEACHER', 'ADMIN'] })
      .notNull()
      .default('STUDENT'),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
  })
);

export const accounts = sqliteTable(
  'accounts',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => ({
    userIdIdx: index('accounts_userId_idx').on(table.userId),
    providerProviderAccountIdUnique: uniqueIndex(
      'accounts_provider_providerAccountId_unique'
    ).on(table.provider, table.providerAccountId),
  })
);

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    sessionToken: text('sessionToken').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    userIdIdx: index('sessions_userId_idx').on(table.userId),
  })
);

export const verificationTokens = sqliteTable(
  'verificationTokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    identifierTokenPk: primaryKey({ columns: [table.identifier, table.token] }),
  })
);

// Content Tables
export const units = sqliteTable(
  'units',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    order: integer('order').notNull(),
    heroImage: text('heroImage'),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    slugIdx: index('units_slug_idx').on(table.slug),
    orderIdx: index('units_order_idx').on(table.order),
  })
);

export const lessons = sqliteTable(
  'lessons',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text('slug').notNull().unique(),
    unitId: text('unitId')
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    type: text('type', { enum: ['VIDEO', 'READING', 'EXERCISE'] }).notNull(),
    khanUrl: text('khanUrl'),
    youtubeId: text('youtubeId'),
    duration: integer('duration'), // minutes
    order: integer('order').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    unitIdIdx: index('lessons_unitId_idx').on(table.unitId),
    slugIdx: index('lessons_slug_idx').on(table.slug),
    orderIdx: index('lessons_order_idx').on(table.order),
  })
);

export const quizzes = sqliteTable(
  'quizzes',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    unitId: text('unitId')
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    timeLimit: integer('timeLimit'), // minutes
    questions: text('questions', { mode: 'json' }).notNull(), // JSON string
    passingScore: integer('passingScore').notNull().default(70),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    unitIdIdx: index('quizzes_unitId_idx').on(table.unitId),
  })
);

export const tests = sqliteTable(
  'tests',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    unitId: text('unitId')
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    timeLimit: integer('timeLimit'), // minutes
    questions: text('questions', { mode: 'json' }).notNull(),
    passingScore: integer('passingScore').notNull().default(70),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    unitIdIdx: index('tests_unitId_idx').on(table.unitId),
  })
);

export const skills = sqliteTable(
  'skills',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    unitId: text('unitId')
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    description: text('description'),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    slugIdx: index('skills_slug_idx').on(table.slug),
    unitIdIdx: index('skills_unitId_idx').on(table.unitId),
  })
);

export const flashcardSets = sqliteTable(
  'flashcardSets',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    lessonId: text('lessonId').references(() => lessons.id, {
      onDelete: 'cascade',
    }),
    unitId: text('unitId').references(() => units.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    lessonIdIdx: index('flashcardSets_lessonId_idx').on(table.lessonId),
    unitIdIdx: index('flashcardSets_unitId_idx').on(table.unitId),
  })
);

export const flashcards = sqliteTable(
  'flashcards',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    setId: text('setId')
      .notNull()
      .references(() => flashcardSets.id, { onDelete: 'cascade' }),
    front: text('front').notNull(),
    back: text('back').notNull(),
    hint: text('hint'),
    order: integer('order').notNull().default(0),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    setIdIdx: index('flashcards_setId_idx').on(table.setId),
  })
);

export const progress = sqliteTable(
  'progress',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    unitId: text('unitId').references(() => units.id, { onDelete: 'cascade' }),
    lessonId: text('lessonId').references(() => lessons.id, {
      onDelete: 'cascade',
    }),
    quizId: text('quizId').references(() => quizzes.id, {
      onDelete: 'cascade',
    }),
    testId: text('testId').references(() => tests.id, { onDelete: 'cascade' }),
    status: text('status', {
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
    })
      .notNull()
      .default('NOT_STARTED'),
    score: integer('score'),
    lastViewedAt: integer('lastViewedAt', { mode: 'timestamp' }).$defaultFn(
      () => new Date()
    ),
    completedAt: integer('completedAt', { mode: 'timestamp' }),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('progress_userId_idx').on(table.userId),
    unitIdIdx: index('progress_unitId_idx').on(table.unitId),
    lessonIdIdx: index('progress_lessonId_idx').on(table.lessonId),
    quizIdIdx: index('progress_quizId_idx').on(table.quizId),
    testIdIdx: index('progress_testId_idx').on(table.testId),
  })
);

export const badges = sqliteTable(
  'badges',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    icon: text('icon'), // icon name or URL
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    slugIdx: index('badges_slug_idx').on(table.slug),
  })
);

export const userBadges = sqliteTable(
  'userBadges',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    badgeId: text('badgeId')
      .notNull()
      .references(() => badges.id, { onDelete: 'cascade' }),
    awardedAt: integer('awardedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    reason: text('reason'),
  },
  (table) => ({
    userIdIdx: index('userBadges_userId_idx').on(table.userId),
    badgeIdIdx: index('userBadges_badgeId_idx').on(table.badgeId),
    userBadgeUnique: uniqueIndex('userBadges_userId_badgeId_unique').on(
      table.userId,
      table.badgeId
    ),
  })
);

export const streaks = sqliteTable(
  'streaks',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    current: integer('current').notNull().default(0),
    longest: integer('longest').notNull().default(0),
    lastActiveAt: integer('lastActiveAt', { mode: 'timestamp' }).$defaultFn(
      () => new Date()
    ),
  },
  (table) => ({
    userIdIdx: index('streaks_userId_idx').on(table.userId),
  })
);

export const reviews = sqliteTable(
  'reviews',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(), // 1-5
    comment: text('comment'),
    moderated: integer('moderated', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('reviews_userId_idx').on(table.userId),
    moderatedIdx: index('reviews_moderated_idx').on(table.moderated),
  })
);

export const teachers = sqliteTable(
  'teachers',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    avatar: text('avatar'),
    bio: text('bio').notNull(),
    email: text('email').notNull(),
    officeHours: text('officeHours'),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    emailIdx: index('teachers_email_idx').on(table.email),
  })
);

export const tutoringSlots = sqliteTable(
  'tutoringSlots',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    teacherId: text('teacherId')
      .notNull()
      .references(() => teachers.id, { onDelete: 'cascade' }),
    start: integer('start', { mode: 'timestamp' }).notNull(),
    end: integer('end', { mode: 'timestamp' }).notNull(),
    capacity: integer('capacity').notNull().default(5),
    spotsLeft: integer('spotsLeft').notNull().default(5),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    teacherIdIdx: index('tutoringSlots_teacherId_idx').on(table.teacherId),
    startIdx: index('tutoringSlots_start_idx').on(table.start),
  })
);

export const tutoringRequests = sqliteTable(
  'tutoringRequests',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['SCHEDULED', 'IMMEDIATE'] }).notNull(),
    topic: text('topic'),
    status: text('status', {
      enum: ['PENDING', 'MATCHED', 'COMPLETED', 'CANCELLED'],
    })
      .notNull()
      .default('PENDING'),
    scheduledSlotId: text('scheduledSlotId'),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('tutoringRequests_userId_idx').on(table.userId),
    statusIdx: index('tutoringRequests_status_idx').on(table.status),
    typeIdx: index('tutoringRequests_type_idx').on(table.type),
  })
);

export const eventLogs = sqliteTable(
  'eventLogs',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    payload: text('payload', { mode: 'json' }).notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('eventLogs_userId_idx').on(table.userId),
    typeIdx: index('eventLogs_type_idx').on(table.type),
    createdAtIdx: index('eventLogs_createdAt_idx').on(table.createdAt),
  })
);

// Relations
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

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
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
  unit: one(units, { fields: [lessons.unitId], references: [units.id] }),
  flashcardSets: many(flashcardSets),
  progress: many(progress),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  unit: one(units, { fields: [quizzes.unitId], references: [units.id] }),
  progress: many(progress),
}));

export const testsRelations = relations(tests, ({ one, many }) => ({
  unit: one(units, { fields: [tests.unitId], references: [units.id] }),
  progress: many(progress),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  unit: one(units, { fields: [skills.unitId], references: [units.id] }),
}));

export const flashcardSetsRelations = relations(
  flashcardSets,
  ({ one, many }) => ({
    lesson: one(lessons, {
      fields: [flashcardSets.lessonId],
      references: [lessons.id],
    }),
    unit: one(units, { fields: [flashcardSets.unitId], references: [units.id] }),
    flashcards: many(flashcards),
  })
);

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  set: one(flashcardSets, {
    fields: [flashcards.setId],
    references: [flashcardSets.id],
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, { fields: [progress.userId], references: [users.id] }),
  unit: one(units, { fields: [progress.unitId], references: [units.id] }),
  lesson: one(lessons, {
    fields: [progress.lessonId],
    references: [lessons.id],
  }),
  quiz: one(quizzes, { fields: [progress.quizId], references: [quizzes.id] }),
  test: one(tests, { fields: [progress.testId], references: [tests.id] }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  users: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.userId], references: [users.id] }),
  badge: one(badges, { fields: [userBadges.badgeId], references: [badges.id] }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, { fields: [streaks.userId], references: [users.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
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

export const tutoringRequestsRelations = relations(
  tutoringRequests,
  ({ one }) => ({
    user: one(users, {
      fields: [tutoringRequests.userId],
      references: [users.id],
    }),
  })
);

export const eventLogsRelations = relations(eventLogs, ({ one }) => ({
  user: one(users, { fields: [eventLogs.userId], references: [users.id] }),
}));

