-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'Admin',
    `schoolId` INTEGER NOT NULL AUTO_INCREMENT,
    `schoolName` VARCHAR(191) NULL,
    `contactNumber` VARCHAR(191) NULL,
    `schoolAddress` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `tehsil` VARCHAR(191) NULL,
    `fax` VARCHAR(191) NULL,
    `bankTitle` VARCHAR(191) NULL,
    `p_fName` VARCHAR(191) NULL,
    `p_mName` VARCHAR(191) NULL,
    `p_lName` VARCHAR(191) NULL,
    `p_contact` VARCHAR(191) NULL,
    `p_phone` VARCHAR(191) NULL,
    `p_email` VARCHAR(191) NULL,
    `c_fName` VARCHAR(191) NULL,
    `c_mName` VARCHAR(191) NULL,
    `c_lName` VARCHAR(191) NULL,
    `c_contact` VARCHAR(191) NULL,
    `c_phone` VARCHAR(191) NULL,
    `c_email` VARCHAR(191) NULL,
    `c_accountDetails` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `p_Name` VARCHAR(255) NULL,
    `c_Name` VARCHAR(255) NULL,
    `city` VARCHAR(255) NULL,
    `districtCode` VARCHAR(255) NULL,
    `districtName` VARCHAR(250) NULL,

    UNIQUE INDEX `User_id_key`(`id`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_schoolId_key`(`schoolId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_new` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'Admin',
    `schoolId` INTEGER NOT NULL AUTO_INCREMENT,
    `schoolName` VARCHAR(191) NULL,
    `contactNumber` VARCHAR(191) NULL,
    `schoolAddress` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `districtCode` VARCHAR(255) NULL,
    `districtName` VARCHAR(250) NULL,
    `tehsil` VARCHAR(191) NULL,
    `fax` VARCHAR(191) NULL,
    `bankTitle` VARCHAR(191) NULL,
    `p_fName` VARCHAR(191) NULL,
    `p_mName` VARCHAR(191) NULL,
    `p_lName` VARCHAR(191) NULL,
    `p_contact` VARCHAR(191) NULL,
    `p_phone` VARCHAR(191) NULL,
    `p_email` VARCHAR(191) NULL,
    `c_fName` VARCHAR(191) NULL,
    `c_mName` VARCHAR(191) NULL,
    `c_lName` VARCHAR(191) NULL,
    `c_contact` VARCHAR(191) NULL,
    `c_phone` VARCHAR(191) NULL,
    `c_email` VARCHAR(191) NULL,
    `c_accountDetails` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `c_Name` VARCHAR(255) NULL,
    `city` VARCHAR(255) NULL,
    `p_Name` VARCHAR(255) NULL,

    UNIQUE INDEX `user_new_id_key`(`id`),
    UNIQUE INDEX `user_new_email_key`(`email`),
    UNIQUE INDEX `user_new_schoolId_key`(`schoolId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resetAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Reset_token_key`(`token`),
    INDEX `Reset_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reset_new` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resetAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `reset_new_token_key`(`token`),
    INDEX `reset_new_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Registration` (
    `id` VARCHAR(191) NOT NULL,
    `contestId` VARCHAR(191) NOT NULL,
    `schoolId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `registeredBy` VARCHAR(191) NOT NULL,
    `schoolName` VARCHAR(191) NULL,

    INDEX `Registration_contestId_idx`(`contestId`),
    INDEX `Registration_registeredBy_idx`(`registeredBy`),
    INDEX `Registration_schoolId_idx`(`schoolId`),
    UNIQUE INDEX `Registration_contestId_schoolId_key`(`contestId`, `schoolId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registration_new` (
    `id` VARCHAR(191) NOT NULL,
    `contestId` VARCHAR(191) NOT NULL,
    `schoolId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `registeredBy` VARCHAR(191) NOT NULL,
    `schoolName` VARCHAR(191) NULL,

    INDEX `registration_new_contestId_idx`(`contestId`),
    INDEX `registration_new_registeredBy_idx`(`registeredBy`),
    INDEX `registration_new_schoolId_idx`(`schoolId`),
    UNIQUE INDEX `registration_new_contestId_schoolId_key`(`contestId`, `schoolId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContestType` (
    `id` VARCHAR(191) NOT NULL,
    `contestName` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(10000) NOT NULL,
    `contestCh` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ContestType_contestName_key`(`contestName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contesttype_new` (
    `id` VARCHAR(191) NOT NULL,
    `contestName` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(10000) NOT NULL,
    `contestCh` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `contesttype_new_contestName_key`(`contestName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contest` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `contestDate` VARCHAR(191) NULL,
    `resultDate` VARCHAR(191) NULL,
    `contestCh` VARCHAR(191) NULL,
    `contestTypeId` VARCHAR(191) NOT NULL,

    INDEX `Contest_contestTypeId_idx`(`contestTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contest_new` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `contestDate` VARCHAR(191) NULL,
    `resultDate` VARCHAR(191) NULL,
    `contestCh` VARCHAR(191) NULL,
    `contestTypeId` VARCHAR(191) NOT NULL,

    INDEX `contest_new_contestTypeId_idx`(`contestTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registrationId` VARCHAR(191) NOT NULL,
    `rollNumber` VARCHAR(191) NOT NULL,
    `studentName` VARCHAR(191) NOT NULL,
    `fatherName` VARCHAR(191) NOT NULL,
    `class` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,

    INDEX `Student_registrationId_idx`(`registrationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_new` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registrationId` VARCHAR(191) NOT NULL,
    `rollNumber` VARCHAR(191) NOT NULL,
    `studentName` VARCHAR(191) NOT NULL,
    `fatherName` VARCHAR(191) NOT NULL,
    `class` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,

    INDEX `student_new_registrationId_idx`(`registrationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentProof` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,

    INDEX `PaymentProof_registrationId_idx`(`registrationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paymentproof_new` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,

    INDEX `paymentproof_new_registrationId_idx`(`registrationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `u_correct_answers` (
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    `UPDATED_ON` DATETIME(3) NOT NULL,
    `ANSWERS` VARCHAR(1500) NULL,
    `CLASS_ID` INTEGER NULL,
    `CONTEST_ID` VARCHAR(255) NOT NULL DEFAULT 'defaultContestId',

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `u_logins` (
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    `UPDATED_ON` DATETIME(3) NOT NULL,
    `EMAIL` VARCHAR(255) NULL,
    `NAME` VARCHAR(255) NULL,
    `PASSWORD` VARCHAR(255) NULL,
    `STATUS` VARCHAR(255) NULL,
    `USERNAME` VARCHAR(255) NULL,

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `u_positions` (
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    `UPDATED_ON` DATETIME(3) NOT NULL,
    `CLASS` VARCHAR(255) NULL,
    `DISTRICT` VARCHAR(255) NULL,
    `NO_OF_STUDENTS` INTEGER NULL,
    `POSITION` INTEGER NULL,
    `school_Id` INTEGER NULL,
    `SCORE` DECIMAL(19, 2) NULL,
    `TYPE` VARCHAR(255) NULL,

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `u_scores` (
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    `UPDATED_ON` DATETIME(3) NOT NULL,
    `C_ROW1` INTEGER NULL,
    `C_ROW2` INTEGER NULL,
    `C_ROW3` INTEGER NULL,
    `C_TOTAL` INTEGER NULL,
    `CONTEST_ID` VARCHAR(500) NOT NULL,
    `CREDIT_SCORE` INTEGER NULL,
    `DESCRIPTION` VARCHAR(1000) NULL,
    `MISSING` INTEGER NULL,
    `PERCENTAGE` DECIMAL(19, 2) NULL,
    `ROLL_NO` VARCHAR(255) NULL,
    `SCORE` BIGINT NULL,
    `TOTAL_MARKS` BIGINT NULL,
    `WRONG` INTEGER NULL,

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `u_sheet_scans` (
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    `UPDATED_ON` DATETIME(3) NOT NULL,
    `ANSWERS` VARCHAR(1500) NULL,
    `FILE_NAME` VARCHAR(255) NULL,
    `KEY_LOGS` VARCHAR(1500) NULL,
    `REASON` VARCHAR(1500) NULL,
    `ROLL_NO` VARCHAR(255) NULL,
    `STATUS` VARCHAR(255) NULL,
    `CONTEST_ID` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

