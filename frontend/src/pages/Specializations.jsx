import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Stethoscope } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import api from '../services/api';

const Specializations = () => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const response = await api.get('/specializations');
      setSpecializations(response.data.data);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/specializations/${editingItem._id}`, formData);
      } else {
        await api.post('/specializations', formData);
      }
      fetchSpecializations();
      closeModal();
    } catch (error) {
      console.error('Error saving specialization:', error);
      alert(error.response?.data?.message || 'Error saving specialization');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this specialization?')) {
      try {
        await api.delete(`/specializations/${id}`);
        fetchSpecializations();
      } catch (error) {
        console.error('Error deleting specialization:', error);
      }
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await api.put(`/specializations/${item._id}`, { isActive: !item.isActive });
      fetchSpecializations();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredSpecializations = specializations.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Specialization',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Description',
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.description || '-'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (item) => (
        <button
          onClick={() => handleToggleStatus(item)}
          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
            item.isActive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {item.isActive ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal(item)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-500"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item._id)}
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Specializations</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage doctor specializations (Cardiologist, Dermatologist, etc.)</p>
        </div>
        <Button icon={Plus} onClick={() => openModal()}>
          Add Specialization
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search specializations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table columns={columns} data={filteredSpecializations} loading={loading} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingItem ? 'Edit Specialization' : 'Add New Specialization'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Specialization Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Cardiologist"
            required
          />
          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Brief description (optional)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingItem ? 'Update' : 'Create'} Specialization
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Specializations;
