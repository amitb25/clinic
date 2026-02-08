import React, { forwardRef } from 'react';
import { formatDate, formatDateTime, dosageToString } from '../../../utils/helpers';
import { translateToMarathi, translateDosage } from '../prescriptionUtils';

const LightRedTemplate = forwardRef(({ prescription, clinicSettings }, ref) => {
  return (
    <div ref={ref} className="prescription-print bg-white text-black" style={{ fontFamily: "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif", maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'auto' }}>
      {/* ===== HEADER ===== */}
      <div className="prescription-header" style={{ marginBottom: '15px' }}>
        {/* Top Border Line */}
        <div style={{ height: '3px', background: '#C41E3A' }}></div>

        {/* Main Header Content */}
        <div style={{ padding: '15px 20px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Left - Doctor Details */}
            <div style={{ color: '#C41E3A', fontSize: '12px', lineHeight: '1.6', minWidth: '170px' }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>
                Dr. {prescription.doctor?.name}
              </p>
              <p style={{ margin: '2px 0', fontSize: '12px', color: '#333' }}>
                {prescription.doctor?.qualification}
              </p>
              {prescription.doctor?.registrationNo && (
                <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>
                  Reg No.: {prescription.doctor.registrationNo}
                </p>
              )}
              {prescription.doctor?.phone && (
                <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>
                  M.No.: {prescription.doctor.phone}
                </p>
              )}
            </div>

            {/* Center - Clinic Name with Logos */}
            <div style={{ textAlign: 'center', flex: 1, padding: '0 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                {/* Left Logo */}
                <img
                  src="/clinic-logo-lightred.png"
                  alt="Clinic Logo"
                  style={{ width: '45px', height: '50px', objectFit: 'contain' }}
                />

                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  margin: 0,
                  color: '#C41E3A',
                  fontFamily: "'Noto Sans Devanagari', serif"
                }}>
                  {clinicSettings?.clinicNameHindi || 'सारिवा क्लिनिक'}
                </h1>

                {/* Right Caduceus Logo */}
                <img
                  src="/caduceus-logo-red.png"
                  alt="Medical Logo"
                  style={{ width: '40px', height: '50px', objectFit: 'contain' }}
                />
              </div>
              {clinicSettings?.tagline && (
                <p style={{ margin: '3px 0 0 0', color: '#888', fontSize: '10px', fontStyle: 'italic' }}>
                  {clinicSettings.tagline}
                </p>
              )}
            </div>

            {/* Right - Specialization & Timings */}
            <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.5', minWidth: '170px', color: '#333' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '12px', color: '#C41E3A' }}>
                - {prescription.doctor?.specialization}
              </p>
              <p style={{ margin: '6px 0 2px 0', fontSize: '10px', color: '#666' }}>Timings:</p>
              <p style={{ margin: '1px 0', fontSize: '11px' }}>10:00 AM - 02:00 PM</p>
              <p style={{ margin: '1px 0', fontSize: '11px' }}>05:30 PM - 09:30 PM</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#228B22' }}>Sunday Open</p>
            </div>
          </div>
        </div>

        {/* Address Line */}
        <div style={{ padding: '8px 20px', textAlign: 'center', borderTop: '1px solid #C41E3A', borderBottom: '2px solid #C41E3A' }}>
          <p style={{ margin: 0, color: '#C41E3A', fontSize: '11px' }}>
            {clinicSettings?.address || 'Clinic Address'}
            {clinicSettings?.phone && <span style={{ marginLeft: '12px' }}>{clinicSettings.phone}</span>}
          </p>
        </div>
      </div>

      {/* ===== PRESCRIPTION INFO BAR ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderRadius: '8px', marginBottom: '15px', marginLeft: '20px', marginRight: '20px', border: '1px solid #C41E3A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#C41E3A', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', border: '1px solid #C41E3A' }}>Rx No.</span>
          <span style={{ fontWeight: '700', color: '#C41E3A', fontSize: '14px' }}>{prescription.prescriptionId}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '600', fontSize: '12px', color: '#555' }}>{formatDateTime(prescription.date)}</span>
        </div>
      </div>

      <div className="prescription-content" style={{ padding: '0 20px 15px', flex: '1' }}>
        {/* ===== PATIENT INFO ===== */}
        <div style={{ borderRadius: '10px', padding: '15px', marginBottom: '15px', border: '1px solid #C41E3A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px dashed #C41E3A' }}>
            <span style={{ color: '#C41E3A', padding: '4px 10px', borderRadius: '15px', fontSize: '11px', fontWeight: '600', border: '1px solid #C41E3A' }}>Patient</span>
            <span style={{ color: '#C41E3A', fontSize: '12px', fontWeight: '600' }}>Information</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <div style={{ padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #C41E3A' }}>
              <span style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '700', fontSize: '13px', color: '#333' }}>{prescription.patient?.name}</p>
            </div>
            <div style={{ padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #C41E3A' }}>
              <span style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', fontSize: '13px', color: '#333' }}>{prescription.patient?.age} Years, {prescription.patient?.gender}</p>
            </div>
            <div style={{ padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #C41E3A' }}>
              <span style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient ID</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '700', fontSize: '13px', color: '#C41E3A' }}>{prescription.patient?.patientId}</p>
            </div>
            <div style={{ padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #C41E3A' }}>
              <span style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', fontSize: '13px', color: '#333' }}>{prescription.patient?.phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* ===== RX & DIAGNOSIS ===== */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'stretch' }}>
          <div style={{ borderRadius: '10px', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #C41E3A' }}>
            <span style={{ fontSize: '28px', fontWeight: '700', color: '#C41E3A', fontFamily: 'Georgia, serif' }}>&#8478;</span>
          </div>
          <div style={{ flex: 1, borderRadius: '10px', padding: '12px 15px', border: '1px solid #C41E3A', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ color: '#C41E3A', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Diagnosis</span>
            <span style={{ color: '#333', fontSize: '15px', fontWeight: '700', marginTop: '3px' }}>{prescription.diagnosis}</span>
          </div>
        </div>

        {/* ===== MEDICINES TABLE ===== */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: '#C41E3A', padding: '4px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: '600', border: '1px solid #C41E3A' }}>Medicines</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #C41E3A' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #C41E3A' }}>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#C41E3A', fontWeight: '700', fontSize: '10px', width: '30px' }}>Sr.</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#C41E3A', fontWeight: '700', fontSize: '10px' }}>Medicine Name</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#C41E3A', fontWeight: '700', fontSize: '10px', width: '120px' }}>Dosage</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#C41E3A', fontWeight: '700', fontSize: '10px', width: '60px' }}>Days</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#C41E3A', fontWeight: '700', fontSize: '10px' }}>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines?.map((med, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', color: '#C41E3A', fontSize: '12px', borderBottom: '1px solid #ddd' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle', fontWeight: '700', color: '#333', fontSize: '12px', borderBottom: '1px solid #ddd' }}>{med.medicineName || med.medicine?.name}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', borderBottom: '1px solid #ddd' }}>
                    <span style={{ color: '#C41E3A', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '700', display: 'inline-block', whiteSpace: 'nowrap', border: '1px solid #C41E3A' }}>
                      {dosageToString(med.dosage)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', borderBottom: '1px solid #ddd', color: '#555' }}>
                    {med.duration} Days
                  </td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle', color: '#666', fontSize: '10px', borderBottom: '1px solid #ddd' }}>
                    {med.instructions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ===== DIET PLAN SECTION ===== */}
      {prescription.dietPlan && (
        <div style={{ padding: '0 20px', marginBottom: '10px' }}>
          <div style={{ borderRadius: '8px', padding: '10px 15px', border: '1px solid #C41E3A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px dashed #C41E3A' }}>
              <span style={{ color: '#C41E3A', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', border: '1px solid #C41E3A' }}>Diet Plan</span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#333', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{prescription.dietPlan}</p>
          </div>
        </div>
      )}

      {/* ===== BOTTOM SECTION - Advice, Follow-up, Signature ===== */}
      <div className="prescription-bottom" style={{ marginTop: 'auto' }}>
        {/* Advice & Signature Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '15px 20px', gap: '20px' }}>
          {/* Left Side - Advice & Follow-up */}
          <div style={{ flex: '1' }}>
            {prescription.advice && (
              <div style={{ borderRadius: '8px', padding: '10px 15px', borderLeft: '4px solid #C41E3A', marginBottom: '10px', border: '1px solid #C41E3A' }}>
                <span style={{ color: '#C41E3A', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Advice: </span>
                <span style={{ color: '#333', fontSize: '12px', fontWeight: '600' }}>{prescription.advice}</span>
              </div>
            )}
            {prescription.followUpDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#C41E3A', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '600', border: '1px solid #C41E3A' }}>Follow Up</span>
                <span style={{ fontWeight: '700', color: '#C41E3A', fontSize: '13px' }}>{formatDate(prescription.followUpDate)}</span>
              </div>
            )}
          </div>

          {/* Signature - Right Side */}
          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            {prescription.doctor?.signature ? (
              <div style={{ marginBottom: '5px', padding: '5px' }}>
                <img
                  src={prescription.doctor.signature}
                  alt="Doctor Signature"
                  style={{ height: '50px', width: '150px', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div style={{ borderBottom: '2px solid #C41E3A', width: '150px', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }}></div>
            )}
            <p style={{ fontWeight: '700', margin: '0 0 2px 0', color: '#C41E3A', fontSize: '13px' }}>
              Dr. {prescription.doctor?.name}
            </p>
            <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>{prescription.doctor?.qualification}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="prescription-footer" style={{ borderTop: '2px solid #C41E3A', padding: '10px 20px', textAlign: 'center' }}>
          <p style={{
            color: '#C41E3A',
            fontSize: '12px',
            margin: 0,
            fontWeight: '700'
          }}>
            {clinicSettings?.clinicNameHindi || 'सारिवा क्लिनिक'}
          </p>
          {(clinicSettings?.address || clinicSettings?.phone) && (
            <p style={{ color: '#666', fontSize: '10px', margin: '5px 0 0 0' }}>
              {clinicSettings?.address && <span>{clinicSettings.address}</span>}
              {clinicSettings?.address && clinicSettings?.phone && <span> | </span>}
              {clinicSettings?.phone && <span>{clinicSettings.phone}</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

LightRedTemplate.displayName = 'LightRedTemplate';

export default LightRedTemplate;
