import type { Metadata } from 'next'
import IdealWorldcupApp from './components/IdealWorldcupApp'

export const metadata: Metadata = {
  title: '이상형 월드컵 - 나만의 토너먼트',
  description: '이미지를 업로드하고 1:1 대결을 통해 최종 우승자를 선택하는 이상형 월드컵 게임',
  keywords: ['이상형 월드컵', '토너먼트', '게임', '투표', '대결'],
  openGraph: {
    title: '이상형 월드컵 - 나만의 토너먼트',
    description: '이미지를 업로드하고 1:1 대결을 통해 최종 우승자를 선택하세요',
    type: 'website',
  },
}

export default function IdealWorldcupPage() {
  return <IdealWorldcupApp />
}
