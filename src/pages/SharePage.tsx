import { useNavigate } from 'react-router';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { PageContainer } from '@/components/layout/PageContainer';
import { RiskBadge } from '@/components/common/RiskBadge';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { getRiskDisplayLabel, getRiskSupportTags } from '@/utils/risk';
import { buildShareText, formatSessionDate, groupSessionItems } from '@/utils/share';

export default function SharePage() {
  const navigate = useNavigate();
  const { state } = useAnalysisContext();

  const session = state.currentSession;

  if (!session) {
    return (
      <PageContainer title="결과 공유" showBackButton showBottomNav={false}>
        <div className="flex flex-col items-center py-20">
          <p className="text-gray-400">공유할 결과가 없습니다.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            뒤로 가기
          </Button>
        </div>
      </PageContainer>
    );
  }

  const date = new Date(session.createdAt);
  const dateStr = formatSessionDate(date);
  const { drugs, foods, supplements } = groupSessionItems(session);
  const shareText = buildShareText(session);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast('결과를 복사했어요.');
    } catch {
      toast('복사에 실패했어요.', {
        description: '브라우저 권한을 확인해 주세요.',
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '약 조심 - 분석 결과',
          text: shareText,
        });
      } catch {
        handleCopyText();
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <PageContainer title="결과 공유" showBackButton showBottomNav={false}>
      <div className="space-y-4">
        {/* Preview card */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900">약 조심</p>
              <p className="text-xs text-gray-400">{dateStr}</p>
            </div>

            <div className="text-sm text-gray-600">
              <p className="font-semibold text-gray-900">선택 항목</p>
              <p className="leading-5">약물 ({drugs.length}개): {drugs.length > 0 ? drugs.map((item) => item.name).join(', ') : '없음'}</p>
              <p className="mt-1 leading-5">음식 ({foods.length}개): {foods.length > 0 ? foods.map((item) => item.name).join(', ') : '없음'}</p>
              <p className="mt-1 leading-5">영양제 ({supplements.length}개): {supplements.length > 0 ? supplements.map((item) => item.name).join(', ') : '없음'}</p>
            </div>

            <div className="space-y-2">
              {session.results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-start gap-2 rounded-lg bg-gray-50 p-3"
                >
                  <RiskBadge severity={result.severity} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {result.rule.subjectName} + {result.rule.objectName}
                    </p>
                    {getRiskSupportTags(result).length > 0 && (
                      <p className="mt-1 text-xs text-orange-700">
                        {getRiskSupportTags(result).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {session.results.length === 0 && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-900">확인 정보 없음</p>
                  <p className="mt-1 text-xs text-gray-500">
                    선택한 조합에 대해 확인된 상호작용 정보가 없습니다.
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 border-t pt-3">
              본 정보는 의료 진단을 대체하지 않습니다. 복약 관련 결정은 반드시
              의사·약사와 상담하세요.
            </p>
          </CardContent>
        </Card>

        {/* Share options */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={handleCopyText}>
            <Copy className="mr-2 h-4 w-4" />
            텍스트 복사
          </Button>
          <Button className="w-full" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            공유하기
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
