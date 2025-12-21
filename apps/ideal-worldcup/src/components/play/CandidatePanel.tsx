/**
 * 후보자 패널 (좌/우)
 */

import type { Candidate } from '../../types'

interface CandidatePanelProps {
  candidate: Candidate
  position: 'left' | 'right'
  onSelect: () => void
}

export default function CandidatePanel({
  candidate,
  position,
  onSelect,
}: CandidatePanelProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative group cursor-pointer overflow-hidden
        transition-all duration-500 ease-out
        hover:scale-[1.02] active:scale-95
        ${position === 'left' ? 'md:border-r-4 border-accent-500' : 'md:border-l-4 border-primary-500'}
        hover:shadow-2xl
      `}
    >
      {/* 배경 이미지 */}
      <div className="absolute inset-0">
        <img
          src={candidate.imageUrl}
          alt={candidate.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80 group-hover:via-black/40 group-hover:to-black/90 transition-all duration-500" />
      </div>

      {/* 후보자 이름 */}
      <div className="absolute inset-x-0 bottom-0 p-8 md:p-16 transform transition-transform duration-500 group-hover:-translate-y-2">
        <h2 className="font-display text-4xl md:text-6xl font-black text-white drop-shadow-2xl tracking-tight group-hover:scale-105 transition-transform duration-500">
          {candidate.name}
        </h2>
      </div>

      {/* 호버 효과 - 그라디언트 오버레이 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${position === 'left' ? 'from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/20 group-hover:to-accent-500/10' : 'from-accent-500/0 to-primary-500/0 group-hover:from-accent-500/20 group-hover:to-primary-500/10'} transition-all duration-500`} />

      {/* 엣지 글로우 효과 */}
      <div className={`absolute inset-0 ${position === 'left' ? 'border-l-4 border-primary-500' : 'border-r-4 border-accent-500'} opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-2xl ${position === 'left' ? 'shadow-primary-500/50' : 'shadow-accent-500/50'}`} />

      {/* 선택 표시 (모바일) */}
      <div className="md:hidden absolute top-8 right-8 transform transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
        <div className="bg-gradient-to-br from-primary-400 to-accent-500 rounded-full p-4 shadow-2xl shadow-primary-500/50">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* 클릭 피드백 펄스 */}
      <div className="absolute inset-0 bg-white/0 group-active:bg-white/20 transition-colors duration-150" />
    </button>
  )
}
