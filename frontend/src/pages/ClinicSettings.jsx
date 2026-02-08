import { useState, useEffect } from 'react';
import { Building2, Save, Phone, Mail, Globe, MapPin, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import WarpLoader from '../components/common/WarpLoader';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultTimings = DAYS.map(day => ({
  day,
  isOpen: false,
  slotType: 'double', // 'single' or 'double'
  singleStart: '09:00',
  singleEnd: '17:00',
  morningStart: '09:00',
  morningEnd: '13:00',
  eveningStart: '17:00',
  eveningEnd: '21:00'
}));

const ClinicSettings = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: '',
    clinicNameHindi: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    tagline: '',
    registrationNo: '',
    timings: defaultTimings
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/clinic-settings');
      if (response.data.data) {
        // Merge fetched timings with default timings to ensure all days are present
        let fetchedTimings = response.data.data.timings || [];
        const mergedTimings = DAYS.map(day => {
          const existing = fetchedTimings.find(t => t.day === day);
          if (existing) {
            return {
              day,
              isOpen: existing.isOpen || false,
              slotType: existing.slotType || 'double',
              singleStart: existing.singleStart || '09:00',
              singleEnd: existing.singleEnd || '17:00',
              morningStart: existing.morningStart || '09:00',
              morningEnd: existing.morningEnd || '13:00',
              eveningStart: existing.eveningStart || '17:00',
              eveningEnd: existing.eveningEnd || '21:00'
            };
          }
          return {
            day,
            isOpen: false,
            slotType: 'double',
            singleStart: '09:00',
            singleEnd: '17:00',
            morningStart: '09:00',
            morningEnd: '13:00',
            eveningStart: '17:00',
            eveningEnd: '21:00'
          };
        });

        setFormData({
          clinicName: response.data.data.clinicName || '',
          clinicNameHindi: response.data.data.clinicNameHindi || '',
          address: response.data.data.address || '',
          city: response.data.data.city || '',
          state: response.data.data.state || '',
          pincode: response.data.data.pincode || '',
          phone: response.data.data.phone || '',
          email: response.data.data.email || '',
          website: response.data.data.website || '',
          tagline: response.data.data.tagline || '',
          registrationNo: response.data.data.registrationNo || '',
          timings: mergedTimings
        });
      }
    } catch (error) {
      console.error('Error fetching clinic settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/clinic-settings', formData);
      toast.success('Clinic settings updated successfully!');
    } catch (error) {
      console.error('Error saving clinic settings:', error);
      toast.error(error.response?.data?.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimingChange = (dayIndex, field, value) => {
    setFormData(prev => {
      const newTimings = [...prev.timings];
      newTimings[dayIndex] = {
        ...newTimings[dayIndex],
        [field]: value
      };
      return { ...prev, timings: newTimings };
    });
  };

  const toggleDayOpen = (dayIndex) => {
    setFormData(prev => {
      const newTimings = [...prev.timings];
      newTimings[dayIndex] = {
        ...newTimings[dayIndex],
        isOpen: !newTimings[dayIndex].isOpen
      };
      return { ...prev, timings: newTimings };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WarpLoader visible={saving} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Clinic Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage clinic information (displayed on prescriptions)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Basic Information</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Clinic name and tagline</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Clinic Name (English)"
              name="clinicName"
              value={formData.clinicName}
              onChange={handleChange}
              placeholder="Enter clinic name"
              required
            />
            <Input
              label="क्लिनिकचे नाव (मराठी/हिंदी)"
              name="clinicNameHindi"
              value={formData.clinicNameHindi}
              onChange={handleChange}
              placeholder="उदा. सारिवा क्लिनिक"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tagline / Slogan"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g., Your Health, Our Priority"
            />
            <Input
              label="Registration Number"
              name="registrationNo"
              value={formData.registrationNo}
              onChange={handleChange}
              placeholder="e.g., MH/2024/12345"
            />
          </div>
        </Card>

        {/* Clinic Timings */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Clinic Timings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set opening hours for each day</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Day rows */}
            {formData.timings.map((timing, index) => (
              <div
                key={timing.day}
                className={`p-4 rounded-lg transition-colors ${
                  timing.isOpen
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex flex-wrap items-center gap-4">
                  {/* Day name */}
                  <div className="w-24">
                    <span className={`font-semibold ${timing.isOpen ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {timing.day}
                    </span>
                  </div>

                  {/* Open toggle */}
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={timing.isOpen}
                        onChange={() => toggleDayOpen(index)}
                      />
                      <div className={`w-11 h-6 rounded-full shadow-inner transition-colors ${
                        timing.isOpen ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                      <div className={`absolute w-5 h-5 bg-white rounded-full shadow top-0.5 left-0.5 transition-transform ${
                        timing.isOpen ? 'translate-x-5' : ''
                      }`}></div>
                    </div>
                    <span className={`ml-2 text-sm font-medium ${timing.isOpen ? 'text-green-600' : 'text-gray-400'}`}>
                      {timing.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </label>

                  {/* Slot Type Toggle - Only show when open */}
                  {timing.isOpen && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => handleTimingChange(index, 'slotType', 'single')}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          timing.slotType === 'single'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Single Slot
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTimingChange(index, 'slotType', 'double')}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          timing.slotType === 'double'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Morning + Evening
                      </button>
                    </div>
                  )}
                </div>

                {/* Time inputs - Only show when open */}
                {timing.isOpen && (
                  <div className="mt-3 pl-28">
                    {timing.slotType === 'single' ? (
                      /* Single Slot */
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-14">Timing:</span>
                        <input
                          type="time"
                          value={timing.singleStart}
                          onChange={(e) => handleTimingChange(index, 'singleStart', e.target.value)}
                          className="px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-gray-400 font-medium">to</span>
                        <input
                          type="time"
                          value={timing.singleEnd}
                          onChange={(e) => handleTimingChange(index, 'singleEnd', e.target.value)}
                          className="px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    ) : (
                      /* Double Slot - Morning & Evening */
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium w-14">Morning:</span>
                          <input
                            type="time"
                            value={timing.morningStart}
                            onChange={(e) => handleTimingChange(index, 'morningStart', e.target.value)}
                            className="px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="time"
                            value={timing.morningEnd}
                            onChange={(e) => handleTimingChange(index, 'morningEnd', e.target.value)}
                            className="px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-orange-600 dark:text-orange-400 font-medium w-14">Evening:</span>
                          <input
                            type="time"
                            value={timing.eveningStart}
                            onChange={(e) => handleTimingChange(index, 'eveningStart', e.target.value)}
                            className="px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="time"
                            value={timing.eveningEnd}
                            onChange={(e) => handleTimingChange(index, 'eveningEnd', e.target.value)}
                            className="px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Address Information */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-900/30">
              <MapPin className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Address</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Clinic location details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Street Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter street address"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
              <Input
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
              <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Contact Information</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone, email and website</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              icon={Phone}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              icon={Mail}
            />
            <Input
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="e.g., www.sarivaclinic.com"
              icon={Globe}
            />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" icon={Save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClinicSettings;
