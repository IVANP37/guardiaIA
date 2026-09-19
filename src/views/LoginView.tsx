import { motion } from 'motion/react';
import { Activity, ShieldAlert, Mail, Lock, Check } from 'lucide-react';
import { mockTenant } from '../data/mockData';

export function LoginView({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* Background Grid & Accents */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 z-10 items-center">
        
        {/* Left Column: Value Proposition */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col max-w-lg mt-12 lg:mt-0"
        >
          <div className="flex items-center gap-4 mb-8 lg:mb-12">
            <div className="w-12 h-12 bg-slate-900 border border-slate-700/50 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">GuardIA</h1>
              <p className="text-slate-400 text-xs uppercase tracking-widest mt-0.5">Simulador Inteligente de Guardia Clínica</p>
            </div>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-6 lg:mb-8">
            Entrá de guardia.<br />
            Entrevistá al paciente.<br />
            Decidí.
          </h2>

          <p className="text-slate-400 text-base lg:text-lg mb-8 lg:mb-10 leading-relaxed lg:pr-8">
            GuardIA reproduce la presión y el razonamiento de una guardia hospitalaria real. El paciente virtual no te entrega la información: tenés que descubrirla.
          </p>

          <ul className="space-y-4 lg:space-y-5">
            {[
              "Pacientes que responden como personas, no como fichas clínicas",
              "Estado clínico que evoluciona con el tiempo y con tus decisiones",
              "Evaluación y feedback detallado al finalizar cada caso"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                <span className="text-slate-300 text-sm lg:text-base">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right Column: Login Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          className="w-full max-w-[480px] mx-auto lg:ml-auto pb-12 lg:pb-0"
        >
          <div className="bg-[#0B101A]/80 backdrop-blur-xl border border-slate-800/80 rounded-[32px] p-8 lg:p-10 shadow-2xl">
            
            <div className="mb-8 lg:mb-10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{mockTenant.name}</p>
              <h3 className="text-xl lg:text-2xl font-bold text-white">Ingresar a la plataforma</h3>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-5 lg:space-y-6">
              
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 block">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    defaultValue="dr.lopez@hospitalvirtual.edu"
                    className="w-full bg-[#05070A] border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-600"
                    placeholder="tu@hospital.com"
                    required
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 block">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    defaultValue="password123"
                    className="w-full bg-[#05070A] border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-600 tracking-widest"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center border-none">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Recordarme</span>
                </label>
                
                <button type="button" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#4F75FF] hover:bg-[#4F75FF]/90 text-white font-bold rounded-xl px-4 py-4 mt-8 transition-colors shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
              >
                Ingresar
              </button>

            </form>

            {/* Footer */}
            <div className="mt-8 lg:mt-10 pt-6 lg:pt-8 border-t border-slate-800/50 flex gap-4">
              <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Plataforma de simulación clínica educativa. No apta para diagnóstico ni tratamiento de pacientes reales.
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {mockTenant.name} · Desarrollado por GuardIA
                </p>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
