
import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Search, Plus, Trash2, ArrowUp, ArrowDown, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MultiSelectFilter } from "./MultiSelectFilter"
import { useTableSearchParams } from "@/hooks/useTableSearchParams"

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  createdAt: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  onEdit?: (row: TData) => void
  onCreate?: () => void
  onDelete?: (rows: TData[]) => void
  onRefresh?: () => void
  loading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey = "name",
  onEdit,
  onCreate,
  onDelete,
  onRefresh,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const { searchParams, updateSearchParams } = useTableSearchParams()
  
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [localSearchValue, setLocalSearchValue] = React.useState(searchParams?.search || "")

  // Initialize state from search params with proper defaults
  const sorting: SortingState = React.useMemo(() => {
    return searchParams?.sortBy 
      ? [{ id: searchParams.sortBy, desc: searchParams.sortOrder === "desc" }]
      : []
  }, [searchParams?.sortBy, searchParams?.sortOrder])

  const globalFilter = searchParams?.search || ""
  const statusFilter = searchParams?.status || []
  const roleFilter = searchParams?.roles || []

  // Get unique roles from data for the multiselect filter
  const uniqueRoles = React.useMemo(() => {
    const roles = new Set<string>()
    data.forEach((item: any) => {
      if (item.role) roles.add(item.role)
    })
    return Array.from(roles)
  }, [data])

  // Custom global filter function for name, email search
  const globalFilterFn = React.useMemo(() => {
    return (row: any, columnId: string, value: string) => {
      const user = row.original as User
      const searchValue = value.toLowerCase()
      return (
        user.name?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue)
      )
    }
  }, [])

  // Debounced search handler
  const debouncedSearchRef = React.useRef<NodeJS.Timeout>()
  const handleSearchChange = React.useCallback((value: string) => {
    setLocalSearchValue(value)
    
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current)
    }
    
    debouncedSearchRef.current = setTimeout(() => {
      console.log("Debounced search update:", value)
      updateSearchParams({ search: value || undefined, page: 1 })
    }, 300)
  }, [updateSearchParams])

  // Stable handlers to prevent re-renders
  const handleSortingChange = React.useCallback((updater: any) => {
    const newSorting = typeof updater === "function" ? updater(sorting) : updater
    const sortState = newSorting[0]
    
    console.log("Sorting change:", sortState)
    
    updateSearchParams({
      sortBy: sortState?.id,
      sortOrder: sortState?.desc ? "desc" : "asc",
    })
  }, [sorting, updateSearchParams])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn,
    state: {
      sorting,
      columnFilters: [],
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: ((searchParams?.page || 1) - 1),
        pageSize: searchParams?.pageSize || 10,
      },
    },
  })

  // Apply filters based on search params - memoized to prevent loops
  React.useEffect(() => {
    const filters: ColumnFiltersState = []
    
    if (statusFilter.length > 0) {
      filters.push({ id: "status", value: statusFilter })
    }
    
    if (roleFilter.length > 0) {
      filters.push({ id: "role", value: roleFilter })
    }

    table.setColumnFilters(filters)
  }, [statusFilter, roleFilter, table])

  const selectedRows = table.getFilteredSelectedRowModel().rows

  // Clear selections when data changes
  React.useEffect(() => {
    setRowSelection({})
  }, [data])

  return (
    <div className="w-full space-y-4">
      {/* Enhanced Header with search and actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={localSearchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pl-9"
            />
          </div>
          
          <MultiSelectFilter
            title="Status"
            options={["active", "inactive"]}
            values={statusFilter}
            onValuesChange={(values) => {
              console.log("Status filter change:", values)
              updateSearchParams({ status: values, page: 1 })
            }}
          />

          <MultiSelectFilter
            title="Role"
            options={uniqueRoles}
            values={roleFilter}
            onValuesChange={(values) => {
              console.log("Role filter change:", values)
              updateSearchParams({ roles: values, page: 1 })
            }}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ChevronDown className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <>
              <Badge variant="secondary" className="mr-2">
                {selectedRows.length} selected
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  console.log("Delete button clicked")
                  onDelete?.(selectedRows.map(row => row.original))
                  setRowSelection({})
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
          
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Refresh button clicked")
                onRefresh()
              }}
              disabled={loading}
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          
          {onCreate && (
            <Button onClick={() => {
              console.log("Create button clicked")
              onCreate()
            }} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  
                  return (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder ? null : (
                        <div
                          className={canSort ? "flex items-center space-x-2 cursor-pointer select-none hover:text-accent-foreground" : ""}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && (
                            <span className="flex flex-col">
                              <ArrowUp 
                                className={`h-3 w-3 transition-colors ${sorted === "asc" ? "text-foreground" : "text-muted-foreground"}`} 
                              />
                              <ArrowDown 
                                className={`h-3 w-3 -mt-1 transition-colors ${sorted === "desc" ? "text-foreground" : "text-muted-foreground"}`} 
                              />
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                    <div>
                      <p className="text-sm font-medium">No users found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} results
          {selectedRows.length > 0 && (
            <span className="ml-2">
              ({selectedRows.length} selected)
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                console.log("Page size change:", value)
                table.setPageSize(Number(value))
                updateSearchParams({ pageSize: Number(value), page: 1 })
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                console.log("First page clicked")
                table.setPageIndex(0)
                updateSearchParams({ page: 1 })
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              {"<<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                console.log("Previous page clicked")
                table.previousPage()
                updateSearchParams({ page: table.getState().pagination.pageIndex })
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              {"<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                console.log("Next page clicked")
                table.nextPage()
                updateSearchParams({ page: table.getState().pagination.pageIndex + 2 })
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              {">"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                console.log("Last page clicked")
                table.setPageIndex(table.getPageCount() - 1)
                updateSearchParams({ page: table.getPageCount() })
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
