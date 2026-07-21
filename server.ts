import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Standardized fallback mock data in case API key is missing or fails
const FALLBACK_DATA = {
  project: "stm32f4-dma-demo",
  mcu: "STM32F407VGT6",
  confidence: 87,
  timeline: [
    { id: 1, label: "Indexing repository structure", detail: "42 source files parsed. C17 standard detected.", duration: 1200 },
    { id: 2, label: "Mapping interrupt vector table", detail: "91 handlers found. HardFault entry at 0x080012AC.", duration: 1500 },
    { id: 3, label: "Peripheral topology reconstructed", detail: "DMA2, UART3, and SPI1 mapped to AHB/APB bus.", duration: 1500 },
    { id: 4, label: "Tracing UART RX dependency", detail: "Analyzing DMA2_Stream5 requests to USART3_RX.", duration: 2000 },
    { id: 5, label: "Blocking ISR suspected", detail: "Detected uninitialized callback in dma_controller.c:142.", duration: 2500, discoveryId: "f1" },
    { id: 6, label: "Increasing inference confidence", detail: "Correlating hardware signal traces with stack frame.", duration: 1500 },
    { id: 7, label: "Generating validated patch", detail: "Synthesizing memory-safe handler candidate #1.", duration: 2500, discoveryId: "f2" },
    { id: 8, label: "Validation simulation completed", detail: "4/4 test vectors resolved. Zero regressions.", duration: 1200 },
  ],
  findings: [
    {
      id: "f1",
      severity: "CRITICAL",
      title: "Null pointer dereference",
      description: "hdma->XferCpltCallback invoked via uninitialized handle during DMA2_Stream5 startup sequence.",
      file: "src/drivers/dma_controller.c",
      line: 142,
      confidence: 87
    },
    {
      id: "f2",
      severity: "HIGH",
      title: "Missing peripheral clock enable",
      description: "__HAL_RCC_DMA2_CLK_ENABLE() not called before DMA2_Stream5 peripheral configuration.",
      file: "src/drivers/dma_controller.c",
      line: 88,
      confidence: 92
    }
  ],
  suspectedFiles: ["src/drivers/dma_controller.c", "src/drivers/uart_driver.c"],
  rootCause: {
    summary: "Race condition between DMA stream enabling and callback registration.",
    impact: "Triggers immediate HardFault on first UART RX event."
  },
  patch: {
    file: "src/drivers/dma_controller.c",
    diff: `@@ -139,7 +139,11 @@ void DMA2_Stream5_IRQHandler(void)
 {
   DMA_HandleTypeDef *hdma = &ghDmaHandle;
-  hdma->XferCpltCallback(hdma);
+  if (hdma->XferCpltCallback != NULL) {
+    hdma->XferCpltCallback(hdma);
+  } else {
+    // Safe fallback: clear interrupt flags and log warning
+    __HAL_DMA_CLEAR_FLAG(hdma, __HAL_DMA_GET_TC_FLAG_INDEX(hdma));
+  }
 }`
  },
  validation: [
    { name: "Unit: DMA Controller", status: "PASS", coverage: 94 },
    { name: "Integration: UART Loopback", status: "PASS", coverage: 100 },
    { name: "Hardware: Stress Test", status: "PASS", coverage: 82 }
  ],
  report: {
    defects: 2,
    timeToResolution: "14m",
    testPassRate: "100%"
  }
};

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI analysis API route
  app.get("/api/analyze", async (req, res) => {
    const client = getAIClient();
    
    if (!client) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to structured simulation data.");
      return res.json(FALLBACK_DATA);
    }

    try {
      // Prompt Gemini using Structured Output for an optimal developer tooling layout.
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "You are the TraceFerret Reasoning and Codex Engine. Analyze the stm32f4-dma-demo scenario and synthesize an engineering trace, root cause analysis, corrective patch, and validations.",
        config: {
          systemInstruction: "You generate realistic firmware debugging telemetry. Ensure timeline steps have logical durations (e.g., between 1000ms and 3000ms). The generated code diff should use standard unified patch format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              project: { type: Type.STRING },
              mcu: { type: Type.STRING },
              confidence: { type: Type.INTEGER },
              timeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    label: { type: Type.STRING },
                    detail: { type: Type.STRING },
                    duration: { type: Type.INTEGER },
                    discoveryId: { type: Type.STRING }
                  },
                  required: ["id", "label", "detail", "duration"]
                }
              },
              findings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    file: { type: Type.STRING },
                    line: { type: Type.INTEGER },
                    confidence: { type: Type.INTEGER }
                  },
                  required: ["id", "severity", "title", "description", "file", "line", "confidence"]
                }
              },
              suspectedFiles: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              rootCause: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["summary", "impact"]
              },
              patch: {
                type: Type.OBJECT,
                properties: {
                  file: { type: Type.STRING },
                  diff: { type: Type.STRING }
                },
                required: ["file", "diff"]
              },
              validation: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    status: { type: Type.STRING },
                    coverage: { type: Type.INTEGER }
                  },
                  required: ["name", "status", "coverage"]
                }
              },
              report: {
                type: Type.OBJECT,
                properties: {
                  defects: { type: Type.INTEGER },
                  timeToResolution: { type: Type.STRING },
                  testPassRate: { type: Type.STRING }
                },
                required: ["defects", "timeToResolution", "testPassRate"]
              }
            },
            required: ["project", "mcu", "confidence", "timeline", "findings", "suspectedFiles", "rootCause", "patch", "validation", "report"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      const payload = JSON.parse(responseText);
      return res.json(payload);
    } catch (error) {
      console.error("Gemini API call failed, falling back to structured telemetry simulator data:", error);
      return res.json(FALLBACK_DATA);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
