import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Table from '../components/common/Table';
import api from '../services/api';
import { formatDate, isExpired, getDaysUntilExpiry } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Capsule', label: 'Capsule' },
  { value: 'Syrup', label: 'Syrup' },
  { value: 'Injection', label: 'Injection' },
  { value: 'Cream', label: 'Cream' },
  { value: 'Drops', label: 'Drops' },
  { value: 'Inhaler', label: 'Inhaler' },
  { value: 'Ointment', label: 'Ointment' },
  { value: 'Powder', label: 'Powder' },
  { value: 'Other', label: 'Other' }
];

const Medicines = () => {
  const { isAdmin } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState({ lowStock: [], expired: [], expiringSoon: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    batchNumber: '',
    expiryDate: '',
    stockQuantity: '',
    minimumStock: '10',
    price: '',
    manufacturer: ''
  });

  useEffect(() => {
    fetchMedicines();
    fetchAlerts();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicines');
      setMedicines(response.data.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/medicines/alerts');
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        await api.put(`/medicines/${editingMedicine._id}`, formData);
      } else {
        await api.post('/medicines', formData);
      }
      fetchMedicines();
      fetchAlerts();
      closeModal();
    } catch (error) {
      console.error('Error saving medicine:', error);
      alert(error.response?.data?.message || 'Error saving medicine');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(`/medicines/${id}`);
        fetchMedicines();
        fetchAlerts();
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  const openModal = (medicine = null) => {
    if (medicine) {
      setEditingMedicine(medicine);
      setFormData({
        name: medicine.name,
        genericName: medicine.genericName || '',
        category: medicine.category,
        batchNumber: medicine.batchNumber || '',
        expiryDate: medicine.expiryDate?.split('T')[0] || '',
        stockQuantity: medicine.stockQuantity,
        minimumStock: medicine.minimumStock,
        price: medicine.price,
        manufacturer: medicine.manufacturer || ''
      });
    } else {
      setEditingMedicine(null);
      setFormData({
        name: '',
        genericName: '',
        category: '',
        batchNumber: '',
        expiryDate: '',
        stockQuantity: '',
        minimumStock: '10',
        price: '',
        manufacturer: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMedicine(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || medicine.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (medicine) => {
    if (isExpired(medicine.expiryDate)) {
      return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', text: 'Expired' };
    }
    if (medicine.stockQuantity <= medicine.minimumStock) {
      return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', text: 'Low Stock' };
    }
    return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', text: 'In Stock' };
  };

  const columns = [
    {
      header: 'Medicine',
      render: (medicine) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white">{medicine.name}</p>
          {medicine.genericName && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{medicine.genericName}</p>
          )}
        </div>
      )
    },
    {
      header: 'Category',
      render: (medicine) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
          {medicine.category}
        </span>
      )
    },
    {
      header: 'Stock',
      render: (medicine) => {
        const status = getStockStatus(medicine);
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{medicine.stockQuantity}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {status.text}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Price',
      render: (medicine) => (
        <span className="font-medium">₹{medicine.price}</span>
      )
    },
    {
      header: 'Expiry Date',
      render: (medicine) => {
        const days = getDaysUntilExpiry(medicine.expiryDate);
        const expired = days < 0;
        const expiringSoon = days >= 0 && days <= 30;

        return (
          <div>
            <p className={expired ? 'text-red-500' : expiringSoon ? 'text-amber-500' : ''}>
              {formatDate(medicine.expiryDate)}
            </p>
            {expiringSoon && !expired && (
              <p className="text-xs text-amber-500">{days} days left</p>
            )}
          </div>
        );
      }
    },
    {
      header: 'Actions',
      render: (medicine) => (
        isAdmin() && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal(medicine)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-500"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(medicine._id)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      )
    }
  ];

  const totalAlerts = alerts.lowStock.length + alerts.expired.length + alerts.expiringSoon.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Medicines</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage medicine inventory</p>
        </div>
        <div className="flex gap-3">
          {totalAlerts > 0 && (
            <Button
              variant="warning"
              icon={AlertTriangle}
              onClick={() => setShowAlertsModal(true)}
            >
              {totalAlerts} Alerts
            </Button>
          )}
          {isAdmin() && (
            <Button icon={Plus} onClick={() => openModal()}>
              Add Medicine
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Package className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{medicines.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{alerts.lowStock.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{alerts.expired.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{alerts.expiringSoon.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table columns={columns} data={filteredMedicines} loading={loading} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Medicine Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Generic Name"
              name="genericName"
              value={formData.genericName}
              onChange={handleChange}
            />
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORIES}
              required
            />
            <Input
              label="Batch Number"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
            />
            <Input
              label="Expiry Date"
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              required
            />
            <Input
              label="Stock Quantity"
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              required
              min="0"
            />
            <Input
              label="Minimum Stock Level"
              type="number"
              name="minimumStock"
              value={formData.minimumStock}
              onChange={handleChange}
              min="0"
            />
            <Input
              label="Price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
            <Input
              label="Manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="md:col-span-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingMedicine ? 'Update' : 'Add'} Medicine
            </Button>
          </div>
        </form>
      </Modal>

      {/* Alerts Modal */}
      <Modal
        isOpen={showAlertsModal}
        onClose={() => setShowAlertsModal(false)}
        title="Medicine Alerts"
        size="lg"
      >
        <div className="space-y-6">
          {/* Expired */}
          {alerts.expired.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Expired Medicines ({alerts.expired.length})
              </h3>
              <div className="space-y-2">
                {alerts.expired.map(med => (
                  <div key={med._id} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 flex justify-between">
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-500">Batch: {med.batchNumber || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 dark:text-red-400">Expired</p>
                      <p className="text-sm text-gray-500">{formatDate(med.expiryDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiring Soon */}
          {alerts.expiringSoon.length > 0 && (
            <div>
              <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Expiring Soon ({alerts.expiringSoon.length})
              </h3>
              <div className="space-y-2">
                {alerts.expiringSoon.map(med => (
                  <div key={med._id} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex justify-between">
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-500">Stock: {med.stockQuantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-600 dark:text-orange-400">{getDaysUntilExpiry(med.expiryDate)} days left</p>
                      <p className="text-sm text-gray-500">{formatDate(med.expiryDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock */}
          {alerts.lowStock.length > 0 && (
            <div>
              <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Low Stock ({alerts.lowStock.length})
              </h3>
              <div className="space-y-2">
                {alerts.lowStock.map(med => (
                  <div key={med._id} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex justify-between">
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-500">Category: {med.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-600 dark:text-amber-400">{med.stockQuantity} left</p>
                      <p className="text-sm text-gray-500">Min: {med.minimumStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Medicines;
