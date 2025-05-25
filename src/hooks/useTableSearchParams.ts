
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useCallback, useRef } from "react"

interface TableSearchParams {
  search?: string
  status?: string[]
  roles?: string[]
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
}

export function useTableSearchParams() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: "/" })
  const isNavigatingRef = useRef(false)

  const updateSearchParams = useCallback(
    (updates: Partial<TableSearchParams>) => {
      console.log("Updating search params:", updates)
      
      // Prevent multiple simultaneous navigation calls
      if (isNavigatingRef.current) {
        console.log("Navigation already in progress, skipping")
        return
      }

      const currentParams = (searchParams as TableSearchParams) || {}
      const newParams = { ...currentParams, ...updates }
      
      // Clean up empty arrays and undefined values
      Object.keys(newParams).forEach((key) => {
        const value = newParams[key as keyof TableSearchParams]
        if (value === undefined || (Array.isArray(value) && value.length === 0)) {
          delete newParams[key as keyof TableSearchParams]
        }
      })

      // Check if params actually changed to prevent unnecessary navigation
      const paramsChanged = JSON.stringify(currentParams) !== JSON.stringify(newParams)
      if (!paramsChanged) {
        console.log("No params changed, skipping navigation")
        return
      }

      isNavigatingRef.current = true
      
      try {
        navigate({
          to: "/",
          search: (prev: any) => ({ ...prev, ...newParams }),
          replace: true,
        })
      } catch (error) {
        console.error("Navigation error:", error)
      } finally {
        // Reset the flag after a short delay
        setTimeout(() => {
          isNavigatingRef.current = false
        }, 100)
      }
    },
    [navigate, searchParams]
  )

  return {
    searchParams: (searchParams as TableSearchParams) || {},
    updateSearchParams,
  }
}
