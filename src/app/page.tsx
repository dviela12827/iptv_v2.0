'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Star,
  Phone, Mail, ArrowLeft,
  AlertCircle, Copy, Check, Loader2, ShieldCheck,
  Zap, Crown, Monitor, Smartphone,
  X, Users
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
      
      <AnimatePresence mode="wait">
        {step === 'plans' && (
          <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            {/* Logo Central (Scrollable) */}
            <header className="w-full py-20 flex justify-center items-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}>
                <span className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase" style={{ fontFamily: 'var(--font-syne)' }}>
                  ULTRA<span className="text-[#E50914]">STREAM</span>
                </span>
              </motion.div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 pb-32">
              
              {/* Comparativo */}
              <section className="py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <div className="space-y-6">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]" style={{ fontFamily: 'var(--font-syne)' }}>
                      INFRAESTRUTURA <span className="text-[#E50914]">SUPERIOR.</span>
                    </h2>
                    <p className="text-gray-500 text-lg font-bold uppercase tracking-widest opacity-80">Compare e decida.</p>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-3 border-b border-white/5 p-8 bg-white/5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-600">Recurso</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#E50914] text-center">UltraStream</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-600 text-center">Outros</div>
                    </div>
                    {[
                      { l: "Servidores 10Gbps", y: true, n: false },
                      { l: "Delay Zero Esportes", y: true, n: false },
                      { l: "4K HDR Nativo", y: true, n: false },
                      { l: "App Exclusivo", y: true, n: true },
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 p-8 border-b border-white/5 items-center">
                        <div className="text-xs font-black uppercase text-gray-400">{row.l}</div>
                        <div className="flex justify-center"><CheckCircle2 className="text-[#E50914]" size={24} /></div>
                        <div className="flex justify-center">{row.n ? <CheckCircle2 className="text-gray-800" size={20} /> : <X className="text-gray-800" size={20} />}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Prova Social */}
              <section className="py-24 border-y border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8">
                  <h3 className="text-4xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>O que dizem os sócios</h3>
                  <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 text-xs font-black uppercase tracking-widest">
                    <Users size={16} className="text-[#E50914]" /> +12k Membros Ativos
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {[
                    { n: "Ricardo M.", t: "Esqueça tudo que você já viu. É cinema em casa sem travar nada.", p: "https://randomuser.me/api/portraits/men/11.jpg" },
                    { n: "Ana Luiza", t: "O suporte é o diferencial. Me ajudaram na hora a configurar a TV.", p: "https://randomuser.me/api/portraits/women/22.jpg" },
                    { n: "Fabio D.", t: "Melhor investimento pra quem ama futebol. Sem delay nenhum.", p: "https://randomuser.me/api/portraits/men/33.jpg" }
                  ].map((rev, i) => (
                    <div key={i} className="bg-[#0A0A0A] p-10 rounded-[3rem] border border-white/5 relative">
                      <div className="flex items-center gap-4 mb-6">
                        <img src={rev.p} className="w-12 h-12 rounded-full border-2 border-[#E50914]" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest">{rev.n}</p>
                          <div className="flex text-[#E50914] gap-0.5"><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/></div>
                        </div>
                      </div>
                      <p className="text-gray-500 font-bold italic text-sm">"{rev.t}"</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Planos Brutalistas */}
              <section className="py-32">
                <div className="text-center mb-24">
                  <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>Planos <span className="text-[#E50914]">Vips</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {[
                    { period: '1 MÊS', price: '29,90', icon: <Smartphone />, features: ['1 Tela', 'Acesso Total', 'Suporte 24h'] },
                    { period: '3 MESES', price: '79,90', icon: <Crown />, features: ['4 Telas', '4K HDR Atmos', 'Downloads'], highlight: true },
                    { period: '6 MESES', price: '149,90', icon: <Monitor />, features: ['2 Telas', 'Acesso Total', 'Fidelidade'] }
                  ].map((plan, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -10 }}
                      className={`flex flex-col p-12 rounded-[3.5rem] bg-[#0A0A0A] border-4 ${plan.highlight ? 'border-[#E50914]' : 'border-white/5'} transition-all`}
                    >
                      <div className="mb-8">{plan.icon}</div>
                      <h4 className="text-[10px] font-black tracking-[0.4em] text-gray-600 mb-2 uppercase">{plan.period}</h4>
                      <div className="text-7xl font-black tracking-tighter mb-12">
                        <span className="text-xl align-top opacity-30 mr-1">R$</span>{plan.price}
                      </div>

                      <ul className="space-y-6 mb-16 flex-grow">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-gray-500">
                            <Zap size={14} className="text-[#E50914]" /> {f}
                          </li>
                        ))}
                      </ul>

                      <button 
                        onClick={() => handlePlanSelect(plan)}
                        className={`w-full py-7 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all ${plan.highlight ? 'bg-[#E50914] text-white shadow-[0_20px_40px_rgba(229,9,20,0.3)]' : 'bg-white text-black hover:bg-[#E50914] hover:text-white'}`}
                      >
                        Ativar Agora
                      </button>
                    </motion.div>
                  ))}
                </div>
              </section>

            </main>

            <footer className="py-24 bg-black border-t border-white/5 text-center">
              <span className="text-4xl font-black tracking-tighter uppercase mb-8 block" style={{ fontFamily: 'var(--font-syne)' }}>ULTRA<span className="text-[#E50914]">STREAM</span></span>
              <p className="text-[10px] font-black text-gray-800 tracking-[0.5em] uppercase">© 2024 • Luxury Streaming Interface</p>
            </footer>
          </motion.div>
        )}

        {/* PAGAMENTO */}
        {(step === 'checkout' || step === 'pix' || step === 'success') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center p-6 bg-black">
            <div className="max-w-md w-full bg-[#0A0A0A] border border-white/10 rounded-[3.5rem] p-12 shadow-2xl">
              {step === 'checkout' && (
                <form onSubmit={handleGeneratePix} className="space-y-10 text-center">
                  <h3 className="text-3xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>Check-in</h3>
                  <div className="space-y-4">
                    <input 
                      type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="EMAIL@GMAIL.COM"
                      className="w-full bg-white/5 border-2 border-white/10 rounded-3xl py-6 px-8 text-white focus:border-[#E50914] outline-none transition-all font-black text-xs tracking-widest placeholder:text-gray-800"
                    />
                    <input 
                      type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})}
                      placeholder="(00) 00000-0000" maxLength={15}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-3xl py-6 px-8 text-white focus:border-[#E50914] outline-none transition-all font-black text-xs tracking-widest placeholder:text-gray-800"
                    />
                  </div>
                  <button disabled={loading} className="w-full py-7 bg-white text-black font-black rounded-3xl uppercase tracking-[0.3em] text-xs hover:bg-[#E50914] hover:text-white transition-all shadow-xl">
                    {loading ? 'PROCESSANDO...' : 'GERAR ACESSO'}
                  </button>
                </form>
              )}

              {step === 'pix' && (
                <div className="flex flex-col items-center text-center space-y-10">
                  <h3 className="text-3xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>Pagamento</h3>
                  <div className="bg-white p-6 rounded-[3rem]">
                    <img src={pixData.image} alt="QR Code" className="w-64 h-64" />
                  </div>
                  <button onClick={copyToClipboard} className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-3xl flex justify-between items-center group">
                    <span className="truncate text-gray-600 text-[10px] font-black uppercase tracking-widest mr-4">{pixData.code}</span>
                    {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-[#E50914]" />}
                  </button>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#E50914]">
                    <Loader2 className="animate-spin" size={16} /> Validando Transação
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center space-y-8">
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={50} className="text-green-500" />
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>Liberado</h3>
                  <p className="text-xs text-gray-500 font-black uppercase tracking-widest">Confira seu email agora.</p>
                  <button onClick={() => window.location.href = '/'} className="w-full py-7 bg-white/5 rounded-3xl text-white font-black uppercase tracking-widest text-xs">Finalizar</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
