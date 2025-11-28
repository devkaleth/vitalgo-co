"use client"

import { useTranslations } from "next-intl"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  onLogout: () => void
  variant?: 'default' | 'menu'
  className?: string
  'data-testid'?: string
}

export function LogoutButton({ onLogout, variant = 'default', className = "", 'data-testid': testId }: LogoutButtonProps) {
  const t = useTranslations('nav')
  const baseClasses = "flex items-center space-x-2 transition-colors"
  const variantClasses = {
    default: "px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md",
    menu: "w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
  }

  return (
    <button
      onClick={onLogout}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      data-testid={testId}
    >
      <LogOut className="h-4 w-4" />
      <span>{t('logout')}</span>
    </button>
  )
}