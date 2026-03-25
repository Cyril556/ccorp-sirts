# =======================================
# CCorp SIRTS — Windows PowerShell Setup
# =======================================

Write-Host "==============================="
Write-Host " CCorp SIRTS — Server Setup"
Write-Host "==============================="

# 1. Install dependencies
Write-Host "[1/5] Installing dependencies..."
npm install

# 2. Auto-create .env
$envPath = ".env"
if (-Not (Test-Path $envPath)) {
    Write-Host "[2/5] Creating .env file..."
    $envContent = @"
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
"@
    $envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
    Write-Host "  .env created successfully."
} else {
    Write-Host "[2/5] .env already exists — skipping."
}

# 3. Generate Prisma client
Write-Host "[3/5] Generating Prisma client..."
npx prisma generate

# 4. Run Prisma migration
Write-Host "[4/5] Running Prisma migrate..."
npx prisma migrate dev --name init

# 5. Seed the database
Write-Host "[5/5] Seeding database..."
npx prisma db seed

Write-Host ""
Write-Host "Setup complete! Run 'npm run dev' to start the server."
