const fs = require('fs');
let code = fs.readFileSync('src/views/SimulatorView.tsx', 'utf8');

// Add import
code = code.replace(
  `import { DebriefPanel } from '../components/DebriefPanel';`,
  `import { DebriefPanel } from '../components/DebriefPanel';\nimport { generatePatientResponse } from '../services/ollamaService';`
);

// We need to replace the entire handleSendMessage block
const oldHandleSendMessage = `  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'doctor', text: userMsg }]);
    setInputValue('');

    // Mock response logic
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

      const responder = (currentCase.patient.companion && interlocutor === 'companion') ? 'companion' : 'patient';
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: responder, 
        text: responseText 
      }]);
    }, 1500);
  };`;

const newHandleSendMessage = `  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMsg = inputValue.trim();
    const newUserMessage: Message = { id: Date.now().toString(), sender: 'doctor', text: userMsg };
    
    // Convert existing messages to Ollama format
    const chatHistory = messages
      .filter(m => m.sender !== 'system') // We ignore system messages like 'help' or 'actions'
      .map(m => ({
        role: m.sender === 'doctor' ? 'user' : 'assistant' as 'user' | 'assistant' | 'system',
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
  };`;

// Also, let's add a typing indicator at the bottom of the chat list, just before the form.
const chatListEndTarget = `{/* Dummy element to scroll to bottom */}`;
const typingIndicator = `
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-slate-200">
                        <div className="flex gap-1 items-center h-4">
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Dummy element to scroll to bottom */}`;

if (code.includes(oldHandleSendMessage)) {
  code = code.replace(oldHandleSendMessage, newHandleSendMessage);
} else {
  console.log("Could not find old handleSendMessage string");
}

code = code.replace(chatListEndTarget, typingIndicator);

fs.writeFileSync('src/views/SimulatorView.tsx', code);
