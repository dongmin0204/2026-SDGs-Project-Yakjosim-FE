import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, ChevronRight, FileText, Image as ImageIcon, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { PageContainer } from '@/components/layout/PageContainer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { RiskBadge } from '@/components/common/RiskBadge';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import type { AnalysisResult } from '@/types';
import {
  getRiskDisplaySeverity,
  getRiskSupportTags,
  type RiskDisplaySeverity,
} from '@/utils/risk';
import {
  downloadSessionAsImage,
  formatSessionDate,
  getSessionFileDatePrefix,
  groupSessionItems,
  saveSessionAsPdf,
} from '@/utils/share';

const tabFilters: {
  value: string;
  label: string;
  severities: RiskDisplaySeverity[] | null;
}[] = [
  { value: 'all', label: '전체', severities: null },
  { value: 'critical', label: '금기', severities: ['critical'] },
  { value: 'caution', label: '주의', severities: ['caution'] },
];

function countBySeverity(results: AnalysisResult[], severity: RiskDisplaySeverity): number {
  return results.filter((r) => getRiskDisplaySeverity(r.severity) === severity).length;
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { state: analysisState } = useAnalysisContext();
  const [activeTab, setActiveTab] = useState('all');

  const session = analysisState.currentSession;

  if (!session) {
    return (
      <PageContainer title="분석 결과" showBackButton showBottomNav={false}>
        <div className="flex flex-col items-center py-20">
          <p className="text-gray-400">분석 결과가 없습니다.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/combine')}>
            분석하러 가기
          </Button>
        </div>
      </PageContainer>
    );
  }

  const currentFilter = tabFilters.find((t) => t.value === activeTab)!;
  const filteredResults = currentFilter.severities
    ? session.results.filter((r) =>
        currentFilter.severities!.includes(getRiskDisplaySeverity(r.severity)),
      )
    : session.results;
  const { drugs, foods, supplements } = groupSessionItems(session);
  const dateStr = formatSessionDate(session.createdAt);
  const totalPairs = (session.items.length * (session.items.length - 1)) / 2;
  const noInfoCount = totalPairs - session.results.length;
  const exportFilePrefix = getSessionFileDatePrefix(session.createdAt);

  const handleImageSave = async () => {
    try {
      await downloadSessionAsImage(session, `${exportFilePrefix}_yak-josim-result.png`);
      toast('이미지 저장을 시작했어요.');
    } catch {
      toast('이미지 저장에 실패했어요.', {
        description: '브라우저 환경을 확인한 뒤 다시 시도해 주세요.',
      });
    }
  };

  const handlePdfSave = () => {
    try {
      saveSessionAsPdf(session, `${exportFilePrefix}_약 조심 분석 결과`);
    } catch {
      toast('PDF 저장을 시작할 수 없어요.', {
        description: '팝업 차단 여부를 확인해 주세요.',
      });
    }
  };

  return (
    <PageContainer title="분석 결과" showBackButton showBottomNav={false}>
      <div className="space-y-4">
        <DisclaimerBanner />

        {/* Summary card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체 분석 항목</p>
                <p className="text-2xl font-bold text-gray-900">
                  {session.results.length}건
                </p>
              </div>
              <RiskBadge severity={session.overallSeverity} className="text-sm px-3 py-1" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
              {(['critical', 'caution'] as RiskDisplaySeverity[]).map((sev) => {
                const count = countBySeverity(session.results, sev);
                if (count === 0) return null;
                return (
                  <span key={sev}>
                    {sev === 'critical' ? '금기' : '주의'} {count}개
                  </span>
                );
              })}
            </div>
            <div className="mt-4 space-y-3 rounded-2xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">선택 항목</p>
              <div>
                <p className="text-xs font-semibold text-gray-500">약물 ({drugs.length}개)</p>
                <p className="mt-1 text-sm text-gray-900">
                  {drugs.length > 0 ? drugs.map((item) => item.name).join(', ') : '없음'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">음식 ({foods.length}개)</p>
                <p className="mt-1 text-sm text-gray-900">
                  {foods.length > 0 ? foods.map((item) => item.name).join(', ') : '없음'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">영양제 ({supplements.length}개)</p>
                <p className="mt-1 text-sm text-gray-900">
                  {supplements.length > 0 ? supplements.map((item) => item.name).join(', ') : '없음'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 금기 요약 블록 */}
        {countBySeverity(session.results, 'critical') > 0 && (
          <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <p className="text-sm font-semibold text-red-700">
                금기 조합 {countBySeverity(session.results, 'critical')}건이 발견됐어요
              </p>
            </div>
            <div className="space-y-2">
              {session.results
                .filter((r) => getRiskDisplaySeverity(r.severity) === 'critical')
                .map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => navigate(`/detail/${r.id}`)}
                    className="w-full rounded-xl border border-red-100 bg-white px-3 py-2.5 text-left transition-colors hover:bg-red-50"
                  >
                    <p className="text-pretty text-sm font-medium text-gray-900">
                      {r.rule.subjectName} + {r.rule.objectName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-0.5 text-xs font-medium text-red-500">
                      자세히 보기 <ChevronRight className="h-3 w-3" />
                    </p>
                  </button>
                ))}
            </div>
            <p className="text-xs font-medium text-red-600">지금 바로 의사나 약사에게 상담하세요.</p>
          </div>
        )}

        {/* Filter tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            {tabFilters.map((tab) => {
              const count = tab.severities
                ? tab.severities.reduce((sum, sev) => sum + countBySeverity(session.results, sev), 0)
                : session.results.length;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex-1 gap-1 text-xs">
                  {tab.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium leading-none ${
                    activeTab === tab.value
                      ? 'bg-white/40 text-current'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabFilters.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {/* Content rendered below */}
            </TabsContent>
          ))}
        </Tabs>

        {/* Result cards */}
        <div className="space-y-2">
          {filteredResults.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              해당 카테고리의 결과가 없습니다.
            </p>
          ) : (
            filteredResults.map((result) => (
              <Card
                key={result.id}
                className="cursor-pointer transition-colors hover:bg-gray-50"
                onClick={() => navigate(`/detail/${result.id}`)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <RiskBadge severity={result.severity} />
                  <div className="min-w-0 flex-1">
                    <p className="text-pretty font-medium text-gray-900" data-slot="result-pair-name">
                      {result.rule.subjectName} + {result.rule.objectName}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getRiskSupportTags(result).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {getRiskDisplaySeverity(result.severity) === 'unknown' && (
                      <p className="mt-1 text-xs font-medium text-amber-600">
                        확인 정보 없음은 안전함을 의미하지 않습니다.
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* No-info summary */}
        {noInfoCount > 0 && (
          <p className="text-center text-xs text-gray-400">
            이 외 {noInfoCount}개 조합은 확인된 상호작용 정보가 없어요
          </p>
        )}

        {/* Bottom actions */}
        <div className="grid grid-cols-3 gap-2 pb-4" data-slot="export-actions">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleImageSave}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            이미지 저장
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handlePdfSave}
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF 저장
          </Button>
          <Button
            className="w-full"
            onClick={() => navigate(`/share/${session.id}`)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            공유하기
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
