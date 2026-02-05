 import { Link } from 'react-router-dom';
 import { ArrowRight, CheckCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 export function CTASection() {
   return (
     <section className="py-24 bg-hero-gradient relative overflow-hidden">
       {/* Decorative elements */}
       <div className="absolute inset-0 overflow-hidden">
         <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
       </div>
 
       <div className="relative container mx-auto px-4 text-center">
         <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
           Don't Let Uncertainty Hold You Back
         </h2>
         <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
           Thousands of students have already secured their success with our proven question bank.
           <br />
           <strong className="text-primary-foreground">It's your turn to excel.</strong>
         </p>
 
         <Button 
           asChild 
           size="lg" 
           className="bg-gold-gradient text-primary hover:opacity-90 shadow-gold font-semibold text-lg px-10 py-6 animate-pulse-glow"
         >
           <Link to="/shop">
             <CheckCircle className="mr-2 w-5 h-5" />
             Instant Access
             <ArrowRight className="ml-2 w-5 h-5" />
           </Link>
         </Button>
       </div>
     </section>
   );
 }