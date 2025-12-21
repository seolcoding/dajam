/**
 * 입력 검증 스키마 (Zod)
 */

import { z } from 'zod';

export const jeonseToWolseSchema = z.object({
  jeonse: z
    .number()
    .min(10_000_000, '전세금은 최소 1천만 원 이상이어야 합니다')
    .max(50_000_000_000, '전세금이 너무 큽니다'),
  deposit: z.number().min(0, '보증금은 0원 이상이어야 합니다'),
  conversionRate: z
    .number()
    .min(0.1, '전환율은 0.1% 이상이어야 합니다')
    .max(10, '전환율은 10% 이하여야 합니다')
    .default(4.5),
}).refine((data) => data.deposit < data.jeonse, {
  message: '보증금은 전세금보다 낮아야 합니다',
  path: ['deposit'],
});

export const wolseToJeonseSchema = z.object({
  deposit: z.number().min(0, '보증금은 0원 이상이어야 합니다'),
  monthlyRent: z
    .number()
    .min(10_000, '월세는 최소 1만 원 이상이어야 합니다')
    .max(100_000_000, '월세가 너무 큽니다'),
  conversionRate: z
    .number()
    .min(0.1)
    .max(10)
    .default(4.5),
});

export const loanCostSchema = z.object({
  jeonse: z.number().min(10_000_000),
  ownFunds: z.number().min(0),
  loanRate: z
    .number()
    .min(0.1, '대출 금리는 0.1% 이상이어야 합니다')
    .max(20, '대출 금리는 20% 이하여야 합니다')
    .default(3.5),
}).refine((data) => data.ownFunds < data.jeonse, {
  message: '보유 자금이 전세금 이상이면 대출이 필요 없습니다',
  path: ['ownFunds'],
});
