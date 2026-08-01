'use client';

import { API_URL } from "../lib/api";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CookingPot, 
  Users, 
  Calendar, 
  Search, 
  Download, 
  LogOut,
  RefreshCw,
  Bell,
  Shield,
  Trash2,
  Edit2,
  Plus,
  Globe,
  BookOpen,
  Settings,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [userRole, setUserRole] = useState('Admin');
  const [userPermissions, setUserPermissions] = useState('all');

  const [activeTab, setActiveTab] = useState<'orders' | 'reservations' | 'parties' | 'kitchen' | 'analytics' | 'staff' | 'menu' | 'settings' | 'view_website'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Menu Management & Website Edit States
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCuisineFilter, setMenuCuisineFilter] = useState('All');
  const [selectedMenuItem, setSelectedMenuItem] = useState<any | null>(null);
  
  const [menuItemName, setMenuItemName] = useState('');
  const [menuItemPrice, setMenuItemPrice] = useState<number | ''>('');
  const [menuItemVeg, setMenuItemVeg] = useState(true);
  const [menuItemCategory, setMenuItemCategory] = useState('Biryani');
  const [menuItemCuisine, setMenuItemCuisine] = useState('Indian');
  const [menuItemDesc, setMenuItemDesc] = useState('');
  const [menuItemSpice, setMenuItemSpice] = useState('Medium');
  const [menuItemPrep, setMenuItemPrep] = useState('15 mins');
  const [menuItemPortion, setMenuItemPortion] = useState('standard');
  const [menuItemHalfPrice, setMenuItemHalfPrice] = useState<number | ''>('');
  const [menuItemFullPrice, setMenuItemFullPrice] = useState<number | ''>('');
  const [menuItemSinglePrice, setMenuItemSinglePrice] = useState<number | ''>('');

  const [webSettings, setWebSettings] = useState<any>({
    restaurantName: 'Vantillu',
    tagline: 'Traditional Telugu Heritage',
    headline: 'Experience the Taste of Home',
    subheadline: 'Welcome to Vantillu. ప్రతి వంటలో సంప్రదాయం, ప్రతి ముద్దలో ఆప్యాయత.',
    prideTitle: 'Kona Seema Kodi Biryani',
    prideDescription: 'Traditional Andhra coastal-style spicy chicken biryani cooked with local Konaseema herbs.',
    pridePrice: '220'
  });
  
  // Staff User Management States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Manager');
  const [newStaffPerms, setNewStaffPerms] = useState<string[]>(['orders', 'reservations', 'parties']);
  
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingUsername, setEditingUsername] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingPassword, setEditingPassword] = useState('');
  const [editingRole, setEditingRole] = useState('');
  const [editingPerms, setEditingPerms] = useState<string[]>([]);
  
  // Password Reset States
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [resetOtp, setResetOtp] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('vantillu_admin_token');
    localStorage.removeItem('vantillu_admin_role');
    localStorage.removeItem('vantillu_admin_permissions');
    sessionStorage.clear();
    setToken('');
    setUserRole('Admin');
    setUserPermissions('all');
    setIsLoggedIn(false);
    
    // Attempt to call a backend logout if it exists, though JWTs are stateless
    // We mainly rely on local storage clearing.
    window.location.replace('/admin'); // Force reload to clear any memory state and history
  };

  // Authenticate Admin
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const authData = data.data;
        setToken(authData.token);
        localStorage.setItem('vantillu_admin_token', authData.token);
        localStorage.setItem('vantillu_admin_role', authData.role || 'Admin');
        localStorage.setItem('vantillu_admin_permissions', authData.permissions || 'all');
        setUserRole(authData.role || 'Admin');
        setUserPermissions(authData.permissions || 'all');
        setIsLoggedIn(true);
      } else {
        setErrorMsg(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      // Mock login for presentation demo
      if (username === 'admin' && password === 'vantillu123') {
        const dummyToken = 'vantillu-master-session-token';
        setToken(dummyToken);
        localStorage.setItem('vantillu_admin_token', dummyToken);
        localStorage.setItem('vantillu_admin_role', 'Owner');
        localStorage.setItem('vantillu_admin_permissions', 'all');
        setUserRole('Owner');
        setUserPermissions('all');
        setIsLoggedIn(true);
      } else {
        setErrorMsg('Could not connect to authentication server.');
      }
    }
  };


  const handleInitReset = async () => {
    setIsResetMode(true);
    setResetUsername('admin');
    setErrorMsg('');
    setResetSuccessMsg('');
    
    // Automatically trigger OTP for admin
    try {
      const res = await fetch(`${API_URL}/api/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin' }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccessMsg('OTP sent to vantillu21@gmail.com');
        setResetStep(2);
      } else {
        setErrorMsg(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setErrorMsg('Could not connect to server.');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleInitReset();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetSuccessMsg('');
    try {
      const res = await fetch(`${API_URL}/api/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: resetUsername, otp: resetOtp }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccessMsg(data.message);
        setResetStep(3);
      } else {
        setErrorMsg(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setErrorMsg('Could not connect to server.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetSuccessMsg('');
    
    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: resetUsername, otp: resetOtp, newPassword: resetNewPassword }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setResetSuccessMsg('Password updated successfully! Redirecting...');
        setTimeout(() => {
          setIsResetMode(false);
          setResetStep(1);
          setResetUsername('');
          setResetOtp('');
          setResetNewPassword('');
          setResetConfirmPassword('');
          setResetSuccessMsg('');
        }, 2000);
      } else {
        setErrorMsg(data.message || 'Password reset failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not connect to authentication server.');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffUsername || !newStaffEmail || !newStaffPassword) {
      alert('Username, email, and password are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStaffEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (newStaffPassword.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newStaffUsername,
          email: newStaffEmail,
          password: newStaffPassword,
          role: newStaffRole,
          permissions: newStaffPerms.join(',')
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Staff user created successfully!');
        setNewStaffUsername('');
        setNewStaffEmail('');
        setNewStaffPassword('');
        setNewStaffRole('Manager');
        setNewStaffPerms(['orders', 'reservations', 'parties']);
        fetchDashboardData();
      } else {
        alert(data.message || 'Failed to create staff');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating staff member');
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    try {
      const payload: any = {
        username: editingUsername,
        email: editingEmail,
        role: editingRole,
        permissions: editingPerms.join(',')
      };
      if (editingPassword) {
        payload.password = editingPassword;
      }
      const res = await fetch(`${API_URL}/api/admin/users/${editingUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Staff user updated successfully!');
        setEditingUserId(null);
        setEditingUsername('');
        setEditingPassword('');
        setEditingRole('');
        setEditingPerms([]);
        fetchDashboardData();
      } else {
        alert(data.message || 'Failed to update staff');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating staff member');
    }
  };

  const handleDeleteStaff = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this staff user?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Staff user deleted successfully!');
        fetchDashboardData();
      } else {
        alert(data.message || 'Failed to delete staff');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting staff member');
    }
  };

  const resetMenuForm = () => {
    setSelectedMenuItem(null);
    setMenuItemName('');
    setMenuItemPrice('');
    setMenuItemVeg(true);
    setMenuItemCategory('Biryani');
    setMenuItemCuisine('Indian');
    setMenuItemDesc('');
    setMenuItemSpice('Medium');
    setMenuItemPrep('15 mins');
    setMenuItemPortion('standard');
    setMenuItemHalfPrice('');
    setMenuItemFullPrice('');
    setMenuItemSinglePrice('');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/settings/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(webSettings)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        alert('Website settings updated successfully!');
        setWebSettings(resData.data);
      } else {
        alert(`Failed to save settings: ${resData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving settings.');
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: menuItemName,
      price: menuItemPrice === '' ? 0 : Number(menuItemPrice),
      isVeg: menuItemVeg,
      category: menuItemCategory,
      cuisine: menuItemCuisine,
      description: menuItemDesc,
      spiceLevel: menuItemSpice,
      prepTime: menuItemPrep,
      portionType: menuItemPortion,
      halfPrice: menuItemHalfPrice === '' ? null : Number(menuItemHalfPrice),
      fullPrice: menuItemFullPrice === '' ? null : Number(menuItemFullPrice),
      singlePrice: menuItemSinglePrice === '' ? null : Number(menuItemSinglePrice)
    };
    
    try {
      const url = selectedMenuItem ? `${API_URL}/api/admin/menu/${selectedMenuItem.id}` : `${API_URL}/api/admin/menu`;
      const method = selectedMenuItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const resData = await res.json();
      if (res.ok && resData.success) {
        alert(selectedMenuItem ? 'Menu item updated successfully!' : 'Menu item added successfully!');
        resetMenuForm();
        
        // Update local state surgically
        if (selectedMenuItem) {
          setMenuItems(prev => prev.map(m => m.id === resData.data.id ? resData.data : m));
        } else {
          setMenuItems(prev => [...prev, resData.data]);
        }
      } else {
        alert(resData.message || 'Failed to save menu item.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error saving menu item.');
      return false;
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setMenuItems(prev => prev.filter(m => m.id !== id));
      } else {
        alert(`Failed to delete menu item: ${resData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting menu item.');
    }
  };

  const hasPermission = (tabId: string) => {
    const privilegedTabs = ['menu', 'settings', 'view_website'];
    const privilegedRoles = ['Owner', 'Admin', 'Manager'];
    
    if (privilegedTabs.includes(tabId)) {
      return privilegedRoles.includes(userRole);
    }
    
    if (userPermissions === 'all') return true;
    if (tabId === 'analytics') return true;
    
    const perms = userPermissions.split(',');
    return perms.includes(tabId);
  };

  // Fetch admin dashboard details
  const fetchDashboardData = async () => {
    if (!token) return;
    setIsLoading(true);
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      // 1. Fetch Orders
      const orderRes = await fetch(`${API_URL}/api/orders`, { headers });
      if (orderRes.status === 401) {
        handleLogout();
        return;
      }
      if (orderRes.ok) {
        const oData = await orderRes.json();
        setOrders(oData);
      }

      // 2. Fetch Reservations
      const resRes = await fetch(`${API_URL}/api/reservations`, { headers });
      if (resRes.ok) {
        const rData = await resRes.json();
        setReservations(rData);
      }

      // 3. Fetch Party Orders
      const partyRes = await fetch(`${API_URL}/api/party-orders`, { headers });
      if (partyRes.ok) {
        const pData = await partyRes.json();
        setParties(pData);
      }

      // 4. Fetch Analytics
      const analRes = await fetch(`${API_URL}/api/analytics`, { headers });
      if (analRes.ok) {
        const aData = await analRes.json();
        setAnalytics(aData);
      }

      // 4.5. Fetch Menu Catalog
      const menuRes = await fetch(`${API_URL}/api/menu`);
      if (menuRes.ok) {
        const mData = await menuRes.json();
        setMenuItems(mData);
      }

      // 4.6. Fetch Website settings
      const settingsRes = await fetch(`${API_URL}/api/settings`);
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setWebSettings(sData);
      }

      // 5. Fetch Users
      const cachedPerms = localStorage.getItem('vantillu_admin_permissions') || userPermissions;
      if (cachedPerms === 'all' || cachedPerms.split(',').includes('users')) {
        const usersRes = await fetch(`${API_URL}/api/admin/users`, { headers });
        if (usersRes.ok) {
          const uData = await usersRes.json();
          setUsersList(uData.data || uData); // Handle both standardized and legacy
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger loading when token is set
  useEffect(() => {
    if (isLoggedIn && token) {
      fetchDashboardData();
      // Auto-refresh orders every 10 seconds (Live orders)
      const interval = setInterval(fetchDashboardData, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, token, userPermissions]);

  // Load token from cache on mount and verify it securely
  useEffect(() => {
    const verifyToken = async (cachedToken: string) => {
      try {
        const res = await fetch(`${API_URL}/api/admin/verify`, {
          headers: { 'Authorization': `Bearer ${cachedToken}` }
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          setToken(cachedToken);
          setUserRole(data.data?.role || localStorage.getItem('vantillu_admin_role') || 'Admin');
          setUserPermissions(data.data?.permissions || localStorage.getItem('vantillu_admin_permissions') || 'all');
          setIsLoggedIn(true);
        } else {
          // Token is invalid or expired
          handleLogout();
        }
      } catch (err) {
        console.error('Failed to verify token', err);
        // If network is completely down we might want to allow cached login, 
        // but for strict security we should require a valid check. 
        // For production, we force logout on verification failure.
        handleLogout();
      }
    };

    const cachedToken = localStorage.getItem('vantillu_admin_token');
    if (cachedToken) {
      verifyToken(cachedToken);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // 30 Minute Inactivity Timeout
  useEffect(() => {
    if (!isLoggedIn) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 30 minutes = 30 * 60 * 1000 = 1800000 ms
      timeoutId = setTimeout(() => {
        alert('Session expired due to inactivity.');
        handleLogout();
      }, 1800000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    resetTimer(); // Start the timer initially

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [isLoggedIn]);

  // Update order status route trigger
  const handleUpdateOrderStatus = async (orderId: number, nextStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? resData.data : o));
      } else {
        alert(`Failed to update status: ${resData.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Network error while updating status');
    }
  };

  // Update reservation status trigger
  const handleUpdateReservationStatus = async (resId: number, nextStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/reservations/${resId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setReservations(prev => prev.map(r => r.id === resId ? resData.data : r));
      } else {
        alert(`Failed to update reservation: ${resData.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Network error while updating reservation status');
    }
  };

  // Export CSV generator
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(val => 
        typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${val}"`
      ).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered orders selector
  const filteredOrders = orders.filter(o => {
    // Delivery boy can only view Delivery orders
    if (userRole === 'Delivery' && o.order_type !== 'Delivery') {
      return false;
    }
    const matchesSearch = 
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.phone.includes(searchTerm);
    const matchesFilter = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  if (!isLoggedIn) {
    /* Login Form View */
    return (
      <div className="min-h-screen bg-[#0f0a0a] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-[#2E1A1C] border border-brand-gold/30 rounded-3xl p-8 shadow-2xl relative"
        >
          <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-brand-gold/20 rounded-tl" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-brand-gold/20 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-brand-gold/20 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-brand-gold/20 rounded-br" />

          <h2 className="text-center font-serif text-2xl text-brand-gold font-bold tracking-wider mb-2">
            VANTILLU ADMIN
          </h2>

          {isResetMode ? (
            <>
              <p className="text-center text-xs text-white/50 mb-6 uppercase tracking-widest">
                Reset Staff Password
              </p>

              {resetStep === 1 && (
                <div className="space-y-4 text-center pb-4">
                  <p className="text-xs text-white/70">Initializing secure password reset for Admin...</p>
                  
                  {errorMsg && (
                    <p className="text-xs text-red-400 text-center font-semibold">{errorMsg}</p>
                  )}
                  {resetSuccessMsg && (
                    <p className="text-xs text-green-400 text-center font-semibold">{resetSuccessMsg}</p>
                  )}

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(false);
                        setErrorMsg('');
                        setResetSuccessMsg('');
                      }}
                      className="text-xs text-brand-gold/80 hover:text-brand-gold hover:underline cursor-pointer transition-colors"
                    >
                      Cancel & Back to Login
                    </button>
                  </div>
                </div>
              )}

              {resetStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-white/50 uppercase tracking-widest">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      required
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="e.g. 483927"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-brand-gold outline-none mt-1 text-white text-center tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  
                  {errorMsg && (
                    <p className="text-xs text-red-400 text-center font-semibold">{errorMsg}</p>
                  )}
                  {resetSuccessMsg && (
                    <p className="text-xs text-green-400 text-center font-semibold">{resetSuccessMsg}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-semibold py-3 rounded-xl cursor-pointer transition-colors shadow-lg uppercase text-xs tracking-wider"
                  >
                    Verify OTP
                  </button>
                </form>
              )}

              {resetStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-white/50 uppercase tracking-widest">New Password</label>
                    <input
                      type="password"
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-brand-gold outline-none mt-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/50 uppercase tracking-widest">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-brand-gold outline-none mt-1 text-white"
                    />
                  </div>
                  
                  {errorMsg && (
                    <p className="text-xs text-red-400 text-center font-semibold">{errorMsg}</p>
                  )}
                  {resetSuccessMsg && (
                    <p className="text-xs text-green-400 text-center font-semibold">{resetSuccessMsg}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-semibold py-3 rounded-xl cursor-pointer transition-colors shadow-lg uppercase text-xs tracking-wider"
                  >
                    Reset Password
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <p className="text-center text-xs text-white/50 mb-6 uppercase tracking-widest">
                Kitchen Operations Panel
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-brand-gold outline-none mt-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="vantillu123"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-brand-gold outline-none mt-1 text-white"
                  />
                </div>
                
                {errorMsg && (
                  <p className="text-xs text-red-400 text-center font-semibold">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-semibold py-3 rounded-xl cursor-pointer transition-colors shadow-lg uppercase text-xs tracking-wider"
                >
                  Sign In to Dashboard
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleInitReset}
                    className="text-xs text-brand-gold/80 hover:text-brand-gold hover:underline cursor-pointer transition-colors"
                  >
                    Reset Password / Forgot?
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    /* Dashboard View */
    <div className="min-h-screen bg-[#0f0a0a] text-white font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-[#2E1A1C] border-b border-brand-gold/20 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <CookingPot className="text-brand-gold" size={24} />
          <div>
            <h1 className="text-lg font-serif font-bold text-brand-gold uppercase tracking-wider">Vantillu Portal</h1>
            <p className="text-[9px] text-white/40 uppercase tracking-widest">Live Kitchen Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={fetchDashboardData}
            title="Refresh Live Data"
            className="p-2.5 rounded-full hover:bg-white/5 text-white/60 hover:text-brand-gold cursor-pointer transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-brand-brown/40 border border-brand-gold/20 hover:border-brand-gold text-brand-gold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-300"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </header>

      {/* Metrics Section */}
      <section className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/20">
        <div className="bg-[#2E1A1C]/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Today's Revenue</span>
          <span className="text-2xl font-serif text-brand-gold font-bold mt-1">
            ₹{analytics?.revenue || 0}
          </span>
        </div>
        <div className="bg-[#2E1A1C]/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Pending Orders</span>
          <span className="text-2xl font-serif text-brand-orange font-bold mt-1">
            {analytics?.status_counts?.Pending || 0}
          </span>
        </div>
        <div className="bg-[#2E1A1C]/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Preparing</span>
          <span className="text-2xl font-serif text-yellow-400 font-bold mt-1">
            {analytics?.status_counts?.Preparing || 0}
          </span>
        </div>
        <div className="bg-[#2E1A1C]/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Completed Today</span>
          <span className="text-2xl font-serif text-green-400 font-bold mt-1">
            {analytics?.status_counts?.Completed || 0}
          </span>
        </div>
      </section>

      {/* Tab Selectors */}
      <nav className="border-b border-white/5 px-6 py-2 flex gap-4 bg-[#2E1A1C]/20 overflow-x-auto scrollbar-none">
        {[
          { id: 'orders', label: 'Orders Queue', icon: Clock },
          { id: 'kitchen', label: 'Kitchen View', icon: CookingPot },
          { id: 'reservations', label: 'Table Bookings', icon: Calendar },
          { id: 'parties', label: 'Party inquiries', icon: Users },
          { id: 'analytics', label: 'Analytics Stats', icon: TrendingUp },
          { id: 'menu', label: 'Menu Management', icon: BookOpen },
          { id: 'settings', label: 'Website Settings', icon: Settings },
          { id: 'view_website', label: 'View Website', icon: Globe },
          { id: 'users', label: 'Staff Panel', icon: Shield, tabId: 'staff' },
        ]
        .filter((tab) => hasPermission(tab.id))
        .map((tab) => {
          const Icon = tab.icon;
          const targetTab = tab.tabId || tab.id;
          const isActive = activeTab === targetTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(targetTab as any)}
              className={`
                px-4 py-2.5 rounded-xl cursor-pointer text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all duration-300
                ${isActive ? 'bg-brand-gold text-brand-brown shadow' : 'text-white/60 hover:text-white'}
              `}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 w-full sm:max-w-xs items-center">
                <Search size={14} className="text-white/40" />
                <input
                  type="text"
                  placeholder="search by name or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none text-xs outline-none w-full text-white"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black/30 border border-white/10 text-xs px-3 py-2 rounded-xl text-white cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {/* CSV download button */}
                <button
                  onClick={() => exportToCSV(orders, 'vantillu_orders')}
                  disabled={orders.length === 0}
                  className="bg-brand-brown/40 border border-brand-gold/30 hover:border-brand-gold text-brand-gold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download size={13} />
                  CSV Export
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#2E1A1C]/35 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-black/30 text-white/50 border-b border-white/5">
                      <th className="p-4 uppercase tracking-wider font-semibold">ID</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Customer</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Order Details</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Grand Total</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Service Type</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Status</th>
                      <th className="p-4 uppercase tracking-wider font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-white/40 italic">
                          No orders matched your search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-white/70">#VT-{o.id}</td>
                          <td className="p-4">
                            <p className="font-semibold">{o.customer_name}</p>
                            <p className="text-[10px] text-white/40 mt-0.5">{o.phone}</p>
                            {o.address && <p className="text-[10px] text-white/40 mt-1 max-w-[150px] truncate">{o.address}</p>}
                            {o.table_no && <p className="text-[10px] text-brand-gold mt-1">Table: {o.table_no}</p>}
                          </td>
                          <td className="p-4 space-y-1">
                            {o.items.map((item: any, idx: number) => (
                              <p key={idx} className="text-white/80">
                                • {item.name} <span className="text-[10px] text-white/40">({item.spice_level})</span> x{item.quantity}
                                {item.notes && <span className="text-[9px] text-brand-orange block pl-2 font-mono">"{item.notes}"</span>}
                              </p>
                            ))}
                            {o.notes && <p className="text-[10px] text-brand-gold italic mt-2">Instruction: {o.notes}</p>}
                          </td>
                          <td className="p-4 font-serif font-semibold text-brand-gold">₹{o.grand_total}</td>
                          <td className="p-4 space-y-1.5">
                            <span className="py-0.5 px-2 bg-black/45 rounded text-[10px] font-bold border border-white/10 uppercase block w-max">
                              {o.order_type}
                            </span>
                            <div className="text-[10px] text-white/50">
                              <p className="font-semibold text-brand-gold uppercase text-[9px]">{o.payment_method || 'COD'}</p>
                              {o.transaction_id && (
                                <p className="font-mono mt-0.5 bg-black/30 px-1.5 py-0.5 rounded border border-white/5 select-all text-white/80">UTR: {o.transaction_id}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1.5">
                              <span className={`
                                py-1 px-2.5 rounded-full text-[10px] font-bold tracking-wide uppercase
                                ${o.status === 'Pending' ? 'bg-brand-orange/20 text-brand-orange' : ''}
                                ${o.status === 'Accepted' ? 'bg-sky-500/20 text-sky-400' : ''}
                                ${o.status === 'Preparing' ? 'bg-yellow-400/20 text-yellow-400' : ''}
                                ${o.status === 'Ready' ? 'bg-blue-400/20 text-blue-400' : ''}
                                ${o.status === 'Completed' ? 'bg-green-500/20 text-green-400' : ''}
                                ${o.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' : ''}
                              `}>
                                {o.status}
                              </span>
                              {o.payment_method === 'UPI' && o.status === 'Pending' && (
                                <span className="block py-0.5 px-2 rounded text-[9px] font-bold uppercase bg-amber-400/15 text-amber-400 border border-amber-400/25 w-max">
                                  ⚠ Verify UPI Payment
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-center">
                              {userRole === 'Delivery' ? (
                                o.status === 'Ready' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(o.id, 'Completed')}
                                    className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-lg font-bold cursor-pointer transition-colors"
                                  >
                                    Delivered
                                  </button>
                                )
                              ) : (
                                <>
                                  {o.status === 'Pending' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(o.id, 'Preparing')}
                                      className="bg-brand-orange hover:bg-brand-orange/90 text-white py-1 px-3 rounded-lg font-bold cursor-pointer transition-colors"
                                    >
                                      Prepare
                                    </button>
                                  )}
                                  {o.status === 'Preparing' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(o.id, 'Ready')}
                                      className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-lg font-bold cursor-pointer transition-colors"
                                    >
                                      Ready
                                    </button>
                                  )}
                                  {o.status === 'Ready' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(o.id, 'Completed')}
                                      className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-lg font-bold cursor-pointer transition-colors"
                                    >
                                      Complete
                                    </button>
                                  )}
                                  {o.status !== 'Completed' && o.status !== 'Cancelled' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(o.id, 'Cancelled')}
                                      className="border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400 py-1 px-2.5 rounded-lg cursor-pointer transition-all"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kitchen' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').map((o) => (
              <div
                key={o.id}
                className={`
                  rounded-2xl p-5 border shadow-lg relative flex flex-col justify-between
                  ${o.status === 'Pending' ? 'bg-brand-orange/5 border-brand-orange/40' : 'bg-[#2E1A1C]/40 border-brand-gold/30'}
                `}
              >
                <div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="font-bold font-serif text-brand-gold">Order #VT-{o.id}</span>
                    <span className="text-[10px] bg-black/30 py-0.5 px-2.5 rounded border border-white/10 uppercase">
                      {o.order_type}
                    </span>
                  </div>

                  <div className="py-4 space-y-3">
                    {o.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start text-sm">
                        <div>
                          <p className="font-bold text-white leading-relaxed">
                            {item.name} <span className="text-xs text-white/50 font-normal">x{item.quantity}</span>
                          </p>
                          <p className="text-[10px] text-brand-orange font-bold uppercase mt-0.5">{item.spice_level} Spice</p>
                          {item.notes && <p className="text-[11px] text-yellow-400 font-mono mt-1">"{item.notes}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {o.notes && (
                    <div className="bg-black/30 p-2.5 rounded-xl text-xs text-white/70 italic border border-white/5 mb-4">
                      Special Note: {o.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                  {o.status === 'Pending' ? (
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'Preparing')}
                      className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white py-2.5 rounded-xl font-bold cursor-pointer text-xs uppercase transition-colors"
                    >
                      Start Cooking
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'Ready')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold cursor-pointer text-xs uppercase transition-colors"
                    >
                      Mark as Prepared
                    </button>
                  )}
                </div>
              </div>
            ))}
            {orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length === 0 && (
              <div className="col-span-full py-16 text-center text-white/40 italic">
                👨‍🍳 No active orders to prepare in the kitchen queue. All done!
              </div>
            )}
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="bg-[#2E1A1C]/35 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-black/30 text-white/50 border-b border-white/5">
                    <th className="p-4 uppercase tracking-wider font-semibold">Name</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Contact</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Date & Time</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Guests Count</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Special Requests</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Status</th>
                    <th className="p-4 uppercase tracking-wider font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-white/40 italic">
                        No table reservations recorded yet.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold">{r.name}</td>
                        <td className="p-4">
                          <p>{r.phone}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{r.email}</p>
                        </td>
                        <td className="p-4 text-brand-gold font-semibold">{r.date} at {r.time}</td>
                        <td className="p-4 font-bold">{r.guests} Persons</td>
                        <td className="p-4 max-w-[200px] truncate">{r.special_requests || 'None'}</td>
                        <td className="p-4">
                          <span className={`
                            py-0.5 px-2 rounded text-[10px] font-bold uppercase
                            ${r.status === 'Pending' ? 'bg-brand-orange/20 text-brand-orange' : ''}
                            ${r.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : ''}
                            ${r.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' : ''}
                          `}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            {r.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateReservationStatus(r.id, 'Confirmed')}
                                  className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-lg font-bold cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateReservationStatus(r.id, 'Cancelled')}
                                  className="border border-red-500/30 text-red-400 py-1 px-2 rounded-lg cursor-pointer"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'parties' && (
          <div className="bg-[#2E1A1C]/35 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/30 text-white/50 border-b border-white/5">
                    <th className="p-4 uppercase tracking-wider font-semibold">Event Contact</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Event Type</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Guests count</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Event Date</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Description</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-white/40 italic">
                        No party catering inquiries received yet.
                      </td>
                    </tr>
                  ) : (
                    parties.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <p className="font-bold">{p.name}</p>
                          <p className="text-[10px] text-white/40">{p.phone}</p>
                          <p className="text-[10px] text-white/40">{p.email}</p>
                        </td>
                        <td className="p-4 font-bold text-brand-gold">{p.event_type}</td>
                        <td className="p-4 font-bold">{p.guest_count} Guest(s)</td>
                        <td className="p-4">{p.date}</td>
                        <td className="p-4 max-w-[220px] truncate">{p.description || 'No description'}</td>
                        <td className="p-4">
                          <span className={`
                            py-0.5 px-2 rounded text-[10px] font-bold uppercase
                            ${p.status === 'Pending' ? 'bg-brand-orange/20 text-brand-orange' : ''}
                            ${p.status === 'Approved' ? 'bg-green-500/20 text-green-400' : ''}
                          `}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
            {/* Left/Middle: Staff List */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-md font-serif text-brand-gold uppercase tracking-wider font-semibold">
                Active Staff Directory
              </h3>
              
              <div className="bg-[#2E1A1C]/35 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/30 text-white/50 border-b border-white/5">
                        <th className="p-4 uppercase tracking-wider font-semibold">Username</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Role</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Permissions</th>
                        <th className="p-4 uppercase tracking-wider font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-white/40 italic">
                            No staff users registered yet.
                          </td>
                        </tr>
                      ) : (
                        usersList.map((u) => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-white/80">{u.username}</td>
                            <td className="p-4">
                              <span className="py-0.5 px-2 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-[10px] uppercase font-bold rounded">
                                {u.role || 'Staff'}
                              </span>
                            </td>
                            <td className="p-4 max-w-[250px] truncate text-white/60">
                              {u.permissions === 'all' ? (
                                <span className="text-green-400 font-semibold uppercase text-[10px]">All Access</span>
                              ) : (
                                u.permissions.split(',').map((p: string) => {
                                  const labels: Record<string, string> = {
                                    orders: 'Orders',
                                    kitchen: 'Kitchen',
                                    reservations: 'Reservations',
                                    parties: 'Parties',
                                    users: 'Staff'
                                  };
                                  return labels[p] || p;
                                }).join(', ')
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => {
                                    setEditingUserId(u.id);
                                    setEditingUsername(u.username);
                                    setEditingEmail(u.email || '');
                                    setEditingRole(u.role || 'Staff');
                                    setEditingPerms(u.permissions === 'all' ? ['orders', 'kitchen', 'reservations', 'parties', 'users'] : u.permissions.split(','));
                                    setEditingPassword('');
                                  }}
                                  className="p-1.5 rounded hover:bg-white/5 text-brand-gold transition-colors cursor-pointer"
                                  title="Edit User"
                                >
                                  <Edit2 size={13} />
                                </button>
                                {u.username !== 'admin' && (
                                  <button
                                    onClick={() => handleDeleteStaff(u.id)}
                                    className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer"
                                    title="Delete User"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Side: Create / Edit Pane */}
            <div className="space-y-6">
              {editingUserId ? (
                /* Edit Staff Member Form */
                <div className="bg-[#2E1A1C]/50 border border-brand-gold/30 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <h3 className="font-serif text-brand-gold text-sm font-bold uppercase tracking-wider">
                      Edit Staff Member
                    </h3>
                    <button
                      onClick={() => setEditingUserId(null)}
                      className="text-xs text-white/50 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleUpdateStaff} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Username</label>
                      <input
                        type="text"
                        required
                        value={editingUsername}
                        onChange={(e) => setEditingUsername(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Email</label>
                      <input
                        type="email"
                        required
                        value={editingEmail}
                        onChange={(e) => setEditingEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Password (Leave blank to keep same)</label>
                      <input
                        type="password"
                        value={editingPassword}
                        onChange={(e) => setEditingPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Role</label>
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white cursor-pointer"
                      >
                        <option value="Owner">Owner</option>
                        <option value="Manager">Manager</option>
                        <option value="Kitchen">Kitchen Staff</option>
                        <option value="Cashier">Cashier</option>
                        <option value="Delivery">Delivery Lead</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-white/50 uppercase block">Access Permissions</label>
                      <div className="space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5">
                        {[
                          { id: 'orders', label: 'Orders Queue' },
                          { id: 'kitchen', label: 'Kitchen View' },
                          { id: 'reservations', label: 'Table Bookings' },
                          { id: 'parties', label: 'Party Inquiries' },
                          { id: 'users', label: 'Staff Panel' }
                        ].map((p) => (
                          <label key={p.id} className="flex items-center gap-2 text-white/70 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingPerms.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingPerms([...editingPerms, p.id]);
                                } else {
                                  setEditingPerms(editingPerms.filter(x => x !== p.id));
                                }
                              }}
                              className="rounded border-white/10 accent-brand-gold"
                            />
                            <span>{p.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold py-2.5 rounded-xl transition-colors cursor-pointer uppercase tracking-wider text-[11px]"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              ) : (
                /* Create New Staff Member Form */
                <div className="bg-[#2E1A1C]/50 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="font-serif text-brand-gold text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2.5">
                    Add New Staff
                  </h3>

                  <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Username</label>
                      <input
                        type="text"
                        required
                        value={newStaffUsername}
                        onChange={(e) => setNewStaffUsername(e.target.value)}
                        placeholder="e.g. chef_ravi"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Email</label>
                      <input
                        type="email"
                        required
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                        placeholder="e.g. chef.ravi@gmail.com"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Password</label>
                      <input
                        type="password"
                        required
                        value={newStaffPassword}
                        onChange={(e) => setNewStaffPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Role</label>
                      <select
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white cursor-pointer"
                      >
                        <option value="Owner">Owner</option>
                        <option value="Manager">Manager</option>
                        <option value="Kitchen">Kitchen Staff</option>
                        <option value="Cashier">Cashier</option>
                        <option value="Delivery">Delivery Lead</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-white/50 uppercase block">Access Permissions</label>
                      <div className="space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5">
                        {[
                          { id: 'orders', label: 'Orders Queue' },
                          { id: 'kitchen', label: 'Kitchen View' },
                          { id: 'reservations', label: 'Table Bookings' },
                          { id: 'parties', label: 'Party Inquiries' },
                          { id: 'users', label: 'Staff Panel' }
                        ].map((p) => (
                          <label key={p.id} className="flex items-center gap-2 text-white/70 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newStaffPerms.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewStaffPerms([...newStaffPerms, p.id]);
                                } else {
                                  setNewStaffPerms(newStaffPerms.filter(x => x !== p.id));
                                }
                              }}
                              className="rounded border-white/10 accent-brand-gold"
                            />
                            <span>{p.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold py-2.5 rounded-xl transition-colors cursor-pointer uppercase tracking-wider text-[11px]"
                    >
                      Create Credentials
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 text-white">
            <h3 className="text-md font-serif text-brand-gold uppercase tracking-wider font-semibold">
              Performance Analytics Dashboard
            </h3>

            {/* Day Wise Performance Table */}
            <div className="bg-[#2E1A1C]/35 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
              <h4 className="font-serif text-brand-gold text-xs uppercase tracking-wider font-bold border-b border-white/5 pb-2.5">
                Day-Wise Revenue & Customer Count
              </h4>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/30 text-white/50 border-b border-white/5">
                      <th className="p-4 uppercase tracking-wider font-semibold">Date</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Total Orders</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Unique Customers</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!analytics?.day_wise || analytics.day_wise.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-white/40 italic">
                          No daily transaction history found.
                        </td>
                      </tr>
                    ) : (
                      analytics.day_wise.map((d: any, idx: number) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-white/70">{d.date}</td>
                          <td className="p-4">{d.orders} Order(s)</td>
                          <td className="p-4">{d.customers} Customer(s)</td>
                          <td className="p-4 font-serif font-bold text-brand-gold">₹{d.revenue}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Monthly Performance Table */}
              <div className="bg-[#2E1A1C]/35 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                <h4 className="font-serif text-brand-gold text-xs uppercase tracking-wider font-bold border-b border-white/5 pb-2.5">
                  Monthly Performance stats
                </h4>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/30 text-white/50 border-b border-white/5">
                        <th className="p-4 uppercase tracking-wider font-semibold">Month</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Orders</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!analytics?.monthly || analytics.monthly.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-white/40 italic">
                            No monthly data found.
                          </td>
                        </tr>
                      ) : (
                        analytics.monthly.map((m: any, idx: number) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-white/70">{m.month}</td>
                            <td className="p-4">{m.orders} Order(s)</td>
                            <td className="p-4 font-serif font-bold text-brand-gold">₹{m.revenue}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Yearly Performance Table */}
              <div className="bg-[#2E1A1C]/35 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                <h4 className="font-serif text-brand-gold text-xs uppercase tracking-wider font-bold border-b border-white/5 pb-2.5">
                  Yearly Performance stats
                </h4>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/30 text-white/50 border-b border-white/5">
                        <th className="p-4 uppercase tracking-wider font-semibold">Year</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Orders</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!analytics?.yearly || analytics.yearly.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-white/40 italic">
                            No yearly data found.
                          </td>
                        </tr>
                      ) : (
                        analytics.yearly.map((y: any, idx: number) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-white/70">{y.year}</td>
                            <td className="p-4">{y.orders} Order(s)</td>
                            <td className="p-4 font-serif font-bold text-brand-gold">₹{y.revenue}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
            {/* Left/Middle Column: Menu catalog list */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h3 className="text-md font-serif text-brand-gold uppercase tracking-wider font-semibold">
                  Food Menu Catalog ({menuItems.length} items)
                </h3>
                <div className="flex gap-2 w-full sm:max-w-xs bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 items-center">
                  <Search size={14} className="text-white/40" />
                  <input
                    type="text"
                    placeholder="Search menu item..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="bg-transparent border-none text-xs outline-none w-full text-white"
                  />
                </div>
              </div>

              <div className="bg-[#2E1A1C]/35 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/30 text-white/50 border-b border-white/5">
                        <th className="p-4 uppercase font-semibold">Item</th>
                        <th className="p-4 uppercase font-semibold">Category</th>
                        <th className="p-4 uppercase font-semibold">Cuisine</th>
                        <th className="p-4 uppercase font-semibold">Price</th>
                        <th className="p-4 uppercase font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems
                        .filter(item => item.name.toLowerCase().includes(menuSearch.toLowerCase()))
                        .length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-white/40 italic">
                              No menu items matched your search query.
                            </td>
                          </tr>
                        ) : (
                          menuItems
                            .filter(item => item.name.toLowerCase().includes(menuSearch.toLowerCase()))
                            .map((item) => (
                              <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 flex items-center gap-3 font-semibold text-white/80">
                                  <div className="w-8 h-8 bg-black/45 border border-white/10 rounded overflow-hidden flex items-center justify-center">
                                    <img src={item.image || "/elaneer_payasam.png"} alt="" className="w-[85%] h-[85%] object-contain" />
                                  </div>
                                  <div>
                                    <p className="font-semibold flex items-center gap-1.5">
                                      {item.name}
                                      <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} title={item.isVeg ? "Veg" : "Non-Veg"} />
                                    </p>
                                    <p className="text-[10px] text-white/40 mt-0.5">{item.spiceLevel} • {item.prepTime}</p>
                                  </div>
                                </td>
                                <td className="p-4 font-medium">{item.category}</td>
                                <td className="p-4 text-brand-gold font-bold">{item.cuisine}</td>
                                <td className="p-4 font-serif font-bold text-white">
                                  {item.price ? `₹${item.price}` : 'Portions'}
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => {
                                        setSelectedMenuItem(item);
                                        setMenuItemName(item.name);
                                        setMenuItemPrice(item.price || '');
                                        setMenuItemVeg(item.isVeg);
                                        setMenuItemCategory(item.category);
                                        setMenuItemCuisine(item.cuisine);
                                        setMenuItemDesc(item.description || '');
                                        setMenuItemSpice(item.spiceLevel || 'Medium');
                                        setMenuItemPrep(item.prepTime || '15 mins');
                                        setMenuItemPortion(item.portionType || 'standard');
                                        setMenuItemHalfPrice(item.halfPrice || '');
                                        setMenuItemFullPrice(item.fullPrice || '');
                                        setMenuItemSinglePrice(item.singlePrice || '');
                                      }}
                                      className="p-1.5 rounded hover:bg-white/5 text-brand-gold transition-colors cursor-pointer"
                                      title="Edit Menu Item"
                                    >
                                      <Edit2 size={13} />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteMenuItem(item.id)}
                                      className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer"
                                      title="Delete Menu Item"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Add/Edit Pane */}
            <div className="space-y-6">
              <div className="bg-[#2E1A1C]/50 border border-brand-gold/30 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <h3 className="font-serif text-brand-gold text-sm font-bold uppercase tracking-wider">
                    {selectedMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
                  </h3>
                  {selectedMenuItem && (
                    <button onClick={resetMenuForm} className="text-xs text-white/50 hover:text-white cursor-pointer">
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveMenuItem} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase">Item Name</label>
                    <input
                      type="text"
                      required
                      value={menuItemName}
                      onChange={(e) => setMenuItemName(e.target.value)}
                      placeholder="e.g. Masala Dosa"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase block">Portion Style</label>
                      <select
                        value={menuItemPortion}
                        onChange={(e) => setMenuItemPortion(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white cursor-pointer"
                      >
                        <option value="standard">Standard Single Price</option>
                        <option value="half-full">Half / Full Portion</option>
                        <option value="single-full">Single / Family Portion</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase block">Diet type</label>
                      <select
                        value={menuItemVeg ? 'veg' : 'non-veg'}
                        onChange={(e) => setMenuItemVeg(e.target.value === 'veg')}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white cursor-pointer"
                      >
                        <option value="veg">Vegetarian</option>
                        <option value="non-veg">Non-Vegetarian</option>
                      </select>
                    </div>
                  </div>

                  {menuItemPortion === 'standard' ? (
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={menuItemPrice}
                        onChange={(e) => setMenuItemPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 150"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                      />
                    </div>
                  ) : menuItemPortion === 'half-full' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/50 uppercase">Half Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={menuItemHalfPrice}
                          onChange={(e) => setMenuItemHalfPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Half price"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/50 uppercase">Full Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={menuItemFullPrice}
                          onChange={(e) => setMenuItemFullPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Full price"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/50 uppercase">Single Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={menuItemSinglePrice}
                          onChange={(e) => setMenuItemSinglePrice(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Single price"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/50 uppercase">Family Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={menuItemFullPrice}
                          onChange={(e) => setMenuItemFullPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Family price"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase block">Cuisine Group</label>
                      <select
                        value={menuItemCuisine}
                        onChange={(e) => setMenuItemCuisine(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white cursor-pointer"
                      >
                        <option value="Indian">Indian</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Tandoor">Tandoor</option>
                        <option value="Biryani">Biryani</option>
                        <option value="Sweets">Sweets</option>
                        <option value="French Fries">French Fries</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Category Tag</label>
                      <input
                        type="text"
                        required
                        value={menuItemCategory}
                        onChange={(e) => setMenuItemCategory(e.target.value)}
                        placeholder="e.g. Soup, Curry"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase block">Spice Level</label>
                      <select
                        value={menuItemSpice}
                        onChange={(e) => setMenuItemSpice(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white cursor-pointer"
                      >
                        <option value="Mild">Mild</option>
                        <option value="Medium">Medium</option>
                        <option value="Spicy">Spicy</option>
                        <option value="Extra Spicy">Extra Spicy</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Prep Time</label>
                      <input
                        type="text"
                        required
                        value={menuItemPrep}
                        onChange={(e) => setMenuItemPrep(e.target.value)}
                        placeholder="e.g. 15 mins"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase">Description</label>
                    <textarea
                      value={menuItemDesc}
                      onChange={(e) => setMenuItemDesc(e.target.value)}
                      placeholder="Item recipe description..."
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:border-brand-gold outline-none text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold py-2.5 rounded-xl transition-colors cursor-pointer uppercase tracking-wider text-[11px]"
                  >
                    {selectedMenuItem ? 'Update Item Catalog' : 'Save New Menu Item'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto text-white">
            <div className="bg-[#2E1A1C]/50 border border-brand-gold/30 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-serif text-brand-gold text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2.5">
                Customize Website Details
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase">Restaurant Display Name</label>
                  <input
                    type="text"
                    required
                    value={webSettings.restaurantName || ''}
                    onChange={(e) => setWebSettings({...webSettings, restaurantName: e.target.value})}
                    placeholder="e.g. Vantillu Resto"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-brand-gold outline-none text-white font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase">Tagline</label>
                  <input
                    type="text"
                    required
                    value={webSettings.tagline || ''}
                    onChange={(e) => setWebSettings({...webSettings, tagline: e.target.value})}
                    placeholder="e.g. Traditional Telugu Heritage"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-brand-gold outline-none text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase">Hero Headline</label>
                  <input
                    type="text"
                    required
                    value={webSettings.headline || ''}
                    onChange={(e) => setWebSettings({...webSettings, headline: e.target.value})}
                    placeholder="e.g. Experience the Taste of Home"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-brand-gold outline-none text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase">Hero Subheadline</label>
                  <textarea
                    required
                    value={webSettings.subheadline || ''}
                    onChange={(e) => setWebSettings({...webSettings, subheadline: e.target.value})}
                    placeholder="Welcome descriptions..."
                    rows={2}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-brand-gold outline-none text-white"
                  />
                </div>

                <div className="border-t border-white/5 pt-4 space-y-4">
                  <h4 className="text-[11px] text-brand-gold font-bold uppercase tracking-wider">Spotlight Pride Dish Section</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Dish Title</label>
                      <input
                        type="text"
                        required
                        value={webSettings.prideTitle || ''}
                        onChange={(e) => setWebSettings({...webSettings, prideTitle: e.target.value})}
                        placeholder="e.g. Special Chicken Biryani"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-brand-gold outline-none text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Serving Price (₹)</label>
                      <input
                        type="text"
                        required
                        value={webSettings.pridePrice || ''}
                        onChange={(e) => setWebSettings({...webSettings, pridePrice: e.target.value})}
                        placeholder="e.g. 250"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-brand-gold outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase">Dish Description</label>
                    <textarea
                      required
                      value={webSettings.prideDescription || ''}
                      onChange={(e) => setWebSettings({...webSettings, prideDescription: e.target.value})}
                      placeholder="Special ingredients or preparation description..."
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-brand-gold outline-none text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-brown font-bold py-3 rounded-xl transition-colors cursor-pointer uppercase tracking-wider text-xs shadow-lg mt-2"
                >
                  Publish Website Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'view_website' && (
          <div className="space-y-6 text-white h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-serif text-brand-gold uppercase tracking-wider font-semibold">
                Live Website Simulator View
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest bg-black/30 px-3 py-1 rounded-lg border border-white/10">
                Local Host Address: <span className="text-brand-gold select-all font-mono">http://localhost:3000/</span>
              </p>
            </div>

            {/* Laptop Mockup Browser View Frame */}
            <div className="border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-black/50 flex flex-col relative h-[680px]">
              {/* Browser Address Bar Header */}
              <div className="bg-[#2E1A1C]/75 px-4 py-2.5 border-b border-white/5 flex items-center gap-3 select-none">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-1 text-[10px] text-white/40 font-mono flex items-center justify-between font-semibold">
                  <span>http://localhost:3000/</span>
                  <RefreshCw size={10} className="hover:text-brand-gold cursor-pointer" onClick={() => {
                    const iframe = document.getElementById('website-iframe') as HTMLIFrameElement;
                    if (iframe) iframe.src = iframe.src;
                  }} />
                </div>
              </div>
              
              {/* Web Page Display */}
              <div className="flex-1 bg-white relative">
                <iframe 
                  id="website-iframe"
                  src="/" 
                  className="w-full h-full border-none bg-[#0c0607]" 
                  title="Vantillu Restaurant Live View"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
 
