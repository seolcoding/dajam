export interface Profile {
  id: string; // nanoid 생성
  name: string;
  tagline: string; // 한줄 소개
  field: string; // 전공/분야
  interests: string[]; // 관심사 태그 (최대 5개)
  contacts: {
    email?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  avatarUrl?: string; // Base64 또는 URL
  createdAt: string; // ISO 8601
}

export interface Room {
  id: string; // 6자리 코드 (예: ABC123)
  name: string; // 교실 이름
  createdBy: string; // Profile ID
  members: string[]; // Profile IDs
  createdAt: string;
}

export interface IcebreakerAnswer {
  id: string;
  questionId: string; // 질문 ID (중복 답변 방지)
  question: string;
  answer: string;
  profileId: string;
  roomId: string;
  createdAt: string;
}

// Zustand 스토어 타입
export interface ProfileStore {
  profile: Profile | null;
  profiles: Profile[]; // Room 내 다른 사람들
  createProfile: (profile: Profile) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  getProfileById: (id: string) => Profile | undefined;
}

export interface RoomStore {
  rooms: Room[];
  createRoom: (room: Room) => void;
  joinRoom: (roomId: string, profileId: string) => void;
  leaveRoom: (roomId: string, profileId: string) => void;
  getRoomById: (id: string) => Room | undefined;
}

export interface IcebreakerStore {
  answers: IcebreakerAnswer[];
  addAnswer: (answer: IcebreakerAnswer) => void;
  getAnswersByRoom: (roomId: string) => IcebreakerAnswer[];
}
