import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import { config } from "dotenv"

// Load environment variables
config({ path: ".env" })

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Clear existing data (in development)
  await prisma.eventLog.deleteMany()
  await prisma.tutoringRequest.deleteMany()
  await prisma.tutoringSlot.deleteMany()
  await prisma.review.deleteMany()
  await prisma.userBadge.deleteMany()
  await prisma.streak.deleteMany()
  await prisma.progress.deleteMany()
  await prisma.flashcard.deleteMany()
  await prisma.flashcardSet.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.test.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // Create demo users
  const hashedPassword = await hash("Passw0rd!", 10)

  const student = await prisma.user.create({
    data: {
      email: "student@example.com",
      name: "Student User",
      password: hashedPassword,
      role: "STUDENT",
    },
  })

  const teacher = await prisma.user.create({
    data: {
      email: "teacher@example.com",
      name: "Teacher User",
      password: hashedPassword,
      role: "TEACHER",
    },
  })

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  console.log("Created users")

  // Create badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        slug: "first-quiz",
        name: "First Quiz Complete",
        description: "Completed your first quiz",
        icon: "🎯",
      },
    }),
    prisma.badge.create({
      data: {
        slug: "week-streak",
        name: "Week Warrior",
        description: "Maintained a 7-day streak",
        icon: "🔥",
      },
    }),
    prisma.badge.create({
      data: {
        slug: "unit-master",
        name: "Unit Master",
        description: "Completed all lessons in a unit",
        icon: "🏆",
      },
    }),
    prisma.badge.create({
      data: {
        slug: "perfect-score",
        name: "Perfect Score",
        description: "Scored 100% on a quiz or test",
        icon: "💯",
      },
    }),
  ])

  console.log("Created badges")

  // Create teachers
  const teachers = await Promise.all([
    prisma.teacher.create({
      data: {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@numera.com",
        bio: "PhD in Mathematics Education with 15 years of experience teaching Algebra. Specializes in making complex concepts accessible to all students.",
        officeHours: "Monday-Friday, 3:00-5:00 PM EST",
      },
    }),
    prisma.teacher.create({
      data: {
        name: "Prof. Michael Chen",
        email: "michael.chen@numera.com",
        bio: "Mathematics teacher and curriculum developer. Passionate about interactive learning and student success in Algebra 1.",
        officeHours: "Tuesday-Thursday, 4:00-6:00 PM EST",
      },
    }),
    prisma.teacher.create({
      data: {
        name: "Ms. Emily Rodriguez",
        email: "emily.rodriguez@numera.com",
        bio: "Certified math teacher with expertise in peer-to-peer learning methodologies. Believes in collaborative learning environments.",
        officeHours: "Monday-Wednesday-Friday, 2:00-4:00 PM EST",
      },
    }),
  ])

  console.log("Created teachers")

  // Algebra 1 Units (14 units)
  const units = [
    {
      slug: "foundations-of-algebra",
      title: "Foundations of Algebra",
      description: "Introduction to algebraic expressions, variables, and basic operations.",
      order: 1,
    },
    {
      slug: "solving-linear-equations",
      title: "Solving Linear Equations",
      description: "Learn to solve one-step, two-step, and multi-step linear equations.",
      order: 2,
    },
    {
      slug: "linear-inequalities",
      title: "Linear Inequalities",
      description: "Understanding and solving linear inequalities and their graphs.",
      order: 3,
    },
    {
      slug: "graphing-linear-equations",
      title: "Graphing Linear Equations",
      description: "Graph linear equations using tables, slope-intercept form, and point-slope form.",
      order: 4,
    },
    {
      slug: "systems-of-equations",
      title: "Systems of Equations",
      description: "Solve systems of linear equations using graphing, substitution, and elimination.",
      order: 5,
    },
    {
      slug: "exponents-and-exponential-functions",
      title: "Exponents and Exponential Functions",
      description: "Work with exponents, scientific notation, and exponential functions.",
      order: 6,
    },
    {
      slug: "polynomials",
      title: "Polynomials",
      description: "Add, subtract, multiply, and factor polynomials.",
      order: 7,
    },
    {
      slug: "factoring",
      title: "Factoring",
      description: "Factor polynomials using various methods including GCF, grouping, and special patterns.",
      order: 8,
    },
    {
      slug: "quadratic-equations",
      title: "Quadratic Equations",
      description: "Solve quadratic equations by factoring, completing the square, and the quadratic formula.",
      order: 9,
    },
    {
      slug: "quadratic-functions",
      title: "Quadratic Functions",
      description: "Graph and analyze quadratic functions, including vertex form and transformations.",
      order: 10,
    },
    {
      slug: "radical-expressions",
      title: "Radical Expressions",
      description: "Simplify and operate with radical expressions and equations.",
      order: 11,
    },
    {
      slug: "rational-expressions",
      title: "Rational Expressions",
      description: "Simplify, add, subtract, multiply, and divide rational expressions.",
      order: 12,
    },
    {
      slug: "data-analysis",
      title: "Data Analysis and Statistics",
      description: "Analyze data using measures of central tendency, scatter plots, and line of best fit.",
      order: 13,
    },
    {
      slug: "functions-and-relations",
      title: "Functions and Relations",
      description: "Understand functions, relations, domain, range, and function notation.",
      order: 14,
    },
  ]

  const createdUnits = await Promise.all(
    units.map((unit) =>
      prisma.unit.create({
        data: unit,
      })
    )
  )

  console.log("Created units")

  // Create lessons for each unit (6-12 lessons per unit)
  const lessonTemplates = [
    { title: "Introduction", type: "VIDEO", duration: 10 },
    { title: "Core Concepts", type: "VIDEO", duration: 15 },
    { title: "Practice Problems", type: "EXERCISE", duration: 20 },
    { title: "Real-World Applications", type: "READING", duration: 15 },
    { title: "Advanced Topics", type: "VIDEO", duration: 12 },
    { title: "Review and Summary", type: "READING", duration: 10 },
  ]

  for (const unit of createdUnits) {
    const numLessons = Math.floor(Math.random() * 7) + 6 // 6-12 lessons
    const lessons = []

    for (let i = 0; i < numLessons; i++) {
      const template = lessonTemplates[i % lessonTemplates.length]
      const lessonNumber = i + 1
      const slug = `${unit.slug}-lesson-${lessonNumber}`
      
      lessons.push({
        slug,
        unitId: unit.id,
        title: `${template.title} ${lessonNumber}`,
        description: `Learn about ${template.title.toLowerCase()} in ${unit.title}`,
        type: template.type,
        khanUrl: `https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:${unit.slug}`,
        duration: template.duration + Math.floor(Math.random() * 10),
        order: lessonNumber,
      })
    }

    await prisma.lesson.createMany({
      data: lessons,
    })
  }

  console.log("Created lessons")

  // Create quizzes for each unit
  for (const unit of createdUnits) {
    await prisma.quiz.create({
      data: {
        unitId: unit.id,
        title: `${unit.title} Quiz`,
        description: `Test your knowledge of ${unit.title}`,
        timeLimit: 30,
        passingScore: 70,
        questions: JSON.stringify([
          {
            id: 1,
            question: "What is the main concept covered in this unit?",
            type: "multiple-choice",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: "This is the correct answer because...",
          },
          {
            id: 2,
            question: "Which method is most appropriate for solving this type of problem?",
            type: "multiple-choice",
            options: ["Method A", "Method B", "Method C", "Method D"],
            correctAnswer: 1,
            explanation: "Method B is correct because...",
          },
        ]),
      },
    })
  }

  console.log("Created quizzes")

  // Create tests for some units
  for (let i = 0; i < 7; i++) {
    const unit = createdUnits[i * 2]
    await prisma.test.create({
      data: {
        unitId: unit.id,
        title: `${unit.title} Test`,
        description: `Comprehensive test for ${unit.title}`,
        timeLimit: 60,
        passingScore: 70,
        questions: JSON.stringify([
          {
            id: 1,
            question: "Comprehensive question about the unit",
            type: "multiple-choice",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: "Explanation...",
          },
        ]),
      },
    })
  }

  console.log("Created tests")

  // Create flashcard sets
  for (const unit of createdUnits.slice(0, 10)) {
    const lessons = await prisma.lesson.findMany({
      where: { unitId: unit.id },
      take: 3,
    })

    for (const lesson of lessons) {
      await prisma.flashcardSet.create({
        data: {
          lessonId: lesson.id,
          unitId: unit.id,
          title: `${lesson.title} - Key Terms`,
          description: "Important vocabulary and concepts",
          flashcards: {
            create: [
              {
                front: "Variable",
                back: "A symbol used to represent an unknown value",
                hint: "Often represented by letters",
                order: 1,
              },
              {
                front: "Coefficient",
                back: "The number multiplied by a variable",
                hint: "The number in front of a variable",
                order: 2,
              },
              {
                front: "Constant",
                back: "A fixed value that does not change",
                hint: "A number without a variable",
                order: 3,
              },
            ],
          },
        },
      })
    }
  }

  console.log("Created flashcard sets")

  // Create skills
  const skillNames = [
    "Solving Equations",
    "Graphing",
    "Factoring",
    "Simplifying Expressions",
    "Working with Fractions",
    "Exponents",
    "Square Roots",
  ]

  for (const unit of createdUnits) {
    const numSkills = Math.floor(Math.random() * 3) + 2
    const usedSkills = new Set<string>()
    for (let i = 0; i < numSkills; i++) {
      let skillName = skillNames[Math.floor(Math.random() * skillNames.length)]
      let counter = 1
      // Ensure unique skill name per unit
      while (usedSkills.has(skillName) && counter < 10) {
        skillName = skillNames[Math.floor(Math.random() * skillNames.length)]
        counter++
      }
      usedSkills.add(skillName)
      
      await prisma.skill.create({
        data: {
          slug: `${unit.slug}-${skillName.toLowerCase().replace(/\s+/g, "-")}-${i}`,
          name: skillName,
          unitId: unit.id,
          description: `${skillName} as applied to ${unit.title}`,
        },
      })
    }
  }

  console.log("Created skills")

  // Create reviews
  const reviewComments = [
    "Great platform! The videos are very clear and helpful.",
    "Love the interactive quizzes. They really help me understand the material.",
    "The tutoring sessions are fantastic. Very supportive teachers.",
    "Easy to navigate and track my progress. Highly recommend!",
    "The flashcard feature is a game-changer for studying.",
    "Well-organized content and great user experience.",
    "Perfect for self-paced learning. The dashboard is so helpful.",
    "The resources section has everything I need.",
    "Really appreciate the detailed explanations in each lesson.",
    "Makes learning Algebra 1 fun and engaging!",
  ]

  for (let i = 0; i < 10; i++) {
    await prisma.review.create({
      data: {
        userId: student.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: reviewComments[i],
        moderated: true,
      },
    })
  }

  console.log("Created reviews")

  // Create some progress for the student
  const firstUnit = createdUnits[0]
  const firstLessons = await prisma.lesson.findMany({
    where: { unitId: firstUnit.id },
    take: 3,
  })

  for (const lesson of firstLessons) {
    await prisma.progress.create({
      data: {
        userId: student.id,
        unitId: firstUnit.id,
        lessonId: lesson.id,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    })
  }

  // Create streak
  await prisma.streak.create({
    data: {
      userId: student.id,
      current: 5,
      longest: 7,
      lastActiveAt: new Date(),
    },
  })

  // Award a badge
  await prisma.userBadge.create({
    data: {
      userId: student.id,
      badgeId: badges[0].id,
      reason: "Completed first quiz",
    },
  })

  console.log("Created student progress and achievements")

  // Create tutoring slots for the next 2 weeks
  const now = new Date()
  for (let i = 0; i < 14; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() + i)
    date.setHours(14, 0, 0, 0) // 2 PM

    // Create a slot for each teacher
    for (const teacher of teachers) {
      await prisma.tutoringSlot.create({
        data: {
          teacherId: teacher.id,
          start: new Date(date),
          end: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour
          capacity: 5,
          spotsLeft: 5,
        },
      })
    }
  }

  console.log("Created tutoring slots")

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
