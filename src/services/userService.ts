
import { User } from "@/components/data-table/DataTable"

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-01-20T14:15:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "manager",
    status: "inactive",
    createdAt: "2024-01-25T09:45:00Z",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-02-01T16:20:00Z",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-02-05T11:10:00Z",
  },
  {
    id: "6",
    name: "Diana Davis",
    email: "diana@example.com",
    role: "manager",
    status: "inactive",
    createdAt: "2024-02-10T13:30:00Z",
  },
  {
    id: "7",
    name: "Eve Miller",
    email: "eve@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-02-15T08:45:00Z",
  },
  {
    id: "8",
    name: "Frank Garcia",
    email: "frank@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-02-20T12:00:00Z",
  },
  {
    id: "9",
    name: "Grace Lee",
    email: "grace@example.com",
    role: "manager",
    status: "active",
    createdAt: "2024-02-25T15:15:00Z",
  },
  {
    id: "10",
    name: "Henry Rodriguez",
    email: "henry@example.com",
    role: "admin",
    status: "inactive",
    createdAt: "2024-03-01T10:00:00Z",
  },
]

let users = [...mockUsers]

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const userService = {
  async getUsers(): Promise<User[]> {
    await delay(500) // Simulate network delay
    return [...users]
  },

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    await delay(1000)
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    return newUser
  },

  async updateUser(id: string, userData: Partial<Omit<User, "id" | "createdAt">>): Promise<User> {
    await delay(1000)
    const index = users.findIndex(user => user.id === id)
    if (index === -1) {
      throw new Error("User not found")
    }
    users[index] = { ...users[index], ...userData }
    return users[index]
  },

  async deleteUsers(ids: string[]): Promise<void> {
    await delay(1000)
    users = users.filter(user => !ids.includes(user.id))
  },
}
