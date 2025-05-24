
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
import { ChevronDown, Search, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react"

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
  loading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey = "name",
  onEdit,
  onCreate,
  onDelete,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const { searchParams, updateSearchParams } = useTableSearchParams()
  
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Initialize state from search params
  const sorting: SortingState = React.useMemo(() => {
    return searchParams.sortBy 
      ? [{ id: searchParams.sortBy, desc: searchParams.sortOrder === "desc" }]
      : []
  }, [searchParams.sortBy, searchParams.sortOrder])

  const globalFilter = searchParams.search || ""
  const statusFilter = searchParams.status || []
  const roleFilter = searchParams.roles || []

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

  // Stable handlers to prevent re-renders
  const handleSortingChange = React.useCallback((updater: any) => {
    const newSorting = typeof updater === "function" ? updater(sorting) : updater
    const sortState = newSorting[0]
    updateSearchParams({
      sortBy: sortState?.id,
      sortOrder: sortState?.desc ? "desc" : "asc",
    })
  }, [sorting, updateSearchParams])

  const handleGlobalFilterChange = React.useCallback((value: string) => {
    updateSearchParams({ search: value || undefined })
  }, [updateSearchParams])

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
    onGlobalFilterChange: handleGlobalFilterChange,
    globalFilterFn,
    state: {
      sorting,
      columnFilters: [],
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: (searchParams.page || 1) - 1,
        pageSize: searchParams.pageSize || 10,
      },
    },
  })

  // Apply filters based on search params
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

  // Handle pagination changes
  React.useEffect(() => {
    const { pageIndex, pageSize } = table.getState().pagination
    if (pageIndex !== (searchParams.page || 1) - 1 || pageSize !== (searchParams.pageSize || 10)) {
      updateSearchParams({
        page: pageIndex + 1,
        pageSize,
      })
    }
  }, [table.getState().pagination.pageIndex, table.getState().pagination.pageSize, updateSearchParams, searchParams.page, searchParams.pageSize])

  const selectedRows = table.getFilteredSelectedRowModel().rows

  return (
    <div className="w-full space-y-4">
      {/* Header with search and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email..."
              value={globalFilter}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
          
          <MultiSelectFilter
            title="Status"
            options={["active", "inactive"]}
            values={statusFilter}
            onValuesChange={(values) => updateSearchParams({ status: values })}
          />

          <MultiSelectFilter
            title="Role"
            options={uniqueRoles}
            values={roleFilter}
            onValuesChange={(values) => updateSearchParams({ roles: values })}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
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

        <div className="flex items-center space-x-2">
          {selectedRows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(selectedRows.map(row => row.original))}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedRows.length})
            </Button>
          )}
          
          {onCreate && (
            <Button onClick={onCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={canSort ? "flex items-center space-x-2 cursor-pointer select-none" : ""}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && (
                            <span className="flex flex-col">
                              <ArrowUp 
                                className={`h-3 w-3 ${sorted === "asc" ? "text-foreground" : "text-muted-foreground"}`} 
                              />
                              <ArrowDown 
                                className={`h-3 w-3 -mt-1 ${sorted === "desc" ? "text-foreground" : "text-muted-foreground"}`} 
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              {"<<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              {"<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              {">"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
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
