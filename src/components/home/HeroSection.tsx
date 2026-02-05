 import { Link } from 'react-router-dom';
 import { ArrowRight, Sparkles } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 export function HeroSection() {
   return (
     <section className="relative min-h-screen bg-hero-gradient overflow-hidden">
       {/* Decorative elements */}
       <div className="absolute inset-0 overflow-hidden">
         <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float" />
         <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float animation-delay-200" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent/10 to-transparent rounded-full" />
       </div>
 
       <div className="relative container mx-auto px-4 pt-32 pb-20">
         <div className="max-w-4xl mx-auto text-center">
           {/* Badge */}
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-primary-foreground mb-8 animate-fade-in">
             <Sparkles className="w-4 h-4" />
             <span className="text-sm font-medium">CBSE Board Exam Preparation</span>
           </div>
 
           {/* Main headline */}
           <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
             Master Class 10 with{' '}
             <span className="text-gradient-gold">99 Guaranteed</span>{' '}
             Questions
           </h1>
 
           {/* Subtitle */}
           <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-100">
             Analyzed from 60+ sample papers. Curated for 3 core subjects. 
             The most repeated questions from past 10 years of board exams.
           </p>
 
           {/* CTA Buttons */}
           <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
             <Button asChild size="lg" className="bg-gold-gradient text-primary hover:opacity-90 shadow-gold animate-pulse-glow font-semibold text-lg px-8 py-6">
               <Link to="/shop">
                 Get Your Copy Now - ₹249
                 <ArrowRight className="ml-2 w-5 h-5" />
               </Link>
             </Button>
             <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6">
               <a href="#features">Learn More</a>
             </Button>
           </div>
         </div>
 
         {/* Stats */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
           {[
             { value: '10+', label: 'Years', sublabel: 'Of Board Exam Analysis' },
             { value: '60+', label: 'Papers', sublabel: 'Thoroughly Analyzed' },
             { value: '99', label: 'Questions', sublabel: 'Most Likely to Appear' },
             { value: '3', label: 'Subjects', sublabel: 'Complete Bundle Coverage' },
           ].map((stat, index) => (
             <div 
               key={stat.label}
               className="text-center p-6 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 animate-fade-in-up"
               style={{ animationDelay: `${300 + index * 100}ms` }}
             >
               <div className="stat-number mb-1">{stat.value}</div>
               <div className="text-primary-foreground font-semibold">{stat.label}</div>
               <div className="text-primary-foreground/60 text-sm">{stat.sublabel}</div>
             </div>
           ))}
         </div>
       </div>
     </section>
   );
 }