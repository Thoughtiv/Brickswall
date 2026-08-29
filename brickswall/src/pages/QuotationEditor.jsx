import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Lock, User, LogOut, FileText, Plus, Trash2, Download, Check,
  AlertCircle, Loader2, RotateCcw, Eye, PencilLine, Building2
} from 'lucide-react';
import QuotationPreview from '../components/QuotationPreview';
import {
  getPricing, getPackageMatrix, getSettings,
  editorLogin, editorLogout, editorMe, saveEditorQuotation
} from '../utils/api';
import {
  createInitialForm, computeTotals, specsFromMatrix, emptyFloor, emptyLineItem,
  defaultMilestones, defaultTerms, formatINR, formatNumber,
  toNumber, nextRowId, LINE_ITEM_PRESETS
} from '../utils/quotation';
import { generateQuotationPdf } from '../utils/quotationPdf';
import '../styles/quotation.css';

const TOKEN_KEY = 'bw_editor_token';

/* ────────────────────────── Login screen ────────────────────────── */

const EditorLogin = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter both username and password');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await editorLogin(username.trim(), password);
      localStorage.setItem(TOKEN_KEY, data.token);
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="qe-login-page">
      <form className="qe-login-card" onSubmit={handleSubmit}>
        <div className="qe-login-icon"><Lock size={22} /></div>
        <h1>Quotation Editor</h1>
        <p>Sign in with the credentials issued by your administrator.</p>

        {error && (
          <div className="qe-alert qe-alert-error">
            <AlertCircle size={15} /> <span>{error}</span>
          </div>
        )}

        <label className="qe-field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your.username"
          />
        </label>

        <label className="qe-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" className="qe-btn qe-btn-primary qe-btn-block" disabled={isLoading}>
          {isLoading ? <><Loader2 size={16} className="qe-spin" /> Signing in…</> : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

/* ────────────────────────── Editor ────────────────────────── */

const QuotationEditor = () => {
  // 'checking' only when a stored token still needs validating against the server
  const [authState, setAuthState] = useState(
    () => (localStorage.getItem(TOKEN_KEY) ? 'checking' : 'out')
  );
  const [user, setUser] = useState(null);

  const [form, setForm] = useState(createInitialForm);
  const [pricing, setPricing] = useState(null);
  const [matrix, setMatrix] = useState([]);
  const [settings, setSettings] = useState({});
  const [errors, setErrors] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [mobileView, setMobileView] = useState('form');

  /* Restore an existing session on load */
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setAuthState('out');
      return;
    }
    editorMe(token)
      .then(data => {
        setUser(data.user);
        setAuthState('in');
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthState('out');
      });
  }, []);

  /* Load pricing, comparison matrix and company settings once signed in */
  useEffect(() => {
    if (authState !== 'in') return;
    let active = true;

    getPricing().then(data => { if (active) setPricing(data); });
    getPackageMatrix().then(data => {
      if (active && Array.isArray(data)) setMatrix(data);
    });
    getSettings().then(data => { if (active && data) setSettings(data); });

    return () => { active = false; };
  }, [authState]);

  /* Quotations are not saved anywhere, so warn before a refresh discards work */
  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const totals = useMemo(() => computeTotals(form), [form]);

  const update = useCallback((patch) => {
    setForm(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
    setIsReady(false);
  }, []);

  const updateRow = useCallback((key, id, patch) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].map(row => (row.id === id ? { ...row, ...patch } : row))
    }));
    setIsDirty(true);
    setIsReady(false);
  }, []);

  const removeRow = useCallback((key, id) => {
    setForm(prev => ({ ...prev, [key]: prev[key].filter(row => row.id !== id) }));
    setIsDirty(true);
    setIsReady(false);
  }, []);

  const handleLogout = async () => {
    if (isDirty && !window.confirm('This quotation is not saved anywhere. Sign out and discard it?')) {
      return;
    }
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) await editorLogout(token);
    localStorage.removeItem(TOKEN_KEY);
    setIsDirty(false);
    setUser(null);
    setAuthState('out');
  };

  const packageList = useMemo(() => {
    const source = pricing || {};
    return ['basic', 'premium', 'luxury']
      .filter(id => source[id])
      .map(id => ({ id, ...source[id] }));
  }, [pricing]);

  const selectPackage = (pkg) => {
    update({
      packageId: pkg.id,
      packageName: pkg.name,
      packageDesc: pkg.desc || '',
      rate: String(pkg.priceNum || ''),
      listRate: String(pkg.priceNum || ''),
      specs: specsFromMatrix(matrix, pkg.id)
    });
  };

  const handleReset = () => {
    if (!window.confirm('Clear this quotation and start a new one?')) return;
    setForm(createInitialForm());
    setErrors([]);
    setIsReady(false);
    setIsDirty(false);
  };

  const validate = () => {
    const found = [];
    if (!form.clientName.trim()) found.push('Client name is required.');
    if (!form.packageId) found.push('Select a package type.');
    if (toNumber(form.rate) <= 0) found.push('Enter a rate per sq.ft greater than zero.');
    if (totals.totalArea <= 0) found.push('Enter the built-up area for at least one floor.');
    if (!form.quoteNumber.trim()) found.push('Quotation number is required.');
    if (totals.milestones.length > 0 && Math.round(totals.milestoneTotalPercent) !== 100) {
      found.push(`Payment milestones total ${totals.milestoneTotalPercent}% — they must add up to 100%.`);
    }
    return found;
  };

  const handleGenerate = async () => {
    const found = validate();
    setErrors(found);
    if (found.length === 0) {
      setIsReady(true);
      setMobileView('preview');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Save quotation basic info under the logged-in editor account
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          await saveEditorQuotation(token, {
            quoteNumber: form.quoteNumber,
            clientName: form.clientName,
            clientPhone: form.clientPhone,
            clientEmail: form.clientEmail,
            siteLocation: form.siteLocation,
            packageName: form.packageName || form.packageId,
            totalArea: totals.totalArea,
            quotedRate: totals.rate,
            grandTotal: totals.grandTotal
          });
        } catch (saveErr) {
          console.warn('Could not record quotation log:', saveErr.message);
        }
      }
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await generateQuotationPdf(form, settings);
    } catch (err) {
      console.error('PDF export failed:', err);
      setErrors([`Could not generate the PDF: ${err.message}`]);
    } finally {
      setIsExporting(false);
    }
  };

  if (authState === 'checking') {
    return (
      <div className="qe-login-page">
        <div className="qe-checking"><Loader2 size={26} className="qe-spin" /></div>
      </div>
    );
  }

  if (authState === 'out') {
    return <EditorLogin onAuthenticated={(u) => { setUser(u); setAuthState('in'); }} />;
  }

  const milestoneWarning =
    totals.milestones.length > 0 && Math.round(totals.milestoneTotalPercent) !== 100;

  return (
    <div className="qe-page">
      {/* Toolbar */}
      <header className="qe-toolbar">
        <div className="qe-toolbar-left">
          <FileText size={19} />
          <div>
            <strong>Quotation Editor</strong>
            <span>Bricks Wall Construction Co.</span>
          </div>
        </div>

        <div className="qe-toolbar-right">
          <div className="qe-mobile-switch">
            <button
              type="button"
              className={mobileView === 'form' ? 'active' : ''}
              onClick={() => setMobileView('form')}
            >
              <PencilLine size={14} /> Form
            </button>
            <button
              type="button"
              className={mobileView === 'preview' ? 'active' : ''}
              onClick={() => setMobileView('preview')}
            >
              <Eye size={14} /> Preview
            </button>
          </div>

          <span className="qe-user"><User size={14} /> {user?.fullName || user?.username}</span>
          <button type="button" className="qe-btn qe-btn-ghost" onClick={handleReset}>
            <RotateCcw size={14} /> New
          </button>
          <button type="button" className="qe-btn qe-btn-ghost" onClick={handleLogout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <div className="qe-layout">
        {/* ───────────── Form pane ───────────── */}
        <div className={`qe-form-pane ${mobileView === 'form' ? 'is-visible' : ''}`}>

          {/* 1. Client details */}
          <section className="qe-card">
            <h2><span className="qe-step">1</span> Client &amp; Quotation Details</h2>
            <div className="qe-grid-2">
              <label className="qe-field">
                <span>Client Name *</span>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => update({ clientName: e.target.value })}
                  placeholder="Mr. Ramesh Reddy"
                />
              </label>
              <label className="qe-field">
                <span>Phone</span>
                <input
                  type="tel"
                  value={form.clientPhone}
                  onChange={(e) => update({ clientPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </label>
              <label className="qe-field">
                <span>Email</span>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => update({ clientEmail: e.target.value })}
                  placeholder="client@example.com"
                />
              </label>
              <label className="qe-field">
                <span>Site Location</span>
                <input
                  type="text"
                  value={form.siteLocation}
                  onChange={(e) => update({ siteLocation: e.target.value })}
                  placeholder="Kondapur, Hyderabad"
                />
              </label>
              <label className="qe-field">
                <span>Quotation No.</span>
                <input
                  type="text"
                  value={form.quoteNumber}
                  onChange={(e) => update({ quoteNumber: e.target.value })}
                />
              </label>
              <label className="qe-field">
                <span>Date</span>
                <input
                  type="date"
                  value={form.quoteDate}
                  onChange={(e) => update({ quoteDate: e.target.value })}
                />
              </label>
              <label className="qe-field">
                <span>Valid Until</span>
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => update({ validUntil: e.target.value })}
                />
              </label>
            </div>
          </section>

          {/* 2. Package */}
          <section className="qe-card">
            <h2><span className="qe-step">2</span> Package Type</h2>
            {packageList.length === 0 ? (
              <p className="qe-muted"><Loader2 size={14} className="qe-spin" /> Loading packages…</p>
            ) : (
              <div className="qe-pkg-grid">
                {packageList.map(pkg => (
                  <button
                    type="button"
                    key={pkg.id}
                    className={`qe-pkg-card ${form.packageId === pkg.id ? 'selected' : ''}`}
                    onClick={() => selectPackage(pkg)}
                  >
                    {form.packageId === pkg.id && <span className="qe-pkg-check"><Check size={13} /></span>}
                    <span className="qe-pkg-badge">{pkg.badge}</span>
                    <strong>{pkg.name}</strong>
                    <span className="qe-pkg-price">{formatINR(pkg.priceNum)} <small>/ sq.ft</small></span>
                    <span className="qe-pkg-desc">{pkg.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* 3. Rate */}
          <section className="qe-card">
            <h2><span className="qe-step">3</span> Rate for This Client</h2>
            <p className="qe-hint">
              Prefilled from the selected package. Edit it freely to quote a negotiated rate.
            </p>
            <div className="qe-grid-2">
              <label className="qe-field">
                <span>Quoted Rate (₹ per sq.ft) *</span>
                <input
                  type="number"
                  min="0"
                  value={form.rate}
                  onChange={(e) => update({ rate: e.target.value })}
                  placeholder="2150"
                />
              </label>
              <label className="qe-field">
                <span>List Rate (for reference)</span>
                <input
                  type="number"
                  min="0"
                  value={form.listRate}
                  onChange={(e) => update({ listRate: e.target.value })}
                  placeholder="2150"
                />
              </label>
            </div>
            {totals.listRate > 0 && totals.rate > 0 && (
              <div className={`qe-rate-delta ${totals.rateDelta < 0 ? 'down' : totals.rateDelta > 0 ? 'up' : ''}`}>
                List {formatINR(totals.listRate)} · Quoted <strong>{formatINR(totals.rate)}</strong>
                {totals.rateDelta !== 0 && (
                  <> · {totals.rateDelta < 0 ? '−' : '+'}{formatINR(Math.abs(totals.rateDelta))} per sq.ft
                    {' '}({((totals.rateDelta / totals.listRate) * 100).toFixed(1)}%)</>
                )}
              </div>
            )}
          </section>

          {/* 4. Area */}
          <section className="qe-card">
            <h2><span className="qe-step">4</span> Built-up Area</h2>
            <div className="qe-rows">
              {form.floors.map((floor) => (
                <div className="qe-row" key={floor.id}>
                  <input
                    type="text"
                    className="qe-row-grow"
                    value={floor.label}
                    onChange={(e) => updateRow('floors', floor.id, { label: e.target.value })}
                    placeholder="Floor name"
                  />
                  <input
                    type="number"
                    min="0"
                    className="qe-row-num"
                    value={floor.area}
                    onChange={(e) => updateRow('floors', floor.id, { area: e.target.value })}
                    placeholder="sq.ft"
                  />
                  <span className="qe-row-amt">{formatINR(toNumber(floor.area) * totals.rate)}</span>
                  <button
                    type="button"
                    className="qe-icon-btn"
                    onClick={() => removeRow('floors', floor.id)}
                    disabled={form.floors.length === 1}
                    aria-label="Remove floor"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="qe-btn qe-btn-outline"
              onClick={() => update({ floors: [...form.floors, emptyFloor(form.floors.length)] })}
            >
              <Plus size={14} /> Add Floor
            </button>
            <div className="qe-summary-strip">
              <span>Total area <strong>{formatNumber(totals.totalArea)} sq.ft</strong></span>
              <span>Base cost <strong>{formatINR(totals.baseCost)}</strong></span>
            </div>
          </section>

          {/* 5. Specifications */}
          <section className="qe-card">
            <h2><span className="qe-step">5</span> Specifications Included</h2>
            {form.specs.length === 0 ? (
              <p className="qe-muted">
                <Building2 size={14} /> Select a package above to load its specifications from the comparison table.
              </p>
            ) : (
              <>
                <p className="qe-hint">
                  Loaded from the package comparison table. Untick to exclude a row, or edit any value for this client.
                </p>
                <div className="qe-rows">
                  {form.specs.map(spec => (
                    <div className={`qe-row qe-spec-row ${spec.included ? '' : 'excluded'}`} key={spec.id}>
                      <input
                        type="checkbox"
                        checked={spec.included}
                        onChange={(e) => updateRow('specs', spec.id, { included: e.target.checked })}
                        aria-label={`Include ${spec.feature}`}
                      />
                      <input
                        type="text"
                        className="qe-row-feature"
                        value={spec.feature}
                        onChange={(e) => updateRow('specs', spec.id, { feature: e.target.value })}
                      />
                      <input
                        type="text"
                        className="qe-row-grow"
                        value={spec.value}
                        onChange={(e) => updateRow('specs', spec.id, { value: e.target.value })}
                      />
                      <button
                        type="button"
                        className="qe-icon-btn"
                        onClick={() => removeRow('specs', spec.id)}
                        aria-label="Remove specification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="qe-btn-row">
              <button
                type="button"
                className="qe-btn qe-btn-outline"
                onClick={() => update({
                  specs: [...form.specs, { id: nextRowId('spec'), feature: '', value: '', included: true }]
                })}
              >
                <Plus size={14} /> Add Row
              </button>
              {form.packageId && (
                <button
                  type="button"
                  className="qe-btn qe-btn-ghost"
                  onClick={() => update({ specs: specsFromMatrix(matrix, form.packageId) })}
                >
                  <RotateCcw size={14} /> Reload from package
                </button>
              )}
            </div>
          </section>

          {/* 6. Additional works */}
          <section className="qe-card">
            <h2><span className="qe-step">6</span> Additional Works</h2>
            {form.lineItems.length > 0 && (
              <div className="qe-rows">
                <div className="qe-row qe-row-head">
                  <span className="qe-row-grow">Description</span>
                  <span className="qe-row-qty">Qty</span>
                  <span className="qe-row-unit">Unit</span>
                  <span className="qe-row-num">Rate</span>
                  <span className="qe-row-amt">Amount</span>
                  <span className="qe-icon-spacer" />
                </div>
                {totals.lineItems.map(item => (
                  <div className="qe-row" key={item.id}>
                    <input
                      type="text"
                      className="qe-row-grow"
                      value={item.description}
                      onChange={(e) => updateRow('lineItems', item.id, { description: e.target.value })}
                      placeholder="Description of work"
                    />
                    <input
                      type="number"
                      min="0"
                      className="qe-row-qty"
                      value={item.qty}
                      onChange={(e) => updateRow('lineItems', item.id, { qty: e.target.value })}
                    />
                    <input
                      type="text"
                      className="qe-row-unit"
                      value={item.unit}
                      onChange={(e) => updateRow('lineItems', item.id, { unit: e.target.value })}
                    />
                    <input
                      type="number"
                      min="0"
                      className="qe-row-num"
                      value={item.rate}
                      onChange={(e) => updateRow('lineItems', item.id, { rate: e.target.value })}
                    />
                    <span className="qe-row-amt">{formatINR(item.amount)}</span>
                    <button
                      type="button"
                      className="qe-icon-btn"
                      onClick={() => removeRow('lineItems', item.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="qe-btn qe-btn-outline"
              onClick={() => update({ lineItems: [...form.lineItems, emptyLineItem()] })}
            >
              <Plus size={14} /> Add Item
            </button>

            <p className="qe-hint qe-hint-tight">Quick add:</p>
            <div className="qe-presets">
              {LINE_ITEM_PRESETS.map(preset => (
                <button
                  type="button"
                  key={preset.description}
                  className="qe-chip"
                  onClick={() => update({
                    lineItems: [...form.lineItems, { ...emptyLineItem(), ...preset }]
                  })}
                >
                  <Plus size={12} /> {preset.description}
                </button>
              ))}
            </div>
          </section>

          {/* 7. Totals */}
          <section className="qe-card">
            <h2><span className="qe-step">7</span> Discount &amp; Tax</h2>
            <div className="qe-grid-2">
              <label className="qe-field">
                <span>Discount Type</span>
                <select
                  value={form.discountMode}
                  onChange={(e) => update({ discountMode: e.target.value })}
                >
                  <option value="amount">Flat amount (₹)</option>
                  <option value="percent">Percentage (%)</option>
                </select>
              </label>
              <label className="qe-field">
                <span>Discount {form.discountMode === 'percent' ? '(%)' : '(₹)'}</span>
                <input
                  type="number"
                  min="0"
                  value={form.discountValue}
                  onChange={(e) => update({ discountValue: e.target.value })}
                  placeholder="0"
                />
              </label>
              <label className="qe-field qe-field-inline">
                <input
                  type="checkbox"
                  checked={form.gstEnabled}
                  onChange={(e) => update({ gstEnabled: e.target.checked })}
                />
                <span>Apply GST</span>
              </label>
              <label className="qe-field">
                <span>GST (%)</span>
                <input
                  type="number"
                  min="0"
                  value={form.gstPercent}
                  disabled={!form.gstEnabled}
                  onChange={(e) => update({ gstPercent: e.target.value })}
                />
              </label>
            </div>

            <div className="qe-totals-box">
              <div><span>Subtotal</span><strong>{formatINR(totals.subtotal)}</strong></div>
              {totals.discountAmount > 0 && (
                <div><span>Discount</span><strong>− {formatINR(totals.discountAmount)}</strong></div>
              )}
              {form.gstEnabled && (
                <div><span>GST ({toNumber(form.gstPercent)}%)</span><strong>{formatINR(totals.gstAmount)}</strong></div>
              )}
              <div className="qe-grand"><span>Grand Total</span><strong>{formatINR(totals.grandTotal)}</strong></div>
              <p className="qe-words">{totals.grandTotalWords}</p>
            </div>
          </section>

          {/* 8. Payment schedule */}
          <section className="qe-card">
            <h2><span className="qe-step">8</span> Payment Schedule</h2>
            <div className="qe-rows">
              {totals.milestones.map(m => (
                <div className="qe-row" key={m.id}>
                  <input
                    type="text"
                    className="qe-row-grow"
                    value={m.stage}
                    onChange={(e) => updateRow('milestones', m.id, { stage: e.target.value })}
                    placeholder="Stage description"
                  />
                  <input
                    type="number"
                    min="0"
                    className="qe-row-qty"
                    value={m.percent}
                    onChange={(e) => updateRow('milestones', m.id, { percent: e.target.value })}
                  />
                  <span className="qe-row-amt">{formatINR(m.amount)}</span>
                  <button
                    type="button"
                    className="qe-icon-btn"
                    onClick={() => removeRow('milestones', m.id)}
                    aria-label="Remove milestone"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className={`qe-summary-strip ${milestoneWarning ? 'warn' : 'ok'}`}>
              <span>
                Milestones total <strong>{totals.milestoneTotalPercent}%</strong>
                {milestoneWarning ? ' — must equal 100%' : ''}
              </span>
            </div>
            <div className="qe-btn-row">
              <button
                type="button"
                className="qe-btn qe-btn-outline"
                onClick={() => update({
                  milestones: [...form.milestones, { id: nextRowId('ms'), stage: '', percent: '' }]
                })}
              >
                <Plus size={14} /> Add Stage
              </button>
              <button
                type="button"
                className="qe-btn qe-btn-ghost"
                onClick={() => update({ milestones: defaultMilestones() })}
              >
                <RotateCcw size={14} /> Reset to default
              </button>
            </div>
          </section>

          {/* 9. Terms & notes */}
          <section className="qe-card">
            <h2><span className="qe-step">9</span> Notes &amp; Terms</h2>
            <label className="qe-field">
              <span>Notes for this client (optional)</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => update({ notes: e.target.value })}
                placeholder="Any special agreement, inclusion or timeline note for this quotation."
              />
            </label>

            <div className="qe-rows qe-terms-rows">
              {form.terms.map((term, index) => (
                <div className="qe-row" key={`term-${index}`}>
                  <span className="qe-term-index">{index + 1}</span>
                  <textarea
                    rows={2}
                    className="qe-row-grow"
                    value={term}
                    onChange={(e) => {
                      const next = [...form.terms];
                      next[index] = e.target.value;
                      update({ terms: next });
                    }}
                  />
                  <button
                    type="button"
                    className="qe-icon-btn"
                    onClick={() => update({ terms: form.terms.filter((_, i) => i !== index) })}
                    aria-label="Remove term"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="qe-btn-row">
              <button
                type="button"
                className="qe-btn qe-btn-outline"
                onClick={() => update({ terms: [...form.terms, ''] })}
              >
                <Plus size={14} /> Add Term
              </button>
              <button
                type="button"
                className="qe-btn qe-btn-ghost"
                onClick={() => update({ terms: defaultTerms() })}
              >
                <RotateCcw size={14} /> Reset to default
              </button>
            </div>
          </section>

          {/* Generate */}
          <section className="qe-card qe-generate-card">
            {errors.length > 0 && (
              <div className="qe-alert qe-alert-error qe-alert-list">
                <AlertCircle size={15} />
                <ul>{errors.map((err, i) => <li key={i}>{err}</li>)}</ul>
              </div>
            )}
            {isReady && errors.length === 0 && (
              <div className="qe-alert qe-alert-ok">
                <Check size={15} />
                <span>Quotation ready — review the preview and download the PDF.</span>
              </div>
            )}

            <div className="qe-btn-row">
              <button type="button" className="qe-btn qe-btn-primary qe-btn-lg" onClick={handleGenerate}>
                <FileText size={16} /> Generate Quotation
              </button>
              <button
                type="button"
                className="qe-btn qe-btn-dark qe-btn-lg"
                onClick={handleDownload}
                disabled={!isReady || isExporting}
              >
                {isExporting
                  ? <><Loader2 size={16} className="qe-spin" /> Preparing…</>
                  : <><Download size={16} /> Download PDF</>}
              </button>
            </div>
            <p className="qe-hint">
              Quotations are not stored on the server — download the PDF before leaving this page.
            </p>
          </section>
        </div>

        {/* ───────────── Preview pane ───────────── */}
        <div className={`qe-preview-pane ${mobileView === 'preview' ? 'is-visible' : ''}`}>
          <div className="qe-preview-scroll">
            <QuotationPreview form={form} totals={totals} settings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationEditor;
