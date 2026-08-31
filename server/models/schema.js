import { pool } from '../config/db.js';

/**
 * Runs one initialization step in isolation.
 *
 * Each step is independent, so a statement that fails on one host (an unsupported
 * quoting mode, a pre-existing table, a permissions gap) can no longer abort the
 * whole routine and silently skip every migration that follows it.
 */
async function step(label, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`Database init step failed [${label}]:`, err.message);
  }
}

export async function initDatabase() {
  await step('Create pricing table', async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pricing (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        priceNum INT NOT NULL,
        pricePerSqFt VARCHAR(50) NOT NULL,
        badge VARCHAR(100),
        \`desc\` TEXT,
        warranty VARCHAR(255),
        servicesHeading VARCHAR(150),
        services TEXT,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ensure columns exist for upgraded schemas
    try {
      const [cols] = await pool.query('SHOW COLUMNS FROM pricing');
      const colNames = cols.map(c => c.Field);
      if (!colNames.includes('warranty')) {
        await pool.query('ALTER TABLE pricing ADD COLUMN warranty VARCHAR(255)');
      }
      if (!colNames.includes('servicesHeading')) {
        await pool.query('ALTER TABLE pricing ADD COLUMN servicesHeading VARCHAR(150)');
      }
      if (!colNames.includes('services')) {
        await pool.query('ALTER TABLE pricing ADD COLUMN services TEXT');
      }
    } catch (colErr) {
      console.warn('Pricing column check warning:', colErr.message);
    }
    console.log('Pricing table initialized.');
  });

  await step('Create inquiries table', async () => {
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
  });

  await step('Create projects table', async () => {
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
  });

  await step('Create testimonials table', async () => {
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
  });

  await step('Create settings table', async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key_name VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    console.log('Settings table initialized.');
  });

  await step('Create blogs table', async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date VARCHAR(100) NOT NULL,
        readTime VARCHAR(50) NOT NULL,
        image TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        author VARCHAR(100) DEFAULT 'Bricks Wall Editorial',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Blogs table initialized.');
  });

  await step('Create editor users table (quotation editor logins created by admin)', async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS editor_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastLoginAt DATETIME NULL
      )
    `);
    console.log('Editor users table initialized.');
  });

  await step('Create editor sessions table (opaque login tokens, revocable by admin)', async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS editor_sessions (
        token VARCHAR(128) PRIMARY KEY,
        user_id INT NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_editor_sessions_user (user_id)
      )
    `);
    console.log('Editor sessions table initialized.');
  });

  await step('Create editor quotations table (records basic info when an editor generates a quotation)', async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS editor_quotations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quote_number VARCHAR(100) NOT NULL,
        editor_user_id INT,
        editor_username VARCHAR(50),
        editor_name VARCHAR(150),
        client_name VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50),
        client_email VARCHAR(255),
        site_location VARCHAR(255),
        package_name VARCHAR(100),
        total_area DECIMAL(10,2) DEFAULT 0,
        quoted_rate DECIMAL(10,2) DEFAULT 0,
        grand_total DECIMAL(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_eq_editor_user (editor_user_id)
      )
    `);
    console.log('Editor quotations table initialized.');
  });

  await step('Seed pricing table if empty', async () => {
    const [rowsPricing] = await pool.query('SELECT COUNT(*) as count FROM pricing');
    if (rowsPricing[0].count === 0) {
      console.log('Seeding default pricing details...');
      const defaultPricing = [
        [
          'basic',
          'Basic Package',
          1750,
          '₹1,750 / sq.ft',
          'Economical Solution',
          'An affordable solution designed for quality residential construction with dependable materials and essential finishes.',
          '5 Years Structural Warranty',
          'Included Services & Warranty',
          JSON.stringify([
            'Structural & Architectural Layout',
            'Standard Electrical & Plumbing',
            'Site Supervision',
            'Basic Sanitary Ware (Cera / Parryware)'
          ])
        ],
        [
          'premium',
          'Premium Package',
          2150,
          '₹2,150 / sq.ft',
          'Most Popular',
          'Ideal for homeowners seeking enhanced finishes, premium materials, custom elevation designs, and additional customization.',
          '10 Years Structural Warranty',
          'Included Services & Warranty',
          JSON.stringify([
            '3D Elevation & Floor Plan Design',
            'Concealed Modular Electricals (Havells)',
            'Dedicated Project Manager',
            'Premium Sanitary Ware (Kohler / Jaquar)',
            'Underground Sump & Overhead Tank'
          ])
        ],
        [
          'luxury',
          'Luxury Package',
          2750,
          '₹2,750 / sq.ft',
          'Ultra High-End',
          'Designed for premium residences featuring superior materials, elegant interiors, modern architecture, and luxury finishes.',
          '15 Years Structural Warranty',
          'Included Services & Warranty',
          JSON.stringify([
            'Full 3D Architectural VR Walkthroughs',
            'Automation Ready Smart Wiring',
            'Dedicated Senior Civil Engineer',
            'Luxury Sanitary Ware (Grohe / Hansgrohe)',
            'Landscaping & Rooftop Solar Prep'
          ])
        ]
      ];
      for (const p of defaultPricing) {
        await pool.query('INSERT INTO pricing (id, name, priceNum, pricePerSqFt, badge, `desc`, warranty, servicesHeading, services) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', p);
      }
    }
  });

  await step('Seed projects table if empty', async () => {
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
  });

  await step('Seed testimonials table if empty', async () => {
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
  });

  await step('Seed blogs table if empty', async () => {
    const [rowsBlogs] = await pool.query('SELECT COUNT(*) as count FROM blogs');
    if (rowsBlogs[0].count === 0) {
      console.log('Seeding default blogs...');
      const defaultBlogs = [
        [
          'Essential Tips for Residential Construction in Hyderabad (2026 Guide)',
          'Residential Construction',
          'August 5, 2026',
          '6 min read',
          'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
          'Planning to build your dream home in Hyderabad? Learn about soil testing, GHMC approvals, Grade 53 cement choices, and turnkey contractor selection.',
          'Building a independent house or villa in Hyderabad requires meticulous planning across architectural layout, Municipal (GHMC/HMDA) sanction permits, structural safety, and high-quality material sourcing.\n\n### 1. Soil Testing & Foundation Design\nBefore digging column footings, perform a professional soil bearing capacity (SBC) test. Hyderabad soil conditions vary from hard granite rock in Jubilee Hills to black cotton clay soil in Kondapur. Foundation design must be customized accordingly to avoid structural cracks.\n\n### 2. Choosing Cement & Steel Grades\nUse Grade 53 OPC cement for structural slabs and columns, and PPC cement for masonry plastering. For steel reinforcement, specify primary TMT bars like Tata Tiscon or Vizag Steel Fe550 grade for superior tensile strength.\n\n### 3. Turnkey Package Advantage\nPartnering with a turnkey construction firm like Bricks Wall locks in a fixed rate per sq.ft, protecting you against rising steel and sand costs while providing a single point of accountability.',
          'Bricks Wall Engineering Team'
        ],
        [
          'Understanding Turnkey Construction vs Labor Contracts',
          'Cost & Planning',
          'July 28, 2026',
          '5 min read',
          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
          'Compare turnkey house construction with item-rate labor contracts. Discover why fixed rate per sq.ft protects against material price inflation.',
          'When embarking on home construction, property owners usually evaluate two execution models: Item-rate Labor Contracts vs Turnkey Full Construction Packages.\n\n### Labor Contracts: The Hidden Pitfalls\nWith labor-only contracts, the homeowner bears full responsibility for purchasing cement, steel, bricks, electrical conduits, tiles, and plumbing fittings daily. Any delay in material delivery stops site work, while unexpected price surges in raw materials directly hit your wallet.\n\n### Turnkey Solution: Guaranteed Peace of Mind\nIn turnkey construction, the contractor manages end-to-end design, material procurement, site supervision, and regulatory compliance at a pre-agreed fixed price per built-up square foot.',
          'Garvit Reddy, Lead Estimator'
        ],
        [
          'Why Structural Warranty Matters: 10 vs 15 Year Protections',
          'Quality Assurance',
          'July 14, 2026',
          '4 min read',
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
          'Discover what structural warranties cover in modern RCC framed buildings, from foundation settling to slab waterproofing.',
          'A reliable structural warranty is the true benchmark of building quality. Structural components including RCC columns, footings, plinth beams, roof slabs, and load-bearing walls form the backbone of your home.\n\n### What Does a 10 to 15-Year Warranty Cover?\n- Protection against concrete slab honeycombing or spalling\n- Resistance against foundation settlement and shear cracks\n- Multi-layer slab waterproofing against moisture ingress\n\nBricks Wall provides up to 15 Years Written Structural Warranty across all our Premium and Luxury packages.',
          'Bricks Wall QA Division'
        ]
      ];
      for (const b of defaultBlogs) {
        await pool.query(
          'INSERT INTO blogs (title, category, date, readTime, image, excerpt, content, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          b
        );
      }
    }
  });

  await step('Seed settings table if empty', async () => {
    const [rowsSettings] = await pool.query('SELECT COUNT(*) as count FROM settings');
    const defaultSettings = [
      ['phone_primary', '+91 9949249091'],
      ['phone_secondary', '+91 9160202008'],
      ['whatsapp', '+91 9160202008'],
      ['email', 'Hello@brickswall.in'],
      ['address', 'Lakshmi Narsimha Colony, Road No.12, Dattatreya Nivas, No.591, Nagole, Hyderabad, Telangana, Bharath (India)'],
      ['office_hours', 'Mon - Sat: 9:00 AM - 6:30 PM'],
      ['show_projects', 'false']
    ];

    if (rowsSettings[0].count === 0) {
      console.log('Seeding default settings...');
      for (const s of defaultSettings) {
        await pool.query('INSERT INTO settings (key_name, value) VALUES (?, ?)', s);
      }
    }
  });

  await step('Seed default package matrix in settings if not present', async () => {
    const [matrixCheck] = await pool.query('SELECT * FROM settings WHERE key_name = ?', ['package_matrix']);
    if (matrixCheck.length === 0) {
      console.log('Seeding default package comparison matrix...');
      const defaultMatrix = [
        { id: '1', feature: 'Price per Built-up Sq.Ft', basic: '₹1,850 / sq.ft', premium: '₹2,150 / sq.ft', luxury: '₹2,750 / sq.ft' },
        { id: '2', feature: 'Structural Warranty', basic: '5 Years', premium: '10 Years', luxury: '15 Years' },
        { id: '3', feature: 'Cement Grade', basic: '53 Grade ACC / Ultratech', premium: 'Ultratech Super / Coromandel', luxury: 'Ultratech Premium High-Grade' },
        { id: '4', feature: 'Steel Quality', basic: 'Simhadri / Vizag TMT Fe500', premium: 'Tata Tiscon / JSW Fe550', luxury: 'Tata Tiscon Super Ductile Fe550D' },
        { id: '5', feature: 'Flooring Tiles Rate', basic: 'Up to ₹60 / sq.ft', premium: 'Up to ₹100 / sq.ft', luxury: 'Italian Marble / Granite (₹250+)' },
        { id: '6', feature: 'Main Door', basic: 'Flush Door with Wood Frame', premium: 'Teak Wood Door & Frame', luxury: 'Teak Wood with Smart Digital Lock' },
        { id: '7', feature: '3D Architectural Elevation', basic: 'Basic 2D Floor Plan', premium: '3D Elevation', luxury: 'Full VR 3D Walkthrough' },
        { id: '8', feature: 'Site Supervision', basic: 'Periodic Engineer Visits', premium: 'Dedicated Site Manager', luxury: 'Senior Resident Civil Engineer' },
        { id: '9', feature: 'Sanitary Fittings', basic: 'Cera / Parryware', premium: 'Kohler / Jaquar', luxury: 'Grohe / Hansgrohe Premium' },
        { id: '10', feature: 'Customization Level', basic: 'Standard Options', premium: 'High Customization', luxury: 'Complete Bespoke Architecture' }
      ];
      await pool.query('INSERT INTO settings (key_name, value) VALUES (?, ?)', ['package_matrix', JSON.stringify(defaultMatrix)]);
    }
  });

  console.log('Database initialization completed.');
}
