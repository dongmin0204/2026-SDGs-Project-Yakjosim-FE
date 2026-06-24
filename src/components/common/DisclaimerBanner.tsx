import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

interface DisclaimerBannerProps {
  className?: string;
}

export function DisclaimerBanner({ className = '' }: DisclaimerBannerProps) {
  return (
    <Alert className={`border-disclaimer-border bg-disclaimer-bg ${className}`}>
      <Info className="h-4 w-4 text-disclaimer-icon" aria-hidden="true" />
      <AlertDescription className="text-xs text-disclaimer-fg">
        본 서비스는 의료 진단을 대체하지 않습니다. 복용 관련 결정은 반드시
        의사·약사와 상담하세요.
      </AlertDescription>
    </Alert>
  );
}
