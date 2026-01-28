import React, { forwardRef } from 'react';
import { formatDate, formatDateTime, dosageToString } from '../../../utils/helpers';
import { translateToMarathi, translateDosage } from '../prescriptionUtils';

const LightRedTemplate = forwardRef(({ prescription, clinicSettings }, ref) => {
  return (
    <div ref={ref} className="prescription-print bg-white text-black" style={{ fontFamily: "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif", maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'auto' }}>
      {/* ===== HEADER - Light & Clean Style ===== */}
      <div className="prescription-header" style={{ marginBottom: '15px' }}>
        {/* Top Border Line */}
        <div style={{ height: '3px', background: '#C41E3A' }}></div>

        {/* Main Header Content */}
        <div style={{ padding: '15px 20px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Left - Doctor Details */}
            <div style={{ color: '#C41E3A', fontSize: '12px', lineHeight: '1.6', minWidth: '170px' }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>
                डॉ. {prescription.doctor?.name}
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
                  src="/clinic-logo-left.png"
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
                  src="/caduceus-logo.png"
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
              <p style={{ margin: '6px 0 2px 0', fontSize: '10px', color: '#666' }}>वेळ / Timings:</p>
              <p style={{ margin: '1px 0', fontSize: '11px' }}>सकाळी १०:०० ते २:००</p>
              <p style={{ margin: '1px 0', fontSize: '11px' }}>सायं. ५:३० ते ९:३०</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#228B22' }}>रविवार सुरु</p>
            </div>
          </div>
        </div>

        {/* Address Line */}
        <div style={{ background: '#FDF2F2', padding: '8px 20px', textAlign: 'center', borderTop: '1px solid #E8B4B4', borderBottom: '2px solid #C41E3A' }}>
          <p style={{ margin: 0, color: '#C41E3A', fontSize: '11px' }}>
            {clinicSettings?.address || 'Clinic Address'}
            {clinicSettings?.phone && <span style={{ marginLeft: '12px' }}>{clinicSettings.phone}</span>}
          </p>
        </div>

        {/* Decorative Bottom Border */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FFA500 75%, #FFD700 100%)' }}></div>
      </div>

      {/* ===== PRESCRIPTION INFO BAR ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: 'linear-gradient(135deg, #FFF8F8 0%, #FFEFEF 100%)', borderRadius: '8px', marginBottom: '15px', marginLeft: '20px', marginRight: '20px', border: '1px solid #F5D0D0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#FFF0F0', color: '#C41E3A', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', border: '1px solid #F5D0D0' }}>Rx No.</span>
          <span style={{ fontWeight: '700', color: '#C41E3A', fontSize: '14px' }}>{prescription.prescriptionId}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#888', fontSize: '11px' }}></span>
          <span style={{ fontWeight: '600', fontSize: '12px', color: '#555' }}>{formatDateTime(prescription.date)}</span>
        </div>
      </div>

      <div className="prescription-content" style={{ padding: '0 20px 15px', flex: '1' }}>
        {/* ===== PATIENT INFO ===== */}
        <div style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F8 100%)', borderRadius: '10px', padding: '15px', marginBottom: '15px', border: '1px solid #F0D0D0', boxShadow: '0 2px 8px rgba(220,53,69,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '2px dashed #F5D0D0' }}>
            <span style={{ background: 'linear-gradient(135deg, #FFF0F0 0%, #FFE8E8 100%)', color: '#C41E3A', padding: '4px 10px', borderRadius: '15px', fontSize: '11px', fontWeight: '600', border: '1px solid #F5D0D0' }}>Patient</span>
            <span style={{ color: '#C41E3A', fontSize: '12px', fontWeight: '600' }}>रुग्णाची माहिती</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <div style={{ background: '#FEFEFE', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #DC3545' }}>
              <span style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>नाव / Name</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '700', fontSize: '13px', color: '#333' }}>{prescription.patient?.name}</p>
            </div>
            <div style={{ background: '#FEFEFE', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #DC3545' }}>
              <span style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>वय / Age</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', fontSize: '13px', color: '#333' }}>{prescription.patient?.age} वर्षे, {translateToMarathi(prescription.patient?.gender)}</p>
            </div>
            <div style={{ background: '#FEFEFE', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #DC3545' }}>
              <span style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient ID</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '700', fontSize: '13px', color: '#C41E3A' }}>{prescription.patient?.patientId}</p>
            </div>
            <div style={{ background: '#FEFEFE', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #DC3545' }}>
              <span style={{ color: '#999', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>फोन / Phone</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', fontSize: '13px', color: '#333' }}>{prescription.patient?.phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* ===== RX & DIAGNOSIS ===== */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'stretch' }}>
          <div style={{ background: 'linear-gradient(135deg, #FFF0F0 0%, #FFE8E8 100%)', borderRadius: '10px', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(220,53,69,0.1)', border: '2px solid #F5D0D0' }}>
            <span style={{ fontSize: '28px', fontWeight: '700', color: '#C41E3A', fontFamily: 'Georgia, serif' }}>&#8478;</span>
          </div>
          <div style={{ flex: 1, background: 'linear-gradient(135deg, #FFF8F8 0%, #FFEFEF 100%)', borderRadius: '10px', padding: '12px 15px', border: '1px solid #F5D0D0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ color: '#C41E3A', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>निदान / Diagnosis</span>
            <span style={{ color: '#333', fontSize: '15px', fontWeight: '700', marginTop: '3px' }}>{prescription.diagnosis}</span>
          </div>
        </div>

        {/* ===== MEDICINES TABLE ===== */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ background: 'linear-gradient(135deg, #FFF0F0 0%, #FFE8E8 100%)', color: '#C41E3A', padding: '4px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: '600', border: '1px solid #F5D0D0' }}>Medicines</span>
            <span style={{ color: '#C41E3A', fontSize: '12px', fontWeight: '600' }}>औषधे</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '12px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(220,53,69,0.1)' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #FFF0F0 0%, #FFE8E8 100%)', borderBottom: '2px solid #F5D0D0' }}>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#C41E3A', fontWeight: '700', fontSize: '10px', width: '30px' }}>क्र.</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#C41E3A', fontWeight: '700', fontSize: '10px' }}>औषधाचे नाव</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#C41E3A', fontWeight: '700', fontSize: '10px', width: '120px' }}>डोस</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#C41E3A', fontWeight: '700', fontSize: '10px', width: '60px' }}>दिवस</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#C41E3A', fontWeight: '700', fontSize: '10px' }}>सूचना</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines?.map((med, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#FFF8F8', transition: 'background 0.2s' }}>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', color: '#C41E3A', fontSize: '12px', borderBottom: '1px solid #F5E0E0' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle', fontWeight: '700', color: '#333', fontSize: '12px', borderBottom: '1px solid #F5E0E0' }}>{med.medicineName || med.medicine?.name}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', borderBottom: '1px solid #F5E0E0' }}>
                    <span style={{ background: 'linear-gradient(135deg, #FFF0F0 0%, #FFE8E8 100%)', color: '#C41E3A', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '700', display: 'inline-block', whiteSpace: 'nowrap', border: '1px solid #F5D0D0' }}>
                      {translateDosage(dosageToString(med.dosage))}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', borderBottom: '1px solid #F5E0E0', color: '#555' }}>
                    {med.duration} दिवस
                  </td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle', color: '#666', fontSize: '10px', borderBottom: '1px solid #F5E0E0' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '15px 20px', gap: '20px' }}>
          {/* Left Side - Advice & Follow-up */}
          <div style={{ flex: '1' }}>
            {prescription.advice && (
              <div style={{ background: 'linear-gradient(135deg, #FFF8F8 0%, #FFEFEF 100%)', borderRadius: '8px', padding: '10px 15px', borderLeft: '4px solid #DC3545', marginBottom: '10px', boxShadow: '0 2px 6px rgba(220,53,69,0.08)' }}>
                <span style={{ color: '#C41E3A', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>सल्ला / Advice: </span>
                <span style={{ color: '#333', fontSize: '12px', fontWeight: '600' }}>{prescription.advice}</span>
              </div>
            )}
            {prescription.followUpDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#FFF0F0', color: '#C41E3A', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '600', border: '1px solid #F5D0D0' }}>पुढील भेट</span>
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
              <div style={{ borderBottom: '2px solid #8B0000', width: '150px', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }}></div>
            )}
            <p style={{ fontWeight: '700', margin: '0 0 2px 0', color: '#8B0000', fontSize: '13px' }}>
              डॉ. {prescription.doctor?.name}
            </p>
            <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>{prescription.doctor?.qualification}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="prescription-footer" style={{ borderTop: '2px solid #8B0000', padding: '10px 20px', background: '#fff5f5', textAlign: 'center' }}>
        <p style={{
          color: '#8B0000',
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
