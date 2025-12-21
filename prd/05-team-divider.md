# 팀 나누기 (Team Divider)

## 1. 개요

### 1.1 목적
- **타겟 사용자**: 교사, 워크샵 진행자, 팀장, 이벤트 매니저
- **사용 시나리오**: 워크샵, 체육대회, 프로젝트 팀빌딩, 수업 조편성
- **핵심 가치**: 공정한 랜덤 분배, 빠른 팀 구성, 시각적 결과 공유

### 1.2 주요 특징
- 다양한 입력 방식 (직접 입력, 줄바꿈 텍스트, CSV 파일)
- 유연한 팀 설정 (팀 수 지정 or 팀당 인원 지정)
- 실시간 랜덤 분배 애니메이션
- 팀별 색상 자동 할당 (시각적 구분)
- QR 코드 생성 (각 팀원에게 배정 결과 전달)
- PDF 내보내기 (인쇄 가능)

---

## 2. 유사 서비스 분석

### 2.1 해외 서비스

#### [Random Team Generator - RandomLists](https://www.randomlists.com/team-generator)
- **장점**: 심플한 UI, 빠른 분배
- **단점**: 기본 기능만 제공, 시각화 부족

#### [Keamk](https://www.keamk.com/)
- **장점**: 스킬 레벨/성별 기준 균형 분배, 고급 기능
- **단점**: 복잡한 UI, 학습 곡선 높음

#### [Team Picker Wheel](https://pickerwheel.com/tools/random-team-generator/)
- **장점**: 룰렛 애니메이션, 재미 요소
- **단점**: 많은 인원 처리 시 비효율적

#### [Comment Picker](https://commentpicker.com/team-generator.php)
- **장점**: 최대 1,000명/팀 처리 가능
- **단점**: 시각적 결과 미흡

### 2.2 국내 서비스

#### [모두의 뽑기 대장 (ClassTri)](http://classtri.com)
- **장점**: 한국 교육 환경 최적화, 엑셀 연동
- **단점**: 구식 UI, 모바일 지원 부족

### 2.3 차별화 전략
1. **현대적 UI/UX**: Tailwind CSS v4 + 애니메이션
2. **모바일 우선**: 반응형 디자인
3. **QR 코드 통합**: 각 팀원에게 배정 결과 즉시 공유
4. **PDF 내보내기**: 인쇄 가능한 팀 명단
5. **다국어 지원**: 한국어/영어

---

## 3. 오픈소스 라이브러리

### 3.1 핵심 라이브러리

| 라이브러리 | 용도 | 라이선스 |
|-----------|------|---------|
| **Fisher-Yates Shuffle** | 공정한 랜덤 분배 알고리즘 | Public Domain |
| **qrcode** | QR 코드 생성 | MIT |
| **jsPDF** | PDF 문서 생성 | MIT |
| **papaparse** | CSV 파싱 | MIT |
| **react-confetti** | 완료 애니메이션 | MIT |

### 3.2 설치 명령

```bash
npm install qrcode jspdf papaparse react-confetti
npm install -D @types/qrcode @types/papaparse
```

---

## 4. 기술 스택

### 4.1 프론트엔드
- **빌드 도구**: Vite 6.x
- **프레임워크**: React 19 + TypeScript 5.7
- **스타일링**: Tailwind CSS v4
- **상태 관리**: React useState/useReducer (Redux 불필요)

### 4.2 유틸리티
- **QR 코드**: qrcode ^1.5.4
- **PDF 생성**: jsPDF ^2.5.2
- **CSV 처리**: papaparse ^5.4.1
- **애니메이션**: react-confetti ^6.1.0

### 4.3 개발 환경
- **Node.js**: 20.x LTS
- **패키지 매니저**: npm
- **타입 체크**: TypeScript strict mode
- **린터**: ESLint + Prettier

---

## 5. 핵심 기능 및 구현

### 5.1 인원 입력

#### 5.1.1 입력 방식
1. **직접 입력**: 이름 입력 후 Enter/추가 버튼
2. **줄바꿈 텍스트**: 복사-붙여넣기 (각 줄이 1명)
3. **CSV 파일 업로드**: 대규모 인원 처리

#### 5.1.2 구현 예시

```typescript
// types/team.ts
export interface Participant {
  id: string;
  name: string;
  team?: number; // 배정된 팀 번호
}

export interface TeamSettings {
  mode: 'byTeamCount' | 'byMemberCount';
  teamCount?: number; // 팀 수 지정
  memberCount?: number; // 팀당 인원 지정
}

// hooks/useParticipantInput.ts
import { useState } from 'react';
import Papa from 'papaparse';
import { Participant } from '../types/team';

export function useParticipantInput() {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const addParticipant = (name: string) => {
    if (!name.trim()) return;
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: name.trim(),
    };
    setParticipants(prev => [...prev, newParticipant]);
  };

  const addBulkText = (text: string) => {
    const names = text.split('\n').filter(n => n.trim());
    const newParticipants: Participant[] = names.map(name => ({
      id: crypto.randomUUID(),
      name: name.trim(),
    }));
    setParticipants(prev => [...prev, ...newParticipants]);
  };

  const uploadCSV = (file: File) => {
    Papa.parse(file, {
      complete: (results) => {
        const names = results.data.flat().filter(n => n && typeof n === 'string');
        const newParticipants: Participant[] = names.map(name => ({
          id: crypto.randomUUID(),
          name: String(name).trim(),
        }));
        setParticipants(prev => [...prev, ...newParticipants]);
      },
      skipEmptyLines: true,
    });
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const clearAll = () => {
    setParticipants([]);
  };

  return {
    participants,
    addParticipant,
    addBulkText,
    uploadCSV,
    removeParticipant,
    clearAll,
  };
}
```

---

### 5.2 팀 설정

#### 5.2.1 설정 방식
- **팀 수 지정**: "5개 팀으로 나누기" (균등 분배)
- **팀당 인원 지정**: "팀당 4명" (남는 인원은 마지막 팀)

#### 5.2.2 구현 예시

```typescript
// components/TeamSettings.tsx
import React from 'react';
import { TeamSettings } from '../types/team';

interface TeamSettingsProps {
  settings: TeamSettings;
  totalParticipants: number;
  onChange: (settings: TeamSettings) => void;
}

export function TeamSettingsComponent({ settings, totalParticipants, onChange }: TeamSettingsProps) {
  const handleModeChange = (mode: TeamSettings['mode']) => {
    onChange({ ...settings, mode });
  };

  const calculateTeams = () => {
    if (settings.mode === 'byTeamCount' && settings.teamCount) {
      return {
        teams: settings.teamCount,
        membersPerTeam: Math.ceil(totalParticipants / settings.teamCount),
      };
    }
    if (settings.mode === 'byMemberCount' && settings.memberCount) {
      return {
        teams: Math.ceil(totalParticipants / settings.memberCount),
        membersPerTeam: settings.memberCount,
      };
    }
    return null;
  };

  const preview = calculateTeams();

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={() => handleModeChange('byTeamCount')}
          className={`px-4 py-2 rounded ${settings.mode === 'byTeamCount' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          팀 수 지정
        </button>
        <button
          onClick={() => handleModeChange('byMemberCount')}
          className={`px-4 py-2 rounded ${settings.mode === 'byMemberCount' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          팀당 인원 지정
        </button>
      </div>

      {settings.mode === 'byTeamCount' && (
        <input
          type="number"
          min="2"
          value={settings.teamCount || ''}
          onChange={(e) => onChange({ ...settings, teamCount: Number(e.target.value) })}
          placeholder="팀 수 입력"
          className="w-full px-4 py-2 border rounded"
        />
      )}

      {settings.mode === 'byMemberCount' && (
        <input
          type="number"
          min="1"
          value={settings.memberCount || ''}
          onChange={(e) => onChange({ ...settings, memberCount: Number(e.target.value) })}
          placeholder="팀당 인원 입력"
          className="w-full px-4 py-2 border rounded"
        />
      )}

      {preview && (
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm text-gray-600">
            예상: {preview.teams}개 팀, 팀당 약 {preview.membersPerTeam}명
          </p>
        </div>
      )}
    </div>
  );
}
```

---

### 5.3 랜덤 분배 (Fisher-Yates Shuffle)

#### 5.3.1 알고리즘 설명
- **Fisher-Yates Shuffle**: O(n) 시간복잡도, 모든 순열이 동일한 확률
- **공정성 보장**: 편향 없는 완전 랜덤

#### 5.3.2 구현 코드

```typescript
// utils/shuffle.ts

/**
 * Fisher-Yates Shuffle Algorithm
 * - 시간복잡도: O(n)
 * - 공간복잡도: O(1) (in-place)
 * - 완전 랜덤: 모든 순열이 동일한 확률 (1/n!)
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array]; // 원본 보존

  for (let i = shuffled.length - 1; i > 0; i--) {
    // 0 ~ i 사이의 랜덤 인덱스
    const j = Math.floor(Math.random() * (i + 1));

    // swap
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * 랜덤 분배 로직
 */
export function divideIntoTeams(
  participants: Participant[],
  settings: TeamSettings
): Participant[][] {
  // 1. Fisher-Yates로 랜덤 셔플
  const shuffled = fisherYatesShuffle(participants);

  // 2. 팀 수 계산
  let teamCount: number;
  if (settings.mode === 'byTeamCount' && settings.teamCount) {
    teamCount = settings.teamCount;
  } else if (settings.mode === 'byMemberCount' && settings.memberCount) {
    teamCount = Math.ceil(participants.length / settings.memberCount);
  } else {
    throw new Error('Invalid team settings');
  }

  // 3. 균등 분배
  const teams: Participant[][] = Array.from({ length: teamCount }, () => []);

  shuffled.forEach((participant, index) => {
    const teamIndex = index % teamCount;
    teams[teamIndex].push({
      ...participant,
      team: teamIndex,
    });
  });

  return teams;
}
```

---

### 5.4 팀별 색상 할당

#### 5.4.1 색상 팔레트
- **Tailwind CSS 색상**: blue, green, yellow, red, purple, pink, indigo, teal
- **동적 생성**: HSL 색상 공간에서 고른 간격

#### 5.4.2 구현 예시

```typescript
// utils/colors.ts

/**
 * Tailwind 기반 팀 색상 팔레트
 */
const TEAM_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
];

/**
 * HSL 기반 동적 색상 생성 (팀이 8개 초과 시)
 */
export function generateTeamColors(teamCount: number) {
  if (teamCount <= TEAM_COLORS.length) {
    return TEAM_COLORS.slice(0, teamCount);
  }

  // HSL 색상 공간에서 균등 분배
  const colors = [];
  for (let i = 0; i < teamCount; i++) {
    const hue = (360 / teamCount) * i;
    colors.push({
      bg: `hsl(${hue}, 70%, 90%)`,
      text: `hsl(${hue}, 70%, 30%)`,
      border: `hsl(${hue}, 70%, 60%)`,
    });
  }

  return colors;
}
```

---

### 5.5 결과 시각화

#### 5.5.1 디스플레이 요소
- **팀 카드**: 팀 이름, 인원 수, 색상 코딩
- **멤버 리스트**: 각 팀원 이름, 번호
- **애니메이션**: Confetti 효과 (분배 완료 시)

#### 5.5.2 구현 예시

```typescript
// components/TeamResult.tsx
import React from 'react';
import Confetti from 'react-confetti';
import { Participant } from '../types/team';
import { generateTeamColors } from '../utils/colors';

interface TeamResultProps {
  teams: Participant[][];
  showConfetti: boolean;
}

export function TeamResult({ teams, showConfetti }: TeamResultProps) {
  const colors = generateTeamColors(teams.length);

  return (
    <div className="relative">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, index) => (
          <div
            key={index}
            className={`${colors[index].bg} ${colors[index].border} border-2 rounded-lg p-6`}
          >
            <h3 className={`text-2xl font-bold ${colors[index].text} mb-4`}>
              팀 {index + 1}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {team.length}명
            </p>
            <ul className="space-y-2">
              {team.map((member, idx) => (
                <li
                  key={member.id}
                  className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded"
                >
                  <span className="font-bold text-gray-500">
                    {idx + 1}.
                  </span>
                  <span className="font-medium">
                    {member.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 5.6 QR 코드 생성

#### 5.6.1 QR 코드 데이터 형식
- **URL 인코딩**: `https://seolcoding.com/team-divider?team=1&member=홍길동`
- **JSON 인코딩**: `{"team": 1, "member": "홍길동", "members": ["..."]}`

#### 5.6.2 구현 코드

```typescript
// utils/qrcode.ts
import QRCode from 'qrcode';

export interface QRCodeData {
  team: number;
  teamName: string;
  member: string;
  allMembers: string[];
}

/**
 * 팀 배정 정보를 QR 코드로 생성
 */
export async function generateTeamQRCode(data: QRCodeData): Promise<string> {
  // JSON 데이터 압축 (Base64 인코딩)
  const jsonString = JSON.stringify({
    t: data.team, // team
    n: data.member, // name
    m: data.allMembers, // members
  });

  const base64Data = btoa(encodeURIComponent(jsonString));

  // QR 코드 URL (자체 앱에서 디코딩)
  const qrUrl = `${window.location.origin}/team-result?d=${base64Data}`;

  try {
    // QR 코드 이미지 생성 (Data URL)
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'M',
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw error;
  }
}

/**
 * 모든 팀원의 QR 코드 일괄 생성
 */
export async function generateAllQRCodes(teams: Participant[][]): Promise<Map<string, string>> {
  const qrCodes = new Map<string, string>();

  for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
    const team = teams[teamIndex];
    const allMembers = team.map(p => p.name);

    for (const member of team) {
      const qrData: QRCodeData = {
        team: teamIndex + 1,
        teamName: `팀 ${teamIndex + 1}`,
        member: member.name,
        allMembers,
      };

      const qrDataUrl = await generateTeamQRCode(qrData);
      qrCodes.set(member.id, qrDataUrl);
    }
  }

  return qrCodes;
}

/**
 * QR 코드 데이터 디코딩 (결과 페이지에서 사용)
 */
export function decodeQRData(base64Data: string): QRCodeData | null {
  try {
    const jsonString = decodeURIComponent(atob(base64Data));
    const decoded = JSON.parse(jsonString);

    return {
      team: decoded.t,
      teamName: `팀 ${decoded.t}`,
      member: decoded.n,
      allMembers: decoded.m,
    };
  } catch (error) {
    console.error('QR Code decoding failed:', error);
    return null;
  }
}
```

#### 5.6.3 QR 코드 표시 컴포넌트

```typescript
// components/QRCodeDisplay.tsx
import React, { useEffect, useState } from 'react';
import { generateAllQRCodes } from '../utils/qrcode';
import { Participant } from '../types/team';

interface QRCodeDisplayProps {
  teams: Participant[][];
}

export function QRCodeDisplay({ teams }: QRCodeDisplayProps) {
  const [qrCodes, setQrCodes] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAllQRCodes(teams).then(codes => {
      setQrCodes(codes);
      setLoading(false);
    });
  }, [teams]);

  if (loading) {
    return <div className="text-center py-8">QR 코드 생성 중...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {teams.map((team, teamIndex) =>
        team.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-lg shadow text-center">
            <img
              src={qrCodes.get(member.id)}
              alt={`${member.name} QR`}
              className="w-full h-auto mb-2"
            />
            <p className="font-bold text-sm">팀 {teamIndex + 1}</p>
            <p className="text-xs text-gray-600">{member.name}</p>
          </div>
        ))
      )}
    </div>
  );
}
```

---

### 5.7 PDF 내보내기

#### 5.7.1 PDF 구조
- **표지**: 제목, 날짜, 총 인원/팀 수
- **팀별 페이지**: 팀 이름, 멤버 리스트, QR 코드
- **전체 명단**: 알파벳 순 정렬

#### 5.7.2 구현 코드

```typescript
// utils/pdf.ts
import { jsPDF } from 'jspdf';
import { Participant } from '../types/team';

export async function exportTeamsPDF(teams: Participant[][], qrCodes: Map<string, string>) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 한글 폰트 (기본 폰트는 한글 미지원)
  // 주의: 프로덕션에서는 NanumGothic.ttf 등을 Base64로 임베드 필요
  doc.setFont('helvetica');

  // 표지
  doc.setFontSize(24);
  doc.text('팀 분배 결과', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`총 인원: ${teams.reduce((sum, t) => sum + t.length, 0)}명`, pageWidth / 2, 60, { align: 'center' });
  doc.text(`팀 수: ${teams.length}개`, pageWidth / 2, 70, { align: 'center' });
  doc.text(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, pageWidth / 2, 80, { align: 'center' });

  // 팀별 페이지
  teams.forEach((team, teamIndex) => {
    doc.addPage();

    doc.setFontSize(20);
    doc.text(`팀 ${teamIndex + 1}`, 20, 20);

    doc.setFontSize(12);
    doc.text(`${team.length}명`, 20, 30);

    // 멤버 리스트
    let yPosition = 50;
    team.forEach((member, idx) => {
      doc.text(`${idx + 1}. ${member.name}`, 20, yPosition);

      // QR 코드 (오른쪽 정렬)
      const qrDataUrl = qrCodes.get(member.id);
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', pageWidth - 50, yPosition - 10, 30, 30);
      }

      yPosition += 40;

      // 페이지 넘김
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
    });
  });

  // 전체 명단 (알파벳 순)
  doc.addPage();
  doc.setFontSize(18);
  doc.text('전체 명단 (알파벳 순)', 20, 20);

  const allParticipants = teams
    .flat()
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  let yPos = 40;
  doc.setFontSize(10);
  allParticipants.forEach((p, idx) => {
    doc.text(`${idx + 1}. ${p.name} - 팀 ${(p.team || 0) + 1}`, 20, yPos);
    yPos += 8;

    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  });

  // PDF 다운로드
  const fileName = `팀분배_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
```

---

## 6. 데이터 모델

### 6.1 TypeScript 인터페이스

```typescript
// types/team.ts

/**
 * 참가자 정보
 */
export interface Participant {
  id: string; // UUID
  name: string; // 이름
  team?: number; // 배정된 팀 번호 (0-indexed)
  metadata?: Record<string, any>; // 확장 가능한 메타데이터 (예: 성별, 스킬)
}

/**
 * 팀 설정
 */
export interface TeamSettings {
  mode: 'byTeamCount' | 'byMemberCount'; // 분배 모드
  teamCount?: number; // 팀 수 (mode: byTeamCount)
  memberCount?: number; // 팀당 인원 (mode: byMemberCount)
}

/**
 * 팀 색상 정보
 */
export interface TeamColor {
  bg: string; // 배경 색상 (Tailwind class or HSL)
  text: string; // 텍스트 색상
  border: string; // 테두리 색상
}

/**
 * QR 코드 데이터
 */
export interface QRCodeData {
  team: number; // 팀 번호
  teamName: string; // 팀 이름
  member: string; // 참가자 이름
  allMembers: string[]; // 팀 전체 멤버
}

/**
 * 앱 상태
 */
export interface AppState {
  participants: Participant[]; // 전체 참가자
  settings: TeamSettings; // 팀 설정
  teams: Participant[][]; // 분배된 팀 (2D 배열)
  isShuffled: boolean; // 분배 완료 여부
  qrCodes: Map<string, string>; // 참가자 ID -> QR Data URL
}
```

---

## 7. 핵심 알고리즘

### 7.1 Fisher-Yates Shuffle 검증

```typescript
// __tests__/shuffle.test.ts
import { fisherYatesShuffle } from '../utils/shuffle';

describe('Fisher-Yates Shuffle', () => {
  test('배열 길이 유지', () => {
    const input = [1, 2, 3, 4, 5];
    const output = fisherYatesShuffle(input);
    expect(output).toHaveLength(input.length);
  });

  test('모든 요소 포함', () => {
    const input = [1, 2, 3, 4, 5];
    const output = fisherYatesShuffle(input);
    expect(output.sort()).toEqual(input.sort());
  });

  test('원본 배열 보존', () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    fisherYatesShuffle(input);
    expect(input).toEqual(original);
  });

  test('1000번 셔플 분포 확인', () => {
    const input = [1, 2, 3];
    const results = new Map<string, number>();

    for (let i = 0; i < 1000; i++) {
      const shuffled = fisherYatesShuffle(input);
      const key = shuffled.join(',');
      results.set(key, (results.get(key) || 0) + 1);
    }

    // 3! = 6가지 순열이 모두 나와야 함
    expect(results.size).toBe(6);

    // 각 순열이 150회 이상 나와야 함 (통계적 공정성)
    results.forEach(count => {
      expect(count).toBeGreaterThan(100);
    });
  });
});
```

### 7.2 균등 분배 로직

```typescript
// utils/distribute.ts

/**
 * 라운드 로빈 방식 균등 분배
 * - 팀 간 인원 차이 최소화 (최대 1명 차이)
 */
export function distributeEvenly<T>(items: T[], teamCount: number): T[][] {
  const teams: T[][] = Array.from({ length: teamCount }, () => []);

  items.forEach((item, index) => {
    const teamIndex = index % teamCount;
    teams[teamIndex].push(item);
  });

  return teams;
}

/**
 * 팀당 인원 제한 분배
 */
export function distributeBySize<T>(items: T[], maxPerTeam: number): T[][] {
  const teams: T[][] = [];

  for (let i = 0; i < items.length; i += maxPerTeam) {
    teams.push(items.slice(i, i + maxPerTeam));
  }

  return teams;
}
```

### 7.3 색상 생성 알고리즘

```typescript
// utils/colorGenerator.ts

/**
 * HSL 색상 공간에서 고른 간격으로 색상 생성
 * - Hue: 0~360도 균등 분배
 * - Saturation: 70% (선명함)
 * - Lightness: 90% (배경), 30% (텍스트)
 */
export function generateDistinctColors(count: number) {
  const colors = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = Math.round(i * hueStep);
    colors.push({
      bg: `hsl(${hue}, 70%, 90%)`,
      text: `hsl(${hue}, 70%, 30%)`,
      border: `hsl(${hue}, 70%, 60%)`,
      name: getColorName(hue), // 선택적: 색상 이름 (빨강, 파랑 등)
    });
  }

  return colors;
}

function getColorName(hue: number): string {
  if (hue < 30) return '빨강';
  if (hue < 90) return '주황';
  if (hue < 150) return '노랑';
  if (hue < 210) return '초록';
  if (hue < 270) return '파랑';
  if (hue < 330) return '보라';
  return '분홍';
}
```

---

## 8. 컴포넌트 구조

### 8.1 컴포넌트 트리

```
App.tsx
├── Header.tsx (타이틀, 설명)
├── InputSection.tsx
│   ├── ManualInput.tsx (직접 입력)
│   ├── BulkTextInput.tsx (줄바꿈 텍스트)
│   └── CSVUpload.tsx (파일 업로드)
├── ParticipantList.tsx (입력된 인원 목록)
├── TeamSettingsComponent.tsx (팀 설정)
├── ShuffleButton.tsx (분배 실행)
├── TeamResult.tsx (결과 시각화)
│   └── TeamCard.tsx (개별 팀 카드)
├── QRCodeDisplay.tsx (QR 코드 그리드)
├── ExportButtons.tsx
│   ├── PDFExportButton.tsx
│   └── JSONExportButton.tsx
└── Footer.tsx
```

### 8.2 주요 컴포넌트 책임

| 컴포넌트 | 책임 |
|---------|------|
| **App.tsx** | 전역 상태 관리, 워크플로우 조율 |
| **InputSection.tsx** | 참가자 입력 UI 통합 |
| **TeamSettingsComponent.tsx** | 팀 설정 폼 |
| **ShuffleButton.tsx** | 분배 실행 + 애니메이션 트리거 |
| **TeamResult.tsx** | 팀 카드 렌더링 |
| **QRCodeDisplay.tsx** | QR 코드 생성/표시 |
| **ExportButtons.tsx** | PDF/JSON 내보내기 |

### 8.3 상태 관리 전략

```typescript
// App.tsx
import React, { useState } from 'react';
import { Participant, TeamSettings, AppState } from './types/team';
import { divideIntoTeams } from './utils/shuffle';
import { generateAllQRCodes } from './utils/qrcode';

function App() {
  const [state, setState] = useState<AppState>({
    participants: [],
    settings: { mode: 'byTeamCount', teamCount: 2 },
    teams: [],
    isShuffled: false,
    qrCodes: new Map(),
  });

  const handleShuffle = async () => {
    const teams = divideIntoTeams(state.participants, state.settings);
    const qrCodes = await generateAllQRCodes(teams);

    setState({
      ...state,
      teams,
      isShuffled: true,
      qrCodes,
    });
  };

  const handleReset = () => {
    setState({
      ...state,
      teams: [],
      isShuffled: false,
      qrCodes: new Map(),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!state.isShuffled ? (
        <>
          <InputSection participants={state.participants} setState={setState} />
          <TeamSettingsComponent settings={state.settings} setState={setState} />
          <ShuffleButton onClick={handleShuffle} disabled={state.participants.length < 2} />
        </>
      ) : (
        <>
          <TeamResult teams={state.teams} showConfetti={true} />
          <QRCodeDisplay teams={state.teams} />
          <ExportButtons teams={state.teams} qrCodes={state.qrCodes} />
          <button onClick={handleReset} className="mt-8 px-6 py-3 bg-gray-500 text-white rounded">
            다시 하기
          </button>
        </>
      )}
    </div>
  );
}

export default App;
```

---

## 9. 추가 기능 (V2)

### 9.1 팀 균형 조정
- **스킬 레벨**: 참가자마다 1~5점 부여, 팀별 합산 점수 균등화
- **성별 균형**: 남/여 비율 자동 조정

### 9.2 히스토리 저장
- **LocalStorage**: 최근 10개 분배 결과 저장
- **재사용**: 이전 분배 불러오기

### 9.3 실시간 협업
- **URL 공유**: 분배 결과를 URL 파라미터로 인코딩
- **QR 스캔 시 실시간 확인**: Firebase/Supabase 연동

---

## 10. 성능 최적화

### 10.1 코드 분할
```typescript
// Lazy loading for heavy components
const QRCodeDisplay = React.lazy(() => import('./components/QRCodeDisplay'));
const PDFExport = React.lazy(() => import('./utils/pdf'));
```

### 10.2 QR 코드 생성 최적화
- **Web Worker**: 대량 QR 코드 생성 시 별도 스레드
- **Batch 처리**: 10개씩 묶어서 생성

---

## 11. 접근성 (a11y)

- **키보드 네비게이션**: Tab/Enter로 모든 기능 접근
- **ARIA 레이블**: 스크린 리더 지원
- **색각 이상 대응**: 색상 외에 아이콘/패턴 추가

---

## 12. 테스트 전략

### 12.1 단위 테스트
- Fisher-Yates 알고리즘 검증
- 균등 분배 로직
- QR 코드 생성/디코딩

### 12.2 통합 테스트
- 전체 워크플로우 (입력 → 분배 → 결과 → PDF)
- CSV 파일 업로드

### 12.3 E2E 테스트 (Playwright)
- 시나리오: 50명을 5팀으로 분배
- PDF 다운로드 검증

---

## 13. 배포 전략

### 13.1 정적 호스팅
- **GitHub Pages**: 무료, 자동 배포
- **Vercel/Netlify**: CI/CD 통합

### 13.2 도메인 연결
- `https://seolcoding.com/mini-apps/team-divider`

---

## 14. 참고 자료

### 14.1 알고리즘
- [Fisher-Yates Shuffle - Wikipedia](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- [Modern Algorithm for Shuffling - Durstenfeld](https://en.wikipedia.org/wiki/Richard_Durstenfeld)

### 14.2 라이브러리 문서
- [qrcode - npm](https://www.npmjs.com/package/qrcode)
- [jsPDF - GitHub](https://github.com/parallax/jsPDF)
- [papaparse - npm](https://www.npmjs.com/package/papaparse)

### 14.3 유사 서비스
- [Random Team Generator - RandomLists](https://www.randomlists.com/team-generator)
- [Keamk - Balanced Team Generator](https://www.keamk.com/)
- [Team Picker Wheel](https://pickerwheel.com/tools/random-team-generator/)
- [Comment Picker Team Generator](https://commentpicker.com/team-generator.php)

---

## 15. 라이선스

MIT License (오픈소스 공개)

---

## 16. MCP 개발 도구

### 16.1 UI 컴포넌트 개발
- **Shadcn UI**: 검증된 컴포넌트 라이브러리
- `pnpm dlx shadcn@latest add [component]`로 추가
- `@mini-apps/ui` 패키지에서 공유

### 16.2 브라우저 테스트
- **Chrome DevTools MCP**: 실시간 UI 확인 및 디버깅
- 스냅샷/스크린샷으로 렌더링 확인
- 콘솔/네트워크 요청 분석
- 반응형 테스트 (모바일 뷰포트)

> 자세한 사용법은 `agents/mini-apps/CLAUDE.md` 참조
