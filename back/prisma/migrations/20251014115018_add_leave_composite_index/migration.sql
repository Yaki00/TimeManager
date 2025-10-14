-- DropIndex
DROP INDEX "public"."Leave_id_user_idx";

-- AlterTable
ALTER TABLE "Leave" ALTER COLUMN "status" SET DEFAULT 'EnAttente';

-- CreateIndex
CREATE INDEX "Leave_id_user_start_date_end_date_idx" ON "Leave"("id_user", "start_date", "end_date");
