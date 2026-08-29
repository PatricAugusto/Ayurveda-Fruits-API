-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SUMMER', 'WINTER', 'SPRING', 'AUTUMN', 'MONSOON');

-- CreateEnum
CREATE TYPE "Dosha" AS ENUM ('VATA', 'PITTA', 'KAPHA');

-- CreateTable
CREATE TABLE "foods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "season" "Season" NOT NULL,
    "pacifies" "Dosha"[],
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "foods_name_key" ON "foods"("name");
