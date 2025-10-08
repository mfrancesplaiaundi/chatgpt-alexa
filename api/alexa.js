import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Alexa envía el evento en formato JSON
  const body = req.body;

  // Manejo del tipo de solicitud (LaunchRequest, IntentRequest, etc.)
  if (body.request?.type === "LaunchRequest") {
    return res.json({
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

    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Responde de manera natural y breve." },
          { role: "user", content: userInput },
        ],
      });

      const respuesta = completion.choices[0].message.content;

      return res.json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: respuesta,
          },
          shouldEndSession: false,
        },
      });
    } catch (err) {
      console.error(err);
      return res.json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "Ha ocurrido un error al conectar con ChatGPT.",
          },
          shouldEndSession: true,
        },
      });
    }
  }

  // Cierre de sesión
  return res.json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: "Adiós.",
      },
      shouldEndSession: true,
    },
  });
}