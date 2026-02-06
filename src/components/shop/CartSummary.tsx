import { Link } from 'react-router-dom';
import { ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

export function CartSummary() {
  const { items, getBookCount, getSubtotal, getDiscount, getTotal } = useCart();
  const bookCount = getBookCount();
  const discount = getDiscount();
  const total = getTotal();

  if (items.length === 0) return null;

  const getDiscountMessage = () => {
    if (bookCount >= 4) {
      return "🎉 Bundle of 4+ books: Only ₹249!";
    } else if (bookCount >= 2) {
      return "✨ Bundle of 2+ books: Only ₹99!";
    } else if (bookCount === 1) {
      return "💡 Add 1 more book to get both for ₹99!";
    }
    return null;
  };

  const discountMessage = getDiscountMessage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-lg animate-fade-in">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-gradient rounded-xl flex items-center justify-center shadow-primary-glow">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {items.length} item{items.length > 1 ? 's' : ''} in cart
              </div>
              {discountMessage && (
                <div className="text-sm text-accent font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {discountMessage}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              {discount > 0 && (
                <div className="text-sm text-muted-foreground line-through">
                  ₹{getSubtotal()}
                </div>
              )}
              <div className="text-2xl font-bold text-gradient">
                ₹{total}
              </div>
              {discount > 0 && (
                <div className="text-xs text-success font-medium">
                  You save ₹{discount}!
                </div>
              )}
            </div>
            <Button asChild size="lg" className="bg-gold-gradient text-white hover:opacity-90 shadow-gold font-semibold">
              <Link to="/cart">
                View Cart
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
