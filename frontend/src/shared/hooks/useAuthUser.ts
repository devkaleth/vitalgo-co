/**
 * Custom hook to get authenticated user data for UI display only
 * No longer handles authentication logic - uses AuthContext as source of truth
 */
"use client"

import { useAuth } from "../contexts/AuthContext"
import { useTranslations } from "next-intl"

interface AuthUser {
  name: string
  role: string
  avatar?: string
  id?: string
  email?: string
}

interface UseAuthUserResult {
  user: AuthUser | null
  isLoading: boolean
  logout: () => Promise<void>
  error: string | null
}

export function useAuthUser(): UseAuthUserResult {
  const { user: authUser, isLoading, logout, error } = useAuth()
  const t = useTranslations('common.roles')

  // Translate role using i18n
  const translateRole = (role: string): string => {
    const roleKey = role as 'patient' | 'doctor' | 'admin'
    try {
      return t(roleKey)
    } catch {
      return role
    }
  }

  // Transform AuthContext user data for UI display
  const user: AuthUser | null = authUser ? {
    name: authUser.firstName && authUser.lastName
      ? `${authUser.firstName} ${authUser.lastName}`.trim()
      : t('defaultUser'),
    role: translateRole(authUser.userType || 'patient'),
    avatar: undefined, // No avatar in current implementation
    id: authUser.id,
    email: authUser.email
  } : null

  console.log('🔍 useAuthUser: Transforming user data', {
    authUser,
    transformedUser: user,
    isLoading
  })

  return {
    user,
    isLoading,
    logout,
    error
  }
}