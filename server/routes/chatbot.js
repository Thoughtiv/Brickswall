import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const userMessage = messages[messages.length - 1]?.content || '';
  const groqApiKey = process.env.GROQ_API_KEY;

  try {
    // 1. Fetch dynamic pricing from database
    let pricingContext = '';
    let pricingRows = [];
    try {
      const [rows] = await pool.query('SELECT * FROM pricing');
      pricingRows = rows;
      pricingContext = rows.map(r => `- ${r.name}: ${r.pricePerSqFt} (${r.desc})`).join('\n');
    } catch (dbErr) {
      console.warn('Chatbot failed to query pricing database, using defaults:', dbErr.message);
      pricingContext = '- Standard Package: ₹1,750 / sq.ft (Economical & Durable)\n- Enhanced Package: ₹2,150 / sq.ft (Most Popular Choice)\n- Signature Package: ₹2,750 / sq.ft (High-End Bespoke)';
    }

    // 2. Fetch settings from database
    let settingsContext = '';
    let settingsObj = {
      phone_primary: '+91 9949249091',
      phone_secondary: '+91 9160202008',
      whatsapp: '+91 9160202008',
      email: 'Hello@brickswall.in',
      address: 'Hyderabad & Surrounding Areas, Telangana',
      office_hours: 'Mon - Sat: 9:00 AM - 6:30 PM'
    };
    try {
      const [rows] = await pool.query('SELECT * FROM settings');
      rows.forEach(row => {
        settingsObj[row.key_name] = row.value;
      });
      settingsContext = Object.entries(settingsObj).map(([key, val]) => `- ${key}: ${val}`).join('\n');
    } catch (dbErr) {
      console.warn('Chatbot failed to query settings database, using defaults:', dbErr.message);
      settingsContext = Object.entries(settingsObj).map(([key, val]) => `- ${key}: ${val}`).join('\n');
    }

    // 3. Fetch projects from database
    let projectsContext = '';
    let projectsCount = 0;
    try {
      const [rows] = await pool.query('SELECT * FROM projects ORDER BY id DESC');
      projectsCount = rows.length;
      projectsContext = rows.map(r => `- Title: ${r.title}, Category: ${r.categoryLabel}, Location: ${r.location}, Size: ${r.size}, Duration: ${r.duration}, Details: ${r.description}`).join('\n');
    } catch (dbErr) {
      console.warn('Chatbot failed to query projects database:', dbErr.message);
      projectsContext = '- Custom Duplex/Triplex Villas, Residential Independent Houses, Commercial Buildings, and Renovations across Gachibowli, Jubilee Hills, Madhapur, Kukatpally, Kondapur, and Tellapur.';
    }

    // 4. Fetch testimonials from database
    let testimonialsContext = '';
    try {
      const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY id DESC LIMIT 5');
      testimonialsContext = rows.map(r => `- Client: ${r.name}, Role: ${r.role}, Location: ${r.location}, Feedback: "${r.quote}", Rating: ${r.rating || 5}/5`).join('\n');
    } catch (dbErr) {
      console.warn('Chatbot failed to query testimonials database:', dbErr.message);
    }

    // 5. Build system prompt
    const systemPrompt = `You are a helpful, professional, and friendly customer support assistant for Bricks Wall, a trusted construction company in Hyderabad, India.
Your goal is to answer visitor questions about Bricks Wall based ONLY on the provided context.
If a visitor asks about something not related to Bricks Wall, its services, pricing, or construction, politely refuse to answer, explaining that you are a specialized assistant for Bricks Wall.

**Bricks Wall Core Info & Settings (Admin Configured):**
${settingsContext}
- Experience: 15+ years of building excellence in Hyderabad.
- Completed Projects count: ${projectsCount > 0 ? `${projectsCount}+ completed projects` : '50+ completed projects'}.

**Dynamic Construction Pricing Packages (Admin Configured):**
${pricingContext}

**Admin Configured Portfolio Projects:**
${projectsContext}

${testimonialsContext ? `**Client Testimonials:**\n${testimonialsContext}` : ''}

**CRITICAL FORMATTING RULES:**
1. Do NOT use markdown bold/italics markers anywhere in your response. Never output '**' or '*'. For example, write "Standard Package" instead of "**Standard Package**".
2. Do NOT use Markdown style headings (like #, ##, etc.). Use simple newlines and capitalizations for structure.
3. Keep answers concise, polite, and professional. Keep response under 3 sentences where possible.
4. Do NOT answer general knowledge, coding, or unrelated queries. If asked, politely say: 'I apologize, but I am only programmed to assist with questions regarding Bricks Wall construction services, pricing, and projects in Hyderabad. How can I help you with your construction query?'
5. Always encourage visitors to book a free consultation using our Instant Cost Calculator or by calling us at ${settingsObj.phone_primary}.`;

    // 6. Check for API key. If not present, run keyword-based fallback
    if (!groqApiKey || groqApiKey === 'YOUR_GROQ_API_KEY_HERE') {
      console.log('GROQ_API_KEY not configured. Running chatbot local fallback...');
      const lower = userMessage.toLowerCase();
      let reply = "Hello! I am the Bricks Wall AI Assistant. How can I help you with our construction services, pricing, or projects today?";

      if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost') || lower.includes('rate') || lower.includes('charge')) {
        if (pricingRows && pricingRows.length > 0) {
          reply = `We offer the following construction packages: \n` + 
            pricingRows.map((r, i) => `${i + 1}. ${r.name} at ${r.pricePerSqFt} (${r.desc})`).join('\n') + 
            `\nYou can use our Instant Cost Calculator on the page for a customized estimate!`;
        } else {
          reply = `We offer three construction packages: \n1. Standard Package at ₹1,750/sq.ft\n2. Enhanced Package at ₹2,150/sq.ft\n3. Signature Package at ₹2,750/sq.ft.\nYou can use our Instant Cost Calculator on the page for a customized estimate!`;
        }
      } else if (lower.includes('experience') || lower.includes('years') || lower.includes('old') || lower.includes('history')) {
        reply = `Bricks Wall has over 15 years of civil engineering and construction experience, having successfully delivered ${projectsCount > 0 ? projectsCount : '50'}+ projects in Hyderabad.`;
      } else if (lower.includes('location') || lower.includes('where') || lower.includes('address') || lower.includes('area') || lower.includes('hyderabad')) {
        reply = `We construct properties all across Hyderabad, including hubs like Jubilee Hills, Gachibowli, Madhapur, Kukatpally, Kondapur, and Tellapur. Our main office is located in ${settingsObj.address || 'Hyderabad'}.`;
      } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('number') || lower.includes('call')) {
        reply = `You can reach us directly by calling ${settingsObj.phone_primary} or emailing ${settingsObj.email}. We would love to discuss your project!`;
      } else if (lower.includes('service') || lower.includes('build') || lower.includes('construct') || lower.includes('villa') || lower.includes('renovat')) {
        reply = "We build independent houses, premium luxury villas, schools, commercial spaces, and handle renovations or turnkey interior designs.";
      } else if (lower.includes('warranty') || lower.includes('guarantee') || lower.includes('material')) {
        reply = "We offer a 10-year structural guarantee and use only premium certified brand materials like Ultratech cement and Tata Tiscon steel.";
      } else {
        reply = "Hello! I am the Bricks Wall AI Assistant. Let me know if you have any questions about our construction packages, completed projects, or services!";
      }

      return res.json({
        choices: [
          {
            message: {
              role: 'assistant',
              content: reply
            }
          }
        ]
      });
    }

    // 7. Send request to Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.2,
        max_tokens: 400
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    
    // Clean response of any formatting asterisks or markdown syntax
    if (data.choices?.[0]?.message?.content) {
      let content = data.choices[0].message.content;
      content = content.replace(/\*\*/g, ''); // Strip double asterisks
      content = content.replace(/\*/g, '');   // Strip single asterisks
      data.choices[0].message.content = content.trim();
    }

    return res.json(data);

  } catch (error) {
    console.error('Chatbot error:', error.message);
    return res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

export default router;
