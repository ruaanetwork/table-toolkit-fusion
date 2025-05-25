
import * as React from "react"
import { DataTable } from "@/components/data-table/DataTable"
import { createColumns } from "@/components/data-table/columns"
import { UserDialog } from "@/components/data-table/UserDialog"
import { User } from "@/components/data-table/DataTable"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUsers } from "@/hooks/useUsers"
import { useToast } from "@/hooks/use-toast"

const Index = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const { toast } = useToast()

  const { data: users = [], isLoading, refetch } = useUsers()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUsersMutation = useDeleteUsers()

  const handleEdit = React.useCallback((user: User) => {
    console.log("Edit user:", user.id)
    setEditingUser(user)
    setDialogOpen(true)
  }, [])

  const handleCreate = React.useCallback(() => {
    console.log("Create new user")
    setEditingUser(null)
    setDialogOpen(true)
  }, [])

  const handleDelete = React.useCallback((users: User[]) => {
    console.log("Delete users:", users.map(u => u.id))
    const ids = users.map(user => user.id)
    deleteUsersMutation.mutate(ids)
  }, [deleteUsersMutation])

  const handleSingleDelete = React.useCallback((user: User) => {
    console.log("Delete single user:", user.id)
    deleteUsersMutation.mutate([user.id])
  }, [deleteUsersMutation])

  const handleQuickUpdate = React.useCallback((user: User) => {
    console.log("Quick update user:", user.id)
    // Toggle status for quick update
    const newStatus = user.status === "active" ? "inactive" : "active"
    updateUserMutation.mutate(
      { id: user.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: `User status updated to ${newStatus}`,
          })
        },
      }
    )
  }, [updateUserMutation, toast])

  const handleRefresh = React.useCallback(() => {
    console.log("Refresh users data")
    refetch()
  }, [refetch])

  const handleSave = React.useCallback((data: Omit<User, "id" | "createdAt">) => {
    console.log("Save user data:", data)
    if (editingUser) {
      updateUserMutation.mutate(
        { id: editingUser.id, data },
        {
          onSuccess: () => {
            setDialogOpen(false)
            setEditingUser(null)
          },
        }
      )
    } else {
      createUserMutation.mutate(data, {
        onSuccess: () => {
          setDialogOpen(false)
        },
      })
    }
  }, [editingUser, updateUserMutation, createUserMutation])

  const columns = React.useMemo(() => 
    createColumns(handleEdit, handleSingleDelete, handleQuickUpdate), 
    [handleEdit, handleSingleDelete, handleQuickUpdate]
  )

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your users with advanced filtering, sorting, and search capabilities.
          </p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <DataTable
            columns={columns}
            data={users}
            searchKey="name"
            onEdit={handleEdit}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onRefresh={handleRefresh}
            loading={isLoading}
          />
        </div>

        <UserDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          user={editingUser}
          onSave={handleSave}
          loading={createUserMutation.isPending || updateUserMutation.isPending}
        />
      </div>
    </div>
  )
}

export default Index
