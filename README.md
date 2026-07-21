# TraceFerret

> AI-powered firmware investigation platform for embedded systems.

TraceFerret is an intelligent debugging assistant that helps embedded systems engineers investigate firmware failures, identify root causes, generate corrective patches, validate fixes, and produce engineering reports through a structured investigation workflow.

Instead of acting like a chatbot, TraceFerret is designed to behave like a firmware engineer—performing staged analysis, correlating evidence, and presenting transparent reasoning throughout the debugging process.

---

## Why TraceFerret?

Debugging embedded firmware is significantly more challenging than debugging conventional software.

Developers often rely on:

- HardFault registers
- Oscilloscopes
- Logic analyzers
- Serial debugging
- JTAG/SWD debuggers
- Trial-and-error debugging

Finding the actual cause of a firmware crash can take hours or even days.

TraceFerret reduces that investigation time by automatically reconstructing the debugging process and presenting engineers with structured evidence rather than isolated AI-generated answers.

---

## Features

- Repository investigation workflow
- Interactive firmware investigation timeline
- Root cause localization
- Confidence scoring
- Evidence chain visualization
- Firmware patch generation
- Validation pipeline
- Engineering report generation
- Premium investigation dashboard
- Embedded systems oriented UI

---

## Investigation Workflow

```
Upload Repository
        ↓
Repository Analysis
        ↓
Evidence Collection
        ↓
Root Cause Detection
        ↓
Patch Generation
        ↓
Validation
        ↓
Engineering Report
```

---

## Supported Demonstration Scenarios

Current demo scenarios include:

- STM32 DMA Callback HardFault
- FreeRTOS Stack Overflow

The architecture is designed to support additional MCU families and firmware repositories.

---

## Architecture

TraceFerret follows a two-stage AI pipeline.

### Stage 1 — Repository Analysis

Responsible for:

- firmware understanding
- dependency tracing
- peripheral mapping
- interrupt analysis
- fault localization
- patch generation

---

### Stage 2 — Engineering Reasoning

Responsible for:

- confidence scoring
- investigation timeline
- explanation synthesis
- validation summaries
- engineering reports

This separation keeps repository understanding independent from higher-level reasoning while maintaining a consistent investigation workflow.

---

## Technology Stack

Frontend

- React
- Vite
- TypeScript
- TailwindCSS

Backend

- Vercel Serverless Functions

AI

- OpenAI API integration
- Two-stage reasoning architecture

Deployment

- Vercel

---

## Running Locally

Clone the repository

```bash
git clone <repo-url>
```

Install dependencies

```bash
npm install
```

Create

```
.env
```

Add

```
OPENAI_API_KEY=your_key_here
```

Run

```bash
npm run dev
```

---

## Deployment

The application is designed for deployment on Vercel.

Simply connect the GitHub repository to Vercel and configure:

```
OPENAI_API_KEY
```

as an environment variable.

---

## Future Improvements

- Upload real firmware repositories
- ELF parsing
- Map file analysis
- DWARF symbol parsing
- CMSIS-SVD register decoding
- GitHub integration
- Hardware-in-the-loop validation
- Multi-file patch generation
- Interactive dependency graphs
- CI/CD integration
- Export investigation bundles

---

## License

MIT
