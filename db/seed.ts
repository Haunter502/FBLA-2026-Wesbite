import { db } from "./index";
import { hash } from "bcryptjs";
import {
  users,
  units,
  lessons,
  quizzes,
  tests,
  skills,
  flashcardSets,
  flashcards,
  badges,
  teachers,
  tutoringSlots,
  reviews,
  streaks,
} from "./schema";
import dayjs from "dayjs";

async function seed() {
  console.log("🌱 Starting seed...");

  // Create demo users
  console.log("Creating users...");
  const hashedPassword = await hash("Passw0rd!", 10);

  const studentUser = await db
    .insert(users)
    .values({
      email: "student@example.com",
      name: "Alex Student",
      password: hashedPassword,
      role: "STUDENT",
      emailVerified: new Date(),
    })
    .returning();

  const teacherUser = await db
    .insert(users)
    .values({
      email: "teacher@example.com",
      name: "Jordan Teacher",
      password: hashedPassword,
      role: "TEACHER",
      emailVerified: new Date(),
    })
    .returning();

  const adminUser = await db
    .insert(users)
    .values({
      email: "admin@example.com",
      name: "Morgan Admin",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    })
    .returning();

  console.log(`Created ${[studentUser, teacherUser, adminUser].length} users`);

  // Initialize streak for student
  await db.insert(streaks).values({
    userId: studentUser[0].id,
    current: 5,
    longest: 12,
    lastActiveAt: new Date(),
  });

  // Create 14 Algebra 1 units
  console.log("Creating 14 Algebra 1 units...");

  const algebra1Units = [
    {
      slug: "foundations-of-algebra",
      title: "Foundations of Algebra",
      description:
        "Master the building blocks of algebra including variables, expressions, and the order of operations.",
      order: 1,
    },
    {
      slug: "solving-linear-equations",
      title: "Solving Linear Equations",
      description:
        "Learn to solve one-variable linear equations using inverse operations and balancing techniques.",
      order: 2,
    },
    {
      slug: "inequalities",
      title: "Inequalities",
      description:
        "Understand and solve linear inequalities, including compound inequalities and graphing on number lines.",
      order: 3,
    },
    {
      slug: "graphing-lines",
      title: "Graphing Lines and Slope",
      description:
        "Explore coordinate planes, slope, intercepts, and different forms of linear equations.",
      order: 4,
    },
    {
      slug: "systems-of-equations",
      title: "Systems of Equations",
      description:
        "Solve systems of linear equations using graphing, substitution, and elimination methods.",
      order: 5,
    },
    {
      slug: "exponents-and-exponential-functions",
      title: "Exponents and Exponential Functions",
      description:
        "Master exponent rules, scientific notation, and exponential growth and decay.",
      order: 6,
    },
    {
      slug: "polynomials",
      title: "Polynomials",
      description:
        "Add, subtract, multiply, and divide polynomials. Understand degree, leading coefficient, and standard form.",
      order: 7,
    },
    {
      slug: "factoring",
      title: "Factoring",
      description:
        "Factor polynomials using GCF, grouping, difference of squares, and trinomial methods.",
      order: 8,
    },
    {
      slug: "quadratic-equations",
      title: "Quadratic Equations",
      description:
        "Solve quadratic equations by factoring, completing the square, and using the quadratic formula.",
      order: 9,
    },
    {
      slug: "quadratic-functions-and-graphs",
      title: "Quadratic Functions and Graphs",
      description:
        "Graph parabolas, identify vertex and axis of symmetry, and understand transformations.",
      order: 10,
    },
    {
      slug: "radicals-and-rational-exponents",
      title: "Radicals and Rational Exponents",
      description:
        "Simplify radicals, rationalize denominators, and work with rational exponents.",
      order: 11,
    },
    {
      slug: "rational-expressions",
      title: "Rational Expressions",
      description:
        "Simplify, add, subtract, multiply, and divide rational expressions and solve rational equations.",
      order: 12,
    },
    {
      slug: "data-analysis-and-probability",
      title: "Data Analysis and Probability",
      description:
        "Analyze data sets, calculate measures of central tendency, and understand basic probability.",
      order: 13,
    },
    {
      slug: "functions",
      title: "Functions",
      description:
        "Understand function notation, domain and range, and evaluate and graph various function types.",
      order: 14,
    },
  ];

  const insertedUnits = await db.insert(units).values(algebra1Units).returning();
  console.log(`Created ${insertedUnits.length} units`);

  // Create lessons for each unit (6-10 lessons per unit)
  console.log("Creating lessons...");

  const lessonsData = [
    // Unit 1: Foundations of Algebra
    {
      unitId: insertedUnits[0].id,
      slug: "variables-and-expressions",
      title: "Variables and Expressions",
      description: "Learn about variables, constants, and how to write algebraic expressions.",
      type: "VIDEO" as const,
      khanUrl: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:foundation-algebra",
      youtubeId: "fUl3b4h1-sU",
      duration: 12,
      order: 1,
    },
    {
      unitId: insertedUnits[0].id,
      slug: "order-of-operations",
      title: "Order of Operations (PEMDAS)",
      description: "Master the correct order for evaluating mathematical expressions.",
      type: "VIDEO" as const,
      khanUrl: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:foundation-algebra",
      youtubeId: "dAgfnK528RA",
      duration: 10,
      order: 2,
    },
    {
      unitId: insertedUnits[0].id,
      slug: "evaluating-expressions",
      title: "Evaluating Expressions",
      description: "Substitute values for variables and evaluate algebraic expressions.",
      type: "EXERCISE" as const,
      khanUrl:
        "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:evaluating-expressions",
      duration: 15,
      order: 3,
    },
    {
      unitId: insertedUnits[0].id,
      slug: "combining-like-terms",
      title: "Combining Like Terms",
      description: "Simplify expressions by combining terms with the same variables.",
      type: "VIDEO" as const,
      youtubeId: "3GD_9bYUHag",
      duration: 11,
      order: 4,
    },
    {
      unitId: insertedUnits[0].id,
      slug: "distributive-property",
      title: "The Distributive Property",
      description: "Use the distributive property to expand and simplify expressions.",
      type: "VIDEO" as const,
      youtubeId: "v-6MShC82ow",
      duration: 13,
      order: 5,
    },
    {
      unitId: insertedUnits[0].id,
      slug: "properties-of-numbers",
      title: "Properties of Real Numbers",
      description: "Understand commutative, associative, and identity properties.",
      type: "READING" as const,
      duration: 8,
      order: 6,
    },

    // Unit 2: Solving Linear Equations
    {
      unitId: insertedUnits[1].id,
      slug: "one-step-equations",
      title: "One-Step Equations",
      description: "Solve simple equations using addition, subtraction, multiplication, or division.",
      type: "VIDEO" as const,
      youtubeId: "033ot6P8NNY",
      duration: 9,
      order: 1,
    },
    {
      unitId: insertedUnits[1].id,
      slug: "two-step-equations",
      title: "Two-Step Equations",
      description: "Solve equations that require two inverse operations.",
      type: "VIDEO" as const,
      youtubeId: "8JK2UJRqqDw",
      duration: 11,
      order: 2,
    },
    {
      unitId: insertedUnits[1].id,
      slug: "multi-step-equations",
      title: "Multi-Step Equations",
      description: "Solve complex equations using the distributive property and combining like terms.",
      type: "VIDEO" as const,
      youtubeId: "uFbH2FgsV98",
      duration: 14,
      order: 3,
    },
    {
      unitId: insertedUnits[1].id,
      slug: "equations-with-variables-both-sides",
      title: "Equations with Variables on Both Sides",
      description: "Learn to collect variable terms on one side of the equation.",
      type: "VIDEO" as const,
      youtubeId: "lZF3vNlCYwY",
      duration: 12,
      order: 4,
    },
    {
      unitId: insertedUnits[1].id,
      slug: "special-cases",
      title: "Special Cases: No Solution and Infinite Solutions",
      description: "Identify equations with no solution or infinitely many solutions.",
      type: "VIDEO" as const,
      youtubeId: "Ik2M_CbRbRk",
      duration: 10,
      order: 5,
    },
    {
      unitId: insertedUnits[1].id,
      slug: "literal-equations",
      title: "Solving Literal Equations",
      description: "Rearrange formulas to solve for a specific variable.",
      type: "EXERCISE" as const,
      duration: 13,
      order: 6,
    },

    // Unit 3: Inequalities
    {
      unitId: insertedUnits[2].id,
      slug: "graphing-inequalities",
      title: "Graphing Inequalities on a Number Line",
      description: "Represent inequalities visually using number lines.",
      type: "VIDEO" as const,
      youtubeId: "pvFBn4sKGVI",
      duration: 8,
      order: 1,
    },
    {
      unitId: insertedUnits[2].id,
      slug: "solving-inequalities-addition-subtraction",
      title: "Solving Inequalities with Addition and Subtraction",
      description: "Apply addition and subtraction properties to solve inequalities.",
      type: "VIDEO" as const,
      youtubeId: "Y6uldJTvNcs",
      duration: 10,
      order: 2,
    },
    {
      unitId: insertedUnits[2].id,
      slug: "solving-inequalities-multiplication-division",
      title: "Solving Inequalities with Multiplication and Division",
      description: "Remember to flip the inequality sign when multiplying or dividing by a negative.",
      type: "VIDEO" as const,
      youtubeId: "Zi3UpQqQJPQ",
      duration: 11,
      order: 3,
    },
    {
      unitId: insertedUnits[2].id,
      slug: "multi-step-inequalities",
      title: "Multi-Step Inequalities",
      description: "Solve complex inequalities involving multiple steps.",
      type: "EXERCISE" as const,
      duration: 14,
      order: 4,
    },
    {
      unitId: insertedUnits[2].id,
      slug: "compound-inequalities",
      title: "Compound Inequalities",
      description: "Work with 'and' and 'or' compound inequalities.",
      type: "VIDEO" as const,
      youtubeId: "EZXJaw8pGh8",
      duration: 15,
      order: 5,
    },

    // Unit 4: Graphing Lines and Slope
    {
      unitId: insertedUnits[3].id,
      slug: "coordinate-plane",
      title: "The Coordinate Plane",
      description: "Understand the x and y axes, quadrants, and plotting points.",
      type: "VIDEO" as const,
      youtubeId: "VwO7RSD_UfI",
      duration: 9,
      order: 1,
    },
    {
      unitId: insertedUnits[3].id,
      slug: "slope",
      title: "Slope of a Line",
      description: "Calculate slope using rise over run and the slope formula.",
      type: "VIDEO" as const,
      youtubeId: "R948Tsyq4vA",
      duration: 12,
      order: 2,
    },
    {
      unitId: insertedUnits[3].id,
      slug: "slope-intercept-form",
      title: "Slope-Intercept Form (y = mx + b)",
      description: "Graph lines and write equations in slope-intercept form.",
      type: "VIDEO" as const,
      youtubeId: "b-szD4lNU38",
      duration: 13,
      order: 3,
    },
    {
      unitId: insertedUnits[3].id,
      slug: "point-slope-form",
      title: "Point-Slope Form",
      description: "Write equations of lines given a point and slope.",
      type: "VIDEO" as const,
      youtubeId: "JUe4TU5Ekro",
      duration: 11,
      order: 4,
    },
    {
      unitId: insertedUnits[3].id,
      slug: "standard-form",
      title: "Standard Form of Linear Equations",
      description: "Convert between different forms and graph lines in standard form (Ax + By = C).",
      type: "EXERCISE" as const,
      duration: 12,
      order: 5,
    },
    {
      unitId: insertedUnits[3].id,
      slug: "parallel-perpendicular-lines",
      title: "Parallel and Perpendicular Lines",
      description: "Identify and write equations for parallel and perpendicular lines.",
      type: "VIDEO" as const,
      youtubeId: "lC3Cf6nVH3E",
      duration: 14,
      order: 6,
    },

    // Unit 5: Systems of Equations
    {
      unitId: insertedUnits[4].id,
      slug: "intro-systems",
      title: "Introduction to Systems of Equations",
      description: "Understand what a system of equations is and when solutions exist.",
      type: "VIDEO" as const,
      youtubeId: "FRaJv2Faass",
      duration: 10,
      order: 1,
    },
    {
      unitId: insertedUnits[4].id,
      slug: "solving-by-graphing",
      title: "Solving Systems by Graphing",
      description: "Find solutions by graphing both lines and identifying the intersection point.",
      type: "VIDEO" as const,
      youtubeId: "CejhXy9l7TY",
      duration: 13,
      order: 2,
    },
    {
      unitId: insertedUnits[4].id,
      slug: "solving-by-substitution",
      title: "Solving Systems by Substitution",
      description: "Solve one equation for a variable and substitute into the other.",
      type: "VIDEO" as const,
      youtubeId: "dTdOqkMElGM",
      duration: 15,
      order: 3,
    },
    {
      unitId: insertedUnits[4].id,
      slug: "solving-by-elimination",
      title: "Solving Systems by Elimination",
      description: "Add or subtract equations to eliminate a variable.",
      type: "VIDEO" as const,
      youtubeId: "s7S3oJ_0Uvo",
      duration: 14,
      order: 4,
    },
    {
      unitId: insertedUnits[4].id,
      slug: "systems-word-problems",
      title: "Systems of Equations Word Problems",
      description: "Apply systems to real-world scenarios.",
      type: "EXERCISE" as const,
      duration: 16,
      order: 5,
    },

    // Unit 6: Exponents and Exponential Functions
    {
      unitId: insertedUnits[5].id,
      slug: "exponent-rules",
      title: "Laws of Exponents",
      description: "Master product, quotient, power, and zero exponent rules.",
      type: "VIDEO" as const,
      youtubeId: "kITJ6qH7jS0",
      duration: 14,
      order: 1,
    },
    {
      unitId: insertedUnits[5].id,
      slug: "negative-exponents",
      title: "Negative and Zero Exponents",
      description: "Understand what negative and zero exponents mean.",
      type: "VIDEO" as const,
      youtubeId: "LcWW1zqkXNE",
      duration: 11,
      order: 2,
    },
    {
      unitId: insertedUnits[5].id,
      slug: "scientific-notation",
      title: "Scientific Notation",
      description: "Express very large and very small numbers in scientific notation.",
      type: "VIDEO" as const,
      youtubeId: "i6lfVUp5RW8",
      duration: 12,
      order: 3,
    },
    {
      unitId: insertedUnits[5].id,
      slug: "exponential-growth",
      title: "Exponential Growth",
      description: "Model real-world situations with exponential growth functions.",
      type: "VIDEO" as const,
      youtubeId: "6WMZ7J0wwMI",
      duration: 13,
      order: 4,
    },
    {
      unitId: insertedUnits[5].id,
      slug: "exponential-decay",
      title: "Exponential Decay",
      description: "Understand decay models like depreciation and radioactive decay.",
      type: "EXERCISE" as const,
      duration: 13,
      order: 5,
    },

    // Unit 7: Polynomials
    {
      unitId: insertedUnits[6].id,
      slug: "classifying-polynomials",
      title: "Classifying Polynomials",
      description: "Identify polynomials by degree and number of terms.",
      type: "VIDEO" as const,
      youtubeId: "Vm7H0VTlIco",
      duration: 9,
      order: 1,
    },
    {
      unitId: insertedUnits[6].id,
      slug: "adding-subtracting-polynomials",
      title: "Adding and Subtracting Polynomials",
      description: "Combine like terms to add and subtract polynomials.",
      type: "VIDEO" as const,
      youtubeId: "E89YAJ9nFVw",
      duration: 11,
      order: 2,
    },
    {
      unitId: insertedUnits[6].id,
      slug: "multiplying-monomials",
      title: "Multiplying Monomials",
      description: "Use exponent rules to multiply single-term expressions.",
      type: "VIDEO" as const,
      youtubeId: "Q8adJkR6Bls",
      duration: 10,
      order: 3,
    },
    {
      unitId: insertedUnits[6].id,
      slug: "multiplying-polynomials",
      title: "Multiplying Polynomials",
      description: "Apply the distributive property and FOIL method.",
      type: "VIDEO" as const,
      youtubeId: "u-oP_vPYZ50",
      duration: 14,
      order: 4,
    },
    {
      unitId: insertedUnits[6].id,
      slug: "special-products",
      title: "Special Products",
      description: "Square binomials and multiply conjugates.",
      type: "EXERCISE" as const,
      duration: 12,
      order: 5,
    },

    // Unit 8: Factoring
    {
      unitId: insertedUnits[7].id,
      slug: "gcf",
      title: "Greatest Common Factor (GCF)",
      description: "Factor out the greatest common factor from polynomials.",
      type: "VIDEO" as const,
      youtubeId: "KmEfXlzeFt0",
      duration: 10,
      order: 1,
    },
    {
      unitId: insertedUnits[7].id,
      slug: "factoring-by-grouping",
      title: "Factoring by Grouping",
      description: "Group terms to factor four-term polynomials.",
      type: "VIDEO" as const,
      youtubeId: "Eq2cqfpF8RA",
      duration: 12,
      order: 2,
    },
    {
      unitId: insertedUnits[7].id,
      slug: "factoring-trinomials",
      title: "Factoring Trinomials (x² + bx + c)",
      description: "Factor simple trinomials where the leading coefficient is 1.",
      type: "VIDEO" as const,
      youtubeId: "P_yKBrQ9XBw",
      duration: 14,
      order: 3,
    },
    {
      unitId: insertedUnits[7].id,
      slug: "factoring-trinomials-ac",
      title: "Factoring Trinomials (ax² + bx + c)",
      description: "Factor trinomials with a leading coefficient other than 1.",
      type: "VIDEO" as const,
      youtubeId: "gp-jj11Bkp4",
      duration: 16,
      order: 4,
    },
    {
      unitId: insertedUnits[7].id,
      slug: "difference-of-squares",
      title: "Difference of Squares",
      description: "Factor expressions in the form a² - b².",
      type: "VIDEO" as const,
      youtubeId: "Qz8OKNsT-Cs",
      duration: 11,
      order: 5,
    },
    {
      unitId: insertedUnits[7].id,
      slug: "perfect-square-trinomials",
      title: "Perfect Square Trinomials",
      description: "Recognize and factor perfect square trinomials.",
      type: "EXERCISE" as const,
      duration: 12,
      order: 6,
    },

    // Unit 9: Quadratic Equations
    {
      unitId: insertedUnits[8].id,
      slug: "solving-by-factoring",
      title: "Solving Quadratics by Factoring",
      description: "Use the zero product property to solve quadratic equations.",
      type: "VIDEO" as const,
      youtubeId: "6kgg46tecFA",
      duration: 13,
      order: 1,
    },
    {
      unitId: insertedUnits[8].id,
      slug: "solving-by-square-roots",
      title: "Solving Quadratics Using Square Roots",
      description: "Solve equations of the form x² = k.",
      type: "VIDEO" as const,
      youtubeId: "hx02V10YeX8",
      duration: 10,
      order: 2,
    },
    {
      unitId: insertedUnits[8].id,
      slug: "completing-the-square",
      title: "Completing the Square",
      description: "Transform quadratics into perfect squares to solve.",
      type: "VIDEO" as const,
      youtubeId: "bNQY0z76M5A",
      duration: 16,
      order: 3,
    },
    {
      unitId: insertedUnits[8].id,
      slug: "quadratic-formula",
      title: "The Quadratic Formula",
      description: "Use the quadratic formula to solve any quadratic equation.",
      type: "VIDEO" as const,
      youtubeId: "5S-LqEb6hRM",
      duration: 14,
      order: 4,
    },
    {
      unitId: insertedUnits[8].id,
      slug: "discriminant",
      title: "The Discriminant",
      description: "Determine the number and type of solutions using the discriminant.",
      type: "EXERCISE" as const,
      duration: 11,
      order: 5,
    },

    // Unit 10: Quadratic Functions and Graphs
    {
      unitId: insertedUnits[9].id,
      slug: "graphing-parabolas",
      title: "Graphing Parabolas",
      description: "Graph quadratic functions and identify key features.",
      type: "VIDEO" as const,
      youtubeId: "v7Sek1Nwxxs",
      duration: 13,
      order: 1,
    },
    {
      unitId: insertedUnits[9].id,
      slug: "vertex-form",
      title: "Vertex Form of Quadratics",
      description: "Use vertex form y = a(x - h)² + k to identify the vertex.",
      type: "VIDEO" as const,
      youtubeId: "Qrt01lXkPMo",
      duration: 12,
      order: 2,
    },
    {
      unitId: insertedUnits[9].id,
      slug: "axis-of-symmetry",
      title: "Axis of Symmetry",
      description: "Find the axis of symmetry and use it to graph parabolas.",
      type: "VIDEO" as const,
      youtubeId: "n0Qb-PnA6V4",
      duration: 10,
      order: 3,
    },
    {
      unitId: insertedUnits[9].id,
      slug: "transformations-parabolas",
      title: "Transformations of Parabolas",
      description: "Understand vertical and horizontal shifts, stretches, and reflections.",
      type: "EXERCISE" as const,
      duration: 14,
      order: 4,
    },
    {
      unitId: insertedUnits[9].id,
      slug: "quadratic-word-problems",
      title: "Quadratic Applications and Word Problems",
      description: "Apply quadratic functions to real-world problems.",
      type: "EXERCISE" as const,
      duration: 15,
      order: 5,
    },

    // Unit 11: Radicals and Rational Exponents
    {
      unitId: insertedUnits[10].id,
      slug: "simplifying-radicals",
      title: "Simplifying Radical Expressions",
      description: "Simplify square roots and higher-order radicals.",
      type: "VIDEO" as const,
      youtubeId: "7FNJkCRwwH0",
      duration: 12,
      order: 1,
    },
    {
      unitId: insertedUnits[10].id,
      slug: "operations-with-radicals",
      title: "Operations with Radicals",
      description: "Add, subtract, multiply, and divide radical expressions.",
      type: "VIDEO" as const,
      youtubeId: "P7wW0p5g57A",
      duration: 14,
      order: 2,
    },
    {
      unitId: insertedUnits[10].id,
      slug: "rationalizing-denominators",
      title: "Rationalizing Denominators",
      description: "Remove radicals from denominators.",
      type: "VIDEO" as const,
      youtubeId: "c8TL4K2mDIE",
      duration: 11,
      order: 3,
    },
    {
      unitId: insertedUnits[10].id,
      slug: "rational-exponents",
      title: "Rational Exponents",
      description: "Convert between radical notation and rational exponents.",
      type: "EXERCISE" as const,
      duration: 13,
      order: 4,
    },
    {
      unitId: insertedUnits[10].id,
      slug: "solving-radical-equations",
      title: "Solving Radical Equations",
      description: "Isolate radicals and square both sides to solve.",
      type: "VIDEO" as const,
      youtubeId: "TqKFZbpzaWo",
      duration: 15,
      order: 5,
    },

    // Unit 12: Rational Expressions
    {
      unitId: insertedUnits[11].id,
      slug: "simplifying-rational-expressions",
      title: "Simplifying Rational Expressions",
      description: "Factor and cancel common factors in rational expressions.",
      type: "VIDEO" as const,
      youtubeId: "fF6p7kU9Lk0",
      duration: 12,
      order: 1,
    },
    {
      unitId: insertedUnits[11].id,
      slug: "multiplying-dividing-rationals",
      title: "Multiplying and Dividing Rational Expressions",
      description: "Multiply and divide rational expressions by factoring and canceling.",
      type: "VIDEO" as const,
      youtubeId: "2qk7mYYSCO8",
      duration: 14,
      order: 2,
    },
    {
      unitId: insertedUnits[11].id,
      slug: "adding-subtracting-rationals",
      title: "Adding and Subtracting Rational Expressions",
      description: "Find common denominators to add and subtract rational expressions.",
      type: "VIDEO" as const,
      youtubeId: "b68jQUz-rYA",
      duration: 16,
      order: 3,
    },
    {
      unitId: insertedUnits[11].id,
      slug: "complex-fractions",
      title: "Complex Fractions",
      description: "Simplify fractions within fractions.",
      type: "EXERCISE" as const,
      duration: 13,
      order: 4,
    },
    {
      unitId: insertedUnits[11].id,
      slug: "solving-rational-equations",
      title: "Solving Rational Equations",
      description: "Clear denominators and solve rational equations.",
      type: "VIDEO" as const,
      youtubeId: "fXLb8LLX0gs",
      duration: 15,
      order: 5,
    },

    // Unit 13: Data Analysis and Probability
    {
      unitId: insertedUnits[12].id,
      slug: "measures-of-central-tendency",
      title: "Mean, Median, Mode, and Range",
      description: "Calculate and interpret measures of central tendency.",
      type: "VIDEO" as const,
      youtubeId: "B1HEzNTGeZ4",
      duration: 11,
      order: 1,
    },
    {
      unitId: insertedUnits[12].id,
      slug: "box-plots",
      title: "Box-and-Whisker Plots",
      description: "Create and analyze box plots to understand data distribution.",
      type: "VIDEO" as const,
      youtubeId: "RNpfZlPMFfs",
      duration: 12,
      order: 2,
    },
    {
      unitId: insertedUnits[12].id,
      slug: "scatter-plots",
      title: "Scatter Plots and Correlation",
      description: "Understand the relationship between two variables.",
      type: "VIDEO" as const,
      youtubeId: "dVhTXyuuDXo",
      duration: 13,
      order: 3,
    },
    {
      unitId: insertedUnits[12].id,
      slug: "probability-basics",
      title: "Basic Probability",
      description: "Calculate simple and compound probabilities.",
      type: "EXERCISE" as const,
      duration: 14,
      order: 4,
    },
    {
      unitId: insertedUnits[12].id,
      slug: "counting-principle",
      title: "Counting Principle and Permutations",
      description: "Count outcomes using the fundamental counting principle.",
      type: "VIDEO" as const,
      youtubeId: "iW5fVxFXXFY",
      duration: 15,
      order: 5,
    },

    // Unit 14: Functions
    {
      unitId: insertedUnits[13].id,
      slug: "function-notation",
      title: "Function Notation",
      description: "Understand f(x) notation and evaluate functions.",
      type: "VIDEO" as const,
      youtubeId: "6TdIjq6M2zg",
      duration: 10,
      order: 1,
    },
    {
      unitId: insertedUnits[13].id,
      slug: "domain-and-range",
      title: "Domain and Range",
      description: "Identify the domain and range of functions.",
      type: "VIDEO" as const,
      youtubeId: "7vMbLs0HKf8",
      duration: 12,
      order: 2,
    },
    {
      unitId: insertedUnits[13].id,
      slug: "graphing-functions",
      title: "Graphing Functions",
      description: "Graph linear, quadratic, and other functions.",
      type: "EXERCISE" as const,
      duration: 14,
      order: 3,
    },
    {
      unitId: insertedUnits[13].id,
      slug: "function-transformations",
      title: "Function Transformations",
      description: "Apply shifts, stretches, and reflections to functions.",
      type: "VIDEO" as const,
      youtubeId: "DZ4k8dExQqI",
      duration: 15,
      order: 4,
    },
    {
      unitId: insertedUnits[13].id,
      slug: "inverse-functions",
      title: "Inverse Functions",
      description: "Find and graph inverse functions.",
      type: "VIDEO" as const,
      youtubeId: "NF-NnXUgpoY",
      duration: 16,
      order: 5,
    },
  ];

  const insertedLessons = await db.insert(lessons).values(lessonsData).returning();
  console.log(`Created ${insertedLessons.length} lessons`);

  // Create quizzes for each unit
  console.log("Creating quizzes...");
  const quizzesData = insertedUnits.map((unit, idx) => ({
    unitId: unit.id,
    title: `${unit.title} Quiz`,
    description: `Test your knowledge of ${unit.title.toLowerCase()}`,
    timeLimit: 20,
    passingScore: 70,
    questions: JSON.stringify([
      {
        id: 1,
        question: `Sample question 1 for ${unit.title}`,
        type: "multiple-choice",
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
      },
      {
        id: 2,
        question: `Sample question 2 for ${unit.title}`,
        type: "multiple-choice",
        options: ["A", "B", "C", "D"],
        correctAnswer: "B",
      },
      {
        id: 3,
        question: `Sample question 3 for ${unit.title}`,
        type: "multiple-choice",
        options: ["A", "B", "C", "D"],
        correctAnswer: "C",
      },
    ]),
  }));

  await db.insert(quizzes).values(quizzesData);
  console.log(`Created ${quizzesData.length} quizzes`);

  // Create flashcard sets
  console.log("Creating flashcard sets...");
  const flashcardSetsData = [
    {
      unitId: insertedUnits[0].id,
      title: "Foundations of Algebra Key Terms",
      description: "Essential vocabulary for algebra foundations",
    },
    {
      lessonId: insertedLessons[0].id,
      title: "Variables and Expressions Flashcards",
      description: "Practice key concepts from this lesson",
    },
    {
      unitId: insertedUnits[1].id,
      title: "Solving Equations Strategies",
      description: "Master the techniques for solving linear equations",
    },
    {
      unitId: insertedUnits[3].id,
      title: "Graphing and Slope Formulas",
      description: "Memorize important formulas for graphing lines",
    },
  ];

  const insertedSets = await db.insert(flashcardSets).values(flashcardSetsData).returning();

  const flashcardsData = [
    // Set 1: Foundations
    {
      setId: insertedSets[0].id,
      front: "What is a variable?",
      back: "A symbol (usually a letter) that represents an unknown value.",
      order: 1,
    },
    {
      setId: insertedSets[0].id,
      front: "What is a coefficient?",
      back: "The number multiplied by a variable in a term (e.g., in 5x, 5 is the coefficient).",
      order: 2,
    },
    {
      setId: insertedSets[0].id,
      front: "What is a constant?",
      back: "A value that does not change (a number without a variable).",
      order: 3,
    },
    {
      setId: insertedSets[0].id,
      front: "What does PEMDAS stand for?",
      back: "Parentheses, Exponents, Multiplication/Division, Addition/Subtraction",
      order: 4,
    },
    {
      setId: insertedSets[0].id,
      front: "What are like terms?",
      back: "Terms that have the same variable raised to the same power (e.g., 3x and 7x).",
      order: 5,
    },

    // Set 2: Variables and Expressions
    {
      setId: insertedSets[1].id,
      front: "What is an algebraic expression?",
      back: "A mathematical phrase that can contain numbers, variables, and operators.",
      order: 1,
    },
    {
      setId: insertedSets[1].id,
      front: "How do you evaluate an expression?",
      back: "Substitute the given values for the variables and simplify using order of operations.",
      order: 2,
    },
    {
      setId: insertedSets[1].id,
      front: "Is 5x + 3 an equation or expression?",
      back: "Expression (it does not have an equals sign).",
      order: 3,
    },

    // Set 3: Solving Equations
    {
      setId: insertedSets[2].id,
      front: "What are inverse operations?",
      back: "Operations that undo each other (addition/subtraction, multiplication/division).",
      order: 1,
    },
    {
      setId: insertedSets[2].id,
      front: "How do you isolate a variable?",
      back: "Use inverse operations to get the variable alone on one side of the equation.",
      order: 2,
    },
    {
      setId: insertedSets[2].id,
      front: "What is a literal equation?",
      back: "An equation with more than one variable (like a formula).",
      order: 3,
    },

    // Set 4: Graphing
    {
      setId: insertedSets[3].id,
      front: "What is the slope formula?",
      back: "m = (y₂ - y₁) / (x₂ - x₁)",
      order: 1,
    },
    {
      setId: insertedSets[3].id,
      front: "What is slope-intercept form?",
      back: "y = mx + b, where m is the slope and b is the y-intercept.",
      order: 2,
    },
    {
      setId: insertedSets[3].id,
      front: "What is the y-intercept?",
      back: "The point where a line crosses the y-axis (where x = 0).",
      order: 3,
    },
    {
      setId: insertedSets[3].id,
      front: "What is point-slope form?",
      back: "y - y₁ = m(x - x₁), where m is the slope and (x₁, y₁) is a point on the line.",
      order: 4,
    },
  ];

  await db.insert(flashcards).values(flashcardsData);
  console.log(`Created ${flashcardsData.length} flashcards in ${insertedSets.length} sets`);

  // Create badges
  console.log("Creating badges...");
  const badgesData = [
    {
      slug: "first-lesson",
      name: "First Steps",
      description: "Completed your first lesson",
      icon: "CheckCircle",
    },
    {
      slug: "quiz-master",
      name: "Quiz Master",
      description: "Passed your first quiz",
      icon: "Award",
    },
    {
      slug: "week-streak",
      name: "Week Warrior",
      description: "Maintained a 7-day learning streak",
      icon: "Flame",
    },
    {
      slug: "unit-complete",
      name: "Unit Champion",
      description: "Completed your first unit (100%)",
      icon: "Trophy",
    },
    {
      slug: "perfect-score",
      name: "Perfect Score",
      description: "Scored 100% on a quiz or test",
      icon: "Star",
    },
    {
      slug: "flashcard-fan",
      name: "Flashcard Fan",
      description: "Completed 50 flashcard reviews",
      icon: "Zap",
    },
  ];

  await db.insert(badges).values(badgesData);
  console.log(`Created ${badgesData.length} badges`);

  // Create teachers
  console.log("Creating teachers...");
  const teachersData = [
    {
      name: "Dr. Sarah Martinez",
      email: "sarah.martinez@numera.edu",
      bio: "Ph.D. in Mathematics Education with 15 years of teaching experience. Specializes in making complex algebraic concepts accessible and engaging for all students.",
      avatar: "/avatars/teacher-1.jpg",
      officeHours: "Monday & Wednesday, 3-5 PM EST",
    },
    {
      name: "Prof. James Chen",
      email: "james.chen@numera.edu",
      bio: "Former aerospace engineer turned educator. Passionate about showing students real-world applications of algebra. Loves problem-solving and collaborative learning.",
      avatar: "/avatars/teacher-2.jpg",
      officeHours: "Tuesday & Thursday, 4-6 PM EST",
    },
    {
      name: "Ms. Emily Rodriguez",
      email: "emily.rodriguez@numera.edu",
      bio: "Award-winning math teacher and curriculum developer. Focuses on visual learning strategies and growth mindset. Creates a supportive and inclusive learning environment.",
      avatar: "/avatars/teacher-3.jpg",
      officeHours: "Wednesday & Friday, 2-4 PM EST",
    },
  ];

  const insertedTeachers = await db.insert(teachers).values(teachersData).returning();
  console.log(`Created ${insertedTeachers.length} teachers`);

  // Create tutoring slots
  console.log("Creating tutoring slots...");
  const now = dayjs();
  const slotsData = [];

  for (let i = 1; i <= 7; i++) {
    // Next 7 days
    for (const teacher of insertedTeachers) {
      slotsData.push({
        teacherId: teacher.id,
        start: now.add(i, "day").hour(14).minute(0).second(0).toDate(),
        end: now.add(i, "day").hour(15).minute(0).second(0).toDate(),
        capacity: 5,
        spotsLeft: 5,
      });
      slotsData.push({
        teacherId: teacher.id,
        start: now.add(i, "day").hour(16).minute(0).second(0).toDate(),
        end: now.add(i, "day").hour(17).minute(0).second(0).toDate(),
        capacity: 5,
        spotsLeft: 3,
      });
    }
  }

  await db.insert(tutoringSlots).values(slotsData);
  console.log(`Created ${slotsData.length} tutoring slots`);

  // Create reviews
  console.log("Creating reviews...");
  const reviewsData = [
    {
      userId: studentUser[0].id,
      rating: 5,
      comment:
        "Numera has completely changed how I approach math. The video lessons are clear, and the practice problems really help me understand concepts. Highly recommend!",
      moderated: true,
    },
    {
      userId: studentUser[0].id,
      rating: 5,
      comment:
        "The tutoring feature is a lifesaver! I was stuck on factoring polynomials, and my tutor explained it in a way that finally clicked.",
      moderated: true,
    },
    {
      userId: studentUser[0].id,
      rating: 4,
      comment:
        "Great platform overall. The flashcards are super helpful for memorizing formulas. Would love to see more interactive exercises.",
      moderated: true,
    },
    {
      userId: studentUser[0].id,
      rating: 5,
      comment:
        "I love the progress tracking! Seeing my streak and badges keeps me motivated to study every day.",
      moderated: true,
    },
    {
      userId: studentUser[0].id,
      rating: 5,
      comment:
        "As a visual learner, the way lessons are structured with videos and examples is perfect for me. Finally understanding algebra!",
      moderated: true,
    },
  ];

  await db.insert(reviews).values(reviewsData);
  console.log(`Created ${reviewsData.length} reviews`);

  // Create skills
  console.log("Creating skills...");
  const skillsData = [
    {
      unitId: insertedUnits[0].id,
      slug: "evaluating-expressions",
      name: "Evaluating Expressions",
      description: "Substitute values and simplify",
    },
    {
      unitId: insertedUnits[0].id,
      slug: "combining-like-terms",
      name: "Combining Like Terms",
      description: "Simplify by adding/subtracting like terms",
    },
    {
      unitId: insertedUnits[1].id,
      slug: "solving-multi-step-equations",
      name: "Multi-Step Equations",
      description: "Solve equations with multiple operations",
    },
    {
      unitId: insertedUnits[3].id,
      slug: "finding-slope",
      name: "Finding Slope",
      description: "Calculate slope from two points or a graph",
    },
    {
      unitId: insertedUnits[7].id,
      slug: "factoring-trinomials",
      name: "Factoring Trinomials",
      description: "Factor quadratic expressions",
    },
  ];

  await db.insert(skills).values(skillsData);
  console.log(`Created ${skillsData.length} skills`);

  console.log("✅ Seed complete!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

