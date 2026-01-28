import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCog,
  Users,
  Pill,
  FileText,
  Calendar,
  Stethoscope,
  X,
  Settings,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Award,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const [masterOpen, setMasterOpen] = useState(false);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/doctors', icon: UserCog, label: 'Doctors', adminOnly: true },
    { path: '/patients', icon: Users, label: 'Patients' },
    { path: '/medicines', icon: Pill, label: 'Medicines' },
    { path: '/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/prescriptions', icon: FileText, label: 'Prescriptions' },
  ];

  const masterItems = [
    { path: '/master/qualifications', icon: GraduationCap, label: 'Qualifications' },
    { path: '/master/specializations', icon: Award, label: 'Specializations' },
    { path: '/master/clinic-settings', icon: Building2, label: 'Clinic Settings' },
  ];

  const filteredMenuItems = menuItems.filter(
    item => !item.adminOnly || isAdmin()
  );

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      const sidebar = document.querySelector('.sidebar');
      sidebar?.classList.remove('translate-x-0');
      sidebar?.classList.add('-translate-x-full');
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="sidebar-overlay fixed inset-0 bg-black/50 z-40 lg:hidden hidden"
        onClick={() => {
          const sidebar = document.querySelector('.sidebar');
          sidebar?.classList.remove('translate-x-0');
          sidebar?.classList.add('-translate-x-full');
        }}
      />

      {/* Sidebar */}
      <aside className="sidebar fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300">
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 dark:text-white">Sariva Clinic</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              const sidebar = document.querySelector('.sidebar');
              sidebar?.classList.remove('translate-x-0');
              sidebar?.classList.add('-translate-x-full');
            }}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          <ul className="space-y-2">
            {/* Dashboard */}
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? 'sidebar-link-active' : 'sidebar-link'
                }
                onClick={closeSidebar}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>
            </li>

            {/* Master Dropdown - Admin Only (After Dashboard) */}
            {isAdmin() && (
              <li>
                <button
                  onClick={() => setMasterOpen(!masterOpen)}
                  className="sidebar-link w-full justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    <span>Master</span>
                  </div>
                  {masterOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* Submenu */}
                <ul
                  className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
                    masterOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {masterItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          isActive
                            ? 'flex items-center gap-3 px-4 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium'
                            : 'flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm'
                        }
                        onClick={closeSidebar}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            )}

            {/* Other Menu Items */}
            {filteredMenuItems.filter(item => item.path !== '/').map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link-active' : 'sidebar-link'
                  }
                  onClick={closeSidebar}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Version 1.0.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
