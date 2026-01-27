import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, GraduationCap } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import api from '../services/api';

const Qualifications = () => {
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    description: ''
  });

  useEffect(() => {
    fetchQualifications();
  }, []);

  const fetchQualifications = async () => {
    try {
      const response = await api.get('/qualifications');
      setQualifications(response.data.data);
    } catch (error) {
      console.error('Error fetching qualifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/qualifications/${editingItem._id}`, formData);
      } else {
        await api.post('/qualifications', formData);
      }
      fetchQualifications();
      closeModal();
    } catch (error) {
      console.error('Error saving qualification:', error);
      alert(error.response?.data?.message || 'Error saving qualification');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this qualification?')) {
      try {
        await api.delete(`/qualifications/${id}`);
        fetchQualifications();
      } catch (error) {
        console.error('Error deleting qualification:', error);
      }
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await api.put(`/qualifications/${item._id}`, { isActive: !item.isActive });
      fetchQualifications();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        shortName: item.shortName || '',
        description: item.description || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        shortName: '',
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

  const filteredQualifications = qualifications.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.shortName && item.shortName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      header: 'Qualification',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
            {item.shortName && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.shortName}</p>
            )}
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Qualifications</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage doctor qualifications (MBBS, MD, etc.)</p>
        </div>
        <Button icon={Plus} onClick={() => openModal()}>
          Add Qualification
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search qualifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table columns={columns} data={filteredQualifications} loading={loading} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingItem ? 'Edit Qualification' : 'Add New Qualification'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Qualification Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Bachelor of Medicine"
            required
          />
          <Input
            label="Short Name"
            name="shortName"
            value={formData.shortName}
            onChange={handleChange}
            placeholder="e.g., MBBS"
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
              {editingItem ? 'Update' : 'Create'} Qualification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Qualifications;
