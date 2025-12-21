/**
 * 화폐 표시 컴포넌트
 */

interface CurrencyDisplayProps {
  value: number;
  className?: string;
  showUnit?: boolean;
}

export function CurrencyDisplay({
  value,
  className = '',
  showUnit = true
}: CurrencyDisplayProps) {
  const formatted = value.toLocaleString('ko-KR');

  return (
    <span className={className}>
      {formatted}{showUnit && '원'}
    </span>
  );
}
