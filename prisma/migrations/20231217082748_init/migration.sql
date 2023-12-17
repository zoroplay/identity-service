/*
  Warnings:

  - You are about to drop the column `role_permissonId` on the `Permission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_role_permissonId_fkey";

-- DropIndex
DROP INDEX "Permission_role_permissonId_key";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "role_permissonId";

-- AlterTable
ALTER TABLE "Role_Permission" ADD COLUMN     "permissionID" INTEGER;

-- AddForeignKey
ALTER TABLE "Role_Permission" ADD CONSTRAINT "Role_Permission_permissionID_fkey" FOREIGN KEY ("permissionID") REFERENCES "Permission"("permissionID") ON DELETE SET NULL ON UPDATE CASCADE;
