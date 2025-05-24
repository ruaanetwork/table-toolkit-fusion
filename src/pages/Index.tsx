
import * as React from "react"
import { DataTable } from "@/components/data-table/DataTable"
import { createColumns } from "@/components/data-table/columns"
import { UserDialog } from "@/components/data-table/UserDialog"
import { User } from "@/components/data-table/DataTable"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUsers } from "@/hooks/useUsers"

const Index = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)

  const { data: users = [], isLoading } = useUsers()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUsersMutation = useDeleteUsers()

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  const handleDelete = (users: User[]) => {
    const ids = users.map(user => user.id)
    deleteUsersMutation.mutate(ids)
  }

  const handleSave = (data: Omit<User, "id" | "createdAt">) => {
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
  }

  const columns = createColumns(handleEdit)

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
