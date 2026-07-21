export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AnalysisStatus = 'pending' | 'active' | 'complete' | 'failed';

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  status?: 'error' | 'warning' | 'normal';
  children?: FileNode[];
}

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  file: string;
  line: number;
  confidence: number;
}

export interface AnalysisStep {
  id: number;
  label: string;
  detail: string;
  duration: number;
  discoveryId?: string;
}

export interface RootCause {
  summary: string;
  impact: string;
}

export interface Patch {
  file: string;
  diff: string;
}

export interface ValidationTest {
  name: string;
  status: 'PASS' | 'RUNNING' | 'FAIL';
  coverage: number;
}

export interface Report {
  defects: number;
  timeToResolution: string;
  testPassRate: string;
}

export interface AnalysisPayload {
  project: string;
  mcu: string;
  confidence: number;
  timeline: AnalysisStep[];
  findings: Finding[];
  suspectedFiles: string[];
  rootCause: RootCause;
  patch: Patch;
  validation: ValidationTest[];
  report: Report;
}
