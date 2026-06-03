-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: real_togather
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blogs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `tags` json DEFAULT NULL,
  `isPublished` tinyint(1) NOT NULL DEFAULT '0',
  `authorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `publishedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blogs_slug_key` (`slug`),
  KEY `blogs_slug_idx` (`slug`),
  KEY `blogs_isPublished_idx` (`isPublished`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES ('815b4231-806f-4395-b3ac-65f43f3a7799','Why Group Buying is the Future','future-of-real-estate-group-buying','Detailed content about collective intelligence in real estate...',NULL,NULL,1,NULL,NULL,'2026-04-27 12:29:29.120','2026-04-27 12:29:29.120','https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000');
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `case_studies`
--

DROP TABLE IF EXISTS `case_studies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_studies` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `propertyName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `originalPrice` decimal(12,2) DEFAULT NULL,
  `finalPrice` decimal(12,2) DEFAULT NULL,
  `savings` decimal(12,2) DEFAULT NULL,
  `savingsPercent` decimal(5,2) DEFAULT NULL,
  `buyersCount` int DEFAULT NULL,
  `videoUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stat1Label` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stat1Value` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stat2Label` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stat2Value` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `isPublished` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `case_studies_slug_key` (`slug`),
  KEY `case_studies_slug_idx` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `case_studies`
--

LOCK TABLES `case_studies` WRITE;
/*!40000 ALTER TABLE `case_studies` DISABLE KEYS */;
INSERT INTO `case_studies` VALUES ('9f4ba683-b101-46d0-ad17-c990d75e6cb8','dwd','dwd','dsdsdsdsdsdsdsds',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'http://localhost:5000/uploads/1777292612343-285074574.mp4','ds','dsds','dsdsdsd','dsdsds','http://localhost:5000/uploads/1777292616043-153578338.jpeg',NULL,1,'2026-04-27 12:23:53.764','2026-04-27 12:23:53.764');
/*!40000 ALTER TABLE `case_studies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comparisons`
--

DROP TABLE IF EXISTS `comparisons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comparisons` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `comparisons_userId_propertyId_key` (`userId`,`propertyId`),
  KEY `comparisons_propertyId_fkey` (`propertyId`),
  CONSTRAINT `comparisons_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `comparisons_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comparisons`
--

LOCK TABLES `comparisons` WRITE;
/*!40000 ALTER TABLE `comparisons` DISABLE KEYS */;
INSERT INTO `comparisons` VALUES ('0b4cc6e8-c68d-4c42-830b-a426c65d1318','ef759917-ebeb-4f5e-bfc2-e164a9e649ec','0316c383-44bb-40d6-9155-b08c06db5ca4','2026-04-27 12:55:17.213'),('8f284766-b099-42cf-8669-691b4fc49b24','ef759917-ebeb-4f5e-bfc2-e164a9e649ec','375fce77-04fa-421e-9c1d-4daf5cead647','2026-04-27 12:55:15.944');
/*!40000 ALTER TABLE `comparisons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `developers`
--

DROP TABLE IF EXISTS `developers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `developers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `website` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `logoUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `developers`
--

LOCK TABLES `developers` WRITE;
/*!40000 ALTER TABLE `developers` DISABLE KEYS */;
INSERT INTO `developers` VALUES ('90e6f9cd-e5a9-475c-9adb-8407ae37727b','Godrej Properties','https://www.godrejproperties.com/','One of India\'s leading real estate developers.','Mumbai',1,'2026-04-27 12:29:29.007','2026-04-27 12:29:29.007','https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Godrej_Properties_logo.svg/1200px-Godrej_Properties_logo.svg.png'),('e99fc9c6-6f61-439c-be56-16310effb015','DLF Limited','https://www.dlf.in/','Largest publicly listed real estate company in India.','Gurgaon',1,'2026-04-27 12:29:29.035','2026-04-27 12:29:29.035','https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/DLF_logo.svg/1200px-DLF_logo.svg.png');
/*!40000 ALTER TABLE `developers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` VALUES ('005d76c3-1ab2-4b88-832d-b688e31e5cb2','dwd','dsds','dsds',0,1,'2026-04-27 12:24:06.859','2026-04-27 12:24:06.859');
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_members`
--

DROP TABLE IF EXISTS `group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_members` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `groupId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `joinedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_members_groupId_userId_key` (`groupId`,`userId`),
  KEY `group_members_userId_fkey` (`userId`),
  CONSTRAINT `group_members_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `group_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_members`
--

LOCK TABLES `group_members` WRITE;
/*!40000 ALTER TABLE `group_members` DISABLE KEYS */;
INSERT INTO `group_members` VALUES ('72f67460-13d0-4ee9-bd21-8e910d9bf1f6','1b6319c2-1b59-4245-86c3-9fc7aa23983e','31d6f853-5653-424d-a53d-b0c2281bcac4','2026-04-27 12:40:20.231',1);
/*!40000 ALTER TABLE `group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('OPEN','FULL','NEGOTIATING','CLOSED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `maxMembers` int NOT NULL DEFAULT '5',
  `dealStatus` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `targetDate` datetime(3) DEFAULT NULL,
  `closedAt` datetime(3) DEFAULT NULL,
  `whatsappGroupLink` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `groups_propertyId_idx` (`propertyId`),
  KEY `groups_status_idx` (`status`),
  CONSTRAINT `groups_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
INSERT INTO `groups` VALUES ('1b6319c2-1b59-4245-86c3-9fc7aa23983e','375fce77-04fa-421e-9c1d-4daf5cead647','OPEN',5,'PENDING',NULL,NULL,NULL,NULL,'2026-04-27 12:29:29.094','2026-04-27 12:29:29.094'),('eaae1813-5c28-4ba4-b6c1-c20c08758af0','0316c383-44bb-40d6-9155-b08c06db5ca4','OPEN',5,'PENDING',NULL,NULL,NULL,NULL,'2026-04-27 12:29:29.061','2026-04-27 12:29:29.061');
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isContacted` tinyint(1) NOT NULL DEFAULT '0',
  `source` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `interest` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `leads_email_idx` (`email`),
  KEY `leads_userId_fkey` (`userId`),
  CONSTRAINT `leads_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO',
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `notifications_userId_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('3c5999cf-caf1-46ed-b1de-c2864d367fdc','31d6f853-5653-424d-a53d-b0c2281bcac4','Welcome to the Group!','You have successfully joined the group for DLF Ultima. We\'ll notify you as more members join.','SUCCESS',0,'/dashboard','2026-04-27 11:54:07.089'),('ec1580bd-d1bf-4052-b15d-92904ae63354','31d6f853-5653-424d-a53d-b0c2281bcac4','Welcome to the Group!','You have successfully joined the group for DLF Ultima. We\'ll notify you as more members join.','SUCCESS',0,'/dashboard','2026-04-27 12:40:20.314');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otps`
--

DROP TABLE IF EXISTS `otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otps` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `isUsed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `otps_email_idx` (`email`),
  CONSTRAINT `otps_email_fkey` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otps`
--

LOCK TABLES `otps` WRITE;
/*!40000 ALTER TABLE `otps` DISABLE KEYS */;
INSERT INTO `otps` VALUES ('14ea467f-9274-45ac-8327-779a2f03c408','admin@realtogather.com','401746','2026-04-27 11:45:12.971',1,'2026-04-27 11:35:12.972'),('410c61de-c3f8-48ca-92ec-9431a16e7b32','a@gmail.com','147082','2026-04-27 12:51:41.105',1,'2026-04-27 12:41:41.107'),('973343c1-e4d3-4e90-b0cb-12ed83ef7041','admin@realtogather.com','547354','2026-04-27 11:44:34.431',1,'2026-04-27 11:34:34.433'),('fb7c1ea0-fd66-404b-8eea-a144b896a69f','admin@realtogather.com','946200','2026-04-27 11:56:34.514',1,'2026-04-27 11:46:34.517');
/*!40000 ALTER TABLE `otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_videos`
--

DROP TABLE IF EXISTS `project_videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_videos` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `order` int NOT NULL DEFAULT '0',
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `isFeatured` tinyint(1) NOT NULL DEFAULT '0',
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_videos_propertyId_fkey` (`propertyId`),
  CONSTRAINT `project_videos_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_videos`
--

LOCK TABLES `project_videos` WRITE;
/*!40000 ALTER TABLE `project_videos` DISABLE KEYS */;
INSERT INTO `project_videos` VALUES ('0109ffa1-2bdd-4fda-b8e3-aa270e52a4c5','DLF Ultima Tour','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',1,0,'375fce77-04fa-421e-9c1d-4daf5cead647','2026-04-27 12:29:29.103','2026-04-27 12:29:29.103',1,'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-view-28771-large.mp4'),('870a9665-8aca-4296-91a8-5ec740f6445c','Godrej Urban Park Tour','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',1,0,'0316c383-44bb-40d6-9155-b08c06db5ca4','2026-04-27 12:29:29.074','2026-04-27 12:29:29.074',1,'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-view-28771-large.mp4');
/*!40000 ALTER TABLE `project_videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL,
  `originalPrice` decimal(12,2) DEFAULT NULL,
  `discountedPrice` decimal(12,2) DEFAULT NULL,
  `expiryDate` datetime(3) DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `locality` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bhk` int DEFAULT NULL,
  `area` decimal(10,2) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','SOLD','NEGOTIATING','UNDER_CONSTRUCTION','READY_TO_MOVE','PRE_LAUNCH') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'BUY',
  `amenities` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `videoUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnailUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `targetGroupSize` int NOT NULL DEFAULT '5',
  `isFeatured` tinyint(1) NOT NULL DEFAULT '0',
  `developerId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `trackingCount` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `properties_city_idx` (`city`),
  KEY `properties_status_idx` (`status`),
  KEY `properties_developerId_fkey` (`developerId`),
  CONSTRAINT `properties_developerId_fkey` FOREIGN KEY (`developerId`) REFERENCES `developers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES ('0316c383-44bb-40d6-9155-b08c06db5ca4','Godrej Urban Park','Ultra-luxury residential project in Chandivali.',18500000.00,21500000.00,NULL,NULL,'Mumbai','Chandivali',2,1150.00,'UNDER_CONSTRUCTION','Residential','[\"Gym\", \"Pool\", \"Park\"]','[\"https://images.unsplash.com/photo-1460317442991-0ec239387146?auto=format&fit=crop&q=80&w=1000\"]',NULL,'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',5,1,'90e6f9cd-e5a9-475c-9adb-8407ae37727b','2026-04-27 12:29:29.047','2026-04-27 12:29:29.047',0),('375fce77-04fa-421e-9c1d-4daf5cead647','DLF Ultima','Spacious 3 BHK apartments in Sector 81.',24500000.00,28500000.00,NULL,NULL,'Gurgaon','Sector 81',3,2100.00,'READY_TO_MOVE','Residential',NULL,NULL,NULL,'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',5,1,'e99fc9c6-6f61-439c-be56-16310effb015','2026-04-27 12:29:29.084','2026-04-27 12:29:29.084',0);
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rm_assignments`
--

DROP TABLE IF EXISTS `rm_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rm_assignments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rmId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rm_assignments_rmId_userId_key` (`rmId`,`userId`),
  KEY `rm_assignments_userId_fkey` (`userId`),
  CONSTRAINT `rm_assignments_rmId_fkey` FOREIGN KEY (`rmId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `rm_assignments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rm_assignments`
--

LOCK TABLES `rm_assignments` WRITE;
/*!40000 ALTER TABLE `rm_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `rm_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES ('2e1fa81c-0643-48d2-9d31-a82bed02427d','showFloatingReel','true','2026-04-27 12:29:29.187','2026-04-27 12:29:29.187'),('2e81ec88-3bbc-4fe6-bedd-8fcbd2343cfe','floatingReelVideo','https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-view-28771-large.mp4','2026-04-27 12:29:29.194','2026-04-27 12:29:29.194'),('42ca158c-fb3e-40eb-bef8-33bb20e51281','siteSlogan','Collective Intelligence for Real Estate','2026-04-27 12:29:29.160','2026-04-27 12:29:29.160'),('7c13252d-33af-4bd6-8d4d-142fa1d81bbf','floatingReelDesc','See how to save 25L+ today.','2026-04-27 12:29:29.215','2026-04-27 12:29:29.215'),('b464fadb-2d97-4743-8de5-056c5268ca65','floatingReelTitle','Exclusive Group Buying Offer!','2026-04-27 12:29:29.205','2026-04-27 12:29:29.205'),('bdbcd484-bc84-4a30-8a41-d9446799a7ba','primaryColor','#D34D2E','2026-04-27 12:29:29.175','2026-04-27 12:29:29.175'),('c036ec39-3c45-4c18-a027-2c95eb164c8c','siteTitle','Together Buying','2026-04-27 12:29:29.151','2026-04-27 12:29:29.151');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('ACTIVE','EXPIRED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `startDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endDate` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `subscriptions_userId_idx` (`userId`),
  CONSTRAINT `subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES ('08d44e8b-62a8-46ab-9e06-29d968078dd1','31d6f853-5653-424d-a53d-b0c2281bcac4','Premium',2999.00,'ACTIVE','2026-04-27 11:54:06.882','2026-07-26 11:54:06.879','2026-04-27 11:54:06.882','2026-04-27 11:54:06.882');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonials` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL DEFAULT '5',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `testimonials_userId_fkey` (`userId`),
  CONSTRAINT `testimonials_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES ('ec370ed4-5680-4804-97e2-8c58b24da47f','Rahul Sharma','Software Engineer','The group buying process was seamless. I saved ₹15 Lakhs on my first home!',5,1,NULL,NULL,'2026-04-27 12:29:29.112','2026-04-27 12:29:29.112','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200');
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('BUYER','ADMIN','RM') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BUYER',
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `internalNotes` text COLLATE utf8mb4_unicode_ci,
  `lastContacted` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('31d6f853-5653-424d-a53d-b0c2281bcac4','admin@realtogather.com',NULL,NULL,'ADMIN',1,1,NULL,NULL,NULL,NULL,NULL,'2026-04-27 11:34:34.372','2026-04-27 12:29:29.131'),('ef759917-ebeb-4f5e-bfc2-e164a9e649ec','a@gmail.com',NULL,NULL,'BUYER',1,1,NULL,NULL,NULL,NULL,NULL,'2026-04-27 12:41:41.057','2026-04-27 12:41:47.992');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlists_userId_propertyId_key` (`userId`,`propertyId`),
  KEY `wishlists_propertyId_fkey` (`propertyId`),
  CONSTRAINT `wishlists_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `wishlists_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES ('49534b84-7f71-42ed-9b7e-6ee6b339e78c','ef759917-ebeb-4f5e-bfc2-e164a9e649ec','375fce77-04fa-421e-9c1d-4daf5cead647','2026-04-27 12:55:14.277');
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-17 20:58:52
