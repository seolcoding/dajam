import type { Profile } from '@/types';

interface MatchScore {
  profile: Profile;
  commonInterests: string[];
  score: number;
}

export const findMatches = (
  myProfile: Profile,
  allProfiles: Profile[]
): MatchScore[] => {
  const myInterests = new Set(myProfile.interests);

  const matches = allProfiles
    .filter(p => p.id !== myProfile.id)
    .map(profile => {
      const commonInterests = profile.interests.filter(interest =>
        myInterests.has(interest)
      );

      return {
        profile,
        commonInterests,
        score: commonInterests.length
      };
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);

  return matches;
};

// 관심사 빈도수 계산 (태그 클라우드용)
export const getInterestFrequency = (profiles: Profile[]): Map<string, number> => {
  const frequency = new Map<string, number>();

  profiles.forEach(profile => {
    profile.interests.forEach(interest => {
      frequency.set(interest, (frequency.get(interest) || 0) + 1);
    });
  });

  return frequency;
};
