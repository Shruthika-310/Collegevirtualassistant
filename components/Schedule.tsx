
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_SCHEDULE, MOCK_FACULTY_SCHEDULE, TIMETABLE_IMAGE_URL } from '../constants';

interface ScheduleProps {
  isFaculty?: boolean;
}

const Schedule: React.FC<ScheduleProps> = ({ isFaculty }) => {
  const [viewMode, setViewMode] = useState<'list' | 'timetable'>('list');
  const [isZoomed, setIsZoomed] = useState(false);
  const [timetableImage, setTimetableImage] = useState<string>(TIMETABLE_IMAGE_URL);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const scheduleData = isFaculty ? MOCK_FACULTY_SCHEDULE : MOCK_SCHEDULE;

  useEffect(() => {
    const savedTimetable = localStorage.getItem('griet_custom_timetable');
    if (savedTimetable) {
      setTimetableImage(savedTimetable);
    }
  }, []);

  const getNextClass = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    return scheduleData.find(item => {
      const [h, m] = item.time.split(':').map(Number);
      return (h * 60 + m) > currentTimeVal;
    }) || scheduleData[0]; // Fallback to first class if day is over
  };

  const nextClass = getNextClass();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setTimetableImage(base64String);
        localStorage.setItem('griet_custom_timetable', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetTimetable = () => {
    if (window.confirm("Reset to official GRIET institutional timetable?")) {
      setTimetableImage(TIMETABLE_IMAGE_URL);
      localStorage.removeItem('griet_custom_timetable');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] border shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{isFaculty ? "Teaching Schedule" : "Class Schedule"}</h2>
          <p className="text-slate-500 text-sm font-medium">CSE - III Year | R22 Regulation</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto shadow-inner">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
          >
            <i className="fas fa-list-ul mr-2"></i> List View
          </button>
          <button 
            onClick={() => setViewMode('timetable')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'timetable' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
          >
            <i className="fas fa-table mr-2"></i> Image View
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Next Class Spotlight */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                   <span className="bg-orange-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block">UPCOMING NEXT</span>
                   <h3 className="text-3xl font-black mb-2">{nextClass?.subject}</h3>
                   <div className="flex flex-wrap gap-4 justify-center md:justify-start text-slate-300">
                      <span className="flex items-center gap-2"><i className="fas fa-clock text-orange-500"></i> {nextClass?.time}</span>
                      <span className="flex items-center gap-2"><i className="fas fa-map-marker-alt text-orange-500"></i> {nextClass?.room}</span>
                   </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center min-w-[140px]">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Room Status</p>
                   <p className="text-xl font-black text-orange-500">OPENED</p>
                   <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-2 animate-pulse"></div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduleData.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-2 h-full ${isFaculty ? 'bg-indigo-500' : 'bg-orange-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isFaculty ? 'text-indigo-500 bg-indigo-50' : 'text-orange-500 bg-orange-50'} px-3 py-1.5 rounded-xl`}>
                    {isFaculty ? 'Session' : 'Lecture'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{item.time}</span>
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">{item.subject}</h3>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors"><i className="fas fa-door-open"></i></div>
                    <span className="font-medium">{item.room}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors"><i className="fas fa-user-circle"></i></div>
                    <span className="font-medium">{isFaculty ? "B.Tech CSE-A" : item.lecturer}</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="text-orange-600 text-xs font-black uppercase tracking-widest">Resources</button>
                   <i className="fas fa-arrow-right text-slate-300 text-xs"></i>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-[3rem] border shadow-2xl overflow-hidden relative">
           <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><i className="fas fa-calendar-alt"></i></div>
                 <div>
                    <h3 className="font-black text-slate-800">
                      {timetableImage === TIMETABLE_IMAGE_URL ? "Institutional Timetable" : "Custom Uploaded Timetable"}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Registry 2026-27</p>
                 </div>
              </div>
              <div className="flex flex-wrap gap-3">
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleFileUpload}
                 />
                 {timetableImage !== TIMETABLE_IMAGE_URL && (
                    <button 
                      onClick={handleResetTimetable}
                      className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <i className="fas fa-undo mr-2"></i> Reset
                    </button>
                 )}
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-orange-600 transition-all flex items-center gap-2"
                 >
                    <i className="fas fa-cloud-upload-alt"></i> Upload New
                 </button>
                 <button 
                    className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-100 flex items-center gap-2"
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = timetableImage;
                        link.download = 'GRIET-Timetable-2026.png';
                        link.click();
                    }}
                 >
                    <i className="fas fa-download"></i> Save Image
                 </button>
              </div>
           </div>
           
           <div 
             onClick={() => setIsZoomed(true)}
             className="aspect-[16/10] bg-slate-100 rounded-3xl overflow-hidden group relative cursor-zoom-in border-4 border-slate-50 shadow-inner"
           >
              <img 
                src={timetableImage} 
                alt="Weekly Timetable" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <div className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl text-white font-black text-xs tracking-[0.2em] border border-white/20 flex items-center gap-3">
                    <i className="fas fa-search-plus text-lg"></i> TAP TO INSPECT
                 </div>
              </div>
           </div>
           
           <div className="mt-8 p-6 bg-slate-50 rounded-2xl flex items-start gap-4 border border-slate-100">
              <i className="fas fa-info-circle text-orange-600 mt-1"></i>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                 {timetableImage === TIMETABLE_IMAGE_URL 
                   ? "This is the official digitized institutional version. You can replace this with your personalized or section-specific timetable by using the 'Upload New' feature."
                   : "You are currently viewing a user-uploaded custom timetable. This image is stored locally in your browser cache. Changes here do not affect official college records."
                 }
              </p>
           </div>
           
           <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Institutional Verification Engine • Gokaraju Rangaraju Institute</p>

           {/* Full Screen Zoom Modal */}
           {isZoomed && (
             <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
                <div className="flex justify-between items-center p-8">
                   <div className="flex items-center gap-4 text-white">
                      <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-search-plus"></i></div>
                      <div className="text-left">
                        <h3 className="font-black text-xl tracking-tight">Full-Screen Inspection</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GRIET SmartCampus Secure Viewer</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setIsZoomed(false)}
                     className="w-14 h-14 bg-white/10 hover:bg-red-600 rounded-2xl text-white flex items-center justify-center transition-all group border border-white/5"
                   >
                      <i className="fas fa-times text-2xl group-hover:rotate-90 transition-transform"></i>
                   </button>
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center cursor-zoom-out" onClick={() => setIsZoomed(false)}>
                   <img 
                     src={timetableImage} 
                     alt="Full Scale Timetable" 
                     className="max-w-[95%] max-h-[95%] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-white/10 transition-transform hover:scale-[1.01]" 
                   />
                </div>
                <div className="p-8 text-center">
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Click anywhere or press ESC to dismiss</p>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default Schedule;
