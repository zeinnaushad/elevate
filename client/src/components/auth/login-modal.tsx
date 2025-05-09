import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

export default function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await apiRequest("POST", "/api/auth/login", {
        email: values.email,
        password: values.password,
      });
      
      const data = await res.json();
      
      // Update auth context with user data and token
      login(data.user, data.token);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.firstName || data.user.username}!`,
      });
      
      onClose();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <div className="text-center mb-6">
          <DialogTitle className="font-montserrat text-2xl font-light text-foreground">
            Login to Your <span className="font-medium">Account</span>
          </DialogTitle>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="bg-background border-border text-foreground focus:border-accent"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-muted-foreground">Password</FormLabel>
                    <a href="#" className="text-accent text-sm hover:underline">Forgot Password?</a>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="bg-background border-border text-foreground focus:border-accent"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </FormControl>
                  <FormLabel className="text-muted-foreground text-sm">Remember me</FormLabel>
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground font-montserrat font-medium hover:bg-accent/80"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="text-center text-muted-foreground text-sm">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onRegisterClick}
                className="text-accent hover:underline"
              >
                Create one
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
