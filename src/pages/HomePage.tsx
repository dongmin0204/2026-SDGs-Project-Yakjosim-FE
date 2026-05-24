import { useNavigate } from 'react-router';
import {
  Pill,
  ClipboardList,
  Camera,
  Search,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
//나중에 이미지나 좋은 디자인으로 변경하기 임시로 lucide 사용
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';

const features = [
  {
    icon: Search,
    title: '약 이름으로 빠르게 검색',
    description: '복용 중인 약을 검색하고, 처방전 촬영으로도 찾을 수 있어요.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ClipboardList,
    title: '조합 분석 한번에',
    description: '약 + 음식 + 영양제 조합의 위험 여부를 바로 확인해요.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: ShieldCheck,
    title: '전문 데이터 기반 안내',
    description: '약학정보원·식약처 DUR 데이터 기반으로 안내합니다.',
    color: 'bg-emerald-50 text-emerald-600',
  },
] as const;

const steps = [
  {
    number: '1',
    title: '약을 찾거나 추가해요',
    description: '약 이름으로 검색하고, 필요하면 처방전 촬영으로 검색을 도와줄 수 있어요.',
  },
  {
    number: '2',
    title: '함께 먹는 것을 선택해요',
    description: '대표 목록에서 음식이나 영양제를 빠르게 추가하고 조합해요.',
  },
  {
    number: '3',
    title: '위험도와 가이드를 확인해요',
    description: '금기, 주의, 확인 정보 없음으로 결과를 보고 행동 가이드도 함께 확인해요.',
  },
] as const;

const actionCards = [
  {
    label: '약 검색',
    description: '약 이름으로 찾고 필요하면 촬영으로 보조 검색할 수 있어요.',
    path: '/search' as const,
    icon: Pill,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: '처방전 촬영',
    description: '처방전 사진으로 약물을 빠르게 인식하고 추가할 수 있어요.',
    path: '/ocr' as const,
    icon: Camera,
    color: 'bg-violet-50 text-violet-600',
  },
] as const;

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <PageContainer showBottomNav>
      <div className="space-y-8">
        {/* 맨 앞 히어로 */}
        <section className="animate-fade-in overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_50%,#ecfeff_100%)] p-6 shadow-sm ring-1 ring-blue-100">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                복약 안전 안내 서비스
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  지금 먹으려는 조합,
                  <br />
                  먼저 확인해보세요
                </h2>
                <p className="text-sm leading-6 text-gray-600">
                  약, 음식, 영양제 조합의 위험 여부를
                  <br className="hidden min-[360px]:block" />
                  쉬운 말로 안내해드려요.
                </p>
              </div>
            </div>

            <div className="animate-float hidden rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-blue-100 sm:block">
              <Pill className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div
            className="animate-slide-up mt-5 flex flex-wrap gap-2"
            style={{ animationDelay: '0.2s' }}
          >
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
            className="animate-slide-up mt-5 h-12 w-full rounded-2xl text-sm font-semibold"
            style={{ animationDelay: '0.35s' }}
            size="lg"
            onClick={() => navigate('/combine')}
          >
            바로 분석 시작하기
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </section>

        {/* 특징 설명 세션*/}
        <section className="space-y-3">
          <h3
            className="animate-slide-up px-1 text-lg font-semibold text-gray-900"
            style={{ animationDelay: '0.3s' }}
          >
            주요 기능
          </h3>
          <div className="grid gap-3">
            {features.map(({ icon: Icon, title, description, color }, i) => (
              <Card
                key={title}
                className="animate-slide-up border-0 shadow-sm ring-1 ring-gray-200"
                style={{ animationDelay: `${0.35 + i * 0.1}s` }}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 바로가기 */}
        <section className="space-y-3">
          <h3
            className="animate-slide-up px-1 text-lg font-semibold text-gray-900"
            style={{ animationDelay: '0.5s' }}
          >
            바로가기
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {actionCards.map(({ label, description, path, icon: Icon, color }, i) => (
              <Card
                key={path}
                className="animate-slide-up cursor-pointer border-0 shadow-sm ring-1 ring-gray-200 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${0.55 + i * 0.1}s` }}
                onClick={() => navigate(path)}
              >
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 self-end text-gray-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 어떤 기능이 있나요?? */}
        <section
          className="animate-slide-up space-y-4"
          style={{ animationDelay: '0.6s' }}
        >
          <h3 className="px-1 text-lg font-semibold text-gray-900">
            이렇게 확인해요
          </h3>
          <div className="space-y-3">
            {steps.map(({ number, title, description }, i) => (
              <div
                key={number}
                className="animate-slide-in-right flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
                style={{ animationDelay: `${0.7 + i * 0.12}s` }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {number}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </PageContainer>
  );
}
