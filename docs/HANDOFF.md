# 약 조심 — 프론트엔드 인수인계

## 프로젝트 개요

약, 음식, 영양제 조합의 상호작용 위험도를 안내하는 모바일 웹앱.  
현재 **비회원(게스트) 전용 MVP** 상태로, 모든 데이터는 mock으로 동작한다.

**기술 스택:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router v7  
**패키지 매니저:** pnpm 11.1.3 (`packageManager` 필드로 고정)

---

## 페이지 구조

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `OnboardingGuard` | 온보딩 완료 여부 체크 → 완료 시 `/home` 리다이렉트, 미완료 시 `OnboardingPage` 렌더 |
| `/` → `OnboardingPage` | — | 약관 동의 + 사용자 프로필 입력 (별도 경로 없음, `/`에서 조건부 렌더) |
| `/home` | `HomePage` | 서비스 소개, 분석 시작 진입점 |
| `/search` | `SearchPage` | 약 검색 + 상세 정보 조회 |
| `/ocr` | `OcrPage` | 처방전 촬영 → 약 인식 |
| `/add-medicine` | `AddMedicinePage` | 검색 결과에서 분석 목록에 약 추가 |
| `/combine` | `CombinationPage` | 약/음식/영양제 조합 선택 + 분석 실행 |
| `/results` | `ResultsPage` | 분석 결과 목록 (위험도 필터, 이미지/PDF 저장) |
| `/detail/:resultId` | `DetailPage` | 개별 상호작용 상세 정보 |
| `/share/:sessionId` | `SharePage` | 결과 공유 화면 |
| `/settings` | `SettingsPage` | 고령층 모드 토글, 데이터 초기화 |

**하단 네비게이션:** 홈 / 검색 / 분석 / 설정 (4개 탭)

---

## 현재 mock 구조

실제 API가 없고, 아래 두 곳에서 데이터를 가져온다.

```
src/mock/
├── medicines.ts       # 약 목록 + 성분 (하드코딩 ~16개)
├── foods.ts           # 음식 목록 (하드코딩 ~20개)
├── supplements.ts     # 영양제 성분 목록 (하드코딩)
├── interactions.ts    # 상호작용 룰 (하드코딩)
└── index.ts

src/services/
├── medicineService.ts  # 약 검색 · 조회 → mock 참조
├── ocrService.ts       # OCR → 항상 고정된 3개 약 반환
└── analysisService.ts  # 상호작용 분석 → mock 룰 매칭
```

**서비스 레이어는 이미 `async function`으로 분리돼 있어서, 각 파일 내부만 교체하면 된다. 페이지 코드는 건드릴 필요 없음.**

단, **음식·영양제**는 아직 서비스 레이어가 없고 `CombinationPage`에서 mock을 직접 import한다. API 연동 시 서비스 레이어 추가가 필요하다.

---

## API 연동 — 교체 지점 안내

> **중요:** 아래에 나오는 TypeScript 타입은 현재 mock 데이터 기준의 **프론트엔드 내부 구조**다.  
> 백엔드 API 스펙이 확정되지 않았으므로, 실제 API 응답 구조는 백엔드와 별도로 협의해야 한다.  
> API 스펙이 정해지면 각 서비스 파일 내부에서 응답을 프론트 타입으로 변환(매핑)하면 된다. **페이지 코드는 건드리지 않아도 된다.**

---

### 1. 사용자 프로필 (온보딩)

**교체 위치:** `src/contexts/UserContext.tsx`  
**현재 동작:** localStorage에만 저장, 백엔드 전송 없음.

온보딩 완료 시점(`dispatch({ type: 'COMPLETE_ONBOARDING' })` 호출 직후)에 백엔드 전송 로직을 추가하면 된다.

**프론트가 수집하는 데이터 (mock 기준):**
- 생년월일 (`birthDate: string`, 형식: `'YYYY-MM-DD'`)
- 성별 (`sex: 'male' | 'female' | 'other'`)
- 임신 여부 (`isPregnant: boolean`)
- 주요 만성질환 (`chronicConditions: string[]`, 예: `['고혈압', '당뇨']`)
- 65세 이상 여부 (`isElderly: boolean`, 생년월일에서 자동 계산)

**추후 논의 필요:** 현재 프로필 정보(만성질환, 임신 여부 등)가 상호작용 분석 호출 시 전달되지 않는다. 개인화 분석이 필요하다면 분석 API 호출 시 프로필을 함께 넘기는 방식을 백엔드와 협의해야 한다.

---

### 2. 약 검색

**교체 위치:** `src/services/medicineService.ts`

```ts
// 이 함수들의 내부 구현을 실제 API 호출로 교체한다
async function searchMedicines(query: string): Promise<Medicine[]>
async function getMedicineById(id: string): Promise<Medicine | null>
async function getIngredients(): Promise<ActiveIngredient[]>
```

**화면에서 사용하는 약 정보 필드 (mock 기준):**
- `id`, `productName` (약품명), `manufacturer` (제조사)
- `dosageForm` (제형, 예: '정제'), `classification` (구분, 예: '전문의약품')
- `indication` (주요 용도, optional)
- `ingredients` — 성분 목록, 각 성분에 `nameKo`, `amount`, `unit`, `isMain` 사용

실제 API 응답 구조가 다를 경우 이 파일 안에서 변환 처리하면 된다.  
**연동 대상 후보:** 식품의약품안전처 DUR, e약은요, 약학정보원

---

### 3. OCR (처방전 촬영)

**교체 위치:** `src/services/ocrService.ts`

```ts
async function uploadPrescription(file: File): Promise<OcrResult[]>
// OcrResult: { medicine: Medicine, confidence: number }
```

현재는 항상 고정된 3개 약을 반환한다. 실제 구현 시 이미지를 서버로 전송하거나 외부 OCR API를 연동하면 된다.

OCR 결과는 `navigate('/search', { state: { recognizedMedicines } })`로 SearchPage에 전달된다. 반환값이 위 타입을 맞추면 UI는 그대로 동작한다.

---

### 4. 음식 목록

**교체 위치:** `src/mock/foods.ts` (현재 `CombinationPage`에서 직접 import)  
**서비스 레이어 없음 → 신규 작성 필요**

```ts
// 신규 생성: src/services/foodService.ts
async function getFoods(): Promise<FoodItem[]>
async function searchFoods(query: string): Promise<FoodItem[]>
```

`CombinationPage`에서 `import { foods } from '@/mock/foods'` 부분을 서비스 호출로 교체해야 한다.

**화면에서 사용하는 필드 (mock 기준):**
- `id`, `name` (음식명), `group` (카테고리), `aliases` (검색용 별칭)

---

### 5. 영양제 목록

**교체 위치:** `src/mock/supplements.ts` (현재 `CombinationPage`에서 직접 import)  
**서비스 레이어 없음 → 신규 작성 필요**

음식과 동일한 구조. `import { supplements } from '@/mock/supplements'` 부분을 서비스 호출로 교체.

**화면에서 사용하는 필드 (mock 기준):**
- `id`, `nameKo`, `nameEn`, `category`, `aliases`

---

### 6. 상호작용 분석 (핵심)

**교체 위치:** `src/services/analysisService.ts`

```ts
async function analyzeInteractions(items: AnalysisItem[]): Promise<AnalysisSession>
```

**프론트가 API에 넘기는 입력 (mock 기준):**
- 선택된 항목 배열: 각각 `{ type: 'drug'|'food'|'supplement', originalId: string, name: string }`

**프론트가 API로부터 받아서 화면에 표시하는 데이터 (mock 기준):**
- 결과 목록 (`results`): 각 조합 쌍에 대해
  - `severity`: `'critical'|'high'|'medium'|'low'|'unknown'` — 위험도
  - `explanation`: 위험 이유 설명 (상세 화면에 표시)
  - `recommendation`: 권고 사항
  - `rule.subjectName` + `rule.objectName`: 조합 쌍 이름 (예: "와파린 + 아스피린")
  - `rule.interactionType`: 상호작용 유형
  - `rule.minIntervalHours`: 복용 간격 권고 (있을 경우)
  - `rule.evidenceSource`, `rule.evidenceUrl`: 근거 출처

**위험도 화면 표시 매핑** (`src/utils/risk.ts`):

| severity | 화면 표시 | 배지 색상 |
|----------|-----------|-----------|
| `critical` | 금기 | 빨강 |
| `high` / `medium` / `low` | 주의 | 주황 |
| `unknown` | 정보 없음 | 회색 |

---

### 7. 분석 세션 저장 · 조회

**교체 위치:** `src/services/analysisService.ts`

```ts
async function getSessionResults(sessionId: string): Promise<AnalysisSession | null>
```

현재 항상 `null` 반환. 분석 결과가 React Context에만 있어서 새로고침 시 사라진다.  
백엔드 세션 저장이 추가되면 `/share/:sessionId` 화면에서 서버에서 결과를 가져올 수 있다.

---

## 기타 참고사항

- **고령층 모드:** 설정에서 토글 가능. `:root[data-senior="true"]` CSS로 전체 폰트/터치 영역 확대. 생년월일 기준 65세 이상이면 온보딩 완료 시 자동 활성화.
- **이미지/PDF 저장:** `src/utils/share.ts`에서 SVG 생성(이미지) + 인쇄(PDF) 처리. 외부 API 불필요.
- **상태 관리:** React Context 3개 — `UserContext`(프로필), `MedicineContext`(선택된 약), `AnalysisContext`(분석 세션). 서버 상태 라이브러리 없음.
- **사용자 데이터 로컬 저장:** `localStorage['yak-josim-user-state']` (UserContext), `localStorage['yak-josim-medicines']` (MedicineContext).
