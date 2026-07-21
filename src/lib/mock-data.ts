import { AnalysisPayload } from "../types/analysis";

export const MOCK_ANALYSIS_DATA: AnalysisPayload = {
  project: "stm32f4-dma-demo",
  mcu: "STM32F407VGT6",
  confidence: 87,
  timeline: [
    { id: 1, label: "Ingesting firmware flash memory & ELF symbols", detail: "Parsing DWARF debug sections and ELF section headers for 42 modules.", duration: 1000 },
    { id: 2, label: "Mapping MCU interrupt vector table", detail: "91 interrupt handlers identified. HardFault exception registered at 0x080012AC.", duration: 1100 },
    { id: 3, label: "Reconstructing AHB/APB peripheral topology", detail: "Mapped DMA2, USART3, SPI1, and RCC register blocks.", duration: 1100 },
    { id: 4, label: "Analyzing NVIC interrupt preemption priorities", detail: "USART3 (Priority 5) vs DMA2_Stream0 (Priority 2) timing window detected.", duration: 1200 },
    { id: 5, label: "Tracing DMA stream request dependencies", detail: "Analyzing DMA2_Stream0 requests mapped to USART3_RX channel 4.", duration: 1300 },
    { id: 6, label: "Isolating null pointer callback dereference", detail: "Detected uninitialized XferCpltCallback handle in dma_controller.c:142.", duration: 1500, discoveryId: "f1" },
    { id: 7, label: "Correlating register state with bus fault exception", detail: "Configurable Fault Status Register CFSR=0x00000082 (PRECISERR trap).", duration: 1400, discoveryId: "f2" },
    { id: 8, label: "Ranking suspect driver source files", detail: "Calculated fault likelihood: dma_controller.c (94%), uart_driver.c (82%).", duration: 1200 },
    { id: 9, label: "Synthesizing defensive callback guard candidate", detail: "Constructed zero-latency branch check with safe interrupt flag clearing.", duration: 1500 },
    { id: 10, label: "Finalizing hardware-in-the-loop trace validation", detail: "Virtual Cortex-M4 core emulator confirmed 0 HardFault traps across 1,000 runs.", duration: 1000 },
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
