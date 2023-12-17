/*
  Warnings:

  - Made the column `roleID` on table `Role_Permission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `permissionID` on table `Role_Permission` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Role_Permission" DROP CONSTRAINT "Role_Permission_permissionID_fkey";

-- DropForeignKey
ALTER TABLE "Role_Permission" DROP CONSTRAINT "Role_Permission_roleID_fkey";

-- AlterTable
ALTER TABLE "Role_Permission" ALTER COLUMN "roleID" SET NOT NULL,
ALTER COLUMN "permissionID" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Role_Permission" ADD CONSTRAINT "Role_Permission_roleID_fkey" FOREIGN KEY ("roleID") REFERENCES "Role"("roleID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role_Permission" ADD CONSTRAINT "Role_Permission_permissionID_fkey" FOREIGN KEY ("permissionID") REFERENCES "Permission"("permissionID") ON DELETE RESTRICT ON UPDATE CASCADE;
