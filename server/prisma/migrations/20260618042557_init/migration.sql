-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Success', 'Cancelled', 'Reported', 'Pending', 'Ongoing');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('link', 'picture', 'experience', 'group', 'asset');

-- CreateTable
CREATE TABLE "Users" (
    "id" BIGSERIAL NOT NULL,
    "rblxUserID" BIGINT NOT NULL,
    "robloxUsername" TEXT NOT NULL,
    "productAccountAge" INTEGER NOT NULL,
    "robloxAccountAge" INTEGER NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "transactionID" BIGSERIAL NOT NULL,
    "projectName" TEXT NOT NULL,
    "amountInCents" INTEGER NOT NULL,
    "clientId" BIGINT NOT NULL,
    "developerId" BIGINT NOT NULL,
    "developerReviewId" BIGINT,
    "clientReviewId" BIGINT,
    "status" "Status" NOT NULL,
    "visible" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("transactionID")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "reviewID" BIGSERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reviewerId" BIGINT NOT NULL,
    "revieweeId" BIGINT NOT NULL,
    "linkedTransactionId" BIGINT NOT NULL,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("reviewID")
);

-- CreateTable
CREATE TABLE "Media" (
    "mediaId" BIGSERIAL NOT NULL,
    "type" "MediaType" NOT NULL,
    "linkedTransactionId" BIGINT NOT NULL,
    "contentID" BIGINT,
    "contentString" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("mediaId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_rblxUserID_key" ON "Users"("rblxUserID");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_developerReviewId_key" ON "Transactions"("developerReviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_clientReviewId_key" ON "Transactions"("clientReviewId");

-- CreateIndex
CREATE INDEX "Transactions_clientId_idx" ON "Transactions"("clientId");

-- CreateIndex
CREATE INDEX "Transactions_developerId_idx" ON "Transactions"("developerId");

-- CreateIndex
CREATE INDEX "Transactions_status_idx" ON "Transactions"("status");

-- CreateIndex
CREATE INDEX "Reviews_revieweeId_idx" ON "Reviews"("revieweeId");

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_reviewerId_linkedTransactionId_key" ON "Reviews"("reviewerId", "linkedTransactionId");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Users"("rblxUserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Users"("rblxUserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_developerReviewId_fkey" FOREIGN KEY ("developerReviewId") REFERENCES "Reviews"("reviewID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_clientReviewId_fkey" FOREIGN KEY ("clientReviewId") REFERENCES "Reviews"("reviewID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_linkedTransactionId_fkey" FOREIGN KEY ("linkedTransactionId") REFERENCES "Transactions"("transactionID") ON DELETE RESTRICT ON UPDATE CASCADE;
