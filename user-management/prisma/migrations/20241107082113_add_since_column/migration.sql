-- CreateTable
CREATE TABLE "MikroTik" (
    "id" SERIAL NOT NULL,
    "identity" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "since" TIMESTAMP(3) NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MikroTik_pkey" PRIMARY KEY ("id")
);
