import React, { forwardRef } from 'react';
import { formatDate, formatDateTime, dosageToString } from '../../../utils/helpers';
import { translateToMarathi, translateDosage } from '../prescriptionUtils';

const ClassicTraditionalTemplate = forwardRef(({ prescription, clinicSettings }, ref) => {
  return (
    <div ref={ref} className="prescription-print bg-white text-black" style={{ fontFamily: "Georgia, 'Times New Roman', serif", maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'auto', border: '3px double #1a1a1a' }}>
      {/* ===== HEADER - Traditional Style ===== */}
      <div className="prescription-header" style={{ marginBottom: '12px' }}>
        {/* Top Double Border */}
        <div style={{ height: '2px', background: '#1a1a1a', margin: '3px' }}></div>
        <div style={{ height: '1px', background: '#1a1a1a', margin: '0 3px' }}></div>

        {/* Main Header Content */}
        <div style={{ padding: '12px 20px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Left - Doctor Details */}
            <div style={{ color: '#1a1a1a', fontSize: '11px', lineHeight: '1.5', minWidth: '160px' }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', fontStyle: 'italic' }}>
                Dr. {prescription.doctor?.name}
              </p>
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#333' }}>
                {prescription.doctor?.qualification}
              </p>
              {prescription.doctor?.registrationNo && (
                <p style={{ margin: '2px 0', fontSize: '10px', color: '#555' }}>
                  Reg. No.: {prescription.doctor.registrationNo}
                </p>
              )}
              {prescription.doctor?.phone && (
                <p style={{ margin: '2px 0', fontSize: '10px', color: '#555' }}>
                  Mobile: {prescription.doctor.phone}
                </p>
              )}
            </div>

            {/* Center - Clinic Name */}
            <div style={{ textAlign: 'center', flex: 1, padding: '0 15px' }}>
              <h1 style={{
                fontSize: '26px',
                fontWeight: '700',
                margin: 0,
                color: '#1a1a1a',
                fontFamily: "Georgia, serif",
                borderBottom: '2px solid #1a1a1a',
                paddingBottom: '5px',
                display: 'inline-block'
              }}>
                {clinicSettings?.clinicNameHindi || 'सारिवा क्लिनिक'}
              </h1>
              {clinicSettings?.name && (
                <p style={{ margin: '3px 0 0 0', color: '#333', fontSize: '12px', fontStyle: 'italic' }}>
                  {clinicSettings.name}
                </p>
              )}
              {clinicSettings?.tagline && (
                <p style={{ margin: '2px 0 0 0', color: '#666', fontSize: '9px', fontStyle: 'italic' }}>
                  {clinicSettings.tagline}
                </p>
              )}
            </div>

            {/* Right - Specialization & Timings */}
            <div style={{ textAlign: 'right', fontSize: '10px', lineHeight: '1.4', minWidth: '160px', color: '#333' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '11px', color: '#1a1a1a', fontStyle: 'italic' }}>
                {prescription.doctor?.specialization}
              </p>
              <p style={{ margin: '5px 0 2px 0', fontSize: '9px', color: '#555', textTransform: 'uppercase' }}>Timings:</p>
              <p style={{ margin: '1px 0', fontSize: '10px' }}>Morning: 10:00 AM - 2:00 PM</p>
              <p style={{ margin: '1px 0', fontSize: '10px' }}>Evening: 5:30 PM - 9:30 PM</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#228B22' }}>Sunday Open</p>
            </div>
          </div>
        </div>

        {/* Address Line */}
        <div style={{ background: '#f5f5f5', padding: '6px 20px', textAlign: 'center', borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#333', fontSize: '10px' }}>
            Address: {clinicSettings?.address || 'Clinic Address'}
            {clinicSettings?.phone && <span style={{ marginLeft: '15px' }}>Tel: {clinicSettings.phone}</span>}
          </p>
        </div>

        {/* Bottom border */}
        <div style={{ height: '1px', background: '#1a1a1a', margin: '0 3px' }}></div>
        <div style={{ height: '2px', background: '#1a1a1a', margin: '3px' }}></div>
      </div>

      {/* ===== PRESCRIPTION INFO BAR ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px', borderBottom: '1px solid #ccc', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '700', fontSize: '11px', color: '#333' }}>Prescription No.:</span>
          <span style={{ fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>{prescription.prescriptionId}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '700', fontSize: '11px', color: '#333' }}>Date:</span>
          <span style={{ fontWeight: '600', fontSize: '11px', color: '#1a1a1a' }}>{formatDateTime(prescription.date)}</span>
        </div>
      </div>

      <div className="prescription-content" style={{ padding: '0 20px 12px', flex: '1' }}>
        {/* ===== PATIENT INFO ===== */}
        <div style={{ border: '1px solid #333', marginBottom: '12px' }}>
          <div style={{ background: '#f0f0f0', padding: '5px 10px', borderBottom: '1px solid #333' }}>
            <span style={{ fontWeight: '700', fontSize: '11px', color: '#1a1a1a', textTransform: 'uppercase' }}>Patient Details</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }}>
            <div style={{ padding: '8px 10px', borderRight: '1px solid #ddd' }}>
              <span style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase' }}>Name</span>
              <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '12px', color: '#1a1a1a' }}>{prescription.patient?.name}</p>
            </div>
            <div style={{ padding: '8px 10px', borderRight: '1px solid #ddd' }}>
              <span style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase' }}>Age / Gender</span>
              <p style={{ margin: '2px 0 0 0', fontWeight: '600', fontSize: '12px', color: '#1a1a1a' }}>{prescription.patient?.age} Yrs, {prescription.patient?.gender}</p>
            </div>
            <div style={{ padding: '8px 10px', borderRight: '1px solid #ddd' }}>
              <span style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase' }}>Patient ID</span>
              <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '12px', color: '#1a1a1a' }}>{prescription.patient?.patientId}</p>
            </div>
            <div style={{ padding: '8px 10px' }}>
              <span style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase' }}>Phone</span>
              <p style={{ margin: '2px 0 0 0', fontWeight: '600', fontSize: '12px', color: '#1a1a1a' }}>{prescription.patient?.phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* ===== DIAGNOSIS ===== */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', padding: '10px', border: '1px solid #333', background: '#fafafa' }}>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', fontFamily: 'Georgia, serif', lineHeight: '1' }}>&#8478;</span>
          <div>
            <span style={{ color: '#333', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Diagnosis:</span>
            <span style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: '700', marginLeft: '8px' }}>{prescription.diagnosis}</span>
          </div>
        </div>

        {/* ===== MEDICINES TABLE ===== */}
        <div style={{ marginBottom: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #333' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: '8px 6px', textAlign: 'center', color: '#1a1a1a', fontWeight: '700', fontSize: '10px', width: '30px', borderBottom: '2px solid #333', borderRight: '1px solid #ccc' }}>Sr.</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', color: '#1a1a1a', fontWeight: '700', fontSize: '10px', borderBottom: '2px solid #333', borderRight: '1px solid #ccc' }}>Medicine Name</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', color: '#1a1a1a', fontWeight: '700', fontSize: '10px', width: '110px', borderBottom: '2px solid #333', borderRight: '1px solid #ccc' }}>Dosage</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', color: '#1a1a1a', fontWeight: '700', fontSize: '10px', width: '50px', borderBottom: '2px solid #333', borderRight: '1px solid #ccc' }}>Days</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', color: '#1a1a1a', fontWeight: '700', fontSize: '10px', borderBottom: '2px solid #333' }}>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines?.map((med, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', color: '#1a1a1a', fontSize: '11px', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 6px', verticalAlign: 'middle', fontWeight: '700', color: '#1a1a1a', fontSize: '11px', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd' }}>{med.medicineName || med.medicine?.name}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd' }}>
                    <span style={{ fontWeight: '600', fontSize: '10px', color: '#1a1a1a' }}>
                      {dosageToString(med.dosage)}
                    </span>
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd', color: '#1a1a1a' }}>
                    {med.duration}
                  </td>
                  <td style={{ padding: '8px 6px', verticalAlign: 'middle', color: '#333', fontSize: '10px', borderBottom: '1px solid #ddd' }}>
                    {translateToMarathi(med.instructions)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ===== BOTTOM SECTION - Advice, Follow-up, Signature ===== */}
      <div className="prescription-bottom" style={{ marginTop: 'auto' }}>
        {/* Advice & Signature Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '12px 20px', gap: '20px', borderTop: '1px solid #ccc' }}>
          {/* Left Side - Advice & Follow-up */}
          <div style={{ flex: '1' }}>
            {prescription.advice && (
              <div style={{ marginBottom: '8px', padding: '8px 10px', border: '1px solid #ddd', background: '#fafafa' }}>
                <span style={{ color: '#1a1a1a', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Advice: </span>
                <span style={{ color: '#333', fontSize: '11px', fontWeight: '600' }}>{prescription.advice}</span>
              </div>
            )}
            {prescription.followUpDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '10px', color: '#1a1a1a' }}>Follow-up Date:</span>
                <span style={{ fontWeight: '700', color: '#1a1a1a', fontSize: '12px' }}>{formatDate(prescription.followUpDate)}</span>
              </div>
            )}
          </div>

          {/* Signature - Right Side */}
          <div style={{ textAlign: 'center', minWidth: '180px' }}>
            {prescription.doctor?.signature ? (
              <div style={{ marginBottom: '5px', padding: '5px' }}>
                <img
                  src={prescription.doctor.signature}
                  alt="Doctor Signature"
                  style={{ height: '45px', width: '140px', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div style={{ borderBottom: '1px solid #1a1a1a', width: '140px', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }}></div>
            )}
            <p style={{ fontWeight: '700', margin: '0 0 2px 0', color: '#1a1a1a', fontSize: '12px', fontStyle: 'italic' }}>
              Dr. {prescription.doctor?.name}
            </p>
            <p style={{ color: '#555', fontSize: '10px', margin: 0 }}>{prescription.doctor?.qualification}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="prescription-footer" style={{ borderTop: '2px solid #1a1a1a', padding: '8px 20px', background: '#f5f5f5', textAlign: 'center' }}>
          <p style={{
            color: '#1a1a1a',
            fontSize: '11px',
            margin: 0,
            fontWeight: '700',
            fontStyle: 'italic'
          }}>
            {clinicSettings?.clinicNameHindi || 'सारिवा क्लिनिक'}
          </p>
          {(clinicSettings?.address || clinicSettings?.phone) && (
            <p style={{ color: '#555', fontSize: '9px', margin: '3px 0 0 0' }}>
              {clinicSettings?.address && <span>{clinicSettings.address}</span>}
              {clinicSettings?.address && clinicSettings?.phone && <span> | </span>}
              {clinicSettings?.phone && <span>Tel: {clinicSettings.phone}</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

ClassicTraditionalTemplate.displayName = 'ClassicTraditionalTemplate';

export default ClassicTraditionalTemplate;
