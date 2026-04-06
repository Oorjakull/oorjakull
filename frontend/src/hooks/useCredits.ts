import { useCallback, useEffect, useState } from 'react'
import { fetchUserCredits, type UserCredits } from '../api/client'
import { API_BASE_URL } from '../api/baseUrl'

const BASE_URL = API_BASE_URL

type UseCreditsReturn = {
  /** null while loading, or if user is not authenticated */
  credits: UserCredits | null
  /** Whether credits are still being fetched */
  isLoading: boolean
  /** True for super_user / paid_user (credits_remaining === null) */
  isUnlimited: boolean
  /** Re-fetch credit balance from the server */
  refreshCredits: () => Promise<void>
}

/**
 * Fetches and manages the current user's credit balance.
 * Returns null credits for unauthenticated (guest) users.
 */
export function useCredits(googleSub: string | null | undefined): UseCreditsReturn {
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshCredits = useCallback(async () => {
    if (!googleSub) {
      setCredits(null)
      return
    }
    setIsLoading(true)
    try {
      const data = await fetchUserCredits({ baseUrl: BASE_URL, googleSub })
      setCredits(data)
    } catch (err) {
      console.error('Failed to fetch credits:', err)
      // Don't clear existing credits on error — stale data is better than nothing
    } finally {
      setIsLoading(false)
    }
  }, [googleSub])

  // Fetch on mount and when googleSub changes
  useEffect(() => {
    refreshCredits()
  }, [refreshCredits])

  const isUnlimited = credits?.credits_remaining === null || credits?.credits_remaining === undefined

  return { credits, isLoading, isUnlimited, refreshCredits }
}
