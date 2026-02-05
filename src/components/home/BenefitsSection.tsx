 import { 
   FileText, 
   Key, 
   Smartphone, 
   Clock, 
   RefreshCw, 
   Shield 
 } from 'lucide-react';
 
 const benefits = [
   {
     icon: FileText,
     title: 'Complete E-Book',
     description: 'Well-formatted, easy-to-read PDF with all 99 questions organized chapter-wise.',
   },
   {
     icon: Key,
     title: 'Detailed Solutions',
     description: 'Step-by-step answers to every question with explanations to ensure complete understanding.',
   },
   {
     icon: Smartphone,
     title: 'Access Anywhere',
     description: 'Download and access on any device - phone, tablet, or computer whenever you need.',
   },
   {
     icon: Clock,
     title: 'Instant Delivery',
     description: "Get immediate access right after purchase. No waiting, no delays.",
   },
   {
     icon: RefreshCw,
     title: 'Free Updates',
     description: 'Receive any future updates and improvements to the resource at no additional cost.',
   },
   {
     icon: Shield,
     title: '100% Satisfaction',
     description: 'Not satisfied? Full money-back guarantee within 30 days, no questions asked.',
   },
 ];
 
 export function BenefitsSection() {
   return (
     <section className="py-20 bg-subtle-gradient">
       <div className="container mx-auto px-4">
         <div className="text-center max-w-3xl mx-auto mb-16">
           <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
             What You Get
           </h2>
         </div>
 
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
           {benefits.map((benefit, index) => (
             <div
               key={benefit.title}
               className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow animate-fade-in-up"
               style={{ animationDelay: `${index * 100}ms` }}
             >
               <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                 <benefit.icon className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h3 className="font-semibold text-primary mb-1">{benefit.title}</h3>
                 <p className="text-sm text-muted-foreground">{benefit.description}</p>
               </div>
             </div>
           ))}
         </div>
       </div>
     </section>
   );
 }