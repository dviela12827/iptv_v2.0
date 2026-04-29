'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Testimonials from '@/components/Testimonials';
import Plans from '@/components/Plans';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';


export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Hero />
      </motion.div>



      <section className="py-24 bg-black relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 md:px-12 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
            A MAIOR <span className="text-primary">GRADE</span> DO BRASIL
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-16">
            Não é apenas sobre ter canais. É sobre ter <span className="text-white font-bold">todos os canais</span>, filmes e séries em uma única interface premium.
          </p>

          {/* New Catalog Showcase (Placeholder for Hybrid Section) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Futebol Card */}
            <div className="group relative h-[400px] rounded-[3rem] overflow-hidden border border-white/5 bg-[#0a0a0a]">
               <Image 
                src="https://i.imgur.com/KzbghZn.png" 
                alt="Futebol" 
                fill 
                className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
               <div className="absolute bottom-10 left-10 text-left">
                  <h3 className="text-3xl font-black text-white">ESPORTES</h3>
                  <p className="text-gray-400 text-sm mt-2">Campeonatos nacionais e internacionais ao vivo.</p>
               </div>
            </div>

            {/* Movies Card */}
            <div className="group relative h-[400px] rounded-[3rem] overflow-hidden border border-white/5 bg-[#0a0a0a]">
               <Image 
                src="https://i.imgur.com/o5aFK6U.png" 
                alt="Cinema" 
                fill 
                className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
               <div className="absolute bottom-10 left-10 text-left">
                  <h3 className="text-3xl font-black text-white">CINEMA</h3>
                  <p className="text-gray-400 text-sm mt-2">Lançamentos que acabaram de sair das telas.</p>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Testimonials />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <Plans />
      </motion.div>

      <FAQ />
      <Footer />

      <WhatsAppButton />
    </main>
  );
}
