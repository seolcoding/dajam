import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProfileStore } from '@/types';

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      profiles: [],

      createProfile: (profile) => {
        set({ profile, profiles: [profile] });
      },

      updateProfile: (updates) => {
        const { profile } = get();
        if (!profile) return;

        const updatedProfile = { ...profile, ...updates };
        set({ profile: updatedProfile });
      },

      getProfileById: (id) => {
        return get().profiles.find(p => p.id === id);
      }
    }),
    {
      name: 'student-network-profile',
      version: 1
    }
  )
);
