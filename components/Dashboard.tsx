
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_ATTENDANCE, MOCK_ANNOUNCEMENTS, MOCK_SCHEDULE, MOCK_FACULTY_SCHEDULE } from '../constants';

interface DashboardProps {
  userRole?: string;
  onNavigateFee?: () => void;
  onNavigateSchedule?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, onNavigateFee, onNavigateSchedule }) => {
  const isFaculty = userRole === 'faculty';
  const scheduleData = isFaculty ? MOCK_FACULTY_SCHEDULE : MOCK_SCHEDULE;

  const getNextClass = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    return scheduleData.find(item => {
      const [h, m] = item.time.split(':').map(Number);
      return (h * 60 + m) > currentTimeVal;
    }) || scheduleData[0];
  };

  const nextClass = getNextClass();

  const chartData = MOCK_ATTENDANCE.map(a => ({
    name: a.subject.substring(0, 6),
    percentage: a.percentage
  }));

  const COLORS = ['#ea580c', '#334155', '#475569', '#64748b'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Pending Fee Alert for Students */}
      {!isFaculty && (
        <div className="lg:col-span-3">
          <button 
            onClick={onNavigateFee}
            className="w-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 text-left group hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center text-white text-2xl shadow-xl shadow-red-200 group-hover:rotate-12 transition-transform"><i className="fas fa-file-invoice-dollar"></i></div>
            <div className="flex-1">
               <h4 className="font-black text-red-900 text-lg leading-tight">Exam Fee Due: Nov 30</h4>
               <p className="text-red-700 text-xs mt-1 font-bold opacity-70 uppercase tracking-wider">III-I Regular Semester Exam Fee (R22)</p>
            </div>
            <div className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] shadow-lg group-hover:bg-red-600 transition-colors">PAY SECURELY</div>
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={onNavigateSchedule}
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white text-xl shadow-lg shadow-orange-100"><i className="fas fa-clock"></i></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Class</p>
            <h3 className="text-lg font-black text-slate-800 line-clamp-1">{nextClass?.subject}</h3>
            <p className="text-[10px] text-orange-600 font-bold">{nextClass?.time} • {nextClass?.room}</p>
          </div>
        </div>

        {isFaculty ? (
          <>
            <StatCard title="Research Score" value="9.2" icon="fa-microscope" color="slate" />
            <StatCard title="Students Guided" value="12" icon="fa-user-graduate" color="orange" />
            <StatCard title="Leave Balance" value="14 Days" icon="fa-calendar-check" color="slate" />
          </>
        ) : (
          <>
            <StatCard title="Current GPA" value="8.42" icon="fa-award" color="orange" />
            <StatCard title="Attendance" value="84%" icon="fa-user-check" color="slate" />
            <StatCard title="Backlogs" value="0" icon="fa-graduation-cap" color="slate" />
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-8">
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-black text-slate-900">{isFaculty ? "Faculty Performance Analytics" : "My Attendance Statistics"}</h2>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 30 Days</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis unit="%" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]} barSize={44}>
                  {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-900">Campus Alerts</h2>
            <button className="text-xs font-bold text-orange-600 hover:underline uppercase tracking-widest">View All</button>
          </div>
          <div className="space-y-4">
            {MOCK_ANNOUNCEMENTS.filter(a => isFaculty ? true : a.category !== 'faculty').map(ann => (
              <div key={ann.id} className="flex gap-6 p-6 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 ${ann.category === 'academic' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                  <i className={`fas ${ann.category === 'academic' ? 'fa-book-open' : ann.category === 'faculty' ? 'fa-id-card' : 'fa-bolt'}`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-black text-slate-800 text-sm tracking-tight">{ann.title}</h3>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest whitespace-nowrap ml-4">{new Date(ann.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{ann.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sidebar Details */}
      <div className="space-y-8">
        <section className={`p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden ${isFaculty ? 'bg-indigo-900' : 'bg-slate-900'} text-white`}>
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-3">{isFaculty ? "GRIET Research" : "Pragnya 2024"}</h2>
            <p className="text-slate-400 text-xs mb-8 font-bold leading-relaxed opacity-80 uppercase tracking-widest">{isFaculty ? "Next Faculty Development Program: AI Ethics" : "Official Technical Fest Registration is Live"}</p>
            <button className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/40 transform active:scale-95 uppercase">Explore Events</button>
          </div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 pb-4 border-b border-slate-50">Profile Velocity</h2>
          <div className="space-y-8">
             <div>
                <div className="flex justify-between items-end mb-3">
                   <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{isFaculty ? "Syllabus Status" : "Academic Success"}</span>
                   <span className="text-xs font-black text-orange-600">{isFaculty ? "72%" : "84%"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                   <div className="bg-orange-600 h-full rounded-full transition-all duration-1000" style={{ width: isFaculty ? '72%' : '84%' }}></div>
                </div>
             </div>
             <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic text-center">"Education is the most powerful weapon which you can use to change the world."</p>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'}`}><i className={`fas ${icon}`}></i></div>
    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p><h3 className="text-lg font-black text-slate-800">{value}</h3></div>
  </div>
);

export default Dashboard;
