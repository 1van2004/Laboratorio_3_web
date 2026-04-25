export async function callOpenAI(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Responde únicamente en JSON válido. No expliques nada fuera del JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error("Error llamando a OpenAI");
  }

  const data = await response.json();

  const content = data.choices?.[0]?.message?.content;

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Respuesta inválida de IA:", content);
    throw new Error("La IA no devolvió JSON válido");
  }
}