'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Star,
  Phone, Mail, ArrowLeft,
  AlertCircle, Copy, Check, Loader2, Search, Bell
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

// --- Componentes Visuais ---
const OrbitingLogo = ({ src, delay, duration, radius, size }: any) => {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 rounded-full border border-white/5 shadow-2xl"
      style={{ width: radius * 2, height: radius * 2, x: '-50%', y: '-50%' }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: duration, ease: "linear", delay: delay }}
    >
      <div 
        className="absolute top-0 left-1/2 bg-black/80 rounded-full p-2 border border-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden"
        style={{ x: '-50%', y: '-50%', width: size, height: size }}
      >
        <motion.img 
          src={src} 
          className="w-full h-full object-contain"
          animate={{ rotate: -360 }} // Anti-rotação para manter o ícone em pé
          transition={{ repeat: Infinity, duration: duration, ease: "linear", delay: delay }}
        />
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const [step, setStep] = useState<'plans' | 'checkout' | 'pix' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState({ code: '', image: '', id: '' });
  const [isPaid, setIsPaid] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [copied, setCopied] = useState(false);

  // LOGICA DE PAGAMENTO - TRIPLE LAYER (Copiado do Renove)
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

  const plans = [
    { period: '1 Mês', price: '29,90', highlight: false },
    { period: '3 Meses', price: '79,90', highlight: true, save: 'Economize 11%' },
    { period: '6 Meses', price: '149,90', highlight: false }
  ];

  return (
    <div className="min-h-screen text-[#e2e2e2] font-sans antialiased selection:bg-[#e50914] selection:text-white pb-24 md:pb-0" style={{ backgroundColor: '#000000' }}>
      <AnimatePresence mode="wait">
        {step === 'plans' && (
          <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-['Plus_Jakarta_Sans']">
            {/* TopNavBar */}
            <nav className="bg-transparent dark:bg-black/60 backdrop-blur-2xl fixed top-0 w-full z-50 flex justify-between items-center px-[5%] py-6">
              <div className="flex items-center gap-12">
                <span className="text-4xl font-black text-[#E50914] tracking-tighter font-['Bebas_Neue']">CINEPREMIUM</span>
                <div className="hidden md:flex gap-8 font-['Bebas_Neue'] tracking-wider uppercase text-lg">
                  <a className="text-white border-b-2 border-[#E50914] pb-1 hover:text-white transition-colors duration-300" href="#">Início</a>
                  <a className="text-gray-300 font-light hover:text-white transition-colors duration-300" href="#">Séries</a>
                  <a className="text-gray-300 font-light hover:text-white transition-colors duration-300" href="#">Filmes</a>
                  <a className="text-gray-300 font-light hover:text-white transition-colors duration-300" href="#">Bombando</a>
                  <a className="text-gray-300 font-light hover:text-white transition-colors duration-300" href="#">Minha Lista</a>
                </div>
              </div>
              <div className="flex items-center gap-6 text-[#E50914]">
                <Search className="scale-105 transition-transform duration-200 ease-out cursor-pointer hover:text-white" />
                <Bell className="scale-105 transition-transform duration-200 ease-out cursor-pointer hover:text-white" />
              </div>
            </nav>

            <main className="min-h-screen">
              {/* Seção 1: Carrossel Hero Placeholder */}
              <section className="w-full h-[614px] relative mt-24 md:mt-0 flex items-center justify-center bg-[#1f1f1f] overflow-hidden group">
                <img alt="Background hero" className="absolute inset-0 w-full h-full object-cover opacity-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrHyTfersjoOUSAMcwCoKRZsslP3jemtan5G3JUKrcFqj2Q1gc5DSvs4CzT2lSh-zhT16C65tfa2CTZZFD4UxxNUqevF67id5vfJCpK9CC_4lNhqkQpbzkQcA4nIumh7k_y_WhbKiKoSw0q30_ipETRGNYkMTdZ303YD4hihHJaJ-8bp88fKL1ZFVKz4dam3jO3bYIxv7P15uz92Z4T46-hpO76ehxy3Q8WZ6AhZdIUINYR9YQPlYGatEufKP5f470_0wew_2UVIfE"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
                <div className="relative z-10 p-8 border-2 border-dashed border-[#5e3f3b]/50 rounded-xl bg-black/40 backdrop-blur-md">
                  <p className="font-['Plus_Jakarta_Sans'] text-[12px] font-extrabold text-[#e9bcb6] uppercase tracking-widest">Placeholder Carrossel Desktop - 1920x600</p>
                </div>
              </section>

              {/* Seção 2: Pricing */}
              <section className="px-[5vw] py-[4rem] relative z-20 -mt-16">
                <div className="max-w-6xl mx-auto">
                  <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[24px] text-center mb-16 text-[#e2e2e2]">Escolha seu plano</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    {/* Card 1 */}
                    <div className="bg-[#131313]/70 backdrop-blur-md rounded-xl p-8 flex flex-col items-center border border-[#5e3f3b]/30 hover:border-[#af8782] transition-colors duration-300">
                      <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[12px] text-[#e9bcb6] uppercase mb-4 tracking-widest">1 Mês</span>
                      <div className="font-['Bebas_Neue'] text-[48px] text-[#e2e2e2] mb-8 tracking-wide flex items-start">
                        <span className="text-2xl mr-1 mt-2 opacity-50">R$</span>29,90
                      </div>
                      <ul className="text-center font-['Plus_Jakarta_Sans'] text-[14px] text-[#e9bcb6] space-y-3 mb-8 w-full opacity-80">
                        <li>Acesso a todo o catálogo</li>
                        <li>Qualidade 4K Ultra HD</li>
                        <li>Assista em 1 tela</li>
                      </ul>
                      <button onClick={() => handlePlanSelect({ period: '1 Mês', price: '29,90' })} className="w-full py-4 rounded-lg font-['Plus_Jakarta_Sans'] font-extrabold text-[12px] border border-[#e2e2e2] text-[#e2e2e2] hover:bg-white/5 transition-all duration-200 tracking-widest uppercase">
                        Assinar Agora
                      </button>
                    </div>

                    {/* Card 2 (Destaque) */}
                    <div className="bg-[#1f1f1f] rounded-xl p-10 flex flex-col items-center border-2 border-[#E50914] shadow-[0_0_40px_rgba(229,9,20,0.25)] relative transform md:-translate-y-4 cursor-pointer" onClick={() => handlePlanSelect({ period: '3 Meses', price: '79,90', highlight: true })}>
                      <div className="absolute -top-4 bg-[#E50914] text-white font-['Plus_Jakarta_Sans'] font-extrabold text-[12px] px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
                        Economize 11%
                      </div>
                      <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[12px] text-[#ffb4aa] uppercase mb-4 mt-2 tracking-widest">3 Meses</span>
                      <div className="font-['Bebas_Neue'] text-[64px] md:text-[96px] leading-[90%] text-white mb-8 tracking-wide flex items-start text-shadow-sm">
                        <span className="text-3xl mr-1 mt-4 opacity-70 text-[#E50914]">R$</span>79,90
                      </div>
                      <ul className="text-center font-['Plus_Jakarta_Sans'] text-[16px] text-[#e2e2e2] space-y-4 mb-10 w-full">
                        <li>Acesso a todo o catálogo</li>
                        <li>Qualidade 4K HDR Atmos</li>
                        <li>Assista em até 4 telas simultâneas</li>
                        <li className="text-[#E50914] font-bold">Downloads ilimitados</li>
                      </ul>
                      <button className="w-full py-5 rounded-lg font-['Plus_Jakarta_Sans'] font-extrabold text-[12px] bg-[#E50914] text-white hover:scale-105 transition-transform duration-200 shadow-[0_4px_20px_rgba(229,9,20,0.4)] tracking-widest uppercase">
                        Escolher Plano Premium
                      </button>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#131313]/70 backdrop-blur-md rounded-xl p-8 flex flex-col items-center border border-[#5e3f3b]/30 hover:border-[#af8782] transition-colors duration-300">
                      <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[12px] text-[#e9bcb6] uppercase mb-4 tracking-widest">6 Meses</span>
                      <div className="font-['Bebas_Neue'] text-[48px] text-[#e2e2e2] mb-8 tracking-wide flex items-start">
                        <span className="text-2xl mr-1 mt-2 opacity-50">R$</span>149,90
                      </div>
                      <ul className="text-center font-['Plus_Jakarta_Sans'] text-[14px] text-[#e9bcb6] space-y-3 mb-8 w-full opacity-80">
                        <li>Acesso a todo o catálogo</li>
                        <li>Qualidade 4K Ultra HD</li>
                        <li>Assista em até 2 telas</li>
                      </ul>
                      <button onClick={() => handlePlanSelect({ period: '6 Meses', price: '149,90' })} className="w-full py-4 rounded-lg font-['Plus_Jakarta_Sans'] font-extrabold text-[12px] border border-[#e2e2e2] text-[#e2e2e2] hover:bg-white/5 transition-all duration-200 tracking-widest uppercase">
                        Assinar Agora
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Seção 3: Avaliações */}
              <section className="px-[5vw] py-[4rem] bg-[#1b1b1b] border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { n: "Marcelo Silva", t: "A qualidade de imagem é surreal. Parece que estou no cinema toda vez que ligo a TV. O plano de 3 meses vale muito a pena." },
                      { n: "Ana Clara S.", t: "Catálogo incrível, sempre atualizado com os melhores lançamentos. A interface escura não cansa os olhos à noite." },
                      { n: "Roberto Mendes", t: "Sem travamentos, mesmo no 4K. O som Dolby Atmos no plano principal faz toda a diferença para filmes de ação." },
                      { n: "Julia Nogueira", t: "Minha família inteira usa as 4 telas simultâneas do plano premium e nunca tivemos problemas. Recomendo de olhos fechados." }
                    ].map((review, i) => (
                      <div key={i} className="bg-[#131313] rounded-xl p-6 border border-white/5 flex flex-col h-full hover:bg-[#353535] transition-colors duration-300">
                        <div className="flex text-[#E50914] mb-4 gap-1">
                          {[1,2,3,4,5].map(star => <Star key={star} size={14} fill="currentColor" />)}
                        </div>
                        <p className="font-['Plus_Jakarta_Sans'] text-[14px] text-[#e2e2e2] flex-grow opacity-90 italic">"{review.t}"</p>
                        <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[12px] text-[#ffb4aa] uppercase mt-6 block tracking-widest">— {review.n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </main>
            
            {/* Footer */}
            <footer className="bg-black w-full py-12 px-[5%] border-t border-white/5">
              <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70">
                <div className="col-span-2 md:col-span-4 mb-4">
                  <span className="text-[#E50914] font-black text-2xl tracking-tighter font-['Bebas_Neue']">CINEPREMIUM</span>
                </div>
                <a className="font-sans text-xs uppercase tracking-widest text-gray-500 hover:underline transition-opacity duration-200 hover:text-white" href="#">Perguntas Frequentes</a>
                <a className="font-sans text-xs uppercase tracking-widest text-gray-500 hover:underline transition-opacity duration-200 hover:text-white" href="#">Central de Ajuda</a>
                <a className="font-sans text-xs uppercase tracking-widest text-gray-500 hover:underline transition-opacity duration-200 hover:text-white" href="#">Termos de Uso</a>
                <a className="font-sans text-xs uppercase tracking-widest text-gray-500 hover:underline transition-opacity duration-200 hover:text-white" href="#">Privacidade</a>
                <a className="font-sans text-xs uppercase tracking-widest text-gray-500 hover:underline transition-opacity duration-200 hover:text-white" href="#">Entre em Contato</a>
                <div className="col-span-2 md:col-span-4 mt-8">
                  <p className="font-sans text-xs tracking-widest text-gray-500">© 2024 CinePremium Brasil. Todos os direitos reservados.</p>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

        {/* FLUXO DE PAGAMENTO (CHECKOUT & PIX) */}
        {(step === 'checkout' || step === 'pix' || step === 'success') && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="min-h-screen pt-24 px-4 flex justify-center pb-20">
            <div className="max-w-md w-full">
              <button onClick={() => setStep('plans')} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Voltar aos planos
              </button>

              <div className="bg-[#131313] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                {step === 'checkout' && (
                  <form onSubmit={handleGeneratePix} className="space-y-6 relative z-10">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-black text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Ativar Plano {selectedPlan?.period}</h3>
                      <p className="text-gray-400 text-sm mt-1">Total a pagar: <span className="text-[#E50914] font-bold">R$ {selectedPlan?.price}</span></p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Email (Para receber o acesso)</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input 
                            type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="seu.email@gmail.com"
                            className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] outline-none transition-all placeholder:text-gray-700"
                          />
                        </div>
                        {formData.email && !isValidGmail(formData.email) && (
                          <p className="text-yellow-500 text-xs mt-1 flex items-center"><AlertCircle size={12} className="mr-1"/> Recomendamos usar @gmail.com</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">WhatsApp (Para suporte)</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input 
                            type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})}
                            placeholder="(00) 00000-0000" maxLength={15}
                            className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] outline-none transition-all placeholder:text-gray-700"
                          />
                        </div>
                      </div>
                    </div>

                    <button disabled={loading} className="w-full py-4 bg-[#E50914] hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors uppercase tracking-widest text-sm">
                      {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={20}/></motion.div> : 'Gerar Pix Copia e Cola'}
                    </button>
                    <p className="text-center text-xs text-gray-600 flex items-center justify-center gap-1"><ShieldCheck size={14}/> Pagamento 100% Seguro</p>
                  </form>
                )}

                {step === 'pix' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Pague via Pix</h3>
                      <p className="text-sm text-gray-400">Escaneie o QR Code ou copie o código abaixo para liberar seu acesso imediatamente.</p>
                    </div>

                    <div className="bg-white p-2 rounded-xl shadow-lg">
                      <img src={pixData.image} alt="QR Code Pix" className="w-48 h-48" />
                    </div>

                    <div className="w-full">
                      <button onClick={copyToClipboard} className="w-full relative bg-black border border-white/10 p-4 rounded-xl flex items-center justify-center gap-2 hover:border-white/30 transition-all group">
                        <span className="truncate text-gray-400 text-sm max-w-[200px]">{pixData.code}</span>
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-[#E50914] group-hover:scale-110 transition-transform" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-yellow-500 text-sm bg-yellow-500/10 px-4 py-2 rounded-lg">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Loader2 size={16} /></motion.div>
                      Aguardando confirmação...
                    </div>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center space-y-6 py-8">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">Pagamento Aprovado!</h3>
                      <p className="text-gray-400">Seus dados de acesso foram enviados para:<br/><strong className="text-white">{formData.email}</strong></p>
                    </div>
                    <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">
                      Voltar ao Início
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
