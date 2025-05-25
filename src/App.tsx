
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

// Create index route with search validation
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
  validateSearch: (search: Record<string, unknown>) => {
    console.log("Validating search:", search)
    return {
      search: typeof search.search === 'string' ? search.search : undefined,
      status: Array.isArray(search.status) ? search.status as string[] : undefined,
      roles: Array.isArray(search.roles) ? search.roles as string[] : undefined,
      sortBy: typeof search.sortBy === 'string' ? search.sortBy : undefined,
      sortOrder: (search.sortOrder === 'asc' || search.sortOrder === 'desc') ? search.sortOrder : undefined,
      page: typeof search.page === 'number' ? search.page : undefined,
      pageSize: typeof search.pageSize === 'number' ? search.pageSize : undefined,
    }
  },
})

// Create not found route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
})

// Create router with proper configuration
const routeTree = rootRoute.addChildren([indexRoute, notFoundRoute])
const router = createRouter({ 
  routeTree,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => <RouterProvider router={router} />

export default App;
