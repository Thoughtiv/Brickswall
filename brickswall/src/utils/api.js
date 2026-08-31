const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Origin that serves uploaded files (API_BASE_URL without the trailing /api)
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Turn a stored image path into a URL the browser can actually load.
 * Uploads are saved as server-relative paths ("/uploads/x.png"), which break
 * whenever the frontend is served from a different origin than the API
 * (Vite on :5173 in dev, or a separate host in production). External URLs and
 * data URLs are returned untouched.
 */
export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
}

// Fallback pricing configuration in case the server is offline or not configured yet
export const DEFAULT_PRICING = {
  basic: {
    id: 'basic',
    name: 'Standard Package',
    pricePerSqFt: '₹1,750 / sq.ft',
    priceNum: 1750,
    badge: 'Economical & Durable',
    desc: 'An affordable solution designed for quality residential construction with dependable materials and essential finishes.'
  },
  premium: {
    id: 'premium',
    name: 'Enhanced Package',
    pricePerSqFt: '₹2,150 / sq.ft',
    priceNum: 2150,
    badge: 'Most Popular Choice',
    desc: 'Ideal for homeowners seeking enhanced finishes, premium materials, custom elevation designs, and additional customization.'
  },
  luxury: {
    id: 'luxury',
    name: 'Signature Package',
    pricePerSqFt: '₹2,750 / sq.ft',
    priceNum: 2750,
    badge: 'High-End Bespoke',
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
      const canonicalNames = {
        basic: 'Standard Package',
        premium: 'Enhanced Package',
        luxury: 'Signature Package'
      };
      Object.keys(canonicalNames).forEach(id => {
        if (data[id]) {
          if (!data[id].name || data[id].name === 'Basic Package' || data[id].name === 'basic') {
            data[id].name = canonicalNames[id];
          } else if (data[id].name === 'Premium Package' || data[id].name === 'premium') {
            data[id].name = canonicalNames[id];
          } else if (data[id].name === 'Luxury Package' || data[id].name === 'luxury') {
            data[id].name = canonicalNames[id];
          }
        }
      });
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
 * Fetch package comparison matrix (Public)
 */
export async function getPackageMatrix() {
  try {
    const res = await fetch(`${API_BASE_URL}/pricing/matrix`);
    if (!res.ok) throw new Error('Failed to fetch package matrix');
    return await res.json();
  } catch (err) {
    console.error('Error in getPackageMatrix:', err.message);
    return [];
  }
}

/**
 * Update package comparison matrix (Admin)
 */
export async function updatePackageMatrix(matrix, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/pricing/matrix`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify({ matrix })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update package matrix');
  }
  return await res.json();
}

/**
 * Fetch all blogs (Public)
 */
export async function getBlogs() {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    if (!res.ok) throw new Error('Failed to fetch blogs');
    return await res.json();
  } catch (err) {
    console.error('Error in getBlogs:', err.message);
    return [];
  }
}

/**
 * Add a blog post (Admin)
 */
export async function addBlog(blogData, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/blogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify(blogData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to add blog post');
  }
  return await res.json();
}

/**
 * Update a blog post (Admin)
 */
export async function updateBlog(id, blogData, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify(blogData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update blog post');
  }
  return await res.json();
}

/**
 * Delete a blog post (Admin)
 */
export async function deleteBlog(id, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-password': adminPassword
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to delete blog post');
  }
  return await res.json().catch(() => ({ success: true }));
}

/**
 * Upload an image file (Admin)
 */
export async function uploadImage(imageBase64, name = 'image') {
  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageBase64, name })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to upload image');
  }
  const data = await res.json();
  return data.url;
}

/* ────────────── Quotation Editor: user login ────────────── */

/**
 * Log in to the quotation editor. Returns { token, expiresAt, user }.
 */
export async function editorLogin(username, password) {
  const res = await fetch(`${API_BASE_URL}/editor-auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Login failed');
  }
  return await res.json();
}

/**
 * Validate a stored editor token. Returns { user }.
 */
export async function editorMe(token) {
  const res = await fetch(`${API_BASE_URL}/editor-auth/me`, {
    headers: {
      'x-editor-token': token
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Session is no longer valid');
  }
  return await res.json();
}

/**
 * Log out of the quotation editor (revokes the token server-side).
 */
export async function editorLogout(token) {
  try {
    await fetch(`${API_BASE_URL}/editor-auth/logout`, {
      method: 'POST',
      headers: {
        'x-editor-token': token
      }
    });
  } catch (err) {
    // Local sign-out should succeed even if the server is unreachable
    console.warn('Could not revoke editor session on the server:', err.message);
  }
}

/* ────────────── Quotation Editor: user management (Admin) ────────────── */

/**
 * Fetch all editor users (Admin)
 */
export async function getEditorUsers(adminPassword) {
  const res = await fetch(`${API_BASE_URL}/editor-users`, {
    headers: {
      'x-admin-password': adminPassword
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch editor users');
  }
  return await res.json();
}

/**
 * Create an editor user (Admin)
 */
export async function addEditorUser(userData, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/editor-users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to create editor user');
  }
  return await res.json();
}

/**
 * Update an editor user - rename, activate/deactivate, or reset password (Admin)
 */
export async function updateEditorUser(id, userData, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/editor-users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword
    },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update editor user');
  }
  return await res.json();
}

/**
 * Delete an editor user (Admin)
 */
export async function deleteEditorUser(id, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/editor-users/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-password': adminPassword
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to delete editor user');
  }
  return await res.json().catch(() => ({ success: true }));
}

/**
 * Save a generated quotation log (Editor Token required)
 */
export async function saveEditorQuotation(token, quotationData) {
  const res = await fetch(`${API_BASE_URL}/editor-quotations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-editor-token': token
    },
    body: JSON.stringify(quotationData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to save quotation log');
  }
  return await res.json();
}

/**
 * Fetch generated quotations (Admin)
 */
export async function getEditorQuotations(adminPassword, editorUserId = null) {
  const url = editorUserId
    ? `${API_BASE_URL}/editor-quotations?editor_user_id=${editorUserId}`
    : `${API_BASE_URL}/editor-quotations`;

  const res = await fetch(url, {
    headers: {
      'x-admin-password': adminPassword
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch editor quotations');
  }
  return await res.json();
}

/**
 * Delete a quotation log entry (Admin)
 */
export async function deleteEditorQuotation(id, adminPassword) {
  const res = await fetch(`${API_BASE_URL}/editor-quotations/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-password': adminPassword
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to delete quotation log');
  }
  return await res.json().catch(() => ({ success: true }));
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


