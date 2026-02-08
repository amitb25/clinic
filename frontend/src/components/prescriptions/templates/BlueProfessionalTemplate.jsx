import React, { forwardRef } from 'react';
import { formatDate, formatDateTime, dosageToString } from '../../../utils/helpers';
import { translateToMarathi, translateDosage } from '../prescriptionUtils';

const BlueProfessionalTemplate = forwardRef(({ prescription, clinicSettings }, ref) => {
  return (
    <div ref={ref} className="prescription-print bg-white text-black" style={{ fontFamily: "'Segoe UI', 'Roboto', Arial, sans-serif", maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'auto' }}>
      {/* ===== HEADER - Blue Professional Style ===== */}
      <div className="prescription-header" style={{ marginBottom: '15px' }}>
        {/* Top Blue Bar */}
        <div style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', padding: '15px 20px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Left - Doctor Details */}
            <div style={{ fontSize: '11px', lineHeight: '1.5', minWidth: '160px' }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>
                Dr. {prescription.doctor?.name}
              </p>
              <p style={{ margin: '2px 0', fontSize: '11px', opacity: 0.9 }}>
                {prescription.doctor?.qualification}
              </p>
              {prescription.doctor?.registrationNo && (
                <p style={{ margin: '2px 0', fontSize: '10px', opacity: 0.8 }}>
                  Reg: {prescription.doctor.registrationNo}
                </p>
              )}
            </div>

            {/* Center - Clinic Name */}
            <div style={{ textAlign: 'center', flex: 1, padding: '0 15px' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                margin: 0,
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {clinicSettings?.clinicNameHindi || 'सारिवा क्लिनिक'}
              </h1>
              {clinicSettings?.name && (
                <p style={{ margin: '3px 0 0 0', fontSize: '11px', opacity: 0.9 }}>
                  {clinicSettings.name}
                </p>
              )}
            </div>

            {/* Right - Contact & Timing */}
            <div style={{ textAlign: 'right', fontSize: '10px', lineHeight: '1.5', minWidth: '160px' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '11px' }}>
                {prescription.doctor?.specialization}
              </p>
              {prescription.doctor?.phone && (
                <p style={{ margin: '3px 0', fontSize: '10px', opacity: 0.9 }}>
                  {prescription.doctor.phone}
                </p>
              )}
              <p style={{ margin: '3px 0', fontSize: '10px', opacity: 0.8 }}>Mon - Sun Open</p>
            </div>
          </div>
        </div>

        {/* Address Bar */}
        <div style={{ background: '#EFF6FF', padding: '8px 20px', textAlign: 'center', borderBottom: '2px solid #2563EB' }}>
          <p style={{ margin: 0, color: '#1E40AF', fontSize: '10px' }}>
            {clinicSettings?.address || 'Clinic Address'}
            {clinicSettings?.phone && <span style={{ marginLeft: '15px' }}>{clinicSettings.phone}</span>}
          </p>
        </div>
      </div>

      {/* ===== PRESCRIPTION INFO BAR ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#EFF6FF', borderRadius: '8px', marginBottom: '15px', marginLeft: '20px', marginRight: '20px', border: '1px solid #BFDBFE' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#1E40AF', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>Rx</span>
          <span style={{ fontWeight: '700', color: '#1E40AF', fontSize: '14px' }}>{prescription.prescriptionId}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>Date</span>
          <span style={{ fontWeight: '600', fontSize: '12px', color: '#374151' }}>{formatDateTime(prescription.date)}</span>
        </div>
      </div>

      <div className="prescription-content" style={{ padding: '0 20px 15px', flex: '1' }}>
        {/* ===== PATIENT INFO ===== */}
        <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px 15px', marginBottom: '15px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
            <span style={{ background: '#1E40AF', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>PATIENT</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div>
              <span style={{ color: '#64748B', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</span>
              <p style={{ margin: '3px 0 0 0', fontWeight: '700', fontSize: '12px', color: '#1E293B' }}>{prescription.patient?.name}</p>
            </div>
            <div>
              <span style={{ color: '#64748B', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age / Gender</span>
              <p style={{ margin: '3px 0 0 0', fontWeight: '600', fontSize: '12px', color: '#1E293B' }}>{prescription.patient?.age} Yrs, {prescription.patient?.gender}</p>
            </div>
            <div>
              <span style={{ color: '#64748B', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient ID</span>
              <p style={{ margin: '3px 0 0 0', fontWeight: '700', fontSize: '12px', color: '#1E40AF' }}>{prescription.patient?.patientId}</p>
            </div>
            <div>
              <span style={{ color: '#64748B', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</span>
              <p style={{ margin: '3px 0 0 0', fontWeight: '600', fontSize: '12px', color: '#1E293B' }}>{prescription.patient?.phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* ===== DIAGNOSIS ===== */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'stretch' }}>
          <div style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '26px', fontWeight: '700', color: '#fff' }}>&#8478;</span>
          </div>
          <div style={{ flex: 1, background: '#EFF6FF', borderRadius: '8px', padding: '12px 15px', border: '1px solid #BFDBFE', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ color: '#1E40AF', fontSize: '9px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Diagnosis</span>
            <span style={{ color: '#1E293B', fontSize: '14px', fontWeight: '700', marginTop: '3px' }}>{prescription.diagnosis}</span>
          </div>
        </div>

        {/* ===== MEDICINES TABLE ===== */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ background: '#1E40AF', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>MEDICATIONS</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '11px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #BFDBFE' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)' }}>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: '10px', width: '30px' }}>#</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '10px' }}>Medicine</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: '10px', width: '110px' }}>Dosage</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: '10px', width: '50px' }}>Days</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '10px' }}>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines?.map((med, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#EFF6FF' }}>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', color: '#1E40AF', fontSize: '11px', borderBottom: '1px solid #E2E8F0' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle', fontWeight: '700', color: '#1E293B', fontSize: '11px', borderBottom: '1px solid #E2E8F0' }}>{med.medicineName || med.medicine?.name}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', borderBottom: '1px solid #E2E8F0' }}>
                    <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '700', display: 'inline-block', whiteSpace: 'nowrap' }}>
                      {dosageToString(med.dosage)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', borderBottom: '1px solid #E2E8F0', color: '#374151' }}>
                    {med.duration}
                  </td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle', color: '#64748B', fontSize: '10px', borderBottom: '1px solid #E2E8F0' }}>
                    {translateToMarathi(med.instructions)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ===== BOTTOM SECTION ===== */}
      <div className="prescription-bottom" style={{ marginTop: 'auto' }}>
        {/* Advice & Signature Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '15px 20px', gap: '20px' }}>
          {/* Left Side - Advice & Follow-up */}
          <div style={{ flex: '1' }}>
            {prescription.advice && (
              <div style={{ background: '#EFF6FF', borderRadius: '6px', padding: '10px 15px', borderLeft: '4px solid #2563EB', marginBottom: '10px' }}>
                <span style={{ color: '#1E40AF', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Advice: </span>
                <span style={{ color: '#1E293B', fontSize: '11px', fontWeight: '600' }}>{prescription.advice}</span>
              </div>
            )}
            {prescription.followUpDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '600' }}>Follow-up</span>
                <span style={{ fontWeight: '700', color: '#1E40AF', fontSize: '12px' }}>{formatDate(prescription.followUpDate)}</span>
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
              <div style={{ borderBottom: '2px solid #1E40AF', width: '140px', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }}></div>
            )}
            <p style={{ fontWeight: '700', margin: '0 0 2px 0', color: '#1E40AF', fontSize: '12px' }}>
              Dr. {prescription.doctor?.name}
            </p>
            <p style={{ color: '#64748B', fontSize: '10px', margin: 0 }}>{prescription.doctor?.qualification}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="prescription-footer" style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', padding: '10px 20px', textAlign: 'center' }}>
          <p style={{
            color: '#fff',
            fontSize: '11px',
            margin: 0,
            fontWeight: '600'
          }}>
            {clinicSettings?.clinicNameHindi || 'सारिवा क्लिनिक'}
          </p>
          {(clinicSettings?.address || clinicSettings?.phone) && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9px', margin: '4px 0 0 0' }}>
              {clinicSettings?.address && <span>{clinicSettings.address}</span>}
              {clinicSettings?.address && clinicSettings?.phone && <span> | </span>}
              {clinicSettings?.phone && <span>{clinicSettings.phone}</span>}
            </p>
          )}
        </div>
      </div>

      {/* ===== DIET PLAN - SEPARATE PAGE ===== */}
      {prescription.dietPlan && (
        <div style={{ pageBreakBefore: 'always', padding: '30px 25px', fontFamily: "'Segoe UI', 'Roboto', Arial, sans-serif" }}>
          <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #2563EB' }}>
            <h2 style={{ margin: 0, color: '#1E40AF', fontSize: '18px', fontWeight: '700' }}>Diet Plan / आहार योजना</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#374151' }}>
              Patient: <strong>{prescription.patient?.name}</strong> | Rx: <strong>{prescription.prescriptionId}</strong> | Date: <strong>{formatDate(prescription.date)}</strong>
            </p>
            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#64748B' }}>
              Diagnosis: <strong>{prescription.diagnosis}</strong>
            </p>
          </div>
          <div style={{ padding: '15px', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', lineHeight: '1.6' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#1E293B', whiteSpace: 'pre-line' }}>{prescription.dietPlan}</p>
          </div>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: '700', color: '#1E40AF', fontSize: '12px' }}>Dr. {prescription.doctor?.name}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#64748B' }}>{prescription.doctor?.qualification}</p>
          </div>
        </div>
      )}
    </div>
  );
});

BlueProfessionalTemplate.displayName = 'BlueProfessionalTemplate';

export default BlueProfessionalTemplate;
