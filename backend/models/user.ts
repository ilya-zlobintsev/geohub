import { ObjectId } from 'mongodb'

type User = {
  id: ObjectId
  name: string
  bio?: string
  email: string
  password: string
  avatar: { emoji: string; color: string }
  createdAt?: Date
  location?: string
  isAdmin?: boolean
}

export default User
