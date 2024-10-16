/*
  Warnings:

  - A unique constraint covering the columns `[loginId]` on the table `Pin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pin_loginId_key" ON "Pin"("loginId");
