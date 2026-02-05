 import { Link, useNavigate } from 'react-router-dom';
 import { Trash2, ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Navbar } from '@/components/layout/Navbar';
 import { Footer } from '@/components/layout/Footer';
 import { useCart } from '@/contexts/CartContext';
 import { useAuth } from '@/contexts/AuthContext';
 import { Separator } from '@/components/ui/separator';
 
 export default function Cart() {
   const { items, removeItem, getBookCount, getSubtotal, getDiscount, getTotal, clearCart } = useCart();
   const { user } = useAuth();
   const navigate = useNavigate();
 
   const bookCount = getBookCount();
   const subtotal = getSubtotal();
   const discount = getDiscount();
   const total = getTotal();
 
   const getDiscountLabel = () => {
     if (bookCount >= 4) return 'Bundle of 4+ (₹249)';
     if (bookCount >= 2) return 'Bundle of 2+ (₹99)';
     return null;
   };
 
   const handleProceedToPayment = () => {
     if (!user) {
       navigate('/auth?redirect=/checkout');
     } else {
       navigate('/checkout');
     }
   };
 
   const getSubjectEmoji = (subject?: string) => {
     if (subject?.toLowerCase().includes('math')) return '📐';
     if (subject?.toLowerCase().includes('science')) return '🔬';
     if (subject?.toLowerCase().includes('social')) return '🌍';
     if (subject?.toLowerCase().includes('english')) return '📖';
     return '📚';
   };
 
   if (items.length === 0) {
     return (
       <div className="min-h-screen bg-background">
         <Navbar />
         <main className="pt-24 pb-20">
           <div className="container mx-auto px-4">
             <div className="max-w-2xl mx-auto text-center py-20">
               <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                 <ShoppingBag className="w-12 h-12 text-muted-foreground" />
               </div>
               <h1 className="font-display text-2xl font-bold text-primary mb-4">
                 Your cart is empty
               </h1>
               <p className="text-muted-foreground mb-8">
                 Add some books to get started with your board exam preparation!
               </p>
               <Button asChild size="lg">
                 <Link to="/shop">
                   <ArrowLeft className="mr-2 w-4 h-4" />
                   Browse Shop
                 </Link>
               </Button>
             </div>
           </div>
         </main>
         <Footer />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
       
       <main className="pt-24 pb-20">
         <div className="container mx-auto px-4">
           <div className="max-w-4xl mx-auto">
             {/* Header */}
             <div className="flex items-center justify-between mb-8">
               <div>
                 <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">
                   Your Cart
                 </h1>
                 <p className="text-muted-foreground">
                   {items.length} item{items.length > 1 ? 's' : ''}
                 </p>
               </div>
               <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
                 <Trash2 className="w-4 h-4 mr-2" />
                 Clear All
               </Button>
             </div>
 
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Cart Items */}
               <div className="lg:col-span-2 space-y-4">
                 {items.map((item) => (
                   <div
                     key={item.id}
                     className="flex gap-4 p-4 bg-card rounded-xl border border-border shadow-sm"
                   >
                     <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                       <span className="text-3xl">{getSubjectEmoji(item.subject)}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-start justify-between gap-4">
                         <div>
                           <h3 className="font-semibold text-primary line-clamp-1">
                             {item.name}
                           </h3>
                           <div className="flex items-center gap-2 mt-1">
                             <span className={`text-xs px-2 py-0.5 rounded-full ${
                               item.productType === 'book' 
                                 ? 'bg-primary/10 text-primary' 
                                 : 'bg-accent/20 text-accent-foreground'
                             }`}>
                               {item.productType === 'book' ? '99 Questions' : 'Add-on'}
                             </span>
                             <span className="text-xs text-muted-foreground">
                               Class {item.classLevel === 'both' ? '10 & 12' : item.classLevel}
                             </span>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="font-bold text-primary">₹{item.price}</div>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => removeItem(item.id)}
                             className="text-destructive hover:text-destructive mt-1 h-8 px-2"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
 
               {/* Order Summary */}
               <div className="lg:col-span-1">
                 <div className="bg-card rounded-xl border border-border p-6 shadow-md sticky top-24">
                   <h2 className="font-display text-xl font-bold text-primary mb-4">
                     Order Summary
                   </h2>
 
                   <div className="space-y-3">
                     <div className="flex justify-between text-muted-foreground">
                       <span>Subtotal</span>
                       <span>₹{subtotal}</span>
                     </div>
 
                     {discount > 0 && (
                       <div className="flex justify-between text-success">
                         <span className="flex items-center gap-1">
                           <Sparkles className="w-4 h-4" />
                           {getDiscountLabel()}
                         </span>
                         <span>-₹{discount}</span>
                       </div>
                     )}
 
                     <Separator />
 
                     <div className="flex justify-between text-lg font-bold text-primary">
                       <span>Total</span>
                       <span>₹{total}</span>
                     </div>
                   </div>
 
                   {bookCount === 1 && (
                     <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                       <p className="text-sm text-accent-foreground">
                         💡 <strong>Tip:</strong> Add 1 more book to get both for just ₹99!
                       </p>
                     </div>
                   )}
 
                   {bookCount === 3 && (
                     <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                       <p className="text-sm text-accent-foreground">
                         💡 <strong>Tip:</strong> Add 1 more book to unlock the ₹249 bundle!
                       </p>
                     </div>
                   )}
 
                   <Button
                     onClick={handleProceedToPayment}
                     className="w-full mt-6 bg-gold-gradient text-primary hover:opacity-90 shadow-gold font-semibold"
                     size="lg"
                   >
                     Proceed to Payment
                   </Button>
 
                   <p className="text-xs text-center text-muted-foreground mt-4">
                     Secure payment • Instant access after purchase
                   </p>
                 </div>
               </div>
             </div>
 
             {/* Continue Shopping */}
             <div className="mt-8 text-center">
               <Button asChild variant="ghost">
                 <Link to="/shop">
                   <ArrowLeft className="mr-2 w-4 h-4" />
                   Continue Shopping
                 </Link>
               </Button>
             </div>
           </div>
         </div>
       </main>
 
       <Footer />
     </div>
   );
 }