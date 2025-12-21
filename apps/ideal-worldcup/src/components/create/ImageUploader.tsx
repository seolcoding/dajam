/**
 * 이미지 업로드 컴포넌트 (react-dropzone)
 */

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import { Button } from '@mini-apps/ui'
import type { Candidate } from '../../types'

interface ImageUploaderProps {
  candidates: Candidate[]
  onAddCandidate: (candidate: Omit<Candidate, 'id'>) => void
  onRemoveCandidate: (id: string) => void
  maxCandidates?: number
}

export default function ImageUploader({
  candidates,
  onAddCandidate,
  onRemoveCandidate,
  maxCandidates = 32,
}: ImageUploaderProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        if (candidates.length >= maxCandidates) {
          alert(`최대 ${maxCandidates}개까지 업로드 가능합니다.`)
          break
        }

        // 파일을 Data URL로 변환
        const reader = new FileReader()
        reader.onload = () => {
          const imageUrl = reader.result as string
          const name = file.name.replace(/\.[^/.]+$/, '') // 확장자 제거

          onAddCandidate({
            name,
            imageUrl,
            imageFile: file,
          })
        }
        reader.readAsDataURL(file)
      }
    },
    [candidates.length, maxCandidates, onAddCandidate]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: maxCandidates - candidates.length,
  })

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-lg text-blue-600">이미지를 여기에 놓으세요...</p>
        ) : (
          <>
            <p className="text-lg text-gray-700 mb-2">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF, WebP (최대 {maxCandidates}개)
            </p>
          </>
        )}
      </div>

      {/* 업로드된 이미지 그리드 */}
      {candidates.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={candidate.imageUrl}
                alt={candidate.name}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-sm font-medium truncate">
                  {candidate.name}
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                onClick={() => onRemoveCandidate(candidate.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 후보자 수 표시 */}
      <p className="text-sm text-gray-600 text-center">
        현재 {candidates.length}개의 후보자 ({maxCandidates - candidates.length}개 남음)
      </p>
    </div>
  )
}
