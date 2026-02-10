import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Clock, CheckCircle, XCircle, ShoppingBag, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface UserBook {
  id: string;
  product_id: string;
  purchased_at: string;
  order_id: string | null;
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
  total_amount: number;
  status: string;
  created_at: string;
  order_items: {
    product_id: string;
    price: number;
    products: {
      name: string;
    };
  }[];
}

export default function MyBooks() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState<UserBook[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'books' | 'orders'>('books');

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

    const [booksRes, ordersRes] = await Promise.all([
      supabase
        .from('user_books')
        .select(`
          id, product_id, purchased_at, order_id,
          products (name, description, subject, pdf_url, cover_image)
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false }),
      supabase
        .from('orders')
        .select(`
          id, total_amount, status, created_at,
          order_items (product_id, price, products (name))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    setBooks((booksRes.data as unknown as UserBook[]) || []);
    setOrders((ordersRes.data as unknown as Order[]) || []);
    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'verifying':
        return (
          <Badge className="bg-accent/10 text-accent border-accent/20">
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
            Pending
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

  const handleDownload = (pdfUrl: string, name: string) => {
    window.open(pdfUrl, '_blank');
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
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              My Books
            </h1>
            <p className="text-muted-foreground mb-6">
              Access your purchased study materials and view order history
            </p>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              <Button
                variant={activeTab === 'books' ? 'default' : 'outline'}
                onClick={() => setActiveTab('books')}
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                My Books ({books.length})
              </Button>
              <Button
                variant={activeTab === 'orders' ? 'default' : 'outline'}
                onClick={() => setActiveTab('orders')}
                size="sm"
              >
                <Clock className="w-4 h-4 mr-2" />
                Order History ({orders.length})
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : books.length === 0 && orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
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
              <>
                {/* Books Tab */}
                {activeTab === 'books' && (
                  <div>
                    {books.length === 0 ? (
                      <div className="text-center py-12 bg-card rounded-xl border border-border">
                        <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No books yet. Complete a purchase to see your books here.</p>
                        <Button asChild size="sm" className="mt-4">
                          <Link to="/shop">Browse Shop</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {books.map((book) => (
                          <div
                            key={book.id}
                            className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="w-full h-32 bg-secondary rounded-lg flex items-center justify-center mb-4">
                              <span className="text-5xl">{getSubjectEmoji(book.products.subject)}</span>
                            </div>
                            <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                              {book.products.name}
                            </h3>
                            {book.products.description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {book.products.description}
                              </p>
                            )}
                            {book.products.pdf_url ? (
                              <Button
                                className="w-full"
                                onClick={() => handleDownload(book.products.pdf_url!, book.products.name)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                              </Button>
                            ) : (
                              <Button className="w-full" variant="secondary" disabled>
                                <Clock className="w-4 h-4 mr-2" />
                                Coming Soon
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="text-center py-12 bg-card rounded-xl border border-border">
                        <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No orders yet.</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="bg-card rounded-xl border border-border p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="font-bold text-lg text-foreground">₹{order.total_amount}</p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <Separator className="my-3" />
                          <div className="space-y-1.5">
                            {order.order_items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{item.products?.name || 'Product'}</span>
                                <span className="text-foreground">₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
