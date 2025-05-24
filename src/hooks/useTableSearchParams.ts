
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useCallback } from "react"

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
  const searchParams = useSearch({ from: "/" }) as TableSearchParams

  const updateSearchParams = useCallback(
    (updates: Partial<TableSearchParams>) => {
      const newParams = { ...searchParams, ...updates }
      
      // Clean up empty arrays and undefined values
      Object.keys(newParams).forEach((key) => {
        const value = newParams[key as keyof TableSearchParams]
        if (value === undefined || (Array.isArray(value) && value.length === 0)) {
          delete newParams[key as keyof TableSearchParams]
        }
      })

      navigate({
        to: "/",
        search: newParams,
        replace: true,
      })
    },
    [navigate, searchParams]
  )

  return {
    searchParams,
    updateSearchParams,
  }
}
