 import { useState, useEffect } from 'react';
 import { Navbar } from '@/components/layout/Navbar';
 import { Footer } from '@/components/layout/Footer';
 import { ProductCard } from '@/components/shop/ProductCard';
 import { CartSummary } from '@/components/shop/CartSummary';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { supabase } from '@/integrations/supabase/client';
 import { Loader2 } from 'lucide-react';
 
 interface Product {
   id: string;
   name: string;
   description: string | null;
   price: number;
   product_type: string;
   class_level: string | null;
   subject: string | null;
   cover_image: string | null;
 }
 
 // Demo products for when database is empty
 const demoProducts: Product[] = [
   {
     id: 'demo-1',
     name: 'Mathematics 99 Questions',
     description: 'All chapters from Algebra to Statistics - Most repeated board exam questions',
     price: 149,
     product_type: 'book',
     class_level: '10',
     subject: 'Mathematics',
     cover_image: null,
   },
   {
     id: 'demo-2',
     name: 'Science 99 Questions',
     description: 'Physics, Chemistry & Biology combined - Complete board exam preparation',
     price: 149,
     product_type: 'book',
     class_level: '10',
     subject: 'Science',
     cover_image: null,
   },
   {
     id: 'demo-3',
     name: 'Social Science 99 Questions',
     description: 'History, Geography, Civics & Economics - Essential questions for boards',
     price: 149,
     product_type: 'book',
     class_level: '10',
     subject: 'Social Science',
     cover_image: null,
   },
   {
     id: 'demo-4',
     name: 'English 99 Questions',
     description: 'Grammar, Writing & Literature - Complete English preparation',
     price: 149,
     product_type: 'book',
     class_level: '10',
     subject: 'English',
     cover_image: null,
   },
   {
     id: 'demo-5',
     name: 'Previous Year Papers Pack',
     description: 'Collection of solved previous year papers with detailed solutions',
     price: 99,
     product_type: 'addon',
     class_level: 'both',
     subject: 'All Subjects',
     cover_image: null,
   },
   {
     id: 'demo-6',
     name: 'Formula Sheet Bundle',
     description: 'Quick revision formula sheets for Math & Science',
     price: 99,
     product_type: 'addon',
     class_level: 'both',
     subject: 'Math & Science',
     cover_image: null,
   },
 ];
 
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
       setProducts(demoProducts);
     } else if (data && data.length > 0) {
       setProducts(data);
     } else {
       // Use demo products if database is empty
       setProducts(demoProducts);
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
             <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
               Shop Our Collection
             </h1>
             <p className="text-lg text-muted-foreground">
               Choose your subjects and start your board exam preparation today
             </p>
             <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground">
               <span className="font-semibold">Special Offer:</span>
               <span>2 Books = ₹99 | 4 Books = ₹249</span>
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
 
           {filteredProducts.length === 0 && !isLoading && (
             <div className="text-center py-20">
               <p className="text-muted-foreground">No products found</p>
             </div>
           )}
         </div>
       </main>
 
       <CartSummary />
       <Footer />
     </div>
   );
 }