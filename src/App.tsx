
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Create root route
const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  ),
})

// Create index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      search: (search.search as string) || undefined,
      status: (search.status as string[]) || undefined,
      roles: (search.roles as string[]) || undefined,
      sortBy: (search.sortBy as string) || undefined,
      sortOrder: (search.sortOrder as "asc" | "desc") || undefined,
      page: search.page ? Number(search.page) : undefined,
      pageSize: search.pageSize ? Number(search.pageSize) : undefined,
    }
  },
})

// Create not found route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
})

// Create router
const routeTree = rootRoute.addChildren([indexRoute, notFoundRoute])
const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => <RouterProvider router={router} />

export default App;
