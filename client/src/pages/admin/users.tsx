import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [viewUserId, setViewUserId] = useState<number | null>(null);
  
  // Fetch all users - in a real app with many users, we'd implement pagination
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"], // This endpoint doesn't exist in our mock API, but in a real app it would
    queryFn: async () => {
      // Since we don't have a real users API endpoint, we'll create some mock data
      // In a real app, this would be a fetch call
      return [
        {
          id: 1,
          username: "admin",
          email: "admin@elev8.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          createdAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          username: "customer1",
          email: "customer1@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "user",
          createdAt: "2023-02-15T00:00:00.000Z",
        },
        {
          id: 3,
          username: "customer2",
          email: "customer2@example.com",
          firstName: "Jane",
          lastName: "Smith",
          role: "user",
          createdAt: "2023-03-20T00:00:00.000Z",
        },
        {
          id: 4,
          username: "support_admin",
          email: "support@elev8.com",
          firstName: "Support",
          lastName: "Admin",
          role: "admin",
          createdAt: "2023-01-10T00:00:00.000Z",
        },
        {
          id: 5,
          username: "customer3",
          email: "customer3@example.com",
          firstName: "Robert",
          lastName: "Johnson",
          role: "user",
          createdAt: "2023-04-05T00:00:00.000Z",
        },
      ];
    },
    staleTime: Infinity, // Keep the data forever since it's mock data
  });
  
  // Get user details for the user detail view
  const currentUser = viewUserId ? users?.find(user => user.id === viewUserId) : null;
  
  // Filter users based on search query and role
  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = searchQuery
      ? user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesRole = selectedRole ? user.role === selectedRole : true;
      
    return matchesSearch && matchesRole;
  });
  
  // Calculate user counts by role
  const getUserCounts = () => {
    const counts = {
      admin: 0,
      user: 0,
      total: 0,
    };
    
    users?.forEach((user: any) => {
      counts[user.role as 'admin' | 'user']++;
      counts.total++;
    });
    
    return counts;
  };
  
  const userCounts = getUserCounts();
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  return (
    <AdminLayout title="User Management">
      {/* User Role Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setSelectedRole(null)}>
            All Users ({userCounts.total})
          </TabsTrigger>
          <TabsTrigger value="admin" onClick={() => setSelectedRole("admin")}>
            Admins ({userCounts.admin})
          </TabsTrigger>
          <TabsTrigger value="user" onClick={() => setSelectedRole("user")}>
            Customers ({userCounts.user})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search by username, email, or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Note: This is a demo with mock user data. In a real application, you would be able to manage real users.
        </p>
      </div>
      
      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableCaption>
                {filteredUsers?.length
                  ? `A list of ${filteredUsers.length} users`
                  : "No users found"}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "outline"} className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewUserId(user.id)}
                      >
                        <i className="ri-eye-line mr-1"></i>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredUsers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      <div>
                        <i className="ri-user-search-line text-3xl text-muted-foreground"></i>
                        <p className="text-muted-foreground mt-2">
                          No users match your search criteria
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* User Details Dialog */}
      <Dialog open={!!viewUserId} onOpenChange={(open) => !open && setViewUserId(null)}>
        <DialogContent className="max-w-md">
          {currentUser ? (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  Viewing information for user #{currentUser.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* User Avatar and Name */}
                <div className="flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xl mb-4">
                    {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                  </div>
                  <h3 className="text-lg font-medium">
                    {currentUser.firstName} {currentUser.lastName}
                  </h3>
                  <Badge variant={currentUser.role === "admin" ? "default" : "outline"} className="capitalize mt-1">
                    {currentUser.role}
                  </Badge>
                </div>
                
                {/* User Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-medium">@{currentUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{currentUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="font-medium">{formatDate(currentUser.createdAt)}</span>
                  </div>
                </div>
                
                {/* Actions - Note: These are just UI elements without real functionality for the demo */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => {
                    toast({
                      title: "Demo Functionality",
                      description: "In a real application, this would open an edit user form.",
                    });
                  }}>
                    <i className="ri-edit-line mr-2"></i>
                    Edit User
                  </Button>
                  
                  {currentUser.role !== "admin" && (
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Demo Functionality",
                        description: "In a real application, this would promote the user to admin role.",
                      });
                    }}>
                      <i className="ri-shield-star-line mr-2"></i>
                      Make Admin
                    </Button>
                  )}
                  
                  <Button variant="destructive" onClick={() => {
                    toast({
                      title: "Demo Functionality",
                      description: "In a real application, this would deactivate the user account.",
                    });
                  }}>
                    <i className="ri-user-unfollow-line mr-2"></i>
                    Deactivate Account
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                User details could not be loaded
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
