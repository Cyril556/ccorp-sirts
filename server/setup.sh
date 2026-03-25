#!/bin/bash

echo "==============================="
echo " CCorp SIRTS — Server Setup"
echo "==============================="

# 1. Install dependencies
echo "[1/4] Installing dependencies..."
npm install

# 2. Check for .env
if [ ! -f .env ]; then
  echo "[2/4] .env not found — creating from .env.example..."
  cp .env.example .env
  echo "  ⚠️  Open server/.env and fill in your DATABASE_URL, DIRECT_URL, and JWT_SECRET"
else
  echo "[2/4] .env already exists — skipping."
fi

# 3. Run Prisma migration
echo "[3/4] Running Prisma migrate..."
npx prisma migrate dev --name init

# 4. Seed the database
echo "[4/4] Seeding database..."
npx prisma db seed

echo ""
echo "✅ Setup complete! Run 'npm run dev' to start the server."
