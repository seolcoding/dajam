/**
 * Web Share API 래퍼
 */

/**
 * 네이티브 공유 가능 여부 확인
 */
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator
}

/**
 * 이미지 공유
 */
export async function shareImage(
  blob: Blob,
  title: string,
  text: string
): Promise<void> {
  if (!canShare()) {
    throw new Error('Web Share API is not supported')
  }

  const file = new File([blob], 'worldcup-result.png', { type: 'image/png' })

  try {
    await navigator.share({
      files: [file],
      title,
      text,
    })
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      throw error
    }
    // 사용자가 공유를 취소한 경우는 무시
  }
}

/**
 * URL 공유
 */
export async function shareUrl(
  url: string,
  title: string,
  text: string
): Promise<void> {
  if (!canShare()) {
    throw new Error('Web Share API is not supported')
  }

  try {
    await navigator.share({
      url,
      title,
      text,
    })
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      throw error
    }
  }
}

/**
 * 클립보드에 이미지 복사
 */
export async function copyImageToClipboard(blob: Blob): Promise<void> {
  if (!navigator.clipboard || !navigator.clipboard.write) {
    throw new Error('Clipboard API is not supported')
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ])
  } catch (error) {
    throw new Error('Failed to copy image to clipboard')
  }
}

/**
 * 클립보드에 텍스트 복사
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return
  }

  await navigator.clipboard.writeText(text)
}
