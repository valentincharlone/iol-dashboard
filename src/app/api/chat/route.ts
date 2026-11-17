import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { getServerSession } from "next-auth";
import { createPortfolioTools } from "@/lib/ai/portfolio-tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return new Response("No autorizado", { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    // Temporal: modelo gratis del AI Gateway mientras no haya créditos cargados.
    // OJO: no garantiza no retener/entrenar con los datos. Volver a
    // "anthropic/claude-haiku-5.5" (zdr + no_training) al cargar créditos.
    model: "nvidia/nemotron-3.5-lightning-free",
    instructions: `Sos un asistente que analiza la cartera de inversiones del usuario en InvertirOnLine.
Respondés en español rioplatense, breve y con números concretos.
Usá SIEMPRE las tools para obtener datos; nunca inventes valores.
No das recomendaciones de compra o venta: describís y analizás.`,
    messages: await convertToModelMessages(messages),
    tools: createPortfolioTools(),
    stopWhen: isStepCount(5), // le da margen para llamar la tool, leer el resultado y responder
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      // Por defecto el SDK oculta el error real. Es un dashboard personal detrás
      // de login, así que lo mostramos para poder diagnosticar.
      onError: (error) => {
        console.error("[api/chat]", error);
        return error instanceof Error ? error.message : String(error);
      },
    }),
  });
}
