import { pool } from '../config/db.js';

export async function initDatabase() {
  try {
    // 1. Create pricing table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pricing (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        priceNum INT NOT NULL,
        pricePerSqFt VARCHAR(50) NOT NULL,
        badge VARCHAR(100),
        \`desc\` TEXT,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Pricing table initialized.');

    // 2. Create inquiries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        serviceType VARCHAR(100),
        plotSize VARCHAR(50),
        floors INT DEFAULT 1,
        packageType VARCHAR(50),
        estimatedCost VARCHAR(100),
        location VARCHAR(150),
        message TEXT,
        status VARCHAR(20) DEFAULT 'New',
        adminNotes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Inquiries table initialized.');

    // 3. Seed pricing table if empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM pricing');
    if (rows[0].count === 0) {
      console.log('Seeding default pricing details into database...');
      const defaultPricing = [
        [
          'basic',
          'Basic Package',
          1750,
          '₹1,750 / sq.ft',
          'Economical Solution',
          'An affordable solution designed for quality residential construction with dependable materials and essential finishes.'
        ],
        [
          'premium',
          'Premium Package',
          2150,
          '₹2,150 / sq.ft',
          'Most Popular',
          'Ideal for homeowners seeking enhanced finishes, premium materials, custom elevation designs, and additional customization.'
        ],
        [
          'luxury',
          'Luxury Package',
          2750,
          '₹2,750 / sq.ft',
          'Ultra High-End',
          'Designed for premium residences featuring superior materials, elegant interiors, modern architecture, and luxury finishes.'
        ]
      ];

      for (const p of defaultPricing) {
        await pool.query(
          'INSERT INTO pricing (id, name, priceNum, pricePerSqFt, badge, \`desc\`) VALUES (?, ?, ?, ?, ?, ?)',
          p
        );
      }
      console.log('Default pricing seeded successfully.');
    }
  } catch (err) {
    console.error('Error during database table initialization:', err);
  }
}
