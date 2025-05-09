import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Define order status types
const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewOrderId, setViewOrderId] = useState<number | null>(null);
  
  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });
  
  // Fetch order details when viewing a specific order
  const { data: orderDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: [`/api/orders/${viewOrderId}`],
    enabled: !!viewOrderId,
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      if (viewOrderId) {
        queryClient.invalidateQueries({ queryKey: [`/api/orders/${viewOrderId}`] });
      }
      
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      });
    },
  });
  
  // Filter orders based on search query and status
  const filteredOrders = orders?.filter((order: any) => {
    const matchesSearch = searchQuery
      ? order.id.toString().includes(searchQuery) ||
        (order.shippingAddress?.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.shippingAddress?.lastName || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesStatus = selectedStatus
      ? order.status === selectedStatus
      : true;
      
    return matchesSearch && matchesStatus;
  });
  
  // Get status badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "shipped":
        return "secondary";
      case "processing":
        return "outline";
      case "pending":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate order counts by status
  const getOrderCountsByStatus = () => {
    const counts: Record<string, number> = {};
    
    orderStatuses.forEach(status => {
      counts[status] = orders?.filter((order: any) => order.status === status).length || 0;
    });
    
    counts.total = orders?.length || 0;
    
    return counts;
  };
  
  const orderCounts = getOrderCountsByStatus();
  
  return (
    <AdminLayout title="Order Management">
      {/* Order Status Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-4">
          <TabsTrigger value="all" onClick={() => setSelectedStatus(null)}>
            All ({orderCounts.total})
          </TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setSelectedStatus("pending")}>
            Pending ({orderCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="processing" onClick={() => setSelectedStatus("processing")}>
            Processing ({orderCounts.processing})
          </TabsTrigger>
          <TabsTrigger value="shipped" onClick={() => setSelectedStatus("shipped")}>
            Shipped ({orderCounts.shipped})
          </TabsTrigger>
          <TabsTrigger value="delivered" onClick={() => setSelectedStatus("delivered")}>
            Delivered ({orderCounts.delivered})
          </TabsTrigger>
          <TabsTrigger value="cancelled" onClick={() => setSelectedStatus("cancelled")}>
            Cancelled ({orderCounts.cancelled})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search by order ID or customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-10 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableCaption>
                {filteredOrders?.length
                  ? `A list of ${filteredOrders.length} orders`
                  : "No orders found"}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      {order.shippingAddress ? (
                        <div>
                          <div className="font-medium">
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.shippingAddress.email || "Email not available"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Customer #{order.userId}</span>
                      )}
                    </TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewOrderId(order.id)}
                        >
                          <i className="ri-eye-line mr-1"></i>
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredOrders?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      <div>
                        <i className="ri-inbox-line text-3xl text-muted-foreground"></i>
                        <p className="text-muted-foreground mt-2">
                          No orders match your search criteria
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
      
      {/* Order Details Dialog */}
      <Dialog open={!!viewOrderId} onOpenChange={(open) => !open && setViewOrderId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {isLoadingDetails ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : orderDetails ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Order #{orderDetails.id}
                  <Badge variant={getStatusBadgeVariant(orderDetails.status)} className="capitalize">
                    {orderDetails.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Placed on {formatDate(orderDetails.createdAt)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {/* Order Details */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Items</CardTitle>
                    <CardDescription>Order items and details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderDetails.items?.map((item: any) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b border-border">
                          <div className="flex-1">
                            <p className="font-medium">Product #{item.productId}</p>
                            {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                            {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                          </div>
                          <div className="text-right">
                            <p>{formatPrice(item.price)} × {item.quantity}</p>
                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-4 space-y-2">
                        <div className="flex justify-between">
                          <p className="text-muted-foreground">Subtotal</p>
                          <p>{formatPrice(orderDetails.total - 10)}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-muted-foreground">Shipping</p>
                          <p>{formatPrice(10)}</p>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium text-lg">
                          <p>Total</p>
                          <p className="text-accent">{formatPrice(orderDetails.total)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Customer & Shipping */}
                <div className="space-y-6">
                  {/* Status Update */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Status</CardTitle>
                      <CardDescription>Update order status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={orderDetails.status}
                        onValueChange={(value) => updateOrderStatusMutation.mutate({ id: orderDetails.id, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="mt-4">
                        <Button
                          className="w-full"
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          {updateOrderStatusMutation.isPending ? "Updating..." : "Update Status"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Customer Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer</CardTitle>
                      <CardDescription>Customer information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Name:</span>{" "}
                          {orderDetails.shippingAddress?.firstName} {orderDetails.shippingAddress?.lastName}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {orderDetails.shippingAddress?.email || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {orderDetails.shippingAddress?.phone || "N/A"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Shipping Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Address</CardTitle>
                      <CardDescription>Delivery location</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {orderDetails.shippingAddress ? (
                        <div className="space-y-1">
                          <p>{orderDetails.shippingAddress.address}</p>
                          <p>
                            {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}{" "}
                            {orderDetails.shippingAddress.zipCode}
                          </p>
                          <p>{orderDetails.shippingAddress.country}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Shipping details not available</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Payment Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment</CardTitle>
                      <CardDescription>Payment information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {orderDetails.paymentDetails ? (
                        <div className="space-y-2">
                          <p>
                            <span className="font-medium">Method:</span>{" "}
                            Credit Card
                          </p>
                          <p>
                            <span className="font-medium">Card:</span>{" "}
                            **** **** **** {orderDetails.paymentDetails.cardNumberLast4}
                          </p>
                          <p>
                            <span className="font-medium">Name:</span>{" "}
                            {orderDetails.paymentDetails.cardName}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Payment details not available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                Order details could not be loaded
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
