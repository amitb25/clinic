import React, { forwardRef } from 'react';
import { formatDate, formatDateTime, dosageToString } from '../../../utils/helpers';
import { translateToMarathi, translateDosage } from '../prescriptionUtils';

const ClassicTraditionalTemplate = forwardRef(({ prescription, clinicSettings }, ref) => {
  return (
    <div ref={ref} className="prescription-print bg-white text-black" style={{ fontFamily: "Arial, sans-serif", maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'auto', padding: '0' }}>

      {/* ===== HEADER ===== */}
      <div className="prescription-header" style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 15px' }}>

          {/* Left - Doctor Details */}
          <div style={{ fontSize: '11px', lineHeight: '1.4', minWidth: '180px' }}>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#000' }}>
              Dr. {prescription.doctor?.name}
            </p>
            <p style={{ margin: '2px 0', fontSize: '11px', color: '#333' }}>
              {prescription.doctor?.qualification}
            </p>
            {prescription.doctor?.registrationNo && (
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#333' }}>
                Reg. No: {prescription.doctor.registrationNo}
              </p>
            )}
            {prescription.doctor?.phone && (
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#333' }}>
                Mob. No: {prescription.doctor.phone}
              </p>
            )}
          </div>

          {/* Center - Logo */}
          <div style={{ textAlign: 'center', padding: '0 15px' }}>
            <img
              src="/caduceus-logo.png"
              alt="Medical Logo"
              style={{ width: '50px', height: '55px', objectFit: 'contain' }}
            />
          </div>

          {/* Right - Clinic Details */}
          <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.4', minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '2px' }}>
              <img
                src="/clinic-logo-left.png"
                alt="Clinic Logo"
                style={{ width: '35px', height: '35px', objectFit: 'contain' }}
              />
              <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#000' }}>
                {clinicSettings?.clinicNameHindi || clinicSettings?.name || 'Clinic'}
              </p>
            </div>
            {clinicSettings?.phone && (
              <p style={{ margin: '2px 0', fontSize: '10px', color: '#333' }}>
                Ph: {clinicSettings.phone}
              </p>
            )}
            <p style={{ margin: '2px 0', fontSize: '10px', color: '#333' }}>
              Timing: 10:00 AM - 02:00 PM,
            </p>
            <p style={{ margin: '2px 0', fontSize: '10px', color: '#333' }}>
              05:30 PM - 09:30 PM
            </p>
          </div>
        </div>
      </div>

      {/* ===== PATIENT INFO BAR ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 15px', borderBottom: '1px solid #000', marginBottom: '10px' }}>
        <div style={{ fontSize: '11px' }}>
          <span style={{ fontWeight: '700' }}>ID: {prescription.patient?.patientId}</span>
          <span style={{ marginLeft: '5px' }}>- {prescription.patient?.name?.toUpperCase()}</span>
          <span style={{ marginLeft: '5px' }}>({prescription.patient?.gender?.charAt(0)?.toUpperCase()})</span>
          <span style={{ marginLeft: '5px' }}>/ {prescription.patient?.age} Y</span>
          {prescription.patient?.phone && (
            <span style={{ marginLeft: '15px' }}>Mob. No.: {prescription.patient.phone}</span>
          )}
        </div>
        <div style={{ fontSize: '11px', fontWeight: '600' }}>
          Date: {formatDate(prescription.date)}
        </div>
      </div>

      <div className="prescription-content" style={{ padding: '0 15px', flex: '1' }}>

        {/* ===== DIAGNOSIS ===== */}
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: 0, fontSize: '11px' }}>
            <span style={{ fontWeight: '700' }}>Diagnosis:</span>
          </p>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#000' }}>
            * {prescription.diagnosis}
          </p>
        </div>

        {/* ===== RX SYMBOL ===== */}
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'Georgia, serif' }}>&#8478;</span>
        </div>

        {/* ===== MEDICINES TABLE ===== */}
        <div style={{ marginBottom: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: '700', fontSize: '11px', width: '45%' }}>Medicine Name</th>
                <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: '700', fontSize: '11px', width: '30%' }}>Dosage</th>
                <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: '700', fontSize: '11px', width: '25%' }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines?.map((med, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px 4px', verticalAlign: 'top', fontSize: '11px' }}>
                    <span style={{ fontWeight: '600' }}>{idx + 1}) {med.medicineName || med.medicine?.name}</span>
                  </td>
                  <td style={{ padding: '8px 4px', verticalAlign: 'top', fontSize: '11px' }}>
                    {dosageToString(med.dosage)}
                    {med.instructions && (
                      <div style={{ fontSize: '10px', color: '#555' }}>
                        ({med.instructions})
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px 4px', verticalAlign: 'top', fontSize: '11px' }}>
                    {med.duration} Days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ===== BOTTOM SECTION ===== */}
      <div className="prescription-bottom" style={{ marginTop: 'auto', padding: '0 15px 15px' }}>

        {/* Advice */}
        {prescription.advice && (
          <div style={{ marginBottom: '10px' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '700' }}>Advice:</p>
            <p style={{ margin: '3px 0 0 0', fontSize: '11px' }}>* {prescription.advice}</p>
          </div>
        )}

        {/* Follow Up */}
        {prescription.followUpDate && (
          <div style={{ marginBottom: '15px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700' }}>Follow Up: </span>
            <span style={{ fontSize: '11px' }}>{formatDate(prescription.followUpDate)}</span>
          </div>
        )}

        {/* Signature */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <div style={{ textAlign: 'center', minWidth: '180px' }}>
            {prescription.doctor?.signature ? (
              <div style={{ marginBottom: '5px' }}>
                <img
                  src={prescription.doctor.signature}
                  alt="Signature"
                  style={{ height: '40px', width: '120px', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div style={{ borderBottom: '1px solid #000', width: '120px', marginBottom: '5px', marginLeft: 'auto', marginRight: 'auto' }}></div>
            )}
            <p style={{ fontWeight: '700', margin: '0', fontSize: '12px', color: '#000' }}>
              Dr. {prescription.doctor?.name}
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#333' }}>
              {prescription.doctor?.qualification}
            </p>
          </div>
        </div>

        {/* Footer Line */}
        <div style={{ borderTop: '1px solid #ccc', marginTop: '15px', paddingTop: '8px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '10px', color: '#333', fontWeight: '500' }}>
            {clinicSettings?.address || 'Clinic Address'}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '9px', color: '#666', fontStyle: 'italic' }}>
            Substitute with equivalent Generics as required.
          </p>
        </div>
      </div>

      {/* ===== DIET PLAN - SEPARATE PAGE ===== */}
      {prescription.dietPlan && (
        <div style={{ pageBreakBefore: 'always', padding: '30px 20px', fontFamily: "Arial, sans-serif" }}>
          <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #000' }}>
            <h2 style={{ margin: 0, color: '#000', fontSize: '18px', fontWeight: '700' }}>Diet Plan / आहार योजना</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#333' }}>
              Patient: <strong>{prescription.patient?.name}</strong> | Rx: <strong>{prescription.prescriptionId}</strong> | Date: <strong>{formatDate(prescription.date)}</strong>
            </p>
            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#555' }}>
              Diagnosis: <strong>{prescription.diagnosis}</strong>
            </p>
          </div>
          <div style={{ padding: '15px', border: '1px solid #000', lineHeight: '1.6' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#000', whiteSpace: 'pre-line' }}>{prescription.dietPlan}</p>
          </div>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: '700', color: '#000', fontSize: '12px' }}>Dr. {prescription.doctor?.name}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#333' }}>{prescription.doctor?.qualification}</p>
          </div>
        </div>
      )}
    </div>
  );
});

ClassicTraditionalTemplate.displayName = 'ClassicTraditionalTemplate';

export default ClassicTraditionalTemplate;
