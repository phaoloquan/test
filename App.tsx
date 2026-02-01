
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { ProjectShowcase } from './components/ProjectShowcase.tsx';
import { ProjectDetail } from './components/ProjectDetail.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { Footer } from './components/Footer.tsx';
import { contactInfo, fetchProjectsFromSheet, submitFeedback } from './data.ts';
import { Project } from './types.ts';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Form state
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchProjectsFromSheet();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      setError('Không thể kết nối với dữ liệu Google Sheet.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Vui lòng nhập tên và số điện thoại.");
      return;
    }
    setFormStatus('sending');
    const ok = await submitFeedback(formData.name, formData.phone, formData.message);
    if (ok) {
      setFormStatus('success');
      setFormData({ name: '', phone: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 5000);
    } else {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };

  const openAdmin = () => {
    const password = prompt("Vui lòng nhập mật khẩu quản trị:");
    if (password === 'bepchuut') {
      setShowAdmin(true);
    } else if (password !== null) {
      alert("Mật khẩu không chính xác.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-red-800 selection:text-white relative bg-stone-50">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        
        {error && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 text-center text-amber-800 text-sm flex items-center justify-center gap-2">
            <span className="text-lg">⚠️</span> {error} 
            <button onClick={loadData} className="underline font-bold ml-2 hover:text-red-800">Thử lại ngay</button>
          </div>
        )}

        <section id="services" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-8 bg-stone-50 rounded-2xl border border-stone-100 hover:border-red-800/20 transition-all group shadow-sm hover:shadow-xl">
                <div className="w-14 h-14 bg-red-800/10 text-red-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-800 group-hover:text-white transition-all">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-4 font-serif">Tối Ưu Nhiệt Lượng</h3>
                <p className="text-stone-500 leading-relaxed text-sm">Sử dụng nguyên lý khí động học giúp bếp cháy mạnh, không khói và tiết kiệm tới 40% nhiên liệu.</p>
              </div>
              
              <div className="p-8 bg-stone-50 rounded-2xl border border-stone-100 hover:border-amber-800/20 transition-all group shadow-sm hover:shadow-xl">
                <div className="w-14 h-14 bg-amber-800/10 text-amber-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-800 group-hover:text-white transition-all">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-4 font-serif">Thiết Bị Inox 304</h3>
                <p className="text-stone-500 leading-relaxed text-sm">Cung cấp tủ, nồi hấp cơm Inox 304 - 100% bền bỉ, chống gỉ sét, đảm bảo vệ sinh an toàn thực phẩm.</p>
              </div>

              <div className="p-8 bg-stone-50 rounded-2xl border border-stone-100 hover:border-stone-800/20 transition-all group shadow-sm hover:shadow-xl">
                <div className="w-14 h-14 bg-stone-800/10 text-stone-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-stone-800 group-hover:text-white transition-all">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-4 font-serif">Sửa Chữa Tận Tâm</h3>
                <p className="text-stone-500 leading-relaxed text-sm">Nhận sửa chữa các loại bếp lò cũ, giúp khôi phục hiệu năng tối đa cho gian bếp của chú.</p>
              </div>
            </div>
          </div>
        </section>

        <ProjectShowcase 
          projects={projects} 
          isLoading={isLoading} 
          onProjectClick={setSelectedProject}
          onRefresh={loadData}
        />

        <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-4">
          <a 
            href={`https://zalo.me/${contactInfo.phone.replace(/\s/g, '')}`} 
            target="_blank" 
            rel="noreferrer"
            className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform animate-bounce"
          >
            <span className="text-2xl font-bold">Z</span>
          </a>
          <a 
            href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} 
            className="w-14 h-14 bg-red-800 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
          >
            <span className="text-2xl">📞</span>
          </a>
        </div>

        <ProjectDetail 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />

        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

        <section id="contact" className="py-24 bg-zinc-900 text-white overflow-hidden relative border-t border-white/5">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-red-800/5 skew-x-12"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-serif mb-8">Liên Hệ Tư Vấn & Thi Công</h2>
              <p className="text-stone-400 text-lg mb-12">
                Hãy liên hệ trực tiếp với <strong>{contactInfo.name}</strong> để được khảo sát và báo giá chi tiết.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md text-left flex flex-col justify-between shadow-2xl">
                  <div>
                    <h4 className="text-red-500 font-bold mb-6 uppercase text-xs tracking-[0.2em]">Thông tin thợ xây bếp</h4>
                    <div className="space-y-6">
                      <div>
                        <p className="text-3xl font-bold text-white font-serif">{contactInfo.name}</p>
                        <p className="text-red-400 font-medium">{contactInfo.title}</p>
                      </div>
                      <ul className="space-y-3 text-stone-300 text-sm">
                        <li className="flex items-center gap-3"><span className="text-red-500">✓</span> {contactInfo.services}</li>
                        <li className="flex items-center gap-3"><span className="text-red-500">✓</span> {contactInfo.fuels}</li>
                        <li className="flex items-center gap-3"><span className="text-red-500">✓</span> {contactInfo.products}</li>
                      </ul>
                      <div className="pt-8 border-t border-white/10 space-y-5">
                        <p className="text-4xl font-bold tracking-tighter">
                          <span className="text-red-500 mr-2">📞</span>
                          <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="hover:text-red-500 transition-colors">{contactInfo.phone}</a>
                        </p>
                        <p className="text-stone-400 text-xs">📍 {contactInfo.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-10 rounded-3xl text-zinc-900 shadow-2xl flex flex-col">
                  <h4 className="text-zinc-900 font-bold mb-8 text-2xl font-serif">Để lại lời nhắn</h4>
                  <form className="space-y-4 text-left flex-grow" onSubmit={handleFormSubmit}>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-400 ml-1">Họ tên khách hàng</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Vd: Nguyễn Văn A" 
                        className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-800/5 focus:border-red-800 transition-all text-sm" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-400 ml-1">Số điện thoại</label>
                      <input 
                        required
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="090x xxx xxx" 
                        className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-800/5 focus:border-red-800 transition-all text-sm" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-400 ml-1">Yêu cầu của bạn</label>
                      <textarea 
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        placeholder="Vd: Xây bếp củi hiện đại tại Hóc Môn..." 
                        rows={3} 
                        className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-800/5 focus:border-red-800 transition-all text-sm"
                      ></textarea>
                    </div>
                    
                    {formStatus === 'success' ? (
                      <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold text-center animate-bounce">
                        Gửi yêu cầu thành công! Chú Út sẽ gọi lại ngay.
                      </div>
                    ) : formStatus === 'error' ? (
                      <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold text-center">
                        Có lỗi xảy ra, chú vui lòng gọi trực tiếp nhé.
                      </div>
                    ) : (
                      <button 
                        disabled={formStatus === 'sending'}
                        className="w-full py-4 bg-red-800 text-white rounded-xl font-bold hover:bg-zinc-900 transition-all shadow-xl shadow-red-900/10 uppercase tracking-widest text-xs active:scale-95 disabled:opacity-50"
                      >
                        {formStatus === 'sending' ? 'Đang gửi...' : 'Gửi Yêu Cầu Cho Chú Út'}
                      </button>
                    )}
                  </form>
                </div>
              </div>
              
              <div className="mt-12 opacity-20 hover:opacity-100 transition-opacity">
                <button onClick={openAdmin} className="text-[8px] uppercase tracking-[0.5em] text-stone-500">Hệ thống quản trị</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default App;
