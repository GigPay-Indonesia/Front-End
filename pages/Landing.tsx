import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowRight, ShieldCheck, TrendingUp, Clock, Zap, Wallet, BarChart3, Lock } from 'lucide-react';
import ChromaGrid from '../components/ChromaGrid';
import BlurText from '../components/BlurText';
import DecryptedText from '../components/DecryptedText';
import { motion } from 'framer-motion';

import PixelBlast from '../components/PixelBlast';
import SpotlightCard from '../components/SpotlightCard';
import { IconTreasury, IconEscrow, IconIncentives, IconTrustless } from '../components/AboutIcons';

interface LandingProps {
  onConnect: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onConnect }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col w-full overflow-hidden relative">

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 bg-[#050505]">
        <PixelBlast color="#3c00ff" />
      </div>

      {/* HERO SECTION */}
      <section id="home" className="relative z-10 pt-32 pb-40 lg:pt-48 lg:pb-52 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">



          <div className="text-6xl md:text-8xl font-bold font-display tracking-tighter text-white mb-8 leading-[1.1] pointer-events-auto">
            <BlurText
              text="Freelance with"
              delay={150}
              animateBy="words"
              direction="top"
              className="inline-block justify-center mb-0"
            />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              <DecryptedText
                text="Compound Yield."
                animateOn="view"
                revealDirection="center"
                speed={70}
                maxIterations={20}
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
                encryptedClassName="text-slate-600"
              />
            </span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed pointer-events-auto"
          >
            The architecture that turns idle funds into productive treasury flow.
            Teams maintain liquidity buffers while vendors are paid on schedule.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 1 }}
            className="flex flex-col sm:flex-row justify-center gap-5 pointer-events-auto"
          >
            <div className="rounded-full p-[1px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative group overflow-hidden">
              <div className="absolute inset-0 bg-white/20 blur-lg group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
              <Button
                onClick={() => navigate('/login')}
                className="relative z-10 bg-blue-600 text-white px-8 py-3.5 text-base rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 font-bold font-display tracking-wide flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] border border-blue-400/20 uppercase"
              >
                LAUNCH APP
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <Button size="lg" variant="secondary" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full px-10">
              Explore Architecture
            </Button>
          </motion.div>

          {/* Entity Showcase using ChromaGrid */}
          <div className="mt-24 h-[600px] w-full relative pointer-events-auto">
            <ChromaGrid
              items={[
                {
                  image: '/avatars/alex.png',
                  title: 'Nusa Creative Studio',
                  subtitle: 'Agency Partner',
                  handle: '+$1,240.50 Yield',
                  borderColor: '#3B82F6',
                  gradient: 'linear-gradient(145deg, #3B82F6, #000)'
                },
                {
                  image: '/avatars/sarah.png',
                  title: 'PT SatuTek',
                  subtitle: 'Hardware Vendor',
                  handle: '+$850.20 Yield',
                  borderColor: '#EC4899',
                  gradient: 'linear-gradient(145deg, #EC4899, #000)'
                },
                {
                  image: '/avatars/mike.png',
                  title: 'Karsa Logistics',
                  subtitle: 'Distribution Partner',
                  handle: '+$540.00 Yield',
                  borderColor: '#F59E0B',
                  gradient: 'linear-gradient(145deg, #F59E0B, #000)'
                },
                {
                  image: '/avatars/elena.png',
                  title: 'Vista Media',
                  subtitle: 'Marketing Vendor',
                  handle: '+$2,100.75 Yield',
                  borderColor: '#10B981',
                  gradient: 'linear-gradient(145deg, #10B981, #000)'
                },
                {
                  image: '/avatars/david.png',
                  title: 'Ritma Finance',
                  subtitle: 'Operations Partner',
                  handle: '+$1,890.30 Yield',
                  borderColor: '#8B5CF6',
                  gradient: 'linear-gradient(145deg, #8B5CF6, #000)'
                }
              ]}
            />
          </div>
        </div>
      </section>


      {/* BENTO GRID FEATURES */}
      <section id="about" className="py-24 relative z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Large Card */}
            <SpotlightCard className="md:col-span-2 p-10 group pointer-events-auto">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <IconTreasury className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-3xl font-bold font-display mb-4 text-white">Treasury Management</h3>
                <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                  We don't just hold funds. We optimize them. Idle capital in the Treasury Zone automatically routes to low-risk strategies to generate <span className="text-blue-400 font-semibold">~4-5% APY</span> while maintaining a liquid buffer.
                </p>
              </div>
            </SpotlightCard>

            {/* Tall Card */}
            <SpotlightCard className="md:row-span-2 p-10 flex flex-col justify-between group pointer-events-auto">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-6 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <IconEscrow className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold font-display mb-4 text-white">Smart Escrow</h3>
                <p className="text-slate-300 leading-relaxed">
                  Funds are reserved in escrow. If a dispute arises or review takes {'>'}24h, the escrow activates "Yield Mode" to offset delays.
                </p>
              </div>
              <div className="mt-10 p-4 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-slate-400 font-medium">Contract Status</span>
                  <span className="text-blue-400 flex items-center font-bold"><Zap size={14} className="mr-1 fill-blue-400" /> Yielding</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-blue-600 to-indigo-400 animate-pulse"></div>
                </div>
              </div>
            </SpotlightCard>

            {/* Small Card 1 */}
            <SpotlightCard className="p-8 group pointer-events-auto">
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-white mb-4 border border-white/10">
                <IconIncentives className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold font-display mb-2 text-white">Fair Incentives</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Yield generated during disputes is shared, aligning incentives for faster resolution.</p>
            </SpotlightCard>

            {/* Small Card 2 */}
            <SpotlightCard className="p-8 group pointer-events-auto">
              <div className="w-14 h-14 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 mb-4 border border-blue-600/20">
                <IconTrustless className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-xl font-bold font-display mb-2 text-white">Trustless</h4>
              <p className="text-slate-400 text-sm leading-relaxed">No middleman holding your cash. Just code, liquidity pools, and math.</p>
            </SpotlightCard>

          </div>
        </div>
      </section>

      {/* ARCHITECTURE VISUALIZER */}
      <section id="how-it-works" className="py-24 relative z-10 border-t border-white/5 bg-[#050505]/50 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 pointer-events-auto">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-6">The 3-Zone Architecture</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Funds move through three distinct states to maximize capital efficiency.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 pointer-events-auto">
            {[
              {
                id: 1,
                title: "Treasury Zone",
                status: "Yield Active",
                desc: "Idle company funds sit here. Generating yield via low-risk strategies.",
                color: "blue"
              },
              {
                id: 2,
                title: "Liquid Escrow",
                status: "Liquid (No Yield)",
                desc: "Funds move here when work starts. Kept liquid for instant payments.",
                color: "indigo"
              },
              {
                id: 3,
                title: "Yield Escrow",
                status: "Dispute Yield",
                desc: "Activates during delays. The escrow generates yield to compensate time.",
                color: "purple"
              }
            ].map((zone, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute inset-0 bg-${zone.color}-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative h-full glass-card p-8 rounded-2xl border-t-2 border-t-white/10 hover:border-t-white/30 transition-all">
                  <div className="text-6xl font-display font-bold text-white/5 absolute top-4 right-4">{zone.id}</div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 bg-${zone.color}-500/10 text-${zone.color}-400 border border-${zone.color}-500/20`}>
                    {zone.status}
                  </div>
                  <h3 className="text-2xl font-bold font-display mb-3">{zone.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {zone.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative z-10 pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="relative pointer-events-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-[100px] opacity-20"></div>
            <h2 className="text-4xl md:text-6xl font-bold font-display mb-8 relative z-10">
              Ready to maximize your <br /> capital efficiency?
            </h2>
            <Button size="lg" variant="glow" onClick={() => navigate('/login')} className="relative z-10 px-12 py-4 text-lg rounded-full">
              Launch App
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};