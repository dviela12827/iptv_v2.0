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
            
            {/* Logo Centralizada (Escala Ajustada) */}
            <header className="w-full py-16 flex justify-center items-center">
              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
                <span className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase" style={{ fontFamily: 'var(--font-syne)' }}>
                  ULTRA<span className="text-[#E50914]">STREAM</span>
                </span>
              </motion.div>
            </header>

            <main className="max-w-6xl mx-auto px-6 pb-32">
              
              {/* Comparativo Ajustado */}
              <section className="py-20 border-b border-white/5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight uppercase" style={{ fontFamily: 'var(--font-syne)' }}>
                      INFRAESTRUTURA <br /> <span className="text-[#E50914]">SUPERIOR.</span>
                    </h2>
                    <p className="text-gray-500 text-sm font-black uppercase tracking-[0.3em] opacity-80">Por que escolher o UltraStream?</p>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-3 border-b border-white/5 p-6 bg-white/5">
                      <div className="text-[9px] font-black uppercase tracking-widest text-gray-600">Serviço</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-[#E50914] text-center">Ultra</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-gray-600 text-center">Outros</div>
                    </div>
                    {[
                      { l: "Servidores 10Gbps", y: true, n: false },
                      { l: "Delay Zero", y: true, n: false },
                      { l: "4K HDR Nativo", y: true, n: false },
                      { l: "App Exclusivo", y: true, n: true },
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 p-6 border-b border-white/5 items-center">
                        <div className="text-[10px] font-black uppercase text-gray-400">{row.l}</div>
                        <div className="flex justify-center"><CheckCircle2 className="text-[#E50914]" size={18} /></div>
                        <div className="flex justify-center">{row.n ? <CheckCircle2 className="text-gray-800" size={16} /> : <X className="text-gray-800" size={16} />}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Prova Social Ajustada */}
              <section className="py-24">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 text-center md:text-left">
                  <h3 className="text-3xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>O QUE DIZEM NOSSOS SÓCIOS</h3>
                  <div className="flex items-center gap-4 bg-[#E50914]/10 px-6 py-2 rounded-full border border-[#E50914]/20 text-[10px] font-black uppercase tracking-widest text-[#E50914]">
                    <Users size={14} /> +12k Usuários Ativos
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { n: "Ricardo M.", t: "Esqueça tudo que você já viu. É cinema em casa sem travar nada.", p: "https://randomuser.me/api/portraits/men/11.jpg" },
                    { n: "Ana Luiza", t: "O suporte é o diferencial. Me ajudaram na hora a configurar a TV.", p: "https://randomuser.me/api/portraits/women/22.jpg" },
                    { n: "Fabio D.", t: "Melhor investimento pra quem ama futebol. Sem delay nenhum.", p: "https://randomuser.me/api/portraits/men/33.jpg" }
                  ].map((rev, i) => (
                    <div key={i} className="bg-[#0A0A0A] p-8 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-4 mb-6">
                        <img src={rev.p} className="w-10 h-10 rounded-full border border-[#E50914]" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest">{rev.n}</p>
                          <div className="flex text-[#E50914] gap-0.5"><Star size={8} fill="currentColor"/><Star size={8} fill="currentColor"/><Star size={8} fill="currentColor"/><Star size={8} fill="currentColor"/><Star size={8} fill="currentColor"/></div>
                        </div>
                      </div>
                      <p className="text-gray-500 font-bold italic text-xs leading-relaxed">"{rev.t}"</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Planos VIP Ajustados */}
              <section className="py-24">
                <div className="text-center mb-20">
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>PLANOS <span className="text-[#E50914]">VIPS</span></h2>
                  <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Ativação imediata pós-pix</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {[
                    { period: '1 MÊS', price: '29,90', icon: <Smartphone />, features: ['1 Tela', '4K Ultra HD', 'Suporte VIP'] },
                    { period: '3 MESES', price: '79,90', icon: <Crown />, features: ['4 Telas', 'HDR Atmos', 'Downloads'], highlight: true },
                    { period: '6 MESES', price: '149,90', icon: <Monitor />, features: ['2 Telas', '4K Ultra HD', 'Fidelidade'] }
                  ].map((plan, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      className={`flex flex-col p-10 rounded-[2.5rem] bg-[#0A0A0A] border-2 ${plan.highlight ? 'border-[#E50914]' : 'border-white/5'} transition-all`}
                    >
                      <div className={`${plan.highlight ? 'text-[#E50914]' : 'text-gray-600'} mb-6`}>{plan.icon}</div>
                      <h4 className="text-[9px] font-black tracking-[0.3em] text-gray-500 mb-2 uppercase">{plan.period}</h4>
                      <div className="text-5xl font-black tracking-tighter mb-10">
                        <span className="text-lg align-top opacity-30 mr-1">R$</span>{plan.price}
                      </div>

                      <ul className="space-y-4 mb-12 flex-grow">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-400">
                            <Zap size={12} className="text-[#E50914]" /> {f}
                          </li>
                        ))}
                      </ul>

                      <button 
                        onClick={() => handlePlanSelect(plan)}
                        className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${plan.highlight ? 'bg-[#E50914] text-white shadow-lg' : 'bg-white text-black hover:bg-[#E50914] hover:text-white'}`}
                      >
                        ASSINAR AGORA
                      </button>
                    </motion.div>
                  ))}
                </div>
              </section>

            </main>

            <footer className="py-20 bg-black border-t border-white/5 text-center">
              <span className="text-3xl font-black tracking-tighter uppercase mb-6 block" style={{ fontFamily: 'var(--font-syne)' }}>ULTRA<span className="text-[#E50914]">STREAM</span></span>
              <p className="text-[9px] font-black text-gray-800 tracking-[0.4em] uppercase">© 2024 • LUXURY STREAMING INTERFACE</p>
            </footer>
          </motion.div>
        )}

        {/* PAGAMENTO */}
        {(step === 'checkout' || step === 'pix' || step === 'success') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center p-6 bg-black">
            <div className="max-w-md w-full bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 shadow-2xl">
              {step === 'checkout' && (
                <form onSubmit={handleGeneratePix} className="space-y-8 text-center">
                  <h3 className="text-2xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>Check-in</h3>
                  <div className="space-y-4">
                    <input 
                      type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="EMAIL@GMAIL.COM"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:border-[#E50914] outline-none transition-all font-black text-[10px] tracking-widest placeholder:text-gray-800"
                    />
                    <input 
                      type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})}
                      placeholder="(00) 00000-0000" maxLength={15}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:border-[#E50914] outline-none transition-all font-black text-[10px] tracking-widest placeholder:text-gray-800"
                    />
                  </div>
                  <button disabled={loading} className="w-full py-6 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-[#E50914] hover:text-white transition-all">
                    {loading ? '...' : 'GERAR ACESSO'}
                  </button>
                  <button onClick={() => setStep('plans')} className="text-gray-600 text-[10px] font-black uppercase tracking-widest hover:text-white">Voltar</button>
                </form>
              )}

              {step === 'pix' && (
                <div className="flex flex-col items-center text-center space-y-8">
                  <h3 className="text-2xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>Pagamento</h3>
                  <div className="bg-white p-4 rounded-[2.5rem]">
                    <img src={pixData.image} alt="QR Code" className="w-56 h-56" />
                  </div>
                  <button onClick={copyToClipboard} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center group">
                    <span className="truncate text-gray-600 text-[9px] font-black uppercase tracking-widest mr-4">{pixData.code}</span>
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-[#E50914]" />}
                  </button>
                  <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#E50914]">
                    <Loader2 className="animate-spin" size={14} /> Sincronizando
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>Ativado</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Confira seu email agora.</p>
                  <button onClick={() => window.location.href = '/'} className="w-full py-6 bg-white/5 rounded-2xl text-white font-black uppercase tracking-widest text-[10px]">Finalizar</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
