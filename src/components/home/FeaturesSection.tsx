 import { 
   BarChart3, 
   Target, 
   BookOpen, 
   Lightbulb, 
   Zap, 
   CheckCircle2 
 } from 'lucide-react';
 
 const features = [
   {
     icon: BarChart3,
     title: 'Data-Driven Approach',
     description: 'Every question selected based on 10 years of CBSE board exam patterns and frequency analysis.',
   },
   {
     icon: Target,
     title: 'High-Probability Questions',
     description: 'Focus only on questions with the highest likelihood of appearing in your final exam.',
   },
   {
     icon: BookOpen,
     title: 'Complete Chapter Coverage',
     description: 'All chapters from NCERT curriculum covered with most important questions.',
   },
   {
     icon: Lightbulb,
     title: 'Smart Learning Path',
     description: 'Questions organized by chapter and difficulty level for progressive learning.',
   },
   {
     icon: Zap,
     title: 'Time-Saving',
     description: 'Eliminate wasting time on low-probability questions and irrelevant topics.',
   },
   {
     icon: CheckCircle2,
     title: 'Quality Guaranteed',
     description: 'Verified answers and detailed solutions for every question in the bundle.',
   },
 ];
 
 export function FeaturesSection() {
   return (
     <section id="features" className="py-20 bg-subtle-gradient">
       <div className="container mx-auto px-4">
         <div className="text-center max-w-3xl mx-auto mb-16">
           <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
             Why Choose This Bundle?
           </h2>
           <p className="text-lg text-muted-foreground">
             We've done the heavy lifting so you can focus on understanding, not searching
           </p>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
           {features.map((feature, index) => (
             <div
               key={feature.title}
               className="feature-card bg-card rounded-2xl p-8 shadow-md border border-border animate-fade-in-up"
               style={{ animationDelay: `${index * 100}ms` }}
             >
               <div className="w-14 h-14 bg-gold-gradient rounded-xl flex items-center justify-center mb-6 shadow-gold">
                 <feature.icon className="w-7 h-7 text-primary" />
               </div>
               <h3 className="font-display text-xl font-bold text-primary mb-3">
                 {feature.title}
               </h3>
               <p className="text-muted-foreground leading-relaxed">
                 {feature.description}
               </p>
             </div>
           ))}
         </div>
       </div>
     </section>
   );
 }