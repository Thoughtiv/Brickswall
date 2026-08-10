const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fallback pricing configuration in case the server is offline or not configured yet
export const DEFAULT_PRICING = {
  basic: {
    id: 'basic',
    name: 'Basic Package',
    pricePerSqFt: '₹1,750 / sq.ft',
    priceNum: 1750,
    badge: 'Economical Solution',
    desc: 'An affordable solution designed for quality residential construction with dependable materials and essential finishes.'
  },
  premium: {
    id: 'premium',
    name: 'Premium Package',
    pricePerSqFt: '₹2,150 / sq.ft',
    priceNum: 2150,
    badge: 'Most Popular',
    desc: 'Ideal for homeowners seeking enhanced finishes, premium materials, custom elevation designs, and additional customization.'
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury Package',
    pricePerSqFt: '₹2,750 / sq.ft',
    priceNum: 2750,
    badge: 'Ultra High-End',
    desc: 'Designed for premium residences featuring superior materials, elegant interiors, modern architecture, and luxury finishes.'
  }
};

/**
 * Fetch pricing from API. Falls back to DEFAULT_PRICING if offline.
 */
export async function getPricing() {
  try {
    const res = await fetch(`${API_BASE_URL}/pricing`);
    if (!res.ok) throw new Error('API response not OK');
    const data = await res.json();
    // Validate returned structure
    if (data && data.basic && data.premium && data.luxury) {
      return data;
    }
    return DEFAULT_PRICING;
  } catch (err) {
    console.warn('Could not fetch live pricing, using defaults:', err.message);
    return DEFAULT_PRICING;
  }
}

/**
 * Update pricing in API.
 */
export async function updatePricing(packages, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/pricing`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify({ packages })
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to update pricing');
  }
  return await res.json();
}

/**
 * Submit client inquiry (Contact or Estimate lead)
 */
export async function submitInquiry(inquiryData) {
  const res = await fetch(`${API_BASE_URL}/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(inquiryData)
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to submit inquiry');
  }
  return await res.json();
}

/**
 * Fetch all inquiries (Admin auth required)
 */
export async function getInquiries(adminPassword) {
  const res = await fetch(`${API_BASE_URL}/inquiries`, {
    headers: {
      'x-admin-password': adminPassword
    }
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to fetch inquiries');
  }
  return await res.json();
}

/**
 * Update status/notes for an inquiry (Admin auth required)
 */
export async function updateInquiry(id, updateData, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to update inquiry');
  }
  return await res.json();
}

/**
 * Delete an inquiry (Admin auth required)
 */
export async function deleteInquiry(id, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to delete inquiry');
  }
  return await res.json().catch(() => ({ success: true }));
}

/**
 * Fetch all projects (Public)
 */
export async function getProjects() {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return await res.json();
  } catch (err) {
    console.error('Error in getProjects:', err.message);
    return [];
  }
}

/**
 * Add a project (Admin)
 */
export async function addProject(projectData, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify(projectData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to add project');
  }
  return await res.json();
}

/**
 * Update a project (Admin)
 */
export async function updateProject(id, projectData, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify(projectData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update project');
  }
  return await res.json();
}

/**
 * Delete a project (Admin)
 */
export async function deleteProject(id, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-password': adminPassword
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to delete project');
  }
  return await res.json().catch(() => ({ success: true }));
}

/**
 * Fetch all testimonials (Public)
 */
export async function getTestimonials() {
  try {
    const res = await fetch(`${API_BASE_URL}/testimonials`);
    if (!res.ok) throw new Error('Failed to fetch testimonials');
    return await res.json();
  } catch (err) {
    console.error('Error in getTestimonials:', err.message);
    return [];
  }
}

/**
 * Add a testimonial (Admin)
 */
export async function addTestimonial(testimonialData, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/testimonials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify(testimonialData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to add testimonial');
  }
  return await res.json();
}

/**
 * Update a testimonial (Admin)
 */
export async function updateTestimonial(id, testimonialData, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify(testimonialData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update testimonial');
  }
  return await res.json();
}

/**
 * Delete a testimonial (Admin)
 */
export async function deleteTestimonial(id, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-password': adminPassword
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to delete testimonial');
  }
  return await res.json().catch(() => ({ success: true }));
}

/**
 * Fetch settings (Public)
 */
export async function getSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  } catch (err) {
    console.error('Error in getSettings:', err.message);
    return {};
  }
}

/**
 * Update settings (Admin)
 */
export async function updateSettings(settings, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify({ settings })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update settings');
  }
  return await res.json();
}

/**
 * Send chat message history to chatbot API
 */
export async function sendChatMessage(messages) {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to get chatbot response');
  }
  return await res.json();
}

