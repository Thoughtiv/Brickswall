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
  UserCheck, 
  FileText,
  LogOut,
  ChevronRight,
  TrendingUp,
  MapPin,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { getInquiries, updateInquiry, deleteInquiry, getPricing, updatePricing } from '../utils/api';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('inquiries');
  
  // Data States
  const [inquiries, setInquiries] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  
  // Selected Inquiry for details panel
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminNotesText, setAdminNotesText] = useState('');
  const [inquiryToDelete, setInquiryToDelete] = useState(null);

  // Editable pricing data state
  const [editablePricing, setEditablePricing] = useState({
    basic: { name: '', priceNum: 0, badge: '', desc: '' },
    premium: { name: '', priceNum: 0, badge: '', desc: '' },
    luxury: { name: '', priceNum: 0, badge: '', desc: '' }
  });

  // Calculator preview plot size
  const [previewPlotSize, setPreviewPlotSize] = useState(1500);

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
      
      // Also fetch pricing
      const pricingData = await getPricing();
      setPricing(pricingData);
      setEditablePricing(pricingData);
    } catch (err) {
      setLoginError(err.message || 'Invalid admin credentials');
      localStorage.removeItem('bw_admin_pwd');
    } finally {
      setIsLoading(false);
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

  const handleDeleteInquiryClick = (id) => {
    const inq = inquiries.find(item => Number(item.id) === Number(id));
    if (inq) {
      setInquiryToDelete(inq);
    }
  };

  const executeDeleteInquiry = async (id) => {
    try {
      await deleteInquiry(id, password);
      setInquiries(prev => prev.filter(inq => Number(inq.id) !== Number(id)));
      if (selectedInquiry && Number(selectedInquiry.id) === Number(id)) {
        setSelectedInquiry(null);
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
    
    let popularPkg = 'Premium Package';
    let maxCount = packagesCount.premium;
    if (packagesCount.luxury > maxCount) {
      popularPkg = 'Luxury Package';
      maxCount = packagesCount.luxury;
    }
    if (packagesCount.basic > maxCount) {
      popularPkg = 'Basic Package';
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

        /* Custom Deletion Confirmation Modal CSS */
        .custom-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6) !important;
          backdrop-filter: blur(8px) !important;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000 !important;
          padding: 20px;
          animation: modalFadeIn 0.2s ease-out;
        }
        
        .custom-modal-card {
          background: white !important;
          border-radius: 16px !important;
          width: 100%;
          max-width: 400px;
          padding: 28px !important;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border: 1px solid #e2e8f0 !important;
          animation: modalScaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .custom-modal-icon {
          width: 56px;
          height: 56px;
          background: #fee2e2 !important;
          color: #ef4444 !important;
          border-radius: 50% !important;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        
        .custom-modal-card h3 {
          font-size: 18px !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          margin: 0 0 8px 0 !important;
        }
        
        .custom-modal-card p {
          font-size: 13px !important;
          color: #64748b !important;
          line-height: 1.5 !important;
          margin: 0 0 24px 0 !important;
        }
        
        .custom-modal-actions {
          display: flex;
          gap: 12px;
        }
        
        .modal-btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        
        .modal-btn.cancel {
          background: #f1f5f9 !important;
          color: #64748b !important;
          border: 1px solid #e2e8f0 !important;
        }
        
        .modal-btn.cancel:hover {
          background: #e2e8f0 !important;
          color: #0f172a !important;
        }
        
        .modal-btn.confirm {
          background: #ef4444 !important;
          color: white !important;
          box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2) !important;
        }
        
        .modal-btn.confirm:hover {
          background: #dc2626 !important;
          box-shadow: 0 4px 12px -1px rgba(220, 38, 38, 0.3) !important;
        }
        
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalScaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
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
        <div className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            Leads &amp; Inquiries ({filteredInquiries.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            Construction Cost Pricing
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
                        onClick={() => handleDeleteInquiryClick(selectedInquiry.id)}
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
                  {/* Basic Tier */}
                  <div className="tier-edit-box basic-border">
                    <div className="tier-title-row">
                      <span style={{ color: '#64748b' }}>Basic Package</span>
                    </div>

                    <div className="tier-form-group">
                      <label>Price Num (₹ per sq.ft)</label>
                      <div className="price-input-wrapper">
                        <span>₹</span>
                        <input 
                          type="number" 
                          className="tier-input" 
                          value={editablePricing.basic.priceNum}
                          onChange={(e) => handlePriceFieldChange('basic', 'priceNum', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="tier-form-group">
                      <label>Package Tagline / Badge</label>
                      <input 
                        type="text" 
                        className="tier-input" 
                        value={editablePricing.basic.badge}
                        onChange={(e) => handlePriceFieldChange('basic', 'badge', e.target.value)}
                      />
                    </div>

                    <div className="tier-form-group">
                      <label>Short Description</label>
                      <textarea 
                        rows="3"
                        className="tier-input" 
                        value={editablePricing.basic.desc}
                        onChange={(e) => handlePriceFieldChange('basic', 'desc', e.target.value)}
                        style={{ resize: 'none' }}
                      ></textarea>
                    </div>
                  </div>

                  {/* Premium Tier */}
                  <div className="tier-edit-box premium-border">
                    <div className="tier-title-row">
                      <span style={{ color: '#d9531e' }}>Premium Package</span>
                    </div>

                    <div className="tier-form-group">
                      <label>Price Num (₹ per sq.ft)</label>
                      <div className="price-input-wrapper">
                        <span>₹</span>
                        <input 
                          type="number" 
                          className="tier-input" 
                          value={editablePricing.premium.priceNum}
                          onChange={(e) => handlePriceFieldChange('premium', 'priceNum', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="tier-form-group">
                      <label>Package Tagline / Badge</label>
                      <input 
                        type="text" 
                        className="tier-input" 
                        value={editablePricing.premium.badge}
                        onChange={(e) => handlePriceFieldChange('premium', 'badge', e.target.value)}
                      />
                    </div>

                    <div className="tier-form-group">
                      <label>Short Description</label>
                      <textarea 
                        rows="3"
                        className="tier-input" 
                        value={editablePricing.premium.desc}
                        onChange={(e) => handlePriceFieldChange('premium', 'desc', e.target.value)}
                        style={{ resize: 'none' }}
                      ></textarea>
                    </div>
                  </div>

                  {/* Luxury Tier */}
                  <div className="tier-edit-box luxury-border">
                    <div className="tier-title-row">
                      <span style={{ color: '#a855f7' }}>Luxury Package</span>
                    </div>

                    <div className="tier-form-group">
                      <label>Price Num (₹ per sq.ft)</label>
                      <div className="price-input-wrapper">
                        <span>₹</span>
                        <input 
                          type="number" 
                          className="tier-input" 
                          value={editablePricing.luxury.priceNum}
                          onChange={(e) => handlePriceFieldChange('luxury', 'priceNum', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="tier-form-group">
                      <label>Package Tagline / Badge</label>
                      <input 
                        type="text" 
                        className="tier-input" 
                        value={editablePricing.luxury.badge}
                        onChange={(e) => handlePriceFieldChange('luxury', 'badge', e.target.value)}
                      />
                    </div>

                    <div className="tier-form-group">
                      <label>Short Description</label>
                      <textarea 
                        rows="3"
                        className="tier-input" 
                        value={editablePricing.luxury.desc}
                        onChange={(e) => handlePriceFieldChange('luxury', 'desc', e.target.value)}
                        style={{ resize: 'none' }}
                      ></textarea>
                    </div>
                  </div>
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
                    <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Basic Est.</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', marginTop: '4px' }}>
                      ₹{((previewPlotSize * 2 * editablePricing.basic.priceNum) * 0.95).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>G+1 (Total: {previewPlotSize * 2} sq.ft)</span>
                  </div>

                  <div className="preview-box-item popular">
                    <span style={{ fontSize: '10px', color: '#ff7e47', textTransform: 'uppercase', fontWeight: 700 }}>Premium Est.</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#ff7e47', marginTop: '4px' }}>
                      ₹{((previewPlotSize * 2 * editablePricing.premium.priceNum) * 0.95).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                    <span style={{ fontSize: '11px', color: '#d9531e', opacity: 0.8 }}>G+1 (Total: {previewPlotSize * 2} sq.ft)</span>
                  </div>

                  <div className="preview-box-item">
                    <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Luxury Est.</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', marginTop: '4px' }}>
                      ₹{((previewPlotSize * 2 * editablePricing.luxury.priceNum) * 0.95).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>G+1 (Total: {previewPlotSize * 2} sq.ft)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Custom Deletion Confirmation Modal */}
      {inquiryToDelete && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <div className="custom-modal-icon">
              <AlertCircle size={28} />
            </div>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete the inquiry from <strong>{inquiryToDelete.name}</strong> permanently? This action cannot be undone.</p>
            <div className="custom-modal-actions">
              <button className="modal-btn cancel" onClick={() => setInquiryToDelete(null)}>
                Cancel
              </button>
              <button 
                className="modal-btn confirm" 
                onClick={async () => {
                  const id = inquiryToDelete.id;
                  setInquiryToDelete(null);
                  await executeDeleteInquiry(id);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
