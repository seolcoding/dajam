import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoomStore } from '@/types';

export const useRoomStore = create<RoomStore>()(
  persist(
    (set, get) => ({
      rooms: [],

      createRoom: (room) => {
        set((state) => ({ rooms: [...state.rooms, room] }));
      },

      joinRoom: (roomId, profileId) => {
        set((state) => ({
          rooms: state.rooms.map(room =>
            room.id === roomId && !room.members.includes(profileId)
              ? { ...room, members: [...room.members, profileId] }
              : room
          )
        }));
      },

      leaveRoom: (roomId, profileId) => {
        set((state) => ({
          rooms: state.rooms.map(room =>
            room.id === roomId
              ? { ...room, members: room.members.filter(id => id !== profileId) }
              : room
          )
        }));
      },

      getRoomById: (id) => {
        return get().rooms.find(r => r.id === id);
      }
    }),
    {
      name: 'student-network-rooms',
      version: 1
    }
  )
);
