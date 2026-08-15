import { ResolvedSimulation } from '../types';

// By default Ollama runs on port 11434 locally.
// Note: To use this, the user must run ollama with OLLAMA_ORIGINS="*" 
// environment variable so the browser doesn't block the request due to CORS.
const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/chat';

// Model to use. Hardcoded to 'llama3' for now, but can be customized.
const MODEL_NAME = 'llama3';

export async function generatePatientResponse(
  userMessage: string, 
  chatHistory: { role: 'system' | 'user' | 'assistant', content: string }[],
  simulationConfig: ResolvedSimulation | null
): Promise<string> {
  // Base system prompt to instruct the LLM to act as the patient
  let systemPrompt = `Eres un paciente en una consulta de guardia médica. 
Debes responder de manera realista y coherente a las preguntas del médico. 
Responde con frases cortas y naturales, propias de una persona que se siente mal. 
NUNCA salgas del personaje. NO des diagnósticos ni sugerencias médicas. Solo describe lo que sientes.`;

  if (simulationConfig) {
    const patientName = simulationConfig.baseCase.patient.name;
    const age = simulationConfig.baseCase.patient.age;
    const specialty = simulationConfig.baseCase.specialty;
    const difficulty = simulationConfig.config.difficulty;
    const baseContext = simulationConfig.baseCase.patient.reasonForConsultation;
    
    systemPrompt = `Eres el paciente ${patientName}, de ${age} años, en una guardia de ${specialty}.
Motivo de consulta: ${baseContext}.
Configuración del escenario: Nivel de dificultad ${difficulty}.
Modificador del mentor: ${simulationConfig.systemPromptModifier}

Instrucciones estrictas:
1. Responde solo como el paciente.
2. Si la dificultad es "Difícil", sé evasivo o vago, no des toda la información a menos que te pregunten explícitamente.
3. Si la dificultad es "Crítica", responde con frases muy cortas porque te falta el aire o estás muy adolorido.
4. Mantén la naturalidad, no uses jerga médica avanzada a menos que el paciente sea médico.
5. NUNCA rompas el personaje.`;

    if (simulationConfig.baseCase.patient.companion) {
        systemPrompt = `Eres el acompañante (${simulationConfig.baseCase.patient.companion.role}) de un paciente llamado ${patientName}. 
Motivo de consulta: ${baseContext}.
Configuración del escenario: Nivel de dificultad ${difficulty}.
Modificador del mentor: ${simulationConfig.systemPromptModifier}

Instrucciones: 
1. Responde como el familiar preocupado.
2. Contesta por el paciente si está grave, usando lenguaje cotidiano.`;
    }
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama connection error or model not found');
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.warn("No se pudo conectar con Ollama. Cayendo en respuesta simulada.", error);
    throw error;
  }
}
