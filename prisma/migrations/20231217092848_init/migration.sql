/*
  Warnings:

  - You are about to drop the column `permissionID` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `roleID` on the `Role` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Role_Permission" DROP CONSTRAINT "Role_Permission_permissionID_fkey";

-- DropForeignKey
ALTER TABLE "Role_Permission" DROP CONSTRAINT "Role_Permission_roleID_fkey";

-- DropIndex
DROP INDEX "Permission_permissionID_key";

-- DropIndex
DROP INDEX "Role_roleID_key";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "permissionID";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "roleID";

-- AddForeignKey
ALTER TABLE "Role_Permission" ADD CONSTRAINT "Role_Permission_roleID_fkey" FOREIGN KEY ("roleID") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role_Permission" ADD CONSTRAINT "Role_Permission_permissionID_fkey" FOREIGN KEY ("permissionID") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
