/*
  Warnings:

  - You are about to drop the column `Projects` on the `User` table. All the data in the column will be lost.
  - Added the required column `certifications` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `extracurricular` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_of_responsibility` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projects` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Projects",
ADD COLUMN     "certifications" TEXT NOT NULL,
ADD COLUMN     "extracurricular" TEXT NOT NULL,
ADD COLUMN     "position_of_responsibility" TEXT NOT NULL,
ADD COLUMN     "projects" TEXT NOT NULL;
