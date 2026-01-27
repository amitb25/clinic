import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Clock, Check, X } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import api from '../services/api';
import { formatDate, formatTime, getStatusColor, generateTimeSlots } from '../utils/helpers';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
    status: 'pending'
  });

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, [currentPage, filterStatus, filterDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.date = filterDate;

      const response = await api.get('/appointments', { params });
      setAppointments(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching appointments:', error);
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
      const response = await api.get('/doctors', { params: { active: 'true' } });
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment._id}`, formData);
      } else {
        await api.post('/appointments', formData);
      }
      fetchAppointments();
      closeModal();
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert(error.response?.data?.message || 'Error saving appointment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await api.delete(`/appointments/${id}`);
        fetchAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openModal = (appointment = null) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        patient: appointment.patient?._id || '',
        doctor: appointment.doctor?._id || '',
        date: appointment.date?.split('T')[0] || '',
        time: appointment.time || '',
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        status: appointment.status || 'pending'
      });
    } else {
      setEditingAppointment(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        patient: '',
        doctor: '',
        date: today,
        time: '',
        reason: '',
        notes: '',
        status: 'pending'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Date & Time',
      render: (apt) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex flex-col items-center justify-center">
            <span className="text-xs text-primary-600 dark:text-primary-400">
              {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {new Date(apt.date).getDate()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{formatDate(apt.date)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(apt.time)}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Patient',
      render: (apt) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white">{apt.patient?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{apt.patient?.phone}</p>
        </div>
      )
    },
    {
      header: 'Doctor',
      render: (apt) => (
        <div>
          <p className="font-medium">Dr. {apt.doctor?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{apt.doctor?.specialization}</p>
        </div>
      )
    },
    {
      header: 'Reason',
      render: (apt) => (
        <p className="truncate max-w-xs">{apt.reason}</p>
      )
    },
    {
      header: 'Status',
      render: (apt) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>
          {apt.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (apt) => (
        <div className="flex items-center gap-1">
          {apt.status === 'pending' && (
            <>
              <button
                onClick={() => updateStatus(apt._id, 'completed')}
                className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500"
                title="Mark as completed"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateStatus(apt._id, 'cancelled')}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                title="Cancel appointment"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => openModal(apt)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-500"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(apt._id)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Stats
  const todayCount = appointments.filter(apt => {
    const today = new Date().toDateString();
    return new Date(apt.date).toDateString() === today;
  }).length;

  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
  const completedCount = appointments.filter(apt => apt.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Appointments</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage patient appointments</p>
        </div>
        <Button icon={Plus} onClick={() => openModal()}>
          New Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Calendar className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{todayCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Today's Appointments</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{pendingCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{completedCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="input"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
              className="input"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table columns={columns} data={filteredAppointments} loading={loading} />
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
        title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
        size="lg"
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
              options={doctors.map(d => ({ value: d._id, label: `Dr. ${d.name} - ${d.specialization}` }))}
              required
            />
            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
            <Select
              label="Time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              options={timeSlots.map(t => ({ value: t, label: formatTime(t) }))}
              required
            />
          </div>

          <Input
            label="Reason for Visit"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            placeholder="e.g., Regular checkup, Follow-up..."
          />

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Additional notes..."
            />
          </div>

          {editingAppointment && (
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={STATUS_OPTIONS}
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAppointment ? 'Update' : 'Book'} Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
