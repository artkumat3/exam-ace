 import { Link } from 'react-router-dom';
 import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';
 
 export function Footer() {
   return (
     <footer className="bg-primary text-primary-foreground py-12">
       <div className="container mx-auto px-4">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-2 mb-4">
               <div className="w-10 h-10 bg-gold-gradient rounded-lg flex items-center justify-center">
                 <BookOpen className="w-6 h-6 text-primary" />
               </div>
               <span className="font-display text-xl font-bold">ProCBSE</span>
             </div>
             <p className="text-primary-foreground/80 max-w-md">
               Helping students master CBSE board exams with carefully curated question banks 
               based on 10+ years of exam pattern analysis.
             </p>
           </div>
 
           <div>
             <h4 className="font-semibold mb-4">Quick Links</h4>
             <ul className="space-y-2">
               <li>
                 <Link to="/shop" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                   Shop
                 </Link>
               </li>
               <li>
                 <Link to="/my-books" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                   My Books
                 </Link>
               </li>
               <li>
                 <Link to="/auth" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                   Login / Register
                 </Link>
               </li>
             </ul>
           </div>
 
           <div>
             <h4 className="font-semibold mb-4">Contact</h4>
             <ul className="space-y-2 text-primary-foreground/80">
               <li className="flex items-center gap-2">
                 <Mail className="w-4 h-4" />
                 support@procbse.com
               </li>
               <li className="flex items-center gap-2">
                 <Phone className="w-4 h-4" />
                 +91 98765 43210
               </li>
               <li className="flex items-center gap-2">
                 <MapPin className="w-4 h-4" />
                 New Delhi, India
               </li>
             </ul>
           </div>
         </div>
 
         <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
           <p>&copy; {new Date().getFullYear()} ProCBSE. All rights reserved.</p>
         </div>
       </div>
     </footer>
   );
 }