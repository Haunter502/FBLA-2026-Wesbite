import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Enums
export const userRoles = ['STUDENT', 'TEACHER', 'ADMIN'] as const;
export const lessonTypes = ['VIDEO', 'READING', 'EXERCISE'] as const;
export const progressStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const;
export const tutoringRequestTypes = ['SCHEDULED', 'IMMEDIATE'] as const;
export const tutoringRequestStatuses = ['PENDING', 'MATCHED', 'COMPLETED', 'CANCELLED'] as const;

// Type exports
export type UserRole = typeof userRoles[number];
export type LessonType = typeof lessonTypes[number];
export type ProgressStatus = typeof progressStatuses[number];
export type TutoringRequestType = typeof tutoringRequestTypes[number];
export type TutoringRequestStatus = typeof tutoringRequestStatuses[number];

// Helper for timestamps
const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
};

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  image: text('image'),
  password: text('password'),
  role: text('role', { enum: userRoles }).notNull().default('STUDENT'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

// NextAuth tables
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => ({
  userIdIdx: index('accounts_user_id_idx').on(table.userId),
  providerIdx: uniqueIndex('accounts_provider_idx').on(table.provider, table.providerAccountId),
}));

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
}));

export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  identifierTokenIdx: uniqueIndex('verification_tokens_identifier_token_idx').on(table.identifier, table.token),
}));

// Units table
export const units = sqliteTable('units', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  order: integer('order').notNull(),
  heroImage: text('hero_image'),
  ...timestamps,
}, (table) => ({
  slugIdx: index('units_slug_idx').on(table.slug),
  orderIdx: index('units_order_idx').on(table.order),
}));

// Lessons table
export const lessons = sqliteTable('lessons', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  unitId: text('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type', { enum: lessonTypes }).notNull(),
  khanUrl: text('khan_url'),
  youtubeId: text('youtube_id'),
  duration: integer('duration'), // minutes
  order: integer('order').notNull(),
  ...timestamps,
}, (table) => ({
  unitIdIdx: index('lessons_unit_id_idx').on(table.unitId),
  slugIdx: index('lessons_slug_idx').on(table.slug),
  orderIdx: index('lessons_order_idx').on(table.order),
}));

// Quizzes table
export const quizzes = sqliteTable('quizzes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  unitId: text('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  timeLimit: integer('time_limit'), // minutes
  questions: text('questions', { mode: 'json' }).notNull().$type<any[]>(),
  passingScore: integer('passing_score').notNull().default(70),
  ...timestamps,
}, (table) => ({
  unitIdIdx: index('quizzes_unit_id_idx').on(table.unitId),
}));

// Tests table
export const tests = sqliteTable('tests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  unitId: text('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  timeLimit: integer('time_limit'), // minutes
  questions: text('questions', { mode: 'json' }).notNull().$type<any[]>(),
  passingScore: integer('passing_score').notNull().default(70),
  ...timestamps,
}, (table) => ({
  unitIdIdx: index('tests_unit_id_idx').on(table.unitId),
}));

// Skills table
export const skills = sqliteTable('skills', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  unitId: text('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  slugIdx: index('skills_slug_idx').on(table.slug),
  unitIdIdx: index('skills_unit_id_idx').on(table.unitId),
}));

// Flashcard Sets table
export const flashcardSets = sqliteTable('flashcard_sets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  lessonId: text('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),
  unitId: text('unit_id').references(() => units.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  ...timestamps,
}, (table) => ({
  lessonIdIdx: index('flashcard_sets_lesson_id_idx').on(table.lessonId),
  unitIdIdx: index('flashcard_sets_unit_id_idx').on(table.unitId),
}));

// Flashcards table
export const flashcards = sqliteTable('flashcards', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  setId: text('set_id').notNull().references(() => flashcardSets.id, { onDelete: 'cascade' }),
  front: text('front').notNull(),
  back: text('back').notNull(),
  hint: text('hint'),
  order: integer('order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  setIdIdx: index('flashcards_set_id_idx').on(table.setId),
}));

// Progress table
export const progress = sqliteTable('progress', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  unitId: text('unit_id').references(() => units.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),
  quizId: text('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }),
  testId: text('test_id').references(() => tests.id, { onDelete: 'cascade' }),
  status: text('status', { enum: progressStatuses }).notNull().default('NOT_STARTED'),
  score: integer('score'),
  lastViewedAt: integer('last_viewed_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  ...timestamps,
}, (table) => ({
  userIdIdx: index('progress_user_id_idx').on(table.userId),
  unitIdIdx: index('progress_unit_id_idx').on(table.unitId),
  lessonIdIdx: index('progress_lesson_id_idx').on(table.lessonId),
  quizIdIdx: index('progress_quiz_id_idx').on(table.quizId),
  testIdIdx: index('progress_test_id_idx').on(table.testId),
  uniqueProgressIdx: uniqueIndex('progress_unique_idx').on(table.userId, table.unitId, table.lessonId, table.quizId, table.testId),
}));

// Badges table
export const badges = sqliteTable('badges', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  slugIdx: index('badges_slug_idx').on(table.slug),
}));

// User Badges table
export const userBadges = sqliteTable('user_badges', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeId: text('badge_id').notNull().references(() => badges.id, { onDelete: 'cascade' }),
  awardedAt: integer('awarded_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  reason: text('reason'),
}, (table) => ({
  userIdIdx: index('user_badges_user_id_idx').on(table.userId),
  badgeIdIdx: index('user_badges_badge_id_idx').on(table.badgeId),
  uniqueUserBadgeIdx: uniqueIndex('user_badges_unique_idx').on(table.userId, table.badgeId),
}));

// Streaks table
export const streaks = sqliteTable('streaks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  current: integer('current').notNull().default(0),
  longest: integer('longest').notNull().default(0),
  lastActiveAt: integer('last_active_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('streaks_user_id_idx').on(table.userId),
}));

// Reviews table
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  moderated: integer('moderated', { mode: 'boolean' }).notNull().default(false),
  ...timestamps,
}, (table) => ({
  userIdIdx: index('reviews_user_id_idx').on(table.userId),
  moderatedIdx: index('reviews_moderated_idx').on(table.moderated),
}));

// Teachers table
export const teachers = sqliteTable('teachers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  avatar: text('avatar'),
  bio: text('bio').notNull(),
  email: text('email').notNull(),
  officeHours: text('office_hours'),
  ...timestamps,
}, (table) => ({
  emailIdx: index('teachers_email_idx').on(table.email),
}));

// Tutoring Slots table
export const tutoringSlots = sqliteTable('tutoring_slots', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  start: integer('start', { mode: 'timestamp' }).notNull(),
  end: integer('end', { mode: 'timestamp' }).notNull(),
  capacity: integer('capacity').notNull().default(5),
  spotsLeft: integer('spots_left').notNull().default(5),
  ...timestamps,
}, (table) => ({
  teacherIdIdx: index('tutoring_slots_teacher_id_idx').on(table.teacherId),
  startIdx: index('tutoring_slots_start_idx').on(table.start),
}));

// Tutoring Requests table
export const tutoringRequests = sqliteTable('tutoring_requests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: tutoringRequestTypes }).notNull(),
  topic: text('topic'),
  status: text('status', { enum: tutoringRequestStatuses }).notNull().default('PENDING'),
  scheduledSlotId: text('scheduled_slot_id'),
  ...timestamps,
}, (table) => ({
  userIdIdx: index('tutoring_requests_user_id_idx').on(table.userId),
  statusIdx: index('tutoring_requests_status_idx').on(table.status),
  typeIdx: index('tutoring_requests_type_idx').on(table.type),
}));

// Event Logs table
export const eventLogs = sqliteTable('event_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  payload: text('payload', { mode: 'json' }).$type<any>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('event_logs_user_id_idx').on(table.userId),
  typeIdx: index('event_logs_type_idx').on(table.type),
  createdAtIdx: index('event_logs_created_at_idx').on(table.createdAt),
}));

// Worksheets table
export const worksheets = sqliteTable('worksheets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  unitId: text('unit_id').references(() => units.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('file_url'), // URL to PDF or downloadable file
  difficulty: text('difficulty'), // Easy, Medium, Hard
  estimatedTime: integer('estimated_time'), // minutes
  ...timestamps,
}, (table) => ({
  unitIdIdx: index('worksheets_unit_id_idx').on(table.unitId),
}));

// Study Guides table
export const studyGuides = sqliteTable('study_guides', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  unitId: text('unit_id').references(() => units.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'), // Markdown or HTML content
  fileUrl: text('file_url'), // Optional PDF download
  ...timestamps,
}, (table) => ({
  unitIdIdx: index('study_guides_unit_id_idx').on(table.unitId),
}));

// Video Resources table
export const videoResources = sqliteTable('video_resources', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  unitId: text('unit_id').references(() => units.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  videoUrl: text('video_url').notNull(), // YouTube URL or embed URL
  videoId: text('video_id'), // YouTube video ID
  duration: integer('duration'), // minutes
  thumbnailUrl: text('thumbnail_url'),
  ...timestamps,
}, (table) => ({
  unitIdIdx: index('video_resources_unit_id_idx').on(table.unitId),
}));

// Contact Form Submissions table
export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  responded: integer('responded', { mode: 'boolean' }).notNull().default(false),
  ...timestamps,
}, (table) => ({
  emailIdx: index('contacts_email_idx').on(table.email),
  readIdx: index('contacts_read_idx').on(table.read),
}));

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
  worksheets: many(worksheets),
  studyGuides: many(studyGuides),
  videoResources: many(videoResources),
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

export const flashcardSetsRelations = relations(flashcardSets, ({ one, many }) => ({
  lesson: one(lessons, { fields: [flashcardSets.lessonId], references: [lessons.id] }),
  unit: one(units, { fields: [flashcardSets.unitId], references: [units.id] }),
  flashcards: many(flashcards),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  set: one(flashcardSets, { fields: [flashcards.setId], references: [flashcardSets.id] }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, { fields: [progress.userId], references: [users.id] }),
  unit: one(units, { fields: [progress.unitId], references: [units.id] }),
  lesson: one(lessons, { fields: [progress.lessonId], references: [lessons.id] }),
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
  teacher: one(teachers, { fields: [tutoringSlots.teacherId], references: [teachers.id] }),
}));

export const tutoringRequestsRelations = relations(tutoringRequests, ({ one }) => ({
  user: one(users, { fields: [tutoringRequests.userId], references: [users.id] }),
}));

export const eventLogsRelations = relations(eventLogs, ({ one }) => ({
  user: one(users, { fields: [eventLogs.userId], references: [users.id] }),
}));

export const worksheetsRelations = relations(worksheets, ({ one }) => ({
  unit: one(units, { fields: [worksheets.unitId], references: [units.id] }),
}));

export const studyGuidesRelations = relations(studyGuides, ({ one }) => ({
  unit: one(units, { fields: [studyGuides.unitId], references: [units.id] }),
}));

export const videoResourcesRelations = relations(videoResources, ({ one }) => ({
  unit: one(units, { fields: [videoResources.unitId], references: [units.id] }),
}));

