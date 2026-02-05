 import { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { 
   LayoutDashboard, 
   Package, 
   ShoppingCart, 
   Users, 
   Tag, 
   BarChart3,
   Plus,
   Loader2,
   Eye,
   CheckCircle,
   XCircle,
   Clock
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { 
   Select, 
   SelectContent, 
   SelectItem, 
   SelectTrigger, 
   SelectValue 
 } from '@/components/ui/select';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 import { Badge } from '@/components/ui/badge';
 
 interface Product {
   id: string;
   name: string;
   description: string | null;
   price: number;
   product_type: string;
   class_level: string | null;
   subject: string | null;
   is_active: boolean;
   created_at: string;
 }
 
 interface Order {
   id: string;
   transaction_id: string;
   total_amount: number;
   status: string;
   created_at: string;
   profiles: { email: string; full_name: string | null } | null;
 }
 
 interface Analytics {
   totalRevenue: number;
   todayRevenue: number;
   weekRevenue: number;
   totalOrders: number;
   pendingOrders: number;
   totalUsers: number;
 }
 
 export default function Admin() {
   const { user, isAdmin, isLoading: authLoading } = useAuth();
   const navigate = useNavigate();
   const { toast } = useToast();
 
   const [products, setProducts] = useState<Product[]>([]);
   const [orders, setOrders] = useState<Order[]>([]);
   const [analytics, setAnalytics] = useState<Analytics>({
     totalRevenue: 0,
     todayRevenue: 0,
     weekRevenue: 0,
     totalOrders: 0,
     pendingOrders: 0,
     totalUsers: 0,
   });
   const [isLoading, setIsLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('dashboard');
 
   // New product form
   const [newProduct, setNewProduct] = useState({
     name: '',
     description: '',
     price: 99,
     product_type: 'book',
     class_level: '10',
     subject: '',
   });
   const [isAddingProduct, setIsAddingProduct] = useState(false);
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate('/auth');
     } else if (!authLoading && user && !isAdmin) {
       toast({
         title: 'Access Denied',
         description: 'You do not have admin privileges.',
         variant: 'destructive',
       });
       navigate('/');
     }
   }, [user, isAdmin, authLoading, navigate, toast]);
 
   useEffect(() => {
     if (isAdmin) {
       fetchData();
     }
   }, [isAdmin]);
 
   const fetchData = async () => {
     setIsLoading(true);
 
     // Fetch products
     const { data: productsData } = await supabase
       .from('products')
       .select('*')
       .order('created_at', { ascending: false });
 
     // Fetch orders with user info
     const { data: ordersData } = await supabase
       .from('orders')
       .select(`
         id,
         transaction_id,
         total_amount,
         status,
         created_at,
         profiles!orders_user_id_fkey (
           email,
           full_name
         )
       `)
       .order('created_at', { ascending: false })
       .limit(50);
 
     // Calculate analytics
     const today = new Date();
     today.setHours(0, 0, 0, 0);
     const weekAgo = new Date(today);
     weekAgo.setDate(weekAgo.getDate() - 7);
 
     const completedOrders = ordersData?.filter(o => o.status === 'completed') || [];
     const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
     const todayRevenue = completedOrders
       .filter(o => new Date(o.created_at) >= today)
       .reduce((sum, o) => sum + Number(o.total_amount), 0);
     const weekRevenue = completedOrders
       .filter(o => new Date(o.created_at) >= weekAgo)
       .reduce((sum, o) => sum + Number(o.total_amount), 0);
 
     // Get user count from profiles
     const { count: userCount } = await supabase
       .from('profiles')
       .select('*', { count: 'exact', head: true });
 
     setProducts(productsData || []);
     setOrders((ordersData as unknown as Order[]) || []);
     setAnalytics({
       totalRevenue,
       todayRevenue,
       weekRevenue,
       totalOrders: ordersData?.length || 0,
       pendingOrders: ordersData?.filter(o => o.status === 'verifying').length || 0,
       totalUsers: userCount || 0,
     });
 
     setIsLoading(false);
   };
 
   const handleAddProduct = async () => {
     if (!newProduct.name || !newProduct.subject) {
       toast({
         title: 'Missing fields',
         description: 'Please fill in all required fields.',
         variant: 'destructive',
       });
       return;
     }
 
     setIsAddingProduct(true);
 
     const { error } = await supabase.from('products').insert({
       name: newProduct.name,
       description: newProduct.description || null,
       price: newProduct.price,
       product_type: newProduct.product_type,
       class_level: newProduct.class_level,
       subject: newProduct.subject,
       is_active: true,
     });
 
     if (error) {
       toast({
         title: 'Error',
         description: 'Failed to add product.',
         variant: 'destructive',
       });
     } else {
       toast({ title: 'Success', description: 'Product added successfully!' });
       setNewProduct({
         name: '',
         description: '',
         price: 99,
         product_type: 'book',
         class_level: '10',
         subject: '',
       });
       fetchData();
     }
 
     setIsAddingProduct(false);
   };
 
   const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
     const { error } = await supabase
       .from('orders')
       .update({ status: newStatus })
       .eq('id', orderId);
 
     if (error) {
       toast({ title: 'Error', description: 'Failed to update order.', variant: 'destructive' });
     } else {
       // If completed, add books to user
       if (newStatus === 'completed') {
         const order = orders.find(o => o.id === orderId);
         if (order) {
           // Get order items and add to user_books
           const { data: orderItems } = await supabase
             .from('order_items')
             .select('product_id')
             .eq('order_id', orderId);
 
           if (orderItems) {
             const { data: orderData } = await supabase
               .from('orders')
               .select('user_id')
               .eq('id', orderId)
               .single();
 
             if (orderData) {
               for (const item of orderItems) {
                 await supabase.from('user_books').upsert({
                   user_id: orderData.user_id,
                   product_id: item.product_id,
                   order_id: orderId,
                 });
               }
             }
           }
         }
       }
 
       toast({ title: 'Updated', description: 'Order status updated.' });
       fetchData();
     }
   };
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case 'completed':
         return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
       case 'verifying':
         return <Badge className="bg-accent text-accent-foreground"><Clock className="w-3 h-3 mr-1" />Verifying</Badge>;
       case 'failed':
         return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
       default:
         return <Badge variant="secondary">{status}</Badge>;
     }
   };
 
   if (authLoading || isLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (!isAdmin) {
     return null;
   }
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-50">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <LayoutDashboard className="w-6 h-6" />
             <h1 className="font-display text-xl font-bold">ProCBSE Admin</h1>
           </div>
           <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
             Back to Site
           </Button>
         </div>
       </header>
 
       <main className="p-6">
         <Tabs value={activeTab} onValueChange={setActiveTab}>
           <TabsList className="mb-6">
             <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
             <TabsTrigger value="products"><Package className="w-4 h-4 mr-2" />Products</TabsTrigger>
             <TabsTrigger value="orders"><ShoppingCart className="w-4 h-4 mr-2" />Orders</TabsTrigger>
           </TabsList>
 
           {/* Dashboard Tab */}
           <TabsContent value="dashboard">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               <div className="bg-card rounded-xl border p-6 shadow-sm">
                 <div className="text-muted-foreground text-sm mb-1">Total Revenue</div>
                 <div className="text-3xl font-bold text-primary">₹{analytics.totalRevenue}</div>
               </div>
               <div className="bg-card rounded-xl border p-6 shadow-sm">
                 <div className="text-muted-foreground text-sm mb-1">Today's Revenue</div>
                 <div className="text-3xl font-bold text-success">₹{analytics.todayRevenue}</div>
               </div>
               <div className="bg-card rounded-xl border p-6 shadow-sm">
                 <div className="text-muted-foreground text-sm mb-1">This Week</div>
                 <div className="text-3xl font-bold text-accent">₹{analytics.weekRevenue}</div>
               </div>
               <div className="bg-card rounded-xl border p-6 shadow-sm">
                 <div className="text-muted-foreground text-sm mb-1">Pending Orders</div>
                 <div className="text-3xl font-bold text-destructive">{analytics.pendingOrders}</div>
               </div>
             </div>
 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-card rounded-xl border p-6 shadow-sm">
                 <h3 className="font-semibold mb-4">Quick Stats</h3>
                 <div className="space-y-3">
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Total Orders</span>
                     <span className="font-semibold">{analytics.totalOrders}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Total Users</span>
                     <span className="font-semibold">{analytics.totalUsers}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Active Products</span>
                     <span className="font-semibold">{products.filter(p => p.is_active).length}</span>
                   </div>
                 </div>
               </div>
 
               <div className="bg-card rounded-xl border p-6 shadow-sm">
                 <h3 className="font-semibold mb-4">Recent Orders</h3>
                 <div className="space-y-3">
                   {orders.slice(0, 5).map(order => (
                     <div key={order.id} className="flex items-center justify-between text-sm">
                       <span className="font-mono">{order.transaction_id.slice(0, 12)}...</span>
                       {getStatusBadge(order.status)}
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </TabsContent>
 
           {/* Products Tab */}
           <TabsContent value="products">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold">Products ({products.length})</h2>
               <Dialog>
                 <DialogTrigger asChild>
                   <Button><Plus className="w-4 h-4 mr-2" />Add Product</Button>
                 </DialogTrigger>
                 <DialogContent>
                   <DialogHeader>
                     <DialogTitle>Add New Product</DialogTitle>
                   </DialogHeader>
                   <div className="space-y-4 mt-4">
                     <div>
                       <Label>Product Name *</Label>
                       <Input
                         value={newProduct.name}
                         onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                         placeholder="Mathematics 99 Questions"
                       />
                     </div>
                     <div>
                       <Label>Description</Label>
                       <Textarea
                         value={newProduct.description}
                         onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                         placeholder="Product description..."
                       />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <Label>Price (₹)</Label>
                         <Input
                           type="number"
                           value={newProduct.price}
                           onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                         />
                       </div>
                       <div>
                         <Label>Type</Label>
                         <Select
                           value={newProduct.product_type}
                           onValueChange={v => setNewProduct({ ...newProduct, product_type: v })}
                         >
                           <SelectTrigger><SelectValue /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="book">99 Questions Book</SelectItem>
                             <SelectItem value="addon">Add-on</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <Label>Class Level</Label>
                         <Select
                           value={newProduct.class_level}
                           onValueChange={v => setNewProduct({ ...newProduct, class_level: v })}
                         >
                           <SelectTrigger><SelectValue /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="10">Class 10</SelectItem>
                             <SelectItem value="12">Class 12</SelectItem>
                             <SelectItem value="both">Both</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       <div>
                         <Label>Subject *</Label>
                         <Input
                           value={newProduct.subject}
                           onChange={e => setNewProduct({ ...newProduct, subject: e.target.value })}
                           placeholder="Mathematics"
                         />
                       </div>
                     </div>
                     <Button onClick={handleAddProduct} disabled={isAddingProduct} className="w-full">
                       {isAddingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Product'}
                     </Button>
                   </div>
                 </DialogContent>
               </Dialog>
             </div>
 
             <div className="bg-card rounded-xl border overflow-hidden">
               <table className="w-full">
                 <thead className="bg-secondary/50">
                   <tr>
                     <th className="text-left px-4 py-3 text-sm font-medium">Product</th>
                     <th className="text-left px-4 py-3 text-sm font-medium">Type</th>
                     <th className="text-left px-4 py-3 text-sm font-medium">Class</th>
                     <th className="text-left px-4 py-3 text-sm font-medium">Price</th>
                     <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   {products.map(product => (
                     <tr key={product.id}>
                       <td className="px-4 py-3">
                         <div className="font-medium">{product.name}</div>
                         <div className="text-sm text-muted-foreground">{product.subject}</div>
                       </td>
                       <td className="px-4 py-3">
                         <Badge variant={product.product_type === 'book' ? 'default' : 'secondary'}>
                           {product.product_type}
                         </Badge>
                       </td>
                       <td className="px-4 py-3">{product.class_level}</td>
                       <td className="px-4 py-3 font-semibold">₹{product.price}</td>
                       <td className="px-4 py-3">
                         <Badge variant={product.is_active ? 'default' : 'secondary'}>
                           {product.is_active ? 'Active' : 'Inactive'}
                         </Badge>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </TabsContent>
 
           {/* Orders Tab */}
           <TabsContent value="orders">
             <h2 className="text-xl font-bold mb-6">Orders ({orders.length})</h2>
 
             <div className="bg-card rounded-xl border overflow-hidden">
               <table className="w-full">
                 <thead className="bg-secondary/50">
                   <tr>
                     <th className="text-left px-4 py-3 text-sm font-medium">Transaction ID</th>
                     <th className="text-left px-4 py-3 text-sm font-medium">Customer</th>
                     <th className="text-left px-4 py-3 text-sm font-medium">Amount</th>
                     <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                     <th className="text-left px-4 py-3 text-sm font-medium">Date</th>
                     <th className="text-left px-4 py-3 text-sm font-medium">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   {orders.map(order => (
                     <tr key={order.id}>
                       <td className="px-4 py-3 font-mono text-sm">{order.transaction_id}</td>
                       <td className="px-4 py-3">
                         <div className="font-medium">{order.profiles?.full_name || 'N/A'}</div>
                         <div className="text-sm text-muted-foreground">{order.profiles?.email}</div>
                       </td>
                       <td className="px-4 py-3 font-semibold">₹{order.total_amount}</td>
                       <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                       <td className="px-4 py-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                       <td className="px-4 py-3">
                         {order.status === 'verifying' && (
                           <div className="flex gap-2">
                             <Button
                               size="sm"
                               variant="outline"
                               className="text-success border-success hover:bg-success/10"
                               onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                             >
                               <CheckCircle className="w-4 h-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant="outline"
                               className="text-destructive border-destructive hover:bg-destructive/10"
                               onClick={() => handleUpdateOrderStatus(order.id, 'failed')}
                             >
                               <XCircle className="w-4 h-4" />
                             </Button>
                           </div>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </TabsContent>
         </Tabs>
       </main>
     </div>
   );
 }