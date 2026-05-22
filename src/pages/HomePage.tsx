import { useNavigate } from 'react-router';
import { Pill, ClipboardList, Camera, ShieldAlert, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionCard } from '@/components/common/SectionCard';

const actionCards = [
  {
    label: '약 검색',
    description: '약 이름으로 찾고 필요하면 촬영으로 보조 검색할 수 있어요.',
    path: '/search',
    icon: Pill,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: '분석',
    description: '약, 음식, 영양제를 바로 조합해서 위험 여부를 확인해요.',
    path: '/combine',
    icon: ClipboardList,
    color: 'bg-orange-50 text-orange-600',
  },
] as const;

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <PageContainer showBottomNav>
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#ecfeff_100%)] p-6 shadow-sm ring-1 ring-blue-100">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                <ShieldAlert className="h-3.5 w-3.5" />
                복약 안전 안내 서비스
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                  지금 먹으려는 조합,
                  <br />
                  먼저 확인해보세요
                </h2>
                <p className="text-sm leading-6 text-gray-600">
                  약, 음식, 영양제 조합의 위험 여부를 쉬운 말로 안내해드려요.
                  결과는 의료 진단이 아니라 복약 안전 참고 정보로 제공됩니다.
                </p>
              </div>
            </div>
            <div className="hidden rounded-3xl bg-white/80 p-3 shadow-sm ring-1 ring-blue-100 sm:block">
              <Camera className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
              비회원 바로 이용
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
              금기 · 주의 · 정보 없음
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
              결과 이미지/PDF 저장
            </span>
          </div>

          <Button
            className="mt-5 h-12 w-full rounded-2xl text-sm font-semibold"
            size="lg"
            onClick={() => navigate('/combine')}
          >
            바로 분석 시작하기
          </Button>
        </section>

        <section className="grid gap-3">
          {actionCards.map(({ label, description, path, icon: Icon, color }) => (
            <Card
              key={path}
              className="cursor-pointer border-0 shadow-sm ring-1 ring-gray-200 transition-all hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => navigate(path)}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-gray-900">{label}</p>
                  <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </CardContent>
            </Card>
          ))}
        </section>

        <SectionCard title="이렇게 확인해요">
          <div className="space-y-3">
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">1. 약을 찾거나 추가해요</p>
              <p className="mt-1 text-sm leading-5 text-gray-600">
                약 이름으로 검색하고, 필요하면 처방전 촬영으로 검색을 도와줄 수 있어요.
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">2. 함께 먹는 음식이나 영양제를 선택해요</p>
              <p className="mt-1 text-sm leading-5 text-gray-600">
                대표 목록에서 빠르게 추가하고 조합 분석을 진행할 수 있어요.
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">3. 위험도와 행동 가이드를 확인해요</p>
              <p className="mt-1 text-sm leading-5 text-gray-600">
                금기, 주의, 확인 정보 없음으로 결과를 보고 시간 간격이나 상담 필요 여부도 함께 확인해요.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
