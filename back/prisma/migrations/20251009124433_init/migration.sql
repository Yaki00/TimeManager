-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Employer', 'Manager', 'Responsable');

-- CreateEnum
CREATE TYPE "ContratType" AS ENUM ('H15', 'H35', 'H40');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('Presence', 'Retard', 'Avertissement');

-- CreateEnum
CREATE TYPE "WarningStatus" AS ENUM ('Alert', 'Retard', 'AbsenceNonJustifiee');

-- CreateEnum
CREATE TYPE "VacationStatus" AS ENUM ('EnAttente', 'Accepte', 'Refuse');

-- CreateTable
CREATE TABLE "User" (
    "id_user" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "contrat_type" "ContratType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Team" (
    "id_team" SERIAL NOT NULL,
    "team_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id_team")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id_notification" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "Warning" (
    "id_warning" SERIAL NOT NULL,
    "status" "WarningStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "quantity" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warning_pkey" PRIMARY KEY ("id_warning")
);

-- CreateTable
CREATE TABLE "Vacation" (
    "id_vacation" SERIAL NOT NULL,
    "number_vacation" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "VacationStatus" NOT NULL,
    "id_user" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vacation_pkey" PRIMARY KEY ("id_vacation")
);

-- CreateTable
CREATE TABLE "Leave" (
    "id_leave" SERIAL NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "justification" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "days_leave" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("id_leave")
);

-- CreateTable
CREATE TABLE "Clocking" (
    "id_clocking" SERIAL NOT NULL,
    "arrival_time" TIME,
    "departure_time" TIME,
    "clocking_date" DATE NOT NULL,
    "total_hours" DECIMAL(8,2) NOT NULL,
    "week_day" TEXT NOT NULL,
    "work_day" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clocking_pkey" PRIMARY KEY ("id_clocking")
);

-- CreateTable
CREATE TABLE "Receive" (
    "id_user" INTEGER NOT NULL,
    "id_notification" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receive_pkey" PRIMARY KEY ("id_user","id_notification")
);

-- CreateTable
CREATE TABLE "Belongs" (
    "id_team" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Belongs_pkey" PRIMARY KEY ("id_team","id_user")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacation" ADD CONSTRAINT "Vacation_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clocking" ADD CONSTRAINT "Clocking_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receive" ADD CONSTRAINT "Receive_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receive" ADD CONSTRAINT "Receive_id_notification_fkey" FOREIGN KEY ("id_notification") REFERENCES "Notification"("id_notification") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Belongs" ADD CONSTRAINT "Belongs_id_team_fkey" FOREIGN KEY ("id_team") REFERENCES "Team"("id_team") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Belongs" ADD CONSTRAINT "Belongs_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
