'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Star, Clock, ShieldCheck, 
  Zap, Phone, Mail, QrCode, ArrowLeft,
  X, AlertCircle, Copy, Check, Loader2
} from 'lucide-react';
import axios from 'axios';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot, query, where, limit, updateDoc } from 'firebase/firestore';

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
    <div className="min-h-screen bg-[#0e0e0e] text-[#e2e2e2] font-sans selection:bg-[#E50914] selection:text-white pb-24 md:pb-0">
      
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 to-transparent pb-6 pt-4 px-4 md:px-12 flex justify-center md:justify-between items-center backdrop-blur-sm">
        <h1 className="text-3xl md:text-4xl font-black text-[#E50914] tracking-tighter" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>CINEPREMIUM</h1>
        <div className="hidden md:flex gap-8 text-sm font-bold tracking-widest uppercase opacity-70">
          <span className="hover:text-white cursor-pointer">Início</span>
          <span className="hover:text-white cursor-pointer">Catálogo</span>
          <span className="hover:text-white cursor-pointer">Depoimentos</span>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {step === 'plans' && (
          <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            {/* HERO SECTION - ORBITING ICONS */}
            <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden bg-[#131313]">
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#131313]/80 to-[#0e0e0e] z-10" />
              
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E50914]/10 rounded-full blur-[120px] pointer-events-none" />

              {/* Orbiting Circles System */}
              <div className="relative z-20 w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
                
                {/* Texto Central */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="text-center z-30 pointer-events-none"
                >
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter shadow-black drop-shadow-2xl" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                    O UNIVERSO DO ENTRETENIMENTO<br />
                    <span className="text-[#E50914]">EM UM SÓ LUGAR</span>
                  </h2>
                  <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base">
                    Filmes de cinema, séries exclusivas e canais ao vivo sem travamentos.
                  </p>
                </motion.div>

                {/* Órbitas e Ícones Flutuantes */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-40 md:opacity-100">
                  <OrbitingLogo src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" delay={0} duration={25} radius={220} size={50} />
                  <OrbitingLogo src="https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg" delay={12.5} duration={25} radius={220} size={60} />
                  
                  <OrbitingLogo src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" delay={0} duration={35} radius={320} size={70} />
                  <OrbitingLogo src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/2560px-Amazon_Prime_Video_logo.svg.png" delay={17.5} duration={35} radius={320} size={60} />
                  
                  <OrbitingLogo src="https://logospng.org/download/premiere/logo-premiere-escudo-256.png" delay={5} duration={45} radius={420} size={50} />
                  <OrbitingLogo src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Apple_TV_Plus_Logo.svg/2560px-Apple_TV_Plus_Logo.svg.png" delay={27.5} duration={45} radius={420} size={60} />
                </div>
              </div>
            </section>

            {/* SEÇÃO COMPARATIVO CHOCANTE */}
            <section className="py-20 px-4 max-w-5xl mx-auto relative z-20">
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-stretch justify-center">
                
                {/* Bloco Ruim */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className="flex-1 bg-[#1a1a1a] rounded-2xl p-8 border border-white/5 opacity-60 grayscale filter flex flex-col items-center justify-center text-center"
                >
                  <p className="text-gray-400 font-bold tracking-widest uppercase text-sm mb-4">Maneira Antiga</p>
                  <div className="flex gap-4 justify-center items-center mb-6 opacity-50">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" className="h-6 object-contain" />
                    <span className="text-2xl font-bold">+</span>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg" className="h-5 object-contain" />
                    <span className="text-2xl font-bold">+</span>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" className="h-8 object-contain" />
                  </div>
                  <p className="text-4xl font-black text-gray-500 line-through decoration-red-500/50">R$ 180,00<span className="text-sm font-normal">/mês</span></p>
                  <p className="text-xs text-gray-500 mt-4">Vários apps, assinaturas caras, catálogo dividido.</p>
                </motion.div>

                {/* VS Badge */}
                <div className="flex items-center justify-center -my-10 md:my-0 md:-mx-10 z-10">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-black text-xl border border-white/10 shadow-xl">VS</div>
                </div>

                {/* Bloco Bom */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className="flex-1 bg-gradient-to-br from-[#E50914]/20 to-black rounded-2xl p-8 border border-[#E50914]/30 shadow-[0_0_40px_rgba(229,9,20,0.1)] flex flex-col items-center justify-center text-center"
                >
                  <p className="text-[#E50914] font-black tracking-widest uppercase text-sm mb-4">CinePremium</p>
                  <div className="mb-6">
                    <h3 className="text-3xl font-black text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>TUDO LIBERADO</h3>
                    <p className="text-sm text-gray-300">Em um único aplicativo</p>
                  </div>
                  <p className="text-5xl font-black text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}><span className="text-2xl text-[#E50914] mr-1">R$</span>29,90</p>
                  <p className="text-xs text-green-400 font-bold mt-4">+ Economia de R$ 150 por mês</p>
                </motion.div>

              </div>
            </section>

            {/* SEÇÃO PRICING */}
            <section className="px-4 py-16 relative z-20">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-center text-3xl md:text-4xl font-bold mb-12" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '1px' }}>Escolha seu plano</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  {plans.map((plan, i) => (
                    <motion.div 
                      key={plan.period}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className={`relative rounded-2xl p-8 flex flex-col items-center cursor-pointer transition-all duration-300 ${plan.highlight ? 'bg-[#1f1f1f] border-2 border-[#E50914] shadow-[0_0_40px_rgba(229,9,20,0.2)] md:-translate-y-4' : 'bg-black/50 border border-white/10 hover:border-white/30 backdrop-blur-xl'}`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {plan.save && (
                        <div className="absolute -top-4 bg-[#E50914] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                          {plan.save}
                        </div>
                      )}
                      <span className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4 mt-2">{plan.period}</span>
                      <div className="text-5xl font-black text-white mb-6" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        <span className={`text-2xl mr-1 align-top block mt-2 opacity-70 ${plan.highlight ? 'text-[#E50914]' : 'text-gray-500'}`}>R$</span>
                        {plan.price}
                      </div>
                      <ul className="text-center text-sm text-gray-300 space-y-3 mb-8 w-full">
                        <li>Acesso a todo o catálogo</li>
                        <li>Qualidade 4K HDR</li>
                        {plan.highlight ? (
                          <>
                            <li>Assista em até 4 telas</li>
                            <li className="text-[#E50914] font-bold">Downloads ilimitados</li>
                          </>
                        ) : (
                          <li>Assista em {plan.period === '1 Mês' ? '1 tela' : 'até 2 telas'}</li>
                        )}
                      </ul>
                      <button className={`w-full py-4 rounded-lg font-bold tracking-widest uppercase text-xs transition-transform hover:scale-105 ${plan.highlight ? 'bg-[#E50914] text-white' : 'border border-white/20 text-white hover:bg-white/5'}`}>
                        {plan.highlight ? 'Escolher Premium' : 'Assinar Agora'}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* SEÇÃO PROVA SOCIAL */}
            <section className="px-4 py-20 bg-[#0a0a0a] border-t border-white/5">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { n: "Marcelo Silva", t: "A qualidade de imagem é surreal. Parece cinema. O plano de 3 meses vale muito a pena." },
                    { n: "Ana Clara S.", t: "Catálogo incrível, sempre atualizado com lançamentos. A interface escura não cansa os olhos." },
                    { n: "Roberto Mendes", t: "Sem travamentos, mesmo no 4K. O som Dolby Atmos faz toda a diferença para filmes." },
                    { n: "Julia Nogueira", t: "Minha família usa as 4 telas simultâneas do plano premium e nunca tivemos problemas." }
                  ].map((review, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-[#131313] rounded-xl p-6 border border-white/5 flex flex-col">
                      <div className="flex text-[#E50914] mb-4 gap-1">
                        {[1,2,3,4,5].map(star => <Star key={star} size={14} fill="currentColor" />)}
                      </div>
                      <p className="text-gray-400 text-sm italic flex-grow">"{review.t}"</p>
                      <span className="text-[#E50914] text-xs font-bold uppercase tracking-widest mt-6">— {review.n}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
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
