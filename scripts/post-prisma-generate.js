#!/usr/bin/env node
// Post-generation script to create JavaScript wrappers for Prisma Client
// Prisma generates TypeScript files, but @prisma/client expects JavaScript

const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '../node_modules/.prisma/client');

// Create default.js that properly exports PrismaClient
// We use the Prisma runtime to construct the client, similar to how client.ts does it
const defaultJs = `// Prisma Client default export
// This file is required by @prisma/client/default.js
// We construct the PrismaClient using the runtime, similar to client.ts

const runtime = require('@prisma/client/runtime/library');
const path = require('path');
const $Enums = require('./enums');

// Get the PrismaClient class from the internal class module
// This is what client.ts does internally
const $Class = require('./internal/class');

// Export PrismaClient - this is the same pattern as the TypeScript client.ts
const PrismaClient = $Class.getPrismaClientClass ? $Class.getPrismaClientClass(__dirname) : $Class.PrismaClient;

// Also export Prisma namespace
const Prisma = require('./internal/prismaNamespace');

module.exports = {
  PrismaClient: PrismaClient || runtime.PrismaClient,
  Prisma: Prisma || {},
};
`;

// Create index.js
const indexJs = `// Main entry point
module.exports = require('./default');
`;

// Write the files
fs.writeFileSync(path.join(clientDir, 'default.js'), defaultJs);
fs.writeFileSync(path.join(clientDir, 'index.js'), indexJs);

console.log('✓ Created Prisma Client JavaScript wrappers');

