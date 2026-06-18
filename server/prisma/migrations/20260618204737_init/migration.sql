/*
  Warnings:

  - You are about to alter the column `reviewerId` on the `Reviews` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `revieweeId` on the `Reviews` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `clientId` on the `Transactions` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `developerId` on the `Transactions` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `rblxUserID` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_developerId_fkey";

-- AlterTable
ALTER TABLE "Reviews" ALTER COLUMN "reviewerId" SET DATA TYPE INTEGER,
ALTER COLUMN "revieweeId" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "clientId" SET DATA TYPE INTEGER,
ALTER COLUMN "developerId" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "rblxUserID" SET DATA TYPE INTEGER;
