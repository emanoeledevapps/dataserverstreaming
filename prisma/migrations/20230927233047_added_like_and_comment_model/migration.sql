-- CreateTable
CREATE TABLE "CommentPublication" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "userData" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikePublication" (
    "id" TEXT NOT NULL,
    "userData" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikePublication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommentPublication" ADD CONSTRAINT "CommentPublication_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikePublication" ADD CONSTRAINT "LikePublication_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
