import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { config } from 'dotenv';
import { resolve } from 'path';
import { skills, units } from '../drizzle/schema';
import { eq } from '../src/lib/drizzle-helpers';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

// Key skills for each unit
const unitSkills: Record<string, string[]> = {
  'linear-equations': [
    'Solving one-step equations',
    'Solving two-step equations',
    'Solving multi-step equations',
    'Working with variables on both sides',
    'Identifying solution types (one, none, infinite)',
    'Applying inverse operations',
    'Solving equations with fractions and decimals'
  ],
  'systems-of-equations': [
    'Graphing systems of equations',
    'Substitution method',
    'Elimination method',
    'Identifying solution types',
    'Solving word problems with systems',
    'Checking solutions',
    'Working with inconsistent and dependent systems'
  ],
  'polynomials': [
    'Adding and subtracting polynomials',
    'Multiplying polynomials',
    'Dividing polynomials',
    'Understanding polynomial degree',
    'Identifying leading coefficients',
    'Working with polynomial operations',
    'Simplifying polynomial expressions'
  ],
  'quadratics': [
    'Factoring quadratic expressions',
    'Solving by factoring',
    'Completing the square',
    'Using the quadratic formula',
    'Identifying discriminant',
    'Graphing quadratic functions',
    'Finding vertex and axis of symmetry'
  ],
  'functions': [
    'Understanding function notation',
    'Evaluating functions',
    'Finding domain and range',
    'Identifying functions from graphs',
    'Working with function composition',
    'Understanding function transformations',
    'Analyzing function behavior'
  ],
  'exponents-radicals': [
    'Applying exponent rules',
    'Simplifying expressions with exponents',
    'Working with negative exponents',
    'Understanding scientific notation',
    'Simplifying radical expressions',
    'Rationalizing denominators',
    'Solving radical equations'
  ],
  'rational-expressions': [
    'Simplifying rational expressions',
    'Multiplying and dividing rationals',
    'Adding and subtracting rationals',
    'Finding common denominators',
    'Solving rational equations',
    'Identifying restrictions',
    'Working with complex fractions'
  ],
  'graphing-functions': [
    'Graphing linear functions',
    'Graphing quadratic functions',
    'Understanding slope and intercepts',
    'Identifying key features of graphs',
    'Transforming graphs',
    'Analyzing graph behavior',
    'Interpreting graphs in context'
  ],
  'absolute-value': [
    'Understanding absolute value',
    'Solving absolute value equations',
    'Solving absolute value inequalities',
    'Graphing absolute value functions',
    'Working with distance on number line',
    'Applying absolute value in word problems',
    'Identifying solution sets'
  ],
  'exponential-functions': [
    'Understanding exponential growth and decay',
    'Graphing exponential functions',
    'Working with exponential equations',
    'Applying compound interest formulas',
    'Understanding half-life problems',
    'Identifying exponential patterns',
    'Modeling real-world scenarios'
  ],
  'sequences': [
    'Understanding arithmetic sequences',
    'Understanding geometric sequences',
    'Finding nth terms',
    'Calculating sums of sequences',
    'Identifying sequence patterns',
    'Working with series notation',
    'Applying sequences to word problems'
  ],
  'data-analysis': [
    'Calculating measures of central tendency',
    'Understanding spread and variability',
    'Creating and interpreting graphs',
    'Analyzing data distributions',
    'Working with scatter plots',
    'Understanding correlation',
    'Making data-driven decisions'
  ],
  'probability': [
    'Calculating theoretical probability',
    'Understanding experimental probability',
    'Working with compound events',
    'Applying counting principles',
    'Understanding conditional probability',
    'Using probability models',
    'Interpreting probability results'
  ],
  'real-world-applications': [
    'Modeling real-world scenarios',
    'Translating word problems to equations',
    'Interpreting solutions in context',
    'Applying multiple concepts together',
    'Validating solutions',
    'Understanding problem constraints',
    'Making practical decisions'
  ]
};

async function addKeySkills() {
  console.log('🔄 Adding key skills to all units...');

  try {
    // Get all units
    const allUnits = await db.select().from(units);

    for (const unit of allUnits) {
      const skillsForUnit = unitSkills[unit.slug] || [];
      
      if (skillsForUnit.length === 0) {
        console.log(`⚠️  No skills defined for unit: ${unit.title} (${unit.slug})`);
        continue;
      }

      // Check if skills already exist for this unit
      const existingSkills = await db
        .select()
        .from(skills)
        .where(eq(skills.unitId, unit.id));

      if (existingSkills.length > 0) {
        console.log(`⏭️  Skipping ${unit.title} - already has ${existingSkills.length} skills`);
        continue;
      }

      // Insert skills for this unit
      const skillsToInsert = skillsForUnit.map((skillName) => ({
        unitId: unit.id,
        slug: `${unit.slug}-${skillName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
        name: skillName,
      }));

      await db.insert(skills).values(skillsToInsert);
      console.log(`✅ Added ${skillsToInsert.length} skills to: ${unit.title}`);
    }

    console.log('✅ All key skills added successfully!');
  } catch (error) {
    console.error('❌ Error adding key skills:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

addKeySkills();

