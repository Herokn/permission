export interface UserProfile {
  id: string
  username: string
  nickName?: string
  roles?: string[]
}

export interface CreateUserInput {
  username: string
  password: string
  nickName?: string
  roles?: string[]
}
