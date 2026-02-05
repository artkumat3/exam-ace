 import { Plus, Check, ShoppingCart } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { useCart, CartItem } from '@/contexts/CartContext';
 import { cn } from '@/lib/utils';
 
 interface ProductCardProps {
   id: string;
   name: string;
   description?: string;
   price: number;
   productType: 'book' | 'addon';
   classLevel: string;
   subject?: string;
   coverImage?: string;
 }
 
 export function ProductCard({
   id,
   name,
   description,
   price,
   productType,
   classLevel,
   subject,
   coverImage,
 }: ProductCardProps) {
   const { addItem, removeItem, isInCart } = useCart();
   const inCart = isInCart(id);
 
   const handleToggleCart = () => {
     if (inCart) {
       removeItem(id);
     } else {
       const item: CartItem = {
         id,
         name,
         price,
         productType,
         classLevel,
         subject,
         coverImage,
       };
       addItem(item);
     }
   };
 
   const getSubjectEmoji = () => {
     if (subject?.toLowerCase().includes('math')) return '📐';
     if (subject?.toLowerCase().includes('science')) return '🔬';
     if (subject?.toLowerCase().includes('social')) return '🌍';
     if (subject?.toLowerCase().includes('english')) return '📖';
     if (subject?.toLowerCase().includes('hindi')) return '🇮🇳';
     return '📚';
   };
 
   return (
     <div className={cn(
       "group relative bg-card rounded-2xl border shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
       inCart ? "border-accent ring-2 ring-accent/20" : "border-border"
     )}>
       {/* Cover Image / Placeholder */}
       <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
         {coverImage ? (
           <img src={coverImage} alt={name} className="w-full h-full object-cover" />
         ) : (
           <span className="text-6xl">{getSubjectEmoji()}</span>
         )}
         
         {/* Product type badge */}
         <div className={cn(
           "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold",
           productType === 'book' 
             ? "bg-primary text-primary-foreground" 
             : "bg-accent text-accent-foreground"
         )}>
           {productType === 'book' ? '99 Questions' : 'Add-on'}
         </div>
 
         {/* Class level badge */}
         <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/90 text-xs font-medium">
           Class {classLevel === 'both' ? '10 & 12' : classLevel}
         </div>
 
         {/* In cart indicator */}
         {inCart && (
           <div className="absolute bottom-3 right-3 w-8 h-8 bg-success rounded-full flex items-center justify-center">
             <Check className="w-5 h-5 text-success-foreground" />
           </div>
         )}
       </div>
 
       {/* Content */}
       <div className="p-5">
         <h3 className="font-display text-lg font-bold text-primary mb-2 line-clamp-2">
           {name}
         </h3>
         {description && (
           <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
             {description}
           </p>
         )}
 
         <div className="flex items-center justify-between">
           <div className="price-tag">₹{price}</div>
           <Button
             onClick={handleToggleCart}
             variant={inCart ? "secondary" : "default"}
             size="sm"
             className={cn(
               "transition-all",
               inCart && "bg-success hover:bg-success/90 text-success-foreground"
             )}
           >
             {inCart ? (
               <>
                 <Check className="w-4 h-4 mr-1" />
                 Added
               </>
             ) : (
               <>
                 <Plus className="w-4 h-4 mr-1" />
                 Add to Cart
               </>
             )}
           </Button>
         </div>
       </div>
     </div>
   );
 }