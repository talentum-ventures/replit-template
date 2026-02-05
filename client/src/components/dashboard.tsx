import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  LogOut,
  User,
  Circle,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
};

export function Dashboard() {
  const { signOut } = useAuthActions();
  const { toast } = useToast();
  
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", title: "Set up Convex backend", completed: false, priority: "high" },
    { id: "2", title: "Configure authentication", completed: false, priority: "high" },
    { id: "3", title: "Build your first feature", completed: false, priority: "medium" },
  ]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      title: newTodoTitle,
      completed: false,
      priority: newTodoPriority,
    };
    
    setTodos([newTodo, ...todos]);
    setNewTodoTitle("");
    toast({
      title: "Todo created",
      description: "Your todo has been created. Note: Data persistence requires Convex setup.",
    });
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleRemoveTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    toast({
      title: "Todo deleted",
      description: "Your todo has been deleted.",
    });
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">User</p>
                    <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} data-testid="menu-signout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome to your Dashboard!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your tasks and get started with your app.
            </p>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Getting Started</CardTitle>
              </div>
              <CardDescription>
                This is a template demo. To enable real-time data persistence, run:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <code className="block bg-muted p-3 rounded-md text-sm font-mono">
                npx convex dev
              </code>
              <p className="text-sm text-muted-foreground mt-2">
                This will set up Convex and enable real database operations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Todo</CardTitle>
              <CardDescription>Create a new task to keep track of your work.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTodo} className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="What do you need to do?"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  className="flex-1"
                  data-testid="input-new-todo"
                />
                <Select
                  value={newTodoPriority}
                  onValueChange={(value: "low" | "medium" | "high") => setNewTodoPriority(value)}
                >
                  <SelectTrigger className="w-full sm:w-32" data-testid="select-priority">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" data-testid="button-add-todo">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Todos</CardTitle>
              <CardDescription>
                {todos.length
                  ? `You have ${todos.filter((t) => !t.completed).length} active tasks`
                  : "No tasks yet. Create one above!"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Circle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No todos yet. Create your first one above!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border hover-elevate ${
                        todo.completed ? "opacity-60" : ""
                      }`}
                      data-testid={`todo-item-${todo.id}`}
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo.id)}
                        data-testid={`checkbox-todo-${todo.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            todo.completed ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {todo.title}
                        </p>
                        {todo.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {todo.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className={priorityColors[todo.priority]}
                      >
                        {todo.priority}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTodo(todo.id)}
                        data-testid={`button-delete-todo-${todo.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container px-4 md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            Built with Vite + Convex + shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  );
}
