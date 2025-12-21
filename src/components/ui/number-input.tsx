import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  /** 현재 값 */
  value: number | undefined;
  /** 값 변경 콜백 */
  onChange: (value: number | undefined) => void;
  /** 천단위 콤마 표시 */
  formatWithCommas?: boolean;
  /** 접두사 (예: ₩) */
  prefix?: string;
  /** 접미사 (예: 원, %) */
  suffix?: string;
  /** 최소값 */
  min?: number;
  /** 최대값 */
  max?: number;
  /** 소수점 자릿수 */
  decimalPlaces?: number;
}

/**
 * 숫자 전용 입력 컴포넌트
 * - 천단위 콤마 자동 포맷
 * - 접두사/접미사 지원
 * - 최소/최대값 제한
 */
export function NumberInput({
  value,
  onChange,
  formatWithCommas = true,
  prefix,
  suffix,
  min,
  max,
  decimalPlaces,
  className,
  placeholder,
  ...props
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");

  // 숫자를 포맷된 문자열로 변환
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || isNaN(num)) return "";

    let formatted = decimalPlaces !== undefined
      ? num.toFixed(decimalPlaces)
      : num.toString();

    if (formatWithCommas) {
      const parts = formatted.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      formatted = parts.join(".");
    }

    return formatted;
  };

  // 포맷된 문자열을 숫자로 변환
  const parseNumber = (str: string): number | undefined => {
    const cleaned = str.replace(/,/g, "");
    if (cleaned === "" || cleaned === "-") return undefined;
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  };

  // value prop이 변경되면 displayValue 업데이트
  React.useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // 숫자, 콤마, 마이너스, 소수점만 허용
    const cleaned = input.replace(/[^\d.,-]/g, "");
    setDisplayValue(cleaned);

    const num = parseNumber(cleaned);

    // 범위 검증
    if (num !== undefined) {
      if (min !== undefined && num < min) return;
      if (max !== undefined && num > max) return;
    }

    onChange(num);
  };

  const handleBlur = () => {
    // blur 시 포맷 적용
    setDisplayValue(formatNumber(value));
  };

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {prefix}
        </span>
      )}
      <Input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          prefix && "pl-8",
          suffix && "pr-8",
          className
        )}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}
