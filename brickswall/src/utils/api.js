const API_BASE_URL = 'http://localhost:5000/api';

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
