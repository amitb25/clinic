import { useState, useEffect } from 'react';
import {
  Users,
  UserCog,
  Calendar,
  Pill,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Card from '../components/common/Card';
import api from '../services/api';
import { formatDate, formatTime, getStatusColor } from '../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ icon: Icon, label, value, color, subValue }) => (
  <Card className="relative overflow-hidden">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        {subValue && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subValue}</p>
        )}
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const appointmentChartData = {
    labels: stats?.appointmentTrends?.map(t => t.date.slice(5)) || [],
    datasets: [
      {
        label: 'Appointments',
        data: stats?.appointmentTrends?.map(t => t.count) || [],
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const genderChartData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        data: [
          stats?.genderDistribution?.male || 0,
          stats?.genderDistribution?.female || 0,
          stats?.genderDistribution?.other || 0
        ],
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(236, 72, 153)',
          'rgb(168, 162, 158)'
        ],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome to Sariva Clinic Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Patients"
          value={stats?.counts?.totalPatients || 0}
          color="bg-primary-500"
          subValue={`+${stats?.monthly?.patients || 0} this month`}
        />
        <StatCard
          icon={UserCog}
          label="Active Doctors"
          value={stats?.counts?.totalDoctors || 0}
          color="bg-secondary-500"
        />
        <StatCard
          icon={Calendar}
          label="Today's Appointments"
          value={stats?.counts?.todayAppointments || 0}
          color="bg-amber-500"
          subValue={`${stats?.counts?.pendingAppointments || 0} pending`}
        />
        <StatCard
          icon={Pill}
          label="Medicines"
          value={stats?.counts?.totalMedicines || 0}
          color="bg-green-500"
        />
      </div>

      {/* Alerts */}
      {(stats?.counts?.lowStockMedicines > 0 || stats?.counts?.expiredMedicines > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats?.counts?.lowStockMedicines > 0 && (
            <Card className="border-l-4 border-amber-500">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Low Stock Alert</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stats.counts.lowStockMedicines} medicines are running low on stock
                  </p>
                </div>
              </div>
            </Card>
          )}
          {stats?.counts?.expiredMedicines > 0 && (
            <Card className="border-l-4 border-red-500">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Expired Medicines</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stats.counts.expiredMedicines} medicines have expired
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Charts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Trends */}
        <Card title="Appointment Trends" className="lg:col-span-2">
          <div className="h-64">
            <Line
              data={appointmentChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Gender Distribution */}
        <Card title="Patient Demographics">
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={genderChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card title="Upcoming Appointments">
        {stats?.recentAppointments?.length > 0 ? (
          <div className="space-y-4">
            {stats.recentAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {appointment.patient?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {appointment.doctor?.name} - {appointment.doctor?.specialization}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {formatDate(appointment.date)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(appointment.time)}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No upcoming appointments
          </p>
        )}
      </Card>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Prescriptions</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats?.monthly?.prescriptions || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-900/30">
              <Calendar className="w-6 h-6 text-secondary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Appointments</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats?.monthly?.appointments || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">New Patients</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats?.monthly?.patients || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
