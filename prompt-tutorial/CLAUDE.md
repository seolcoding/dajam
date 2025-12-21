# Prompt Engineering Interactive Tutorial - Web Version

## 프로젝트 개요
Anthropic의 Jupyter 노트북 기반 프롬프트 엔지니어링 튜토리얼을 웹 기반 인터랙티브 앱으로 변환

## 핵심 원칙

### 콘텐츠
- **원본 커리큘럼 준수**: `Anthropic 1P/` 폴더의 노트북 내용을 그대로 따름
- 레슨, 예제, 연습문제, 힌트, 채점 로직 모두 원본에서 추출
- 임의로 콘텐츠를 생성하지 않음

### 기술 스택
- **Frontend Only**: 서버 없이 순수 클라이언트 SPA
- Vite + React + TypeScript + Tailwind CSS
- GitHub Pages 정적 호스팅 가능

### API
- API 키는 `.env` 파일로 관리 (VITE_OPENAI_API_KEY)
- 기본 모델: gpt-4.1-mini
- OpenRouter 호환 지원

## 파일 구조

```
web/                      # 웹 앱 소스
├── src/
│   ├── content/          # 노트북에서 추출한 콘텐츠
│   ├── components/       # UI 컴포넌트
│   ├── lib/              # LLM, 채점, 저장소
│   └── pages/            # 페이지
│
Anthropic 1P/             # 원본 노트북 (콘텐츠 소스)
├── 01_Basic_Prompt_Structure.ipynb
├── 02_Being_Clear_and_Direct.ipynb
├── ...
└── hints.py              # 힌트 데이터
```

## 채점 로직
- 원본 노트북의 `grade_exercise()` 함수와 정규식을 그대로 포팅
- 예: `re.compile(r'^(?=.*1)(?=.*2)(?=.*3).*$', re.DOTALL)`
