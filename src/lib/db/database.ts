import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;
let tablesInitialized = false;

export function isMySQLConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
    (process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE)
  );
}

export function getMySQLPool(): mysql.Pool | null {
  if (!isMySQLConfigured()) {
    return null;
  }

  if (!pool) {
    if (process.env.DATABASE_URL) {
      pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });
    } else {
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });
    }
  }

  return pool;
}

export async function initializeDatabaseTables(): Promise<boolean> {
  const p = getMySQLPool();
  if (!p || tablesInitialized) return Boolean(p);

  try {
    const connection = await p.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(100) PRIMARY KEY,
          slug VARCHAR(191) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          price INT NOT NULL,
          original_price INT NOT NULL,
          rating FLOAT DEFAULT 5.0,
          reviews_count INT DEFAULT 0,
          image VARCHAR(500) NOT NULL,
          hover_image VARCHAR(500),
          description TEXT,
          category VARCHAR(100),
          in_stock BOOLEAN DEFAULT TRUE,
          features JSON,
          specifications JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS books (
          id VARCHAR(100) PRIMARY KEY,
          slug VARCHAR(191) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          description TEXT,
          author VARCHAR(255),
          price INT NOT NULL,
          ebook_price INT NOT NULL,
          cover_image VARCHAR(500),
          pdf_source_file VARCHAR(500),
          rating FLOAT DEFAULT 5.0,
          reviews_count INT DEFAULT 0,
          category VARCHAR(100),
          in_stock BOOLEAN DEFAULT TRUE,
          pages INT DEFAULT 100,
          language VARCHAR(50) DEFAULT 'Hindi & English',
          preview_pages JSON,
          key_takeaways JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS webinars (
          id VARCHAR(100) PRIMARY KEY,
          slug VARCHAR(191) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          description TEXT,
          speaker_name VARCHAR(255),
          speaker_title VARCHAR(255),
          speaker_image VARCHAR(500),
          date_time VARCHAR(255),
          duration VARCHAR(100),
          price INT DEFAULT 0,
          registration_url VARCHAR(500),
          status VARCHAR(50) DEFAULT 'upcoming',
          banner_image VARCHAR(500),
          agenda JSON,
          who_should_attend JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS webinar_reviews (
          id VARCHAR(100) PRIMARY KEY,
          webinar_id VARCHAR(100) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role_or_location VARCHAR(255),
          rating INT DEFAULT 5,
          comment TEXT,
          avatar VARCHAR(500),
          date VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_webinar_id (webinar_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS blogs (
          id VARCHAR(100) PRIMARY KEY,
          slug VARCHAR(191) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          excerpt TEXT,
          author VARCHAR(255),
          date VARCHAR(100),
          read_time VARCHAR(50),
          category VARCHAR(100),
          image VARCHAR(500),
          content TEXT,
          html_content LONGTEXT,
          related_product_slugs JSON,
          related_book_slugs JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
          order_id VARCHAR(100) PRIMARY KEY,
          payment_id VARCHAR(100),
          buyer_email VARCHAR(255),
          buyer_phone VARCHAR(50),
          product_id VARCHAR(100),
          amount INT DEFAULT 0,
          status VARCHAR(50) DEFAULT 'PAID',
          view_token TEXT,
          access_count INT DEFAULT 0,
          first_accessed_at VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_buyer_phone (buyer_phone)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Ensure orders table columns exist for unified e-commerce & webinar payments
      const orderColNames = ['item_type', 'item_title', 'customer_name', 'shipping_address', 'metadata'];
      for (const col of orderColNames) {
        try {
          const [check] = await connection.query(`SHOW COLUMNS FROM orders LIKE '${col}'`) as [any[], any];
          if (!check || check.length === 0) {
            let colDef = 'VARCHAR(255) NULL';
            if (col === 'item_type') colDef = "VARCHAR(50) DEFAULT 'product'";
            if (col === 'shipping_address') colDef = 'TEXT NULL';
            if (col === 'metadata') colDef = 'JSON NULL';
            await connection.query(`ALTER TABLE orders ADD COLUMN ${col} ${colDef}`);
          }
        } catch (colErr) {
          console.warn(`[database] Note on orders column ${col}:`, colErr);
        }
      }

      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          phone VARCHAR(50) NULL,
          name VARCHAR(255),
          email VARCHAR(255) NULL,
          password_hash VARCHAR(255) NULL,
          firebase_uid VARCHAR(128) NULL,
          provider VARCHAR(50) DEFAULT 'email',
          role VARCHAR(50) DEFAULT 'customer',
          avatar VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_email (email),
          INDEX idx_user_phone (phone),
          INDEX idx_user_firebase_uid (firebase_uid)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Gracefully ensure nullable phone and new columns for Firebase users
      try {
        await connection.query(`ALTER TABLE users MODIFY COLUMN phone VARCHAR(50) NULL`);
      } catch (e) {}
      try {
        await connection.query(`ALTER TABLE users DROP INDEX phone`);
      } catch (e) {}
      try {
        await connection.query(`ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(128) NULL`);
      } catch (e) {}
      try {
        await connection.query(`ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'email'`);
      } catch (e) {}
      try {
        await connection.query(`ALTER TABLE users ADD INDEX idx_user_email (email)`);
      } catch (e) {}
      try {
        await connection.query(`ALTER TABLE users ADD INDEX idx_user_firebase_uid (firebase_uid)`);
      } catch (e) {}

      await connection.query(`
        CREATE TABLE IF NOT EXISTS otps (
          id INT AUTO_INCREMENT PRIMARY KEY,
          phone VARCHAR(20) NOT NULL,
          otp_code VARCHAR(10) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_otp_phone_expires (phone, expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_addresses (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          alt_phone VARCHAR(20),
          street_address TEXT NOT NULL,
          landmark VARCHAR(255),
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100) NOT NULL,
          pincode VARCHAR(10) NOT NULL,
          is_default BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_address_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS courses (
          id VARCHAR(100) PRIMARY KEY,
          slug VARCHAR(191) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          description TEXT,
          category VARCHAR(100) DEFAULT 'Spiritual Wisdom',
          level VARCHAR(50) DEFAULT 'All Levels',
          instructor_name VARCHAR(255) DEFAULT 'Aacharya Ji',
          instructor_title VARCHAR(255) DEFAULT 'Vedic Master & Energy Guide',
          instructor_image VARCHAR(500),
          thumbnail VARCHAR(500) NOT NULL,
          trailer_video_url VARCHAR(500),
          price INT DEFAULT 0,
          original_price INT DEFAULT 0,
          rating FLOAT DEFAULT 5.0,
          reviews_count INT DEFAULT 0,
          total_duration VARCHAR(100) DEFAULT '10 Hours',
          total_lessons INT DEFAULT 12,
          language VARCHAR(50) DEFAULT 'Hindi & English',
          what_you_will_learn JSON,
          requirements JSON,
          certificate_enabled BOOLEAN DEFAULT TRUE,
          status VARCHAR(50) DEFAULT 'published',
          modules JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_course_enrollments (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          user_phone VARCHAR(20) NOT NULL,
          course_id VARCHAR(100) NOT NULL,
          order_id VARCHAR(100),
          progress_percentage INT DEFAULT 0,
          completed_lesson_ids JSON,
          last_lesson_id VARCHAR(100),
          enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP NULL,
          INDEX idx_user_phone (user_phone),
          INDEX idx_course_id (course_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      tablesInitialized = true;
      return true;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[MySQL] Table initialization error:', error);
    return false;
  }
}
