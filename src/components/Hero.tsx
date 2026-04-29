'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, Tv, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
    return (
        <section className="relative w-full py-6 md:py-12 px-4 md:px-8 bg-black">
            {/* Main Bento Container */}
            <div className="relative max-w-7xl mx-auto min-h-[600px] md:h-[80vh] bg-[#0f0f0f] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between">
                
                {/* Background Atmosphere */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-primary/10 via-transparent to-transparent opacity-50" />
                    <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-primary/5 blur-[120px] rounded-full" />
                </div>

                {/* Left Side: Content */}
                <div className="relative z-20 flex-1 p-8 md:p-16 flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
                    {/* Badge */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-8"
                    >
                        <Zap size={14} className="text-primary fill-primary" />
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-300">Experiência Premium</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-[32px] md:text-5xl lg:text-7xl font-black tracking-tighter leading-[1] font-[family-name:var(--font-inter)] mb-6"
                    >
                        DOMINE O <br />
                        <span className="text-primary">FUTEBOL</span> AO VIVO
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-[14px] md:text-lg text-gray-400 max-w-md mb-10 leading-relaxed"
                    >
                        Chega de travar na hora do gol. Tenha todos os campeonatos e o melhor do cinema em um só lugar.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                    >
                        <Link href="#pricing">
                            <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(229,9,20,0.3)]">
                                <span>Garantir meu acesso</span>
                                <ArrowRight size={18} />
                            </button>
                        </Link>
                    </motion.div>

                    {/* Features Bar - Reference style */}
                    <div className="mt-auto pt-12 hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Canais</p>
                                <p className="text-sm font-bold">Esportes 4K</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                                <Tv size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Catálogo</p>
                                <p className="text-sm font-bold">100k+ VOD</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center: Image */}
                <div className="relative z-10 flex-1 w-full h-[300px] md:h-full order-1 md:order-2">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full h-full flex items-center justify-center"
                    >
                        {/* Circle Background */}
                        <div className="absolute w-[80%] h-[80%] bg-primary/20 rounded-full blur-[100px]" />
                        
                        <div className="relative w-full h-full max-h-[80%] mt-8">
                            <Image
                                src="/images/hero/hero_red.png"
                                alt="Futebol Player"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </motion.div>

                    {/* Floating Info Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="absolute bottom-8 right-8 md:bottom-20 md:right-16 bg-white/10 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] border border-white/20 shadow-2xl flex items-center gap-4 z-30"
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl md:text-2xl font-black">
                            4K
                        </div>
                        <div>
                            <p className="text-xs md:text-sm font-bold text-white leading-tight">Ultra High<br />Definition</p>
                            <p className="text-[10px] text-gray-400 mt-1">Sinal sem delay</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;