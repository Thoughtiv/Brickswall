import React, { useState, useEffect } from 'react';
import {
  Lock,
  Search,
  Filter,
  Trash2,
  Save,
  Check,
  Database,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  Edit3,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileText,
  LogOut,
  ChevronRight,
  TrendingUp,
  MapPin,
  FileSpreadsheet,
  X,
  Upload,
  Plus,
  BookOpen,
  Image,
  KeyRound,
  UserPlus,
  Power,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  getInquiries,
  updateInquiry,
  deleteInquiry,
  getPricing,
  updatePricing,
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getSettings,
  updateSettings,
  getBlogs,
  addBlog,
  updateBlog,
  deleteBlog,
  getPackageMatrix,
  updatePackageMatrix,
  uploadImage,
  getEditorUsers,
  addEditorUser,
  updateEditorUser,
  deleteEditorUser,
  getEditorQuotations,
  deleteEditorQuotation,
  resolveAssetUrl
} from '../utils/api';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('inquiries');

  // Data States
  const [inquiries, setInquiries] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [packageMatrix, setPackageMatrix] = useState([]);
  const [editorUsers, setEditorUsers] = useState([]);
  const [editorQuotations, setEditorQuotations] = useState([]);
  const [expandedEditorId, setExpandedEditorId] = useState(null);
  const [newEditorUser, setNewEditorUser] = useState({ username: '', fullName: '', password: '' });
  const [editorUserStatus, setEditorUserStatus] = useState({ type: '', message: '' });
  const [settings, setSettings] = useState({
    phone_primary: '',
    phone_secondary: '',
    whatsapp: '',
    email: '',
    address: '',
    office_hours: '',
    show_projects: 'false'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Selected Inquiry for details panel
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminNotesText, setAdminNotesText] = useState('');

  // Editable pricing data state
  const [editablePricing, setEditablePricing] = useState({
    basic: { name: '', priceNum: 0, badge: '', desc: '' },
    premium: { name: '', priceNum: 0, badge: '', desc: '' },
    luxury: { name: '', priceNum: 0, badge: '', desc: '' }
  });

  // Calculator preview plot size
  const [previewPlotSize, setPreviewPlotSize] = useState(1500);

  // Modals state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    type: '',
    targetId: '',
    targetTitle: ''
  });
  const [projectModal, setProjectModal] = useState({
    isOpen: false,
    mode: 'add',
    projectData: {
      title: '',
      category: 'homes',
      categoryLabel: 'Independent Home',
      location: '',
      size: '',
      duration: '',
      image: '',
      description: ''
    }
  });
  const [testimonialModal, setTestimonialModal] = useState({
    isOpen: false,
    mode: 'add',
    testimonialData: {
      name: '',
      location: '',
      role: '',
      quote: '',
      avatar: '',
      rating: 5
    }
  });
  const [blogModal, setBlogModal] = useState({
    isOpen: false,
    mode: 'add',
    blogData: {
      title: '',
      category: 'Construction Tips',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: '5 min read',
      image: '',
      excerpt: '',
      content: '',
      author: 'Bricks Wall Editorial'
    }
  });

  // Image Upload Helper
  const handleFileUpload = async (file, onUploadSuccess) => {
    if (!file) return;
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result;
          const uploadedUrl = await uploadImage(base64, file.name);
          onUploadSuccess(uploadedUrl);
        } catch (err) {
          alert(`Image upload error: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert(`File reading error: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Load password from localStorage if exists
  useEffect(() => {
    const savedPassword = localStorage.getItem('bw_admin_pwd');
    if (savedPassword) {
      setPassword(savedPassword);
      checkAuth(savedPassword);
    }
  }, []);

  const checkAuth = async (pwdToTest) => {
    setIsLoading(true);
    setLoginError('');
    try {
      // Test the password by fetching inquiries (which requires auth)
      const data = await getInquiries(pwdToTest);
      setInquiries(data);
      localStorage.setItem('bw_admin_pwd', pwdToTest);
      setIsAuthenticated(true);

      // Also fetch other tables
      const pricingData = await getPricing();
      setPricing(pricingData);
      setEditablePricing(pricingData);

      const projectsData = await getProjects();
      setProjects(projectsData);

      const testimonialsData = await getTestimonials();
      setTestimonials(testimonialsData);

      const blogsData = await getBlogs();
      setBlogs(blogsData);

      const matrixData = await getPackageMatrix();
      if (Array.isArray(matrixData)) setPackageMatrix(matrixData);

      const settingsData = await getSettings();
      setSettings(settingsData);

      await loadEditorUsers(pwdToTest);
    } catch (err) {
      setLoginError(err.message || 'Invalid admin credentials');
      localStorage.removeItem('bw_admin_pwd');
    } finally {
      setIsLoading(false);
    }
  };

  // Kept separate so a failure here never blocks login on an older database
  const loadEditorUsers = async (pwdToUse = password) => {
    try {
      const data = await getEditorUsers(pwdToUse);
      setEditorUsers(Array.isArray(data) ? data : []);
      const quotesData = await getEditorQuotations(pwdToUse);
      setEditorQuotations(Array.isArray(quotesData) ? quotesData : []);
    } catch (err) {
      console.warn('Could not load editor users or quotations:', err.message);
      setEditorUsers([]);
      setEditorQuotations([]);
    }
  };

  const handleDeleteQuotationLog = async (quoteId) => {
    if (!window.confirm('Are you sure you want to delete this quotation log entry?')) return;
    try {
      await deleteEditorQuotation(quoteId, password);
      await loadEditorUsers(password);
    } catch (err) {
      alert(err.message || 'Failed to delete quotation log');
    }
  };

  const handleAddEditorUser = async (e) => {
    e.preventDefault();
    setEditorUserStatus({ type: '', message: '' });
    try {
      await addEditorUser(newEditorUser, password);
      setNewEditorUser({ username: '', fullName: '', password: '' });
      setEditorUserStatus({ type: 'success', message: 'Editor user created successfully.' });
      await loadEditorUsers();
    } catch (err) {
      setEditorUserStatus({ type: 'error', message: err.message });
    }
  };

  const handleToggleEditorUser = async (user) => {
    try {
      await updateEditorUser(user.id, { isActive: !user.is_active }, password);
      setEditorUserStatus({
        type: 'success',
        message: `${user.username} ${user.is_active ? 'deactivated' : 'reactivated'}.`
      });
      await loadEditorUsers();
    } catch (err) {
      setEditorUserStatus({ type: 'error', message: err.message });
    }
  };

  const handleResetEditorPassword = async (user) => {
    const newPassword = window.prompt(`Enter a new password for "${user.username}" (minimum 6 characters):`);
    if (newPassword === null) return;
    if (newPassword.length < 6) {
      setEditorUserStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    try {
      await updateEditorUser(user.id, { password: newPassword }, password);
      setEditorUserStatus({
        type: 'success',
        message: `Password reset for ${user.username}. Their existing sessions were signed out.`
      });
      await loadEditorUsers();
    } catch (err) {
      setEditorUserStatus({ type: 'error', message: err.message });
    }
  };

  const handleDeleteEditorUser = async (user) => {
    if (!window.confirm(`Delete editor user "${user.username}"? They will lose access immediately.`)) return;
    try {
      await deleteEditorUser(user.id, password);
      setEditorUserStatus({ type: 'success', message: `${user.username} deleted.` });
      await loadEditorUsers();
    } catch (err) {
      setEditorUserStatus({ type: 'error', message: err.message });
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setLoginError('Password is required');
      return;
    }
    checkAuth(password);
  };

  const handleLogout = () => {
    localStorage.removeItem('bw_admin_pwd');
    setIsAuthenticated(false);
    setPassword('');
    setInquiries([]);
    setSelectedInquiry(null);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getInquiries(password);
      setInquiries(data);
      const pricingData = await getPricing();
      setPricing(pricingData);
      setEditablePricing(pricingData);

      const projectsData = await getProjects();
      setProjects(projectsData);

      const testimonialsData = await getTestimonials();
      setTestimonials(testimonialsData);

      const blogsData = await getBlogs();
      setBlogs(blogsData);

      const matrixData = await getPackageMatrix();
      if (Array.isArray(matrixData)) setPackageMatrix(matrixData);

      const settingsData = await getSettings();
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Inquiry actions
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateInquiry(id, { status: newStatus }, password);
      // Update local state
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleSaveNotes = async (id) => {
    try {
      await updateInquiry(id, { adminNotes: adminNotesText }, password);
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, adminNotes: adminNotesText } : inq));
      alert('Notes saved successfully.');
    } catch (err) {
      alert(`Error saving notes: ${err.message}`);
    }
  };

  // Deletion confirm triggers
  const triggerDeleteConfirm = (type, id, title) => {
    setDeleteConfirmModal({
      isOpen: true,
      type,
      targetId: id,
      targetTitle: title
    });
  };

  const executeDelete = async () => {
    const { type, targetId } = deleteConfirmModal;
    setDeleteConfirmModal(prev => ({ ...prev, isOpen: false }));
    try {
      if (type === 'inquiry') {
        await deleteInquiry(targetId, password);
        setInquiries(prev => prev.filter(inq => Number(inq.id) !== Number(targetId)));
        if (selectedInquiry && Number(selectedInquiry.id) === Number(targetId)) {
          setSelectedInquiry(null);
        }
      } else if (type === 'project') {
        await deleteProject(targetId, password);
        setProjects(prev => prev.filter(p => Number(p.id) !== Number(targetId)));
      } else if (type === 'testimonial') {
        await deleteTestimonial(targetId, password);
        setTestimonials(prev => prev.filter(t => Number(t.id) !== Number(targetId)));
      } else if (type === 'blog') {
        await deleteBlog(targetId, password);
        setBlogs(prev => prev.filter(b => Number(b.id) !== Number(targetId)));
      }
    } catch (err) {
      alert(`Error deleting record: ${err.message}`);
    }
  };

  // Pricing actions
  const handlePriceFieldChange = (tier, field, value) => {
    setEditablePricing(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: field === 'priceNum' ? Number(value) : value
      }
    }));
  };

  // Helper to get or normalize tier sections array
  const getTierSections = (tier) => {
    const rawServices = editablePricing[tier]?.services;
    if (Array.isArray(rawServices) && rawServices.length > 0) {
      if (typeof rawServices[0] === 'object' && rawServices[0] !== null && rawServices[0].heading !== undefined) {
        return rawServices;
      }
      // Legacy string list conversion
      return [{
        heading: editablePricing[tier]?.servicesHeading || 'Included Deliverables & Guarantee',
        points: [...(editablePricing[tier]?.warranty ? [editablePricing[tier].warranty] : []), ...rawServices.map(s => typeof s === 'string' ? s : String(s))]
      }];
    }
    return [{
      heading: editablePricing[tier]?.servicesHeading || 'Included Deliverables & Guarantee',
      points: editablePricing[tier]?.warranty ? [editablePricing[tier].warranty] : ['']
    }];
  };

  const updateTierSections = (tier, newSections) => {
    setEditablePricing(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        services: newSections
      }
    }));
  };

  const handleAddSection = (tier) => {
    const current = getTierSections(tier);
    updateTierSections(tier, [...current, { heading: 'New Section Heading', points: [''] }]);
  };

  const handleRemoveSection = (tier, secIdx) => {
    const current = getTierSections(tier);
    const updated = current.filter((_, idx) => idx !== secIdx);
    updateTierSections(tier, updated.length > 0 ? updated : [{ heading: '', points: [''] }]);
  };

  const handleSectionHeadingChange = (tier, secIdx, val) => {
    const current = getTierSections(tier);
    const updated = current.map((sec, idx) => idx === secIdx ? { ...sec, heading: val } : sec);
    updateTierSections(tier, updated);
  };

  const handleAddSectionPoint = (tier, secIdx) => {
    const current = getTierSections(tier);
    const updated = current.map((sec, idx) => {
      if (idx === secIdx) {
        return { ...sec, points: [...(sec.points || []), ''] };
      }
      return sec;
    });
    updateTierSections(tier, updated);
  };

  const handleRemoveSectionPoint = (tier, secIdx, ptIdx) => {
    const current = getTierSections(tier);
    const updated = current.map((sec, idx) => {
      if (idx === secIdx) {
        return { ...sec, points: (sec.points || []).filter((_, pIdx) => pIdx !== ptIdx) };
      }
      return sec;
    });
    updateTierSections(tier, updated);
  };

  const handleSectionPointChange = (tier, secIdx, ptIdx, val) => {
    const current = getTierSections(tier);
    const updated = current.map((sec, idx) => {
      if (idx === secIdx) {
        const newPoints = [...(sec.points || [])];
        newPoints[ptIdx] = val;
        return { ...sec, points: newPoints };
      }
      return sec;
    });
    updateTierSections(tier, updated);
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    try {
      await updatePricing(editablePricing, password);
      setSaveStatus('Saved successfully!');
      // Update primary pricing state
      setPricing(JSON.parse(JSON.stringify(editablePricing)));
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus(`Error: ${err.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  // Package Matrix Handlers
  const handleSaveMatrix = async () => {
    setSaveStatus('Saving Matrix Table...');
    try {
      await updatePackageMatrix(packageMatrix, password);
      setSaveStatus('Comparison Matrix saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus(`Error saving matrix: ${err.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const handleMatrixCellChange = (index, field, value) => {
    setPackageMatrix(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddMatrixRow = () => {
    setPackageMatrix(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        feature: 'New Specification',
        basic: 'Standard Option',
        premium: 'High Customization',
        luxury: 'Bespoke Quality'
      }
    ]);
  };

  const handleDeleteMatrixRow = (index) => {
    setPackageMatrix(prev => prev.filter((_, i) => i !== index));
  };

  // Blog Submits
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    const { mode, blogData } = blogModal;
    try {
      if (mode === 'add') {
        const added = await addBlog(blogData, password);
        setBlogs(prev => [added, ...prev]);
      } else {
        const updated = await updateBlog(blogData.id, blogData, password);
        setBlogs(prev => prev.map(b => Number(b.id) === Number(blogData.id) ? updated : b));
      }
      setBlogModal({ isOpen: false, mode: 'add', blogData: {} });
    } catch (err) {
      alert(`Error submitting blog post: ${err.message}`);
    }
  };

  // Project submits
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const { mode, projectData } = projectModal;
    try {
      if (mode === 'add') {
        const added = await addProject(projectData, password);
        setProjects(prev => [added, ...prev]);
      } else {
        const updated = await updateProject(projectData.id, projectData, password);
        setProjects(prev => prev.map(p => Number(p.id) === Number(projectData.id) ? updated : p));
      }
      setProjectModal({ isOpen: false, mode: 'add', projectData: {} });
    } catch (err) {
      alert(`Error submitting project: ${err.message}`);
    }
  };

  // Testimonial submits
  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    const { mode, testimonialData } = testimonialModal;
    try {
      if (mode === 'add') {
        const added = await addTestimonial(testimonialData, password);
        setTestimonials(prev => [added, ...prev]);
      } else {
        const updated = await updateTestimonial(testimonialData.id, testimonialData, password);
        setTestimonials(prev => prev.map(t => Number(t.id) === Number(testimonialData.id) ? updated : t));
      }
      setTestimonialModal({ isOpen: false, mode: 'add', testimonialData: {} });
    } catch (err) {
      alert(`Error submitting testimonial: ${err.message}`);
    }
  };

  // Settings submit
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving Settings...');
    try {
      await updateSettings(settings, password);
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus(`Error saving settings: ${err.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  // Helper selectors / aggregation
  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch =
      inq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.phone?.includes(searchTerm) ||
      inq.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || inq.status === statusFilter;
    const matchesType = typeFilter === 'All' || inq.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate Pipeline statistics
  const stats = (() => {
    const total = inquiries.length;
    const pending = inquiries.filter(i => i.status === 'New').length;
    const contacted = inquiries.filter(i => i.status === 'Contacted').length;
    const closed = inquiries.filter(i => i.status === 'Closed').length;

    // Calculate pipeline value based on estimations
    let totalEstVal = 0;
    inquiries.forEach(inq => {
      if (inq.estimatedCost) {
        // Extract first number in value
        const cleaned = inq.estimatedCost.replace(/[^\d,]/g, '').split(',');
        const val = parseInt(cleaned.join('')) || 0;
        totalEstVal += val;
      }
    });

    // Package popularity
    const packagesCount = { basic: 0, premium: 0, luxury: 0 };
    inquiries.forEach(i => {
      if (i.packageType && packagesCount[i.packageType.toLowerCase()] !== undefined) {
        packagesCount[i.packageType.toLowerCase()]++;
      }
    });

    let popularPkg = 'Enhanced Package';
    let maxCount = packagesCount.premium;
    if (packagesCount.luxury > maxCount) {
      popularPkg = 'Signature Package';
      maxCount = packagesCount.luxury;
    }
    if (packagesCount.basic > maxCount) {
      popularPkg = 'Standard Package';
    }

    return {
      total,
      pending,
      contacted,
      closed,
      pipelineValue: totalEstVal ? `₹${(totalEstVal / 10000000).toFixed(2)} Cr` : '₹0.00',
      popularPkg
    };
  })();

  const handleSelectInquiry = (inq) => {
    setSelectedInquiry(inq);
    setAdminNotesText(inq.adminNotes || '');
  };

  // Login screen if not auth
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <style>{`
          .admin-login-wrapper {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 20px;
            font-family: 'Inter', sans-serif;
          }
          .login-card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            width: 100%;
            max-width: 440px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            text-align: center;
          }
          .lock-circle {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #ff7e47 0%, #d9531e 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            box-shadow: 0 8px 16px rgba(217, 83, 30, 0.25);
            color: white;
          }
          .login-card h1 {
            color: white;
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 8px;
          }
          .login-card p {
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 32px;
          }
          .form-group-login {
            text-align: left;
            margin-bottom: 24px;
          }
          .form-group-login label {
            display: block;
            color: #cbd5e1;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
          }
          .login-input {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 14px 16px;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.2s;
          }
          .login-input:focus {
            outline: none;
            border-color: #d9531e;
            box-shadow: 0 0 0 3px rgba(217, 83, 30, 0.15);
          }
          .login-btn {
            width: 100%;
            background: #d9531e;
            color: white;
            border: none;
            padding: 14px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .login-btn:hover {
            background: #e06331;
            transform: translateY(-1px);
          }
          .login-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .login-error {
            color: #ef4444;
            font-size: 13px;
            margin-top: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          @media (max-width: 480px) {
            .login-card {
              padding: 24px 16px;
              border-radius: 16px;
            }
            .login-card h1 {
              font-size: 20px;
            }
            .login-card p {
              font-size: 13px;
              margin-bottom: 24px;
            }
          }
        `}</style>
        <div className="login-card">
          <div className="lock-circle">
            <Lock size={28} />
          </div>
          <h1>Admin Portal Gate</h1>
          <p>Verify password credentials to access dashboard and manage inquiries.</p>

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group-login">
              <label>Admin Access Code</label>
              <input
                type="password"
                placeholder="Enter password..."
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Unlock Portal'} <ChevronRight size={18} />
            </button>
          </form>

          {loginError && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <style>{`
        .admin-dashboard-container {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
        }
        .admin-header {
          background: #0f172a;
          color: white;
          padding: 20px 0;
          border-bottom: 4px solid #d9531e;
        }
        .admin-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-title h1 {
          font-size: 20px;
          font-weight: 800;
          line-height: 1;
        }
        .logo-title p {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 3px;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .db-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          padding: 6px 12px;
          border-radius: 9999px;
          font-weight: 600;
          border: 1px solid rgba(74, 222, 128, 0.2);
        }
        .logout-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: #ef4444;
          color: white;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 32px;
        }
        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
          border: 1px solid #f1f5f9;
          position: relative;
          overflow: hidden;
        }
        .stat-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #cbd5e1;
        }
        .stat-card-accent.orange { background: #d9531e; }
        .stat-card-accent.blue { background: #3b82f6; }
        .stat-card-accent.green { background: #22c55e; }
        .stat-card-accent.purple { background: #a855f7; }
        .stat-icon {
          float: right;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon.orange { background: rgba(217, 83, 30, 0.08); color: #d9531e; }
        .stat-icon.blue { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }
        .stat-icon.green { background: rgba(34, 197, 94, 0.08); color: #22c55e; }
        .stat-icon.purple { background: rgba(168, 85, 247, 0.08); color: #a855f7; }
        .stat-label {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-val {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin-top: 8px;
        }
        .stat-desc {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 6px;
        }
        .nav-tabs {
          display: flex;
          gap: 8px;
          margin-top: 32px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0px;
        }
        .tab-btn {
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 700;
          color: #64748b;
          border: none;
          background: none;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }
        .tab-btn:hover {
          color: #0f172a;
        }
        .tab-btn.active {
          color: #d9531e;
        }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #d9531e;
        }
        .tab-content-area {
          margin-top: 24px;
          padding-bottom: 60px;
        }
        /* Inquiries grid */
        .inquiries-flex-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }
        .inq-list-panel {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }
        .filters-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        .search-box {
          position: relative;
          flex-grow: 1;
        }
        .search-box input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          transition: all 0.2s;
        }
        .search-box input:focus {
          outline: none;
          border-color: #d9531e;
        }
        .search-box svg {
          position: absolute;
          left: 14px;
          top: 12px;
          color: #94a3b8;
        }
        .filter-select {
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: white;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
        }
        .inquiry-table-container {
          overflow-x: auto;
        }
        .inq-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .inq-table th {
          background: #f8fafc;
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          border-bottom: 2px solid #e2e8f0;
        }
        .inq-table td {
          padding: 16px;
          font-size: 13px;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
        }
        .inq-row {
          cursor: pointer;
          transition: all 0.2s;
        }
        .inq-row:hover {
          background: #f8fafc;
        }
        .inq-row.selected {
          background: #fff8f5;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
        }
        .status-badge.new { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
        .status-badge.contacted { background: rgba(245, 158, 11, 0.1); color: #d97706; }
        .status-badge.progress { background: rgba(168, 85, 247, 0.1); color: #7c3aed; }
        .status-badge.closed { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
        
        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          background: #f1f5f9;
          color: #475569;
        }
        .type-badge.calc {
          background: rgba(217, 83, 30, 0.08);
          color: #d9531e;
        }

        /* Detail Panel */
        .inq-detail-panel {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          align-self: start;
          position: sticky;
          top: 24px;
        }
        .detail-placeholder {
          text-align: center;
          padding: 48px 24px;
          color: #94a3b8;
        }
        .detail-header {
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .detail-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }
        .detail-header p {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }
        .detail-section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 12px;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .detail-item-box {
          background: #f8fafc;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #f1f5f9;
        }
        .detail-item-box.full {
          grid-column: span 2;
        }
        .detail-item-label {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }
        .detail-item-val {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          margin-top: 4px;
        }
        .notes-textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 12px;
          font-size: 13px;
          resize: vertical;
          margin-bottom: 12px;
        }
        .notes-textarea:focus {
          outline: none;
          border-color: #d9531e;
        }
        .action-row-detail {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 20px;
          padding-top: 16px;
          border-t: 1px solid #e2e8f0;
        }
        .btn-action-dt {
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          border: none;
        }
        .btn-action-dt.save { background: #d9531e; color: white; }
        .btn-action-dt.save:hover { background: #e06331; }
        .btn-action-dt.delete { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
        .btn-action-dt.delete:hover { background: #fee2e2; }

        /* Pricing edit panel */
        .pricing-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .pricing-manager-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }
        .pricing-tiers-flex {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .tier-edit-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          position: relative;
        }
        .tier-edit-box.basic-border { border-top: 4px solid #64748b; }
        .tier-edit-box.premium-border { border-top: 4px solid #d9531e; }
        .tier-edit-box.luxury-border { border-top: 4px solid #a855f7; }
        
        .tier-title-row {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tier-form-group {
          margin-bottom: 12px;
        }
        .tier-form-group label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .tier-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 13px;
          background: white;
        }
        .tier-input:focus {
          outline: none;
          border-color: #d9531e;
        }
        .price-input-wrapper {
          position: relative;
        }
        .price-input-wrapper span {
          position: absolute;
          left: 12px;
          top: 8px;
          font-size: 13px;
          color: #64748b;
          font-weight: 700;
        }
        .price-input-wrapper input {
          padding-left: 24px;
        }
        .save-pricing-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        .save-pricing-btn {
          background: #d9531e;
          color: white;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .save-pricing-btn:hover { background: #e06331; }
        
        /* Calculator preview */
        .calc-preview-card {
          background: #0f172a;
          color: white;
          border-radius: 16px;
          padding: 24px;
          margin-top: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .slider-wrapper {
          margin-top: 16px;
          margin-bottom: 24px;
        }
        .preview-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .preview-box-item {
          background: rgba(255, 255, 255, 0.04);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .preview-box-item.popular {
          border-color: rgba(217, 83, 30, 0.4);
          background: rgba(217, 83, 30, 0.05);
        }
        .no-leads-card {
          text-align: center;
          padding: 48px;
          color: #94a3b8;
        }

        /* Mobile Responsiveness Media Queries */
        @media (max-width: 1024px) {
          .pricing-tiers-flex {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .preview-pricing-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .admin-header-flex {
            flex-direction: column;
            gap: 16px;
            align-items: center;
            text-align: center;
          }
          .logo-section {
            flex-direction: column;
            gap: 8px;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px;
            margin-top: 24px;
          }
          .inquiries-flex-layout {
            grid-template-columns: 1fr !important;
          }
          .filters-row {
            flex-direction: column;
            gap: 8px;
          }
          .filter-select {
            width: 100%;
          }
          .pricing-tiers-flex {
            grid-template-columns: 1fr !important;
          }
          .preview-pricing-grid {
            grid-template-columns: 1fr !important;
          }
          .pricing-calc-preview {
            padding: 16px;
          }
          /* Hide non-essential columns on mobile to fit the viewport */
          .inq-table th:nth-child(3),
          .inq-table td:nth-child(3),
          .inq-table th:nth-child(4),
          .inq-table td:nth-child(4) {
            display: none;
          }

          /* Detail panel modal popup layout on mobile */
          .inq-detail-panel {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: white !important;
            z-index: 9999 !important;
            overflow-y: auto !important;
            padding: 24px !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15) !important;
            animation: slideUpDetail 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          
          .inq-detail-panel:has(.detail-placeholder) {
            display: none !important;
          }

          .detail-placeholder {
            display: none !important;
          }

          @keyframes slideUpDetail {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-tabs {
            flex-direction: column;
            gap: 8px;
            align-items: stretch !important;
          }
          .admin-tabs button {
            width: 100%;
            justify-content: center;
          }
          .detail-header {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
          .detail-item-box.full {
            grid-column: span 1 !important;
          }
          .action-row-detail {
            flex-direction: column;
            gap: 10px;
          }
          .action-row-detail button {
            width: 100%;
          }
        }
      `}</style>

      {/* Header */}
      <header className="admin-header">
        <div className="container admin-header-flex">
          <div className="logo-section">
            <div className="logo-title">
              <h1>Bricks Wall Construction</h1>
              <p>ADMIN CONTROL DASHBOARD &bull; HYDERABAD</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="db-status">
              <Database size={14} />
              <span>MySQL Live</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-accent orange"></div>
            <div className="stat-icon orange">
              <Users size={22} />
            </div>
            <span className="stat-label">Total Leads</span>
            <div className="stat-val">{stats.total}</div>
            <p className="stat-desc">Inquiries registered in system</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-accent blue"></div>
            <div className="stat-icon blue">
              <Clock size={22} />
            </div>
            <span className="stat-label">New Follow-ups</span>
            <div className="stat-val">{stats.pending}</div>
            <p className="stat-desc">Awaiting engineer callback</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-accent green"></div>
            <div className="stat-icon green">
              <TrendingUp size={22} />
            </div>
            <span className="stat-label">Est. Pipeline</span>
            <div className="stat-val">{stats.pipelineValue}</div>
            <p className="stat-desc">Total cumulative construction value</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-accent purple"></div>
            <div className="stat-icon purple">
              <FileSpreadsheet size={22} />
            </div>
            <span className="stat-label">Top Tier Package</span>
            <div className="stat-val" style={{ fontSize: '20px', marginTop: '16px' }}>
              {stats.popularPkg}
            </div>
            <p className="stat-desc">Most popular selected plan</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="nav-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            Leads &amp; Inquiries ({filteredInquiries.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Portfolio Projects ({projects.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`}
            onClick={() => setActiveTab('testimonials')}
          >
            Client Reviews ({testimonials.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            Blogs &amp; Hub ({blogs.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            Construction Cost Pricing
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Site Settings
          </button>
          <button
            className={`tab-btn ${activeTab === 'editorUsers' ? 'active' : ''}`}
            onClick={() => setActiveTab('editorUsers')}
          >
            Editor Users ({editorUsers.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="tab-content-area">
          {activeTab === 'inquiries' && (
            <div className="inquiries-flex-layout">
              {/* Left Column - Leads List */}
              <div className="inq-list-panel">
                <div className="filters-row">
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search leads by name, phone, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <select
                    className="filter-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="All">All Source Types</option>
                    <option value="contact">Contact Form</option>
                    <option value="estimate">Cost Calculator</option>
                  </select>
                </div>

                <div className="inquiry-table-container">
                  {filteredInquiries.length === 0 ? (
                    <div className="no-leads-card">
                      <FileText size={48} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
                      <p>No client inquiries found matching search criteria.</p>
                    </div>
                  ) : (
                    <table className="inq-table">
                      <thead>
                        <tr>
                          <th>Lead Name</th>
                          <th>Service Type</th>
                          <th>Location</th>
                          <th>Source</th>
                          <th>Status</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInquiries.map((inq) => (
                          <tr
                            key={inq.id}
                            onClick={() => handleSelectInquiry(inq)}
                            className={`inq-row ${selectedInquiry && selectedInquiry.id === inq.id ? 'selected' : ''}`}
                          >
                            <td>
                              <div style={{ fontWeight: 700 }}>{inq.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{inq.phone}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{inq.serviceType || 'Not specified'}</div>
                              {inq.plotSize && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{inq.plotSize}</div>}
                            </td>
                            <td style={{ fontWeight: 600 }}>{inq.location || 'Hyderabad'}</td>
                            <td>
                              <span className={`type-badge ${inq.type === 'estimate' ? 'calc' : ''}`}>
                                {inq.type === 'estimate' ? 'Calculator' : 'Contact'}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${inq.status.toLowerCase().replace(' ', '')}`}>
                                {inq.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '11px', color: '#64748b' }}>
                              {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Right Column - Lead Details */}
              <div className="inq-detail-panel">
                {!selectedInquiry ? (
                  <div className="detail-placeholder">
                    <UserCheck size={48} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
                    <h4>No Lead Selected</h4>
                    <p style={{ fontSize: '12px', marginTop: '6px' }}>Click on any lead record in the table to display full parameter breakdown and write client notes.</p>
                  </div>
                ) : (
                  <div>
                    <div className="detail-header" style={{ position: 'relative', paddingRight: '40px' }}>
                      <button
                        className="close-detail-modal-btn"
                        onClick={() => setSelectedInquiry(null)}
                        title="Close details"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '0',
                          background: 'rgba(0, 0, 0, 0.05)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#64748b',
                          transition: 'all 0.2s'
                        }}
                      >
                        <X size={16} />
                      </button>
                      <h3>{selectedInquiry.name}</h3>
                      <p>Phone: <strong>{selectedInquiry.phone}</strong> &bull; Location: <strong>{selectedInquiry.location || 'Hyderabad'}</strong></p>
                    </div>

                    <div className="detail-section-title">Lead Parameters</div>

                    <div className="detail-grid">
                      <div className="detail-item-box">
                        <span className="detail-item-label">Source Type</span>
                        <div className="detail-item-val" style={{ textTransform: 'capitalize' }}>
                          {selectedInquiry.type} Form
                        </div>
                      </div>

                      <div className="detail-item-box">
                        <span className="detail-item-label">Status</span>
                        <div>
                          <select
                            className="filter-select"
                            style={{ padding: '4px 8px', fontSize: '12px', marginTop: '4px', width: '100%' }}
                            value={selectedInquiry.status}
                            onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>

                      <div className="detail-item-box">
                        <span className="detail-item-label">Required Service</span>
                        <div className="detail-item-val">{selectedInquiry.serviceType || 'Standard Construction'}</div>
                      </div>

                      <div className="detail-item-box">
                        <span className="detail-item-label">Plot Size</span>
                        <div className="detail-item-val">{selectedInquiry.plotSize || 'Not specified'}</div>
                      </div>

                      {selectedInquiry.type === 'estimate' && (
                        <>
                          <div className="detail-item-box">
                            <span className="detail-item-label">Floors Chosen</span>
                            <div className="detail-item-val">G + {selectedInquiry.floors - 1} ({selectedInquiry.floors} Floors)</div>
                          </div>

                          <div className="detail-item-box">
                            <span className="detail-item-label">Selected Package</span>
                            <div className="detail-item-val" style={{ textTransform: 'capitalize' }}>
                              {selectedInquiry.packageType} Package
                            </div>
                          </div>

                          <div className="detail-item-box full" style={{ border: '1px solid rgba(217, 83, 30, 0.2)', background: '#fffaf8' }}>
                            <span className="detail-item-label" style={{ color: '#d9531e' }}>Calculated Cost Estimate</span>
                            <div className="detail-item-val" style={{ color: '#d9531e', fontSize: '16px' }}>
                              {selectedInquiry.estimatedCost}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="detail-item-box full">
                        <span className="detail-item-label">Client Message / Notes</span>
                        <p style={{ fontSize: '13px', lineHeight: '1.4', marginTop: '6px', color: '#475569' }}>
                          {selectedInquiry.message || 'No additional comments provided by client.'}
                        </p>
                      </div>
                    </div>

                    <div className="detail-section-title">Follow-up Notes (Internal)</div>
                    <textarea
                      className="notes-textarea"
                      rows="4"
                      placeholder="Add conversation summary, site inspection notes, client requirements, budget constraints..."
                      value={adminNotesText}
                      onChange={(e) => setAdminNotesText(e.target.value)}
                    ></textarea>

                    <div className="action-row-detail">
                      <button
                        className="btn-action-dt delete"
                        onClick={() => triggerDeleteConfirm('inquiry', selectedInquiry.id, selectedInquiry.name)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>

                      <button
                        className="btn-action-dt save"
                        onClick={() => handleSaveNotes(selectedInquiry.id)}
                      >
                        <Save size={14} /> Save Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pricing' && pricing && (
            <div className="pricing-grid-layout">
              <form onSubmit={handleSavePricing} className="pricing-manager-card">
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Construction Package Rates</h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Edit the live cost per sq.ft and summary details. Saving updates will instantly publish rates on the packages page and calculator modal.</p>
                </div>

                <div className="pricing-tiers-flex">
                  {['basic', 'premium', 'luxury'].map((tier) => {
                    const tierTitle = tier === 'basic' ? 'Standard Package' : tier === 'premium' ? 'Enhanced Package' : 'Signature Package';
                    const borderClass = tier === 'basic' ? 'basic-border' : tier === 'premium' ? 'premium-border' : 'luxury-border';
                    const titleColor = tier === 'basic' ? '#64748b' : tier === 'premium' ? '#d9531e' : '#a855f7';

                    return (
                      <div key={tier} className={`tier-edit-box ${borderClass}`}>
                        <div className="tier-title-row">
                          <span style={{ color: titleColor, fontWeight: 800, fontSize: '15px' }}>{tierTitle}</span>
                        </div>

                        <div className="tier-form-group">
                          <label>Price Num (₹ per sq.ft)</label>
                          <div className="price-input-wrapper">
                            <span>₹</span>
                            <input
                              type="number"
                              className="tier-input"
                              value={editablePricing[tier]?.priceNum || 0}
                              onChange={(e) => handlePriceFieldChange(tier, 'priceNum', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="tier-form-group">
                          <label>Package Tagline / Badge</label>
                          <input
                            type="text"
                            className="tier-input"
                            value={editablePricing[tier]?.badge || ''}
                            onChange={(e) => handlePriceFieldChange(tier, 'badge', e.target.value)}
                            placeholder="e.g. Economical & Durable / Most Popular Choice"
                          />
                        </div>

                        <div className="tier-form-group">
                          <label>Short Description</label>
                          <textarea
                            rows="3"
                            className="tier-input"
                            value={editablePricing[tier]?.desc || ''}
                            onChange={(e) => handlePriceFieldChange(tier, 'desc', e.target.value)}
                            style={{ resize: 'vertical' }}
                          ></textarea>
                        </div>

                        {/* Dynamic Heading & Points Builder */}
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <label style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                              Custom Package Headings &amp; Bullet Points
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddSection(tier)}
                              style={{
                                background: '#eff6ff',
                                color: '#2563eb',
                                border: '1px solid #bfdbfe',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Plus size={13} /> Add Heading Field
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {getTierSections(tier).map((sec, secIdx) => (
                              <div
                                key={secIdx}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '10px',
                                  padding: '12px'
                                }}
                              >
                                {/* Section Heading Row */}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                                  <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '3px' }}>
                                      Heading Field {secIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      className="tier-input"
                                      value={sec.heading || ''}
                                      onChange={(e) => handleSectionHeadingChange(tier, secIdx, e.target.value)}
                                      placeholder="e.g. Structural Warranty, Architectural Scope, Plumbing, etc."
                                      style={{ fontWeight: 700, color: '#0f172a' }}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSection(tier, secIdx)}
                                    style={{
                                      background: '#fee2e2',
                                      color: '#ef4444',
                                      border: '1px solid #fca5a5',
                                      padding: '7px 9px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      marginTop: '16px'
                                    }}
                                    title="Delete Section"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>

                                {/* Section Points */}
                                <div style={{ paddingLeft: '8px', borderLeft: '2px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                                    Points under "{sec.heading || `Heading ${secIdx + 1}`}" ({sec.points?.length || 0})
                                  </span>

                                  {(sec.points || []).map((pt, ptIdx) => (
                                    <div key={ptIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                      <input
                                        type="text"
                                        className="tier-input"
                                        value={pt}
                                        onChange={(e) => handleSectionPointChange(tier, secIdx, ptIdx, e.target.value)}
                                        placeholder="Type point to mention under this heading..."
                                        style={{ flex: 1, fontSize: '12px' }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSectionPoint(tier, secIdx, ptIdx)}
                                        style={{
                                          background: '#f1f5f9',
                                          color: '#64748b',
                                          border: '1px solid #cbd5e1',
                                          padding: '5px 7px',
                                          borderRadius: '5px',
                                          cursor: 'pointer'
                                        }}
                                        title="Remove Point"
                                      >
                                        <X size={13} />
                                      </button>
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() => handleAddSectionPoint(tier, secIdx)}
                                    style={{
                                      marginTop: '4px',
                                      background: '#ffffff',
                                      color: '#16a34a',
                                      border: '1px dashed #86efac',
                                      padding: '6px 10px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      alignSelf: 'flex-start'
                                    }}
                                  >
                                    <Plus size={13} /> Add Point under this Heading
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="save-pricing-bar">
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {saveStatus && (
                      <span style={{
                        color: saveStatus.includes('Error') ? '#ef4444' : '#22c55e',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Check size={16} /> {saveStatus}
                      </span>
                    )}
                  </div>
                  <button type="submit" className="save-pricing-btn">
                    <Save size={16} /> Save &amp; Publish Rates
                  </button>
                </div>
              </form>

              {/* Calculator Live Preview Panel */}
              <div className="calc-preview-card">
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                  Live Calculator Estimate Preview
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Verify how your updated prices impact customer calculations dynamically.
                </p>

                <div className="slider-wrapper">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span>Plot / Built-up Size</span>
                    <strong style={{ color: '#d9531e' }}>{previewPlotSize.toLocaleString()} sq.ft</strong>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="100"
                    value={previewPlotSize}
                    onChange={(e) => setPreviewPlotSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#d9531e' }}
                  />
                </div>

                <div className="preview-pricing-grid">
                  <div className="preview-box-item">
                    <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Standard Est.</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', marginTop: '4px' }}>
                      ₹{((previewPlotSize * 2 * editablePricing.basic.priceNum) * 0.95).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>G+1 (Total: {previewPlotSize * 2} sq.ft)</span>
                  </div>

                  <div className="preview-box-item popular">
                    <span style={{ fontSize: '10px', color: '#ff7e47', textTransform: 'uppercase', fontWeight: 700 }}>Enhanced Est.</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#ff7e47', marginTop: '4px' }}>
                      ₹{((previewPlotSize * 2 * editablePricing.premium.priceNum) * 0.95).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                    <span style={{ fontSize: '11px', color: '#d9531e', opacity: 0.8 }}>G+1 (Total: {previewPlotSize * 2} sq.ft)</span>
                  </div>

                  <div className="preview-box-item">
                    <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Signature Est.</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', marginTop: '4px' }}>
                      ₹{((previewPlotSize * 2 * editablePricing.luxury.priceNum) * 0.95).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>G+1 (Total: {previewPlotSize * 2} sq.ft)</span>
                  </div>
                </div>
              </div>

              {/* Package Comparison Matrix Table Editor */}
              <div style={{ marginTop: '32px', background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Features &amp; Specifications Comparison Matrix</h3>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>Dynamically edit the comparison matrix displayed on the frontend pricing page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMatrixRow}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} /> Add Specification Row
                  </button>
                </div>

                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', textTransform: 'uppercase', fontSize: '11px', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '12px', textAlign: 'left', minWidth: '200px' }}>Features &amp; Specifications</th>
                        <th style={{ padding: '12px', textAlign: 'left', minWidth: '160px' }}>Standard Package</th>
                        <th style={{ padding: '12px', textAlign: 'left', minWidth: '160px' }}>Enhanced Package</th>
                        <th style={{ padding: '12px', textAlign: 'left', minWidth: '160px' }}>Signature Package</th>
                        <th style={{ padding: '12px', width: '60px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packageMatrix.map((row, idx) => (
                        <tr key={row.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px' }}>
                            <input
                              type="text"
                              value={row.feature || ''}
                              onChange={(e) => handleMatrixCellChange(idx, 'feature', e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                            />
                          </td>
                          <td style={{ padding: '8px' }}>
                            <input
                              type="text"
                              value={row.basic || ''}
                              onChange={(e) => handleMatrixCellChange(idx, 'basic', e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            />
                          </td>
                          <td style={{ padding: '8px' }}>
                            <input
                              type="text"
                              value={row.premium || ''}
                              onChange={(e) => handleMatrixCellChange(idx, 'premium', e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            />
                          </td>
                          <td style={{ padding: '8px' }}>
                            <input
                              type="text"
                              value={row.luxury || ''}
                              onChange={(e) => handleMatrixCellChange(idx, 'luxury', e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            />
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteMatrixRow(idx)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                              title="Delete Row"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleSaveMatrix}
                    style={{ background: '#d9531e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Save size={16} /> Save Matrix Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="projects-manager-section animate-fade-in" style={{ padding: '8px' }}>
              {/* Projects Visibility Control Banner */}
              <div style={{
                background: settings?.show_projects === 'true' ? '#f0fdf4' : '#fff7ed',
                border: `1px solid ${settings?.show_projects === 'true' ? '#bbf7d0' : '#fed7aa'}`,
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: settings?.show_projects === 'true' ? '#16a34a' : '#ea580c',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {settings?.show_projects === 'true' ? <Eye size={20} /> : <EyeOff size={20} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Website Projects Section:</h4>
                      <span style={{
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: settings?.show_projects === 'true' ? '#dcfce7' : '#ffedd5',
                        color: settings?.show_projects === 'true' ? '#15803d' : '#c2410c'
                      }}>
                        {settings?.show_projects === 'true' ? '🟢 VISIBLE ON WEBSITE' : '🟠 HIDDEN FROM WEBSITE'}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      {settings?.show_projects === 'true'
                        ? 'Projects gallery is currently active in the navigation menu, home page gallery, and footer.'
                        : 'Projects page and home page gallery section are currently hidden from public site visitors.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const nextVal = settings?.show_projects === 'true' ? 'false' : 'true';
                    const newSet = { ...settings, show_projects: nextVal };
                    setSettings(newSet);
                    try {
                      await updateSettings(newSet, password);
                    } catch (err) {
                      console.error('Failed to save project toggle setting:', err);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: settings?.show_projects === 'true' ? '#ea580c' : '#16a34a',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {settings?.show_projects === 'true' ? (
                    <> <EyeOff size={14} /> Hide Projects from Website </>
                  ) : (
                    <> <Eye size={14} /> Enable &amp; Show Projects on Website </>
                  )}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Portfolio Projects</h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Manage the list of construction projects displayed on the main Projects page and home portfolio gallery.</p>
                </div>
                <button
                  onClick={() => setProjectModal({
                    isOpen: true,
                    mode: 'add',
                    projectData: {
                      title: '',
                      category: 'homes',
                      categoryLabel: 'Independent Home',
                      location: '',
                      size: '',
                      duration: '',
                      image: '',
                      description: ''
                    }
                  })}
                  className="save-pricing-btn"
                  style={{ width: 'auto', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  + Add New Project
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {projects.map(project => (
                  <div key={project.id} className="detail-item-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '12px', minHeight: '380px' }}>
                    <img
                      src={resolveAssetUrl(project.image)}
                      alt={project.title}
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', background: '#f1f5f9' }}
                    />
                    <div>
                      <span className="type-badge calc" style={{ marginBottom: '4px' }}>{project.categoryLabel}</span>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{project.title}</h4>
                      <p style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', margin: '2px 0' }}>
                        <MapPin size={12} /> {project.location}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', pt: '8px', fontSize: '12px', color: '#475569' }}>
                      <span><strong>Size:</strong> {project.size}</span>
                      <span><strong>Duration:</strong> {project.duration}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                      {project.description}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button
                        onClick={() => setProjectModal({ isOpen: true, mode: 'edit', projectData: project })}
                        className="btn-action-dt"
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => triggerDeleteConfirm('project', project.id, project.title)}
                        className="btn-action-dt delete"
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #fee2e2' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="testimonials-manager-section animate-fade-in" style={{ padding: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Client Reviews</h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Manage client testimonials displayed on the website homepage.</p>
                </div>
                <button
                  onClick={() => setTestimonialModal({
                    isOpen: true,
                    mode: 'add',
                    testimonialData: {
                      name: '',
                      location: '',
                      role: '',
                      quote: '',
                      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                      rating: 5
                    }
                  })}
                  className="save-pricing-btn"
                  style={{ width: 'auto', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  + Add New Testimonial
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {testimonials.map(testimonial => (
                  <div key={testimonial.id} className="detail-item-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '12px', minHeight: '220px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img
                        src={resolveAssetUrl(testimonial.avatar)}
                        alt={testimonial.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', background: '#f1f5f9' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{testimonial.name}</h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{testimonial.role} &bull; {testimonial.location}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', margin: 0, flex: 1 }}>
                      "{testimonial.quote}"
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        onClick={() => setTestimonialModal({ isOpen: true, mode: 'edit', testimonialData: testimonial })}
                        className="btn-action-dt"
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => triggerDeleteConfirm('testimonial', testimonial.id, testimonial.name)}
                        className="btn-action-dt delete"
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #fee2e2' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="blogs-manager-section animate-fade-in" style={{ padding: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Blog Articles &amp; Hub</h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Manage construction guides, tips, and design ideas published on the Blog page.</p>
                </div>
                <button
                  onClick={() => setBlogModal({
                    isOpen: true,
                    mode: 'add',
                    blogData: {
                      title: '',
                      category: 'Construction Tips',
                      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      readTime: '5 min read',
                      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
                      excerpt: '',
                      content: '',
                      author: 'Bricks Wall Editorial'
                    }
                  })}
                  className="save-pricing-btn"
                  style={{ width: 'auto', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Add New Blog Post
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {blogs.map(blog => (
                  <div key={blog.id} className="detail-item-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '12px' }}>
                    <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
                      <img
                        src={resolveAssetUrl(blog.image)}
                        alt={blog.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#d9531e', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {blog.category}
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                        <span>{blog.date}</span>
                        <span>{blog.readTime}</span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.3 }}>{blog.title}</h4>
                      <p style={{ fontSize: '12px', color: '#475569', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {blog.excerpt || blog.content}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        onClick={() => setBlogModal({ isOpen: true, mode: 'edit', blogData: blog })}
                        className="btn-action-dt"
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => triggerDeleteConfirm('blog', blog.id, blog.title)}
                        className="btn-action-dt delete"
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #fee2e2' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="pricing-grid-layout animate-fade-in" style={{ padding: '8px' }}>
              <form onSubmit={handleSaveSettings} className="pricing-manager-card" style={{ maxWidth: '600px', margin: '0 auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Site Configuration &amp; Contact Details</h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Update contact numbers, email addresses, service areas, and operational hours dynamically across the entire website.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Primary Phone (Header, Footer, Mobile Drawer)</label>
                    <input
                      type="text"
                      required
                      value={settings.phone_primary || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone_primary: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Secondary Phone (Header &amp; Footer)</label>
                    <input
                      type="text"
                      value={settings.phone_secondary || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone_secondary: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>WhatsApp Number (Floating button &amp; Contact Page)</label>
                    <input
                      type="text"
                      required
                      value={settings.whatsapp || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={settings.email || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Service Area &amp; Office Address</label>
                    <input
                      type="text"
                      required
                      value={settings.address || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Office Hours</label>
                    <input
                      type="text"
                      required
                      value={settings.office_hours || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, office_hours: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: settings?.show_projects === 'true' ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${settings?.show_projects === 'true' ? '#bbf7d0' : '#e2e8f0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginTop: '8px'
                  }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'block' }}>
                        Projects Section Visibility
                      </label>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Show or hide the Featured Projects gallery and menu navigation links across the website.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newVal = settings?.show_projects === 'true' ? 'false' : 'true';
                        setSettings(prev => ({ ...prev, show_projects: newVal }));
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: settings?.show_projects === 'true' ? '#86efac' : '#cbd5e1',
                        background: settings?.show_projects === 'true' ? '#dcfce7' : 'white',
                        color: settings?.show_projects === 'true' ? '#15803d' : '#64748b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {settings?.show_projects === 'true' ? (
                        <> <Eye size={14} /> Visible (Click to Hide) </>
                      ) : (
                        <> <EyeOff size={14} /> Hidden (Click to Show) </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="save-pricing-bar" style={{ marginTop: '24px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {saveStatus && (
                      <span style={{
                        color: saveStatus.includes('Error') ? '#ef4444' : '#22c55e',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Check size={16} /> {saveStatus}
                      </span>
                    )}
                  </div>
                  <button type="submit" className="save-pricing-btn">
                    <Save size={16} /> Save &amp; Update Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'editorUsers' && (
            <div className="animate-fade-in" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Quotation Editor Access</h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Create logins for the staff who prepare client quotations at <strong>/editor</strong>.
                    Passwords are stored hashed and cannot be viewed later &mdash; reset one instead.
                  </p>
                </div>
              </div>

              {editorUserStatus.message && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: editorUserStatus.type === 'error' ? '#fef2f2' : '#f0fdf4',
                  border: `1px solid ${editorUserStatus.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                  color: editorUserStatus.type === 'error' ? '#b91c1c' : '#15803d'
                }}>
                  {editorUserStatus.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                  {editorUserStatus.message}
                </div>
              )}

              {/* Create user */}
              <form
                onSubmit={handleAddEditorUser}
                style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}
              >
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={17} style={{ color: '#d9531e' }} /> Add Editor User
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', alignItems: 'end' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Username</label>
                    <input
                      type="text"
                      required
                      value={newEditorUser.username}
                      onChange={(e) => setNewEditorUser(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="sales.kumar"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={newEditorUser.fullName}
                      onChange={(e) => setNewEditorUser(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Kumar Reddy"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Password</label>
                    <input
                      type="text"
                      required
                      minLength={6}
                      value={newEditorUser.password}
                      onChange={(e) => setNewEditorUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d9531e', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
                  >
                    <Plus size={15} /> Create User
                  </button>
                </div>
                <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '12px' }}>
                  Usernames may use letters, numbers, dot, underscore or hyphen. Share the password with the user directly &mdash; it is not recoverable from here.
                </p>
              </form>

              {/* User list */}
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={17} style={{ color: '#d9531e' }} /> Existing Users ({editorUsers.length})
                </h4>

                {editorUsers.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#94a3b8', padding: '20px 0', textAlign: 'center' }}>
                    No editor users yet. Create one above to grant access to /editor.
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>User</th>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>Last Login</th>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editorUsers.map(user => (
                          <React.Fragment key={user.id}>
                            <tr>
                              <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{user.full_name}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>@{user.username}</div>
                              </td>
                              <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: user.is_active ? '#f0fdf4' : '#f1f5f9',
                                  color: user.is_active ? '#15803d' : '#64748b'
                                }}>
                                  {user.is_active ? 'Active' : 'Deactivated'}
                                </span>
                                {user.activeSessions > 0 && (
                                  <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>
                                    {user.activeSessions} signed in
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '12px' }}>
                                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-IN') : 'Never'}
                              </td>
                              <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedEditorId(expandedEditorId === user.id ? null : user.id)}
                                    title="View quotations generated by this editor"
                                    style={{
                                      padding: '6px 11px',
                                      borderRadius: '7px',
                                      border: '1px solid #dbeafe',
                                      background: expandedEditorId === user.id ? '#dbeafe' : '#eff6ff',
                                      color: '#1d4ed8',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                  >
                                    <FileText size={13} />
                                    {user.totalQuotations || 0} Quotations
                                    {expandedEditorId === user.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleResetEditorPassword(user)}
                                    title="Reset password"
                                    style={{ padding: '6px 11px', borderRadius: '7px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                  >
                                    <KeyRound size={13} /> Reset
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleEditorUser(user)}
                                    title={user.is_active ? 'Deactivate user' : 'Reactivate user'}
                                    style={{ padding: '6px 11px', borderRadius: '7px', border: '1px solid #cbd5e1', background: 'white', color: user.is_active ? '#b45309' : '#15803d', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                  >
                                    <Power size={13} /> {user.is_active ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEditorUser(user)}
                                    title="Delete user"
                                    style={{ padding: '6px 11px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                  >
                                    <Trash2 size={13} /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expandedEditorId === user.id && (
                              <tr key={`quotes-${user.id}`}>
                                <td colSpan={4} style={{ padding: '0 8px 16px 8px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                  <div style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #cbd5e1', marginTop: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                      <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                                        <FileText size={15} style={{ color: '#d9531e' }} />
                                        Quotations Generated by {user.full_name} ({editorQuotations.filter(q => q.editor_user_id === user.id).length})
                                      </h5>
                                    </div>

                                    {editorQuotations.filter(q => q.editor_user_id === user.id).length === 0 ? (
                                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>
                                        No quotations generated yet by {user.full_name}.
                                      </p>
                                    ) : (
                                      <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                          <thead>
                                            <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                                              <th style={{ padding: '8px 10px' }}>Quote #</th>
                                              <th style={{ padding: '8px 10px' }}>Client</th>
                                              <th style={{ padding: '8px 10px' }}>Site Location</th>
                                              <th style={{ padding: '8px 10px' }}>Package &amp; Rate</th>
                                              <th style={{ padding: '8px 10px' }}>Built-up Area</th>
                                              <th style={{ padding: '8px 10px' }}>Grand Total</th>
                                              <th style={{ padding: '8px 10px' }}>Date</th>
                                              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Action</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {editorQuotations
                                              .filter(q => q.editor_user_id === user.id)
                                              .map(q => (
                                                <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{q.quote_number}</td>
                                                  <td style={{ padding: '8px 10px' }}>
                                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{q.client_name}</div>
                                                    {(q.client_phone || q.client_email) && (
                                                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                        {[q.client_phone, q.client_email].filter(Boolean).join(' | ')}
                                                      </div>
                                                    )}
                                                  </td>
                                                  <td style={{ padding: '8px 10px', color: '#475569' }}>{q.site_location || '—'}</td>
                                                  <td style={{ padding: '8px 10px' }}>
                                                    <span style={{ fontWeight: 600, color: '#d9531e' }}>{q.package_name}</span>
                                                    {q.quoted_rate > 0 && <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>₹{Number(q.quoted_rate).toLocaleString('en-IN')}/sq.ft</span>}
                                                  </td>
                                                  <td style={{ padding: '8px 10px', color: '#475569' }}>{Number(q.total_area).toLocaleString('en-IN')} sq.ft</td>
                                                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#16a34a' }}>
                                                    ₹{Number(q.grand_total).toLocaleString('en-IN')}
                                                  </td>
                                                  <td style={{ padding: '8px 10px', color: '#64748b', fontSize: '11px' }}>
                                                    {q.created_at ? new Date(q.created_at).toLocaleString('en-IN') : '—'}
                                                  </td>
                                                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                                                    <button
                                                      type="button"
                                                      onClick={() => handleDeleteQuotationLog(q.id)}
                                                      title="Delete this quotation record"
                                                      style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                                    >
                                                      <Trash2 size={12} />
                                                    </button>
                                                  </td>
                                                </tr>
                                              ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* All Generated Quotations Audit Log */}
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={17} style={{ color: '#d9531e' }} /> All Generated Quotations Log ({editorQuotations.length})
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                  Recent quotations created by all staff editors via <strong>/editor</strong>.
                </p>

                {editorQuotations.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
                    No quotations recorded yet. Whenever an editor generates a quotation, its basic details will automatically appear here.
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>Editor</th>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>Quote #</th>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>Client</th>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>Package &amp; Rate</th>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>Built-up Area</th>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>Grand Total</th>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                          <th style={{ padding: '10px 8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editorQuotations.map(q => (
                          <tr key={q.id}>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{q.editor_name || 'Editor'}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>@{q.editor_username}</div>
                            </td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#0f172a' }}>
                              {q.quote_number}
                            </td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{q.client_name}</div>
                              {(q.client_phone || q.client_email) && (
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {[q.client_phone, q.client_email].filter(Boolean).join(' | ')}
                                </div>
                              )}
                              {q.site_location && (
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>📍 {q.site_location}</div>
                              )}
                            </td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>
                              <span style={{ fontWeight: 600, color: '#d9531e' }}>{q.package_name}</span>
                              {q.quoted_rate > 0 && <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>₹{Number(q.quoted_rate).toLocaleString('en-IN')}/sq.ft</span>}
                            </td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>
                              {Number(q.total_area).toLocaleString('en-IN')} sq.ft
                            </td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#16a34a' }}>
                              ₹{Number(q.grand_total).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '12px' }}>
                              {q.created_at ? new Date(q.created_at).toLocaleString('en-IN') : '—'}
                            </td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuotationLog(q.id)}
                                title="Delete quotation log"
                                style={{ padding: '6px 11px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Deletion Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              marginBottom: '16px'
            }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Confirm Deletion
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete <strong>{deleteConfirmModal.targetTitle}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: '', targetId: '', targetTitle: '' })}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Add/Edit Modal */}
      {projectModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {projectModal.mode === 'add' ? 'Add New Portfolio Project' : 'Edit Portfolio Project'}
              </h3>
              <button
                onClick={() => setProjectModal({ isOpen: false, mode: 'add', projectData: {} })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Project Title</label>
                  <input
                    type="text"
                    required
                    value={projectModal.projectData.title || ''}
                    onChange={(e) => setProjectModal(prev => ({ ...prev, projectData: { ...prev.projectData, title: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Category Key (e.g. villa, homes, commercial)</label>
                  <select
                    value={projectModal.projectData.category || 'homes'}
                    onChange={(e) => setProjectModal(prev => ({ ...prev, projectData: { ...prev.projectData, category: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="homes">Independent Homes (homes)</option>
                    <option value="villa">Luxury Villas (villa)</option>
                    <option value="commercial">Commercial Building (commercial)</option>
                    <option value="school">Educational Institution (school)</option>
                    <option value="renovation">Renovation & Remodeling (renovation)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Category Label (e.g. Luxury Villa, Independent Home)</label>
                  <input
                    type="text"
                    required
                    value={projectModal.projectData.categoryLabel || ''}
                    onChange={(e) => setProjectModal(prev => ({ ...prev, projectData: { ...prev.projectData, categoryLabel: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Location (e.g. Jubilee Hills, Hyderabad)</label>
                  <input
                    type="text"
                    required
                    value={projectModal.projectData.location || ''}
                    onChange={(e) => setProjectModal(prev => ({ ...prev, projectData: { ...prev.projectData, location: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Built-up Size (e.g. 5,500 sq.ft)</label>
                  <input
                    type="text"
                    required
                    value={projectModal.projectData.size || ''}
                    onChange={(e) => setProjectModal(prev => ({ ...prev, projectData: { ...prev.projectData, size: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Duration (e.g. 11 Months)</label>
                  <input
                    type="text"
                    required
                    value={projectModal.projectData.duration || ''}
                    onChange={(e) => setProjectModal(prev => ({ ...prev, projectData: { ...prev.projectData, duration: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Project Image (Upload File or Enter URL)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    value={projectModal.projectData.image || ''}
                    onChange={(e) => setProjectModal(prev => ({ ...prev, projectData: { ...prev.projectData, image: e.target.value } }))}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <label style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}>
                    <Upload size={14} /> Upload File
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (uploadedUrl) => {
                            setProjectModal(prev => ({ ...prev, projectData: { ...prev.projectData, image: uploadedUrl } }));
                          });
                        }
                      }}
                    />
                  </label>
                </div>
                {projectModal.projectData.image && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={resolveAssetUrl(projectModal.projectData.image)} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Image Preview</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows="3"
                  required
                  value={projectModal.projectData.description || ''}
                  onChange={(e) => setProjectModal(prev => ({ ...prev, projectData: { ...prev.projectData, description: e.target.value } }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'none' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setProjectModal({ isOpen: false, mode: 'add', projectData: {} })}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d9531e', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  {projectModal.mode === 'add' ? 'Add Project' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Add/Edit Modal */}
      {testimonialModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {testimonialModal.mode === 'add' ? 'Add New Testimonial' : 'Edit Testimonial'}
              </h3>
              <button
                onClick={() => setTestimonialModal({ isOpen: false, mode: 'add', testimonialData: {} })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTestimonialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Client Name</label>
                  <input
                    type="text"
                    required
                    value={testimonialModal.testimonialData.name || ''}
                    onChange={(e) => setTestimonialModal(prev => ({ ...prev, testimonialData: { ...prev.testimonialData, name: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Location (e.g. Jubilee Hills, Hyd)</label>
                  <input
                    type="text"
                    required
                    value={testimonialModal.testimonialData.location || ''}
                    onChange={(e) => setTestimonialModal(prev => ({ ...prev, testimonialData: { ...prev.testimonialData, location: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Role / Tagline (e.g. Villa Owner, Homeowner)</label>
                  <input
                    type="text"
                    required
                    value={testimonialModal.testimonialData.role || ''}
                    onChange={(e) => setTestimonialModal(prev => ({ ...prev, testimonialData: { ...prev.testimonialData, role: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Rating (1-5)</label>
                  <select
                    value={testimonialModal.testimonialData.rating || 5}
                    onChange={(e) => setTestimonialModal(prev => ({ ...prev, testimonialData: { ...prev.testimonialData, rating: Number(e.target.value) } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Avatar Image (Upload File or Enter URL)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    value={testimonialModal.testimonialData.avatar || ''}
                    onChange={(e) => setTestimonialModal(prev => ({ ...prev, testimonialData: { ...prev.testimonialData, avatar: e.target.value } }))}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <label style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}>
                    <Upload size={14} /> Upload File
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (uploadedUrl) => {
                            setTestimonialModal(prev => ({ ...prev, testimonialData: { ...prev.testimonialData, avatar: uploadedUrl } }));
                          });
                        }
                      }}
                    />
                  </label>
                </div>
                {testimonialModal.testimonialData.avatar && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={resolveAssetUrl(testimonialModal.testimonialData.avatar)} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', border: '1px solid #cbd5e1' }} />
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Avatar Preview</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Client Quote</label>
                <textarea
                  rows="3"
                  required
                  value={testimonialModal.testimonialData.quote || ''}
                  onChange={(e) => setTestimonialModal(prev => ({ ...prev, testimonialData: { ...prev.testimonialData, quote: e.target.value } }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'none' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setTestimonialModal({ isOpen: false, mode: 'add', testimonialData: {} })}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d9531e', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  {testimonialModal.mode === 'add' ? 'Add Testimonial' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Article Add/Edit Modal */}
      {blogModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {blogModal.mode === 'add' ? 'Add New Blog Post' : 'Edit Blog Post'}
              </h3>
              <button
                onClick={() => setBlogModal({ isOpen: false, mode: 'add', blogData: {} })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBlogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Article Title</label>
                <input
                  type="text"
                  required
                  value={blogModal.blogData.title || ''}
                  onChange={(e) => setBlogModal(prev => ({ ...prev, blogData: { ...prev.blogData, title: e.target.value } }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cost Guides"
                    value={blogModal.blogData.category || ''}
                    onChange={(e) => setBlogModal(prev => ({ ...prev, blogData: { ...prev.blogData, category: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Author</label>
                  <input
                    type="text"
                    required
                    value={blogModal.blogData.author || ''}
                    onChange={(e) => setBlogModal(prev => ({ ...prev, blogData: { ...prev.blogData, author: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Read Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 min read"
                    value={blogModal.blogData.readTime || ''}
                    onChange={(e) => setBlogModal(prev => ({ ...prev, blogData: { ...prev.blogData, readTime: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Cover Image (Upload File or Enter URL)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    value={blogModal.blogData.image || ''}
                    onChange={(e) => setBlogModal(prev => ({ ...prev, blogData: { ...prev.blogData, image: e.target.value } }))}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <label style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}>
                    <Upload size={14} /> Upload File
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (uploadedUrl) => {
                            setBlogModal(prev => ({ ...prev, blogData: { ...prev.blogData, image: uploadedUrl } }));
                          });
                        }
                      }}
                    />
                  </label>
                </div>
                {blogModal.blogData.image && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={resolveAssetUrl(blogModal.blogData.image)} alt="Preview" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Image Preview</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Short Summary / Excerpt</label>
                <input
                  type="text"
                  required
                  placeholder="Brief 1-2 sentence preview..."
                  value={blogModal.blogData.excerpt || ''}
                  onChange={(e) => setBlogModal(prev => ({ ...prev, blogData: { ...prev.blogData, excerpt: e.target.value } }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Full Article Content</label>
                <textarea
                  rows="6"
                  required
                  placeholder="Write full article body text..."
                  value={blogModal.blogData.content || ''}
                  onChange={(e) => setBlogModal(prev => ({ ...prev, blogData: { ...prev.blogData, content: e.target.value } }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setBlogModal({ isOpen: false, mode: 'add', blogData: {} })}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d9531e', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  {blogModal.mode === 'add' ? 'Publish Article' : 'Save Article Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
