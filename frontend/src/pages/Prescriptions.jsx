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

          <div>
            <label className="label">Diagnosis <span className="text-red-500">*</span></label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
              rows={3}
              className="input"
              placeholder="Enter diagnosis..."
            />
          </div>

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

            {/* Printable Content - Traditional Indian Clinic Prescription */}
            <div ref={printRef} className="prescription-print bg-white text-black" style={{ fontFamily: "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif", maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'auto' }}>
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
                        डॉ. {viewingPrescription.doctor?.name}
                      </p>
                      <p style={{ margin: '2px 0', fontSize: '12px', color: '#333' }}>
                        {viewingPrescription.doctor?.qualification}
                      </p>
                      {viewingPrescription.doctor?.registrationNo && (
                        <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>
                          Reg No.: {viewingPrescription.doctor.registrationNo}
                        </p>
                      )}
                      {viewingPrescription.doctor?.phone && (
                        <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>
                          M.No.: {viewingPrescription.doctor.phone}
                        </p>
                      )}
                    </div>

                    {/* Center - Clinic Name with Caduceus Logo */}
                    <div style={{ textAlign: 'center', flex: 1, padding: '0 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        {/* Left Caduceus Logo */}
                        <img
                          src="/caduceus-logo.png"
                          alt="Medical Logo"
                          style={{ width: '40px', height: '50px', objectFit: 'contain' }}
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
                        - {viewingPrescription.doctor?.specialization}
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
                    📍 {clinicSettings?.address || 'Clinic Address'}
                    {clinicSettings?.phone && <span style={{ marginLeft: '12px' }}>📞 {clinicSettings.phone}</span>}
                  </p>
                </div>

                {/* Decorative Bottom Border */}
                <div style={{ height: '4px', background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FFA500 75%, #FFD700 100%)' }}></div>
              </div>

              {/* ===== PRESCRIPTION INFO BAR ===== */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#fff5f5', borderLeft: '4px solid #8B0000', marginBottom: '15px', marginLeft: '20px', marginRight: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#666', fontSize: '12px' }}>Prescription No:</span>
                  <span style={{ fontWeight: '700', color: '#8B0000', fontSize: '14px' }}>{viewingPrescription.prescriptionId}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#666', fontSize: '12px' }}>Date:</span>
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>{formatDateTime(viewingPrescription.date)}</span>
                </div>
              </div>

              <div className="prescription-content" style={{ padding: '0 20px 15px', flex: '1' }}>
                {/* ===== PATIENT INFO ===== */}
                <div style={{ border: '1px solid #8B0000', borderRadius: '8px', padding: '12px 15px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #8B0000' }}>
                    <h3 style={{ color: '#8B0000', fontSize: '13px', fontWeight: '700', margin: 0 }}>रुग्णाची माहिती / Patient Information</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div>
                      <span style={{ color: '#666', fontSize: '10px' }}>नाव / Name</span>
                      <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '13px', color: '#000' }}>{viewingPrescription.patient?.name}</p>
                    </div>
                    <div>
                      <span style={{ color: '#666', fontSize: '10px' }}>वय / Age</span>
                      <p style={{ margin: '2px 0 0 0', fontWeight: '600', fontSize: '13px', color: '#000' }}>{viewingPrescription.patient?.age} वर्षे, {viewingPrescription.patient?.gender}</p>
                    </div>
                    <div>
                      <span style={{ color: '#666', fontSize: '10px' }}>Patient ID</span>
                      <p style={{ margin: '2px 0 0 0', fontWeight: '600', fontSize: '13px', color: '#8B0000' }}>{viewingPrescription.patient?.patientId}</p>
                    </div>
                    <div>
                      <span style={{ color: '#666', fontSize: '10px' }}>फोन / Phone</span>
                      <p style={{ margin: '2px 0 0 0', fontWeight: '600', fontSize: '13px', color: '#000' }}>{viewingPrescription.patient?.phone || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* ===== RX & DIAGNOSIS ===== */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
                  <div style={{ background: '#8B0000', borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: 'white', fontFamily: 'Georgia, serif' }}>℞</span>
                  </div>
                  <div style={{ flex: 1, background: '#fff5f5', borderRadius: '6px', padding: '8px 12px', borderLeft: '3px solid #8B0000' }}>
                    <span style={{ color: '#8B0000', fontSize: '10px', fontWeight: '600', marginRight: '8px' }}>निदान / Diagnosis:</span>
                    <span style={{ color: '#000', fontSize: '14px', fontWeight: '700' }}>{viewingPrescription.diagnosis}</span>
                  </div>
                </div>

                {/* ===== MEDICINES TABLE ===== */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <h3 style={{ color: '#8B0000', fontSize: '12px', fontWeight: '700', margin: 0 }}>औषधे / Medicines</h3>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #8B0000' }}>
                    <thead>
                      <tr style={{ background: '#8B0000' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '10px', width: '30px', borderRight: '1px solid #fff' }}>#</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '10px', borderRight: '1px solid #fff' }}>औषधाचे नाव / Medicine</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '10px', width: '120px', borderRight: '1px solid #fff' }}>डोस / Dosage</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '10px', width: '60px', borderRight: '1px solid #fff' }}>दिवस</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '10px' }}>सूचना / Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingPrescription.medicines?.map((med, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fff5f5', borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', color: '#8B0000', fontSize: '12px', borderRight: '1px solid #ddd' }}>{idx + 1}</td>
                          <td style={{ padding: '6px 8px', verticalAlign: 'middle', fontWeight: '700', color: '#000', fontSize: '12px', borderRight: '1px solid #ddd' }}>{med.medicineName || med.medicine?.name}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #ddd' }}>
                            <span style={{ background: '#fff5f5', color: '#8B0000', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', display: 'inline-block', whiteSpace: 'nowrap', border: '1px solid #8B0000' }}>
                              {dosageToString(med.dosage)}
                            </span>
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', borderRight: '1px solid #ddd' }}>
                            {med.duration} दिवस
                          </td>
                          <td style={{ padding: '6px 8px', verticalAlign: 'middle', color: '#333', fontSize: '10px' }}>
                            {med.instructions || 'डॉक्टरांच्या सल्ल्यानुसार'}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '12px 20px', gap: '20px' }}>
                  {/* Left Side - Advice & Follow-up */}
                  <div style={{ flex: '1' }}>
                    {viewingPrescription.advice && (
                      <div style={{ background: '#fff5f5', borderRadius: '6px', padding: '8px 12px', borderLeft: '3px solid #8B0000', marginBottom: '8px' }}>
                        <span style={{ color: '#8B0000', fontSize: '10px', fontWeight: '700' }}>सल्ला / Advice: </span>
                        <span style={{ color: '#000', fontSize: '11px', fontWeight: '600' }}>{viewingPrescription.advice}</span>
                      </div>
                    )}
                    {viewingPrescription.followUpDate && (
                      <p style={{ margin: 0 }}>
                        <span style={{ color: '#666', fontSize: '11px', fontWeight: '600' }}>पुढील भेट / Follow-up: </span>
                        <span style={{ fontWeight: '700', color: '#8B0000', fontSize: '13px' }}>{formatDate(viewingPrescription.followUpDate)}</span>
                      </p>
                    )}
                  </div>

                  {/* Signature - Right Side */}
                  <div style={{ textAlign: 'center', minWidth: '200px' }}>
                    {viewingPrescription.doctor?.signature ? (
                      <div style={{ marginBottom: '5px', padding: '5px' }}>
                        <img
                          src={viewingPrescription.doctor.signature}
                          alt="Doctor Signature"
                          style={{ height: '50px', width: '150px', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <div style={{ borderBottom: '2px solid #8B0000', width: '150px', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }}></div>
                    )}
                    <p style={{ fontWeight: '700', margin: '0 0 2px 0', color: '#8B0000', fontSize: '13px' }}>
                      डॉ. {viewingPrescription.doctor?.name}
                    </p>
                    <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>{viewingPrescription.doctor?.qualification}</p>
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
                  ❧ {clinicSettings?.clinicNameHindi || 'सारिवा क्लिनिक'} ❧
                </p>
                {(clinicSettings?.address || clinicSettings?.phone) && (
                  <p style={{ color: '#666', fontSize: '10px', margin: '5px 0 0 0' }}>
                    {clinicSettings?.address && <span>{clinicSettings.address}</span>}
                    {clinicSettings?.address && clinicSettings?.phone && <span> | </span>}
                    {clinicSettings?.phone && <span>📞 {clinicSettings.phone}</span>}
                  </p>
                )}
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
