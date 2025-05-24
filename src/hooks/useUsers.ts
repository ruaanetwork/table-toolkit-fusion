
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "@/services/userService"
import { User } from "@/components/data-table/DataTable"
import { useToast } from "@/hooks/use-toast"

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast({
        title: "Success",
        description: "User created successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<User, "id" | "createdAt">> }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast({
        title: "Success",
        description: "User updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteUsers() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (ids: string[]) => userService.deleteUsers(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast({
        title: "Success",
        description: "Users deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete users",
        variant: "destructive",
      })
    },
  })
}
