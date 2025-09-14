// hooks/useAuth.ts

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  role: string
  tenantId: string
  tenant: {
    id: string
    name: string
    subscription: string
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // <-- NEW: Add loading state
  const router = useRouter()

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error)
    } finally {
      setLoading(false) // <-- IMPORTANT: Always set loading to false when done
    }
  }, []) // Empty array ensures this runs only once on mount

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    router.push('/')
  }

  return { user, token, logout, loading } // <-- NEW: Return the loading state
}