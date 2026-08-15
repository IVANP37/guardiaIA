import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { demoCase, demoPediatricCase } from '../data/mockData';
import { ClinicalCase } from '../types';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  Droplets,
  Mic,
  Send,
  Stethoscope,
  TestTube,
  Pill,
  ClipboardList,
  PhoneCall,
  Clock,
  AlertTriangle,
  Users,
  Brain,
  Eye
} from 'lucide-react';
import clsx from 'clsx';

type Tab = 'interview' | 'notes' | 'evolution';

interface Message {
  id: string;
  sender: 'doctor' | 'patient' | 'companion' | 'system';
  text: string;
}

import { DebriefPanel } from '../components/DebriefPanel';
import { generatePatientResponse } from '../services/ollamaService';

import { ResolvedSimulation } from "../types";

export function SimulatorView({ onFinish, activeCase = demoCase, resolvedSimulation }: { onFinish: () => void, activeCase?: ClinicalCase, resolvedSimulation?: ResolvedSimulation }) {
  const currentCase = resolvedSimulation?.baseCase || activeCase;
  const initialVitals = resolvedSimulation?.initialVitalsOverride || currentCase.patient.initialVitals;
  const assistanceLevel = resolvedSimulation?.assistanceLevel || 'MEDIUM';
  const showHints = assistanceLevel === 'HIGH' || assistanceLevel === 'MEDIUM';

  const [activeTab, setActiveTab] = useState<Tab>('interview');
  const [interlocutor, setInterlocutor] = useState<'patient' | 'companion'>('patient');
  
  // App Phase State
  const [simulationStatus, setSimulationStatus] = useState<'ACTIVE' | 'ANALYZING' | 'DEBRIEF'>('ACTIVE');

  
  // Initialize messages based on case
  const initialMessageText = currentCase.patient.companion 
    ? 'Doctor, desde anoche tiene fiebre y está muy decaída. Hoy casi no quiso tomar la leche y me preocupa porque normalmente come bien.'
    : 'Hola doctor... vine porque desde esta mañana tengo un dolor acá en el pecho. Al principio pensé que era muscular, pero ahora siento que se hizo más fuerte y me empezó a faltar un poco el aire.';
    
  const initialSender = currentCase.patient.companion ? 'companion' : 'patient';

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: initialSender, text: initialMessageText }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [patientStatus, setPatientStatus] = useState<'Estable' | 'Observación' | 'Moderado' | 'Grave' | 'Crítico'>('Moderado');
  
  // Dynamic Vitals & Monitor State
  const [monitorState, setMonitorState] = useState<'IDLE' | 'CONNECTING' | 'ACTIVE'>('IDLE');
  const [clinicalPhase, setClinicalPhase] = useState<number>(0);
  
  const [currentVitals, setCurrentVitals] = useState({
    hr: currentCase.patient.initialVitals.hr,
    bp_sys: currentCase.patient.initialVitals.bp_sys,
    bp_dia: currentCase.patient.initialVitals.bp_dia,
    spo2: currentCase.patient.initialVitals.spo2,
    temp: currentCase.patient.initialVitals.temp,
    rr: currentCase.patient.initialVitals.rr || 16
  });
  
  const [targetVitals, setTargetVitals] = useState({ ...currentVitals });
  const [activeActions, setActiveActions] = useState<{ id: string; name: string; status: 'PENDING' | 'COMPLETED'; timestamp: number }[]>([]);
  
  const executeAction = (actionId: string, label: string, durationMs: number = 3000, effect?: () => void) => {
    const uniqueId = actionId + Date.now();
    setActiveActions(prev => [...prev, { id: uniqueId, name: label, status: 'PENDING', timestamp: Date.now() }]);
    
    // Add a system log immediately
    setMessages(prev => [...prev, { 
      id: Date.now().toString() + 'sys', 
      sender: 'system', 
      text: `[ACCIÓN EN CURSO] ${label}` 
    }]);

    setTimeout(() => {
      setActiveActions(prev => prev.map(a => a.id === uniqueId ? { ...a, status: 'COMPLETED' } : a));
      if (effect) effect();
    }, durationMs);
  };

  // Clinical Engine: Vitals Jitter & Drifting
  useEffect(() => {
    if (monitorState !== 'ACTIVE') return;

    const interval = setInterval(() => {
      setCurrentVitals(prev => {
        const multiplier = resolvedSimulation?.deteriorationMultiplier || 1.0;
        const move = (current: number, target: number, step: number) => {
          step = step * multiplier;
          if (current < target) return Math.min(current + step, target);
          if (current > target) return Math.max(current - step, target);
          return current;
        };
        const jitter = (val: number, maxJitter: number) => val + Math.floor(Math.random() * (maxJitter * 2 + 1)) - maxJitter;

        return {
          ...prev,
          hr: jitter(move(prev.hr, targetVitals.hr, 2), 1),
          spo2: Math.min(100, jitter(move(prev.spo2, targetVitals.spo2, 1), 1)),
          rr: jitter(move(prev.rr, targetVitals.rr, 1), 1),
          bp_sys: jitter(move(prev.bp_sys, targetVitals.bp_sys, 2), 2),
          bp_dia: jitter(move(prev.bp_dia, targetVitals.bp_dia, 1), 1)
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [monitorState, targetVitals]);

  // Auto-Trigger Deterioration & Adaptive Help
  useEffect(() => {
    const doctorMsgs = messages.filter(m => m.sender === 'doctor');
    // Deteriorate the main case after 2 messages
    const triggerMsgs = (resolvedSimulation?.deteriorationMultiplier || 1.0) > 1.5 ? 1 : 3;
    if (doctorMsgs.length >= triggerMsgs && clinicalPhase === 0 && !currentCase.patient.companion) {
      setClinicalPhase(1);
      
      setTargetVitals(prev => ({
        ...prev,
        hr: 132,
        spo2: 89,
        bp_sys: 88,
        bp_dia: 52,
        rr: 28
      }));

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'patient',
          text: 'Doctor... espere... me está doliendo mucho más el pecho... me falta el aire, me siento mareado...',
        }]);
      }, 4000);
    }
    
    // Adaptive Help System
    let helpTimer: NodeJS.Timeout;
    if (clinicalPhase === 1 && showHints) {
      helpTimer = setTimeout(() => {
         setMessages(prev => [...prev, {
           id: Date.now().toString() + 'help',
           sender: 'system',
           text: '⚠️ AYUDA ADAPTATIVA: El paciente se está deteriorando. Considerá evaluar sus signos vitales (Monitor), administrar oxígeno y tratamiento específico (Aspirina/Nitroglicerina).'
         }]);
      }, 25000); // Give them 25 seconds to react before showing help
    }
    
    return () => clearTimeout(helpTimer);
  }, [messages, clinicalPhase, currentCase, showHints]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `00:${m}:${s}`;
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

    const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMsg = inputValue.trim();
    const newUserMessage: Message = { id: Date.now().toString(), sender: 'doctor', text: userMsg };
    
    // Convert existing messages to Ollama format
    const chatHistory = messages
      .filter(m => m.sender !== 'system')
      .map(m => ({
        role: (m.sender === 'doctor' ? 'user' : 'assistant'),
        content: m.text
      }));

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);
    
    const responder = (currentCase.patient.companion && interlocutor === 'companion') ? 'companion' : 'patient';

    try {
      // Intentamos con Ollama primero
      const ollamaResponse = await generatePatientResponse(
        userMsg, 
        chatHistory,
        resolvedSimulation || null
      );
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: responder, 
        text: ollamaResponse 
      }]);
    } catch (error) {
      // Fallback a lógica simulada si Ollama falla
      setTimeout(() => {
        let responseText = currentCase.patient.companion ? "No sabría decirle exactamente doctor, pero la veo decaída." : "No estoy seguro, doctor.";
        
        const lowerMsg = userMsg.toLowerCase();
        
        if (currentCase.patient.companion) {
          if (lowerMsg.includes('fiebre') || lowerMsg.includes('temperatura')) {
            responseText = "Le tomé a la noche y tenía 39. Le di paracetamol pero no le bajó mucho.";
          } else if (lowerMsg.includes('pañales') || lowerMsg.includes('pis')) {
            responseText = "Mojó dos pañales en todo el día, mucho menos de lo normal.";
          }
        } else {
          if (lowerMsg.includes('dónde') || lowerMsg.includes('donde') || lowerMsg.includes('lugar')) {
            responseText = "Acá en el centro del pecho, y siento como que se me va un poco hacia el brazo izquierdo y el cuello.";
          } else if (lowerMsg.includes('cuándo') || lowerMsg.includes('cuando') || lowerMsg.includes('tiempo') || lowerMsg.includes('hora')) {
            responseText = "Empezó hoy a la mañana, tipo 7 de la mañana. Me despertó el dolor.";
          } else if (lowerMsg.includes('como es') || lowerMsg.includes('cómo es') || lowerMsg.includes('tipo') || lowerMsg.includes('puntada') || lowerMsg.includes('opresion') || lowerMsg.includes('opresión')) {
            responseText = "Es como un peso, como si me estuvieran aplastando el pecho. Muy opresivo.";
          } else if (lowerMsg.includes('antecedentes') || lowerMsg.includes('enfermedades') || lowerMsg.includes('presión') || lowerMsg.includes('hipertenso') || lowerMsg.includes('diabetico')) {
            responseText = "Sí, soy hipertenso hace 5 años, tomo losartán pero a veces me olvido. Y mi papá tuvo un infarto a los 60 años.";
          } else if (lowerMsg.includes('irradia') || lowerMsg.includes('brazo') || lowerMsg.includes('mandibula') || lowerMsg.includes('cuello') || lowerMsg.includes('espalda')) {
            responseText = "Siento que se me va para el brazo izquierdo y un poco al cuello.";
          } else if (lowerMsg.includes('nausea') || lowerMsg.includes('vómito') || lowerMsg.includes('vomito') || lowerMsg.includes('mareo') || lowerMsg.includes('sudor') || lowerMsg.includes('transpiracion')) {
            responseText = "Me siento un poco mareado y transpiré frío hace un rato.";
          } else if (lowerMsg.includes('alergia') || lowerMsg.includes('alérgico') || lowerMsg.includes('alergico')) {
            responseText = "No, no soy alérgico a nada que yo sepa.";
          } else if (lowerMsg.includes('fuma') || lowerMsg.includes('cigarro') || lowerMsg.includes('tabaco')) {
            responseText = "Sí, fumo un atado por día desde los 20 años.";
          }
        }
        
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          sender: responder, 
          text: responseText 
        }]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFinishSimulation = () => {
    setSimulationStatus('ANALYZING');
    setTimeout(() => {
      setSimulationStatus('DEBRIEF');
    }, 3000);
  };

  if (simulationStatus === 'ANALYZING') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#05070A] h-screen w-full">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Analizando tu actuación clínica...</h2>
        <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Compilando Timeline & GuardIA Mentor</p>
      </div>
    );
  }

  if (simulationStatus === 'DEBRIEF') {
    return (
      <div className="h-screen w-full bg-[#05070A] flex flex-col overflow-hidden">
         <header className="h-14 border-b border-slate-800 flex items-center px-4 bg-[#080C14] shrink-0 z-20">
           <button onClick={onFinish} className="text-slate-400 hover:text-white transition-colors text-sm">
             ← Salir al Dashboard
           </button>
         </header>
         <div className="flex-1 overflow-hidden">
           <DebriefPanel resolvedSimulation={resolvedSimulation} onRetry={() => {
              setSimulationStatus('ACTIVE');
              setMessages([{ id: '1', sender: initialSender, text: initialMessageText }]);
              setTimeElapsed(0);
              setClinicalPhase(0);
              setMonitorState('IDLE');
              setCurrentVitals(currentCase.patient.initialVitals);
              setTargetVitals(currentCase.patient.initialVitals);
              setActiveActions([]);
           }} />
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#05070A] text-slate-200 font-sans overflow-hidden">
      
      {/* Header bar */}
      <header className="h-auto min-h-[3.5rem] py-2 lg:py-0 bg-[#080C14] border-b border-slate-800 flex flex-wrap lg:flex-nowrap items-center justify-between px-4 lg:px-6 flex-shrink-0 gap-2 lg:gap-0">
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shrink-0">G</div>
            <span className="text-xl font-semibold tracking-tight text-white hidden sm:inline">Guard<span className="text-indigo-400">IA</span></span>
          </div>
          <div className="h-6 w-px bg-slate-700 mx-1 lg:mx-2 hidden sm:block" />
          <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
            <span className="hidden sm:inline uppercase tracking-widest text-slate-400">Tenant:</span>
            <span className="font-medium text-slate-300 truncate max-w-[120px] sm:max-w-none">{currentCase.specialty}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 lg:gap-6 ml-auto">
          <div className="flex flex-col items-end hidden sm:flex">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              TIEMPO DE GUARDIA: {formatTime(timeElapsed)}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-tighter hidden md:block">Simulación en curso • Nivel Residente</div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 sm:hidden">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {formatTime(timeElapsed)}
          </div>
          <button 
            onClick={handleFinishSimulation}
            className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-900/50 px-3 lg:px-4 py-1.5 rounded text-[10px] lg:text-xs font-bold transition-all uppercase tracking-wider whitespace-nowrap shrink-0"
          >
            Finalizar<span className="hidden sm:inline"> Caso</span>
          </button>
        </div>
      </header>

      {/* Main content layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* CENTER PANEL: Clinical Scene Renderer & Conversation */}
        <section className="flex-1 flex flex-col relative bg-black min-w-[300px]">
          <style>{`
            @keyframes slide-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-ecg-slide { animation: slide-left 2.5s linear infinite; }
            .animate-spo2-slide { animation: slide-left 3.5s linear infinite; }
          `}</style>
          
          {/* The 3D window background (using AI image for now) */}
          <img 
            src={currentCase.sceneUrl || currentCase.patient.avatarUrl} 
            alt="Clinical Scene" 
            className={clsx(
              "absolute inset-0 w-full h-full object-cover mix-blend-luminosity transition-all duration-1000",
              clinicalPhase === 3 ? "saturate-0 contrast-150 brightness-75 sepia-[.3] opacity-60" :
              clinicalPhase === 1 ? "saturate-50 contrast-125 brightness-90 sepia-[.2] opacity-70" : 
              clinicalPhase === 2 ? "saturate-75 brightness-95 opacity-80" : "opacity-80"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-[#05070A]/30"></div>
          
          {/* Scene Overlays */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-slate-700/50 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-[10px] font-mono text-slate-300 tracking-wider">CLINICAL_SCENE_RENDERER: READY</span>
            </div>
            <div className={clsx(
              "bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border text-[10px] font-mono tracking-wider transition-colors duration-500",
              clinicalPhase === 0 ? "border-slate-700/50 text-amber-300" : 
              clinicalPhase === 3 ? "border-red-600/80 text-red-500 animate-bounce" :
              clinicalPhase === 1 ? "border-red-500/50 text-red-400 animate-pulse" : "border-indigo-500/50 text-indigo-300"
            )}>
               STATE: {clinicalPhase === 0 ? currentCase.patient.initialState : clinicalPhase === 1 ? 'CRITICAL_DETERIORATION' : clinicalPhase === 3 ? 'HYPOTENSIVE_SHOCK' : 'RECOVERY_PHASE'}
            </div>
            {currentCase.patient.companion && (
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-slate-700/50 text-[10px] font-mono text-indigo-300 tracking-wider">
                 DETECTED_ACTORS: 2 (Patient, {currentCase.patient.companion.role})
              </div>
            )}
          </div>

          {/* Multiparametric Monitor & Quick Actions (Floating Right) */}
          <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-4">
            
            {/* Monitor Connecting State */}
            {monitorState === 'CONNECTING' && (
              <div className="w-64 bg-black/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-2xl flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-xs text-indigo-300 font-mono animate-pulse">Conectando monitor...</p>
                <p className="text-[10px] text-slate-500 font-mono">Calibrando sensores multiparamétricos</p>
              </div>
            )}

            {/* Active Monitor */}
            {monitorState === 'ACTIVE' && (
              <div className="w-72 bg-[#05070A]/95 backdrop-blur-xl border border-slate-800 rounded-xl p-3 shadow-2xl flex flex-col gap-2 font-mono">
                <div className="flex items-center gap-3 bg-black/50 p-2 rounded border border-slate-800">
                   <div className="flex-1 overflow-hidden h-10 relative">
                      <svg className="w-[200%] h-full animate-ecg-slide stroke-green-500" fill="none" viewBox="0 0 200 40" preserveAspectRatio="none">
                         <path d="M0,20 L20,20 L25,10 L30,35 L35,5 L40,25 L45,20 L100,20 L120,20 L125,10 L130,35 L135,5 L140,25 L145,20 L200,20" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                   </div>
                   <div className="w-16 text-right">
                      <div className="text-[10px] text-green-500 mb-[-4px]">ECG (FC)</div>
                      <div className={clsx("text-2xl font-bold transition-colors", clinicalPhase === 1 ? "text-red-400 animate-pulse" : "text-green-400")}>
                        {currentVitals.hr}
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-3 bg-black/50 p-2 rounded border border-slate-800">
                   <div className="flex-1 overflow-hidden h-8 relative">
                      <svg className="w-[200%] h-full animate-spo2-slide stroke-cyan-400" fill="none" viewBox="0 0 200 30" preserveAspectRatio="none">
                         <path d="M0,25 L20,25 C25,25 25,10 30,10 C35,10 35,25 40,25 L100,25 L120,25 C125,25 125,10 130,10 C135,10 135,25 140,25 L200,25" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                   </div>
                   <div className="w-16 text-right">
                      <div className="text-[10px] text-cyan-500 mb-[-4px]">SpO2 %</div>
                      <div className={clsx("text-2xl font-bold transition-colors", clinicalPhase === 1 ? "text-amber-400" : "text-cyan-400")}>
                        {currentVitals.spo2}
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-3 bg-black/50 p-2 rounded border border-slate-800">
                   <div className="flex-1">
                      <div className="text-[10px] text-slate-400">PANI (mmHg)</div>
                      <div className="text-xl text-slate-200 font-bold tracking-wider">{currentVitals.bp_sys}/{currentVitals.bp_dia}</div>
                   </div>
                   <div className="w-16 text-right">
                      <div className="text-[10px] text-yellow-500 mb-[-4px]">RESP</div>
                      <div className="text-xl text-yellow-400 font-bold">{currentVitals.rr}</div>
                   </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Pending Actions Overlay */}
          <div className="absolute left-4 bottom-4 z-10 flex flex-col gap-2">
            {activeActions.filter(a => a.status === 'PENDING').map(action => (
               <div key={action.id} className="bg-indigo-900/80 backdrop-blur border border-indigo-500/50 px-3 py-2 rounded-lg flex items-center gap-3 shadow-lg">
                 <div className="w-3.5 h-3.5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-[10px] font-mono text-indigo-100 uppercase tracking-wider">{action.name}</span>
               </div>
            ))}
          </div>

          {/* Chat Overlay / Bottom Sheet */}
          <div className="absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t from-[#05070A] via-[#05070A]/95 to-transparent flex flex-col z-20">
            <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-end gap-4 pb-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={clsx(
                      "flex gap-4 items-start",
                      msg.sender === 'doctor' ? "justify-end" : ""
                    )}
                  >
                    {(msg.sender === 'patient' || msg.sender === 'companion') && (
                      <div className="w-8 h-8 rounded-full bg-indigo-900/80 backdrop-blur flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-lg">
                        {msg.sender === 'companion' ? 'Ac.' : 'Px.'}
                      </div>
                    )}
                    
                    {msg.sender === 'system' ? (
                      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 p-2 px-4 rounded max-w-[80%] mx-auto my-2 w-full text-center shadow-lg">
                        <p className="text-[11px] font-mono text-slate-300 uppercase tracking-wider">{msg.text}</p>
                      </div>
                    ) : msg.sender === 'doctor' ? (
                      <div className="bg-indigo-600/20 backdrop-blur-sm border border-indigo-500/30 p-3 rounded-2xl rounded-tr-none max-w-[80%] text-right shadow-lg">
                        <p className="text-sm text-slate-200">{msg.text}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block">Ahora</span>
                      </div>
                    ) : (
                      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-3 rounded-2xl rounded-tl-none max-w-[80%] shadow-lg">
                        <p className="text-sm text-slate-300">{msg.text}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block">
                          {msg.sender === 'companion' ? currentCase.patient.companion?.role : 'Paciente'}
                        </span>
                      </div>
                    )}
                    
                    {msg.sender === 'doctor' && (
                      <div className="w-8 h-8 rounded-full bg-slate-700/80 backdrop-blur flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">Dr.</div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-slate-200">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse"></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex flex-col bg-[#05070A]/80 backdrop-blur-md shrink-0 border-t border-slate-800/50">
              {currentCase.patient.companion && (
                <div className="flex items-center gap-2 px-6 py-2 border-b border-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Hablar con:</span>
                  <button 
                    onClick={() => setInterlocutor('patient')}
                    className={clsx(
                      "text-xs px-3 py-1 rounded-full font-medium transition-colors border",
                      interlocutor === 'patient' 
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50" 
                        : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50"
                    )}
                  >
                    Paciente ({currentCase.patient.name})
                  </button>
                  <button 
                    onClick={() => setInterlocutor('companion')}
                    className={clsx(
                      "text-xs px-3 py-1 rounded-full font-medium transition-colors border",
                      interlocutor === 'companion' 
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50" 
                        : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50"
                    )}
                  >
                    Acompañante ({currentCase.patient.companion.role})
                  </button>
                </div>
              )}
              
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="p-4 px-6 flex gap-3 items-center"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escriba su pregunta o acción..."
                    className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-full py-3 pl-6 pr-12 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500 shadow-inner"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  type="submit"
                  className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 shrink-0 transition-colors"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: Patient Status & Management */}
        <aside className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col bg-[#05070A] shrink-0 h-[50vh] lg:h-auto">
          
          <div className="p-4 flex flex-col gap-5 border-b border-slate-800 bg-[#080C14]">
            {/* Vitals */}
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center justify-between">
                <span>Signos Vitales</span>
                {monitorState === 'ACTIVE' && <span className="text-green-500 animate-pulse text-[9px] flex items-center gap-1"><Activity className="w-3 h-3"/> ONLINE</span>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500 mb-0.5 uppercase">FC (lpm)</div>
                  <div className={clsx("text-xl font-bold transition-colors", clinicalPhase === 3 ? "text-red-500 animate-bounce" : clinicalPhase === 1 ? "text-red-400" : "text-orange-400")}>{currentVitals.hr}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500 mb-0.5 uppercase">TA (mmHg)</div>
                  <div className={clsx("text-xl font-bold transition-colors", clinicalPhase === 3 ? "text-red-500 animate-bounce" : clinicalPhase === 1 ? "text-red-400" : "text-orange-400")}>{currentVitals.bp_sys}/{currentVitals.bp_dia}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500 mb-0.5 uppercase">SatO2 (%)</div>
                  <div className={clsx("text-xl font-bold transition-colors", clinicalPhase === 3 ? "text-red-400" : clinicalPhase === 1 ? "text-amber-400" : "text-green-400")}>{currentVitals.spo2}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500 mb-0.5 uppercase">FR (rpm)</div>
                  <div className={clsx("text-xl font-bold transition-colors", clinicalPhase === 3 ? "text-red-400" : clinicalPhase === 1 ? "text-amber-400" : "text-green-400")}>{currentVitals.rr}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ACCIONES CLÍNICAS */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 bg-slate-900/50 flex items-center gap-2 border-b border-slate-800 shrink-0">
               <AlertTriangle className="w-4 h-4 text-indigo-400" />
               <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Acciones Clínicas</span>
            </div>
            
            <div className="flex flex-col flex-1 overflow-y-auto p-3 gap-4">
               
               {/* Evaluar */}
               <div>
                 <div className="text-[10px] uppercase font-bold text-slate-500 px-1 mb-2">1. Evaluar</div>
                 <button 
                   onClick={() => executeAction('REEVALUAR', 'Reevaluación Clínica', 2000, () => {
                     setMessages(prev => [...prev, {
                       id: Date.now().toString(), sender: 'patient', 
                       text: clinicalPhase === 3 ? 'M-me caigo... no siento las manos...' :
                             clinicalPhase === 1 ? 'Me duele muchísimo el pecho... siento que me desvanezco...' : 
                             clinicalPhase === 2 ? 'Me siento un poco mejor, el dolor aflojó un poco.' : 
                             'Siento el pecho pesado doctor.'
                     }]);
                   })}
                   className="w-full text-left px-3 py-2 bg-slate-900/40 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-xs transition-all flex items-center gap-2 text-slate-300 hover:text-white mb-1.5"
                 >
                   <Eye className="w-3.5 h-3.5 text-indigo-400" /> Reevaluar Paciente
                 </button>
                 {monitorState === 'IDLE' && (
                   <button 
                     onClick={() => {
                       executeAction('MONITOR', 'Conectar Monitor Multiparamétrico', 3000, () => setMonitorState('ACTIVE'));
                       setMonitorState('CONNECTING');
                     }}
                     className="w-full text-left px-3 py-2 bg-indigo-600/10 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/80 rounded-lg text-xs transition-all flex items-center gap-2 text-indigo-300 hover:text-white mb-1.5"
                   >
                     <Activity className="w-3.5 h-3.5 text-indigo-400" /> Conectar Monitor
                   </button>
                 )}
                 <button 
                   onClick={() => executeAction('EXAMEN_FISICO', 'Examen Físico Cardiopulmonar', 5000, () => {
                     setMessages(prev => [...prev, {
                       id: Date.now().toString() + 'sys', sender: 'system', 
                       text: 'Examen Físico: R1 y R2 normofonéticos. No soplos. Buena entrada de aire bilateral, sin ruidos agregados. Pulsos simétricos.'
                     }]);
                   })}
                   className="w-full text-left px-3 py-2 bg-slate-900/40 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-xs transition-all flex items-center gap-2 text-slate-300 hover:text-white mb-1.5"
                 >
                   <Stethoscope className="w-3.5 h-3.5 text-indigo-400" /> Examen Físico
                 </button>
               </div>

               {/* Estudios */}
               <div>
                 <div className="text-[10px] uppercase font-bold text-slate-500 px-1 mb-2">2. Estudios</div>
                 <button 
                   onClick={() => executeAction('ECG', 'ECG de 12 derivaciones', 6000, () => {
                     setMessages(prev => [...prev, {
                       id: Date.now().toString() + 'sys', sender: 'system', 
                       text: 'RESULTADO ECG: Ritmo sinusal. Supradesnivel del segmento ST en cara anteroseptal (V1-V4).'
                     }]);
                   })}
                   className="w-full text-left px-3 py-2 bg-slate-900/40 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-xs transition-all flex items-center gap-2 text-slate-300 hover:text-white mb-1.5"
                 >
                   <Activity className="w-3.5 h-3.5 text-blue-400" /> Solicitar ECG
                 </button>
                 <button 
                   onClick={() => executeAction('LAB', 'Laboratorio (Troponinas, Rutina)', 12000, () => {
                     setMessages(prev => [...prev, {
                       id: Date.now().toString() + 'sys', sender: 'system', 
                       text: 'LABORATORIO: Muestra extraída. Enviada a procesar (Demora estimada: 45 min).'
                     }]);
                   })}
                   className="w-full text-left px-3 py-2 bg-slate-900/40 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-xs transition-all flex items-center gap-2 text-slate-300 hover:text-white mb-1.5"
                 >
                   <TestTube className="w-3.5 h-3.5 text-blue-400" /> Solicitar Laboratorio
                 </button>
               </div>

               {/* Intervenir */}
               <div>
                 <div className="text-[10px] uppercase font-bold text-slate-500 px-1 mb-2">3. Intervenir</div>
                 <button 
                   onClick={() => executeAction('O2', 'Oxigenoterapia (Cánula nasal)', 3000, () => {
                     setTargetVitals(prev => ({ ...prev, spo2: 98, hr: prev.hr > 100 ? prev.hr - 10 : prev.hr }));
                     setMessages(prev => [...prev, {
                       id: Date.now().toString() + 'sys', sender: 'system', 
                       text: '[EFECTO] Oxígeno suplementario administrado. Aumenta aporte de O2 miocárdico.'
                     }]);
                   })}
                   className="w-full text-left px-3 py-2 bg-slate-900/40 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-xs transition-all flex items-center gap-2 text-slate-300 hover:text-white mb-1.5"
                 >
                   <Wind className="w-3.5 h-3.5 text-emerald-400" /> Administrar Oxígeno
                 </button>
                 <button 
                   onClick={() => executeAction('NITRO', 'Nitroglicerina Sublingual', 5000, () => {
                     if (currentVitals.bp_sys < 95) {
                       setClinicalPhase(3);
                       setTargetVitals(prev => ({ ...prev, bp_sys: 65, bp_dia: 35, hr: 145, spo2: 84, rr: 32 }));
                       setMessages(prev => [...prev, {
                         id: Date.now().toString() + 'sys', sender: 'system', 
                         text: '[EFECTO ADVERSO CRÍTICO] Vasodilatación severa en paciente hipotenso. Shock cardiogénico inminente.'
                       }, {
                         id: Date.now().toString(), sender: 'patient', 
                         text: 'Me mareo... todo me da vueltas... no veo bien...'
                       }]);
                     } else {
                       if (clinicalPhase === 1) setClinicalPhase(2);
                       setTargetVitals(prev => ({ ...prev, bp_sys: currentVitals.bp_sys - 15, bp_dia: currentVitals.bp_dia - 10, hr: 95, spo2: 96, rr: 18 }));
                       setMessages(prev => [...prev, {
                         id: Date.now().toString() + 'sys', sender: 'system', 
                         text: '[EFECTO] Nitroglicerina administrada. Vasodilatación coronaria en curso.'
                       }]);
                     }
                   })}
                   className="w-full text-left px-3 py-2 bg-slate-900/40 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-xs transition-all flex items-center gap-2 text-slate-300 hover:text-white mb-1.5"
                 >
                   <Pill className="w-3.5 h-3.5 text-emerald-400" /> Nitroglicerina SL
                 </button>
                 <button 
                   onClick={() => executeAction('ASPIRINA', 'Aspirina 300mg VO', 4000, () => {
                     setMessages(prev => [...prev, {
                       id: Date.now().toString() + 'sys', sender: 'system', 
                       text: '[EFECTO] Aspirina 300mg administrada. Efecto antiagregante plaquetario.'
                     }]);
                   })}
                   className="w-full text-left px-3 py-2 bg-slate-900/40 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-xs transition-all flex items-center gap-2 text-slate-300 hover:text-white mb-1.5"
                 >
                   <Pill className="w-3.5 h-3.5 text-emerald-400" /> Aspirina 300mg
                 </button>
                 <button 
                   onClick={() => executeAction('MORFINA', 'Morfina 2mg IV', 4000, () => {
                     setTargetVitals(prev => ({ ...prev, bp_sys: Math.max(50, prev.bp_sys - 10), bp_dia: Math.max(30, prev.bp_dia - 5), rr: Math.max(10, prev.rr - 4) }));
                     setMessages(prev => [...prev, {
                       id: Date.now().toString() + 'sys', sender: 'system', 
                       text: '[EFECTO] Morfina IV administrada. Analgesia central. Atención: Leve depresión respiratoria y vasodilatación.'
                     }]);
                   })}
                   className="w-full text-left px-3 py-2 bg-slate-900/40 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-xs transition-all flex items-center gap-2 text-slate-300 hover:text-white mb-1.5"
                 >
                   <Pill className="w-3.5 h-3.5 text-emerald-400" /> Morfina 2mg IV
                 </button>
                 <button 
                   onClick={() => executeAction('FLUIDOS', 'Solución Fisiológica 500ml', 8000, () => {
                     if (clinicalPhase === 3) setClinicalPhase(1); // Return from shock
                     setTargetVitals(prev => ({ ...prev, bp_sys: prev.bp_sys + 25, bp_dia: prev.bp_dia + 15, hr: Math.max(80, prev.hr - 15) }));
                     setMessages(prev => [...prev, {
                       id: Date.now().toString() + 'sys', sender: 'system', 
                       text: '[EFECTO] Expansión de volumen completada. Aumento de precarga y tensión arterial.'
                     }]);
                   })}
                   className="w-full text-left px-3 py-2 bg-slate-900/40 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-xs transition-all flex items-center gap-2 text-slate-300 hover:text-white mb-1.5"
                 >
                   <TestTube className="w-3.5 h-3.5 text-emerald-400" /> Fluidoterapia (500ml)
                 </button>
               </div>

               {/* Ayuda */}
               <div className="mb-6">
                 <div className="text-[10px] uppercase font-bold text-slate-500 px-1 mb-2">4. Solicitar Ayuda</div>
                 <button 
                   onClick={() => executeAction('AYUDA_CARDIO', 'Interconsulta Cardiología', 4000, () => {
                     setMessages(prev => [...prev, {
                       id: Date.now().toString() + 'sys', sender: 'system', 
                       text: 'Cardiología de Hemodinamia notificada (Código Infarto). Especialista en camino.'
                     }]);
                   })}
                   className="w-full text-left px-3 py-2 bg-slate-900/40 hover:bg-orange-900/30 border border-slate-800 hover:border-orange-500/50 rounded-lg text-xs transition-all flex items-center gap-2 text-slate-300 hover:text-white mb-1.5"
                 >
                   <PhoneCall className="w-3.5 h-3.5 text-orange-400" /> Cardiología Hemodinamia
                 </button>
               </div>
            </div>
          </div>
        </aside>

      </div>
      
      {/* Footer bar */}
      <footer className="h-16 border-t border-slate-800 px-6 flex items-center gap-4 bg-[#05070A] shrink-0">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest w-32 shrink-0">Dx. Diferencial:</div>
        <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide items-center">
          <button className="border border-dashed border-slate-700 px-4 py-1.5 rounded-full text-xs text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors whitespace-nowrap">
            + Agregar Hipótesis
          </button>
        </div>
        <div className="w-56 flex justify-end gap-3 items-center shrink-0 border-l border-slate-800 pl-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Plan Activo</div>
            <div className="text-xs text-indigo-400 font-medium">Evaluación Inicial</div>
          </div>
          <div className="w-1.5 h-8 bg-slate-800 rounded-full"></div>
        </div>
      </footer>
    </div>
  );
}
