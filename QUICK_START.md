# ⚡ Numera - Quick Start Guide

Get Numera running in 5 minutes.

---

## 📋 Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- pnpm 8+ (`npm install -g pnpm`)
- Git

---

## 🚀 Setup (5 minutes)

```bash
# 1. Clone & enter directory
git clone <url>
cd numera-fbla

# 2. Install dependencies
pnpm install

# 3. Create .env.local
echo 'DATABASE_URL=file:./dev.db
AUTH_SECRET=your-secret-key-change-me
AUTH_URL=http://localhost:3000' > .env.local

# 4. Setup database
pnpm db:generate
pnpm db:push
pnpm db:seed

# 5. Start server
pnpm dev

# 6. Open http://localhost:3000
```

---

## 🎓 Demo Accounts

```
Student:  student@example.com / Passw0rd!
Teacher:  teacher@example.com / Passw0rd!
Admin:    admin@example.com / Passw0rd!
```

---

## 📚 Important Files

| File | Purpose |
|------|---------|
| `/SETUP.md` | Detailed setup guide |
| `/README.md` | Project overview |
| `/docs/rubric.md` | FBLA requirements mapping |
| `/docs/demo-script.md` | Presentation guide |
| `/docs/design-decisions.md` | Architecture decisions |
| `src/db/schema.ts` | Database schema |
| `scripts/seed.ts` | Demo data creation |

---

## 🎯 Next

- **Setup Help?** → Read `/SETUP.md`
- **Presentation?** → Read `/docs/demo-script.md`
- **Questions?** → Check `/docs/design-decisions.md`

---

## ✅ Verify Success

1. Open http://localhost:3000
2. Click "Sign In"
3. Use: `student@example.com` / `Passw0rd!`
4. You should see the dashboard

**If it works, you're ready!** 🎉

---

**For more**: See `/SETUP.md`

