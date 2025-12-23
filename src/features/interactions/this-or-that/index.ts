/**
 * This or That Interaction Feature
 * 양자택일 투표 관련 공유 컴포넌트 및 타입 re-export
 */

// 컴포넌트
export { ThisOrThatHost, type ThisOrThatHostProps } from './ThisOrThatHost';
export { ThisOrThatParticipant, type ThisOrThatParticipantProps } from './ThisOrThatParticipant';

// 타입
export type {
  QuestionStatus,
  ThisOrThatQuestion,
  Vote,
  ThisOrThatConfig,
  VoteCount,
  ThisOrThatParticipant as ThisOrThatParticipantType,
} from './types';
