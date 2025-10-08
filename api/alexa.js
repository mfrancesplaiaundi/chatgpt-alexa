import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    // Aseguramos que el body se lea correctamente
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString();
    const body = JSON.parse(rawBody || "{}");

    console.log("Body recibido de Alexa:", body);

    if (body.request?.type === "LaunchRequest") {
      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "Hola, soy tu asistente con ChatGPT. ¿Qué quieres preguntarme?",
          },
          shouldEndSession: false,
        },
      });
    }

    if (body.request?.type === "IntentRequest") {
      const userInput =
        body.request.intent?.slots?.consulta?.value ||
        body.request.intent?.name ||
        "No entendí tu pregunta";

      const completion = await client.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Responde de manera natural y breve." },
          { role: "user", content: userInput },
        ],
      });

      const respuesta = completion.choices[0].message.content;

      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: respuesta,
          },
          shouldEndSession: false,
        },
      });
    }

    // Si no coincide ningún tipo de request
    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Adiós.",
        },
        shouldEndSession: true,
      },
    });
  } catch (err) {
    console.error("Error en handler:", err);
    return res.status(500).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Ha ocurrido un error interno en el servidor.",
        },
        shouldEndSession: true,
      },
    });
  }
}
