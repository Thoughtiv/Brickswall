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

    // 3. Create projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        categoryLabel VARCHAR(100) NOT NULL,
        location VARCHAR(150) NOT NULL,
        size VARCHAR(50) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        image TEXT NOT NULL,
        description TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Projects table initialized.');

    // 4. Create testimonials table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        location VARCHAR(150) NOT NULL,
        role VARCHAR(100) NOT NULL,
        quote TEXT NOT NULL,
        avatar TEXT NOT NULL,
        rating INT DEFAULT 5,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Testimonials table initialized.');

    // 5. Create settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key_name VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    console.log('Settings table initialized.');

    // 6. Seed pricing table if empty
    const [rowsPricing] = await pool.query('SELECT COUNT(*) as count FROM pricing');
    if (rowsPricing[0].count === 0) {
      console.log('Seeding default pricing details...');
      const defaultPricing = [
        ['basic', 'Basic Package', 1750, '₹1,750 / sq.ft', 'Economical Solution', 'An affordable solution designed for quality residential construction with dependable materials and essential finishes.'],
        ['premium', 'Premium Package', 2150, '₹2,150 / sq.ft', 'Most Popular', 'Ideal for homeowners seeking enhanced finishes, premium materials, custom elevation designs, and additional customization.'],
        ['luxury', 'Luxury Package', 2750, '₹2,750 / sq.ft', 'Ultra High-End', 'Designed for premium residences featuring superior materials, elegant interiors, modern architecture, and luxury finishes.']
      ];
      for (const p of defaultPricing) {
        await pool.query('INSERT INTO pricing (id, name, priceNum, pricePerSqFt, badge, \`desc\`) VALUES (?, ?, ?, ?, ?, ?)', p);
      }
    }

    // 7. Seed projects table if empty
    const [rowsProjects] = await pool.query('SELECT COUNT(*) as count FROM projects');
    if (rowsProjects[0].count === 0) {
      console.log('Seeding default projects...');
      const defaultProjects = [
        ['The Crest Luxury Villa', 'villa', 'Luxury Villa', 'Jubilee Hills, Hyderabad', '5,500 sq.ft', '11 Months', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', 'A modern 3-story ultra-luxury villa featuring Italian marble flooring, floating staircase, private courtyard pool, and smart home automation.'],
        ['Gachibowli Horizon Residency', 'homes', 'Independent Home', 'Gachibowli, Hyderabad', '3,800 sq.ft', '9 Months', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80', 'Contemporary G+2 independent duplex home with spacious balconies, rooftop solar installation, and premium teak wood joinery.'],
        ['Aura Commercial Center', 'commercial', 'Commercial Building', 'Madhapur, Hyderabad', '12,000 sq.ft', '14 Months', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', 'Commercial 5-floor office building with modern glass curtain walls, double basement parking, and high-speed elevators.'],
        ['Greenwood Academy Infrastructure', 'school', 'Educational Institution', 'Kukatpally, Hyderabad', '18,500 sq.ft', '15 Months', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80', 'Spacious, fire-safe educational campus building featuring 24 classrooms, science laboratories, and indoor sports hall.'],
        ['Tellapur Modern Duplex', 'homes', 'Independent Home', 'Tellapur, Hyderabad', '4,200 sq.ft', '10 Months', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', 'Contemporary architectural design duplex home built with premium Grade 53 cement and heat-insulating clay brick cladding.'],
        ['Banjara Hills Villa Renovation', 'renovation', 'Renovation & Remodeling', 'Banjara Hills, Hyderabad', '3,100 sq.ft', '4 Months', 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80', 'Total structural renovation and elevation upgrade of a 20-year-old property into a modern open-concept contemporary home.'],
        ['Kondapur Heights Commercial Complex', 'commercial', 'Commercial Complex', 'Kondapur, Hyderabad', '15,000 sq.ft', '16 Months', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80', 'Retail & office mixed-use commercial structure engineered for heavy footfalls and energy efficiency.'],
        ['Manikonda Luxury Residence', 'villa', 'Luxury Villa', 'Manikonda, Hyderabad', '4,800 sq.ft', '11 Months', 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80', 'Custom triplex villa with private elevator, home theater, landscaped terrace garden, and designer lighting.']
      ];
      for (const p of defaultProjects) {
        await pool.query('INSERT INTO projects (title, category, categoryLabel, location, size, duration, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', p);
      }
    }

    // 8. Seed testimonials table if empty
    const [rowsTestimonials] = await pool.query('SELECT COUNT(*) as count FROM testimonials');
    if (rowsTestimonials[0].count === 0) {
      console.log('Seeding default testimonials...');
      const defaultTestimonials = [
        ['Ramesh Reddy', 'Jubilee Hills, Hyderabad', 'Villa Owner', 'Bricks Wall delivered our 5,000 sq.ft villa in Jubilee Hills on time with unbelievable material quality. Their transparent daily progress reports gave us peace of mind.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 5],
        ['Srinivas Rao', 'Gachibowli, Hyderabad', 'Commercial Developer', 'We hired Bricks Wall for our commercial complex in Gachibowli. Their engineering team is top-notch, keeping every item within transparent budget bounds.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 5],
        ['Dr. Priya Sharma', 'Kondapur, Hyderabad', 'Homeowner', 'From site visit to final handover, the 6-step construction process was smooth. No hidden charges! Highly recommended construction company in Hyderabad.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', 5]
      ];
      for (const t of defaultTestimonials) {
        await pool.query('INSERT INTO testimonials (name, location, role, quote, avatar, rating) VALUES (?, ?, ?, ?, ?, ?)', t);
      }
    }

    // 9. Seed settings table if empty
    const [rowsSettings] = await pool.query('SELECT COUNT(*) as count FROM settings');
    if (rowsSettings[0].count === 0) {
      console.log('Seeding default settings...');
      const defaultSettings = [
        ['phone_primary', '+91 9949249091'],
        ['phone_secondary', '+91 9160202008'],
        ['whatsapp', '+91 9160202008'],
        ['email', 'Hello@brickswall.in'],
        ['address', 'Hyderabad & Surrounding Areas, Telangana'],
        ['office_hours', 'Mon - Sat: 9:00 AM - 6:30 PM']
      ];
      for (const s of defaultSettings) {
        await pool.query('INSERT INTO settings (key_name, value) VALUES (?, ?)', s);
      }
    }

    console.log('Database initialization completed.');
  } catch (err) {
    console.error('Error during database table initialization:', err);
  }
}
