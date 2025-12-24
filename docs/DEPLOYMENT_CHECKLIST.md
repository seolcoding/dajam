# Dajam 배포 체크리스트

## 0. 폴더명 변경 (최우선)

**현재**: `/Users/sdh/Dev/02_production/dajaem`
**변경**: `/Users/sdh/Dev/02_production/dajam`

### 터미널에서 실행
```bash
cd /Users/sdh/Dev/02_production
mv dajaem dajam
cd dajam

# 확인
pwd  # /Users/sdh/Dev/02_production/dajam
```

---

## 1. GitHub 리포지토리 이름 변경

### 현재 상태
- Repository: `seolcoding/seolcoding-apps`
- 변경 필요: `seolcoding/dajam`

### 변경 절차

1. **GitHub 웹에서 리포지토리 이름 변경**

   ① 리포지토리 페이지 접속
   ```
   https://github.com/seolcoding/seolcoding-apps
   ```

   ② Settings 탭 클릭

   ③ 페이지 맨 아래 "Danger Zone" 섹션으로 스크롤

   ④ "Rename repository" 클릭

   ⑤ 새 이름 입력: `dajam`

   ⑥ "I understand, rename this repository" 클릭

2. **로컬 Git Remote URL 업데이트**
   ```bash
   cd /Users/sdh/Dev/02_production/dajam

   # Remote URL 변경
   git remote set-url origin git@github.com:seolcoding/dajam.git

   # 확인
   git remote -v
   # 출력: origin  git@github.com:seolcoding/dajam.git (fetch)
   #       origin  git@github.com:seolcoding/dajam.git (push)
   ```

3. **변경사항 커밋 및 푸시**
   ```bash
   git add -A
   git commit -m "chore: rebrand to Dajam (다잼) with dajam.seolcoding.com domain"
   git push origin main
   ```

## 2. Vercel 프로젝트 설정

### 현재 상태
- 프로젝트명: 확인 필요 → `dajam`으로 변경
- 도메인: `dajam.seolcoding.com` (신규 추가)

### 변경 절차

### 2-1. Vercel 프로젝트 이름 변경

① Vercel 대시보드 접속
```
https://vercel.com/dashboard
```

② 프로젝트 선택 (seolcoding-apps 또는 기존 프로젝트명)

③ **Settings** → **General** → **Project Name**

④ 현재 이름 → `dajam` 변경

⑤ **Save** 클릭

### 2-2. 커스텀 도메인 추가

① **Settings** → **Domains** 탭

② "Add" 버튼 클릭

③ 도메인 입력: `dajam.seolcoding.com`

④ Vercel이 제시하는 DNS 레코드 복사

⑤ **DNS 제공자**(예: Cloudflare, Route 53, 가비아 등)에서 설정:
   ```
   Type: CNAME
   Name: dajam
   Value: cname.vercel-dns.com
   TTL: Auto
   ```

⑥ Vercel로 돌아와서 "Verify" 클릭

⑦ ✅ 인증 완료 확인 (최대 48시간 소요)

### 2-3. GitHub 연동 확인

① **Settings** → **Git**

② Connected Git Repository 확인:
   - 현재: `seolcoding/seolcoding-apps`
   - GitHub에서 리포 이름 변경 후: `seolcoding/dajam`
   - Vercel이 자동으로 새 이름 감지함

③ Production Branch가 `main`인지 확인

### 2-4. 환경 변수 확인

① **Settings** → **Environment Variables**

② 필수 변수 확인:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_api_key
   ```

③ 모든 환경(Production, Preview, Development)에 적용되어 있는지 확인

### 2-5. 배포

① Git 푸시 시 자동 배포:
   ```bash
   git push origin main
   ```

② 또는 수동 재배포:
   - **Deployments** → 최신 배포 → **⋯** → **Redeploy**

## 3. Supabase 프로젝트 설정

### 현재 상태
- 프로젝트명: 확인 필요 → `dajam` 또는 `다잼`으로 변경
- 도메인: `dajam.seolcoding.com` (추가 필요)

### 변경 절차

### 3-1. Supabase 프로젝트 이름 변경

① Supabase 대시보드 접속
```
https://supabase.com/dashboard
```

② 프로젝트 선택

③ **Settings** (왼쪽 사이드바)

④ **General** 탭

⑤ **Project name** 필드:
   - 현재 이름 → `dajam` 또는 `다잼` 변경
   - (한글 지원 확인, 안되면 `dajam` 사용)

⑥ **Save** 클릭

### 3-2. 허용 도메인 추가 (Authentication)

① **Settings** → **Authentication**

② **Site URL** 설정:
   ```
   https://dajam.seolcoding.com
   ```

③ **Redirect URLs** 추가:
   ```
   https://dajam.seolcoding.com/**
   https://dajam.seolcoding.com/auth/callback
   http://localhost:3000/** (개발용 유지)
   ```

④ **Save** 클릭

### 3-3. CORS 설정 (API)

① **Settings** → **API**

② 페이지 아래 **Configuration** 섹션

③ **Additional Allowed Origins** (또는 CORS) 확인:
   ```
   https://dajam.seolcoding.com
   http://localhost:3000
   ```

④ 없으면 추가 후 **Save**

### 3-4. RLS 정책 확인 (Realtime Apps)

① **Table Editor** → 각 테이블 확인

② RLS가 활성화된 테이블들:
   - `audience_engage_sessions`
   - `audience_engage_participants`
   - `live_voting_sessions`
   - 등등

③ 정책에서 `dajam.seolcoding.com` 도메인의 익명 사용자 접근 확인

④ 문제 있으면 마이그레이션 파일 재실행:
   ```bash
   # 로컬에서 Supabase CLI로
   supabase db push
   ```

## 4. 최종 테스트

### 로컬 빌드 확인
```bash
cd /Users/sdh/Dev/02_production/dajaem
pnpm build
pnpm start
```

### 프로덕션 E2E 테스트
```bash
pnpm test:e2e:deployed
```

### 체크리스트

#### 0단계: 로컬 준비
- [ ] 폴더명 변경: `dajaem` → `dajam`
- [ ] 변경사항 커밋 준비

#### 1단계: GitHub
- [ ] GitHub 웹에서 리포지토리 이름 변경 (`seolcoding-apps` → `dajam`)
- [ ] 로컬 Git remote URL 업데이트
- [ ] 브랜딩 변경사항 커밋 및 푸시

#### 2단계: Vercel
- [ ] Vercel 프로젝트 이름 변경 → `dajam`
- [ ] 커스텀 도메인 추가: `dajam.seolcoding.com`
- [ ] DNS 레코드 설정 (CNAME)
- [ ] GitHub 연동 확인 (`seolcoding/dajam`)
- [ ] 환경 변수 확인 (SUPABASE_URL, SUPABASE_ANON_KEY, KAKAO_APP_KEY)
- [ ] 자동/수동 배포

#### 3단계: Supabase
- [ ] Supabase 프로젝트 이름 변경 → `dajam` 또는 `다잼`
- [ ] Site URL: `https://dajam.seolcoding.com`
- [ ] Redirect URLs 추가
- [ ] CORS 설정: `dajam.seolcoding.com` 추가
- [ ] RLS 정책 확인

#### 4단계: 테스트
- [ ] 로컬 빌드 성공 (`pnpm build`)
- [ ] 프로덕션 배포 성공
- [ ] https://dajam.seolcoding.com 접속 확인
- [ ] 실시간 앱 동작 확인 (audience-engage, live-voting, bingo-game 등)
- [ ] E2E 테스트 (`pnpm test:e2e:deployed`)

## 5. DNS 전파 확인

배포 후 DNS 전파 상태 확인:
```bash
# macOS/Linux
dig dajam.seolcoding.com

# 또는 온라인 도구 사용
# https://www.whatsmydns.net/#CNAME/dajam.seolcoding.com
```

---

## 브랜딩 완료 상태

### ✅ 로컬 완료
- [x] package.json: `"name": "dajam"`
- [x] package.json description: "다잼(Dajam) - 다함께 재미있게 잘"
- [x] URL 설정: `dajam.seolcoding.com`
- [x] README.md 브랜딩 업데이트
- [x] CLAUDE.md 브랜딩 업데이트
- [x] 문서 파일명 변경: `DAJAEM` → `DAJAM`
- [x] 소스 코드 브랜딩: `DaJaem` → `Dajam`
- [x] TypeScript 컴파일 확인
- [x] 레거시 코드 정리 (apps/, 임시 문서 등)

### ⏳ 사용자 작업 필요
- [ ] 폴더명 변경: `dajaem` → `dajam` (터미널)
- [ ] GitHub 리포지토리 이름 변경 (웹)
- [ ] Vercel 프로젝트 이름 및 도메인 설정 (웹)
- [ ] DNS 레코드 추가 (DNS 제공자)
- [ ] Supabase 프로젝트명 및 도메인 설정 (웹)
- [ ] 프로덕션 배포 및 테스트

---

## 🚀 빠른 실행 가이드

### Step 1: 폴더명 변경 (터미널)
```bash
cd /Users/sdh/Dev/02_production
mv dajaem dajam
cd dajam
```

### Step 2: GitHub 리포 이름 변경 (웹)
1. https://github.com/seolcoding/seolcoding-apps
2. Settings → Danger Zone → Rename repository → `dajam`

### Step 3: Git Remote 업데이트 (터미널)
```bash
git remote set-url origin git@github.com:seolcoding/dajam.git
git add -A
git commit -m "chore: rebrand to Dajam (다잼) with dajam.seolcoding.com domain"
git push origin main
```

### Step 4: Vercel 설정 (웹)
1. https://vercel.com/dashboard → 프로젝트 선택
2. Settings → General → Project Name → `dajam`
3. Settings → Domains → Add `dajam.seolcoding.com`
4. DNS에서 CNAME 레코드 추가: `dajam` → `cname.vercel-dns.com`
5. (선택) `jam.seolcoding.com` → `dajam.seolcoding.com` 리다이렉트 설정

### Step 5: Supabase 설정 (웹)
1. https://supabase.com/dashboard → 프로젝트 선택
2. Settings → General → Project name → `dajam`
3. Settings → Authentication → Site URL → `https://dajam.seolcoding.com`
4. Settings → API → CORS → `https://dajam.seolcoding.com` 추가

### Step 6: 배포 확인
```bash
# Vercel 자동 배포 대기 또는 수동 Redeploy
# 배포 완료 후:
pnpm test:e2e:deployed
```
