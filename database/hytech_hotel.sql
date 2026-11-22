-- =====================================================================
-- Hytech Hotel & Bistro - Database Schema & Initial Data
-- Designed for XAMPP phpMyAdmin (MySQL / MariaDB)
-- Location: Bongabong, Oriental Mindoro
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `hytech_hotel` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hytech_hotel`;

-- ---------------------------------------------------------------------
-- 1. Table: rooms
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(100) UNIQUE NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `capacity` INT NOT NULL,
  `inventory` INT NOT NULL DEFAULT 1,
  `bed_type` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `amenities` TEXT,
  `image_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `rooms` (`id`, `code`, `name`, `type`, `price`, `capacity`, `inventory`, `bed_type`, `description`, `amenities`, `image_url`) VALUES
(1, 'economy-fan', 'Economy Fan Room', 'Standard', 800.00, 2, 3, '1 Double Bed', 'A budget-friendly room with electric fan, private bathroom, and free Wi-Fi. Simple, clean, and good for a short overnight stay.', 'Electric Fan, Private Bathroom, Free Wi-Fi, Fresh Linens, Work Desk', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'),
(2, 'solo-room', 'Solo Room', 'Solo', 1000.00, 1, 4, '1 Single Bed', 'Perfect for solo travelers looking for a comfortable and affordable stay with aircon and a quiet atmosphere.', 'Air Conditioning, Single Bed, High-speed Wi-Fi, Hot & Cold Shower, Reading Lamp', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'),
(3, 'standard-room', 'Standard Room', 'Standard', 1200.00, 2, 5, '1 Queen Bed', 'A cozy and clean room with aircon, private bathroom, free Wi-Fi, and flat screen TV. Perfect for solo or couples.', 'Air Conditioning, 1 Queen Bed, 32" Smart TV, Hot & Cold Shower, Electric Kettle', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'),
(4, 'deluxe-queen', 'Deluxe Queen Room', 'Deluxe', 1600.00, 2, 4, '1 Queen Bed + Balcony', 'Spacious deluxe room featuring scenic town and mountain views, luxury bedding, and a private balcony.', 'Balcony, Split-type Aircon, Smart TV with Netflix, Mini Fridge, Rainfall Shower', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'),
(5, 'deluxe-twin', 'Deluxe Twin Room', 'Deluxe', 1800.00, 2, 3, '2 Single Beds', 'Thoughtfully designed for friends or travel buddies seeking spacious convenience with premium amenities.', '2 Single Beds, Air Conditioning, Private Bath, Coffee Bar, High-speed Wi-Fi', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'),
(6, 'family-suite', 'Family Suite', 'Family', 2500.00, 4, 3, '1 Queen + 2 Single Beds', 'Ideal retreat for families. Features two partitioned sleeping areas, child-safe amenities, and dining space.', '2 Sleeping Areas, Dining Table, Smart TV, Refrigerator, Extra Pillows & Towels', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'),
(7, 'barkada-group', 'Barkada Group Room', 'Group', 3200.00, 6, 2, '3 Bunk Beds (Sleeps 6)', 'Built for groups, students, and teams traveling to Oriental Mindoro. High capacity with multiple lockers.', 'Individual Lockers, Power Outlets per Bed, 2 Bathrooms, High-speed Wi-Fi, Aircon', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'),
(8, 'executive-suite', 'Executive Bistro Suite', 'Suite', 3800.00, 2, 2, '1 King Bed + Lounge', 'Our premier suite featuring dedicated lounge area, complimentary bistro breakfast, and VIP keyless entry.', 'King Bed, Living Lounge, Free Breakfast Pass, Coffee Machine, Bathtub, City View', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80');

-- ---------------------------------------------------------------------
-- 2. Table: extras
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `extras`;
CREATE TABLE `extras` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `billing_unit` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `extras` (`id`, `name`, `price`, `billing_unit`, `description`, `is_available`) VALUES
(1, 'Massage Relaxation', 300.00, 'per person / stay', '60 / 90 Minutes Unwind from your travels with our classic full-body massage. Using long, flowing strokes and gentle-to-medium pressure, this treatment eases surface tension, improves circulation, and leaves you in a state of deep calm.', 1),
(2, 'Airport / Port Shuttle', 450.00, 'per stay', 'Convenient door-to-door transport service from Calapan Port or Roxas Port directly to Hytech Hotel & Bistro.', 1),
(3, 'Extra Bed & Soft Pillow', 350.00, 'per night', 'High-density comfortable single foam mattress setup with premium duvet and fresh hypoallergenic pillow.', 1),
(4, 'Late Check-out Privilege (until 3:00 PM)', 250.00, 'per room', 'Relax at your own pace with extended check-out hours until 3:00 PM upon availability.', 1);

-- ---------------------------------------------------------------------
-- 3. Table: vouchers
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `vouchers`;
CREATE TABLE `vouchers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(100) UNIQUE NOT NULL,
  `discount_type` VARCHAR(20) NOT NULL, -- 'percent' or 'fixed'
  `discount_value` DECIMAL(10,2) NOT NULL,
  `valid_until` VARCHAR(50) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active', 'Paused'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `vouchers` (`id`, `code`, `discount_type`, `discount_value`, `valid_until`, `status`) VALUES
(1, 'MINSU', 'percent', 99.00, NULL, 'Active'),
(2, 'SUMMER0123', 'percent', 30.00, '2027-10-11', 'Active'),
(3, 'CODE123', 'fixed', 35.00, '2026-12-06', 'Active'),
(4, 'HYTECHWELCOME', 'percent', 15.00, '2027-12-31', 'Active');

-- ---------------------------------------------------------------------
-- 4. Table: keys
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `keys`;
CREATE TABLE `keys` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key_name` VARCHAR(100) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Available', -- 'Available', 'Assigned', 'Lost / damaged'
  `room_number` VARCHAR(50) DEFAULT NULL,
  `assigned_guest` VARCHAR(191) DEFAULT NULL,
  `booking_id` VARCHAR(100) DEFAULT NULL,
  `notes` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `keys` (`id`, `key_name`, `status`, `room_number`, `assigned_guest`, `booking_id`, `notes`) VALUES
(1, 'Key 1', 'Assigned', 'Room 101', 'Marvin Digman', 'RES-8245281', 'Physical brass room key + magnetic power card'),
(2, 'Key 2', 'Available', 'Room 102', NULL, NULL, 'RFID Smart Card'),
(3, 'Key 3', 'Available', 'Room 103', NULL, NULL, 'RFID Smart Card'),
(4, 'Key 4', 'Available', 'Room 104', NULL, NULL, 'Physical key'),
(5, 'Key 5', 'Lost / damaged', 'Room 201', NULL, NULL, 'Reported lost Oct 2026, replacement ordered');

-- ---------------------------------------------------------------------
-- 5. Table: food_items
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `food_items`;
CREATE TABLE `food_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `category` VARCHAR(50) NOT NULL, -- 'Breakfast', 'Seafood', 'Coffee', 'Drinks', 'Main'
  `price` DECIMAL(10,2) NOT NULL,
  `price_unit` VARCHAR(50) NOT NULL DEFAULT '',
  `description` TEXT,
  `image_url` TEXT,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `food_items` (`id`, `name`, `category`, `price`, `price_unit`, `description`, `image_url`, `is_available`) VALUES
(1, 'Filipino Buffet Breakfast', 'Breakfast', 350.00, '/ head', 'Traditional garlic rice, eggs, local longganisa, savory cured beef tapa, and seasonal fresh fruits.', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', 1),
(2, 'Fresh Seafood Platter', 'Seafood', 850.00, '/ platter', 'Freshly caught Mindoro crabs, buttered garlic prawns, grilled squid, and native dipping sauces.', 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=800&q=80', 1),
(3, 'Artisanal Coffee & Pastries', 'Coffee', 180.00, '+', 'Single origin brewed coffee paired with fresh oven-baked warm butter croissants or local bibingka.', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', 1),
(4, 'Sunset Mojito', 'Drinks', 240.00, '/ glass', 'Refreshing mint leaves, fresh calamansi lime, brown sugar, premium rum, and sparkling soda over crushed ice.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', 1),
(5, 'Tapsilog Morning Set', 'Breakfast', 180.00, '/ set', 'Marinated tender beef sirloin tapa, golden garlic fried rice, sunny-side egg, and pickled atchara.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', 1),
(6, 'Crispy Calamari Basket', 'Seafood', 320.00, '/ basket', 'Tender squid rings fried to golden crispiness served with bistro garlic aioli and sweet chili dip.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80', 1);

-- ---------------------------------------------------------------------
-- 6. Table: food_orders
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `food_orders`;
CREATE TABLE `food_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(100) UNIQUE NOT NULL,
  `guest_name` VARCHAR(191) NOT NULL,
  `guest_phone` VARCHAR(50) NOT NULL,
  `items_json` LONGTEXT NOT NULL,
  `special_request` TEXT,
  `deliver_to` VARCHAR(100) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Preparing', -- 'Preparing', 'Served', 'Completed', 'Cancelled'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `food_orders` (`id`, `order_id`, `guest_name`, `guest_phone`, `items_json`, `special_request`, `deliver_to`, `total_amount`, `status`) VALUES
(1, 'ORD-0185185', 'Guest Hotel', '091319505863', '[{"name":"Sunset Mojito","quantity":2,"price":240,"image_url":"https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80"}]', '', 'Table 3', 480.00, 'Preparing'),
(2, 'ORD-9485137', 'Guest Hotel', '09378836261', '[{"name":"Tapsilog Morning Set","quantity":5,"price":180,"image_url":"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"}]', 'EXTRA RICE', 'TABLE 2', 900.00, 'Served');

-- ---------------------------------------------------------------------
-- 7. Table: bookings
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reference_id` VARCHAR(100) UNIQUE NOT NULL,
  `guest_name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `room_id` INT DEFAULT NULL,
  `room_name` VARCHAR(191) NOT NULL,
  `room_number` VARCHAR(100) DEFAULT 'Assigned once confirmed',
  `guest_count` INT NOT NULL DEFAULT 1,
  `check_in` VARCHAR(50) NOT NULL,
  `check_out` VARCHAR(50) NOT NULL,
  `nights` INT NOT NULL DEFAULT 1,
  `room_charges` DECIMAL(10,2) NOT NULL,
  `discount_code` VARCHAR(100) DEFAULT NULL,
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00,
  `companions_json` LONGTEXT,
  `extras_json` LONGTEXT,
  `extras_amount` DECIMAL(10,2) DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL, -- 'GCash', 'Cash'
  `payment_reference` VARCHAR(100) DEFAULT NULL,
  `payment_status` VARCHAR(50) NOT NULL DEFAULT 'Unpaid', -- 'Unpaid', 'Paid'
  `special_requests` TEXT,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Checked in', 'Checked out', 'Cancelled'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bookings` (`id`, `reference_id`, `guest_name`, `email`, `phone`, `room_id`, `room_name`, `room_number`, `guest_count`, `check_in`, `check_out`, `nights`, `room_charges`, `discount_code`, `discount_amount`, `extras_json`, `extras_amount`, `total_amount`, `payment_method`, `payment_reference`, `payment_status`, `special_requests`, `status`) VALUES
(1, 'RES-8245281', 'Marvin Digman', 'guesthotel968@gmail.com', '09319505863', 1, 'Economy Fan Room', 'Room 101', 2, '2026-11-17', '2026-11-18', 1, 800.00, NULL, 0.00, '[]', 0.00, 800.00, 'GCash', '112233445566', 'Paid', 'Early morning check-in', 'Confirmed'),
(2, 'RES-E6F42079C1FF43', 'Carl Faa', 'guesthotel968@gmail.com', '09141278921', 2, 'Solo Room', 'Room 102', 1, '2026-11-18', '2026-11-19', 1, 1000.00, 'MINSU', 990.00, '[{"name":"Massage Relaxation","price":300}]', 300.00, 310.00, 'GCash', '224466880011', 'Unpaid', 'Please prepare quiet room facing garden', 'Pending');

-- ---------------------------------------------------------------------
-- 8. Table: reviews
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_reference` VARCHAR(100) DEFAULT NULL,
  `guest_name` VARCHAR(191) NOT NULL,
  `room_name` VARCHAR(191) DEFAULT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `reviews` (`id`, `booking_reference`, `guest_name`, `room_name`, `rating`, `comment`) VALUES
(1, 'RES-8245281', 'Marvin Digman', 'Economy Fan Room', 5, 'Super clean rooms and very accommodating staff! The bistro breakfast was delicious and affordable. Will definitely come back when visiting Bongabong!'),
(2, 'RES-SAMPLE01', 'Elena Soriano', 'Standard Room', 5, 'Exceptional hospitality! Location is great, Wi-Fi is fast, and check-in via GCash was seamless.');

-- ---------------------------------------------------------------------
-- 9. Table: clients
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) UNIQUE NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `clients` (`id`, `name`, `email`, `phone`) VALUES
(1, 'Marvin Digman', 'guesthotel968@gmail.com', '09319505863'),
(2, 'Carl Faa', 'carlfaa@hytech.ph', '09141278921');
