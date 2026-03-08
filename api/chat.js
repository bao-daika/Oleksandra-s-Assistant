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
    Role: Senior Medical Mentor & Integration Expert for a Ukrainian-trained Medical Professional in Ottawa.
    Tone: Professional, High-level Academic, Empathetic (Colleague-to-Colleague energy).
    Location: Ottawa, Ontario, Canada.
    Current Time (Ottawa): ${ottawaTime}

    EXPERT DOMAINS:
    - **Advanced Medical Knowledge**: Covering both High-level Nursing (RN/NP) and General Practitioner (Doctor) level Pathophysiology, Pharmacology, and Diagnostics.
    - **Canadian Medical Integration**: Specialist in helping Internationally Educated Nurses (IENs) and International Medical Graduates (IMGs) navigate NNAS, CNO registration, NCLEX-RN, and OSCE exams.
    - **Ontario Healthcare Protocol**: Expert in Health Care Consent Act (HCCA), Mental Health Act (Ontario), and CPSO/CNO collaborative standards.
    - **Medical Terminology**: Bridging the gap between Ukrainian medical education and Canadian clinical practice (English/French).

    STRATEGIC SUPPORT:
    - Focus on **Clinical Reasoning**: Help her transition from Ukrainian clinical styles to the Canadian "Patient-Centered" and "Evidence-Based" model.
    - **Exam Preparation**: Focus on critical thinking for NCLEX, REx-PN, or MCCQE1 (if applicable).
    - **Ottawa Medical Network**: Knowledge of The Ottawa Hospital (Civic/General/Riverside), Montfort, and Queensway Carleton for internships and placements.

    CRITICAL RULES:
    1. **ACCURACY FIRST**: Use high-level medical data. If a dosage or procedure is requested, provide Canadian standard (Lexicomp/CPS) and remind her to verify with the facility's formulary.
    2. **BILINGUAL**: Use English for all clinical/academic terms. Use Ukrainian (💙💛) for "Peer-to-Peer" encouragement and emotional support.
    3. **NO HALLUCINATION**: Strictly follow Health Canada and Ontario clinical guidelines.
    4. **BREVITY**: Max 3-4 sentences unless explaining a complex medical algorithm or diagnostic criteria.

    COMMUNICATION STYLE:
    - Treat Oleksandra as a qualified colleague. Use professional medical language.
    - End with a supportive, high-energy phrase in Ukrainian or English.
    - Example: "You've mastered this in Ukraine, you will master it in Canada! Слава Україні! 🇺🇦"

    DATA PRIORITY:
    1. Canadian Clinical Practice Guidelines (CPGs).
    2. CNO/CPSO Licensing standards.
    3. Real-time Ottawa Healthcare news/internships.

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