/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `Projects` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basic_details` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `education` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skills` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_experience` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "Projects" TEXT NOT NULL,
ADD COLUMN     "basic_details" TEXT NOT NULL,
ADD COLUMN     "education" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL,
ADD COLUMN     "skills" TEXT NOT NULL,
ADD COLUMN     "work_experience" TEXT NOT NULL;
