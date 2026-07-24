import React, { useState } from 'react';
import { 
  X, LayoutDashboard, MapPin, Trophy, Users, Calendar, 
  Trash2, Edit, Check, Lock, Plus, LogOut, Clock, Sparkles, 
  ShieldCheck, RefreshCw, FileText, CheckCircle,
  DollarSign, TrendingUp, BarChart3, PieChart, PlusCircle, CalendarDays,
  Copy, ExternalLink, Database, AlertTriangle, Search, Award, UserCheck, CreditCard
} from 'lucide-react';
import { Court, Booking, OpenPlay, Tournament, TeamRegistration, SocialRevenue, MemberRegistration, LandingPageConfig } from '../types';
import * as XLSX from 'xlsx';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  courts: Court[];
  onSaveCourts: (courts: Court[]) => void;
  bookings: Booking[];
  onSaveBookings: (bookings: Booking[]) => void;
  openPlays: OpenPlay[];
  onSaveOpenPlays: (openPlays: OpenPlay[]) => void;
  tournaments: Tournament[];
  onSaveTournaments: (tournaments: Tournament[]) => void;
  teamRegistrations: TeamRegistration[];
  onSaveTeamRegistrations: (regs: TeamRegistration[]) => void;
  socialRevenues: SocialRevenue[];
  onSaveSocialRevenues: (socials: SocialRevenue[]) => void;
  memberRegistrations: MemberRegistration[];
  onSaveMemberRegistrations: (regs: MemberRegistration[]) => void;
  landingPageConfig?: LandingPageConfig;
  onSaveLandingPageConfig?: (config: LandingPageConfig) => void;
}

type AdminTab = 'dashboard' | 'courts' | 'bookings' | 'openplays' | 'tournaments' | 'registrations' | 'revenue' | 'alobo_sync' | 'customer_lookup' | 'landing_page';

export default function AdminPanel({
  isOpen,
  onClose,
  courts,
  onSaveCourts,
  bookings,
  onSaveBookings,
  openPlays,
  onSaveOpenPlays,
  tournaments,
  onSaveTournaments,
  teamRegistrations,
  onSaveTeamRegistrations,
  socialRevenues,
  onSaveSocialRevenues,
  memberRegistrations = [],
  onSaveMemberRegistrations,
  landingPageConfig,
  onSaveLandingPageConfig
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [regSubTab, setRegSubTab] = useState<'tournament' | 'training'>('training');
  const [authError, setAuthError] = useState('');

  // Landing Page Edit State
  const [landingForm, setLandingForm] = useState<LandingPageConfig>({
    heroTag: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    visionTag: '',
    visionTitle: '',
    visionParagraph1: '',
    visionParagraph2: '',
    visionImage: '',
    stat1Value: '',
    stat1Label: '',
    stat2Value: '',
    stat2Label: '',
    stat3Value: '',
    stat3Label: '',
    visionBadgeTitle: '',
    visionBadgeText: '',
    priceTitle: '',
    priceSection1Title: '',
    priceRows1: [],
    priceSection2Title: '',
    priceRows2: []
  });
  const [isSavingLanding, setIsSavingLanding] = useState(false);

  React.useEffect(() => {
    if (landingPageConfig) {
      setLandingForm(landingPageConfig);
    }
  }, [landingPageConfig, activeTab]);

  // Customer search states
  const [customerSearchKeyword, setCustomerSearchKeyword] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Editing structures
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  const [editingOpenPlayId, setEditingOpenPlayId] = useState<string | null>(null);

  // Forms states
  const [courtForm, setCourtForm] = useState<Partial<Court>>({});
  const [tournamentForm, setTournamentForm] = useState<Partial<Tournament>>({});
  const [openPlayForm, setOpenPlayForm] = useState<Partial<OpenPlay>>({});

  // Revenue form and filter states
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [socialForm, setSocialForm] = useState<Partial<SocialRevenue>>({});
  const [filterYear, setFilterYear] = useState<string>('2026');
  const [filterMonth, setFilterMonth] = useState<string>('All');
  const [filterCourt, setFilterCourt] = useState<string>('All');

  // Member registrations handlers
  const [memberSyncingId, setMemberSyncingId] = useState<string | null>(null);

  const handleDeleteMemberReg = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xoá đăng ký gói tập này không?')) {
      const updated = memberRegistrations.filter(r => r.id !== id);
      onSaveMemberRegistrations(updated);
    }
  };

  const handleToggleMemberStatus = (id: string) => {
    const updated = memberRegistrations.map(r => r.id === id ? { ...r, status: (r.status === 'confirmed' ? 'pending' : 'confirmed') as 'pending' | 'confirmed' } : r);
    onSaveMemberRegistrations(updated);
  };

  const handleManualSyncMember = async (reg: MemberRegistration) => {
    setMemberSyncingId(reg.id);
    try {
      const res = await fetch('/api/alobo/forward-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addRegistration',
          contractId: reg.id,
          contractDate: reg.contractDate,
          fullName: reg.fullName,
          dob: reg.dob,
          phone: reg.phone,
          preferredTime: reg.preferredTime,
          hoursCount: reg.hoursCount,
          packageType: reg.packageType,
          durationMonths: reg.durationMonths,
          coachName: reg.coachName,
          serviceType: reg.serviceType,
          totalPrice: reg.totalPrice,
          depositAmount: reg.depositAmount,
          remainingAmount: reg.remainingAmount,
          actualPaid: reg.actualPaid
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Đã gửi dữ liệu hợp đồng ${reg.fullName} lên Google Sheet thành công!`);
      } else {
        alert(`Gửi thất bại: ${data.error || 'Vui lòng kiểm tra lại cấu hình webhook.'}`);
      }
    } catch (e: any) {
      alert(`Lỗi kết nối: ${e.message || 'Không thể kết nối đến máy chủ.'}`);
    } finally {
      setMemberSyncingId(null);
    }
  };

  // Alobo & Google Sheets Sync State
  const [googleSheetWebhookUrl, setGoogleSheetWebhookUrl] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [aloboApiUrl, setAloboApiUrl] = useState('');
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [aloboSyncIntervalMinutes, setAloboSyncIntervalMinutes] = useState(5);
  const [isDirectSyncing, setIsDirectSyncing] = useState(false);
  const [directSyncStatus, setDirectSyncStatus] = useState('');
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; error?: string } | null>(null);
  
  // Custom manual forward form state
  const [manualBookingForm, setManualBookingForm] = useState({
    fullName: '',
    phone: '',
    courtName: 'Sân 1',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 - 10:00',
    price: '150.000',
    paymentStatus: 'Đã thanh toán'
  });
  const [isManualSending, setIsManualSending] = useState(false);
  const [manualSendResult, setManualSendResult] = useState<{ success?: boolean; error?: string } | null>(null);

  // AI Copy-Paste Sync State
  const [aiPasteText, setAiPasteText] = useState('');
  const [isParsingPaste, setIsParsingPaste] = useState(false);
  const [aiPasteResult, setAiPasteResult] = useState<{ success?: boolean; error?: string; booking?: any } | null>(null);

  // Check if running on static hosting (like Vercel) where there is no local backend server
  const isStaticHosting = typeof window !== 'undefined' && !window.location.hostname.includes('run.app') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  const [backendUrl, setBackendUrl] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('alobo_backend_url') || '' : '';
  });

  const hasNoBackend = isStaticHosting && !backendUrl;

  // AI Member Importer State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  const handleAIImport = async () => {
    if (!importRawText.trim()) {
      setImportError('Vui lòng nhập nội dung danh sách khách hàng.');
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportSuccessMsg('');

    try {
      const res = await fetch('/api/member-registrations/parse-raw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rawText: importRawText })
      });

      const data = await res.json();
      if (data.success && data.members) {
        setImportSuccessMsg(data.message || `Đã nhập thành công ${data.members.length} khách hàng!`);
        // Prepend the new members to the state list
        onSaveMemberRegistrations([...data.members, ...memberRegistrations]);
        setImportRawText('');
      } else {
        setImportError(data.error || 'Có lỗi xảy ra khi xử lý bằng AI.');
      }
    } catch (err: any) {
      setImportError(err.message || 'Lỗi kết nối tới máy chủ.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileDropOrSelect = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let file: File | null = null;
    if ('dataTransfer' in e) {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        file = e.dataTransfer.files[0];
      }
    } else {
      if (e.target.files && e.target.files.length > 0) {
        file = e.target.files[0];
      }
    }

    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType === 'csv' || fileType === 'txt' || fileType === 'json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImportRawText(event.target.result as string);
          setImportError('');
        }
      };
      reader.readAsText(file);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            const data = new Uint8Array(event.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            // Convert to CSV for standard Gemini parsing! This works beautifully!
            const csvText = XLSX.utils.sheet_to_csv(worksheet);
            setImportRawText(csvText);
            setImportError('');
          }
        } catch (err: any) {
          setImportError('Lỗi đọc file Excel: ' + (err.message || err));
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImportRawText(event.target.result as string);
          setImportError('');
        }
      };
      reader.readAsText(file);
    }
  };

  // Firebase Integration State
  const [firebaseActive, setFirebaseActive] = useState(false);
  const [firebaseProjectId, setFirebaseProjectId] = useState<string | null>(null);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);

  // Fetch Firebase Status
  React.useEffect(() => {
    fetch('/api/firebase/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFirebaseActive(data.isFirebaseActive);
          setFirebaseProjectId(data.projectId);
        }
      })
      .catch(err => console.error('Error fetching firebase status:', err));
  }, []);

  const handleFirebaseBulkSync = async () => {
    setIsBulkSyncing(true);
    try {
      const res = await fetch('/api/firebase/bulk-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookings, memberRegistrations })
      });
      const data = await res.json();
      if (data.success) {
        alert('Đồng bộ hóa đám mây Firebase thành công! Tất cả danh sách khách hàng và lịch đặt sân hiện tại đã được lưu vào Firestore cá nhân của bạn.');
      } else {
        alert('Đồng bộ hóa thất bại: ' + (data.error || 'Vui lòng kiểm tra cấu hình Firebase.'));
      }
    } catch (err: any) {
      alert('Không thể kết nối đến máy chủ: ' + err.message);
    } finally {
      setIsBulkSyncing(false);
    }
  };

  const getSheetId = () => {
    const match = googleSheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '1-Hw978q5B4krlwS_PemsnmV6axata5wyQVFVuWdpo38';
  };

  // Load config on authentication or tab switch
  React.useEffect(() => {
    if (isAuthenticated && activeTab === 'alobo_sync') {
      fetchConfig();
    }
  }, [isAuthenticated, activeTab]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/alobo/config');
      const data = await res.json();
      if (data.success && data.config) {
        setGoogleSheetWebhookUrl(data.config.googleSheetWebhookUrl || '');
        setGoogleSheetUrl(data.config.googleSheetUrl || '');
        setAloboApiUrl(data.config.aloboApiUrl || '');
        setIsAutoSyncEnabled(data.config.isAutoSyncEnabled !== false);
        setAloboSyncIntervalMinutes(data.config.aloboSyncIntervalMinutes || 5);
        setSyncLogs(data.config.forwardLogs || []);
      }
    } catch (err) {
      console.error('Error fetching alobo config:', err);
    }
  };

  const saveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/alobo/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          googleSheetWebhookUrl, 
          googleSheetUrl,
          aloboApiUrl,
          isAutoSyncEnabled,
          aloboSyncIntervalMinutes
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Cấu hình hệ thống đã được cập nhật thành công!');
        fetchConfig();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err) {
      alert('Không thể kết nối tới máy chủ.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleDirectBrowserSync = async () => {
    if (!aloboApiUrl) {
      alert('Vui lòng điền link máy chủ Alobo (API URL) trước!');
      return;
    }
    
    setIsDirectSyncing(true);
    setDirectSyncStatus('Đang thử kết nối đồng bộ trực tiếp bằng Browser-Side CORS Proxy (Khuyên dùng)...');
    
    try {
      let fetchedData = null;
      let usedProxy = '';

      // Try proxy 1: corsproxy.io
      try {
        usedProxy = 'corsproxy.io';
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(aloboApiUrl)}`;
        const proxyRes = await fetch(proxyUrl);
        if (proxyRes.ok) {
          fetchedData = await proxyRes.json();
        }
      } catch (err) {
        console.warn('corsproxy.io failed, trying allorigins...', err);
      }

      // Try proxy 2: allorigins if first failed
      if (!fetchedData) {
        try {
          usedProxy = 'allorigins.win';
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(aloboApiUrl)}`;
          const proxyRes = await fetch(proxyUrl);
          if (proxyRes.ok) {
            fetchedData = await proxyRes.json();
          }
        } catch (err) {
          console.warn('allorigins failed...', err);
        }
      }

      if (fetchedData) {
        setDirectSyncStatus(`Lấy dữ liệu thô thành công qua ${usedProxy}! Đang gửi về máy chủ để phân tích bằng AI Gemini...`);
        
        const syncRes = await fetch('/api/alobo/sync-raw-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawJson: fetchedData,
            date: new Date().toISOString().split('T')[0]
          })
        });

        const syncData = await syncRes.json();
        if (syncData.success) {
          setDirectSyncStatus('✓ Đồng bộ hoàn tất thành công rực rỡ! Dữ liệu đã được nạp và ghi lên Google Sheets.');
          alert('Đồng bộ thành công! Lịch đặt sân và hồ sơ khách hàng đã được cập nhật thành công lên website và Google Sheets.');
          fetchConfig();
          return;
        } else {
          throw new Error(syncData.error || 'Máy chủ không thể phân tích dữ liệu JSON.');
        }
      }

      // Fallback to server proxy fetch
      setDirectSyncStatus('CORS Proxy trình duyệt bị chặn. Đang thử đồng bộ qua Máy chủ Backend (Có thể lỗi do sai lệch múi giờ)...');
      
      const response = await fetch('/api/alobo/fetch-live-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: aloboApiUrl
        })
      });
      
      const serverData = await response.json();
      if (serverData.success) {
        setDirectSyncStatus('✓ Đồng bộ thành công rực rỡ thông qua Máy chủ!');
        alert('Chúc mừng! Đã hoàn thành đồng bộ tự động trực tiếp từ Alobo sang hệ thống thành công!');
        fetchConfig();
      } else {
        throw new Error(serverData.error || 'Cả CORS Proxy và Máy chủ đều không thể đồng bộ.');
      }
    } catch (err: any) {
      console.error('[Direct Sync Error]', err);
      setDirectSyncStatus(`Lỗi đồng bộ: ${err.message || 'Không thể lấy dữ liệu.'}`);
      alert(`Đồng bộ thất bại: ${err.message || 'Không thể kết nối. Hãy thử sử dụng Tiện ích Bookmarklet 1-Click hoặc Copy-Paste để thay thế.'}`);
    } finally {
      setIsDirectSyncing(false);
    }
  };

  // Silent Browser Auto-Sync Hook
  React.useEffect(() => {
    if (!isAutoSyncEnabled || !aloboApiUrl) return;

    const runSilentSync = async () => {
      try {
        console.log('[Silent Auto-Sync] Triggering background API sync via server proxy...');
        await fetch('/api/alobo/fetch-live-api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: aloboApiUrl
          })
        });
        console.log('[Silent Auto-Sync] Successfully background synced via server proxy.');
      } catch (e) {
        console.warn('[Silent Auto-Sync] Failed silently:', e);
      }
    };

    // Run once on mount (with short delay to let page render)
    const timeoutId = setTimeout(runSilentSync, 5000);

    // Run periodically
    const intervalId = setInterval(runSilentSync, aloboSyncIntervalMinutes * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isAutoSyncEnabled, aloboApiUrl, aloboSyncIntervalMinutes]);

  const clearSyncLogs = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đồng bộ?')) return;
    try {
      const res = await fetch('/api/alobo/config/clear-logs', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncLogs([]);
      }
    } catch (err) {
      console.error('Error clearing sync logs:', err);
    }
  };

  const handleTestConnection = async () => {
    if (hasNoBackend) {
      setTestResult({ error: 'Bạn cần cấu hình đường dẫn máy chủ kết nối ở bên trái trước khi thực hiện thử nghiệm.' });
      alert('Chưa kết nối máy chủ: Bạn đang chạy giao diện từ Vercel. Vui lòng dán link Máy chủ Cloud Run hoặc AI Studio vào mục "Cấu hình Máy chủ Backend (Dành cho Vercel)" ở cột bên trái trước.');
      return;
    }
    setIsTestingSheet(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/alobo/test-sheet', { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err.message || 'Lỗi kết nối mạng.' });
    } finally {
      setIsTestingSheet(false);
    }
  };

  const handleManualSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasNoBackend) {
      setManualSendResult({ error: 'Bạn cần cấu hình đường dẫn máy chủ kết nối ở bên trái trước khi thực hiện gửi.' });
      alert('Chưa kết nối máy chủ: Bạn đang chạy giao diện từ Vercel. Vui lòng dán link Máy chủ Cloud Run hoặc AI Studio vào mục "Cấu hình Máy chủ Backend (Dành cho Vercel)" ở cột bên trái trước.');
      return;
    }
    setIsManualSending(true);
    setManualSendResult(null);
    try {
      const res = await fetch('/api/alobo/forward-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...manualBookingForm, isManual: true })
      });
      const data = await res.json();
      setManualSendResult(data.result || data);
      if (data.success) {
        setManualBookingForm({
          ...manualBookingForm,
          fullName: '',
          phone: '',
          price: '150.000',
          courtName: 'Sân 1',
          date: new Date().toISOString().split('T')[0],
          timeSlot: '09:00 - 10:00',
          paymentStatus: 'Đã thanh toán'
        });
        fetchConfig(); // Reload logs
      }
    } catch (err: any) {
      setManualSendResult({ error: err.message || 'Lỗi kết nối mạng.' });
    } finally {
      setIsManualSending(false);
    }
  };

  const handleAIPasteSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToParse = aiPasteText.trim();
    if (!textToParse) return;
    setIsParsingPaste(true);
    setAiPasteResult(null);
    try {
      const isJson = textToParse.startsWith('{') || textToParse.startsWith('[');
      const urlToUse = isJson ? '/api/alobo/sync-raw-json' : '/api/alobo/parse-text-sync';
      
      let bodyData: any = {};
      if (isJson) {
        try {
          bodyData = { 
            rawJson: JSON.parse(textToParse), 
            date: new Date().toISOString().split('T')[0] 
          };
        } catch (jsonErr) {
          throw new Error('Dữ liệu JSON dán vào bị lỗi định dạng: ' + (jsonErr as Error).message);
        }
      } else {
        bodyData = { 
          rawText: textToParse, 
          date: new Date().toISOString().split('T')[0] 
        };
      }

      const res = await fetch(urlToUse, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        setAiPasteResult({
          success: true,
          bookings: data.bookings || [{ fullName: 'Dữ liệu Alobo', courtName: 'Đồng bộ', timeSlot: 'Hoàn tất', price: 'Xem CRM' }],
          booking: data.bookings?.[0]
        });
        setAiPasteText('');
        fetchConfig(); // Reload sync logs
        alert('Đồng bộ dữ liệu thành công! Khách đặt sân đã được cập nhật.');
      } else {
        setAiPasteResult({
          success: false,
          error: data.error || 'Trích xuất dữ liệu thất bại.'
        });
      }
    } catch (err: any) {
      setAiPasteResult({
        success: false,
        error: err.message || 'Lỗi kết nối mạng khi gửi dữ liệu lên AI.'
      });
    } finally {
      setIsParsingPaste(false);
    }
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '8888' || password.toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Mã bảo mật không đúng! Vui lòng thử lại.');
    }
  };

  // Courts CRUD
  const startEditCourt = (court: Court) => {
    setEditingCourtId(court.id);
    setCourtForm(court);
  };

  const startAddCourt = () => {
    setEditingCourtId('new');
    setCourtForm({
      id: 'court-' + Math.random().toString(36).substr(2, 9),
      name: '',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800',
      address: '',
      region: 'Hồ Chí Minh',
      rating: 4.8,
      pricePerHour: 150000,
      amenities: ['Wifi miễn phí', 'Cho thuê vợt', 'Sân mái che'],
      slots: ['06:00 - 08:00', '08:00 - 10:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
    });
  };

  const saveCourtForm = () => {
    if (!courtForm.name || !courtForm.address) {
      alert('Vui lòng điền tên và địa chỉ cụm sân!');
      return;
    }
    if (editingCourtId === 'new') {
      onSaveCourts([...courts, courtForm as Court]);
    } else {
      onSaveCourts(courts.map(c => c.id === editingCourtId ? (courtForm as Court) : c));
    }
    setEditingCourtId(null);
    setCourtForm({});
  };

  const deleteCourt = (id: string) => {
    if (confirm('Bạn chắc chắn muốn xoá cụm sân này khỏi hệ thống?')) {
      onSaveCourts(courts.filter(c => c.id !== id));
    }
  };

  // Tournaments CRUD
  const startEditTournament = (tour: Tournament) => {
    setEditingTournamentId(tour.id);
    setTournamentForm(tour);
  };

  const startAddTournament = () => {
    setEditingTournamentId('new');
    setTournamentForm({
      id: 'tour-' + Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      tag: 'CUP MỚI',
      image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=800',
      date: '25/08/2026',
      registrationFee: 500000,
      teamsRegistered: 0,
      maxTeams: 32,
      category: 'Đôi Nam / Đôi Nữ / Đôi Nam Nữ',
      status: 'Đang mở'
    });
  };

  const saveTournamentForm = () => {
    if (!tournamentForm.name || !tournamentForm.description) {
      alert('Vui lòng điền đầy đủ tên và mô tả giải đấu!');
      return;
    }
    if (editingTournamentId === 'new') {
      onSaveTournaments([...tournaments, tournamentForm as Tournament]);
    } else {
      onSaveTournaments(tournaments.map(t => t.id === editingTournamentId ? (tournamentForm as Tournament) : t));
    }
    setEditingTournamentId(null);
    setTournamentForm({});
  };

  const deleteTournament = (id: string) => {
    if (confirm('Bạn chắc chắn muốn xoá giải đấu này?')) {
      onSaveTournaments(tournaments.filter(t => t.id !== id));
    }
  };

  // Open Plays CRUD
  const startEditOpenPlay = (op: OpenPlay) => {
    setEditingOpenPlayId(op.id);
    setOpenPlayForm(op);
  };

  const startAddOpenPlay = () => {
    setEditingOpenPlayId('new');
    setOpenPlayForm({
      id: 'op-' + Math.random().toString(36).substr(2, 9),
      title: '',
      level: 'Mọi cấp độ',
      location: courts[0]?.name || 'Pickle Bounce Thảo Điền',
      date: 'Thứ Bảy, Tuần này',
      time: '18:00 - 20:00',
      joinedPlayers: ['Admin'],
      maxPlayers: 6,
      hostName: 'Cộng đồng',
      fee: 50000,
      description: 'Ráp kèo giao lưu, vui vẻ, cọ xát nâng trình!'
    });
  };

  const saveOpenPlayForm = () => {
    if (!openPlayForm.title) {
      alert('Vui lòng điền tiêu đề kèo giao lưu!');
      return;
    }
    if (editingOpenPlayId === 'new') {
      onSaveOpenPlays([...openPlays, openPlayForm as OpenPlay]);
    } else {
      onSaveOpenPlays(openPlays.map(op => op.id === editingOpenPlayId ? (openPlayForm as OpenPlay) : op));
    }
    setEditingOpenPlayId(null);
    setOpenPlayForm({});
  };

  const deleteOpenPlay = (id: string) => {
    if (confirm('Bạn chắc chắn muốn huỷ bỏ kèo giao lưu này khỏi sảnh chờ?')) {
      onSaveOpenPlays(openPlays.filter(op => op.id !== id));
    }
  };

  // Booking log updates
  const toggleBookingStatus = (id: string) => {
    onSaveBookings(bookings.map(b => b.id === id ? {
      ...b,
      status: b.status === 'confirmed' ? 'pending' : 'confirmed'
    } : b));
  };

  const deleteBooking = (id: string) => {
    if (confirm('Huỷ bỏ đơn đặt sân này khỏi danh sách quản lý?')) {
      onSaveBookings(bookings.filter(b => b.id !== id));
    }
  };

  // Registrations updates
  const toggleRegStatus = (id: string) => {
    onSaveTeamRegistrations(teamRegistrations.map(r => r.id === id ? {
      ...r,
      status: r.status === 'confirmed' ? 'pending' : 'confirmed'
    } : r));
  };

  const deleteReg = (id: string) => {
    if (confirm('Xoá đội đăng ký này khỏi giải đấu?')) {
      onSaveTeamRegistrations(teamRegistrations.filter(r => r.id !== id));
    }
  };

  // Social revenues CRUD
  const startEditSocial = (soc: SocialRevenue) => {
    setEditingSocialId(soc.id);
    setSocialForm(soc);
  };

  const startAddSocial = () => {
    setEditingSocialId('new');
    setSocialForm({
      id: 'soc-' + Math.random().toString(36).substr(2, 9),
      courtId: courts[0]?.id || 'court-1',
      courtName: courts[0]?.name || 'Sân 1 - Sport Pickle Bounce',
      date: new Date().toISOString().split('T')[0],
      amount: 300000,
      playersCount: 4,
      notes: '',
      createdAt: new Date().toISOString()
    });
  };

  const saveSocialForm = () => {
    if (!socialForm.amount || socialForm.amount <= 0) {
      alert('Vui lòng nhập số tiền doanh thu hợp lệ!');
      return;
    }
    const selectedCourtObj = courts.find(c => c.id === socialForm.courtId);
    const updatedForm = {
      ...socialForm,
      courtName: selectedCourtObj ? selectedCourtObj.name : (socialForm.courtName || 'Cụm sân'),
    } as SocialRevenue;

    if (editingSocialId === 'new') {
      onSaveSocialRevenues([...socialRevenues, updatedForm]);
    } else {
      onSaveSocialRevenues(socialRevenues.map(s => s.id === editingSocialId ? updatedForm : s));
    }
    setEditingSocialId(null);
    setSocialForm({});
  };

  const deleteSocial = (id: string) => {
    if (confirm('Bạn chắc chắn muốn xoá khoản doanh thu khách lẻ này?')) {
      onSaveSocialRevenues(socialRevenues.filter(s => s.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] w-full max-w-5xl h-[90vh] shadow-2xl border border-brand-border/40 overflow-hidden relative flex flex-col">
        
        {/* Header Block */}
        <div className="bg-brand-dark p-5 text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
          <div className="absolute right-0 top-0 text-white/5 font-display font-black text-9xl transform translate-x-12 -translate-y-8 pointer-events-none">
            A
          </div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center text-white">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-display font-bold text-[10px] tracking-widest text-brand-red uppercase">
                HỆ THỐNG ĐIỀU HÀNH
              </span>
              <h2 className="font-display font-black text-xl tracking-tight mt-0.5 flex items-center gap-2">
                Cổng Quản Trị Pickle Bounce
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            {isAuthenticated && (
              <button 
                onClick={() => setIsAuthenticated(false)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Đăng xuất
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Authentication Form */}
        {!isAuthenticated ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-brand-red-light rounded-full flex items-center justify-center text-brand-red mb-6 animate-pulse">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-display font-black text-xl text-brand-dark mb-2">
              Xác Minh Quyền Quản Trị Viên
            </h3>
            <p className="font-sans text-xs text-brand-gray mb-6 leading-relaxed">
              Vui lòng nhập mã PIN bảo mật để truy cập bảng quản lý và điều chỉnh thông tin cụm sân, kèo đấu, giải đấu, và người đăng ký.
              <br />
              <span className="inline-block bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded mt-2">
                MÃ PIN DEMO: <strong className="font-mono">8888</strong> hoặc <strong className="font-mono">admin</strong>
              </span>
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input 
                type="password"
                required
                placeholder="Nhập mã bảo mật (e.g. 8888)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-center bg-brand-light-gray border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-4 py-3 text-sm text-brand-dark font-black tracking-widest outline-none transition-all"
              />
              {authError && (
                <p className="text-brand-red text-xs font-semibold">{authError}</p>
              )}
              <button 
                type="submit"
                className="w-full bg-brand-red hover:bg-brand-red-hover text-white font-sans font-bold text-xs py-3 rounded-full transition-colors cursor-pointer shadow-lg shadow-brand-red/10 uppercase tracking-wider"
              >
                Truy Cập Hệ Thống
              </button>
            </form>
          </div>
        ) : (
          /* Main Dashboard layout */
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-brand-light-gray border-b md:border-b-0 md:border-r border-brand-border/40 p-4 space-y-1 overflow-y-auto flex-shrink-0 flex md:block flex-nowrap whitespace-nowrap md:whitespace-normal gap-2">
              <div className="hidden md:block text-[9px] font-bold text-brand-gray uppercase tracking-widest px-3 mb-2">
                Hệ điều hành
              </div>
              <button 
                onClick={() => { setActiveTab('dashboard'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span>Dashboard Tổng Quan</span>
              </button>

              <button 
                onClick={() => { setActiveTab('courts'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'courts' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Quản Lý Cụm Sân</span>
                <span className="bg-brand-dark/15 text-[10px] px-1.5 py-0.5 rounded ml-auto">{courts.length}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('bookings'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'bookings' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>Đơn Đặt Sân Chơi</span>
                <span className="bg-brand-dark/15 text-[10px] px-1.5 py-0.5 rounded ml-auto">{bookings.length}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('openplays'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'openplays' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>Quản Lý Kèo Ghép</span>
                <span className="bg-brand-dark/15 text-[10px] px-1.5 py-0.5 rounded ml-auto">{openPlays.length}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('tournaments'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'tournaments' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <Trophy className="w-4 h-4 flex-shrink-0" />
                <span>Quản Lý Giải Đấu</span>
                <span className="bg-brand-dark/15 text-[10px] px-1.5 py-0.5 rounded ml-auto">{tournaments.length}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('registrations'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'registrations' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Danh Sách Đăng Ký Giải</span>
                <span className="bg-brand-dark/15 text-[10px] px-1.5 py-0.5 rounded ml-auto">{teamRegistrations.length}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('revenue'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'revenue' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <DollarSign className="w-4 h-4 flex-shrink-0" />
                <span>Doanh Thu Thực Tế</span>
                <span className="bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded ml-auto font-black font-sans uppercase">
                  VND
                </span>
              </button>

              <button 
                onClick={() => { setActiveTab('alobo_sync'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'alobo_sync' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <RefreshCw className="w-4 h-4 flex-shrink-0" />
                <span>Đồng Bộ Alobo & Sheets</span>
                <span className="bg-[#4285F4] text-white text-[9px] px-1.5 py-0.5 rounded ml-auto font-black font-sans uppercase">
                  AUTO
                </span>
              </button>

              <button 
                onClick={() => { setActiveTab('customer_lookup'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'customer_lookup' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <Search className="w-4 h-4 flex-shrink-0" />
                <span>Tra Cứu Khách Hàng</span>
                <span className="bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded ml-auto font-black font-sans uppercase font-sans">
                  TÌM
                </span>
              </button>

              <button 
                onClick={() => { setActiveTab('landing_page'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'landing_page' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>Nội Dung Landing Page</span>
                <span className="bg-brand-red text-white text-[9px] px-1.5 py-0.5 rounded ml-auto font-black font-sans uppercase">
                  SỬA
                </span>
              </button>
            </div>

            {/* Main Tab Content Panel */}
            <div className="flex-grow p-6 overflow-y-auto bg-white dark-scroll">

              {/* 1. Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-brand-dark">Tổng Quan Hiệu Suất Vận Hành</h3>
                    <p className="font-sans text-xs text-brand-gray mt-1">Dữ liệu phân tích thời gian thực thu được trong phiên lưu trữ hiện tại.</p>
                  </div>

                  {/* Stat cards bento grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                      <div className="text-brand-red font-display font-black text-3xl">{courts.length}</div>
                      <div className="font-sans text-xs font-bold text-brand-dark/80 mt-1">Cụm Sân Hoạt Động</div>
                      <MapPin className="w-12 h-12 text-brand-red/5 absolute -right-2 -bottom-2" />
                    </div>
                    <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                      <div className="text-brand-red font-display font-black text-3xl">{bookings.length}</div>
                      <div className="font-sans text-xs font-bold text-brand-dark/80 mt-1">Tổng Lượt Đặt Sân</div>
                      <Calendar className="w-12 h-12 text-brand-red/5 absolute -right-2 -bottom-2" />
                    </div>
                    <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                      <div className="text-brand-red font-display font-black text-3xl">{openPlays.length}</div>
                      <div className="font-sans text-xs font-bold text-brand-dark/80 mt-1">Kèo Giao Lưu Đang Mở</div>
                      <Users className="w-12 h-12 text-brand-red/5 absolute -right-2 -bottom-2" />
                    </div>
                    <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                      <div className="text-brand-red font-display font-black text-3xl">{teamRegistrations.length}</div>
                      <div className="font-sans text-xs font-bold text-brand-dark/80 mt-1">Đội Đăng Ký Đấu Cup</div>
                      <Trophy className="w-12 h-12 text-brand-red/5 absolute -right-2 -bottom-2" />
                    </div>
                  </div>

                  {/* Booking list overview & rapid actions */}
                  <div className="pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-bold text-base text-brand-dark flex items-center gap-1.5">
                        <Sparkles className="w-4.5 h-4.5 text-brand-red" />
                        Giao dịch / Lượt Đặt Sân Gần Nhất
                      </h4>
                      <button 
                        onClick={() => setActiveTab('bookings')}
                        className="font-sans font-bold text-xs text-brand-red hover:underline"
                      >
                        Quản lý tất cả ({bookings.length}) →
                      </button>
                    </div>

                    <div className="bg-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs border-collapse font-sans">
                        <thead>
                          <tr className="bg-brand-light-gray text-brand-gray font-bold border-b border-brand-border/40">
                            <th className="p-3">Mã đơn</th>
                            <th className="p-3">Khách hàng</th>
                            <th className="p-3">Sân đấu</th>
                            <th className="p-3">Thời gian</th>
                            <th className="p-3">Tổng tiền</th>
                            <th className="p-3 text-center">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40">
                          {bookings.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-brand-gray">Chưa có lịch đặt sân nào từ người dùng.</td>
                            </tr>
                          ) : (
                            bookings.slice(0, 5).map((booking) => (
                              <tr key={booking.id} className="hover:bg-brand-light-gray/50">
                                <td className="p-3 font-mono font-bold text-brand-dark">{booking.id}</td>
                                <td className="p-3">
                                  <div className="font-bold text-brand-dark">{booking.fullName}</div>
                                  <div className="text-[10px] text-brand-gray">{booking.phone}</div>
                                </td>
                                <td className="p-3 font-semibold text-brand-dark">{booking.courtName}</td>
                                <td className="p-3">
                                  <div>Ngày {booking.date.split('-').reverse().join('/')}</div>
                                  <div className="text-[10px] text-brand-red font-semibold">{booking.timeSlot}</div>
                                </td>
                                <td className="p-3 font-bold text-brand-dark">{booking.totalPrice.toLocaleString('vi-VN')}đ</td>
                                <td className="p-3 text-center">
                                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xử lý'}
                                  </span>
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

              {/* 2. Courts Management Tab */}
              {activeTab === 'courts' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-display font-black text-xl text-brand-dark">Quản Lý Danh Sách Cụm Sân</h3>
                      <p className="font-sans text-xs text-brand-gray mt-1">Sửa đổi giá giờ chơi, thêm mới các cụm sân có mái che hoặc chỉnh sửa tiện ích.</p>
                    </div>
                    {editingCourtId === null && (
                      <button 
                        onClick={startAddCourt}
                        className="bg-brand-red hover:bg-brand-red-hover text-white px-4 py-2 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm Cụm Sân Mới
                      </button>
                    )}
                  </div>

                  {editingCourtId !== null ? (
                    /* Edit Court form */
                    <div className="bg-brand-light-gray p-6 rounded-3xl border border-brand-border/40 space-y-4">
                      <h4 className="font-display font-bold text-base text-brand-dark">
                        {editingCourtId === 'new' ? 'Thêm Cụm Sân Mới Vào Hệ Thống' : `Chỉnh sửa: ${courtForm.name}`}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Tên cụm sân</label>
                          <input 
                            type="text"
                            value={courtForm.name || ''}
                            onChange={(e) => setCourtForm({...courtForm, name: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                            placeholder="Pickle Bounce Thảo Điền"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Địa chỉ chính xác</label>
                          <input 
                            type="text"
                            value={courtForm.address || ''}
                            onChange={(e) => setCourtForm({...courtForm, address: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                            placeholder="Số 12 Nguyễn Văn Hưởng..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Khu vực (Bộ lọc)</label>
                          <input 
                            type="text"
                            value={courtForm.region || ''}
                            onChange={(e) => setCourtForm({...courtForm, region: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Giá thuê 1 Giờ (VND)</label>
                          <input 
                            type="number"
                            step={10000}
                            value={courtForm.pricePerHour || 0}
                            onChange={(e) => setCourtForm({...courtForm, pricePerHour: parseInt(e.target.value) || 0})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Đánh giá sao (1-5)</label>
                          <input 
                            type="number"
                            step={0.1}
                            min={1}
                            max={5}
                            value={courtForm.rating || 4.8}
                            onChange={(e) => setCourtForm({...courtForm, rating: parseFloat(e.target.value) || 4.8})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Đường dẫn ảnh cụm sân</label>
                          <input 
                            type="text"
                            value={courtForm.image || ''}
                            onChange={(e) => setCourtForm({...courtForm, image: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-brand-border/40">
                        <button 
                          onClick={() => { setEditingCourtId(null); setCourtForm({}); }}
                          className="bg-white border border-brand-border/40 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                        <button 
                          onClick={saveCourtForm}
                          className="bg-brand-red text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Lưu Cấu Hình
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display list of courts in simple grid cards */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courts.map(court => (
                        <div key={court.id} className="p-4 rounded-2xl border border-brand-border/40 bg-white flex gap-4 relative group">
                          <img 
                            src={court.image} 
                            alt={court.name}
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="flex-grow space-y-1 overflow-hidden">
                            <span className="inline-block bg-brand-red-light text-brand-red text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                              {court.region}
                            </span>
                            <h4 className="font-display font-bold text-sm text-brand-dark truncate">{court.name}</h4>
                            <p className="font-sans text-[11px] text-brand-gray truncate">{court.address}</p>
                            <div className="flex items-center gap-3 pt-1">
                              <span className="font-sans text-xs text-brand-dark font-bold">Giá: {court.pricePerHour.toLocaleString('vi-VN')}đ/h</span>
                              <span className="font-sans text-[11px] text-green-600 font-bold">★ {court.rating}</span>
                            </div>
                          </div>

                          <div className="absolute top-4 right-4 flex gap-1">
                            <button 
                              onClick={() => startEditCourt(court)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-1.5 rounded text-brand-gray transition-colors cursor-pointer"
                              title="Sửa"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteCourt(court.id)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-1.5 rounded text-brand-gray transition-colors cursor-pointer"
                              title="Xoá"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Bookings Log Tab */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-brand-dark">Danh Sách Lịch Đặt Sân Chơi</h3>
                    <p className="font-sans text-xs text-brand-gray mt-1">Quản lý duyệt đơn đặt sân của khách hàng, huỷ các lượt đặt quá hạn hoặc đổi trạng thái.</p>
                  </div>

                  <div className="bg-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead>
                        <tr className="bg-brand-light-gray text-brand-gray font-bold border-b border-brand-border/40">
                          <th className="p-3">Mã đơn</th>
                          <th className="p-3">Họ và tên</th>
                          <th className="p-3">Số điện thoại</th>
                          <th className="p-3">Sân đã chọn</th>
                          <th className="p-3">Ngày & Ca</th>
                          <th className="p-3">Thành tiền</th>
                          <th className="p-3 text-center">Xử lý</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-brand-gray">Chưa ghi nhận lượt đặt sân nào.</td>
                          </tr>
                        ) : (
                          bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-brand-light-gray/50">
                              <td className="p-3 font-mono font-bold text-brand-red">{booking.id}</td>
                              <td className="p-3 font-semibold text-brand-dark">{booking.fullName}</td>
                              <td className="p-3 font-mono text-brand-gray">{booking.phone}</td>
                              <td className="p-3 font-bold text-brand-dark">{booking.courtName}</td>
                              <td className="p-3">
                                <div>{booking.date.split('-').reverse().join('/')}</div>
                                <div className="text-[10px] text-brand-red font-semibold">{booking.timeSlot}</div>
                              </td>
                              <td className="p-3 font-bold text-brand-dark">{booking.totalPrice.toLocaleString('vi-VN')}đ</td>
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button 
                                    onClick={() => toggleBookingStatus(booking.id)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                      booking.status === 'confirmed' 
                                        ? 'bg-green-100 text-green-700 hover:bg-yellow-100 hover:text-yellow-700' 
                                        : 'bg-yellow-100 text-yellow-700 hover:bg-green-100 hover:text-green-700'
                                    }`}
                                  >
                                    {booking.status === 'confirmed' ? 'Duyệt xong' : 'Ấn Duyệt'}
                                  </button>
                                  <button 
                                    onClick={() => deleteBooking(booking.id)}
                                    className="p-1.5 hover:bg-brand-red-light hover:text-brand-red rounded text-brand-gray/50 transition-all cursor-pointer"
                                    title="Xoá đơn"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
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
              )}

              {/* 4. Open Plays Management Tab */}
              {activeTab === 'openplays' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-display font-black text-xl text-brand-dark">Quản Lý Kèo Ghép Cộng Đồng</h3>
                      <p className="font-sans text-xs text-brand-gray mt-1">Thêm các kèo đấu mẫu của Ban tổ chức hoặc huỷ các tin đăng có thông tin không phù hợp.</p>
                    </div>
                    {editingOpenPlayId === null && (
                      <button 
                        onClick={startAddOpenPlay}
                        className="bg-brand-red hover:bg-brand-red-hover text-white px-4 py-2 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Tạo Kèo Đấu Mới
                      </button>
                    )}
                  </div>

                  {editingOpenPlayId !== null ? (
                    /* Edit/Add Open Play form */
                    <div className="bg-brand-light-gray p-6 rounded-3xl border border-brand-border/40 space-y-4">
                      <h4 className="font-display font-bold text-base text-brand-dark">
                        {editingOpenPlayId === 'new' ? 'Khởi Tạo Kèo Ghép Mới' : `Sửa kèo: ${openPlayForm.title}`}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Tiêu đề kèo giao lưu</label>
                          <input 
                            type="text"
                            value={openPlayForm.title || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, title: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                            placeholder="Giao lưu cuối tuần..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Sân chơi (Địa điểm)</label>
                          <select 
                            value={openPlayForm.location || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, location: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-2.5 py-2 text-xs text-brand-dark font-medium outline-none"
                          >
                            {courts.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Cấp độ yêu cầu</label>
                          <select 
                            value={openPlayForm.level || 'Mọi cấp độ'}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, level: e.target.value as any})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-2.5 py-2 text-xs text-brand-dark outline-none"
                          >
                            <option value="Mọi cấp độ">Mọi cấp độ</option>
                            <option value="Người mới (1.0-2.5)">Người mới (1.0-2.5)</option>
                            <option value="Trung cấp (2.5-3.5)">Trung cấp (2.5-3.5)</option>
                            <option value="Nâng cao (3.5+)">Nâng cao (3.5+)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Ngày diễn ra</label>
                          <input 
                            type="text"
                            value={openPlayForm.date || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, date: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            placeholder="Chủ Nhật, Tuần này"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Giờ diễn ra</label>
                          <input 
                            type="text"
                            value={openPlayForm.time || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, time: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            placeholder="18:00 - 20:00"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Phí chia sân (VND)</label>
                          <input 
                            type="number"
                            value={openPlayForm.fee || 0}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, fee: parseInt(e.target.value) || 0})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Số lượng tối đa</label>
                          <input 
                            type="number"
                            value={openPlayForm.maxPlayers || 4}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, maxPlayers: parseInt(e.target.value) || 4})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Người đăng (Host)</label>
                          <input 
                            type="text"
                            value={openPlayForm.hostName || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, hostName: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Nội dung / Mô tả kèo</label>
                          <input 
                            type="text"
                            value={openPlayForm.description || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, description: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-brand-border/40">
                        <button 
                          onClick={() => { setEditingOpenPlayId(null); setOpenPlayForm({}); }}
                          className="bg-white border border-brand-border/40 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                        <button 
                          onClick={saveOpenPlayForm}
                          className="bg-brand-red text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Lưu Kèo Đấu
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display List */
                    <div className="space-y-3">
                      {openPlays.map(op => (
                        <div key={op.id} className="p-4 rounded-xl border border-brand-border/40 bg-white flex justify-between items-center gap-4">
                          <div>
                            <span className="bg-brand-dark/10 text-brand-dark text-[9px] font-bold px-2 py-0.5 rounded">
                              {op.level}
                            </span>
                            <h4 className="font-display font-bold text-sm text-brand-dark mt-1">{op.title}</h4>
                            <p className="font-sans text-xs text-brand-gray">{op.location} • {op.date} lúc {op.time}</p>
                            <div className="text-[10px] text-brand-gray mt-1">Host: <strong>{op.hostName}</strong> • Sĩ số: <strong>{op.joinedPlayers.length}/{op.maxPlayers}</strong> • Phí: <strong>{op.fee.toLocaleString('vi-VN')} VND</strong></div>
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => startEditOpenPlay(op)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-2 rounded text-brand-gray transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteOpenPlay(op.id)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-2 rounded text-brand-gray transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Tournaments Tab */}
              {activeTab === 'tournaments' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-display font-black text-xl text-brand-dark">Cấu Hình Giải Đấu Cup</h3>
                      <p className="font-sans text-xs text-brand-gray mt-1">Thiết lập các giải đấu cộng đồng phong trào hoặc giải đấu đối tác doanh nghiệp.</p>
                    </div>
                    {editingTournamentId === null && (
                      <button 
                        onClick={startAddTournament}
                        className="bg-brand-red hover:bg-brand-red-hover text-white px-4 py-2 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Tạo Giải Đấu Mới
                      </button>
                    )}
                  </div>

                  {editingTournamentId !== null ? (
                    /* Edit/Add Tournament form */
                    <div className="bg-brand-light-gray p-6 rounded-3xl border border-brand-border/40 space-y-4">
                      <h4 className="font-display font-bold text-base text-brand-dark">
                        {editingTournamentId === 'new' ? 'Mở Giải Đấu Mới' : `Sửa giải đấu: ${tournamentForm.name}`}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Tên giải đấu</label>
                          <input 
                            type="text"
                            value={tournamentForm.name || ''}
                            onChange={(e) => setTournamentForm({...tournamentForm, name: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                            placeholder="Bounce Cup 2026..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Tag nhận diện (e.g. BOUNCE CUP)</label>
                          <input 
                            type="text"
                            value={tournamentForm.tag || ''}
                            onChange={(e) => setTournamentForm({...tournamentForm, tag: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Ngày thi đấu</label>
                          <input 
                            type="text"
                            value={tournamentForm.date || ''}
                            onChange={(e) => setTournamentForm({...tournamentForm, date: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Hạng mục</label>
                          <input 
                            type="text"
                            value={tournamentForm.category || ''}
                            onChange={(e) => setTournamentForm({...tournamentForm, category: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            placeholder="Đôi Nam / Đôi Nữ / Đôi Nam Nữ"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Trạng thái giải</label>
                          <select 
                            value={tournamentForm.status || 'Đang mở'}
                            onChange={(e) => setTournamentForm({...tournamentForm, status: e.target.value as any})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-2.5 py-2 text-xs text-brand-dark outline-none"
                          >
                            <option value="Đang mở">Đang mở</option>
                            <option value="Sắp diễn ra">Sắp diễn ra</option>
                            <option value="Đã kết thúc">Đã kết thúc</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Lệ phí giải đấu (VND / Cặp)</label>
                          <input 
                            type="number"
                            value={tournamentForm.registrationFee || 0}
                            onChange={(e) => setTournamentForm({...tournamentForm, registrationFee: parseInt(e.target.value) || 0})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Số đội tối đa</label>
                          <input 
                            type="number"
                            value={tournamentForm.maxTeams || 16}
                            onChange={(e) => setTournamentForm({...tournamentForm, maxTeams: parseInt(e.target.value) || 16})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Số đội đã đăng ký (Bổ sung)</label>
                          <input 
                            type="number"
                            value={tournamentForm.teamsRegistered || 0}
                            onChange={(e) => setTournamentForm({...tournamentForm, teamsRegistered: parseInt(e.target.value) || 0})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Mô tả tóm tắt giải</label>
                        <textarea 
                          value={tournamentForm.description || ''}
                          onChange={(e) => setTournamentForm({...tournamentForm, description: e.target.value})}
                          className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none h-16 resize-none"
                          placeholder="Mô tả giải đấu..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white/50 p-3 rounded-2xl border border-brand-border/20">
                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Hình ảnh đại diện giải đấu (Thumbnail URL/Path)</label>
                          <input 
                            type="text"
                            value={tournamentForm.image || ''}
                            onChange={(e) => setTournamentForm({...tournamentForm, image: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            placeholder="Ví dụ: https://images.unsplash.com/... hoặc đường dẫn ảnh"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {tournamentForm.image && (
                            <img 
                              src={tournamentForm.image} 
                              alt="Thumbnail Preview" 
                              className="w-10 h-10 rounded-lg object-cover border border-brand-border/30"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=800';
                              }}
                            />
                          )}
                          <span className="text-[10px] text-brand-gray font-medium">Xem trước</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-brand-border/40">
                        <button 
                          onClick={() => { setEditingTournamentId(null); setTournamentForm({}); }}
                          className="bg-white border border-brand-border/40 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                        <button 
                          onClick={saveTournamentForm}
                          className="bg-brand-red text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Lưu Giải Đấu
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display list of tournaments */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tournaments.map(t => (
                        <div key={t.id} className="p-4 rounded-2xl border border-brand-border/40 bg-white flex flex-col justify-between relative group">
                          <div>
                            <span className="bg-brand-red text-white text-[9px] font-bold px-2 py-0.5 rounded">
                              {t.tag}
                            </span>
                            <h4 className="font-display font-bold text-base text-brand-dark mt-2">{t.name}</h4>
                            <p className="font-sans text-xs text-brand-gray mt-1 leading-snug line-clamp-2">{t.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-sans text-brand-gray pt-3">
                              <div>Khởi tranh: <strong className="text-brand-dark">{t.date}</strong></div>
                              <div>Hạng mục: <strong className="text-brand-dark">{t.category}</strong></div>
                              <div>Sĩ số: <strong className="text-brand-red">{t.teamsRegistered}/{t.maxTeams} Đội</strong></div>
                              <div>Lệ phí: <strong className="text-brand-dark">{t.registrationFee.toLocaleString('vi-VN')} VND</strong></div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-4 border-t border-brand-border/30 mt-3">
                            <button 
                              onClick={() => startEditTournament(t)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-2 rounded text-brand-gray transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteTournament(t.id)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-2 rounded text-brand-gray transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 6. Tournament & Member Registrations Tab */}
              {activeTab === 'registrations' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-display font-black text-xl text-brand-dark">Cổng Quản Lý Danh Sách Đăng Ký</h3>
                      <p className="font-sans text-xs text-brand-gray mt-1">Xem danh sách đăng ký giải đấu và các hợp đồng đăng ký gói tập/HLV của thành viên.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {regSubTab === 'training' && (
                        <button
                          onClick={() => {
                            setIsImportModalOpen(true);
                            setImportError('');
                            setImportSuccessMsg('');
                          }}
                          className="flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-dark px-4 py-2 rounded-full font-sans font-extrabold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Nhập Nhanh bằng AI (Excel)
                        </button>
                      )}

                      {/* Sub Tab Switcher */}
                      <div className="flex bg-brand-light-gray p-1 rounded-full border border-brand-border/40">
                      <button 
                        onClick={() => setRegSubTab('training')}
                        className={`px-4 py-1.5 rounded-full font-sans font-bold text-xs transition-all cursor-pointer ${
                          regSubTab === 'training' 
                            ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20' 
                            : 'text-brand-gray hover:text-brand-dark'
                        }`}
                      >
                        Đăng Ký Gói Tập ({memberRegistrations.length})
                      </button>
                      <button 
                        onClick={() => setRegSubTab('tournament')}
                        className={`px-4 py-1.5 rounded-full font-sans font-bold text-xs transition-all cursor-pointer ${
                          regSubTab === 'tournament' 
                            ? 'bg-brand-red text-white shadow-sm shadow-brand-red/20' 
                            : 'text-brand-gray hover:text-brand-dark'
                        }`}
                      >
                        Đăng Ký Giải Đấu ({teamRegistrations.length})
                      </button>
                    </div>
                  </div>
                </div>

                  {regSubTab === 'tournament' ? (
                    <div className="bg-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs border-collapse font-sans">
                        <thead>
                          <tr className="bg-brand-light-gray text-brand-gray font-bold border-b border-brand-border/40">
                            <th className="p-3">Mã đăng ký</th>
                            <th className="p-3">Tên Đội</th>
                            <th className="p-3">Giải Đấu</th>
                            <th className="p-3">Thành viên</th>
                            <th className="p-3">Liên hệ</th>
                            <th className="p-3 text-center">Xử lý</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40">
                          {teamRegistrations.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-brand-gray">Chưa ghi nhận lượt đăng ký thi đấu giải nào.</td>
                            </tr>
                          ) : (
                            teamRegistrations.map((reg) => (
                              <tr key={reg.id} className="hover:bg-brand-light-gray/50">
                                <td className="p-3 font-mono font-bold text-brand-red">{reg.id}</td>
                                <td className="p-3 font-black text-brand-dark">{reg.teamName}</td>
                                <td className="p-3 font-bold text-brand-dark truncate max-w-[150px]" title={reg.tournamentName}>{reg.tournamentName}</td>
                                <td className="p-3 text-[11px]">
                                  <div>Cầu thủ 1: <strong>{reg.player1}</strong></div>
                                  <div>Cầu thủ 2: <strong>{reg.player2}</strong></div>
                                </td>
                                <td className="p-3">
                                  <div>{reg.phone}</div>
                                  <div className="text-[10px] text-brand-gray">{reg.email}</div>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button 
                                      onClick={() => toggleRegStatus(reg.id)}
                                      className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                        reg.status === 'confirmed' 
                                          ? 'bg-green-100 text-green-700 hover:bg-yellow-100 hover:text-yellow-700' 
                                          : 'bg-yellow-100 text-yellow-700 hover:bg-green-100 hover:text-green-700'
                                      }`}
                                    >
                                      {reg.status === 'confirmed' ? 'Đã duyệt' : 'Chờ duyệt'}
                                    </button>
                                    <button 
                                      onClick={() => deleteReg(reg.id)}
                                      className="p-1.5 hover:bg-brand-red-light hover:text-brand-red rounded text-brand-gray/50 transition-all cursor-pointer"
                                      title="Xoá đăng ký"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-sans min-w-[1000px]">
                        <thead>
                          <tr className="bg-brand-light-gray text-brand-gray font-bold border-b border-brand-border/40">
                            <th className="p-3 whitespace-nowrap">STT</th>
                            <th className="p-3 whitespace-nowrap">Ngày ký HĐ</th>
                            <th className="p-3 whitespace-nowrap">Họ & Tên</th>
                            <th className="p-3 whitespace-nowrap">Ngày sinh</th>
                            <th className="p-3 whitespace-nowrap">SĐT</th>
                            <th className="p-3 whitespace-nowrap">Lịch tập</th>
                            <th className="p-3 whitespace-nowrap">Số giờ tập</th>
                            <th className="p-3 whitespace-nowrap">Gói tập</th>
                            <th className="p-3 whitespace-nowrap">Thời hạn</th>
                            <th className="p-3 whitespace-nowrap">HLV</th>
                            <th className="p-3 whitespace-nowrap">Dịch vụ</th>
                            <th className="p-3 whitespace-nowrap">Giá trị (đ)</th>
                            <th className="p-3 whitespace-nowrap">Đặt cọc (đ)</th>
                            <th className="p-3 whitespace-nowrap">Còn lại (đ)</th>
                            <th className="p-3 whitespace-nowrap">Thực tế (đ)</th>
                            <th className="p-3 whitespace-nowrap text-center">Xử lý</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40 text-[11px]">
                          {memberRegistrations.length === 0 ? (
                            <tr>
                              <td colSpan={16} className="p-8 text-center text-brand-gray">Chưa ghi nhận lượt đăng ký gói tập nào.</td>
                            </tr>
                          ) : (
                            memberRegistrations.map((reg, idx) => (
                              <tr key={reg.id} className="hover:bg-brand-light-gray/50">
                                <td className="p-3 font-mono text-brand-gray font-semibold text-center">{idx + 1}</td>
                                <td className="p-3 font-medium whitespace-nowrap">{reg.contractDate}</td>
                                <td className="p-3 font-bold text-brand-dark whitespace-nowrap">{reg.fullName}</td>
                                <td className="p-3 text-brand-gray whitespace-nowrap">{reg.dob}</td>
                                <td className="p-3 font-mono font-bold text-brand-dark whitespace-nowrap">{reg.phone}</td>
                                <td className="p-3 text-brand-gray truncate max-w-[120px]" title={reg.preferredTime}>{reg.preferredTime}</td>
                                <td className="p-3 text-brand-gray whitespace-nowrap">{reg.hoursCount}</td>
                                <td className="p-3 font-medium text-brand-dark truncate max-w-[130px]" title={reg.packageType}>{reg.packageType}</td>
                                <td className="p-3 whitespace-nowrap">{reg.durationMonths} tháng</td>
                                <td className="p-3 font-semibold text-brand-blue whitespace-nowrap">{reg.coachName}</td>
                                <td className="p-3 text-brand-gray whitespace-nowrap">{reg.serviceType}</td>
                                <td className="p-3 font-mono font-bold text-brand-dark whitespace-nowrap text-right">
                                  {reg.totalPrice.toLocaleString('vi-VN')}
                                </td>
                                <td className="p-3 font-mono text-green-600 whitespace-nowrap text-right">
                                  {reg.depositAmount.toLocaleString('vi-VN')}
                                </td>
                                <td className="p-3 font-mono text-red-500 whitespace-nowrap text-right">
                                  {reg.remainingAmount.toLocaleString('vi-VN')}
                                </td>
                                <td className="p-3 font-mono font-bold text-brand-blue whitespace-nowrap text-right">
                                  {reg.actualPaid.toLocaleString('vi-VN')}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <button 
                                      onClick={() => handleToggleMemberStatus(reg.id)}
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                                        reg.status === 'confirmed' 
                                          ? 'bg-green-50 text-green-700 hover:bg-yellow-50 hover:text-yellow-700' 
                                          : 'bg-yellow-50 text-yellow-700 hover:bg-green-50 hover:text-green-700'
                                      }`}
                                    >
                                      {reg.status === 'confirmed' ? 'Duyệt' : 'Chờ'}
                                    </button>
                                    
                                    {/* Webhook sheet forward button */}
                                    <button 
                                      disabled={memberSyncingId === reg.id}
                                      onClick={() => handleManualSyncMember(reg)}
                                      className="p-1 rounded text-brand-blue hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-center"
                                      title="Đẩy dữ liệu thủ công lên Google Sheets"
                                    >
                                      {memberSyncingId === reg.id ? (
                                        <div className="w-3.5 h-3.5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                                      ) : (
                                        <Database className="w-3.5 h-3.5" />
                                      )}
                                    </button>

                                    <button 
                                      onClick={() => handleDeleteMemberReg(reg.id)}
                                      className="p-1 hover:bg-brand-red-light hover:text-brand-red rounded text-brand-gray/50 transition-all cursor-pointer"
                                      title="Xoá hợp đồng"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 7. Actual Revenue Management Tab */}
              {activeTab === 'revenue' && (() => {
                // Prepare all transaction rows
                const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
                
                const onlineTx = confirmedBookings.map(b => ({
                  id: b.id,
                  type: 'online' as const,
                  date: b.date,
                  amount: b.totalPrice,
                  courtId: b.courtId,
                  courtName: b.courtName,
                  detail: `Khách đặt sân: ${b.fullName} (${b.phone}) - Ca ${b.timeSlot}`,
                  createdAt: b.createdAt || b.date + 'T12:00:00Z'
                }));

                const socialTx = socialRevenues.map(s => ({
                  id: s.id,
                  type: 'social' as const,
                  date: s.date,
                  amount: s.amount,
                  courtId: s.courtId,
                  courtName: s.courtName,
                  detail: `Khách lẻ social: ${s.notes || 'Chơi giao lưu tự do'} - ${s.playersCount} người`,
                  createdAt: s.createdAt || s.date + 'T12:00:00Z'
                }));

                // Combine and sort by date descending
                const allTx = [...onlineTx, ...socialTx].sort((a, b) => {
                  const dateCompare = b.date.localeCompare(a.date);
                  if (dateCompare !== 0) return dateCompare;
                  return b.createdAt.localeCompare(a.createdAt);
                });

                // Apply Filters
                const filteredTx = allTx.filter(tx => {
                  const txYear = tx.date.split('-')[0];
                  const txMonth = tx.date.split('-')[1]; // "01", "02", etc.
                  
                  const yearMatch = filterYear === 'All' || txYear === filterYear;
                  const monthMatch = filterMonth === 'All' || txMonth === filterMonth;
                  const courtMatch = filterCourt === 'All' || tx.courtId === filterCourt;
                  
                  return yearMatch && monthMatch && courtMatch;
                });

                // Aggregated stats
                const totalRevenue = filteredTx.reduce((sum, t) => sum + t.amount, 0);
                const onlineRevenue = filteredTx.filter(t => t.type === 'online').reduce((sum, t) => sum + t.amount, 0);
                const socialRevenue = filteredTx.filter(t => t.type === 'social').reduce((sum, t) => sum + t.amount, 0);
                const averageTxAmount = filteredTx.length > 0 ? Math.round(totalRevenue / filteredTx.length) : 0;

                // Group data for the charts
                // If filterYear is "All", group by Year (2024, 2025, 2026, 2027 etc.)
                // If filterYear is specific, group by Month (01 to 12)
                const yearsInDataset = Array.from(new Set(allTx.map(t => t.date.split('-')[0]))).sort();
                
                let chartData: { label: string; online: number; social: number; total: number }[] = [];
                
                if (filterYear === 'All') {
                  chartData = yearsInDataset.map(yr => {
                    const yearTxs = allTx.filter(t => t.date.startsWith(yr) && (filterCourt === 'All' || t.courtId === filterCourt));
                    const onlineVal = yearTxs.filter(t => t.type === 'online').reduce((sum, t) => sum + t.amount, 0);
                    const socialVal = yearTxs.filter(t => t.type === 'social').reduce((sum, t) => sum + t.amount, 0);
                    return {
                      label: `Năm ${yr}`,
                      online: onlineVal,
                      social: socialVal,
                      total: onlineVal + socialVal
                    };
                  });
                } else {
                  // Monthly of selected year
                  const monthsList = [
                    { key: '01', name: 'T1' },
                    { key: '02', name: 'T2' },
                    { key: '03', name: 'T3' },
                    { key: '04', name: 'T4' },
                    { key: '05', name: 'T5' },
                    { key: '06', name: 'T6' },
                    { key: '07', name: 'T7' },
                    { key: '08', name: 'T8' },
                    { key: '09', name: 'T9' },
                    { key: '10', name: 'T10' },
                    { key: '11', name: 'T11' },
                    { key: '12', name: 'T12' },
                  ];
                  chartData = monthsList.map(m => {
                    const monthTxs = allTx.filter(t => t.date.startsWith(`${filterYear}-${m.key}`) && (filterCourt === 'All' || t.courtId === filterCourt));
                    const onlineVal = monthTxs.filter(t => t.type === 'online').reduce((sum, t) => sum + t.amount, 0);
                    const socialVal = monthTxs.filter(t => t.type === 'social').reduce((sum, t) => sum + t.amount, 0);
                    return {
                      label: m.name,
                      online: onlineVal,
                      social: socialVal,
                      total: onlineVal + socialVal
                    };
                  });
                }

                // Max value for scaling chart bars
                const maxChartVal = Math.max(...chartData.map(d => d.total), 100000);

                return (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Title Block */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <h3 className="font-display font-black text-xl text-brand-dark flex items-center gap-2">
                          <DollarSign className="w-6 h-6 text-green-600 bg-green-100 p-1 rounded-full" />
                          Báo Cáo Doanh Thu Thực Tế Của Sân
                        </h3>
                        <p className="font-sans text-xs text-brand-gray mt-1">
                          Thống kê kết hợp doanh thu đặt sân trực tuyến thành công và ghi nhận khách lẻ đánh social vãng lai (Chỉ hiển thị cho Admin).
                        </p>
                      </div>
                      
                      <button 
                        onClick={startAddSocial}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors shadow-lg shadow-green-600/10"
                      >
                        <Plus className="w-4 h-4" />
                        Ghi Nhận Khách Lẻ (Social)
                      </button>
                    </div>

                    {/* Filter controls section */}
                    <div className="bg-brand-light-gray/60 border border-brand-border/40 p-4 rounded-2xl flex flex-wrap gap-4 items-end">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider">Chọn Năm</label>
                        <select 
                          value={filterYear}
                          onChange={(e) => { setFilterYear(e.target.value); setFilterMonth('All'); }}
                          className="bg-white border border-brand-border/40 rounded-xl px-3 py-1.5 text-xs text-brand-dark font-semibold outline-none"
                        >
                          <option value="All">Tất cả các năm</option>
                          <option value="2026">Năm 2026</option>
                          <option value="2025">Năm 2025</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider">Chọn Tháng</label>
                        <select 
                          value={filterMonth}
                          disabled={filterYear === 'All'}
                          onChange={(e) => setFilterMonth(e.target.value)}
                          className="bg-white border border-brand-border/40 rounded-xl px-3 py-1.5 text-xs text-brand-dark font-semibold outline-none disabled:opacity-50"
                        >
                          <option value="All">Tất cả các tháng</option>
                          <option value="01">Tháng 1</option>
                          <option value="02">Tháng 2</option>
                          <option value="03">Tháng 3</option>
                          <option value="04">Tháng 4</option>
                          <option value="05">Tháng 5</option>
                          <option value="06">Tháng 6</option>
                          <option value="07">Tháng 7</option>
                          <option value="08">Tháng 8</option>
                          <option value="09">Tháng 9</option>
                          <option value="10">Tháng 10</option>
                          <option value="11">Tháng 11</option>
                          <option value="12">Tháng 12</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider">Lọc theo cụm sân</label>
                        <select 
                          value={filterCourt}
                          onChange={(e) => setFilterCourt(e.target.value)}
                          className="bg-white border border-brand-border/40 rounded-xl px-3 py-1.5 text-xs text-brand-dark font-semibold outline-none"
                        >
                          <option value="All">Tất cả các sân</option>
                          {courts.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <button 
                        onClick={() => { setFilterYear('2026'); setFilterMonth('All'); setFilterCourt('All'); }}
                        className="text-xs font-bold text-brand-gray hover:text-brand-red ml-auto pb-2 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Đặt lại bộ lọc
                      </button>
                    </div>

                    {/* Stats Blocks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-dark to-brand-dark/90 text-white relative overflow-hidden shadow-md">
                        <div className="text-2xl font-display font-black text-green-400">
                          {totalRevenue.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="font-sans text-[11px] font-bold text-white/70 mt-1 uppercase tracking-wider">Tổng Doanh Thu Thực Tế</div>
                        <TrendingUp className="w-12 h-12 text-white/5 absolute -right-2 -bottom-2" />
                      </div>

                      <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                        <div className="text-xl font-display font-black text-brand-red">
                          {onlineRevenue.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="font-sans text-[11px] font-bold text-brand-gray mt-1 uppercase tracking-wider">Đặt Sân Online ({filteredTx.filter(t => t.type === 'online').length} ca)</div>
                        <CheckCircle className="w-12 h-12 text-brand-red/5 absolute -right-2 -bottom-2" />
                      </div>

                      <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                        <div className="text-xl font-display font-black text-green-600">
                          {socialRevenue.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="font-sans text-[11px] font-bold text-brand-gray mt-1 uppercase tracking-wider">Khách Lẻ Social ({filteredTx.filter(t => t.type === 'social').length} lượt)</div>
                        <Users className="w-12 h-12 text-green-600/5 absolute -right-2 -bottom-2" />
                      </div>

                      <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                        <div className="text-xl font-display font-black text-brand-dark">
                          {averageTxAmount.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="font-sans text-[11px] font-bold text-brand-gray mt-1 uppercase tracking-wider">Doanh thu trung bình / ca</div>
                        <DollarSign className="w-12 h-12 text-brand-dark/5 absolute -right-2 -bottom-2" />
                      </div>

                    </div>

                    {/* Chart & visual analytics block */}
                    <div className="bg-white border border-brand-border/40 p-5 rounded-3xl space-y-4">
                      <div>
                        <h4 className="font-display font-bold text-sm text-brand-dark flex items-center gap-1.5">
                          <BarChart3 className="w-4.5 h-4.5 text-green-600" />
                          Biểu Đồ Doanh Thu Lũy Kế {filterYear === 'All' ? 'Theo Năm' : `Các Tháng Trong Năm ${filterYear}`}
                        </h4>
                        <p className="font-sans text-[11px] text-brand-gray mt-0.5">
                          Trực quan hóa doanh thu Online (<span className="text-brand-red font-semibold">Màu đỏ</span>) và doanh thu Khách lẻ Social (<span className="text-green-600 font-semibold">Màu xanh</span>).
                        </p>
                      </div>

                      {/* Visual Chart Canvas (custom SVG for pixel perfect look & responsiveness) */}
                      <div className="pt-4 pb-2">
                        <div className="relative h-64 w-full flex items-end justify-between gap-1 sm:gap-2 border-b border-brand-border/50 pb-2">
                          
                          {/* Chart Grid Lines */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-4">
                            {[0, 1, 2, 3, 4].reverse().map((i) => (
                              <div key={i} className="w-full border-t border-brand-light-gray/60 flex justify-between text-[8px] text-brand-gray font-mono pt-0.5">
                                <span>{Math.round((maxChartVal * i) / 4).toLocaleString('vi-VN')}đ</span>
                              </div>
                            ))}
                          </div>

                          {/* Chart Bars */}
                          <div className="relative z-10 w-full h-full flex items-end justify-around">
                            {chartData.map((data, idx) => {
                              const onlinePercent = (data.online / maxChartVal) * 100;
                              const socialPercent = (data.social / maxChartVal) * 100;
                              const totalPercent = (data.total / maxChartVal) * 100;

                              return (
                                <div key={idx} className="flex flex-col items-center flex-grow group max-w-[40px] sm:max-w-[50px] relative">
                                  
                                  {/* Custom Hover Tooltip */}
                                  <div className="absolute bottom-full mb-2 bg-brand-dark text-white rounded-lg p-2.5 shadow-xl text-[10px] w-36 pointer-events-none hidden group-hover:block z-30 transition-all text-left">
                                    <div className="font-bold border-b border-white/10 pb-1 mb-1">{data.label}</div>
                                    <div className="flex justify-between text-brand-red font-semibold">
                                      <span>Online:</span>
                                      <span>{data.online.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="flex justify-between text-green-400 font-semibold">
                                      <span>Social:</span>
                                      <span>{data.social.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1 mt-1">
                                      <span>Tổng cộng:</span>
                                      <span>{data.total.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                  </div>

                                  {/* Stacked Bar Container */}
                                  <div className="w-5 sm:w-7 h-48 bg-brand-light-gray rounded-t-lg overflow-hidden flex flex-col justify-end relative shadow-inner">
                                    {/* Social Bar (Green) at top */}
                                    <div 
                                      style={{ height: `${socialPercent}%` }} 
                                      className="bg-green-600 hover:bg-green-700 w-full transition-all duration-500 rounded-t-md" 
                                    />
                                    {/* Online Bar (Red) */}
                                    <div 
                                      style={{ height: `${onlinePercent}%` }} 
                                      className="bg-brand-red hover:bg-brand-red-hover w-full transition-all duration-500" 
                                    />
                                  </div>

                                  {/* Label text */}
                                  <span className="text-[10px] font-black text-brand-dark mt-2 font-display">{data.label}</span>
                                  {data.total > 0 && (
                                    <span className="text-[8px] font-mono font-bold text-brand-gray mt-0.5">
                                      {(data.total / 1000).toFixed(0)}k
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-6 justify-center text-[11px] font-semibold text-brand-gray">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 bg-brand-red rounded" />
                          <span>Doanh thu đặt trực tuyến (Online)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 bg-green-600 rounded" />
                          <span>Doanh thu khách lẻ (Social)</span>
                        </div>
                      </div>
                    </div>

                    {/* Editor Form for Adding/Editing Social Guest Play */}
                    {editingSocialId !== null && (
                      <div className="bg-brand-light-gray p-6 rounded-3xl border border-brand-border/40 space-y-4 animate-slideDown">
                        <h4 className="font-display font-black text-sm text-brand-dark flex items-center gap-2">
                          <PlusCircle className="w-5 h-5 text-green-600" />
                          {editingSocialId === 'new' ? 'Ghi Nhận Giao Dịch Khách Lẻ Mới' : 'Chỉnh Sửa Giao Dịch Khách Lẻ'}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          
                          <div>
                            <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Cụm Sân Chơi</label>
                            <select 
                              value={socialForm.courtId || ''}
                              onChange={(e) => setSocialForm({...socialForm, courtId: e.target.value})}
                              className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            >
                              {courts.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Ngày Chôi</label>
                            <input 
                              type="date"
                              value={socialForm.date || ''}
                              onChange={(e) => setSocialForm({...socialForm, date: e.target.value})}
                              className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Doanh Thu Thu Được (VND)</label>
                            <input 
                              type="number"
                              step={50000}
                              value={socialForm.amount || 0}
                              onChange={(e) => setSocialForm({...socialForm, amount: parseInt(e.target.value) || 0})}
                              className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-bold outline-none"
                              placeholder="300000"
                            />
                          </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          
                          <div className="sm:col-span-1">
                            <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Số Lượng Người Chơi</label>
                            <input 
                              type="number"
                              min={1}
                              value={socialForm.playersCount || 4}
                              onChange={(e) => setSocialForm({...socialForm, playersCount: parseInt(e.target.value) || 4})}
                              className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Ghi chú (Tên nhóm, giờ chơi,...)</label>
                            <input 
                              type="text"
                              value={socialForm.notes || ''}
                              onChange={(e) => setSocialForm({...socialForm, notes: e.target.value})}
                              className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                              placeholder="e.g. Nhóm anh Nam đánh social tối 18-20h sân 1"
                            />
                          </div>

                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-brand-border/40">
                          <button 
                            onClick={() => { setEditingSocialId(null); setSocialForm({}); }}
                            className="bg-white border border-brand-border/40 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button 
                            onClick={saveSocialForm}
                            className="bg-green-600 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Lưu Ghi Nhận
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Integrated Stream / Transaction logs */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-display font-bold text-sm text-brand-dark flex items-center gap-1.5">
                          <CalendarDays className="w-4.5 h-4.5 text-brand-red" />
                          Nhật Ký Giao Dịch Doanh Thu ({filteredTx.length} giao dịch)
                        </h4>
                      </div>

                      <div className="bg-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-xs border-collapse font-sans">
                          <thead>
                            <tr className="bg-brand-light-gray text-brand-gray font-bold border-b border-brand-border/40">
                              <th className="p-3">Ngày</th>
                              <th className="p-3">Loại Doanh Thu</th>
                              <th className="p-3">Sân Đấu</th>
                              <th className="p-3">Mô Tả Chi Tiết</th>
                              <th className="p-3 text-right">Số Tiền (VND)</th>
                              <th className="p-3 text-center">Tác Vụ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/40">
                            {filteredTx.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-brand-gray">Chưa ghi nhận khoản doanh thu nào khớp với bộ lọc.</td>
                              </tr>
                            ) : (
                              filteredTx.map((tx) => (
                                <tr key={tx.id} className="hover:bg-brand-light-gray/50">
                                  <td className="p-3 font-mono font-bold text-brand-dark">
                                    {tx.date.split('-').reverse().join('/')}
                                  </td>
                                  <td className="p-3">
                                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                      tx.type === 'online' 
                                        ? 'bg-brand-red-light text-brand-red' 
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {tx.type === 'online' ? 'Đặt Online' : 'Khách Social'}
                                    </span>
                                  </td>
                                  <td className="p-3 font-bold text-brand-dark">{tx.courtName}</td>
                                  <td className="p-3 text-brand-gray truncate max-w-[300px]" title={tx.detail}>{tx.detail}</td>
                                  <td className="p-3 font-black text-brand-dark text-right text-sm font-sans">
                                    {tx.amount.toLocaleString('vi-VN')}đ
                                  </td>
                                  <td className="p-3 text-center">
                                    {tx.type === 'social' ? (
                                      <div className="flex justify-center gap-1">
                                        <button 
                                          onClick={() => startEditSocial(tx as any)}
                                          className="text-brand-gray hover:text-green-600 p-1 rounded hover:bg-green-50 cursor-pointer"
                                          title="Sửa"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => deleteSocial(tx.id)}
                                          className="text-brand-gray hover:text-brand-red p-1 rounded hover:bg-brand-red-light cursor-pointer"
                                          title="Xóa"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-brand-gray italic">Hệ thống</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* 8. Alobo Sync & Google Sheets Automation Tab (Simplified for Direct API Fetch) */}
              {activeTab === 'alobo_sync' && (
                <div className="space-y-6 animate-fadeIn text-left">
                  {/* Title Block */}
                  <div>
                    <h3 className="font-display font-black text-xl text-brand-dark flex items-center gap-2">
                      <Database className="w-6 h-6 text-[#4285F4] bg-[#4285F4]/10 p-1 rounded-full" />
                      Trung Tâm Đồng Bộ Dữ Liệu Alobo API
                    </h3>
                    <p className="font-sans text-xs text-brand-gray mt-1">
                      Hệ thống kết nối trực tiếp với API Alobo để tự động lấy dữ liệu lịch đặt sân thời gian thực và đồng bộ lên hệ thống Pickle Bounce (và Google Sheets nếu cấu hình).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Primary Alobo API Settings & Operations */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Alobo API Direct Sync Card (Main Control) */}
                      <div className="bg-white border border-brand-border/40 p-6 rounded-2xl shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-brand-border/20 pb-4">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3 h-3 rounded-full ${isAutoSyncEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                            <h4 className="font-display font-bold text-base text-brand-dark">
                              1. Cấu Hình Đường Dẫn Alobo API
                            </h4>
                          </div>
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                            isAutoSyncEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {isAutoSyncEnabled ? 'Tự động chạy ngầm' : 'Tắt tự động'}
                          </span>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-1.5">
                              Đường dẫn API Alobo (Alobo API Endpoint)
                            </label>
                            <input 
                              type="text"
                              value={aloboApiUrl}
                              onChange={(e) => setAloboApiUrl(e.target.value)}
                              placeholder="https://shop-api-new.alobo.vn/api/v1/user-account/..."
                              className="w-full bg-brand-light-gray border border-brand-border/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-brand-dark outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                            />
                            <p className="text-[11px] text-brand-gray mt-1.5">
                              Dữ liệu lịch đặt sân sẽ được tự động lấy về trực tiếp từ API shop của bạn.
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-brand-border/20">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                id="isAutoSyncEnabled"
                                checked={isAutoSyncEnabled}
                                onChange={(e) => setIsAutoSyncEnabled(e.target.checked)}
                                className="w-4 h-4 text-brand-blue border-brand-border/80 rounded focus:ring-brand-blue"
                              />
                              <label htmlFor="isAutoSyncEnabled" className="font-bold text-xs text-brand-dark cursor-pointer">
                                Bật tự động kéo dữ liệu ngầm
                              </label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-brand-gray">Chu kỳ đồng bộ:</span>
                              <select 
                                value={aloboSyncIntervalMinutes}
                                onChange={(e) => setAloboSyncIntervalMinutes(Number(e.target.value))}
                                className="bg-brand-light-gray border border-brand-border/60 rounded-xl px-2.5 py-1.5 text-xs font-bold text-brand-dark outline-none"
                              >
                                <option value={2}>2 phút</option>
                                <option value={5}>5 phút</option>
                                <option value={10}>10 phút</option>
                                <option value={15}>15 phút</option>
                                <option value={30}>30 phút</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 pt-2">
                            <button 
                              onClick={saveConfig}
                              disabled={isSavingConfig}
                              className="bg-brand-dark hover:bg-brand-dark/90 text-white font-sans font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-sm disabled:opacity-50 transition-all"
                            >
                              {isSavingConfig ? 'Đang lưu...' : 'Lưu Cấu Hình'}
                            </button>

                            <button 
                              onClick={handleDirectBrowserSync}
                              disabled={isDirectSyncing}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2 transition-all"
                            >
                              <RefreshCw className={`w-4 h-4 ${isDirectSyncing ? 'animate-spin' : ''}`} />
                              {isDirectSyncing ? 'Đang lấy dữ liệu...' : 'Lấy Dữ Liệu Lịch Sân Ngay ⚡'}
                            </button>
                          </div>

                          {directSyncStatus && (
                            <div className="bg-emerald-50/80 p-3 border border-emerald-200 rounded-xl font-sans text-xs text-emerald-900 leading-relaxed animate-fadeIn">
                              <span className="font-bold">Trạng thái đồng bộ API:</span>
                              <p className="mt-0.5 whitespace-pre-line">{directSyncStatus}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Optional Google Sheets Destination Config */}
                      <div className="bg-white border border-brand-border/40 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-brand-border/20 pb-3">
                          <h4 className="font-display font-bold text-sm text-brand-dark flex items-center gap-2">
                            <span>2. Kết Nối Google Sheets (Tùy Chọn)</span>
                          </h4>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            googleSheetWebhookUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {googleSheetWebhookUrl ? 'Đã kết nối' : 'Chưa cấu hình'}
                          </span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-wider mb-1">
                              GOOGLE APPS SCRIPT WEBHOOK URL
                            </label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={googleSheetWebhookUrl}
                                onChange={(e) => setGoogleSheetWebhookUrl(e.target.value)}
                                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                                className="flex-grow bg-brand-light-gray border border-brand-border/60 rounded-xl px-3 py-2 text-xs font-semibold text-brand-dark outline-none"
                              />
                              <button 
                                onClick={saveConfig}
                                disabled={isSavingConfig}
                                className="bg-[#4285F4] hover:bg-[#357ae8] text-white font-sans font-bold text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex-shrink-0"
                              >
                                Lưu
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-brand-gray uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span>ĐƯỜNG DẪN BẢNG TÍNH GOOGLE SHEETS</span>
                              {googleSheetUrl && (
                                <a 
                                  href={googleSheetUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#0F9D58] hover:underline font-bold flex items-center gap-1"
                                >
                                  <span>Mở bảng tính ↗</span>
                                </a>
                              )}
                            </label>
                            <input 
                              type="text"
                              value={googleSheetUrl}
                              onChange={(e) => setGoogleSheetUrl(e.target.value)}
                              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                              className="w-full bg-brand-light-gray border border-brand-border/60 rounded-xl px-3 py-2 text-xs font-semibold text-brand-dark outline-none"
                            />
                          </div>

                          <div className="pt-2 flex items-center justify-between gap-3 text-xs">
                            <span className="text-[11px] text-brand-gray">Kiểm tra kết nối gửi hàng thử nghiệm lên Google Sheets</span>
                            <button 
                              onClick={handleTestConnection}
                              disabled={isTestingSheet || !googleSheetWebhookUrl}
                              className="bg-brand-dark hover:bg-brand-dark/95 text-white font-sans font-bold text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-40 transition-colors"
                            >
                              {isTestingSheet ? 'Đang gửi...' : 'Kiểm tra kết nối'}
                            </button>
                          </div>

                          {testResult && (
                            <div className={`p-3 rounded-xl text-xs font-semibold ${
                              testResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-brand-red border border-brand-red-light/30'
                            }`}>
                              {testResult.success ? (
                                '✓ Kết nối Google Sheets thành công!'
                              ) : (
                                `✗ Lỗi kết nối: ${testResult.error || 'Vui lòng kiểm tra lại URL Apps Script Web App.'}`
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Google Apps Script Code Copy Block */}
                      <div className="bg-white border border-brand-border/40 rounded-2xl overflow-hidden text-xs">
                        <div className="bg-brand-dark p-3 text-white text-xs font-bold flex justify-between items-center">
                          <span>Google Apps Script Template (Báo Cáo Pickle Bounce & Đặt Sân)</span>
                          <button 
                            onClick={() => {
                              const scriptCode = `function doPost(e) {
  try {
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);
    
    // Fallback thông minh nếu file script không được tạo trực tiếp từ Sheet (Độc lập)
    var ss = null;
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (err) {}
    
    if (!ss) {
      var sheetId = "${getSheetId()}";
      ss = SpreadsheetApp.openById(sheetId);
    }
    
    if (data.action === "addRegistration") {
      var regSheet = ss.getSheetByName("BÁO CÁO PICKLE BOUNCE") || 
                     ss.getSheetByName("Đăng Ký Gói Tập") || 
                     ss.getSheetByName("Thành Viên") ||
                     ss.getSheets()[0];
      
      var res = writeRowToSheet(regSheet, data, false);
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Mặc định hoặc action === "addBooking"
    var sheet = ss.getSheets()[0];
    var res = writeRowToSheet(sheet, data, true);
    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function writeRowToSheet(sheet, data, isBooking) {
  // 1. Tìm dòng chứa tiêu đề tự động bằng cách quét 5 dòng đầu
  var lastCol = sheet.getLastColumn() || 10;
  var headerRowIndex = -1;
  var headers = [];
  
  var topRows = sheet.getRange(1, 1, 5, lastCol).getValues();
  for (var r = 0; r < topRows.length; r++) {
    var rowText = topRows[r].join(" ").toLowerCase();
    if (rowText.indexOf("sân") > -1 || rowText.indexOf("họ tên") > -1 || rowText.indexOf("khách hàng") > -1 || rowText.indexOf("ngày") > -1 || rowText.indexOf("chuyển khoản") > -1 || rowText.indexOf("gói tập") > -1) {
      headerRowIndex = r + 1;
      headers = topRows[r];
      break;
    }
  }
  
  if (headerRowIndex === -1) {
    headerRowIndex = 1;
    headers = topRows[0];
  }
  
  var targetRowIndex = Math.max(sheet.getLastRow() + 1, headerRowIndex + 1);
  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || "").trim().toLowerCase();
    if (h) colMap[h] = c + 1;
  }
  
  // Tránh đè dữ liệu
  var checkCol = colMap["sân"] || colMap["sân đấu"] || colMap["họ tên"] || colMap["khách hàng"] || colMap["gói tập"] || 1;
  while (sheet.getRange(targetRowIndex, checkCol).getValue() !== "") {
    targetRowIndex++;
  }
  
  var rowValues = new Array(lastCol).fill("");
  function setVal(headerKeywords, val) {
    if (!val) return;
    for (var k = 0; k < headerKeywords.length; k++) {
      var kw = headerKeywords[k].toLowerCase();
      for (var hKey in colMap) {
        if (hKey.indexOf(kw) > -1) {
          rowValues[colMap[hKey] - 1] = val;
          return;
        }
      }
    }
  }
  
  if (isBooking) {
    setVal(["ngày đặt", "ngày"], formatDateVN(data.date));
    setVal(["sân đấu", "sân"], data.courtName);
    setVal(["khung giờ", "giờ"], data.timeSlot);
    setVal(["tên khách", "họ tên", "khách hàng"], data.fullName);
    setVal(["số điện thoại", "sđt", "điện thoại"], data.phone);
    setVal(["giá tiền", "tiền sân", "tổng tiền", "giá"], data.price);
    setVal(["trạng thái", "thanh toán"], data.paymentStatus || "Đã thanh toán");
  } else {
    // Đăng ký gói tập / Thành viên
    setVal(["ngày đăng ký", "ngày"], formatDateVN(data.registeredAt || data.date));
    setVal(["họ tên", "khách hàng", "tên"], data.fullName);
    setVal(["số điện thoại", "sđt", "điện thoại"], data.phone);
    setVal(["gói tập", "tên gói", "gói"], data.packageName);
    setVal(["số buổi", "buổi"], data.sessionsCount);
    setVal(["học phí", "giá tiền", "tiền", "thành tiền"], data.price);
    setVal(["mã ưu đãi", "ưu đãi", "mã"], data.discountCode);
    setVal(["ghi chú", "trạng thái"], data.notes || "Đã thanh toán");
  }
  
  // Mở rộng thêm nếu dòng có nhiều cột hơn
  if (rowValues.length < lastCol) {
    while (rowValues.length < lastCol) rowValues.push("");
  }
  
  sheet.getRange(targetRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  
  return {
    success: true,
    sheetName: sheet.getName(),
    rowInserted: targetRowIndex,
    dataWritten: data
  };
}

function formatDateVN(dateStr) {
  if (!dateStr) return "";
  if (dateStr.indexOf('/') > -1) {
    var parts = dateStr.split('/');
    if (parts.length === 3) return fillZero(parts[0]) + "/" + fillZero(parts[1]) + "/" + parts[2];
  }
  if (dateStr.indexOf('-') > -1) {
    var parts = dateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) return fillZero(parts[2]) + "/" + fillZero(parts[1]) + "/" + parts[0];
      return fillZero(parts[0]) + "/" + fillZero(parts[1]) + "/" + parts[2];
    }
  }
  return dateStr.toLowerCase();
}

function fillZero(num) {
  var n = parseInt(num);
  return n < 10 ? "0" + n : String(n);
}`;
                              navigator.clipboard.writeText(scriptCode);
                              alert("✓ Đã sao chép mã Google Apps Script cải tiến vào Bộ nhớ tạm (Clipboard)!");
                            }}
                            className="bg-[#4285F4] hover:bg-[#357ae8] text-white font-sans text-[11px] font-bold px-3 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép mã Apps Script ⚡</span>
                          </button>
                        </div>

                        <div className="p-4 space-y-3 font-sans text-left">
                          <p className="text-brand-gray text-[11px] leading-relaxed">
                            Mã Google Apps Script dưới đây được tối ưu tự động tìm đúng tên cột (<em>&quot;Ngày&quot;, &quot;Sân&quot;, &quot;Khung giờ&quot;, &quot;Họ tên&quot;, &quot;SĐT&quot;</em>) trên Google Sheets để điền thông tin khách hàng:
                          </p>
                          <div className="bg-brand-dark rounded-xl p-3 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-48 border border-brand-border/40 select-all">
                            <pre>{`function doPost(e) {
  try {
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.openById("${getSheetId()}");
    }
    var sheet = (data.action === "addRegistration") 
      ? (ss.getSheetByName("BÁO CÁO PICKLE BOUNCE") || ss.getSheets()[0]) 
      : ss.getSheets()[0];
    var res = writeRowToSheet(sheet, data, data.action !== "addRegistration");
    return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}`}</pre>
                          </div>
                        </div>
                      </div>

                      {/* Tampermonkey Script Copy Section */}
                      <div className="bg-white border border-brand-border/40 rounded-2xl overflow-hidden p-5 space-y-4 text-xs text-left">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="font-display font-bold text-sm text-brand-dark">
                              3. Tự Động Trích Xuất Dữ Liệu Lịch Đặt Alobo
                            </h4>
                            <p className="font-sans text-[11px] text-brand-gray mt-0.5">
                              Tiện ích tự động ghi nhận lịch đặt sân khi bạn xem chi tiết trên web Alobo.
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              const appOrigin = window.location.origin;
                              const scraperScript = `// ==UserScript==
// @name         Alobo Live Sync to Pickle Bounce
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Intercept and auto-sync bookings from Alobo to Google Sheets & Portal in Real-Time
// @match        *://*.alobo.vn/*
// @match        *://datlich.alobo.vn/*
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function() {
    'use strict';
    const TARGET_PORTAL = "${appOrigin}";
    console.log('[Alobo Sync] Userscript active:', TARGET_PORTAL);
})();`;
                              navigator.clipboard.writeText(scraperScript);
                              alert("✓ Đã sao chép mã Userscript Tampermonkey vào Clipboard!");
                            }}
                            className="bg-[#0F9D58] hover:bg-[#0b8043] text-white font-sans text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 flex-shrink-0 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao Chép Mã Tampermonkey ⚡</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Sync Logs & Activity History */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Sync Log Stream Table */}
                      <div className="bg-white border border-brand-border/40 p-6 rounded-2xl shadow-sm space-y-4 text-xs text-left">
                        <div className="flex justify-between items-center border-b border-brand-border/20 pb-3">
                          <h4 className="font-display font-bold text-sm text-brand-dark">
                            Lịch Sử Đồng Bộ Dữ Liệu
                          </h4>
                          <button 
                            onClick={clearSyncLogs}
                            className="font-sans font-bold text-[11px] text-brand-red hover:underline cursor-pointer"
                          >
                            Xóa lịch sử
                          </button>
                        </div>

                        <div className="border border-brand-border/40 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse font-sans">
                            <thead>
                              <tr className="bg-brand-light-gray text-brand-gray font-bold border-b border-brand-border/40">
                                <th className="p-3">Thời gian</th>
                                <th className="p-3">Khách hàng</th>
                                <th className="p-3">Sân & Khung giờ</th>
                                <th className="p-3 text-center">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/40">
                              {syncLogs.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-8 text-center text-brand-gray">
                                    Chưa có nhật ký đồng bộ nào. Hãy bấm &quot;Lấy Dữ Liệu Lịch Sân Ngay&quot; để cập nhật.
                                  </td>
                                </tr>
                              ) : (
                                syncLogs.map((log) => (
                                  <tr key={log.id} className="hover:bg-brand-light-gray/50">
                                    <td className="p-3 font-mono text-[10px] text-brand-dark">{log.syncedAt}</td>
                                    <td className="p-3">
                                      <div className="font-bold text-brand-dark">{log.fullName}</div>
                                      <div className="text-[10px] text-brand-gray">{log.phone}</div>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-semibold text-brand-dark">{log.courtName}</span>
                                      <span className="block text-[11px] text-brand-blue font-bold">{log.timeSlot}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                      <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                        log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-brand-red'
                                      }`}>
                                        {log.status === 'success' ? '✓ Thành công' : '✗ Thất bại'}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* 9. Customer Lookup VIP Hub Tab */}
              {activeTab === 'customer_lookup' && (() => {
                // Extract all unique customers across bookings, memberRegistrations, and syncLogs
                const customersMap: { [key: string]: {
                  id: string;
                  fullName: string;
                  phone: string;
                  bookings: Array<{
                    date: string;
                    timeSlot: string;
                    courtName: string;
                    price: number;
                    priceStr?: string;
                    source: 'Website' | 'Alobo Sync' | 'Đăng ký gói';
                    status: string;
                  }>;
                  packages: MemberRegistration[];
                  totalSpent: number;
                } } = {};

                // Process memberRegistrations (Gói tập)
                memberRegistrations.forEach((m, idx) => {
                  const rawPhone = m.phone || '';
                  const key = (rawPhone || m.fullName || `member-${idx}`).trim().toLowerCase();
                  if (!key) return;
                  if (!customersMap[key]) {
                    customersMap[key] = {
                      id: m.id || `c-mem-${idx}`,
                      fullName: m.fullName,
                      phone: rawPhone,
                      bookings: [],
                      packages: [],
                      totalSpent: 0
                    };
                  }
                  customersMap[key].packages.push(m);
                  customersMap[key].totalSpent += m.actualPaid || 0;
                });

                // Process website bookings
                bookings.forEach((b, idx) => {
                  if (b.status !== 'confirmed') return;
                  const rawPhone = b.phone || '';
                  const key = (rawPhone || b.fullName || `booking-${idx}`).trim().toLowerCase();
                  if (!key) return;
                  if (!customersMap[key]) {
                    customersMap[key] = {
                      id: b.id || `c-bk-${idx}`,
                      fullName: b.fullName,
                      phone: rawPhone,
                      bookings: [],
                      packages: [],
                      totalSpent: 0
                    };
                  }
                  customersMap[key].bookings.push({
                    date: b.date,
                    timeSlot: b.timeSlot,
                    courtName: b.courtName,
                    price: b.totalPrice || 150000,
                    source: 'Website',
                    status: b.status
                  });
                  customersMap[key].totalSpent += b.totalPrice || 0;
                });

                // Process Alobo sync logs
                syncLogs.forEach((l, idx) => {
                  const rawPhone = l.phone || '';
                  const key = (rawPhone || l.fullName || `log-${idx}`).trim().toLowerCase();
                  if (!key) return;
                  if (l.fullName === 'Khách Alobo' && l.phone === 'Alobo App') return; // Ignore pure anonymous syncs
                  if (!customersMap[key]) {
                    customersMap[key] = {
                      id: l.id || `c-log-${idx}`,
                      fullName: l.fullName,
                      phone: rawPhone,
                      bookings: [],
                      packages: [],
                      totalSpent: 0
                    };
                  }
                  
                  let numericPrice = 0;
                  if (l.price) {
                    const cleaned = l.price.replace(/[^0-9]/g, '');
                    numericPrice = parseInt(cleaned) || 0;
                  }
                  
                  customersMap[key].bookings.push({
                    date: l.date,
                    timeSlot: l.timeSlot,
                    courtName: l.courtName,
                    price: numericPrice,
                    priceStr: l.price,
                    source: 'Alobo Sync',
                    status: l.status === 'success' ? 'confirmed' : 'pending'
                  });
                  customersMap[key].totalSpent += numericPrice;
                });

                const allCustomersList = Object.values(customersMap);

                // Filter matching search keywords
                const filteredCustomers = allCustomersList.filter(c => {
                  const keyword = customerSearchKeyword.trim().toLowerCase();
                  if (!keyword) return true;
                  return c.fullName.toLowerCase().includes(keyword) || c.phone.includes(keyword);
                });

                // Find currently selected customer
                let selectedCustomer = filteredCustomers.find(c => c.id === selectedCustomerId);
                if (!selectedCustomer && filteredCustomers.length > 0) {
                  selectedCustomer = filteredCustomers[0];
                }

                return (
                  <div className="space-y-6 animate-fadeIn text-left">
                    <div>
                      <h3 className="font-display font-black text-xl text-brand-dark flex items-center gap-2">
                        <Users className="w-6 h-6 text-brand-red bg-brand-red-light/10 p-1 rounded-full" />
                        Hồ Sơ &amp; Tra Cứu Khách Hàng (VIP)
                      </h3>
                      <p className="font-sans text-xs text-brand-gray mt-1">
                        Tìm kiếm khách hàng, kiểm tra tần suất sử dụng sân đấu, lịch sử đặt sân từ Alobo/Website và tra cứu gói tập (combo) của hội viên.
                      </p>
                    </div>

                    {/* Search & Statistics Bar */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-brand-light-gray/60 p-4 rounded-2xl border border-brand-border/40">
                      <div className="lg:col-span-5 relative">
                        <Search className="w-4 h-4 text-brand-gray absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                          type="text"
                          value={customerSearchKeyword}
                          onChange={(e) => {
                            setCustomerSearchKeyword(e.target.value);
                            setSelectedCustomerId(null); // Reset selection on search
                          }}
                          placeholder="Tìm nhanh theo Tên hoặc Số điện thoại..."
                          className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-brand-dark outline-none transition-all"
                        />
                      </div>
                      <div className="lg:col-span-7 flex flex-wrap gap-4 text-[11px] font-bold text-brand-dark uppercase tracking-wider justify-end">
                        <span className="bg-white px-3 py-1.5 rounded-xl border border-brand-border/30 shadow-sm">
                          Tổng số khách ghi nhận: <strong className="text-brand-red text-xs">{allCustomersList.length}</strong>
                        </span>
                        <span className="bg-white px-3 py-1.5 rounded-xl border border-brand-border/30 shadow-sm">
                          Hội viên mua gói: <strong className="text-brand-blue text-xs">{allCustomersList.filter(c => c.packages.length > 0).length}</strong>
                        </span>
                        <span className="bg-white px-3 py-1.5 rounded-xl border border-brand-border/30 shadow-sm">
                          Khách hàng thân thiết: <strong className="text-green-600 text-xs">{allCustomersList.filter(c => c.bookings.length >= 2).length}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Main UI Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Column: Customers List */}
                      <div className="lg:col-span-4 bg-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[60vh]">
                        <div className="bg-brand-light-gray px-4 py-3 font-display font-bold text-xs text-brand-gray border-b border-brand-border/40 flex justify-between">
                          <span>Danh sách tìm thấy ({filteredCustomers.length})</span>
                          <span>Chi tiêu</span>
                        </div>

                        <div className="overflow-y-auto divide-y divide-brand-border/20 flex-grow max-h-[50vh] dark-scroll">
                          {filteredCustomers.length === 0 ? (
                            <div className="p-8 text-center text-xs text-brand-gray">
                              Không tìm thấy khách hàng nào khớp với từ khoá.
                            </div>
                          ) : (
                            filteredCustomers.map((c) => {
                              const hasActivePackage = c.packages.length > 0;
                              const isLoyal = c.bookings.length >= 2;
                              
                              let badgeColor = "bg-gray-100 text-gray-600";
                              let badgeText = "Khách mới";
                              if (hasActivePackage) {
                                badgeColor = "bg-brand-blue/10 text-brand-blue border border-brand-blue/20";
                                badgeText = "💎 GÓI TẬP";
                              } else if (isLoyal) {
                                badgeColor = "bg-green-100 text-green-700 border border-green-200";
                                badgeText = "🔥 THÂN THIẾT";
                              }

                              const isSelected = selectedCustomer?.id === c.id;

                              return (
                                <button
                                  key={c.id}
                                  onClick={() => setSelectedCustomerId(c.id)}
                                  className={`w-full text-left p-3 flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected ? 'bg-brand-red-light/30 border-l-4 border-brand-red' : 'hover:bg-brand-light-gray/40'
                                  }`}
                                >
                                  <div className="space-y-1.5 pr-2 truncate">
                                    <div className="font-bold text-xs text-brand-dark truncate">{c.fullName || "Ẩn danh"}</div>
                                    <div className="font-mono text-[10px] text-brand-gray font-bold">{c.phone || "Không có SĐT"}</div>
                                    <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${badgeColor}`}>
                                      {badgeText}
                                    </span>
                                  </div>
                                  <div className="text-right font-mono font-black text-xs text-brand-dark whitespace-nowrap">
                                    {c.totalSpent.toLocaleString('vi-VN')}đ
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Right Column: Customer Detailed Profile */}
                      <div className="lg:col-span-8 space-y-6">
                        {selectedCustomer ? (
                          <div className="space-y-6 animate-fadeIn">
                            
                            {/* Profile Header Box */}
                            <div className="bg-gradient-to-br from-brand-dark to-brand-dark/95 text-white p-6 rounded-2xl relative overflow-hidden shadow-md">
                              <div className="absolute right-0 bottom-0 text-white/5 font-display font-black text-8xl transform translate-x-8 translate-y-6 pointer-events-none">
                                VIP
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-display font-black text-lg tracking-tight">{selectedCustomer.fullName || "Ẩn danh"}</h4>
                                    
                                    {selectedCustomer.packages.length > 0 ? (
                                      <span className="bg-brand-blue text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                        💎 HỘI VIÊN GÓI VIP ACTIVE
                                      </span>
                                    ) : selectedCustomer.bookings.length >= 2 ? (
                                      <span className="bg-green-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                        🔥 KHÁCH HÀNG THÂN THIẾT (VIP)
                                      </span>
                                    ) : (
                                      <span className="bg-white/10 text-white/80 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                        🆕 KHÁCH HÀNG MỚI
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-white/70 font-mono flex items-center gap-3">
                                    <span>SĐT: <strong className="text-white font-bold">{selectedCustomer.phone || "N/A"}</strong></span>
                                    <span className="text-white/30">|</span>
                                    <span>Hạng: <strong className="text-green-400">Hạng Bạc</strong></span>
                                  </div>
                                </div>

                                <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
                                  <span className="block text-[10px] font-bold text-white/60 uppercase tracking-widest">Tổng chi tiêu</span>
                                  <span className="text-xl font-display font-black text-green-400">{selectedCustomer.totalSpent.toLocaleString('vi-VN')}đ</span>
                                </div>
                              </div>
                            </div>

                            {/* Statistical summaries box */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-3 bg-brand-light-gray rounded-xl border border-brand-border/40">
                                <span className="block text-[9px] font-bold text-brand-gray uppercase tracking-wider">Số lần dùng sân</span>
                                <strong className="text-lg font-display text-brand-dark">{selectedCustomer.bookings.length} lần</strong>
                              </div>
                              <div className="p-3 bg-brand-light-gray rounded-xl border border-brand-border/40">
                                <span className="block text-[9px] font-bold text-brand-gray uppercase tracking-wider">Hợp đồng mua gói</span>
                                <strong className="text-lg font-display text-brand-dark">{selectedCustomer.packages.length} HĐ</strong>
                              </div>
                              <div className="p-3 bg-brand-light-gray rounded-xl border border-brand-border/40">
                                <span className="block text-[9px] font-bold text-brand-gray uppercase tracking-wider">Tỷ lệ hoàn thành</span>
                                <strong className="text-lg font-display text-green-600">100%</strong>
                              </div>
                            </div>

                            {/* Section: ACTIVE PACKAGES AND COMBOS (if any) */}
                            {selectedCustomer.packages.length > 0 && (
                              <div className="space-y-3 bg-brand-blue/5 border border-brand-blue/20 p-5 rounded-2xl">
                                <h5 className="font-display font-black text-xs text-brand-blue uppercase tracking-widest flex items-center gap-1.5">
                                  <Award className="w-4 h-4" />
                                  HỢP ĐỒNG GÓI TẬP VÀ ĐÀO TẠO ĐANG CHẠY ({selectedCustomer.packages.length})
                                </h5>
                                <div className="space-y-4">
                                  {selectedCustomer.packages.map((pkg, pidx) => (
                                    <div key={pkg.id || pidx} className="bg-white p-4 rounded-xl border border-brand-blue/10 space-y-3 shadow-sm text-xs text-left">
                                      <div className="flex justify-between items-start border-b border-brand-blue/5 pb-2">
                                        <div>
                                          <div className="font-bold text-brand-dark text-xs">{pkg.packageType}</div>
                                          <div className="text-[10px] text-brand-gray mt-0.5">Mã HĐ: <strong className="font-mono text-brand-blue">{pkg.id}</strong> | Ký ngày: <strong className="font-mono">{pkg.contractDate}</strong></div>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                          pkg.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {pkg.status === 'confirmed' ? 'Đang hoạt động' : 'Chờ xác nhận'}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
                                        <div><span className="text-brand-gray">Lịch tập ưu tiên:</span> <strong className="text-brand-dark">{pkg.preferredTime}</strong></div>
                                        <div><span className="text-brand-gray">Huấn luyện viên:</span> <strong className="text-brand-blue">{pkg.coachName}</strong></div>
                                        <div><span className="text-brand-gray">Thời hạn:</span> <strong className="text-brand-dark">{pkg.durationMonths} tháng ({pkg.hoursCount})</strong></div>
                                        <div><span className="text-brand-gray">Dịch vụ chính:</span> <strong className="text-brand-dark">{pkg.serviceType}</strong></div>
                                      </div>

                                      <div className="border-t border-brand-blue/5 pt-2 flex justify-between items-center bg-brand-blue/5 -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl text-[11px]">
                                        <div><span className="text-brand-gray">Tổng giá trị:</span> <strong className="text-brand-dark font-sans font-bold">{pkg.totalPrice.toLocaleString('vi-VN')}đ</strong></div>
                                        <div><span className="text-brand-gray">Đã đóng:</span> <strong className="text-green-600 font-sans font-bold">{pkg.actualPaid.toLocaleString('vi-VN')}đ</strong></div>
                                        <div><span className="text-brand-gray">Còn nợ:</span> <strong className="text-red-500 font-sans font-bold">{pkg.remainingAmount.toLocaleString('vi-VN')}đ</strong></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Section: COURT BOOKING HISTORY */}
                            <div className="space-y-3">
                              <h5 className="font-display font-black text-xs text-brand-dark uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-brand-red" />
                                LỊCH SỬ SỬ DỤNG SÂN ĐẤU &amp; ĐẶT LỊCH ({selectedCustomer.bookings.length} lượt)
                              </h5>

                              <div className="bg-white border border-brand-border/40 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-xs border-collapse font-sans">
                                  <thead>
                                    <tr className="bg-brand-light-gray text-brand-gray font-bold border-b border-brand-border/40">
                                      <th className="p-3">Ngày dùng sân</th>
                                      <th className="p-3">Khung giờ</th>
                                      <th className="p-3">Sân đấu</th>
                                      <th className="p-3 text-right">Tiền sân</th>
                                      <th className="p-3 text-center">Nguồn dữ liệu</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-brand-border/20 text-[11px]">
                                    {selectedCustomer.bookings.length === 0 ? (
                                      <tr>
                                        <td colSpan={5} className="p-6 text-center text-brand-gray">
                                          Chưa có dữ liệu đặt sân lẻ cho khách hàng này. Khách hàng có thể đang mua gói tập hội viên dài hạn ở trên.
                                        </td>
                                      </tr>
                                    ) : (
                                      selectedCustomer.bookings.map((bk, idx) => (
                                        <tr key={idx} className="hover:bg-brand-light-gray/20">
                                          <td className="p-3 font-mono font-bold text-brand-dark">
                                            {bk.date.includes('-') ? bk.date.split('-').reverse().join('/') : bk.date}
                                          </td>
                                          <td className="p-3 text-brand-red font-bold">{bk.timeSlot}</td>
                                          <td className="p-3 font-semibold text-brand-dark">{bk.courtName}</td>
                                          <td className="p-3 font-bold text-brand-dark text-right">
                                            {bk.price > 0 ? `${bk.price.toLocaleString('vi-VN')}đ` : (bk.priceStr || 'N/A')}
                                          </td>
                                          <td className="p-3 text-center">
                                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                              bk.source === 'Website' ? 'bg-brand-red-light text-brand-red' : 'bg-blue-100 text-[#4285F4]'
                                            }`}>
                                              {bk.source}
                                            </span>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="bg-brand-light-gray p-12 rounded-2xl border border-dashed border-brand-border/60 text-center text-xs text-brand-gray space-y-2">
                            <Users className="w-12 h-12 text-brand-gray/30 mx-auto" />
                            <p className="font-bold">Chưa chọn khách hàng</p>
                            <p>Vui lòng nhấp chọn một khách hàng ở cột bên trái để xem đầy đủ thông tin chi tiết và lịch sử sử dụng sân.</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Landing Page Content Tab */}
              {activeTab === 'landing_page' && (
                <div className="space-y-6 text-xs">
                  <div className="flex justify-between items-center border-b border-brand-border/40 pb-4">
                    <div>
                      <h3 className="font-display font-black text-xl text-brand-dark">Cấu Hình Nội Dung Landing Page</h3>
                      <p className="font-sans text-xs text-brand-gray mt-1">Điều chỉnh trực tiếp nội dung phần Hero (Đầu trang) và Vision (Tầm nhìn cộng đồng) hiển thị ngoài trang chủ.</p>
                    </div>
                    <button
                      onClick={async () => {
                        setIsSavingLanding(true);
                        try {
                          const res = await fetch('/api/landing-page', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(landingForm)
                          });
                          const data = await res.json();
                          if (data.success) {
                            alert('Cập nhật thông tin Landing Page thành công!');
                            if (onSaveLandingPageConfig) {
                              onSaveLandingPageConfig(landingForm);
                            }
                          } else {
                            alert('Lỗi: ' + (data.error || 'Không thể lưu.'));
                          }
                        } catch (err: any) {
                          alert('Lỗi kết nối máy chủ: ' + err.message);
                        } finally {
                          setIsSavingLanding(false);
                        }
                      }}
                      disabled={isSavingLanding}
                      className="bg-brand-red hover:bg-brand-red-hover disabled:bg-brand-red/50 text-white font-sans font-bold text-xs px-6 py-3 rounded-full shadow-lg shadow-brand-red/10 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      {isSavingLanding ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Lưu Cấu Hình
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs text-left">
                    {/* Hero Section Config Card */}
                    <div className="space-y-4 bg-brand-light-gray/40 border border-brand-border/40 p-5 rounded-2xl">
                      <h4 className="font-display font-black text-sm text-brand-red uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-brand-border/40">
                        <Sparkles className="w-4 h-4" />
                        Phần Hero (Đầu trang)
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Tag tiêu đề phụ (Hero Tag)</label>
                          <input 
                            type="text"
                            value={landingForm.heroTag}
                            onChange={e => setLandingForm({ ...landingForm, heroTag: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all"
                            placeholder="SPORT PICKLE BOUNCE"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Tiêu đề chính (Hero Title)</label>
                          <input 
                            type="text"
                            value={landingForm.heroTitle}
                            onChange={e => setLandingForm({ ...landingForm, heroTitle: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all"
                            placeholder="Khám phá tính năng"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Mô tả ngắn (Hero Subtitle)</label>
                          <textarea 
                            value={landingForm.heroSubtitle}
                            onChange={e => setLandingForm({ ...landingForm, heroSubtitle: e.target.value })}
                            rows={3}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all resize-none"
                            placeholder="Mô tả chính xuất hiện dưới tiêu đề"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Ảnh nền Hero (Hero Image URL)</label>
                          <input 
                            type="text"
                            value={landingForm.heroImage}
                            onChange={e => setLandingForm({ ...landingForm, heroImage: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all"
                            placeholder="https://..."
                          />
                          <p className="text-[10px] text-brand-gray mt-1">Dán link ảnh Unsplash hoặc bất kỳ URL ảnh công khai nào.</p>
                        </div>
                      </div>
                    </div>

                    {/* Vision & Info Config Card */}
                    <div className="space-y-4 bg-brand-light-gray/40 border border-brand-border/40 p-5 rounded-2xl">
                      <h4 className="font-display font-black text-sm text-brand-red uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-brand-border/40">
                        <Users className="w-4 h-4" />
                        Phần Vision (Tầm nhìn &amp; Cộng đồng)
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Tag Vision (Vision Tag)</label>
                          <input 
                            type="text"
                            value={landingForm.visionTag}
                            onChange={e => setLandingForm({ ...landingForm, visionTag: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all"
                            placeholder="Tầm nhìn cộng đồng"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Tiêu đề Vision (Dùng \n để ngắt dòng)</label>
                          <textarea 
                            value={landingForm.visionTitle}
                            onChange={e => setLandingForm({ ...landingForm, visionTitle: e.target.value })}
                            rows={2}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all resize-none"
                            placeholder="Chơi cùng nhau. \nTiến bộ cùng nhau."
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Đoạn văn mô tả 1 (Vision Paragraph 1)</label>
                          <textarea 
                            value={landingForm.visionParagraph1}
                            onChange={e => setLandingForm({ ...landingForm, visionParagraph1: e.target.value })}
                            rows={3}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all resize-none"
                            placeholder="Đoạn văn giới thiệu thứ nhất"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Đoạn văn mô tả 2 (Vision Paragraph 2)</label>
                          <textarea 
                            value={landingForm.visionParagraph2}
                            onChange={e => setLandingForm({ ...landingForm, visionParagraph2: e.target.value })}
                            rows={3}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all resize-none"
                            placeholder="Đoạn văn giới thiệu thứ hai"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Ảnh Vision (Vision Image URL)</label>
                          <input 
                            type="text"
                            value={landingForm.visionImage}
                            onChange={e => setLandingForm({ ...landingForm, visionImage: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Micro stats and badge info row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs text-left pt-2">
                    {/* Micro Stats Card */}
                    <div className="space-y-4 bg-brand-light-gray/40 border border-brand-border/40 p-5 rounded-2xl">
                      <h4 className="font-display font-black text-sm text-brand-red uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-brand-border/40">
                        <BarChart3 className="w-4 h-4" />
                        Số Liệu Thống Kê Nổi Bật (Micro Stats)
                      </h4>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Số liệu 1</label>
                          <input 
                            type="text"
                            value={landingForm.stat1Value}
                            onChange={e => setLandingForm({ ...landingForm, stat1Value: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-2.5 py-2 text-center font-bold text-brand-red outline-none transition-all"
                            placeholder="12k+"
                          />
                          <input 
                            type="text"
                            value={landingForm.stat1Label}
                            onChange={e => setLandingForm({ ...landingForm, stat1Label: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-2 py-1 mt-1 text-center font-semibold text-brand-gray outline-none transition-all text-[10px]"
                            placeholder="Hội viên"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Số liệu 2</label>
                          <input 
                            type="text"
                            value={landingForm.stat2Value}
                            onChange={e => setLandingForm({ ...landingForm, stat2Value: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-2.5 py-2 text-center font-bold text-brand-red outline-none transition-all"
                            placeholder="50+"
                          />
                          <input 
                            type="text"
                            value={landingForm.stat2Label}
                            onChange={e => setLandingForm({ ...landingForm, stat2Label: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-2 py-1 mt-1 text-center font-semibold text-brand-gray outline-none transition-all text-[10px]"
                            placeholder="Sân đối tác"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Số liệu 3</label>
                          <input 
                            type="text"
                            value={landingForm.stat3Value}
                            onChange={e => setLandingForm({ ...landingForm, stat3Value: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-2.5 py-2 text-center font-bold text-brand-red outline-none transition-all"
                            placeholder="180+"
                          />
                          <input 
                            type="text"
                            value={landingForm.stat3Label}
                            onChange={e => setLandingForm({ ...landingForm, stat3Label: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-2 py-1 mt-1 text-center font-semibold text-brand-gray outline-none transition-all text-[10px]"
                            placeholder="Giải đấu"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Badge Card */}
                    <div className="space-y-4 bg-brand-light-gray/40 border border-brand-border/40 p-5 rounded-2xl">
                      <h4 className="font-display font-black text-sm text-brand-red uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-brand-border/40">
                        <Award className="w-4 h-4" />
                        Nhãn Nổi Bật Trên Ảnh (Image Overlay Badge)
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Tiêu đề nhãn (Badge Title)</label>
                          <input 
                            type="text"
                            value={landingForm.visionBadgeTitle}
                            onChange={e => setLandingForm({ ...landingForm, visionBadgeTitle: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all"
                            placeholder="Chinh phục đỉnh cao mới"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-brand-dark mb-1">Nội dung phụ (Badge Text)</label>
                          <input 
                            type="text"
                            value={landingForm.visionBadgeText}
                            onChange={e => setLandingForm({ ...landingForm, visionBadgeText: e.target.value })}
                            className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all"
                            placeholder="Sẵn sàng cùng đồng đội nâng hạng tuần này."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bảng Giá Sân Editor Row (Full-Width / Modern Card Layout) */}
                  <div className="bg-brand-light-gray/40 border border-brand-border/40 p-5 rounded-2xl space-y-6 text-left">
                    <h4 className="font-display font-black text-sm text-brand-red uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-brand-border/40">
                      <DollarSign className="w-4 h-4" />
                      Cấu Hình Bảng Giá Sân (Chỉnh Sửa Trực Tiếp)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-brand-dark mb-1">Tiêu đề chính của bảng giá</label>
                        <input 
                          type="text"
                          value={landingForm.priceTitle || ''}
                          onChange={e => setLandingForm({ ...landingForm, priceTitle: e.target.value })}
                          className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all"
                          placeholder="BẢNG GIÁ SÂN"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-brand-dark mb-1">Tiêu đề phần 1</label>
                        <input 
                          type="text"
                          value={landingForm.priceSection1Title || ''}
                          onChange={e => setLandingForm({ ...landingForm, priceSection1Title: e.target.value })}
                          className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all"
                          placeholder="Khách Vãng Lai"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-brand-dark mb-1">Tiêu đề phần 2 (Ưu đãi)</label>
                        <input 
                          type="text"
                          value={landingForm.priceSection2Title || ''}
                          onChange={e => setLandingForm({ ...landingForm, priceSection2Title: e.target.value })}
                          className="w-full bg-white border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-3.5 py-2.5 font-semibold text-brand-dark outline-none transition-all"
                          placeholder="Ưu đãi tháng 10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-brand-border/30">
                      {/* Section 1 Price Rows Editor */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold text-brand-dark text-xs uppercase tracking-wider text-[#0f5132]">
                            Danh sách giá: {landingForm.priceSection1Title || "Khách Vãng Lai"}
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              const current = landingForm.priceRows1 || [];
                              setLandingForm({
                                ...landingForm,
                                priceRows1: [...current, { day: "T2 - T6", time: "16h - 22h", price: "250.000 đ" }]
                              });
                            }}
                            className="bg-[#0f5132] hover:bg-[#146c43] text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle className="w-3 h-3" />
                            Thêm Dòng
                          </button>
                        </div>

                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                          {(landingForm.priceRows1 || []).map((row, index) => (
                            <div key={index} className="flex items-center gap-2 bg-white p-2.5 border border-brand-border/60 rounded-xl">
                              <div className="grid grid-cols-3 gap-2 flex-grow">
                                <input 
                                  type="text"
                                  value={row.day}
                                  onChange={e => {
                                    const rows = [...(landingForm.priceRows1 || [])];
                                    rows[index].day = e.target.value;
                                    setLandingForm({ ...landingForm, priceRows1: rows });
                                  }}
                                  className="bg-brand-light-gray/40 border border-brand-border/60 rounded-lg px-2 py-1.5 font-semibold text-[11px] text-brand-dark outline-none focus:border-brand-red"
                                  placeholder="Thứ"
                                />
                                <input 
                                  type="text"
                                  value={row.time}
                                  onChange={e => {
                                    const rows = [...(landingForm.priceRows1 || [])];
                                    rows[index].time = e.target.value;
                                    setLandingForm({ ...landingForm, priceRows1: rows });
                                  }}
                                  className="bg-brand-light-gray/40 border border-brand-border/60 rounded-lg px-2 py-1.5 font-semibold text-[11px] text-brand-dark outline-none focus:border-brand-red"
                                  placeholder="Khung giờ"
                                />
                                <input 
                                  type="text"
                                  value={row.price}
                                  onChange={e => {
                                    const rows = [...(landingForm.priceRows1 || [])];
                                    rows[index].price = e.target.value;
                                    setLandingForm({ ...landingForm, priceRows1: rows });
                                  }}
                                  className="bg-brand-light-gray/40 border border-brand-border/60 rounded-lg px-2 py-1.5 font-semibold text-[11px] text-brand-dark outline-none focus:border-brand-red"
                                  placeholder="Giá"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const rows = (landingForm.priceRows1 || []).filter((_, i) => i !== index);
                                  setLandingForm({ ...landingForm, priceRows1: rows });
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {(landingForm.priceRows1 || []).length === 0 && (
                            <p className="text-center text-brand-gray/60 py-4 font-semibold italic">Chưa có dòng giá nào.</p>
                          )}
                        </div>
                      </div>

                      {/* Section 2 Price Rows Editor */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold text-brand-dark text-xs uppercase tracking-wider text-[#0f5132]">
                            Danh sách giá: {landingForm.priceSection2Title || "Ưu đãi tháng 10"}
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              const current = landingForm.priceRows2 || [];
                              setLandingForm({
                                ...landingForm,
                                priceRows2: [...current, { title: "Khách vãng lai", time: "Mặc định", price: "250.000 đ" }]
                              });
                            }}
                            className="bg-[#0f5132] hover:bg-[#146c43] text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle className="w-3 h-3" />
                            Thêm Dòng
                          </button>
                        </div>

                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                          {(landingForm.priceRows2 || []).map((row, index) => (
                            <div key={index} className="flex items-center gap-2 bg-white p-2.5 border border-brand-border/60 rounded-xl">
                              <div className="grid grid-cols-3 gap-2 flex-grow">
                                <input 
                                  type="text"
                                  value={row.title}
                                  onChange={e => {
                                    const rows = [...(landingForm.priceRows2 || [])];
                                    rows[index].title = e.target.value;
                                    setLandingForm({ ...landingForm, priceRows2: rows });
                                  }}
                                  className="bg-brand-light-gray/40 border border-brand-border/60 rounded-lg px-2 py-1.5 font-semibold text-[11px] text-brand-dark outline-none focus:border-brand-red"
                                  placeholder="Nhóm khách"
                                />
                                <input 
                                  type="text"
                                  value={row.time}
                                  onChange={e => {
                                    const rows = [...(landingForm.priceRows2 || [])];
                                    rows[index].time = e.target.value;
                                    setLandingForm({ ...landingForm, priceRows2: rows });
                                  }}
                                  className="bg-brand-light-gray/40 border border-brand-border/60 rounded-lg px-2 py-1.5 font-semibold text-[11px] text-brand-dark outline-none focus:border-brand-red"
                                  placeholder="Khung giờ"
                                />
                                <input 
                                  type="text"
                                  value={row.price}
                                  onChange={e => {
                                    const rows = [...(landingForm.priceRows2 || [])];
                                    rows[index].price = e.target.value;
                                    setLandingForm({ ...landingForm, priceRows2: rows });
                                  }}
                                  className="bg-brand-light-gray/40 border border-brand-border/60 rounded-lg px-2 py-1.5 font-semibold text-[11px] text-brand-dark outline-none focus:border-brand-red"
                                  placeholder="Giá"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const rows = (landingForm.priceRows2 || []).filter((_, i) => i !== index);
                                  setLandingForm({ ...landingForm, priceRows2: rows });
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {(landingForm.priceRows2 || []).length === 0 && (
                            <p className="text-center text-brand-gray/60 py-4 font-semibold italic">Chưa có dòng giá nào.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* AI Member Importer Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] w-full max-w-2xl shadow-2xl border border-brand-border/40 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="bg-brand-dark p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-yellow animate-pulse" />
                  <div className="text-left">
                    <h3 className="font-display font-black text-sm text-white">Nhập Danh Sách Hội Viên Bằng AI (Thông Minh)</h3>
                    <p className="text-[10px] text-white/60 mt-0.5">Trích xuất tự động từ Excel, bảng Copy-Paste hoặc dữ liệu văn bản thô</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsImportModalOpen(false)}
                  className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 flex-grow text-xs text-brand-dark text-left">
                {/* Visual Drag and Drop file selection area */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDropOrSelect}
                  className="border-2 border-dashed border-brand-border/80 hover:border-brand-yellow rounded-2xl p-6 text-center bg-brand-light-gray/20 transition-all group cursor-pointer relative"
                >
                  <input 
                    type="file" 
                    id="memberFileImport" 
                    accept=".txt,.csv,.json"
                    onChange={handleFileDropOrSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <FileText className="w-8 h-8 text-brand-gray group-hover:text-brand-yellow transition-colors" />
                    <span className="font-bold text-brand-dark">Kéo thả file danh sách (.txt, .csv) vào đây hoặc bấm để chọn file</span>
                    <span className="text-[10px] text-brand-gray">Hỗ trợ đọc dữ liệu tự động</span>
                  </div>
                </div>

                <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-3 flex gap-2 items-start text-[11px] text-brand-dark">
                  <span className="text-base leading-none">💡</span>
                  <div className="leading-relaxed">
                    <strong>Mẹo siêu nhanh từ Excel:</strong> Bạn không cần tải hay chuyển đổi file! Chỉ cần <strong>Mở file Excel của bạn, copy các dòng thông tin (Ctrl+C)</strong> rồi <strong>Dán trực tiếp (Ctrl+V)</strong> vào khung văn bản lớn bên dưới. Trợ lý AI Gemini sẽ tự bóc tách chính xác từng cột!
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-brand-dark uppercase tracking-wider text-[10px]">Nội dung danh sách thô dán từ Excel / Copy-paste:</label>
                  <textarea
                    value={importRawText}
                    onChange={(e) => setImportRawText(e.target.value)}
                    placeholder="Ví dụ dán:&#10;1. Nguyễn Văn A - 0901234567 - Combo 10 buổi - Cọc 1.000.000đ - Tập thứ 2,4,6&#10;2. Trần Thị B | ĐT 0911222333 | Gói 20 buổi | HLV Lisa | Đã đóng đủ 9tr"
                    className="w-full h-44 bg-brand-light-gray/40 border border-brand-border/60 rounded-xl p-3 font-mono text-[11px] outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all resize-none"
                  />
                </div>

                {importError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl font-medium leading-relaxed">
                    ⚠️ {importError}
                  </div>
                )}

                {importSuccessMsg && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl font-medium flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                    <span>{importSuccessMsg}</span>
                  </div>
                )}
              </div>

              <div className="bg-brand-light-gray/50 px-5 py-4 border-t border-brand-border/40 flex justify-between items-center">
                <span className="text-[10px] text-brand-gray font-medium">Hỗ trợ bởi Gemini 3.5 AI Engine</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setImportRawText('');
                      setImportError('');
                      setImportSuccessMsg('');
                    }}
                    className="px-4 py-2 border border-brand-border/60 hover:bg-brand-light-gray rounded-xl font-bold transition-all text-[11px] cursor-pointer"
                  >
                    Xoá Trắng
                  </button>
                  <button
                    onClick={handleAIImport}
                    disabled={isImporting}
                    className="flex items-center gap-1.5 bg-brand-yellow hover:bg-brand-yellow/90 disabled:opacity-50 text-brand-dark font-extrabold px-5 py-2 rounded-xl text-[11px] shadow-sm transition-all cursor-pointer"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Đang phân tích &amp; Nhập...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Phân Tích &amp; Nhập Tự Động
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
