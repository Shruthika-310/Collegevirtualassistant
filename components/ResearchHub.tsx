
import React, { useState, useEffect } from 'react';
import { MOCK_PUBLICATIONS, MOCK_PROJECTS } from '../constants';
import { ResearchPublication, ResearchProject } from '../types';

const ResearchHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'publications' | 'projects' | 'collaborations'>('publications');
  const [modal, setModal] = useState<'add' | 'proposal' | null>(null);
  const [projects, setProjects] = useState<ResearchProject[]>(MOCK_PROJECTS);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleModalClose = () => setModal(null);

  const simulateProgressSync = () => {
    setIsSyncing(true);
    // Simulate a network delay for the "sync"
    setTimeout(() => {
      setProjects(prev => prev.map(p => {
        if (p.status === 'Ongoing' && p.progress < 100) {
          // Increment by a random amount between 5 and 15
          const increment = Math.floor(Math.random() * 11) + 5;
          const newProgress = Math.min(100, p.progress + increment);
          return { ...p, progress: newProgress };
        }
        return p;
      }));
      setIsSyncing(false);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="H-Index 2026" value="18" icon="fa-chart-line" color="indigo" />
        <StatCard title="Citations" value="1,240" icon="fa-quote-left" color="orange" />
        <StatCard title="Total Papers" value="38" icon="fa-file-alt" color="indigo" />
        <StatCard title="Grants (INR)" value="4.2M" icon="fa-hand-holding-usd" color="orange" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 p-2 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('publications')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-2xl ${activeTab === 'publications' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className="fas fa-journal-whills mr-2"></i> Publications
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-2xl ${activeTab === 'projects' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className="fas fa-project-diagram mr-2"></i> Projects
          </button>
          <button 
            onClick={() => setActiveTab('collaborations')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-2xl ${activeTab === 'collaborations' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className="fas fa-users mr-2"></i> Collaborations
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'publications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">Academic Publications</h3>
                <button 
                  onClick={() => setModal('add')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                >
                  Add Publication
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {MOCK_PUBLICATIONS.map((pub) => (
                  <div key={pub.id} className="p-6 border border-slate-50 rounded-3xl hover:bg-slate-50 transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${pub.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {pub.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{pub.year}</span>
                      </div>
                      <h4 className="font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{pub.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">{pub.journal}</p>
                    </div>
                    {pub.link && (
                      <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-2">
                        DOI Link <i className="fas fa-external-link-alt"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Research Projects & Grants</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Funding Lifecycle 2026</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={simulateProgressSync}
                    disabled={isSyncing}
                    className={`px-6 py-2 ${isSyncing ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'} rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2`}
                  >
                    <i className={`fas fa-sync-alt ${isSyncing ? 'animate-spin' : ''}`}></i>
                    {isSyncing ? 'Syncing...' : 'Sync Progress'}
                  </button>
                  <button 
                    onClick={() => setModal('proposal')}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                  >
                    Submit Proposal
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="p-8 border border-slate-100 rounded-[2.5rem] bg-slate-50/30 hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><i className="fas fa-microscope text-xl"></i></div>
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${project.status === 'Ongoing' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                          {project.status}
                       </span>
                    </div>
                    <h4 className="font-black text-slate-800 text-lg mb-2 leading-tight">{project.title}</h4>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                       <span>{project.agency}</span>
                       <span className="text-indigo-600">₹{(project.amount / 100000).toFixed(1)}L Funding</span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-end text-[10px] font-black uppercase">
                          <span className="text-slate-400">Completion</span>
                          <span className="text-indigo-600 transition-all duration-700">{project.progress}%</span>
                       </div>
                       <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                       </div>
                    </div>
                    {project.progress === 100 && (
                      <div className="mt-4 flex items-center gap-2 text-green-600 font-black text-[9px] uppercase tracking-widest animate-in fade-in zoom-in-95 duration-500">
                        <i className="fas fa-check-circle"></i> Milestone Completed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'collaborations' && (
            <div className="space-y-8 py-10 text-center flex flex-col items-center max-w-lg mx-auto">
               <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-xl shadow-indigo-100"><i className="fas fa-network-wired"></i></div>
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">External Collaboration Links</h3>
               <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">Connect your professional research profiles to sync your citations and latest works automatically with GRIET Research Gate.</p>
               <div className="grid grid-cols-2 gap-4 w-full">
                  <a href="#" className="flex items-center justify-center gap-3 p-5 border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all group">
                     <i className="fab fa-linkedin text-indigo-600 group-hover:text-white text-xl"></i>
                     <span className="text-[10px] font-black uppercase tracking-widest">LinkedIn</span>
                  </a>
                  <a href="#" className="flex items-center justify-center gap-3 p-5 border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all group">
                     <i className="fas fa-id-card text-orange-600 group-hover:text-white text-xl"></i>
                     <span className="text-[10px] font-black uppercase tracking-widest">ORCID iD</span>
                  </a>
                  <a href="#" className="flex items-center justify-center gap-3 p-5 border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all group">
                     <i className="fab fa-researchgate text-blue-600 group-hover:text-white text-xl"></i>
                     <span className="text-[10px] font-black uppercase tracking-widest">Res. Gate</span>
                  </a>
                  <a href="#" className="flex items-center justify-center gap-3 p-5 border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all group">
                     <i className="fab fa-google text-red-600 group-hover:text-white text-xl"></i>
                     <span className="text-[10px] font-black uppercase tracking-widest">Scholar</span>
                  </a>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300 p-6">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 border shadow-2xl relative animate-in zoom-in-95">
             <button onClick={handleModalClose} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-times text-2xl"></i></button>
             <div className="mb-8">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-indigo-100"><i className={`fas ${modal === 'add' ? 'fa-file-medical' : 'fa-paper-plane'}`}></i></div>
                <h3 className="text-2xl font-black text-slate-900">{modal === 'add' ? 'Add New Publication' : 'Research Grant Proposal'}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">GRIET Research Gate • 2026 Proto</p>
             </div>
             <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Form submitted successfully to the GRIET Research Portal!"); handleModalClose(); }}>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Document Title</label>
                   <input required type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Enter formal title..." />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Primary Journal / Agency</label>
                   <input required type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="IEEE, ACM, DST-SERB..." />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs tracking-widest shadow-xl shadow-indigo-200 hover:bg-slate-900 transition-all uppercase mt-4">Initialize Data Sync</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: string; color: 'indigo' | 'orange' }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center group">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform ${color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-slate-800">{value}</h3>
  </div>
);

export default ResearchHub;
