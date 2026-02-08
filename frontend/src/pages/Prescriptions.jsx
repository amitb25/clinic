import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Eye, Edit2, Printer, Download, FileText, Stethoscope, Phone, Mail, Sparkles, Loader2, Check, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import SearchableSelect from '../components/common/SearchableSelect';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import WarpLoader from '../components/common/WarpLoader';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { formatDate, formatDateTime, dosageToString } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { PRESCRIPTION_TEMPLATES, getTemplateById } from '../components/prescriptions/templates';

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

// Translation helper for print/PDF - English to Marathi
const translateToMarathi = (text) => {
  if (!text) return 'डॉक्टरांच्या सल्ल्यानुसार';

  const translations = {
    // Instructions
    'before food': 'जेवणापूर्वी',
    'after food': 'जेवणानंतर',
    'empty stomach': 'रिकाम्या पोटी',
    'with milk': 'दुधासोबत',
    'with water': 'पाण्यासोबत',
    'with lukewarm water': 'कोमट पाण्यासोबत',
    'with hot water': 'गरम पाण्यासोबत',
    'before sleep': 'झोपण्यापूर्वी',
    'at bedtime': 'झोपण्यापूर्वी',
    'with honey': 'मधासोबत',
    'with ghee': 'तुपासोबत',
    'chew': 'चघळून खा',
    'as needed': 'गरजेनुसार',
    'sos': 'गरजेनुसार',
    'external use': 'बाह्य वापरासाठी',
    'apply on affected area': 'प्रभावित भागावर लावा',
    'as directed': 'डॉक्टरांच्या सल्ल्यानुसार',
    'as directed by physician': 'डॉक्टरांच्या सल्ल्यानुसार',
    'once daily': 'दिवसातून एकदा',
    'twice daily': 'दिवसातून दोनदा',
    'thrice daily': 'दिवसातून तीनदा',
    'morning': 'सकाळी',
    'afternoon': 'दुपारी',
    'evening': 'संध्याकाळी',
    'night': 'रात्री',
    // Dosage related
    'tablet': 'गोळी',
    'tablets': 'गोळ्या',
    'capsule': 'कॅप्सूल',
    'capsules': 'कॅप्सूल',
    'syrup': 'सिरप',
    'ml': 'मिली',
    'drops': 'थेंब',
    'teaspoon': 'चमचा',
    'tablespoon': 'मोठा चमचा',
    // Time
    'days': 'दिवस',
    'day': 'दिवस',
    'week': 'आठवडा',
    'weeks': 'आठवडे',
    'month': 'महिना',
    'months': 'महिने',
    // Gender
    'male': 'पुरुष',
    'female': 'स्त्री',
    'other': 'इतर',
    // Common
    'years': 'वर्षे',
    'yrs': 'वर्षे',
  };

  let result = text.toLowerCase();

  // Check for exact match first
  if (translations[result]) {
    return translations[result];
  }

  // Replace all matching words
  Object.keys(translations).forEach(eng => {
    const regex = new RegExp(eng, 'gi');
    result = result.replace(regex, translations[eng]);
  });

  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
};

// Translate dosage to Marathi
const translateDosage = (dosageStr) => {
  if (!dosageStr) return '';
  let result = dosageStr;

  // Replace common patterns
  result = result.replace(/morning/gi, 'सकाळी');
  result = result.replace(/afternoon/gi, 'दुपारी');
  result = result.replace(/evening/gi, 'संध्याकाळी');
  result = result.replace(/night/gi, 'रात्री');

  return result;
};

const Prescriptions = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [clinicSettings, setClinicSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState(null);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('light-red');
  const printRef = useRef();

  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    diagnosis: '',
    medicines: [{ medicine: '', medicineName: '', dosage: { morning: false, afternoon: false, night: false }, duration: '', instructions: '' }],
    dietPlan: '',
    advice: '',
    followUpDate: ''
  });

  // AI Diet Plan states
  const [aiDietPlan, setAiDietPlan] = useState('');
  const [dietPlanLoading, setDietPlanLoading] = useState(false);
  const [dietPlanError, setDietPlanError] = useState('');
  const diagnosisTimerRef = useRef(null);

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

  const fetchAiDietPlan = async (diagnosis) => {
    if (!diagnosis || diagnosis.trim().length < 3) {
      setAiDietPlan('');
      return;
    }
    try {
      setDietPlanLoading(true);
      setDietPlanError('');
      const selectedPatient = patients.find(p => p._id === formData.patient);
      const response = await api.post('/ai/diet-plan', {
        diagnosis: diagnosis.trim(),
        patientAge: selectedPatient?.age,
        patientGender: selectedPatient?.gender
      });
      setAiDietPlan(response.data.data.dietPlan);
    } catch (error) {
      console.error('Error fetching AI diet plan:', error);
      setDietPlanError(error.response?.data?.message || 'Failed to generate diet plan');
    } finally {
      setDietPlanLoading(false);
    }
  };

  const handleDiagnosisChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, diagnosis: value }));

    // Debounce AI call - wait 2 seconds after user stops typing
    if (diagnosisTimerRef.current) {
      clearTimeout(diagnosisTimerRef.current);
    }
    diagnosisTimerRef.current = setTimeout(() => {
      fetchAiDietPlan(value);
    }, 2000);
  };

  const acceptDietPlan = () => {
    setFormData(prev => ({ ...prev, dietPlan: aiDietPlan }));
    setAiDietPlan('');
  };

  const dismissDietPlan = () => {
    setAiDietPlan('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const data = {
        ...formData,
        dietPlan: formData.dietPlan,
        medicines: formData.medicines.filter(m => m.medicine).map(m => ({
          ...m,
          medicineName: medicines.find(med => med._id === m.medicine)?.name || ''
        }))
      };

      if (editingPrescription) {
        await api.put(`/prescriptions/${editingPrescription._id}`, data);
        toast.success('Prescription updated successfully!');
      } else {
        await api.post('/prescriptions', data);
        toast.success('Prescription created successfully!');
      }
      fetchPrescriptions();
      closeModal();
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error(error.response?.data?.message || 'Error saving prescription');
    } finally {
      setActionLoading(false);
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
        dietPlan: prescription.dietPlan || '',
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
        dietPlan: '',
        advice: '',
        followUpDate: ''
      });
    }
    setAiDietPlan('');
    setDietPlanError('');
    setDietPlanLoading(false);
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
      toast.error('Error generating PDF. Please try again.');
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
      <WarpLoader visible={actionLoading} />
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
              onChange={handleDiagnosisChange}
              required
              rows={3}
              className="input"
              placeholder="Enter diagnosis..."
            />
          </div>

          {/* AI Diet Plan Suggestion */}
          {dietPlanLoading && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-sm text-blue-600 dark:text-blue-400">Generating AI Diet Plan...</span>
            </div>
          )}

          {dietPlanError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <X className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">{dietPlanError}</span>
            </div>
          )}

          {aiDietPlan && !dietPlanLoading && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">AI Suggested Diet Plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={acceptDietPlan}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </button>
                  <button
                    type="button"
                    onClick={dismissDietPlan}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    <X className="w-3 h-3" /> Dismiss
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{aiDietPlan}</p>
            </div>
          )}

          {/* Diet Plan Field */}
          <div>
            <label className="label">Diet Plan {formData.dietPlan && <span className="text-emerald-500 text-xs ml-1">(AI Generated)</span>}</label>
            <textarea
              name="dietPlan"
              value={formData.dietPlan}
              onChange={handleChange}
              rows={4}
              className="input"
              placeholder="Diet plan will be auto-generated by AI based on diagnosis, or enter manually..."
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
                    <SearchableSelect
                      placeholder="Search medicine..."
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
            {/* Print Actions with Template Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 no-print">
              {/* Template Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Design:</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {PRESCRIPTION_TEMPLATES.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" icon={Printer} onClick={handlePrint}>
                  Print
                </Button>
                <Button variant="secondary" icon={Download} onClick={handleDownloadPDF}>
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Dynamic Template Rendering */}
            {(() => {
              const TemplateComponent = getTemplateById(selectedTemplate).component;
              return (
                <TemplateComponent
                  ref={printRef}
                  prescription={viewingPrescription}
                  clinicSettings={clinicSettings}
                />
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Prescriptions;
