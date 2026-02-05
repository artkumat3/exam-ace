 import { Link, useNavigate } from 'react-router-dom';
 import { ShoppingCart, User, LogOut, BookOpen, LayoutDashboard } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { useCart } from '@/contexts/CartContext';
 import { useAuth } from '@/contexts/AuthContext';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 
 export function Navbar() {
   const { items } = useCart();
   const { user, isAdmin, signOut } = useAuth();
   const navigate = useNavigate();
 
   const handleSignOut = async () => {
     await signOut();
     navigate('/');
   };
 
   return (
     <nav className="fixed top-0 left-0 right-0 z-50 glass">
       <div className="container mx-auto px-4 py-3">
         <div className="flex items-center justify-between">
           <Link to="/" className="flex items-center gap-2">
             <div className="w-10 h-10 bg-gold-gradient rounded-lg flex items-center justify-center">
               <BookOpen className="w-6 h-6 text-primary" />
             </div>
             <span className="font-display text-xl font-bold text-primary">ProCBSE</span>
           </Link>
 
           <div className="hidden md:flex items-center gap-6">
             <Link to="/" className="text-muted-foreground hover:text-primary transition-colors link-underline">
               Home
             </Link>
             <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors link-underline">
               Shop
             </Link>
             {user && (
               <Link to="/my-books" className="text-muted-foreground hover:text-primary transition-colors link-underline">
                 My Books
               </Link>
             )}
           </div>
 
           <div className="flex items-center gap-3">
             <Link to="/cart" className="relative">
               <Button variant="ghost" size="icon" className="relative">
                 <ShoppingCart className="w-5 h-5" />
                 {items.length > 0 && (
                   <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                     {items.length}
                   </span>
                 )}
               </Button>
             </Link>
 
             {user ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon">
                     <User className="w-5 h-5" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48">
                   <div className="px-2 py-1.5 text-sm font-medium truncate">
                     {user.email}
                   </div>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                     <Link to="/my-books" className="cursor-pointer">
                       <BookOpen className="w-4 h-4 mr-2" />
                       My Books
                     </Link>
                   </DropdownMenuItem>
                   {isAdmin && (
                     <DropdownMenuItem asChild>
                       <Link to="/admin" className="cursor-pointer">
                         <LayoutDashboard className="w-4 h-4 mr-2" />
                         Admin Panel
                       </Link>
                     </DropdownMenuItem>
                   )}
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                     <LogOut className="w-4 h-4 mr-2" />
                     Sign Out
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             ) : (
               <Button asChild variant="default" size="sm">
                 <Link to="/auth">Sign In</Link>
               </Button>
             )}
           </div>
         </div>
       </div>
     </nav>
   );
 }