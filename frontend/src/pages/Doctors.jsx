import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, Award, Upload, X, PenTool } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Table from '../components/common/Table';
import api from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    registrationNo: '',
    consultationFee: '',
    availability: [],
    createUser: false,
    password: '',
    signature: ''
  });
  const signatureInputRef = useRef(null);

  useEffect(() => {
    fetchDoctors();
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [specRes, qualRes] = await Promise.all([
        api.get('/specializations?active=true'),
        api.get('/qualifications?active=true')
      ]);
      setSpecializations(specRes.data.data.map(s => ({ value: s.name, label: s.name })));
      setQualifications(qualRes.data.data.map(q => ({ value: q.shortName || q.name, label: q.shortName ? `${q.name} (${q.shortName})` : q.name })));
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor._id}`, formData);
      } else {
        await api.post('/doctors', formData);
      }
      fetchDoctors();
      closeModal();
    } catch (error) {
      console.error('Error saving doctor:', error);
      alert(error.response?.data?.message || 'Error saving doctor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.delete(`/doctors/${id}`);
        fetchDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const openModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        registrationNo: doctor.registrationNo || '',
        consultationFee: doctor.consultationFee,
        availability: doctor.availability || [],
        createUser: false,
        password: '',
        signature: doctor.signature || ''
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
        registrationNo: '',
        consultationFee: '',
        availability: [],
        createUser: false,
        password: '',
        signature: ''
      });
    }
    setShowModal(true);
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        alert('Signature image size should be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signature: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSignature = () => {
    setFormData(prev => ({ ...prev, signature: '' }));
    if (signatureInputRef.current) {
      signatureInputRef.current.value = '';
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDoctor(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addAvailability = () => {
    // Find the first day not already added
    const existingDays = formData.availability.map(a => a.day);
    const nextDay = DAYS.find(day => !existingDays.includes(day)) || 'Monday';

    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, {
        day: nextDay,
        morningStart: '09:00',
        morningEnd: '13:00',
        eveningStart: '17:00',
        eveningEnd: '21:00'
      }]
    }));
  };

  const addAllDays = () => {
    const existingDays = formData.availability.map(a => a.day);
    const newDays = DAYS.filter(day => !existingDays.includes(day)).map(day => ({
      day,
      morningStart: '09:00',
      morningEnd: '13:00',
      eveningStart: '17:00',
      eveningEnd: '21:00'
    }));

    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, ...newDays]
    }));
  };

  const clearAllDays = () => {
    setFormData(prev => ({
      ...prev,
      availability: []
    }));
  };

  const applyTimingToAll = (index) => {
    const sourceTiming = formData.availability[index];
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map(item => ({
        ...item,
        morningStart: sourceTiming.morningStart,
        morningEnd: sourceTiming.morningEnd,
        eveningStart: sourceTiming.eveningStart,
        eveningEnd: sourceTiming.eveningEnd
      }))
    }));
  };

  // Sort availability by day order
  const sortedAvailability = [...formData.availability].sort(
    (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)
  );

  const updateAvailability = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeAvailability = (index) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Doctor',
      render: (doctor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-400 font-medium">
              {doctor.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{doctor.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{doctor.qualification}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Specialization',
      render: (doctor) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400">
          {doctor.specialization}
        </span>
      )
    },
    {
      header: 'Contact',
      render: (doctor) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3 h-3 text-gray-400" />
            {doctor.phone}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3 h-3 text-gray-400" />
            {doctor.email}
          </div>
        </div>
      )
    },
    {
      header: 'Consultation Fee',
      render: (doctor) => (
        <span className="font-medium">₹{doctor.consultationFee || 0}</span>
      )
    },
    {
      header: 'Status',
      render: (doctor) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          doctor.isActive
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {doctor.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (doctor) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal(doctor)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-500"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(doctor._id)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
          >
            <Trash2 className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Doctors</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage clinic doctors</p>
        </div>
        <Button icon={Plus} onClick={() => openModal()}>
          Add Doctor
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table columns={columns} data={filteredDoctors} loading={loading} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
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
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <Select
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              options={specializations}
              required
            />
            <Select
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              options={qualifications}
              required
            />
            <Input
              label="Registration No. (Reg No.)"
              name="registrationNo"
              value={formData.registrationNo}
              onChange={handleChange}
              placeholder="e.g., I-93691-A"
            />
            <Input
              label="Consultation Fee (₹)"
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
            />
          </div>

          {/* Availability */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Availability Schedule (दिन की उपलब्धता)</label>
              <div className="flex gap-2">
                {formData.availability.length > 0 && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearAllDays} className="text-red-500 hover:text-red-600">
                    Clear All
                  </Button>
                )}
                <Button type="button" variant="outline" size="sm" onClick={addAllDays}>
                  Add All Days
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={addAvailability}>
                  Add Day
                </Button>
              </div>
            </div>
            {sortedAvailability.map((slot) => {
              const originalIndex = formData.availability.findIndex(a => a.day === slot.day);
              return (
              <div key={slot.day} className="p-4 mb-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-800 dark:text-white w-40">{slot.day}</span>
                  <div className="flex items-center gap-2">
                    {formData.availability.length > 1 && (
                      <button
                        type="button"
                        onClick={() => applyTimingToAll(originalIndex)}
                        className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-colors"
                      >
                        Apply to All
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAvailability(originalIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Morning Timing */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400 w-24">🌅 Morning:</span>
                  <input
                    type="time"
                    value={slot.morningStart || '09:00'}
                    onChange={(e) => updateAvailability(originalIndex, 'morningStart', e.target.value)}
                    className="input w-32"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={slot.morningEnd || '13:00'}
                    onChange={(e) => updateAvailability(originalIndex, 'morningEnd', e.target.value)}
                    className="input w-32"
                  />
                </div>

                {/* Evening Timing */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 w-24">🌙 Evening:</span>
                  <input
                    type="time"
                    value={slot.eveningStart || '17:00'}
                    onChange={(e) => updateAvailability(originalIndex, 'eveningStart', e.target.value)}
                    className="input w-32"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={slot.eveningEnd || '21:00'}
                    onChange={(e) => updateAvailability(originalIndex, 'eveningEnd', e.target.value)}
                    className="input w-32"
                  />
                </div>
              </div>
            );})}
          </div>

          {/* Signature Upload */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <PenTool className="w-5 h-5 text-primary-500" />
              <label className="label mb-0">Doctor Signature (हस्ताक्षर)</label>
            </div>
            <div className="flex items-start gap-4">
              {formData.signature ? (
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
                    <img
                      src={formData.signature}
                      alt="Signature"
                      className="max-h-20 max-w-48 object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeSignature}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => signatureInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                >
                  <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Click to upload signature</span>
                    <span className="text-xs">(PNG, JPG - Max 500KB)</span>
                  </div>
                </div>
              )}
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleSignatureUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Upload a clear image of doctor's signature. This will appear on prescriptions.
            </p>
          </div>

          {/* Create User Account */}
          {!editingDoctor && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="createUser"
                  checked={formData.createUser}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Create login account for this doctor
                </span>
              </label>
              {formData.createUser && (
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-2"
                  required={formData.createUser}
                />
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingDoctor ? 'Update' : 'Create'} Doctor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Doctors;
