-- CreateIndex
CREATE INDEX "Reviews_revieweeId_reviewID_idx" ON "Reviews"("revieweeId", "reviewID");

-- CreateIndex
CREATE INDEX "Transactions_clientId_transactionID_idx" ON "Transactions"("clientId", "transactionID");

-- CreateIndex
CREATE INDEX "Transactions_developerId_transactionID_idx" ON "Transactions"("developerId", "transactionID");
