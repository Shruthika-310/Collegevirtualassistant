
import React from 'react';
import { AppSection } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  user?: { name: string; avatar?: string; role: string };
}

const Layout: React.FC<LayoutProps> = ({ children, activeSection, onNavigate, user }) => {
  const isFaculty = user?.role === 'faculty';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-slate-900 text-white flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-900/20">
            <span className="font-black text-xl">G</span>
          </div>
          <div className="hidden md:block">
            <span className="font-bold text-lg block leading-none">GRIET</span>
            <span className="text-[10px] text-slate-400 tracking-widest uppercase">Smart Campus</span>
          </div>
        </div>

        <nav className="flex-1 mt-4 overflow-y-auto no-scrollbar">
          <NavItem 
            icon="fa-th-large" 
            label="Dashboard" 
            active={activeSection === AppSection.DASHBOARD} 
            onClick={() => onNavigate(AppSection.DASHBOARD)} 
          />
          <NavItem 
            icon="fa-robot" 
            label="AI Assistant" 
            active={activeSection === AppSection.ASSISTANT} 
            onClick={() => onNavigate(AppSection.ASSISTANT)} 
          />
          <NavItem 
            icon={isFaculty ? "fa-chalkboard-teacher" : "fa-calendar-day"} 
            label={isFaculty ? "My Classes" : "Schedule"} 
            active={activeSection === AppSection.SCHEDULE} 
            onClick={() => onNavigate(AppSection.SCHEDULE)} 
          />
          
          {!isFaculty && (
            <NavItem 
              icon="fa-file-invoice-dollar" 
              label="Exams" 
              active={activeSection === AppSection.EXAMS} 
              onClick={() => onNavigate(AppSection.EXAMS)} 
            />
          )}

          {isFaculty && (
            <NavItem 
              icon="fa-laptop-code" 
              label="Research" 
              active={activeSection === AppSection.FACULTY_RESOURCES} 
              onClick={() => onNavigate(AppSection.FACULTY_RESOURCES)} 
            />
          )}

          <NavItem 
            icon="fa-book-open" 
            label="Syllabus" 
            active={activeSection === AppSection.SYLLABUS} 
            onClick={() => onNavigate(AppSection.SYLLABUS)} 
          />
          <NavItem 
            icon="fa-star" 
            label="Events" 
            active={activeSection === AppSection.EVENTS} 
            onClick={() => onNavigate(AppSection.EVENTS)} 
          />
          <NavItem 
            icon="fa-user-check" 
            label={isFaculty ? "Student Portal" : "Attendance"} 
            active={activeSection === AppSection.ATTENDANCE} 
            onClick={() => onNavigate(AppSection.ATTENDANCE)} 
          />
          <NavItem 
            icon="fa-id-card" 
            label="My Profile" 
            active={activeSection === AppSection.PROFILE} 
            onClick={() => onNavigate(AppSection.PROFILE)} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="group relative">
            <button 
              onClick={() => onNavigate(AppSection.PROFILE)}
              className={`flex items-center gap-3 w-full p-2 hover:bg-slate-800 rounded-lg transition-colors ${activeSection === AppSection.PROFILE ? 'bg-slate-800' : ''}`}
            >
              <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full border-2 border-orange-500 bg-white object-cover" />
              <div className="hidden md:block text-left overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
              </div>
            </button>
            <button 
              onClick={() => onNavigate(AppSection.LOGIN)}
              className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:block opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 z-10">
          <h1 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">
            {activeSection.replace(/_/g, ' ')}
          </h1>
          <div className="flex items-center gap-6">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1 ${isFaculty ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-green-50 text-green-700 border-green-100'} rounded-full text-xs font-bold border`}>
               <span className={`w-2 h-2 ${isFaculty ? 'bg-indigo-500' : 'bg-green-500'} rounded-full animate-pulse`}></span>
               {isFaculty ? 'Faculty Control Active' : 'Student Portal Active'}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
      active ? 'bg-orange-600 text-white border-r-4 border-orange-400 shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`}
  >
    <i className={`fas ${icon} text-lg`}></i>
    <span className="hidden md:block font-medium text-sm">{label}</span>
  </button>
);

export default Layout;
