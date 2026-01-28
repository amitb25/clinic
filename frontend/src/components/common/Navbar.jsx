import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, LogOut, ChevronDown, Calendar, Pill, AlertTriangle, UserCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import api from '../../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState({
    todayAppointments: [],
    lowStock: [],
    expired: [],
    followUps: []
  });
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Fetch all data in parallel
      const [appointmentsRes, medicinesRes, prescriptionsRes] = await Promise.all([
        api.get('/appointments', { params: { date: today, limit: 100 } }).catch(() => ({ data: { data: [] } })),
        api.get('/medicines/alerts').catch(() => ({ data: { data: { lowStock: [], expired: [], expiringSoon: [] } } })),
        api.get('/prescriptions', { params: { limit: 100 } }).catch(() => ({ data: { data: [] } }))
      ]);

      // Today's appointments (pending/confirmed)
      const todayAppointments = (appointmentsRes.data.data || []).filter(
        apt => apt.status === 'scheduled' || apt.status === 'confirmed'
      );

      // Medicine alerts
      const lowStock = medicinesRes.data.data?.lowStock || [];
      const expired = [...(medicinesRes.data.data?.expired || []), ...(medicinesRes.data.data?.expiringSoon || [])];

      // Follow-up reminders (prescriptions with follow-up date today or in next 2 days)
      const followUps = (prescriptionsRes.data.data || []).filter(rx => {
        if (!rx.followUpDate) return false;
        const followUpDate = new Date(rx.followUpDate);
        const now = new Date();
        const diffDays = Math.ceil((followUpDate - now) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 2;
      });

      setNotifications({
        todayAppointments,
        lowStock,
        expired,
        followUps
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalNotifications =
    notifications.todayAppointments.length +
    notifications.lowStock.length +
    notifications.expired.length +
    notifications.followUps.length;

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${displayHour}:${minutes} ${suffix}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <nav className="fixed top-0 right-0 left-0 lg:left-64 bg-white dark:bg-gray-800 shadow-sm z-40">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              const sidebar = document.querySelector('.sidebar');
              sidebar?.classList.toggle('translate-x-0');
              sidebar?.classList.toggle('-translate-x-full');
            }}
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Search (optional placeholder) */}
          <div className="hidden md:block flex-1 max-w-md">
            {/* Add search component here if needed */}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                    {totalNotifications > 9 ? '9+' : totalNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{totalNotifications} new</span>
                      <button onClick={() => setShowNotifications(false)}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : totalNotifications === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                      </div>
                    ) : (
                      <>
                        {/* Today's Appointments */}
                        {notifications.todayAppointments.length > 0 && (
                          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Today's Appointments ({notifications.todayAppointments.length})</span>
                            </div>
                            <div className="space-y-2">
                              {notifications.todayAppointments.slice(0, 3).map((apt, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">{apt.patient?.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Dr. {apt.doctor?.name}</p>
                                  </div>
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">
                                    {formatTime(apt.time)}
                                  </span>
                                </div>
                              ))}
                              {notifications.todayAppointments.length > 3 && (
                                <p className="text-xs text-center text-gray-500">+{notifications.todayAppointments.length - 3} more</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Follow-up Reminders */}
                        {notifications.followUps.length > 0 && (
                          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                              <UserCheck className="w-4 h-4 text-green-500" />
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">Follow-up Reminders ({notifications.followUps.length})</span>
                            </div>
                            <div className="space-y-2">
                              {notifications.followUps.slice(0, 3).map((rx, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">{rx.patient?.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{rx.diagnosis?.substring(0, 30)}</p>
                                  </div>
                                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                                    {formatDate(rx.followUpDate)}
                                  </span>
                                </div>
                              ))}
                              {notifications.followUps.length > 3 && (
                                <p className="text-xs text-center text-gray-500">+{notifications.followUps.length - 3} more</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Low Stock Medicines */}
                        {notifications.lowStock.length > 0 && (
                          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                              <Pill className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Low Stock ({notifications.lowStock.length})</span>
                            </div>
                            <div className="space-y-2">
                              {notifications.lowStock.slice(0, 3).map((med, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                  <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">{med.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{med.category}</p>
                                  </div>
                                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded">
                                    {med.stockQuantity} left
                                  </span>
                                </div>
                              ))}
                              {notifications.lowStock.length > 3 && (
                                <p className="text-xs text-center text-gray-500">+{notifications.lowStock.length - 3} more</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Expired/Expiring Medicines */}
                        {notifications.expired.length > 0 && (
                          <div className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Expired/Expiring ({notifications.expired.length})</span>
                            </div>
                            <div className="space-y-2">
                              {notifications.expired.slice(0, 3).map((med, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                  <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">{med.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Batch: {med.batchNumber || 'N/A'}</p>
                                  </div>
                                  <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                                    {formatDate(med.expiryDate)}
                                  </span>
                                </div>
                              ))}
                              {notifications.expired.length > 3 && (
                                <p className="text-xs text-center text-gray-500">+{notifications.expired.length - 3} more</p>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  {totalNotifications > 0 && (
                    <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <button
                        onClick={() => {
                          fetchNotifications();
                        }}
                        className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:underline py-1"
                      >
                        Refresh
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
