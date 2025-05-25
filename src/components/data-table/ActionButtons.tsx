
import React from "react"
import { Edit, Trash2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "./DataTable"

interface ActionButtonsProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onQuickUpdate: (user: User) => void
}

export const ActionButtons = React.memo(({ user, onEdit, onDelete, onQuickUpdate }: ActionButtonsProps) => {
  console.log("ActionButtons rendered for user:", user.id)

  const handleEdit = React.useCallback(() => {
    console.log("Edit clicked for user:", user.id)
    onEdit(user)
  }, [user, onEdit])

  const handleDelete = React.useCallback(() => {
    console.log("Delete clicked for user:", user.id)
    onDelete(user)
  }, [user, onDelete])

  const handleQuickUpdate = React.useCallback(() => {
    console.log("Quick update clicked for user:", user.id)
    onQuickUpdate(user)
  }, [user, onQuickUpdate])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Update
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleQuickUpdate}>
          <Zap className="mr-2 h-4 w-4" />
          Quick Update
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

ActionButtons.displayName = "ActionButtons"
