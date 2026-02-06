import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/shop/ProductCard';
import { CartSummary } from '@/components/shop/CartSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  product_type: string;
  class_level: string | null;
  subject: string | null;
  cover_image: string | null;
  pdf_url: string | null;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const filteredProducts = products.filter(product => {
    if (activeTab === 'all') return true;
    if (activeTab === 'books') return product.product_type === 'book';
    if (activeTab === 'addons') return product.product_type === 'addon';
    return true;
  });

  const books = products.filter(p => p.product_type === 'book');
  const addons = products.filter(p => p.product_type === 'addon');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-32">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shop Our Collection
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose your subjects and start your board exam preparation today
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-foreground">
              <span className="font-semibold">Special Offer:</span>
              <span>2 Books = ₹99 | 4 Books = ₹249 | Add-ons = ₹19 each</span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="all">
                All ({products.length})
              </TabsTrigger>
              <TabsTrigger value="books">
                99 Books ({books.length})
              </TabsTrigger>
              <TabsTrigger value="addons">
                Add-ons ({addons.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PackageOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Products Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Products will be added by the admin. Check back soon for amazing study materials!
              </p>
              <Button asChild variant="outline">
                <Link to="/">Go Back Home</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    description={product.description || undefined}
                    price={product.price}
                    productType={product.product_type as 'book' | 'addon'}
                    classLevel={product.class_level || '10'}
                    subject={product.subject || undefined}
                    coverImage={product.cover_image || undefined}
                  />
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && products.length > 0 && !isLoading && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No products found in this category</p>
            </div>
          )}
        </div>
      </main>

      <CartSummary />
      <Footer />
    </div>
  );
}
