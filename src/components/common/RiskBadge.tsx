import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import type { Severity } from '@/types';
import { getRiskDisplaySeverity } from '@/utils/risk';

interface RiskBadgeProps {
  severity: Severity;
  className?: string;
}

const config: Record<
  ReturnType<typeof getRiskDisplaySeverity>,
  { color: string; icon: React.ElementType; label: string }
> = {
  critical: {
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: AlertTriangle,
    label: '금기',
  },
  caution: {
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: AlertCircle,
    label: '주의',
  },
  unknown: {
    color: 'bg-gray-100 text-gray-500 border-gray-300',
    icon: HelpCircle,
    label: '확인 정보 없음',
  },
};

export function RiskBadge({ severity, className = '' }: RiskBadgeProps) {
  const displaySeverity = getRiskDisplaySeverity(severity);
  const { color, icon: Icon, label } = config[displaySeverity];

  return (
    <span
      data-slot="risk-badge"
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${color} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
