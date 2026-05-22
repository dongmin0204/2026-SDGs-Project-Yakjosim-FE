import { useParams, useNavigate } from 'react-router';
import { AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/app/components/ui/accordion';
import { PageContainer } from '@/components/layout/PageContainer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { RiskBadge } from '@/components/common/RiskBadge';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { getRiskDisplaySeverity, getRiskSupportTags } from '@/utils/risk';

const interactionTypeLabels: Record<string, string> = {
  contraindication: '병용금기',
  caution: '주의',
  absorption_decrease: '흡수 감소',
  effect_increase: '효과 증가',
  effect_decrease: '효과 감소',
  duplicate: '중복',
};

export default function DetailPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { state } = useAnalysisContext();

  const session = state.currentSession;
  const result = session?.results.find((r) => r.id === resultId);

  if (!result) {
    return (
      <PageContainer title="상세 정보" showBackButton showBottomNav={false}>
        <div className="flex flex-col items-center py-20">
          <p className="text-gray-400">결과를 찾을 수 없습니다.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            뒤로 가기
          </Button>
        </div>
      </PageContainer>
    );
  }

  const rule = result.rule;
  const supportTags = getRiskSupportTags(result);

  return (
    <PageContainer title="상세 정보" showBackButton showBottomNav={false}>
      <div className="space-y-4">
        <DisclaimerBanner />

        {/* Header card */}
        <div className="rounded-xl border bg-white p-5">
          <p className="text-xl font-bold text-gray-900">
            {rule.subjectName} + {rule.objectName}
          </p>
          <div className="mt-3">
            <RiskBadge severity={result.severity} className="text-sm px-3 py-1" />
          </div>
        </div>

        {/* Mechanism + Recommendation combined */}
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">위험 이유</p>
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-sm leading-relaxed text-gray-800">{result.explanation}</p>
            </div>
          </div>
          {(supportTags.length > 0 || rule.minIntervalHours) && (
            <div className="border-t px-4 py-4">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">권고 사항</p>
              <div className="space-y-2">
                {supportTags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2.5">
                    <Info className="h-4 w-4 shrink-0 text-blue-500" />
                    <p className="text-sm leading-relaxed text-gray-800">{tag}</p>
                  </div>
                ))}
              </div>
              {rule.minIntervalHours && (
                <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-sm font-medium text-yellow-800">
                    최소 {rule.minIntervalHours}시간 간격을 두세요
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Evidence accordion */}
        <Accordion type="single" collapsible className="rounded-xl border bg-white">
          <AccordionItem value="evidence" className="border-b-0">
            <AccordionTrigger className="px-4 text-base font-semibold">
              근거 정보
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">출처</span>
                  <span>{rule.evidenceSource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">성분 (주체)</span>
                  <span>{rule.subjectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">성분 (대상)</span>
                  <span>{rule.objectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">상호작용 유형</span>
                  <span>
                    {interactionTypeLabels[rule.interactionType] ?? rule.interactionType}
                  </span>
                </div>
                {rule.evidenceUrl && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">URL</span>
                    <a
                      href={rule.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      링크
                    </a>
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  이 정보는 공공 데이터를 기반으로 합니다.
                </p>
                {getRiskDisplaySeverity(result.severity) === 'unknown' && (
                  <p className="text-xs font-medium text-amber-600">
                    "확인 정보 없음"은 "안전함"을 의미하지 않습니다.
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Bottom button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate(-1)}
        >
          결과 목록으로
        </Button>
      </div>
    </PageContainer>
  );
}
