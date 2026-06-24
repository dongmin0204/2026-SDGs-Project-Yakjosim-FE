import type { AnalysisResult, Severity } from '@/types';

export type RiskDisplaySeverity = 'critical' | 'caution' | 'safe' | 'info' | 'consult' | 'unknown';

export function getRiskDisplaySeverity(severity: Severity): RiskDisplaySeverity {
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'high':
    case 'medium':
      return 'caution';
    case 'low':
      return 'safe';
    case 'unknown':
      return 'unknown';
  }
}

export function getRiskDisplayLabel(severity: Severity): string {
  const displaySeverity = getRiskDisplaySeverity(severity);

  switch (displaySeverity) {
    case 'critical':
      return '금기';
    case 'caution':
      return '주의';
    case 'safe':
      return '안전';
    case 'info':
      return '참고';
    case 'consult':
      return '상담 권장';
    case 'unknown':
      return '확인 정보 없음';
  }
}

export function getRiskSupportTags(result: AnalysisResult): string[] {
  const tags: string[] = [];

  if (result.rule.minIntervalHours) {
    tags.push(`${result.rule.minIntervalHours}시간 간격`);
  }

  if (
    result.severity === 'critical' ||
    result.severity === 'high' ||
    result.recommendation.includes('상담')
  ) {
    tags.push('상담 권장');
  }

  return tags;
}

export function needsConsultation(result: AnalysisResult): boolean {
  return getRiskSupportTags(result).includes('상담 권장');
}
