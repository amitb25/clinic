import React, { forwardRef } from 'react';
import { formatDate, formatDateTime, dosageToString } from '../../../utils/helpers';
import { translateToMarathi, translateDosage } from '../prescriptionUtils';

const ModernMinimalTemplate = forwardRef(({ prescription, clinicSettings }, ref) => {
  return (
    <div ref={ref} className="prescription-print bg-white text-black" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'auto' }}>
      {/* ===== HEADER - Minimal Style ===== */}
      <div className="prescription-header" style={{ marginBottom: '20px' }}>
        {/* Top Thin Line */}
        <div style={{ height: '2px', background: '#10B981' }}></div>

        {/* Main Header Content */}
        <div style={{ padding: '20px 25px 15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Left - Doctor Details */}
            <div style={{ color: '#374151', fontSize: '11px', lineHeight: '1.6', minWidth: '150px' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                Dr. {prescription.doctor?.name}
              </p>
              <p style={{ margin: '3px 0', fontSize: '11px', color: '#6B7280' }}>
                {prescription.doctor?.qualification}
              </p>
              {prescription.doctor?.registrationNo && (
                <p style={{ margin: '2px 0', fontSize: '10px', color: '#9CA3AF' }}>
                  Reg: {prescription.doctor.registrationNo}
                </p>
              )}
            </div>

            {/* Center - Clinic Name */}
            <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '300',
                margin: 0,
                color: '#111827',
                letterSpacing: '2px'
              }}>
                {clinicSettings?.clinicNameHindi || 'सारिवा क्लिनिक'}
              </h1>
              {clinicSettings?.name && (
                <p style={{ margin: '5px 0 0 0', color: '#6B7280', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {clinicSettings.name}
                </p>
              )}
            </div>

            {/* Right - Contact */}
            <div style={{ textAlign: 'right', fontSize: '10px', lineHeight: '1.5', minWidth: '150px', color: '#6B7280' }}>
              <p style={{ margin: 0, fontWeight: '500', fontSize: '11px', color: '#374151' }}>
                {prescription.doctor?.specialization}
              </p>
              {clinicSettings?.phone && (
                <p style={{ margin: '3px 0', fontSize: '10px' }}>{clinicSettings.phone}</p>
              )}
              <p style={{ margin: '3px 0', fontSize: '10px' }}>Mon-Sun</p>
            </div>
          </div>
        </div>

        {/* Address Line - Simple */}
        <div style={{ padding: '8px 25px', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '10px', textAlign: 'center' }}>
            {clinicSettings?.address || 'Clinic Address'}
          </p>
        </div>
      </div>

      {/* ===== PRESCRIPTION INFO BAR ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 25px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#9CA3AF', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Rx</span>
          <span style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{prescription.prescriptionId}</span>
        </div>
        <div style={{ color: '#6B7280', fontSize: '11px' }}>
          {formatDateTime(prescription.date)}
        </div>
      </div>

      <div className="prescription-content" style={{ padding: '0 25px 15px', flex: '1' }}>
        {/* ===== PATIENT INFO ===== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <span style={{ color: '#9CA3AF', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: '600', fontSize: '13px', color: '#111827' }}>{prescription.patient?.name}</p>
          </div>
          <div>
            <span style={{ color: '#9CA3AF', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age / Gender</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: '500', fontSize: '13px', color: '#374151' }}>{prescription.patient?.age} yrs, {prescription.patient?.gender}</p>
          </div>
          <div>
            <span style={{ color: '#9CA3AF', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: '600', fontSize: '13px', color: '#10B981' }}>{prescription.patient?.patientId}</p>
          </div>
          <div>
            <span style={{ color: '#9CA3AF', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</span>
            <p style={{ margin: '4px 0 0 0', fontWeight: '500', fontSize: '13px', color: '#374151' }}>{prescription.patient?.phone || '-'}</p>
          </div>
        </div>

        {/* ===== DIAGNOSIS ===== */}
        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '22px', fontWeight: '300', color: '#10B981' }}>&#8478;</span>
            <div>
              <span style={{ color: '#9CA3AF', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>Diagnosis</span>
              <p style={{ margin: '4px 0 0 0', color: '#111827', fontSize: '14px', fontWeight: '600' }}>{prescription.diagnosis}</p>
            </div>
          </div>
        </div>

        {/* ===== MEDICINES ===== */}
        <div style={{ marginBottom: '15px' }}>
          <p style={{ color: '#9CA3AF', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Medications</p>

          {prescription.medicines?.map((med, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F0FDF4', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', marginRight: '15px' }}>{idx + 1}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '12px', color: '#111827' }}>{med.medicineName || med.medicine?.name}</p>
                <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: '#6B7280' }}>{translateToMarathi(med.instructions)}</p>
              </div>
              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <span style={{ background: '#F0FDF4', color: '#059669', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '600' }}>
                  {dosageToString(med.dosage)}
                </span>
              </div>
              <div style={{ textAlign: 'right', minWidth: '60px' }}>
                <span style={{ color: '#374151', fontSize: '11px', fontWeight: '500' }}>{med.duration} days</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ===== DIET PLAN ===== */}
      {prescription.dietPlan && (
        <div style={{ padding: '0 25px', marginBottom: '10px' }}>
          <div style={{ padding: '10px 15px', background: '#F0FDF4', borderRadius: '6px', borderLeft: '3px solid #10B981' }}>
            <span style={{ color: '#9CA3AF', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Diet Plan</span>
            <p style={{ margin: '4px 0 0 0', color: '#374151', fontSize: '11px', fontWeight: '500', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{prescription.dietPlan}</p>
          </div>
        </div>
      )}

      {/* ===== BOTTOM SECTION ===== */}
      <div className="prescription-bottom" style={{ marginTop: 'auto' }}>
        {/* Advice & Signature Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '15px 25px', gap: '30px' }}>
          {/* Left Side - Advice & Follow-up */}
          <div style={{ flex: '1' }}>
            {prescription.advice && (
              <div style={{ marginBottom: '10px', padding: '10px 15px', background: '#F9FAFB', borderRadius: '6px', borderLeft: '3px solid #10B981' }}>
                <span style={{ color: '#9CA3AF', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Advice</span>
                <p style={{ margin: '4px 0 0 0', color: '#374151', fontSize: '11px', fontWeight: '500' }}>{prescription.advice}</p>
              </div>
            )}
            {prescription.followUpDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#9CA3AF', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next Visit</span>
                <span style={{ fontWeight: '600', color: '#10B981', fontSize: '12px' }}>{formatDate(prescription.followUpDate)}</span>
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
                  style={{ height: '45px', width: '130px', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div style={{ borderBottom: '1px solid #D1D5DB', width: '130px', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }}></div>
            )}
            <p style={{ fontWeight: '600', margin: '0 0 2px 0', color: '#111827', fontSize: '12px' }}>
              Dr. {prescription.doctor?.name}
            </p>
            <p style={{ color: '#6B7280', fontSize: '10px', margin: 0 }}>{prescription.doctor?.qualification}</p>
          </div>
        </div>

        {/* Footer - Minimal */}
        <div className="prescription-footer" style={{ borderTop: '1px solid #E5E7EB', padding: '10px 25px', textAlign: 'center' }}>
          <p style={{
            color: '#9CA3AF',
            fontSize: '10px',
            margin: 0,
            letterSpacing: '1px'
          }}>
            {clinicSettings?.name || clinicSettings?.clinicNameHindi || 'Clinic'}
          </p>
        </div>
      </div>
    </div>
  );
});

ModernMinimalTemplate.displayName = 'ModernMinimalTemplate';

export default ModernMinimalTemplate;
