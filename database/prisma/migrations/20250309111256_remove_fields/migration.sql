/*
  Warnings:

  - You are about to drop the column `basic_details` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `extracurricular` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `position_of_responsibility` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `projects` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `work_experience` on the `User` table. All the data in the column will be lost.
  - Added the required column `profile` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "basic_details",
DROP COLUMN "certifications",
DROP COLUMN "education",
DROP COLUMN "extracurricular",
DROP COLUMN "position_of_responsibility",
DROP COLUMN "projects",
DROP COLUMN "skills",
DROP COLUMN "work_experience",
ADD COLUMN     "profile" TEXT NOT NULL;
