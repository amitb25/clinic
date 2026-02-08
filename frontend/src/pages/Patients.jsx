import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Phone, FileText } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import WarpLoader from '../components/common/WarpLoader';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { formatDate } from '../utils/helpers';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const BLOOD_GROUP_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
];

const Patients = () => {
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: '',
    medicalHistory: '',
    allergies: ''
  });

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients', {
        params: { search: searchTerm, page: currentPage, limit: 10 }
      });
      setPatients(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientPrescriptions = async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/prescriptions`);
      setPrescriptions(response.data.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const data = {
        ...formData,
        medicalHistory: formData.medicalHistory.split(',').map(s => s.trim()).filter(Boolean),
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (editingPatient) {
        await api.put(`/patients/${editingPatient._id}`, data);
        toast.success('Patient updated successfully!');
      } else {
        await api.post('/patients', data);
        toast.success('Patient created successfully!');
      }
      fetchPatients();
      closeModal();
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error(error.response?.data?.message || 'Error saving patient');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      setActionLoading(true);
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
        toast.success('Patient deleted successfully!');
      } catch (error) {
        console.error('Error deleting patient:', error);
        toast.error(error.response?.data?.message || 'Error deleting patient');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const openModal = (patient = null) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email || '',
        address: patient.address || '',
        bloodGroup: patient.bloodGroup || '',
        medicalHistory: patient.medicalHistory?.join(', ') || '',
        allergies: patient.allergies?.join(', ') || ''
      });
    } else {
      setEditingPatient(null);
      setFormData({
        name: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        bloodGroup: '',
        medicalHistory: '',
        allergies: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPatient(null);
  };

  const viewPatient = async (patient) => {
    setViewingPatient(patient);
    await fetchPatientPrescriptions(patient._id);
    setShowViewModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    {
      header: 'Patient ID',
      render: (patient) => (
        <span className="font-mono text-sm text-primary-600 dark:text-primary-400">
          {patient.patientId}
        </span>
      )
    },
    {
      header: 'Patient',
      render: (patient) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
            <span className="text-secondary-600 dark:text-secondary-400 font-medium">
              {patient.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{patient.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {patient.age} yrs, {patient.gender}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      render: (patient) => (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-3 h-3 text-gray-400" />
          {patient.phone}
        </div>
      )
    },
    {
      header: 'Blood Group',
      render: (patient) => (
        patient.bloodGroup ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {patient.bloodGroup}
          </span>
        ) : '-'
      )
    },
    {
      header: 'Registered',
      render: (patient) => (
        <span className="text-sm">{formatDate(patient.createdAt)}</span>
      )
    },
    {
      header: 'Actions',
      render: (patient) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => viewPatient(patient)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-secondary-500"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openModal(patient)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-500"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(patient._id)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Patients</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage patient records</p>
        </div>
        <Button icon={Plus} onClick={() => openModal()}>
          Add Patient
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or patient ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table columns={columns} data={patients} loading={loading} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                max="150"
              />
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={GENDER_OPTIONS}
                required
              />
            </div>
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Select
              label="Blood Group"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              options={BLOOD_GROUP_OPTIONS}
            />
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Medical History"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            placeholder="Comma-separated (e.g., Diabetes, Hypertension)"
          />

          <Input
            label="Allergies"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            placeholder="Comma-separated (e.g., Penicillin, Aspirin)"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingPatient ? 'Update' : 'Create'} Patient
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Patient Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Patient Details"
        size="lg"
      >
        {viewingPatient && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Patient ID</label>
                <p className="font-mono text-primary-600 dark:text-primary-400">{viewingPatient.patientId}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
                <p className="font-medium">{viewingPatient.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Age / Gender</label>
                <p>{viewingPatient.age} years, {viewingPatient.gender}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Phone</label>
                <p>{viewingPatient.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Blood Group</label>
                <p>{viewingPatient.bloodGroup || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Registered</label>
                <p>{formatDate(viewingPatient.createdAt)}</p>
              </div>
            </div>

            {/* Medical History */}
            {viewingPatient.medicalHistory?.length > 0 && (
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Medical History</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {viewingPatient.medicalHistory.map((item, i) => (
                    <span key={i} className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {viewingPatient.allergies?.length > 0 && (
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Allergies</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {viewingPatient.allergies.map((item, i) => (
                    <span key={i} className="px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prescriptions */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Prescription History
              </h3>
              {prescriptions.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {prescriptions.map((rx) => (
                    <div key={rx._id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{rx.prescriptionId}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Dr. {rx.doctor?.name} - {rx.diagnosis}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(rx.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No prescriptions found
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Patients;
