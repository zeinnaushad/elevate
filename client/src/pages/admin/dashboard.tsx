import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  Legend 
} from "recharts";

export default function AdminDashboard() {
  // Fetch summary data
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/orders'],
  });
  
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
  });
  
  // Dashboard metrics
  const totalRevenue = orders?.reduce((sum: number, order: any) => sum + order.total, 0) || 0;
  const orderCount = orders?.length || 0;
  const productCount = products?.length || 0;
  
  // Status counts for orders
  const orderStatusCounts = orders?.reduce((acc: any, order: any) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {}) || {};
  
  const orderStatusData = Object.entries(orderStatusCounts).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Category counts for products
  const productCategoryCounts = products?.reduce((acc: any, product: any) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {}) || {};
  
  const productCategoryData = Object.entries(productCategoryCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
    value,
  }));
  
  // Chart colors
  const COLORS = ['#D4A373', '#CCA36E', '#E9D8A6', '#94D2BD', '#0A9396'];
  
  // Mock sales data (in a real app, this would come from the API)
  const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 2000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
    { name: 'Aug', sales: 4000 },
    { name: 'Sep', sales: 3200 },
    { name: 'Oct', sales: 2800 },
    { name: 'Nov', sales: 4300 },
    { name: 'Dec', sales: 5000 },
  ];
  
  // Recent orders
  const recentOrders = orders?.slice(0, 5) || [];
  
  return (
    <AdminLayout title="Dashboard">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <i className="ri-money-dollar-circle-line text-muted-foreground text-xl"></i>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Lifetime sales revenue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <i className="ri-shopping-cart-line text-muted-foreground text-xl"></i>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <Skeleton className="h-8 w-1/3" />
            ) : (
              <div className="text-2xl font-bold">{orderCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total orders processed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <i className="ri-t-shirt-line text-muted-foreground text-xl"></i>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <Skeleton className="h-8 w-1/3" />
            ) : (
              <div className="text-2xl font-bold">{productCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Active products in store
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <i className="ri-time-line text-muted-foreground text-xl"></i>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <Skeleton className="h-8 w-1/3" />
            ) : (
              <div className="text-2xl font-bold">
                {orders?.filter((order: any) => order.status === 'pending').length || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Orders awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="sales" className="mb-8">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))' 
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(var(--accent))" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Breakdown of orders by status</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingOrders ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-48 w-48 rounded-full" />
                </div>
              ) : orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))' 
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No order data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Products by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingProducts ? (
                <Skeleton className="h-full w-full" />
              ) : productCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productCategoryData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" stroke="#888888" />
                    <YAxis stroke="#888888" />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))' 
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No product data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-6">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} • 
                      {order.items?.length || 0} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <Badge className="capitalize" variant={
                      order.status === 'delivered' ? 'default' :
                      order.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No recent orders to display
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
