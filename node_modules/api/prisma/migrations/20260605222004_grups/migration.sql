-- AlterTable
ALTER TABLE "Task" ADD COLUMN "groupId" TEXT;

-- AddForeignKey
ALTER TABLE "Task"
ADD CONSTRAINT "Task_groupId_fkey"
FOREIGN KEY ("groupId")
REFERENCES "Group"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;