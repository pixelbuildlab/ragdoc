import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserStoreData = {
  user: {
    email: string
    id: number
  } | null
  workspaces: Array<{
    id: number
    user_id: number
    name: string
    tags: string | null
    description: string | null
  }>

  uploads: Array<{
    id: number
    user_id: number
    workspace_id: number
    file_name: string
    file_path: string
    uploaded_at: string
  }>
}

type UserStoreActions = {
  setUser: (user: UserStoreData['user']) => void
  setWorkspaces: (workspaces: UserStoreData['workspaces']) => void
  clearStore: () => void
  setUploads: (uploads: UserStoreData['uploads']) => void
}

type UserStore = UserStoreData & UserStoreActions

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      workspaces: [],
      uploads: [],

      setUser: (user) => {
        set({ user })
      },

      setUploads: (uploads) => {
        set({ uploads })
      },

      setWorkspaces: (workspaces) => {
        set({ workspaces })
      },

      clearStore: () => {
        set({
          user: null,
          workspaces: [],
          uploads: [],
        })
      },
    }),
    {
      name: 'user-store',
    },
  ),
)
