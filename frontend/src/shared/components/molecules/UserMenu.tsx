"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ChevronDown } from "lucide-react"
import { UserAvatar } from "../atoms/UserAvatar"
import { LogoutButton } from "../atoms/LogoutButton"

interface UserMenuProps {
  user: {
    name: string
    role: string
    avatar?: string
  }
  onLogout: () => void
  className?: string
  'data-testid'?: string
}

export function UserMenu({ user, onLogout, className = "", 'data-testid': testId }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations('nav')

  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        data-testid="user-menu-trigger"
      >
        <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-20" data-testid="user-menu-dropdown">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>

            <div className="py-1">
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                data-testid="user-menu-profile-link"
                onClick={() => setIsOpen(false)}
              >
                <svg className="h-4 w-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('profile')}
              </Link>
            </div>

            <div className="border-t border-gray-100 pt-1">
              <LogoutButton
                onLogout={onLogout}
                variant="menu"
                data-testid="dashboard-logout-button"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}