import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function RegisterModal({ isOpen, onClose, onLoginClick }: RegisterModalProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Remove confirmPassword as it's not needed in the API request
      const { confirmPassword, ...registerData } = values;
      
      const res = await apiRequest("POST", "/api/auth/register", registerData);
      
      const data = await res.json();
      
      // Update auth context with user data and token
      login(data.user, data.token);
      
      toast({
        title: "Registration successful",
        description: `Welcome to ELEV8, ${data.user.firstName || data.user.username}!`,
      });
      
      onClose();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <div className="text-center mb-6">
          <DialogTitle className="font-montserrat text-2xl font-light text-foreground">
            Create <span className="font-medium">Account</span>
          </DialogTitle>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background border-border text-foreground focus:border-accent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background border-border text-foreground focus:border-accent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
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
                  <FormLabel className="text-muted-foreground">Password</FormLabel>
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Confirm Password</FormLabel>
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
            
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground font-montserrat font-medium hover:bg-accent/80"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
            
            <div className="text-center text-muted-foreground text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-accent hover:underline"
              >
                Sign in
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
