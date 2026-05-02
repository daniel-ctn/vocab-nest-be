import bcrypt from 'bcrypt'
import type { LoginRequest, RegisterRequest } from '../../contracts'
import { prisma } from '../../db/prisma'
import { signAccessToken } from '../../middleware/auth'
import { conflict, unauthorized } from '../../shared/errors'

export const toUserProfile = (user: {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
})

const buildAuthResponse = (user: {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}) => ({
  user: toUserProfile(user),
  accessToken: signAccessToken({ sub: user.id, email: user.email }),
})

export const register = async (input: RegisterRequest) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    throw conflict('Email is already registered.')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
  })

  return buildAuthResponse(user)
}

export const login = async (input: LoginRequest) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  const isValid = user?.passwordHash
    ? await bcrypt.compare(input.password, user.passwordHash)
    : false

  if (!user || !isValid) {
    throw unauthorized('Invalid email or password.')
  }

  return buildAuthResponse(user)
}

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw unauthorized('User no longer exists.')
  }
  return toUserProfile(user)
}
