 import { useState, useEffect } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { BookOpen, Download, Clock, CheckCircle, XCircle, ShoppingBag, Loader2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Navbar } from '@/components/layout/Navbar';
 import { Footer } from '@/components/layout/Footer';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Badge } from '@/components/ui/badge';
 
 interface UserBook {
   id: string;
   product_id: string;
   purchased_at: string;
   products: {
     name: string;
     description: string | null;
     subject: string | null;
     pdf_url: string | null;
     cover_image: string | null;
   };
 }
 
 interface Order {
   id: string;
   transaction_id: string;
   total_amount: number;
   status: string;
   created_at: string;
 }
 
 export default function MyBooks() {
   const { user, isLoading: authLoading } = useAuth();
   const navigate = useNavigate();
 
   const [books, setBooks] = useState<UserBook[]>([]);
   const [orders, setOrders] = useState<Order[]>([]);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate('/auth?redirect=/my-books');
     }
   }, [user, authLoading, navigate]);
 
   useEffect(() => {
     if (user) {
       fetchData();
     }
   }, [user]);
 
   const fetchData = async () => {
     if (!user) return;
 
     setIsLoading(true);
 
     // Fetch user's books
     const { data: booksData } = await supabase
       .from('user_books')
       .select(`
         id,
         product_id,
         purchased_at,
         products (
           name,
           description,
           subject,
           pdf_url,
           cover_image
         )
       `)
       .eq('user_id', user.id)
       .order('purchased_at', { ascending: false });
 
     // Fetch user's orders
     const { data: ordersData } = await supabase
       .from('orders')
       .select('id, transaction_id, total_amount, status, created_at')
       .eq('user_id', user.id)
       .order('created_at', { ascending: false });
 
     setBooks((booksData as unknown as UserBook[]) || []);
     setOrders(ordersData || []);
     setIsLoading(false);
   };
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case 'completed':
         return (
           <Badge className="bg-success text-success-foreground">
             <CheckCircle className="w-3 h-3 mr-1" />
             Completed
           </Badge>
         );
       case 'verifying':
         return (
           <Badge className="bg-accent text-accent-foreground">
             <Clock className="w-3 h-3 mr-1" />
             Verifying
           </Badge>
         );
       case 'failed':
         return (
           <Badge variant="destructive">
             <XCircle className="w-3 h-3 mr-1" />
             Failed
           </Badge>
         );
       default:
         return (
           <Badge variant="secondary">
             <Clock className="w-3 h-3 mr-1" />
             {status}
           </Badge>
         );
     }
   };
 
   const getSubjectEmoji = (subject?: string | null) => {
     if (subject?.toLowerCase().includes('math')) return '📐';
     if (subject?.toLowerCase().includes('science')) return '🔬';
     if (subject?.toLowerCase().includes('social')) return '🌍';
     if (subject?.toLowerCase().includes('english')) return '📖';
     return '📚';
   };
 
   if (authLoading || !user) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
 
       <main className="pt-24 pb-20">
         <div className="container mx-auto px-4">
           <div className="max-w-4xl mx-auto">
             <h1 className="font-display text-2xl md:text-3xl font-bold text-primary mb-2">
               My Books
             </h1>
             <p className="text-muted-foreground mb-8">
               Access your purchased study materials
             </p>
 
             {isLoading ? (
               <div className="flex items-center justify-center py-20">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
             ) : books.length === 0 && orders.length === 0 ? (
               <div className="text-center py-20">
                 <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                   <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                 </div>
                 <h2 className="font-display text-xl font-bold text-primary mb-4">
                   No books yet
                 </h2>
                 <p className="text-muted-foreground mb-8">
                   Start your board exam preparation by purchasing our question banks!
                 </p>
                 <Button asChild size="lg">
                   <Link to="/shop">Browse Shop</Link>
                 </Button>
               </div>
             ) : (
               <div className="space-y-8">
                 {/* Purchased Books */}
                 {books.length > 0 && (
                   <section>
                     <h2 className="font-semibold text-lg mb-4">Your Books</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {books.map((book) => (
                         <div
                           key={book.id}
                           className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
                         >
                           <div className="w-full h-32 bg-secondary rounded-lg flex items-center justify-center mb-4">
                             <span className="text-5xl">{getSubjectEmoji(book.products.subject)}</span>
                           </div>
                           <h3 className="font-semibold text-primary mb-2 line-clamp-2">
                             {book.products.name}
                           </h3>
                           {book.products.description && (
                             <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                               {book.products.description}
                             </p>
                           )}
                           <Button
                             className="w-full"
                             disabled={!book.products.pdf_url}
                           >
                             <Download className="w-4 h-4 mr-2" />
                             {book.products.pdf_url ? 'Download PDF' : 'Coming Soon'}
                           </Button>
                         </div>
                       ))}
                     </div>
                   </section>
                 )}
 
                 {/* Orders */}
                 {orders.length > 0 && (
                   <section>
                     <h2 className="font-semibold text-lg mb-4">Order History</h2>
                     <div className="bg-card rounded-xl border border-border overflow-hidden">
                       <table className="w-full">
                         <thead className="bg-secondary/50">
                           <tr>
                             <th className="text-left px-4 py-3 text-sm font-medium">Transaction ID</th>
                             <th className="text-left px-4 py-3 text-sm font-medium">Amount</th>
                             <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                             <th className="text-left px-4 py-3 text-sm font-medium">Date</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-border">
                           {orders.map((order) => (
                             <tr key={order.id}>
                               <td className="px-4 py-3 font-mono text-sm">{order.transaction_id}</td>
                               <td className="px-4 py-3">₹{order.total_amount}</td>
                               <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                               <td className="px-4 py-3 text-sm text-muted-foreground">
                                 {new Date(order.created_at).toLocaleDateString()}
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </section>
                 )}
               </div>
             )}
           </div>
         </div>
       </main>
 
       <Footer />
     </div>
   );
 }