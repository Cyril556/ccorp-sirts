#!/bin/bash

echo "==============================="
echo " CCorp SIRTS — Server Setup"
echo "==============================="

# 1. Install dependencies
echo "[1/5] Installing dependencies..."
npm install

# 2. Auto-create .env with real credentials
if [ ! -f .env ]; then
  echo "[2/5] Creating .env file with Supabase credentials..."
  cat > .env << 'EOF'
# =============================================
# CCorp SIRTS — Server Environment Variables
# =============================================

# Supabase Pooled Connection (Prisma runtime)
DATABASE_URL="postgresql://postgres.tvjyllnfuptdcbirjvev:q8RtF5KEJWBIf3bs@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Direct Connection (Prisma migrate)
DIRECT_URL="postgresql://postgres.tvjyllnfuptdcbirjvev:q8RtF5KEJWBIf3bs@aws-1-eu-central-2.pooler.supabase.com:5432/postgres"

# JWT Secret
JWT_SECRET="ccorp_sirts_super_secret_2026"

# Server Port
PORT=5000
EOF
  echo "  ✅ .env created successfully."
else
  echo "[2/5] .env already exists — skipping."
fi

# 3. Generate Prisma client
echo "[3/5] Generating Prisma client..."
npx prisma generate

# 4. Run Prisma migration
echo "[4/5] Running Prisma migrate..."
npx prisma migrate dev --name init

# 5. Seed the database
echo "[5/5] Seeding database..."
npx prisma db seed

echo ""
echo "✅ Setup complete! Run 'npm run dev' to start the server."
