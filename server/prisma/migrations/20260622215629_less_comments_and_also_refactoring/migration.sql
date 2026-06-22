-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_clientReviewId_fkey" FOREIGN KEY ("clientReviewId") REFERENCES "Reviews"("reviewID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_developerReviewId_fkey" FOREIGN KEY ("developerReviewId") REFERENCES "Reviews"("reviewID") ON DELETE SET NULL ON UPDATE CASCADE;
