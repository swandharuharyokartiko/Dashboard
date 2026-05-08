import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  LayoutDashboard, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Search,
  Filter,
  FileText,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Download,
  Calendar,
  RefreshCw,
  Car,
  User,
  ExternalLink,
  Database,
  HelpCircle,
  Link,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchApplications } from './services/dataService';
import { ApplicationData, DashboardStats } from './types';
import { cn } from './lib/utils';

const STATUS_COLORS: Record<string, string> = {
  'APPROVED': '#10b981',
  'REJECT': '#ef4444',
  'CANCELED': '#f59e0b',
  'CREDIT ANALYST': '#8b5cf6',
  'SURVEYING': '#3b82f6',
  'APPLICATION IN': '#64748b',
};

interface SalesPerformance {
  name: string;
  APPROVED: number;
  CANCELED: number;
  'CREDIT ANALYST': number;
  REJECT: number;
  SURVEYING: number;
  total: number;
}

export default function App() {
  const [isUserAuthorized, setIsUserAuthorized] = useState(false);
  const [userIdInput, setUserIdInput] = useState('');
  const [userPassInput, setUserPassInput] = useState('');
  const [userLoginError, setUserLoginError] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [data, setData] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'PASSANGER' | 'COMMERCIAL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [customGasUrl, setCustomGasUrl] = useState(() => {
    return localStorage.getItem('monitoring-custom-url') || '';
  });
  const [isUrlSetupOpen, setIsUrlSetupOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomGasUrl(e.target.value);
    localStorage.setItem('monitoring-custom-url', e.target.value);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const loadData = async (urlToFetch?: string) => {
    setRefreshing(true);
    try {
      const result = await fetchApplications(urlToFetch || customGasUrl || undefined);
      setData(result.data);
      setIsDemo(result.isDemo);
      setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Available months for filtering
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    data.forEach(item => {
      const date = new Date(item.dateIn);
      if (!isNaN(date.getTime())) {
        const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        months.add(monthYear);
      }
    });
    return Array.from(months).sort((a, b) => {
      const dateA = new Date(a.split(' ').reverse().join(' '));
      const dateB = new Date(b.split(' ').reverse().join(' '));
      return dateB.getTime() - dateA.getTime();
    });
  }, [data]);

  // Unified Filtered Data for EVERYTHING
  const dashboardData = useMemo(() => {
    return data.map(item => ({
      ...item,
      status: (item.status || '').toString().trim().toUpperCase(),
      salesman: (item.salesman || '').toString().trim().toUpperCase(),
      category: (item.category || '').toString().trim().toUpperCase(),
    })).filter(item => {
      const date = new Date(item.dateIn);
      const itemMonth = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      
      const matchesMonth = filterMonth === 'ALL' || itemMonth === filterMonth;
      const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
      const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
      
      return matchesMonth && matchesStatus && matchesCategory;
    });
  }, [data, filterMonth, filterStatus, filterCategory]);

  const stats = useMemo(() => {
    const approvedList = dashboardData.filter(d => d.status === 'APPROVED');
    
    const s = {
      total: dashboardData.length,
      approved: approvedList.length,
      rejected: dashboardData.filter(d => d.status === 'REJECT').length,
      canceled: dashboardData.filter(d => d.status === 'CANCELED').length,
      pending: dashboardData.filter(d => !['APPROVED', 'REJECT', 'CANCELED'].includes(d.status)).length,
      passCount: dashboardData.filter(d => d.category === 'PASSANGER').length,
      commCount: dashboardData.filter(d => d.category === 'COMMERCIAL').length,
    };
    return s;
  }, [dashboardData]);

  const chartData = useMemo(() => {
    // Status distribution
    const statusCounts = dashboardData.reduce((acc, curr) => {
      // Filter out invalid/header values
      if (!curr.status || curr.status.toString().toUpperCase().includes('STEP') || curr.status.toString().toUpperCase().includes('STATUS')) {
        return acc;
      }
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusPie = Object.entries(statusCounts).map(([name, value]) => ({ 
      name, 
      value,
      color: STATUS_COLORS[name] || '#94a3b8'
    }));

    // Category distribution
    const categoryPie = [
      { name: 'Passanger', value: stats.passCount, color: '#3b82f6' },
      { name: 'Commercial', value: stats.commCount, color: '#f97316' },
    ];

    // Tenor distribution
    const tenorCounts = dashboardData.reduce((acc, curr) => {
      // Filter out invalid/header values
      if (!curr.tenor || curr.tenor.toString().toUpperCase().includes('TENOR')) {
        return acc;
      }
      const key = `${curr.tenor} Bln`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tenorBar = Object.entries(tenorCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));

    // Get all unique salesmen from the BASE data to ensure we show everyone
    const allSalesmen = Array.from(new Set(data
      .map(item => (item.salesman || '').toString().trim().toUpperCase())
      .filter(name => name && !name.includes('SALESMAN'))
    ));

    // Initialize all performance data for all salesmen with zero stats
    const salesPerformance: Record<string, SalesPerformance> = {};
    allSalesmen.forEach((name: string) => {
      salesPerformance[name] = {
        name,
        APPROVED: 0,
        CANCELED: 0,
        'CREDIT ANALYST': 0,
        REJECT: 0,
        SURVEYING: 0,
        total: 0
      };
    });

    // Populate performance stats from the FILTERED dashboardData
    dashboardData.forEach(curr => {
      const salesmanName = curr.salesman as string;
      if (!salesmanName || !salesPerformance[salesmanName]) return;
      
      const status = curr.status as keyof SalesPerformance;
      if (status in salesPerformance[salesmanName] && status !== 'name' && status !== 'total') {
        (salesPerformance[salesmanName][status] as number)++;
      }
      salesPerformance[salesmanName].total++;
    });

    const salesPerformanceData = Object.values(salesPerformance)
      .sort((a, b) => b.total - a.total);

    // Daily trend
    const dailyCounts = dashboardData.reduce((acc, curr) => {
      if (!curr.dateIn) return acc;
      const date = curr.dateIn;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dailyTrend = Object.entries(dailyCounts)
      .map(([dateString, count]) => ({ 
        date: new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }), 
        timestamp: new Date(dateString).getTime(),
        count 
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return { statusPie, dailyTrend, salesBar: salesPerformanceData, categoryPie, tenorBar };
  }, [dashboardData, stats]);

  const tableData = useMemo(() => {
    if (!searchTerm) return dashboardData;
    const search = searchTerm.toLowerCase();
    return dashboardData.filter(item => 
      item.customerName.toLowerCase().includes(search) ||
      item.salesman.toLowerCase().includes(search) ||
      item.unit.toLowerCase().includes(search)
    );
  }, [dashboardData, searchTerm]);

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userIdInput === 'D660' && userPassInput === 'AYANI') {
      setIsUserAuthorized(true);
      setUserLoginError(false);
    } else {
      setUserLoginError(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900/50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            <LayoutDashboard className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-semibold tracking-tight text-lg">Tunggu ya, Data nya lagi di Proses...</p>
        </motion.div>
      </div>
    );
  }

  if (!isUserAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-50/30 rounded-full blur-[100px]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm relative z-10"
        >
          <div className="text-center mb-8 mt-2">
            <div className="w-48 h-48 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 text-slate-800 dark:text-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-3 overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/d/1avP22bXEdisaHxsekkfQUiQIjpa8Z4eu" 
                alt="Logo" 
                className="w-full h-full object-contain p-4"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Monitoring DFS</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest mt-2">DSO LPG A YANI • Login Access</p>
          </div>

          <form onSubmit={handleUserLogin} className="space-y-5">
            {userLoginError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-bold text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                ID User atau Password Salah
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ID USER</label>
              <input 
                type="text" 
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700 dark:text-slate-100 text-sm"
                placeholder="Masukkan ID User"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">PASSWORD</label>
              <input 
                type="password" 
                value={userPassInput}
                onChange={(e) => setUserPassInput(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700 dark:text-slate-100 text-sm"
                placeholder="Masukkan Password"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all uppercase tracking-widest text-[11px] mt-2 flex items-center justify-center gap-2"
            >
              Buka Dashboard
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Monitoring Status Application In</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-50/30 rounded-full blur-[100px]"></div>
      </div>

      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowLoginModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm relative z-10"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 p-2 rounded-full transition-colors"
                title="Close"
              >
                <XCircle className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-8 mt-2">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none ring-1 ring-slate-100 text-slate-800 dark:text-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LayoutDashboard className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Admin Login</h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest mt-2">Monitoring DFS • DSO LPG A YANI</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {loginError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-bold text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Invalid Username or Password
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700 text-sm"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700 text-sm"
                    placeholder="Enter password"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-200 transition-all uppercase tracking-widest text-[11px] mt-2 flex items-center justify-center gap-2"
                >
                  Sign In to Administrator
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center justify-center shadow-sm dark:shadow-none overflow-hidden hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://lh3.googleusercontent.com/d/1avP22bXEdisaHxsekkfQUiQIjpa8Z4eu" 
                  alt="Logo" 
                  className="w-full h-full object-contain p-2"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Monitoring DFS</h1>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold tracking-widest mt-1">DSO LPG A YANI</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-6">
              {isDemo && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-full">
                   <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Demo Mode</span>
                </div>
              )}

              <div className="hidden lg:block text-right">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Last Synced</p>
                <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 leading-none">{lastUpdated || '--:--'} WIB</p>
              </div>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {isUserAuthorized && (
                <button
                  onClick={() => {
                    setIsUserAuthorized(false);
                    window.location.reload(); // Refresh to ensure everything is reset
                  }}
                  className="p-2 sm:p-2.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-500 hover:text-rose-600 transition-colors"
                  title="Logout Dashboard"
                >
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              
              <button 
                onClick={() => {
                  if (isAuthenticated) setIsAuthenticated(false);
                  else setShowLoginModal(true);
                }}
                className="flex items-center gap-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 pr-2.5 rounded-full transition-colors"
                title={isAuthenticated ? 'Logout' : 'Login Administrator'}
              >
                <div className="hidden sm:block text-right">
                  <span className="block text-[11px] font-bold text-slate-900 dark:text-white leading-none">S. Haryo Kartiko</span>
                  <span className="text-[9px] text-slate-400 font-medium mt-1">
                    {isAuthenticated ? 'Admin (Logged In)' : 'Admin'}
                  </span>
                </div>
                <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border", isAuthenticated ? "bg-blue-100 border-blue-200" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800")}>
                  <User className={cn("w-5 h-5", isAuthenticated ? "text-blue-600" : "text-slate-500 dark:text-slate-400")} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border text-left border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden"
          >
            <div className="p-5 sm:p-6 pb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Google Sheets Connection</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Sync your dashboard with real-time data from Google Sheets</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Web App URL</label>
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Link className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={customGasUrl}
                      onChange={handleCustomUrlChange}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => loadData(customGasUrl)}
                    disabled={refreshing}
                    className="flex-shrink-0 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 border border-indigo-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm dark:shadow-none flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                    {refreshing ? 'Syncing...' : 'Sync Data'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50/50 dark:bg-amber-500/5 border-t border-amber-100 dark:border-amber-500/20 p-5 sm:p-6">
              <div className="flex gap-3">
                <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <h4 className="text-[11px] font-black text-amber-800 dark:text-amber-500 uppercase tracking-widest mb-2">How to Connect:</h4>
                  <ol className="list-decimal list-outside ml-4 space-y-1.5 text-xs font-medium text-amber-900/80 dark:text-amber-200/80">
                    <li>Open your Google Sheet with sales data.</li>
                    <li>Go to <span className="font-bold text-amber-900 dark:text-amber-400">Extensions {'>'} Apps Script</span>.</li>
                    <li>Paste the integration script and click <span className="font-bold text-amber-900 dark:text-amber-400">Deploy {'>'} New Deployment</span>.</li>
                    <li>Select <span className="font-bold text-amber-900 dark:text-amber-400">Web App</span>, set access to <span className="font-bold text-amber-900 dark:text-amber-400">Anyone</span>, and copy the URL here.</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="text-left">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight text-left">Monitoring Dashboard</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time application performance & distribution analysis</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Car className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <select 
                className="pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-700 hover:border-blue-300 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer shadow-sm dark:shadow-none"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
              >
                <option value="ALL">Semua Jenis</option>
                <option value="PASSANGER">Passanger</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <select 
                className="pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-700 hover:border-blue-300 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer shadow-sm dark:shadow-none"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="ALL">Semua Bulan</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${filterMonth}-${filterCategory}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-8"
          >
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard 
                title="Approved" 
                value={stats.approved} 
                icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} 
                accentColor="#10b981"
                delay={0.05}
              />
              <StatCard 
                title="In Process" 
                value={stats.pending} 
                icon={<Clock className="w-5 h-5 text-blue-600" />} 
                accentColor="#3b82f6"
                delay={0.1}
              />
              <StatCard 
                title="Rejected" 
                value={stats.rejected} 
                icon={<XCircle className="w-5 h-5 text-rose-600" />} 
                accentColor="#f43f5e"
                delay={0.15}
              />
              <StatCard 
                title="Total Application" 
                value={stats.total} 
                icon={<FileText className="w-5 h-5 text-indigo-600" />} 
                accentColor="#6366f1"
                delay={0.2}
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unit Mix</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Passanger vs Commercial</p>
              </div>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categoryPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.categoryPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Passanger</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Commercial</span>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none lg:col-span-2"
          >
            <div className="mb-8 text-left">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Popularitas Tenor</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pilihan tenor yang paling diminati</p>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.tenorBar}>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                    {chartData.tenorBar.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'][index % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kontribusi Salesman</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Produktivitas per Sales Advisor</p>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.salesBar.slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={100}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', shadow: 'xl' }}
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.salesBar.slice(0, 5).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col"
          >
            <div className="mb-8 text-left">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Status Ratio</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Persentase pengajuan berdasarkan status</p>
            </div>
            <div className="h-[280px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.statusPie}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {chartData.statusPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="block text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {stats.total}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aplikasi</span>
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* Daily Progress Chart */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <div className="mb-8 text-left">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Diagram: Data Statistik Aplikasi In Harian
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tren pengajuan unit per hari dalam periode ini</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.dailyTrend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="Aplikasi"
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col">
            <div className="mb-8 text-left">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  Analisis Per Salesman
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium ml-11 italic">Berdasarkan data aplikasi masuk (APPROVED, CANCELED, REJECT, dsb)</p>
            </div>
            <div className="flex-1 overflow-x-auto -mx-6 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
              <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50/80 backdrop-blur-sm sticky top-0 z-10">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/50 italic sticky left-0 bg-slate-50 dark:bg-slate-900/50/80 backdrop-blur-sm z-20">Nama Salesman</th>
                    <th className="px-4 py-4 text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/50 text-center">Approved</th>
                    <th className="px-4 py-4 text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/50 text-center">Canceled</th>
                    <th className="px-4 py-4 text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/50 text-center">CA</th>
                    <th className="px-4 py-4 text-[9px] font-black text-rose-600 dark:text-rose-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/50 text-center">Reject</th>
                    <th className="px-4 py-4 text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/50 text-center">Surveying</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/50 text-center">TOTAL IN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {chartData.salesBar.map((sp, idx) => (
                    <tr key={sp.name} className="group hover:bg-blue-50/30 transition-all duration-200">
                      <td className="px-6 py-4 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-blue-50/30 transition-all z-10 border-r border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-transform group-hover:scale-110",
                            idx === 0 ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          )}>
                            {idx + 1}
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 uppercase group-hover:text-blue-700">{sp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg ring-1 ring-emerald-100/50 dark:ring-emerald-500/20">{sp.APPROVED}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg ring-1 ring-amber-100/50 dark:ring-amber-500/20">{sp.CANCELED}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg ring-1 ring-indigo-100/50 dark:ring-indigo-500/20">{sp['CREDIT ANALYST']}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg ring-1 ring-rose-100/50 dark:ring-rose-500/20">{sp.REJECT}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg ring-1 ring-blue-100/50 dark:ring-blue-500/20">{sp.SURVEYING}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black shadow-lg shadow-slate-200 dark:shadow-none group-hover:bg-blue-600 dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-colors">
                            {sp.total}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 overflow-hidden"
        >
          <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                  <LayoutDashboard className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Application Explorer</h3>
              </div>
              <p className="text-xs text-slate-400 font-medium ml-1">Advanced monitoring for all unit applications</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-80 group">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search Customer, Sales, or Unit..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white dark:bg-slate-900 outline-none transition-all placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
                {['ALL', 'APPROVED', 'REJECT'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      "flex-1 sm:flex-none px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                      filterStatus === status 
                        ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm dark:shadow-none ring-1 ring-slate-200" 
                        : "text-slate-400 hover:text-slate-600 dark:text-slate-300"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
            <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50/50">
                  <th className="px-5 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] border-b border-slate-100 dark:border-slate-800/50">Unit Details</th>
                  <th className="px-5 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] border-b border-slate-100 dark:border-slate-800/50">Client / Advisory</th>
                  <th className="px-5 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] border-b border-slate-100 dark:border-slate-800/50 text-center">App In Date</th>
                  <th className="px-5 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] border-b border-slate-100 dark:border-slate-800/50 text-center">TDP Position</th>
                  <th className="px-5 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] border-b border-slate-100 dark:border-slate-800/50 text-center">Current Status</th>
                  <th className="px-5 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] border-b border-slate-100 dark:border-slate-800/50">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                <AnimatePresence mode="popLayout" initial={false}>
                  {tableData.length > 0 ? (
                    tableData.map((item) => (
                      <motion.tr 
                        key={`${item.no}-${item.customerName}-${item.dateIn}`}
                        layout="position"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ 
                          opacity: { duration: 0.2 },
                          layout: { type: 'spring', stiffness: 500, damping: 50, mass: 1 },
                          y: { duration: 0.25, ease: 'easeOut' }
                        }}
                        className="group hover:bg-blue-50/20 transition-colors duration-300"
                      >
                        <td className="px-5 sm:px-8 py-5 sm:py-6">
                          <div className="flex items-center gap-4 text-left">
                            <div className={cn(
                              "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm dark:shadow-none border transition-transform group-hover:scale-110 duration-300",
                              item.category === 'PASSANGER' 
                                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20" 
                                : "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20"
                            )}>
                              <Car className="w-5 h-5 shadow-sm dark:shadow-none" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase leading-tight group-hover:text-blue-700 transition-colors">{item.unit}</span>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-lg tracking-normal">#{item.no}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{item.category} • {item.tenor}M</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 sm:px-8 py-5 sm:py-6">
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{item.customerName}</span>
                            <div className="flex items-center gap-2 mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                              <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Users className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">{item.salesman}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 sm:px-8 py-5 sm:py-6 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800/50 group-hover:bg-white dark:bg-slate-900 transition-all">
                              {new Date(item.dateIn).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 sm:px-8 py-5 sm:py-6 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-[11px] font-black text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800/50 shadow-sm dark:shadow-none group-hover:bg-white dark:bg-slate-900 group-hover:border-blue-200 transition-all">
                              {item.tdp}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 sm:px-8 py-5 sm:py-6">
                          <div className="flex flex-col items-center gap-2">
                            <StatusBadge status={item.status} />
                            {item.approvalDate && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100/50 dark:border-emerald-500/20 shadow-sm dark:shadow-none">
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-tight">
                                  {new Date(item.approvalDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 sm:px-8 py-5 sm:py-6 min-w-[200px] sm:min-w-[250px] sm:max-w-[300px]">
                          <p className="text-[11px] sm:text-[10px] text-slate-600 dark:text-slate-400 font-medium text-left leading-relaxed line-clamp-none sm:line-clamp-2 group-hover:line-clamp-none transition-all">
                            {item.remarks || <span className="text-slate-400 italic font-normal">No additional records found</span>}
                          </p>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr 
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={6} className="px-8 py-24 text-center">
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center gap-4"
                        >
                          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <Search className="w-10 h-10 text-slate-200" />
                          </div>
                          <div className="text-center">
                            <p className="text-base font-black text-slate-900 dark:text-white tracking-tight">Pencarian Tidak Ditemukan</p>
                            <p className="text-xs text-slate-400 font-medium mt-1">Coba gunakan kata kunci lain atau bersihkan filter pencarian</p>
                          </div>
                        </motion.div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50/50 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {tableData.length} of {data.length} total applications
            </span>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               Filter: {filterMonth === 'ALL' ? 'Semua Bulan' : filterMonth}
            </div>
          </div>
        </motion.section>
        </motion.div>
      </AnimatePresence>
    </main>

      <footer className="mt-20 py-12 border-t border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center justify-center p-2 opacity-60 hover:opacity-100 transition-opacity">
                <img 
                  src="https://lh3.googleusercontent.com/d/1avP22bXEdisaHxsekkfQUiQIjpa8Z4eu" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <span className="block text-[11px] font-black text-slate-900 dark:text-white tracking-tight uppercase">Monitoring DFS</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">DSO LPG A YANI</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">&copy; 2026 INTERNAL SYSTEM</span>
              <p className="text-[9px] text-slate-300 font-medium tracking-wide">Authorized Personnel Only</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ title, value, icon, accentColor, delay, isString }: { 
  title: string, value: number | string, icon: React.ReactNode, accentColor: string, delay: number, isString?: boolean
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
      className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 relative overflow-hidden group text-left transition-all duration-300"
    >
      <div 
        className="absolute -top-4 -right-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-500 scale-150 pointer-events-none group-hover:rotate-12"
        style={{ color: accentColor }}
      >
        {icon}
      </div>
      
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ backgroundColor: `${accentColor}10`, color: accentColor, boxShadow: `0 8px 16px -4px ${accentColor}20` }}
        >
          {icon}
        </div>
      </div>

      <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 group-hover:text-slate-500 dark:text-slate-400 transition-colors">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:scale-105 transition-transform origin-left">{value}</span>
            {!isString && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Units</span>}
          </div>
      </div>
      
      <div className="mt-5 h-1.5 w-full bg-slate-50 dark:bg-slate-900/50 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: delay + 0.5, duration: 1, ease: 'circOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: accentColor, opacity: 0.7 }}
        />
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'APPROVED': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-500/20',
    'REJECT': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 ring-red-100 dark:ring-red-500/20',
    'CANCELED': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-100 dark:ring-orange-500/20',
    'CREDIT ANALYST': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-100 dark:ring-purple-500/20',
    'SURVEYING': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-100 dark:ring-blue-500/20',
    'APPLICATION IN': 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-slate-100 dark:ring-slate-500/20',
    'CUSTOMER VERIFICATION': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-cyan-100 dark:ring-cyan-500/20',
  };

  const currentStyle = styles[status] || 'bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 ring-slate-100 dark:ring-slate-500/20';

  return (
    <span className={cn(
      "px-3 py-1.5 rounded-xl text-[9px] font-black ring-1 ring-inset uppercase tracking-wider whitespace-nowrap",
      currentStyle
    )}>
      {status}
    </span>
  );
}

function FooterLink({ label }: { label: string }) {
  return (
    <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
      {label}
    </a>
  );
}
