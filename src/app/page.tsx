'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Star,
  Phone, Mail, ArrowLeft,
  AlertCircle, Copy, Check, Loader2, Search, Bell, ShieldCheck,
  Zap, Crown, Monitor, Smartphone, Download
} from 'lucide-react';
import axios from 'axios';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot, updateDoc } from 'firebase/firestore';

// --- Utilitários ---
const formatPhone = (v: string) => {
  if (!v) return "";
  v = v.replace(/\D/g, "");
  v = v.replace(/(\d{2})(\d)/, "($1) $2");
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  return v.slice(0, 15);
};

const isValidGmail = (e: string) => e.toLowerCase().endsWith('@gmail.com');

// --- Background Animado (Tech Style) ---
const TechBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E50914]/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E50914]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
  </div>
);

export default function LandingPage() {
  const [step, setStep] = useState<'plans' | 'checkout' | 'pix' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState({ code: '', image: '', id: '' });
  const [isPaid, setIsPaid] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [copied, setCopied] = useState(false);

  // LOGICA DE PAGAMENTO
  useEffect(() => {
    if (!isPaid) return;
    if (pixData.id) axios.get(`/api/check-status?id=${pixData.id}`).catch(() => {});
    if (leadId) {
      updateDoc(doc(db, "leads", leadId), { status: 'renewed', paidAt: new Date().toISOString() }).catch(() => {});
    }
    if (formData.email && leadId) {
      (async () => {
        try {
          const { getDoc } = await import('firebase/firestore');
          const leadSnap = await getDoc(doc(db, "leads", leadId));
          if (leadSnap.exists() && !leadSnap.data().emailSent) {
            await axios.post('/api/send-email', {
              email: formData.email,
              plan: selectedPlan.period,
              price: selectedPlan.price,
              status: 'approved',
              origin: 'landing_premium'
            });
            updateDoc(doc(db, "leads", leadId), { emailSent: true }).catch(() => {});
          }
        } catch (err) {}
      })();
    }
    setStep('success');
  }, [isPaid, pixData.id, leadId]);

  useEffect(() => {
    if (step !== 'pix') return;
    const unsubs: (() => void)[] = [];
    if (pixData.id) {
      unsubs.push(onSnapshot(doc(db, "payments", pixData.id.toLowerCase()), (snap) => {
        if (snap.exists() && ['paid', 'approved', 'pago'].includes((snap.data().status || '').toLowerCase())) setIsPaid(true);
      }));
    }
    if (leadId) {
      unsubs.push(onSnapshot(doc(db, "leads", leadId), (snap) => {
        if (snap.exists() && ['approved', 'renewed', 'paid'].includes((snap.data().status || '').toLowerCase())) setIsPaid(true);
      }));
    }
    const pollInterval = setInterval(async () => {
      if (isPaid || !pixData.id) return;
      try {
        const res = await axios.get(`/api/check-status?id=${pixData.id}`);
        if (res.data.paid || ['approved', 'paid'].includes(res.data.status)) setIsPaid(true);
      } catch (e) {}
    }, 1500);

    return () => { unsubs.forEach(u => u()); clearInterval(pollInterval); };
  }, [step, pixData.id, leadId, isPaid]);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.phone) return alert("Preencha todos os campos!");
    const cleanEmail = formData.email.toLowerCase().trim();
    if (!cleanEmail.endsWith('@gmail.com')) return alert("Use um e-mail @gmail.com para recebimento imediato!");

    setLoading(true);
    try {
      const leadRef = await addDoc(collection(db, "leads"), {
        email: cleanEmail,
        phone: formData.phone,
        plan: selectedPlan.period,
        price: selectedPlan.price,
        status: 'pending',
        origin: 'landing_premium',
        createdAt: serverTimestamp()
      });
      setLeadId(leadRef.id);

      const res = await axios.post('/api/payment', {
        amount: selectedPlan.price,
        description: `Assinatura - ${selectedPlan.period}`,
        payerEmail: cleanEmail,
        leadId: leadRef.id,
        origin: 'landing_premium'
      });

      setPixData({ code: res.data.qrcode_content, image: res.data.qrcode_image_url, id: res.data.transaction_id });
      setStep('pix');
    } catch (error) {
      alert("Erro ao gerar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="min-h-screen text-white font-sans antialiased selection:bg-[#E50914] selection:text-white bg-black overflow-x-hidden">
      <TechBackground />
      
      <AnimatePresence mode="wait">
        {step === 'plans' && (
          <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Header Moderno */}
            <nav className="fixed top-0 w-full z-50 px-[5%] py-8 flex justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/5">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <span className="text-3xl font-black tracking-tighter text-white">
                  ULTRA<span className="text-[#E50914]">STREAM</span>
                </span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="hidden md:flex gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400"
              >
                {['Home', 'Tecnologia', 'Catálogo', 'Planos'].map((item, i) => (
                  <a key={item} href="#" className="hover:text-[#E50914] transition-colors duration-300">
                    {item}
                  </a>
                ))}
              </motion.div>

              <div className="flex gap-4">
                <button className="bg-white/5 border border-white/10 p-2 rounded-full hover:bg-[#E50914] transition-all duration-300">
                  <Search size={18} />
                </button>
                <button className="bg-[#E50914] p-2 rounded-full shadow-[0_0_15px_rgba(229,9,20,0.5)]">
                  <Bell size={18} />
                </button>
              </div>
            </nav>

            <main>
              {/* Hero Section Tech */}
              <section className="h-[90vh] flex flex-col items-center justify-center text-center relative px-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[#E50914] text-[10px] font-black uppercase tracking-widest mb-4">
                    <Zap size={12} fill="currentColor" /> Próxima Geração de Streaming
                  </div>
                  <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] text-white">
                    SINTA A<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">POTÊNCIA</span>
                  </h1>
                  <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium tracking-tight">
                    Experiência imersiva em 4K HDR Atmos. Sem limites. Sem interrupções.
                  </p>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="pt-10"
                  >
                    <button 
                      onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="group relative px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
                    >
                      <span className="relative z-10">Iniciar Experiência</span>
                      <div className="absolute inset-0 bg-[#E50914] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  </motion.div>
                </motion.div>

                {/* Micro-animação de scroll */}
                <motion.div 
                  animate={{ y: [0, 10, 0] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-[#E50914] to-transparent"
                />
              </section>

              {/* Pricing Section Tech */}
              <section id="plans-section" className="px-[5vw] py-24 bg-black relative z-10">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-20 space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#E50914]">Configurações</h2>
                    <p className="text-4xl md:text-5xl font-black tracking-tight">Escolha seu Acesso</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { period: '1 Mês', price: '29,90', icon: <Smartphone size={24} />, features: ['1 Tela Simultânea', '4K Ultra HD', 'Suporte 24/7'] },
                      { period: '3 Meses', price: '79,90', icon: <Crown size={24} />, features: ['4 Telas Simultâneas', '4K HDR Atmos', 'Downloads Ilimitados'], highlight: true },
                      { period: '6 Meses', price: '149,90', icon: <Monitor size={24} />, features: ['2 Telas Simultâneas', '4K Ultra HD', 'Catálogo Premium'] }
                    ].map((plan, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -10 }}
                        className={`relative group bg-[#0A0A0A] border ${plan.highlight ? 'border-[#E50914]/50' : 'border-white/5'} rounded-3xl p-10 transition-all duration-500 overflow-hidden`}
                      >
                        {plan.highlight && (
                          <div className="absolute top-0 right-0 bg-[#E50914] text-white text-[10px] font-black px-6 py-2 rounded-bl-2xl uppercase tracking-widest">
                            Best Value
                          </div>
                        )}
                        
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${plan.highlight ? 'bg-[#E50914] text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]' : 'bg-white/5 text-gray-400'}`}>
                          {plan.icon}
                        </div>

                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">{plan.period}</h3>
                        <div className="text-5xl font-black tracking-tighter mb-8">
                          <span className="text-lg font-bold opacity-30 align-top mr-1">R$</span>
                          {plan.price}
                        </div>

                        <ul className="space-y-4 mb-10">
                          {plan.features.map(f => (
                            <li key={f} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                              <CheckCircle2 size={16} className="text-[#E50914]" /> {f}
                            </li>
                          ))}
                        </ul>

                        <button 
                          onClick={() => handlePlanSelect(plan)}
                          className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${plan.highlight ? 'bg-[#E50914] text-white hover:shadow-[0_0_30px_rgba(229,9,20,0.5)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                        >
                          Ativar Agora
                        </button>

                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#E50914]/5 rounded-full blur-[40px] group-hover:bg-[#E50914]/10 transition-colors" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Reviews Section Tech */}
              <section className="px-[5vw] py-24 bg-[#050505]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { n: "Marcelo Silva", t: "Qualidade de imagem brutal. O 4K é real." },
                    { n: "Ana Clara", t: "Fluidez total, sem travamentos no domingo à noite." },
                    { n: "Roberto Mendes", t: "Suporte responde rápido. Plano de 3 meses é o melhor." },
                    { n: "Julia N.", t: "Interface limpa e rápida. Recomendo." }
                  ].map((review, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-[#E50914]/30 transition-all">
                      <div className="flex text-[#E50914] mb-4 gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                      </div>
                      <p className="text-sm text-gray-400 font-medium mb-6 italic leading-relaxed">"{review.t}"</p>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E50914]">{review.n}</span>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <footer className="py-20 px-[5%] bg-black border-t border-white/5">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                <span className="text-2xl font-black tracking-tighter">ULTRA<span className="text-[#E50914]">STREAM</span></span>
                <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                  <a href="#" className="hover:text-white transition-colors">Ajuda</a>
                  <a href="#" className="hover:text-white transition-colors">Termos</a>
                  <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                </div>
                <p className="text-[10px] font-medium text-gray-700 tracking-widest uppercase">© 2024 UltraStream • Premium Interface</p>
              </div>
            </footer>
          </motion.div>
        )}

        {/* FLUXO DE PAGAMENTO (RE-ESTILIZADO) */}
        {(step === 'checkout' || step === 'pix' || step === 'success') && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen flex items-center justify-center p-6 bg-black">
            <div className="max-w-md w-full">
              <button onClick={() => setStep('plans')} className="flex items-center text-gray-500 hover:text-white mb-8 transition-colors text-xs font-black uppercase tracking-widest">
                <ArrowLeft size={16} className="mr-2" /> Voltar
              </button>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E50914]/10 rounded-full blur-[60px]" />
                
                {step === 'checkout' && (
                  <form onSubmit={handleGeneratePix} className="space-y-8 relative z-10">
                    <div className="text-center">
                      <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Ativar Assinatura</h3>
                      <div className="inline-block px-4 py-1 rounded-full bg-[#E50914]/10 text-[#E50914] text-[10px] font-black uppercase tracking-widest">
                        R$ {selectedPlan?.price} • {selectedPlan?.period}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email de Acesso</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                          <input 
                            type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="exemplo@gmail.com"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#E50914] outline-none transition-all placeholder:text-gray-700 font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">WhatsApp Suporte</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                          <input 
                            type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})}
                            placeholder="(00) 00000-0000" maxLength={15}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#E50914] outline-none transition-all placeholder:text-gray-700 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <button disabled={loading} className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center disabled:opacity-50 transition-all hover:bg-[#E50914] hover:text-white uppercase tracking-[0.2em] text-xs">
                      {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={20}/></motion.div> : 'Gerar Pagamento Pix'}
                    </button>
                    <p className="text-center text-[9px] font-black text-gray-700 uppercase tracking-widest flex items-center justify-center gap-1"><ShieldCheck size={12}/> Encriptação de Ponta a Ponta</p>
                  </form>
                )}

                {step === 'pix' && (
                  <div className="flex flex-col items-center text-center space-y-8">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Finalizar Pix</h3>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Escaneie o código abaixo</p>
                    </div>

                    <div className="bg-white p-4 rounded-[2rem] shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                      <img src={pixData.image} alt="QR Code Pix" className="w-56 h-56" />
                    </div>

                    <button onClick={copyToClipboard} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:border-[#E50914]/50 transition-all">
                      <span className="truncate text-gray-500 text-[10px] font-black uppercase tracking-widest mr-4">{pixData.code}</span>
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-[#E50914] group-hover:scale-110 transition-all" />}
                    </button>

                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[#E50914] bg-[#E50914]/10 px-6 py-3 rounded-full">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Loader2 size={16} /></motion.div>
                      Aguardando Sistema
                    </div>
                  </div>
                )}

                {step === 'success' && (
                  <div className="flex flex-col items-center text-center space-y-8 py-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={48} className="text-green-500" />
                    </motion.div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tighter uppercase mb-2">Acesso Liberado</h3>
                      <p className="text-sm text-gray-500 font-medium tracking-tight">O protocolo de autenticação foi enviado para:<br/><strong className="text-white">{formData.email}</strong></p>
                    </div>
                    <button onClick={() => window.location.href = '/'} className="w-full py-5 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all">
                      Voltar ao Dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
