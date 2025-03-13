-- AlterTable
ALTER TABLE "User" ALTER COLUMN "basic_details" DROP NOT NULL,
ALTER COLUMN "education" DROP NOT NULL,
ALTER COLUMN "skills" DROP NOT NULL,
ALTER COLUMN "work_experience" DROP NOT NULL,
ALTER COLUMN "certifications" DROP NOT NULL,
ALTER COLUMN "extracurricular" DROP NOT NULL,
ALTER COLUMN "position_of_responsibility" DROP NOT NULL,
ALTER COLUMN "projects" DROP NOT NULL;
