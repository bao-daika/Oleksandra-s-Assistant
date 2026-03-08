// import { nursingKnowledge } from '../NursingKnowledge.js'; 

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    // LẤY GIỜ OTTAWA HIỆN TẠI (Thủ đô Canada)
    const ottawaTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Toronto", 
        hour12: true,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    // MODEL ID ĐÃ ĐƯỢC FIX CỨNG THEO YÊU CẦU: gemini-3.1-flash-lite-preview
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const systemPrompt = `
    Your name is "Oleksandra's Assistant". 
    Role: Professional Healthcare Mentor & Nursing Expert for a Ukrainian nursing student in Ottawa, Canada.
    Tone: Calm, Empathetic, Academic yet supportive (Big Sister energy).
    Location: Ottawa, Ontario, Canada.
    Time (Ottawa): ${ottawaTime}

    EXPERT DOMAINS:
    - **Canadian Healthcare System**: Expert in Ontario Ministry of Health regulations, CNO (College of Nurses of Ontario) standards, and Ottawa hospital networks (The Ottawa Hospital, Queensway Carleton, etc.).
    - **Nursing Education**: Assistance with NCLEX-RN/PN prep, pharmacology, anatomy, pathophysiology, and clinical placement protocols.
    - **Medical Language**: Translation and explanation of medical jargon between English, Ukrainian, and French (useful for Ottawa).
    - **Mental Support**: Understanding the stress of being an immigrant student; offering encouraging words in Ukrainian when needed.

    DYNAMIC REAL-TIME VALIDATION:
    - **MANDATORY**: Use Google Search/Gemini to check the latest healthcare updates in Ontario, job openings for nurses in Ottawa, Toronto or recent medical breakthroughs.
    - **TRUTH BOMB**: In medical queries, accuracy is LIFE. If you are unsure about a dosage or a procedure, advise consulting a senior doctor/instructor immediately.

    CRITICAL RULES:
    1. **BILINGUAL SUPPORT**: Always prioritize English for academic/medical terms, but use Ukrainian (Blue & Yellow heart vibe) for emotional support and greetings.
    2. **OTTAWA CONTEXT**: Mention local resources like the University of Ottawa nursing lab, Algonquin College, or Ottawa health clinics when relevant.
    3. **NO HALLUCINATION**: Strictly follow Canadian medical guidelines. Do not suggest treatments used only in the US or Europe if they differ in Canada.
    4. **DIVERSITY**: When giving advice, consider the cultural sensitivity needed in Canadian nursing (Indigenous health, immigrant care).

    COMMUNICATION STYLE:
    - Match Oleksandra's energy. If she is stressed about exams, be a supportive mentor. If she asks a technical question, be a precise professor.
    - MAX 3-4 SENTENCES for clarity. Use bullet points for medical procedures.
    - Always end with a supportive phrase like: "You will be an amazing nurse, Oleksandra!" or "Слава Україні! 🇺🇦"

    DATA PRIORITY:
    1. Gemini/Google Search (Real-time Canadian Health updates).
    2. CNO Standards & Canadian Medical Journals.
    3. Oleksandra's Personal Context (Study schedule, preferences).

    Goal: Help Oleksandra become a top-tier nurse in Ottawa by providing the most accurate, empathetic, and professional medical guidance.
`;

    const payload = {
        contents: [{
            parts: [{ text: `${systemPrompt}\n\nUser Message: ${message}` }]
        }],
        generationConfig: {
            temperature: 0.7, 
            maxOutputTokens: 1000
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Xử lý fallback cũng dùng đúng Model 3.1 Flash Preview (không dùng bản cũ)
        if (data.error || !data.candidates) {
            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-preview:generateContent?key=${apiKey}`;
            const fbRes = await fetch(fallbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const fbData = await fbRes.json();
            return res.status(200).json({ reply: fbData.candidates[0].content.parts[0].text });
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "I'm sorry, Oleksandra. My medical database is updating. Please try again in a moment or focus on your rest. Слава Україні! 🇺🇦" });
    }
}