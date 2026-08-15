import React from 'react';
import { formatINR, formatNumber, formatDate, toNumber } from '../utils/quotation';

/**
 * A4-proportioned live preview of the quotation. Mirrors the exported PDF
 * layout so what the estimator sees on screen matches the downloaded file.
 */
const QuotationPreview = ({ form, totals, settings }) => {
  const includedSpecs = (form.specs || []).filter(s => s.included && s.feature);
  const areaRows = (form.floors || []).filter(f => toNumber(f.area) > 0);
  const terms = (form.terms || []).filter(t => t && t.trim());

  return (
    <div className="qp-sheet">
      {/* Letterhead */}
      <div className="qp-letterhead">
        <div className="qp-letterhead-left">
          <img src="/Brickswall-logo_birefnet.png" alt="Bricks Wall" className="qp-logo" />
          <div>
            <h1>BRICKS WALL</h1>
            <p>Turnkey Construction &amp; Interiors &nbsp;|&nbsp; Hyderabad</p>
          </div>
        </div>
        <div className="qp-letterhead-right">
          <span>{settings?.phone_primary || '+91 9949249091'}</span>
          <span>{settings?.email || 'Hello@brickswall.in'}</span>
          <span>www.brickswall.in</span>
          <span className="qp-address">{settings?.address || ''}</span>
        </div>
      </div>

      <div className="qp-body">
        {/* Title */}
        <div className="qp-title-row">
          <h2>QUOTATION</h2>
          <div className="qp-title-meta">
            <span>No. <strong>{form.quoteNumber || '—'}</strong></span>
            <span>Date: {formatDate(form.quoteDate) || '—'}</span>
            <span>Valid until: {formatDate(form.validUntil) || '—'}</span>
          </div>
        </div>

        {/* Client / project */}
        <div className="qp-info-grid">
          <div className="qp-info-box">
            <span className="qp-info-label">Prepared For</span>
            <strong className="qp-info-name">{form.clientName || 'Client name'}</strong>
            <span className="qp-info-line">
              {[form.clientPhone, form.clientEmail].filter(Boolean).join('  |  ') || '—'}
            </span>
            {form.siteLocation && <span className="qp-info-line">Site: {form.siteLocation}</span>}
          </div>
          <div className="qp-info-box">
            <span className="qp-info-label">Project Details</span>
            <strong className="qp-info-name">{form.packageName || 'No package selected'}</strong>
            <span className="qp-info-line">Rate: {formatINR(totals.rate)} per sq.ft</span>
            <span className="qp-info-line">
              Total built-up area: {formatNumber(totals.totalArea)} sq.ft
            </span>
          </div>
        </div>

        {/* Cost summary */}
        <h3 className="qp-section-title">Cost Summary</h3>
        <table className="qp-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="qp-right">Built-up Area</th>
              <th className="qp-right">Rate / Sq.ft</th>
              <th className="qp-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {areaRows.length > 0 ? (
              areaRows.map(f => (
                <tr key={f.id}>
                  <td>{f.label}</td>
                  <td className="qp-right">{formatNumber(f.area)} sq.ft</td>
                  <td className="qp-right">{formatINR(totals.rate)}</td>
                  <td className="qp-right">{formatINR(toNumber(f.area) * totals.rate)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="qp-empty">Add a floor area to see the cost breakdown</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td>Base Construction Cost</td>
              <td className="qp-right">{formatNumber(totals.totalArea)} sq.ft</td>
              <td />
              <td className="qp-right">{formatINR(totals.baseCost)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Additional works */}
        {totals.lineItems.length > 0 && (
          <>
            <h3 className="qp-section-title">Additional Works</h3>
            <table className="qp-table">
              <thead>
                <tr>
                  <th className="qp-narrow">#</th>
                  <th>Description</th>
                  <th className="qp-right">Qty</th>
                  <th className="qp-center">Unit</th>
                  <th className="qp-right">Rate</th>
                  <th className="qp-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {totals.lineItems.map((item, i) => (
                  <tr key={item.id}>
                    <td className="qp-center">{i + 1}</td>
                    <td>{item.description || '—'}</td>
                    <td className="qp-right">{formatNumber(item.qty)}</td>
                    <td className="qp-center">{item.unit}</td>
                    <td className="qp-right">{formatINR(item.rate)}</td>
                    <td className="qp-right">{formatINR(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5}>Additional Works Total</td>
                  <td className="qp-right">{formatINR(totals.addOnsTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </>
        )}

        {/* Totals */}
        <div className="qp-totals-row">
          <p className="qp-words">{totals.grandTotalWords}</p>
          <div className="qp-totals">
            <div className="qp-total-line">
              <span>Subtotal</span>
              <strong>{formatINR(totals.subtotal)}</strong>
            </div>
            {totals.discountAmount > 0 && (
              <>
                <div className="qp-total-line">
                  <span>
                    Discount
                    {form.discountMode === 'percent' ? ` (${toNumber(form.discountValue)}%)` : ''}
                  </span>
                  <strong>- {formatINR(totals.discountAmount)}</strong>
                </div>
                <div className="qp-total-line">
                  <span>Amount after discount</span>
                  <strong>{formatINR(totals.taxableAmount)}</strong>
                </div>
              </>
            )}
            {form.gstEnabled && (
              <div className="qp-total-line">
                <span>GST ({toNumber(form.gstPercent)}%)</span>
                <strong>{formatINR(totals.gstAmount)}</strong>
              </div>
            )}
            <div className="qp-total-line qp-grand">
              <span>Grand Total</span>
              <strong>{formatINR(totals.grandTotal)}</strong>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {includedSpecs.length > 0 && (
          <>
            <h3 className="qp-section-title">
              Specifications Included — {form.packageName || 'Selected Package'}
            </h3>
            <table className="qp-table qp-table-striped">
              <thead>
                <tr>
                  <th>Feature / Specification</th>
                  <th>Included Standard</th>
                </tr>
              </thead>
              <tbody>
                {includedSpecs.map(s => (
                  <tr key={s.id}>
                    <td className="qp-feature">{s.feature}</td>
                    <td>{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Payment schedule */}
        {totals.milestones.length > 0 && (
          <>
            <h3 className="qp-section-title">Payment Schedule</h3>
            <table className="qp-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th className="qp-right">%</th>
                  <th className="qp-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {totals.milestones.map(m => (
                  <tr key={m.id}>
                    <td>{m.stage}</td>
                    <td className="qp-right">{toNumber(m.percent)}%</td>
                    <td className="qp-right">{formatINR(m.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td className="qp-right">{totals.milestoneTotalPercent}%</td>
                  <td className="qp-right">{formatINR(totals.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </>
        )}

        {/* Notes */}
        {form.notes && form.notes.trim() && (
          <>
            <h3 className="qp-section-title">Notes</h3>
            <p className="qp-notes">{form.notes}</p>
          </>
        )}

        {/* Terms */}
        {terms.length > 0 && (
          <>
            <h3 className="qp-section-title">Terms &amp; Conditions</h3>
            <ol className="qp-terms">
              {terms.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
          </>
        )}

        {/* Signatures */}
        <div className="qp-signatures">
          <div>
            <div className="qp-sign-line" />
            <strong>For Bricks Wall Construction Co.</strong>
            <span>Authorised Signatory</span>
          </div>
          <div>
            <div className="qp-sign-line" />
            <strong>Accepted by Client</strong>
            <span>{form.clientName || 'Name & Signature'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreview;
