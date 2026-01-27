import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Eye, Edit2, Printer, Download, FileText, Stethoscope, Phone, Mail } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import api from '../services/api';
import { formatDate, formatDateTime, dosageToString } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

// Medicine Instructions in Hindi/Marathi/English
const INSTRUCTION_OPTIONS = [
  { value: 'जेवणापूर्वी / खाने से पहले / Before Food', label: 'जेवणापूर्वी / Before Food' },
  { value: 'जेवणानंतर / खाने के बाद / After Food', label: 'जेवणानंतर / After Food' },
  { value: 'रिकाम्या पोटी / खाली पेट / Empty Stomach', label: 'रिकाम्या पोटी / Empty Stomach' },
  { value: 'दुधासोबत / दूध के साथ / With Milk', label: 'दुधासोबत / With Milk' },
  { value: 'कोमट पाण्यासोबत / गुनगुने पानी के साथ / With Lukewarm Water', label: 'कोमट पाण्यासोबत / With Lukewarm Water' },
  { value: 'गरम पाण्यासोबत / गर्म पानी के साथ / With Hot Water', label: 'गरम पाण्यासोबत / With Hot Water' },
  { value: 'झोपण्यापूर्वी / सोने से पहले / Before Sleep', label: 'झोपण्यापूर्वी / Before Sleep' },
  { value: 'मधासोबत / शहद के साथ / With Honey', label: 'मधासोबत / With Honey' },
  { value: 'तुपासोबत / घी के साथ / With Ghee', label: 'तुपासोबत / With Ghee' },
  { value: 'चघळून खा / चबाकर खाएं / Chew & Eat', label: 'चघळून खा / Chew & Eat' },
  { value: 'गरजेनुसार / जरूरत के अनुसार / As Needed (SOS)', label: 'गरजेनुसार / As Needed (SOS)' },
  { value: 'बाह्य वापरासाठी / बाहरी उपयोग / External Use Only', label: 'बाह्य वापरासाठी / External Use' },
  { value: 'प्रभावित भागावर लावा / Apply on Affected Area', label: 'प्रभावित भागावर लावा / Apply on Area' },
];

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [clinicSettings, setClinicSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState(null);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const printRef = useRef();

  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    diagnosis: '',
    medicines: [{ medicine: '', medicineName: '', dosage: { morning: false, afternoon: false, night: false }, duration: '', instructions: '' }],
    advice: '',
    followUpDate: ''
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
    fetchDoctors();
    fetchMedicines();
    fetchClinicSettings();
  }, [currentPage]);

  const fetchClinicSettings = async () => {
    try {
      const response = await api.get('/clinic-settings');
      setClinicSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching clinic settings:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prescriptions', { params: { page: currentPage, limit: 10 } });
      setPrescriptions(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients', { params: { limit: 1000 } });
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicines', { params: { expired: 'false', active: 'true' } });
      setMedicines(response.data.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        medicines: formData.medicines.filter(m => m.medicine).map(m => ({
          ...m,
          medicineName: medicines.find(med => med._id === m.medicine)?.name || ''
        }))
      };

      if (editingPrescription) {
        await api.put(`/prescriptions/${editingPrescription._id}`, data);
      } else {
        await api.post('/prescriptions', data);
      }
      fetchPrescriptions();
      closeModal();
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert(error.response?.data?.message || 'Error saving prescription');
    }
  };

  const openModal = (prescription = null) => {
    if (prescription) {
      setEditingPrescription(prescription);
      setFormData({
        patient: prescription.patient?._id || '',
        doctor: prescription.doctor?._id || '',
        diagnosis: prescription.diagnosis || '',
        medicines: prescription.medicines?.map(m => ({
          medicine: m.medicine?._id || m.medicine || '',
          medicineName: m.medicineName || '',
          dosage: m.dosage || { morning: false, afternoon: false, night: false },
          duration: m.duration || '',
          instructions: m.instructions || ''
        })) || [{ medicine: '', medicineName: '', dosage: { morning: false, afternoon: false, night: false }, duration: '', instructions: '' }],
        advice: prescription.advice || '',
        followUpDate: prescription.followUpDate?.split('T')[0] || ''
      });
    } else {
      setEditingPrescription(null);
      setFormData({
        patient: '',
        doctor: user?.doctor?._id || '',
        diagnosis: '',
        medicines: [{ medicine: '', medicineName: '', dosage: { morning: false, afternoon: false, night: false }, duration: '', instructions: '' }],
        advice: '',
        followUpDate: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPrescription(null);
  };

  const viewPrescription = async (prescription) => {
    try {
      const response = await api.get(`/prescriptions/${prescription._id}`);
      setViewingPrescription(response.data.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching prescription:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { medicine: '', medicineName: '', dosage: { morning: false, afternoon: false, night: false }, duration: '', instructions: '' }]
    }));
  };

  const updateMedicine = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.map((item, i) => {
        if (i === index) {
          if (field === 'dosage') {
            return { ...item, dosage: { ...item.dosage, ...value } };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const removeMedicine = (index) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Prescription-${viewingPrescription?.prescriptionId}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0;
      }
      @media print {
        html, body {
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .prescription-print {
          width: 100% !important;
          max-width: 100% !important;
          min-height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: none !important;
          display: flex !important;
          flex-direction: column !important;
          page-break-inside: avoid;
        }
        .prescription-print * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .prescription-header { flex-shrink: 0; }
        .prescription-content { flex: 1 !important; }
        .prescription-bottom { flex-shrink: 0; margin-top: auto !important; }
        .prescription-footer { flex-shrink: 0; }
      }
    `
  });

  // Helper function to extract English text from multilingual instructions
  const getEnglishInstruction = (instruction) => {
    if (!instruction) return 'As directed';
    // Instructions format: "Marathi / Hindi / English"
    const parts = instruction.split('/');
    if (parts.length >= 3) {
      return parts[parts.length - 1].trim(); // Get last part (English)
    }
    // Check if it contains non-ASCII characters (Hindi/Marathi)
    if (/[^\x00-\x7F]/.test(instruction)) {
      return 'As directed';
    }
    return instruction;
  };

  // Helper function to format clinic timings for display
  // Returns { doubleLine: [...], singleLine: [...] } for separate display
  const formatClinicTimings = (timings, asObject = false) => {
    if (!timings || !Array.isArray(timings)) return asObject ? { doubleLine: [], singleLine: [] } : '';

    const openDays = timings.filter(t => t.isOpen);
    if (openDays.length === 0) return asObject ? { doubleLine: [], singleLine: [] } : '';

    // Format time from 24hr to 12hr
    const formatTime = (time) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours);
      const suffix = h >= 12 ? 'PM' : 'AM';
      const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      return `${displayHour}:${minutes}${suffix}`;
    };

    // Get time slots string for a day
    const getTimeSlots = (day) => {
      if (day.slotType === 'single') {
        return day.singleStart && day.singleEnd
          ? `${formatTime(day.singleStart)}-${formatTime(day.singleEnd)}`
          : '';
      } else {
        const morningSlot = day.morningStart && day.morningEnd
          ? `${formatTime(day.morningStart)}-${formatTime(day.morningEnd)}`
          : '';
        const eveningSlot = day.eveningStart && day.eveningEnd
          ? `${formatTime(day.eveningStart)}-${formatTime(day.eveningEnd)}`
          : '';
        return [morningSlot, eveningSlot].filter(Boolean).join(', ');
      }
    };

    // Check if two days have same timing config
    const sameTiming = (a, b) => {
      if (a.slotType !== b.slotType) return false;
      if (a.slotType === 'single') {
        return a.singleStart === b.singleStart && a.singleEnd === b.singleEnd;
      }
      return a.morningStart === b.morningStart && a.morningEnd === b.morningEnd &&
             a.eveningStart === b.eveningStart && a.eveningEnd === b.eveningEnd;
    };

    const dayAbbr = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };

    const doubleParts = []; // Morning + Evening slots
    const singleParts = []; // Single slots (separate line)

    let i = 0;
    while (i < openDays.length) {
      const current = openDays[i];
      let j = i;
      // Find consecutive days with same timings
      while (j < openDays.length - 1 && sameTiming(openDays[j + 1], current)) {
        j++;
      }

      const dayRange = i === j
        ? dayAbbr[current.day]
        : `${dayAbbr[current.day]}-${dayAbbr[openDays[j].day]}`;

      const timeSlots = getTimeSlots(current);
      if (timeSlots) {
        if (current.slotType === 'single') {
          singleParts.push(`${dayRange}: ${timeSlots}`);
        } else {
          doubleParts.push(`${dayRange}: ${timeSlots}`);
        }
      }

      i = j + 1;
    }

    if (asObject) {
      return { doubleLine: doubleParts, singleLine: singleParts };
    }

    // For simple string output (PDF), combine with line break indicator
    const allParts = [...doubleParts];
    if (singleParts.length > 0) {
      allParts.push(...singleParts);
    }
    return allParts.join(' | ');
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      // Clone the prescription content to a temporary container outside the modal
      const element = printRef.current;
      const clone = element.cloneNode(true);

      // A4 at 96dpi = 794 x 1123px, at 150dpi = 1240 x 1754px
      // Use 150dpi for better quality
      const a4WidthPx = 794;
      const a4HeightPx = 1123;

      // Create temporary container matching print layout
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = `${a4WidthPx}px`;
      tempContainer.style.height = `${a4HeightPx}px`;
      tempContainer.style.background = '#ffffff';
      tempContainer.style.overflow = 'hidden';

      // Match print styles exactly
      clone.style.width = '100%';
      clone.style.maxWidth = '100%';
      clone.style.minHeight = '100%';
      clone.style.height = '100%';
      clone.style.display = 'flex';
      clone.style.flexDirection = 'column';
      clone.style.margin = '0';
      clone.style.padding = '0';
      clone.style.boxSizing = 'border-box';

      // Apply print-like styles to children
      const header = clone.querySelector('.prescription-header');
      if (header) header.style.flexShrink = '0';

      const content = clone.querySelector('.prescription-content');
      if (content) content.style.flex = '1';

      const bottom = clone.querySelector('.prescription-bottom');
      if (bottom) {
        bottom.style.flexShrink = '0';
        bottom.style.marginTop = 'auto';
      }

      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 250));

      // Capture at high quality
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // A4 in mm
      const a4Width = 210;
      const a4Height = 297;

      const doc = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      doc.addImage(imgData, 'PNG', 0, 0, a4Width, a4Height);
      doc.save(`Prescription-${viewingPrescription?.prescriptionId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const filteredPrescriptions = prescriptions.filter(rx =>
    rx.prescriptionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Prescription ID',
      render: (rx) => (
        <span className="font-mono text-sm text-primary-600 dark:text-primary-400">
          {rx.prescriptionId}
        </span>
      )
    },
    {
      header: 'Patient',
      render: (rx) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white">{rx.patient?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{rx.patient?.patientId}</p>
        </div>
      )
    },
    {
      header: 'Doctor',
      render: (rx) => (
        <div>
          <p className="font-medium">Dr. {rx.doctor?.name}{rx.doctor?.qualification ? `, ${rx.doctor.qualification}` : ''}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{rx.doctor?.specialization}</p>
        </div>
      )
    },
    {
      header: 'Diagnosis',
      render: (rx) => (
        <p className="truncate max-w-xs">{rx.diagnosis}</p>
      )
    },
    {
      header: 'Date',
      render: (rx) => formatDate(rx.date)
    },
    {
      header: 'Actions',
      render: (rx) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => viewPrescription(rx)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-500"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={async () => {
              const response = await api.get(`/prescriptions/${rx._id}`);
              openModal(response.data.data);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-secondary-500"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Prescriptions</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage patient prescriptions</p>
        </div>
        <Button icon={Plus} onClick={() => openModal()}>
          New Prescription
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, patient or doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table columns={columns} data={filteredPrescriptions} loading={loading} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Create/Edit Prescription Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingPrescription ? "Edit Prescription" : "New Prescription"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Patient"
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              options={patients.map(p => ({ value: p._id, label: `${p.name} (${p.patientId})` }))}
              required
            />
            <Select
              label="Doctor"
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              options={doctors.map(d => ({ value: d._id, label: `Dr. ${d.name}${d.qualification ? ', ' + d.qualification : ''} - ${d.specialization}` }))}
              required
            />
          </div>

          <Input
            label="Diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
          />

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Medicines</label>
              <Button type="button" variant="outline" size="sm" onClick={addMedicine}>
                Add Medicine
              </Button>
            </div>
            <div className="space-y-4">
              {formData.medicines.map((med, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Select
                      placeholder="Select medicine"
                      value={med.medicine}
                      onChange={(e) => updateMedicine(index, 'medicine', e.target.value)}
                      options={medicines.map(m => ({ value: m._id, label: `${m.name} (${m.category})` }))}
                    />
                    <Input
                      type="number"
                      placeholder="Duration (days)"
                      value={med.duration}
                      onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                      min="1"
                    />
                    <Select
                      placeholder="Instructions / सूचना"
                      value={med.instructions}
                      onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                      options={INSTRUCTION_OPTIONS}
                    />
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Dosage:</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={med.dosage.morning}
                        onChange={(e) => updateMedicine(index, 'dosage', { morning: e.target.checked })}
                        className="rounded border-gray-300 text-primary-500"
                      />
                      <span className="text-sm">Morning</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={med.dosage.afternoon}
                        onChange={(e) => updateMedicine(index, 'dosage', { afternoon: e.target.checked })}
                        className="rounded border-gray-300 text-primary-500"
                      />
                      <span className="text-sm">Afternoon</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={med.dosage.night}
                        onChange={(e) => updateMedicine(index, 'dosage', { night: e.target.checked })}
                        className="rounded border-gray-300 text-primary-500"
                      />
                      <span className="text-sm">Night</span>
                    </label>
                    {formData.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="ml-auto text-red-500 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Advice</label>
              <textarea
                name="advice"
                value={formData.advice}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="Additional advice for the patient..."
              />
            </div>
            <Input
              label="Follow-up Date"
              type="date"
              name="followUpDate"
              value={formData.followUpDate}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingPrescription ? 'Update Prescription' : 'Create Prescription'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Prescription Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Prescription Details"
        size="lg"
      >
        {viewingPrescription && (
          <div>
            {/* Print Actions */}
            <div className="flex justify-end gap-2 mb-4 no-print">
              <Button variant="outline" icon={Printer} onClick={handlePrint}>
                Print
              </Button>
              <Button variant="secondary" icon={Download} onClick={handleDownloadPDF}>
                Download PDF
              </Button>
            </div>

            {/* Printable Content - Professional Medical Prescription */}
            <div ref={printRef} className="prescription-print bg-white text-black" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'auto' }}>
              {/* ===== HEADER ===== */}
              <div className="prescription-header" style={{ borderBottom: '3px solid #1e40af', paddingBottom: '15px', marginBottom: '15px' }}>
                {/* Top Header - Clinic Info */}
                <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0891b2 100%)', padding: '20px 25px', color: 'white', borderRadius: '0 0 20px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Left - Clinic Details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <svg width="60" height="60" viewBox="0 0 60 60" style={{ flexShrink: 0 }}>
                        <circle cx="30" cy="30" r="28" fill="#ffffff" stroke="#ffffff" strokeWidth="2"/>
                        <circle cx="30" cy="30" r="22" fill="#3b82f6"/>
                        <path d="M30 18 L30 42 M18 30 L42 30" stroke="#ffffff" strokeWidth="5" strokeLinecap="round"/>
                      </svg>
                      <div>
                        <h1 style={{
                          fontSize: '32px',
                          fontWeight: '800',
                          margin: 0,
                          letterSpacing: '2px',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                          color: '#ffffff'
                        }}>
                          {clinicSettings?.clinicName || 'Sariva Clinic'}
                        </h1>
                        {clinicSettings?.tagline && (
                          <p style={{ fontSize: '13px', margin: '5px 0 0 0', opacity: 0.95, fontStyle: 'italic', letterSpacing: '0.5px' }}>{clinicSettings.tagline}</p>
                        )}
                        {(() => {
                          const timingsData = formatClinicTimings(clinicSettings?.timings, true);
                          const hasTimings = timingsData.doubleLine.length > 0 || timingsData.singleLine.length > 0;
                          if (!hasTimings) return null;
                          return (
                            <div style={{ fontSize: '11px', margin: '5px 0 0 0', opacity: 0.9 }}>
                              {timingsData.doubleLine.length > 0 && (
                                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span>🕐</span> {timingsData.doubleLine.join(' | ')}
                                </p>
                              )}
                              {timingsData.singleLine.length > 0 && (
                                <p style={{ margin: timingsData.doubleLine.length > 0 ? '2px 0 0 18px' : 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  {timingsData.doubleLine.length === 0 && <span>🕐</span>}
                                  {timingsData.singleLine.join(' | ')}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Right - Doctor Details */}
                    <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.15)', padding: '12px 18px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>
                        Dr. {viewingPrescription.doctor?.name}
                      </h2>
                      <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: '#fef3c7', fontWeight: '600' }}>
                        {viewingPrescription.doctor?.qualification}
                      </p>
                      <p style={{ fontSize: '12px', margin: '2px 0 0 0', opacity: 0.9 }}>
                        {viewingPrescription.doctor?.specialization}
                      </p>
                      {viewingPrescription.doctor?.phone && (
                        <p style={{ fontSize: '11px', margin: '4px 0 0 0', opacity: 0.85 }}>
                          📞 {viewingPrescription.doctor.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== PRESCRIPTION INFO BAR ===== */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 25px', background: '#f0f9ff', borderLeft: '4px solid #1e40af', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prescription No:</span>
                  <span style={{ fontWeight: '700', color: '#1e40af', fontSize: '15px' }}>{viewingPrescription.prescriptionId}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Time:</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{formatDateTime(viewingPrescription.date)}</span>
                </div>
              </div>

              <div className="prescription-content" style={{ padding: '0 25px 20px', flex: '1' }}>
                {/* ===== PATIENT INFO ===== */}
                <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>
                    <span style={{ fontSize: '16px' }}>👤</span>
                    <h3 style={{ color: '#1e40af', fontSize: '14px', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient Information</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</span>
                      <p style={{ margin: '3px 0 0 0', fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{viewingPrescription.patient?.name}</p>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age / Gender</span>
                      <p style={{ margin: '3px 0 0 0', fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{viewingPrescription.patient?.age} yrs, {viewingPrescription.patient?.gender}</p>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient ID</span>
                      <p style={{ margin: '3px 0 0 0', fontWeight: '600', fontSize: '14px', color: '#1e40af' }}>{viewingPrescription.patient?.patientId}</p>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</span>
                      <p style={{ margin: '3px 0 0 0', fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{viewingPrescription.patient?.phone || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* ===== RX & DIAGNOSIS ===== */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'center' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '28px', fontWeight: '700', color: 'white', fontFamily: 'Georgia, serif' }}>℞</span>
                  </div>
                  <div style={{ flex: 1, background: '#fef9c3', borderRadius: '8px', padding: '10px 15px', borderLeft: '4px solid #eab308' }}>
                    <span style={{ color: '#854d0e', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginRight: '8px' }}>Diagnosis:</span>
                    <span style={{ color: '#422006', fontSize: '16px', fontWeight: '700' }}>{viewingPrescription.diagnosis}</span>
                  </div>
                </div>

                {/* ===== MEDICINES TABLE ===== */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '16px' }}>💊</span>
                    <h3 style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prescribed Medicines</h3>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '13px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0891b2 100%)' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '11px', width: '35px' }}>#</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '11px' }}>Medicine Name</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '11px', width: '150px' }}>Dosage</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '11px', width: '70px' }}>Duration</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '11px' }}>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingPrescription.medicines?.map((med, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px 10px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', color: '#1e40af', fontSize: '13px' }}>{idx + 1}</td>
                          <td style={{ padding: '8px 10px', verticalAlign: 'middle', fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>{med.medicineName || med.medicine?.name}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', display: 'inline-block', whiteSpace: 'nowrap' }}>
                              {dosageToString(med.dosage)}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', display: 'inline-block', whiteSpace: 'nowrap' }}>
                              {med.duration} days
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', verticalAlign: 'middle', color: '#475569', fontSize: '11px' }}>
                            {med.instructions || 'As directed'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* ===== BOTTOM SECTION (Sticky) - Advice, Follow-up, Signature & Footer ===== */}
              <div className="prescription-bottom" style={{ marginTop: 'auto' }}>
                {/* Advice & Signature Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '15px 25px', gap: '20px' }}>
                  {/* Left Side - Advice & Follow-up */}
                  <div style={{ flex: '1' }}>
                    {viewingPrescription.advice && (
                      <div style={{ background: '#dcfce7', borderRadius: '8px', padding: '10px 15px', borderLeft: '4px solid #22c55e', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#166534', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Advice:</span>
                        <span style={{ color: '#14532d', fontSize: '12px', fontWeight: '600' }}>{viewingPrescription.advice}</span>
                      </div>
                    )}
                    {viewingPrescription.followUpDate && (
                      <p style={{ margin: 0 }}>
                        <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>Follow-up Date: </span>
                        <span style={{ fontWeight: '700', color: '#1e40af', fontSize: '14px' }}>{formatDate(viewingPrescription.followUpDate)}</span>
                      </p>
                    )}
                  </div>

                  {/* Signature - Right Side */}
                  <div style={{ textAlign: 'center', minWidth: '220px' }}>
                    {viewingPrescription.doctor?.signature ? (
                      <div style={{ marginBottom: '5px', padding: '8px', background: '#fafafa', borderRadius: '8px' }}>
                        <img
                          src={viewingPrescription.doctor.signature}
                          alt="Doctor Signature"
                          style={{ height: '60px', width: '180px', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <div style={{ borderBottom: '2px solid #1e40af', width: '180px', marginBottom: '10px', marginLeft: 'auto', marginRight: 'auto' }}></div>
                    )}
                    <p style={{ fontWeight: '700', margin: '0 0 2px 0', color: '#0f172a', fontSize: '14px' }}>
                      Dr. {viewingPrescription.doctor?.name}{viewingPrescription.doctor?.qualification ? `, ${viewingPrescription.doctor.qualification}` : ''}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{viewingPrescription.doctor?.specialization}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="prescription-footer" style={{ borderTop: '3px solid #1e40af', padding: '12px 25px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', textAlign: 'center' }}>
                {(clinicSettings?.address || clinicSettings?.city) && (
                  <p style={{ color: '#1e40af', fontSize: '11px', margin: '0 0 5px 0', fontWeight: '500' }}>
                    📍 {[clinicSettings?.address, clinicSettings?.city, clinicSettings?.state, clinicSettings?.pincode].filter(Boolean).join(', ')}
                  </p>
                )}
                {(clinicSettings?.phone || clinicSettings?.email) && (
                  <p style={{ color: '#1e40af', fontSize: '11px', margin: '0 0 8px 0', fontWeight: '500' }}>
                    {clinicSettings?.phone && `📞 ${clinicSettings.phone}`}
                    {clinicSettings?.phone && clinicSettings?.email && ' | '}
                    {clinicSettings?.email && `✉️ ${clinicSettings.email}`}
                  </p>
                )}
                <p style={{
                  color: '#1e40af',
                  fontSize: '14px',
                  margin: 0,
                  fontWeight: '800',
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}>
                  ✚ {clinicSettings?.clinicName || 'Sariva Clinic'} ✚
                </p>
              </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Prescriptions;
