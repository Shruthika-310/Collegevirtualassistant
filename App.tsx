
import React, { useState, useEffect } from 'react';
import { AppSection, UserProfile, RegisteredUser, ExamFee, AttendanceRecord, Announcement } from './types';
import { MOCK_STUDENT_PROFILE, MOCK_FACULTY_PROFILE, GRIET_EXAM_FEES, GRIET_SYLLABUS, MOCK_ANNOUNCEMENTS, MOCK_SCHEDULE, MOCK_FACULTY_SCHEDULE, MOCK_EXAM_SCHEDULE, MOCK_INVIGILATION, MOCK_ATTENDANCE } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Assistant from './components/Assistant';
import Schedule from './components/Schedule';
import FaceScanner from './components/FaceScanner';
import ResearchHub from './components/ResearchHub';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.LOGIN);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  const [examTab, setExamTab] = useState<'schedule' | 'fees' | 'invigilation' | 'history'>('schedule');
  const [showPayment, setShowPayment] = useState<any | null>(null);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [syllabusSearch, setSyllabusSearch] = useState('');

  // Event Registration State
  const [registeringEvent, setRegisteringEvent] = useState<Announcement | null>(null);
  const [regStep, setRegStep] = useState<'details' | 'biometric' | 'pass'>('details');
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);

  const [signupForm, setSignupForm] = useState({ username: '', rollNumber: '', faceDataUrl: '', role: 'student' as 'student' | 'faculty' });

  useEffect(() => {
    const saved = localStorage.getItem('campus_buddy_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRegisteredUser(parsed);
      setActiveSection(AppSection.LOGIN);
    } else {
      setActiveSection(AppSection.SIGNUP);
    }
    
    const savedEvents = localStorage.getItem('griet_registered_events');
    if (savedEvents) {
      setRegisteredEventIds(JSON.parse(savedEvents));
    }
  }, []);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.faceDataUrl) {
      alert("Biometric enrollment required!");
      return;
    }
    const newUser: RegisteredUser = {
      username: signupForm.username,
      rollNumber: signupForm.rollNumber,
      faceDataUrl: signupForm.faceDataUrl,
      role: signupForm.role
    };
    localStorage.setItem('campus_buddy_user', JSON.stringify(newUser));
    setRegisteredUser(newUser);
    setActiveSection(AppSection.LOGIN);
  };

  const handleLoginSuccess = () => {
    if (registeredUser) {
      const mockBase = registeredUser.role === 'faculty' ? MOCK_FACULTY_PROFILE : MOCK_STUDENT_PROFILE;
      setUserProfile({
        ...mockBase,
        name: registeredUser.username,
        id: registeredUser.rollNumber,
        avatar: registeredUser.faceDataUrl,
        role: registeredUser.role
      });
      setIsLoggedIn(true);
      setActiveSection(AppSection.DASHBOARD);
      setExamTab(registeredUser.role === 'faculty' ? 'invigilation' : 'schedule');
    }
  };

  const handleStartPayment = (fee: ExamFee) => {
    setShowPayment(fee);
    setPaymentStep('details');
  };

  const processPayment = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
    }, 2500);
  };

  const handleEventRegister = (event: Announcement) => {
    setRegisteringEvent(event);
    setRegStep('details');
  };

  const finalizeEventRegistration = () => {
    if (registeringEvent) {
      const newIds = [...registeredEventIds, registeringEvent.id];
      setRegisteredEventIds(newIds);
      localStorage.setItem('griet_registered_events', JSON.stringify(newIds));
      setRegStep('pass');
    }
  };

  const filteredSyllabus = GRIET_SYLLABUS.filter(item => {
    const searchLower = syllabusSearch.toLowerCase();
    return (
      item.dept.toLowerCase().includes(searchLower) ||
      item.regulation.toLowerCase().includes(searchLower) ||
      item.subjects.some(sub => sub.toLowerCase().includes(searchLower))
    );
  });

  const renderContent = () => {
    if (!isLoggedIn) {
      if (activeSection === AppSection.SIGNUP) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center mb-6 text-white font-black text-2xl shadow-xl shadow-slate-200">G</div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portal Enrollment 2026</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Secure Academic Network</p>
              </div>
              <div className="mb-8">
                <FaceScanner 
                  mode="capture" 
                  onCapture={(dataUrl) => setSignupForm(prev => ({ ...prev, faceDataUrl: dataUrl }))} 
                />
              </div>
              <form onSubmit={handleSignupSubmit} className="space-y-6">
                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 shadow-inner">
                   <button 
                     type="button"
                     onClick={() => setSignupForm(p => ({ ...p, role: 'student' }))}
                     className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${signupForm.role === 'student' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
                   >
                     Student
                   </button>
                   <button 
                     type="button"
                     onClick={() => setSignupForm(p => ({ ...p, role: 'faculty' }))}
                     className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${signupForm.role === 'faculty' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
                   >
                     Faculty
                   </button>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Identity Name</label>
                  <input type="text" required value={signupForm.username} onChange={(e) => setSignupForm(prev => ({ ...prev, username: e.target.value }))} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-semibold" placeholder="Legal full name" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    {signupForm.role === 'faculty' ? 'Employee ID' : 'HT Number'}
                  </label>
                  <input type="text" required value={signupForm.rollNumber} onChange={(e) => setSignupForm(prev => ({ ...prev, rollNumber: e.target.value }))} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-semibold" placeholder={signupForm.role === 'faculty' ? 'FAC-XXX-000' : '21241A0XXX'} />
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-slate-800 transition-all mt-4 shadow-xl shadow-slate-200 uppercase">Initialize Profile</button>
              </form>
            </div>
          </div>
        );
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center">
            <div className="mb-10">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center mb-6 text-white font-black text-2xl shadow-xl shadow-slate-200">G</div>
              <h2 className="text-2xl font-black text-slate-900">GRIET Authentication</h2>
              <p className="text-slate-500 mt-2 text-sm font-medium">Identity: {registeredUser?.username}</p>
            </div>
            <FaceScanner mode="verify" storedFace={registeredUser?.faceDataUrl} onRecognized={handleLoginSuccess} />
            <div className="mt-10 pt-6 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Account Switch? <button onClick={() => { localStorage.removeItem('campus_buddy_user'); setRegisteredUser(null); setActiveSection(AppSection.SIGNUP); }} className="text-orange-600 ml-1 hover:underline">Reset System</button>
              </p>
            </div>
          </div>
        </div>
      );
    }

    const isFaculty = userProfile?.role === 'faculty';

    switch (activeSection) {
      case AppSection.DASHBOARD:
        return (
          <Dashboard 
            userRole={userProfile?.role} 
            onNavigateFee={() => setActiveSection(AppSection.EXAMS)} 
            onNavigateSchedule={() => setActiveSection(AppSection.SCHEDULE)}
          />
        );
      case AppSection.ASSISTANT:
        return <Assistant userRole={userProfile?.role as 'student' | 'faculty'} />;
      case AppSection.SCHEDULE:
        return <Schedule isFaculty={isFaculty} />;
      case AppSection.EXAMS:
        return (
          <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <h2 className="text-3xl font-black text-slate-900">Exam Branch 2026</h2>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">GRIET Hyderabad • Academic Affairs</p>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner w-full md:w-auto">
                {isFaculty ? (
                  <>
                    <button onClick={() => setExamTab('invigilation')} className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${examTab === 'invigilation' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500'}`}>Invigilation</button>
                    <button onClick={() => setExamTab('schedule')} className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${examTab === 'schedule' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500'}`}>Schedules</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setExamTab('schedule')} className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${examTab === 'schedule' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500'}`}>Schedules</button>
                    <button onClick={() => setExamTab('fees')} className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${examTab === 'fees' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500'}`}>Payments</button>
                    <button onClick={() => setExamTab('history')} className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${examTab === 'history' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500'}`}>History</button>
                  </>
                )}
              </div>
            </div>

            {examTab === 'schedule' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {MOCK_EXAM_SCHEDULE.map((exam, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 -mr-12 -mt-12 rounded-full group-hover:bg-orange-600/10 transition-colors"></div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-orange-100">{exam.type} Series</span>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                         <p className="text-sm font-black text-slate-800">{exam.date}</p>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight group-hover:text-orange-600 transition-colors">{exam.subject}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-500"><i className="fas fa-clock text-orange-500 w-5"></i><span>{exam.time}</span></div>
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-500"><i className="fas fa-map-pin text-orange-500 w-5"></i><span>Room {exam.room}</span></div>
                    </div>
                    <button 
                      onClick={() => alert(`Generating Digital Hall Ticket for ${exam.subject}... Check your GRIET Secure Mail.`)}
                      className="w-full mt-10 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
                    >
                      Digital Hall Ticket
                    </button>
                  </div>
                ))}
              </div>
            )}

            {examTab === 'fees' && !isFaculty && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-8 rounded-[2.5rem] flex items-center gap-8 shadow-xl shadow-orange-100">
                   <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white text-3xl shadow-lg"><i className="fas fa-exclamation-circle animate-pulse"></i></div>
                   <div className="flex-1 text-white">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Financial Deadline 2026</p>
                      <h4 className="text-2xl font-black">Fee Payment Required</h4>
                      <p className="text-sm font-bold opacity-70 mt-1">Check pending exam and tuition fees to avoid registration blocks.</p>
                   </div>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                  <h2 className="text-xl font-black text-slate-900 mb-8 border-b pb-6">GRIET Payment Ledger</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b"><th className="pb-5 px-2">Description</th><th className="pb-5 px-2">Amount</th><th className="pb-5 px-2">Due Date</th><th className="pb-5 px-2">Status</th><th className="pb-5 px-2 text-right">Gateway</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {GRIET_EXAM_FEES.filter(f => f.status === 'Pending').map((fee, idx) => (
                          <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-6 px-2 font-black text-slate-800 tracking-tight">{fee.semester}<br/><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{fee.description}</span></td>
                            <td className="py-6 px-2 font-black text-lg">₹{fee.amount.toLocaleString()}</td>
                            <td className={`py-6 px-2 text-xs font-black ${fee.status === 'Pending' ? 'text-red-600' : 'text-slate-400 uppercase'}`}>{fee.deadline}</td>
                            <td className="py-6 px-2"><span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] ${fee.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 shadow-sm'}`}>{fee.status}</span></td>
                            <td className="py-6 px-2 text-right">{fee.status === 'Pending' && <button onClick={() => handleStartPayment(fee)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-orange-600 transition-all transform hover:-translate-y-1">Authorize Pay</button>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {examTab === 'history' && !isFaculty && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Fee Settlement History</h3>
                   <div className="px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">Secure Audit Verified</div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {GRIET_EXAM_FEES.filter(f => f.status === 'Paid').map((fee: any, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest rounded-lg">Settled</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid on: {fee.paymentDate || 'N/A'}</span>
                          </div>
                          <h4 className="text-xl font-black text-slate-800 tracking-tight">{fee.semester}</h4>
                          <p className="text-xs font-medium text-slate-500 mt-1">{fee.description}</p>
                          <div className="mt-4 flex items-center gap-4">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref: <span className="text-slate-900">{fee.transactionId || 'GRIET-MOCK-TXN'}</span></span>
                          </div>
                       </div>
                       <div className="text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end gap-2">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settled Amount</p>
                             <p className="text-2xl font-black text-slate-900">₹{fee.amount.toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={() => alert(`Downloading Secure PDF Receipt for ${fee.semester}...`)}
                            className="mt-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2"
                          >
                             <i className="fas fa-file-download"></i> Receipt
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {examTab === 'invigilation' && isFaculty && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {MOCK_INVIGILATION.map((duty, idx) => (
                    <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${duty.isCoordinator ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`} title={duty.isCoordinator ? 'Principal Coordinator' : 'Staff Invigilator'}>
                             <i className={`fas ${duty.isCoordinator ? 'fa-crown' : 'fa-user-tie'} text-sm`}></i>
                          </div>
                       </div>
                       <div className="mb-10">
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-2 block">Duty Assignment</span>
                         <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{duty.subject}</h3>
                       </div>
                       <div className="grid grid-cols-1 gap-6">
                          <div className="flex items-center gap-5 text-sm font-bold text-slate-600"><div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner"><i className="fas fa-calendar-day"></i></div><span>{duty.date}</span></div>
                          <div className="flex items-center gap-5 text-sm font-bold text-slate-600"><div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner"><i className="fas fa-hourglass-half"></i></div><span>{duty.time}</span></div>
                          <div className="flex items-center gap-5 text-sm font-bold text-slate-600"><div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner"><i className="fas fa-door-closed"></i></div><span>Hall: {duty.room}</span></div>
                       </div>
                       <div className="mt-10 pt-8 border-t border-slate-50 flex gap-4">
                          <button 
                            onClick={() => alert(`Digital Attendance Proxy Initialized for Hall ${duty.room}`)}
                            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100"
                          >
                            Sign Attendance
                          </button>
                          <button 
                            onClick={() => alert(`Printing OMR Packet Labels for ${duty.subject}...`)}
                            className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <i className="fas fa-print"></i>
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
            )}
          </div>
        );
      case AppSection.PROFILE:
        return (
          <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 bg-slate-900 p-12 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 to-transparent"></div>
                <div className="relative group mb-8">
                  <div className="w-48 h-48 rounded-[3rem] border-4 border-orange-600 shadow-[0_0_30px_rgba(234,88,12,0.3)] overflow-hidden bg-slate-800 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                    {userProfile?.avatar ? (
                      <img src={userProfile.avatar} alt="Identity" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fas fa-user-circle text-8xl text-slate-700"></i>
                    )}
                  </div>
                  <div className="absolute -bottom-4 right-0 w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-lg text-white" title="Verified Biometric ID">
                    <i className="fas fa-shield-check text-xl"></i>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">{userProfile?.name}</h3>
                <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Verified Academic Identity</p>
                <div className="mt-10 pt-10 border-t border-white/5 w-full">
                  <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mb-4">Institutional Credential</p>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                    <p className="text-[10px] font-bold text-slate-400">ID TOKEN</p>
                    <p className="text-xs font-mono text-slate-300 truncate">GR26-S-{userProfile?.id}-ZTB</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-12 bg-white">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                  <h2 className="text-2xl font-black text-slate-900">Personal Information</h2>
                  <button onClick={() => alert("Identity records can only be updated via the GRIET Registrar Branch.")} className="p-3 bg-slate-50 text-slate-400 hover:text-orange-600 rounded-xl transition-all">
                    <i className="fas fa-pen-nib"></i>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <ProfileField label="Identity Number" value={userProfile?.id || 'N/A'} icon="fa-fingerprint" />
                  <ProfileField label="Academic Domain" value={userProfile?.major || 'General Engineering'} icon="fa-graduation-cap" />
                  <ProfileField label="Institutional Role" value={userProfile?.role || 'Guest'} icon="fa-user-tag" />
                  <ProfileField label="Regulation Block" value={isFaculty ? 'GR26-FACULTY' : 'GR22 (R22)'} icon="fa-gavel" />
                </div>
                <div className="bg-orange-50/50 p-8 rounded-3xl border border-orange-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-4 flex items-center gap-2">
                    <i className="fas fa-info-circle"></i> Biometric Note
                  </h4>
                  <p className="text-xs text-orange-900 font-medium leading-relaxed">
                    Your profile is currently protected by a Level-5 Zero Trust Biometric Handshake. Every access request is verified against your neural face enrollment captured on 2026.
                  </p>
                </div>
                <div className="mt-10 flex gap-4">
                  <button onClick={() => setActiveSection(AppSection.DASHBOARD)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200">Return to Portal</button>
                  <button onClick={() => { localStorage.removeItem('campus_buddy_user'); setRegisteredUser(null); setIsLoggedIn(false); setActiveSection(AppSection.SIGNUP); }} className="px-8 py-4 border-2 border-red-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all">De-enroll</button>
                </div>
              </div>
            </div>
          </div>
        );
      case AppSection.FACULTY_RESOURCES:
        return <ResearchHub />;
      case AppSection.SYLLABUS:
        return (
          <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-black text-slate-900">Academic Regulations</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">GRIET 2026 Focus Syllabus</p>
              </div>
              <div className="relative w-full md:w-96">
                <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  value={syllabusSearch}
                  onChange={(e) => setSyllabusSearch(e.target.value)}
                  placeholder="Search subjects, depts..." 
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl font-bold text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {filteredSyllabus.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSyllabus.map((item, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col group">
                    <div className="flex justify-between items-start mb-8">
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-widest rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">{item.regulation} Regulation</span>
                      <span className="text-xs font-black text-orange-600 uppercase tracking-widest">{item.dept}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight group-hover:text-orange-600 transition-colors">Year {item.year} | Sem {item.sem}</h3>
                    <div className="flex-1 space-y-4 mb-8">
                      {item.subjects.map((sub, sIdx) => (
                        <div key={sIdx} className={`flex items-center gap-4 text-sm font-bold ${sub.toLowerCase().includes(syllabusSearch.toLowerCase()) && syllabusSearch !== '' ? 'text-orange-600 scale-105 origin-left transition-transform' : 'text-slate-600'}`}>
                          <div className={`w-8 h-8 rounded-lg ${sub.toLowerCase().includes(syllabusSearch.toLowerCase()) && syllabusSearch !== '' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-600'} flex items-center justify-center text-xs flex-shrink-0 transition-colors`}><i className="fas fa-book"></i></div>
                          <span className="line-clamp-1">{sub}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => alert(`Securely Downloading R25 ${item.dept} PDF Brochure...`)}
                      className="w-full py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                    >
                      Detailed PDF
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-[3.5rem] border border-dashed border-slate-200">
                 <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl"><i className="fas fa-search"></i></div>
                 <h4 className="text-xl font-black text-slate-900">No matching subjects found</h4>
                 <p className="text-slate-500 text-sm font-medium mt-2">Try searching for keywords like "AI", "Quantum", or "CSE"</p>
                 <button onClick={() => setSyllabusSearch('')} className="mt-8 text-orange-600 font-black text-[10px] uppercase tracking-widest hover:underline">Clear Search Filter</button>
              </div>
            )}
          </div>
        );
      case AppSection.EVENTS:
        return (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Campus Highlights 2026</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Official GRIET Events & Fests</p>
              </div>
            </div>

            <div className="space-y-12">
              {/* Active Passes Section */}
              {registeredEventIds.length > 0 && (
                <section>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-green-600 mb-6 flex items-center gap-4">
                    <span className="w-8 h-px bg-green-600"></span> My Active Passes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_ANNOUNCEMENTS.filter(a => registeredEventIds.includes(a.id)).map(event => (
                      <div key={event.id} className="bg-slate-900 text-white p-8 rounded-[2.5rem] border-l-8 border-orange-600 flex justify-between items-center group shadow-xl">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-orange-500 mb-1">Confirmed Pass</p>
                          <h4 className="font-black text-lg">{event.title}</h4>
                          <p className="text-slate-400 text-[10px] font-bold mt-2"><i className="fas fa-calendar-check mr-2"></i>{event.date}</p>
                        </div>
                        <button 
                          onClick={() => { setRegisteringEvent(event); setRegStep('pass'); }}
                          className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                        >
                          <i className="fas fa-qrcode"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600 mb-6 flex items-center gap-4">
                  <span className="w-8 h-px bg-orange-600"></span> Upcoming 2026 Lineup
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {MOCK_ANNOUNCEMENTS.filter(a => a.category === 'event' && a.status === 'upcoming' && !registeredEventIds.includes(a.id)).map((event) => (
                    <div key={event.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 flex flex-col md:flex-row gap-8 items-center group hover:shadow-2xl transition-all">
                      <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-[2rem] flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform shadow-lg shadow-orange-100"><i className={`fas ${event.title.includes('Pragnya') ? 'fa-microchip' : 'fa-music'} text-4xl`}></i></div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{event.title}</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed">{event.content}</p>
                        <div className="mt-6 flex flex-wrap gap-6 justify-center md:justify-start">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i className="fas fa-calendar-alt text-orange-500"></i> {event.date}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i className="fas fa-map-marker-alt text-orange-500"></i> GRIET Arena</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleEventRegister(event)}
                        className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-slate-900 transition-all transform active:scale-95"
                      >
                        Register Now
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="opacity-60">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 flex items-center gap-4">
                  <span className="w-8 h-px bg-slate-300"></span> Event Archive 2025
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {MOCK_ANNOUNCEMENTS.filter(a => a.category === 'event' && a.status === 'past').map((event) => (
                    <div key={event.id} className="bg-slate-100 p-6 rounded-3xl border border-slate-200 flex items-center gap-6 grayscale hover:grayscale-0 transition-all">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400"><i className="fas fa-history"></i></div>
                       <div>
                          <h4 className="font-black text-slate-800 text-sm">{event.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{event.date}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        );
      case AppSection.ATTENDANCE:
        return (
          <div className="max-w-4xl mx-auto space-y-12 animate-in zoom-in-95 duration-700">
            <div className="bg-white rounded-[3.5rem] p-12 text-center border shadow-sm">
              <div className="w-28 h-28 bg-orange-50 text-orange-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-orange-100/50"><i className="fas fa-fingerprint text-5xl"></i></div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{isFaculty ? "Attendance Console 2026" : "Attendance Records"}</h2>
              <p className="text-slate-500 text-sm font-medium mb-12 max-w-md mx-auto">{isFaculty ? "Automated Biometric Stream Analysis for IV Year Sem-II." : "Official digitized attendance logs for 2026 academic term."}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_ATTENDANCE.map((record, i) => (
                  <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-left hover:shadow-xl transition-all group">
                     <div className="flex justify-between items-center mb-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all"><i className="fas fa-graduation-cap"></i></div>
                        <div className="text-right">
                           <p className="text-2xl font-black text-slate-900">{record.percentage}%</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                        </div>
                     </div>
                     <h4 className="font-black text-slate-800 tracking-tight text-lg mb-2">{record.subject}</h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">{record.attended} / {record.totalClasses} Sessions Attended</p>
                     <button 
                        onClick={() => setSelectedAttendance(record)}
                        className="w-full py-4 bg-white border-2 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                      >
                       Detailed Log
                     </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Detail Modal */}
            {selectedAttendance && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300 p-6">
                 <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 border shadow-2xl relative animate-in zoom-in-95">
                    <button onClick={() => setSelectedAttendance(null)} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-times text-2xl"></i></button>
                    <div className="mb-10 text-center">
                       <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedAttendance.subject}</h3>
                       <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Biometric Session Integrity: 99.8%</p>
                    </div>
                    <div className="space-y-4 mb-10">
                       {[1,2,3,4,5].map(day => (
                          <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm font-bold text-slate-700">Lecture {day} - May {10+day}, 2026</span>
                             </div>
                             <span className="text-[10px] font-black uppercase text-slate-400">Authenticated</span>
                          </div>
                       ))}
                    </div>
                    <button onClick={() => setSelectedAttendance(null)} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs tracking-widest shadow-xl hover:bg-orange-600 transition-all uppercase">Close Insights</button>
                 </div>
               </div>
            )}
          </div>
        );
      default:
        return (
          <Dashboard 
            userRole={userProfile?.role} 
            onNavigateFee={() => setActiveSection(AppSection.EXAMS)} 
            onNavigateSchedule={() => setActiveSection(AppSection.SCHEDULE)}
          />
        );
    }
  };

  if (!isLoggedIn) return renderContent();

  return (
    <Layout 
      activeSection={activeSection} 
      onNavigate={(s) => {
        if (s === AppSection.LOGIN) { setIsLoggedIn(false); setUserProfile(undefined); setActiveSection(AppSection.LOGIN); } else { setActiveSection(s); }
      }} 
      user={userProfile}
    >
      {renderContent()}

      {/* Event Registration Modal */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
             <div className="p-10 bg-slate-900 text-white relative">
                <button onClick={() => setRegisteringEvent(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><i className="fas fa-times text-2xl"></i></button>
                <div className="flex items-center gap-5 mb-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl shadow-orange-900/40"><i className="fas fa-ticket-alt"></i></div>
                  <span className="font-black text-[10px] tracking-[0.4em] uppercase opacity-50">Event Authorization 2026</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight">{registeringEvent.title}</h3>
                <p className="text-orange-500 text-xs font-bold mt-2 uppercase tracking-widest">{registeringEvent.date} • GRIET Arena</p>
             </div>

             <div className="p-10">
                {regStep === 'details' && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                       <p className="text-sm text-slate-600 font-medium leading-relaxed">{registeringEvent.content}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Type</p>
                          <p className="text-xs font-black text-slate-800">Student General</p>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Registration Fee</p>
                          <p className="text-xs font-black text-green-600 uppercase">Gratis (Included)</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setRegStep('biometric')}
                      className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black text-xs tracking-widest shadow-2xl shadow-orange-200 hover:bg-slate-900 transition-all uppercase"
                    >
                      Verify & Secure Pass
                    </button>
                  </div>
                )}

                {regStep === 'biometric' && (
                  <div className="animate-in zoom-in-95 duration-500 text-center">
                    <div className="mb-8">
                       <FaceScanner mode="verify" storedFace={registeredUser?.faceDataUrl} onRecognized={finalizeEventRegistration} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secure Biometric Handshake Required to Generate Token</p>
                  </div>
                )}

                {regStep === 'pass' && (
                  <div className="flex flex-col items-center justify-center animate-in zoom-in duration-700">
                     {/* Digital Pass Visual */}
                     <div className="w-full bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative mb-8 border border-white/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-black text-white text-xs">G</div>
                              <span className="font-black text-[10px] tracking-widest uppercase">Official Entry Pass</span>
                           </div>
                           <span className="bg-green-500/20 text-green-500 text-[8px] font-black px-2 py-1 rounded-full border border-green-500/20 uppercase">Valid 2026</span>
                        </div>
                        <div className="p-8">
                           <h4 className="text-2xl font-black text-white mb-2 leading-tight">{registeringEvent.title}</h4>
                           <div className="flex justify-between items-end mt-10">
                              <div>
                                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Pass Holder</p>
                                 <p className="text-sm font-black text-white">{userProfile?.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">HT: {userProfile?.id}</p>
                              </div>
                              <div className="bg-white p-2 rounded-xl">
                                 <div className="w-16 h-16 bg-slate-900 flex items-center justify-center">
                                    <i className="fas fa-qrcode text-white text-4xl"></i>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="px-8 py-4 bg-orange-600 flex justify-between items-center">
                           <span className="text-[8px] font-black uppercase tracking-widest text-white/70">Secure Digital Pass Token</span>
                           <span className="text-xs font-black text-white">#GRIET-2026-{registeringEvent.id.toUpperCase()}</span>
                        </div>
                     </div>
                     <p className="text-slate-500 text-xs font-medium px-4 text-center mb-10">Your pass is now active. Present the digital token at the GRIET Arena entry point for biometric validation.</p>
                     <button onClick={() => setRegisteringEvent(null)} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl uppercase">Return to Events</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-6 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
              <div className="p-10 bg-slate-950 text-white relative">
                 <button onClick={() => setShowPayment(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><i className="fas fa-times text-2xl"></i></button>
                 <div className="flex items-center gap-5 mb-4">
                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shadow-orange-900/40">G</div>
                    <span className="font-black text-[10px] tracking-[0.4em] uppercase opacity-50">Secure Checkout 2026</span>
                 </div>
                 <h3 className="text-2xl font-black tracking-tight">{showPayment.semester}</h3>
                 <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">{userProfile?.name} • HT {userProfile?.id}</p>
              </div>
              <div className="p-10">
                 {paymentStep === 'details' && (
                   <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 shadow-inner">
                         <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Liability</span>
                         <span className="text-3xl font-black text-slate-900">₹{showPayment.amount.toLocaleString()}</span>
                      </div>
                      <div className="space-y-6">
                         <div className="relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-6 bg-white px-2">Gateway Select</label>
                            <div className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/50">
                               <div className="flex items-center gap-4"><i className="fab fa-cc-mastercard text-orange-600 text-2xl"></i><span className="text-sm font-black text-slate-700">University NetBanking</span></div>
                               <i className="fas fa-chevron-down text-slate-300"></i>
                            </div>
                         </div>
                         <div className="space-y-3">
                            <input type="text" placeholder="GRIET UPI ID / CARD" className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-50 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-300" />
                            <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-[0.2em] leading-relaxed px-4">Transactions are protected by GRIET End-to-End Encryption protocol</p>
                         </div>
                      </div>
                      <button onClick={processPayment} className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black text-xs tracking-widest shadow-2xl shadow-orange-200 hover:bg-slate-900 hover:-translate-y-1 transition-all active:scale-95 uppercase">Finalize Transaction</button>
                   </div>
                 )}

                 {paymentStep === 'processing' && (
                   <div className="flex flex-col items-center justify-center py-16 animate-in zoom-in duration-500">
                      <div className="relative w-24 h-24 mb-10">
                         <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                         <div className="absolute inset-0 border-4 border-t-orange-600 rounded-full animate-spin"></div>
                         <div className="absolute inset-0 flex items-center justify-center text-orange-600"><i className="fas fa-shield-alt text-2xl"></i></div>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900">Verifying Digital ID</h4>
                      <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">GRIET Central Server Handshake...</p>
                   </div>
                 )}

                 {paymentStep === 'success' && (
                   <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-700">
                      <div className="w-28 h-28 bg-green-500 rounded-[2.5rem] flex items-center justify-center text-white text-5xl mb-10 shadow-2xl shadow-green-100 scale-110"><i className="fas fa-check-circle"></i></div>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Access Granted</h4>
                      <p className="text-slate-500 text-sm font-medium mt-4 px-8 leading-relaxed">Payment successfully processed. Digital receipt and hall ticket clearance have been pushed to your student dashboard.</p>
                      <button onClick={() => setShowPayment(null)} className="mt-12 w-full py-5 border-4 border-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-all transform active:scale-95 shadow-xl">Return to Exam Branch</button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </Layout>
  );
};

const ProfileField: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all">
    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default App;
