 import { Check } from 'lucide-react';
 
 const subjects = [
   {
     emoji: '📐',
     name: 'Mathematics',
     questions: '33+ Questions',
     subtitle: 'All chapters from Algebra to Statistics',
     topics: [
       'Number Systems & Polynomials',
       'Linear Equations & Quadratic',
       'Progressions',
       'Triangles & Circles',
       'Trigonometry',
       'Statistics & Probability',
     ],
   },
   {
     emoji: '🔬',
     name: 'Science',
     questions: '33+ Questions',
     subtitle: 'Physics, Chemistry & Biology Combined',
     topics: [
       'Chemical Reactions & Equations',
       'Acids & Bases',
       'Metals & Non-metals',
       'Electricity & Magnetism',
       'Light & Optics',
       'Life Processes',
     ],
   },
   {
     emoji: '🌍',
     name: 'Social Science',
     questions: '33+ Questions',
     subtitle: 'History, Geography, Civics & Economics',
     topics: [
       'Ancient & Modern India',
       'World War Era',
       'Climate & Resources',
       'Indian Government',
       'Economic Development',
       'Sustainable Development',
     ],
   },
 ];
 
 export function BundleSection() {
   return (
     <section className="py-20 bg-background">
       <div className="container mx-auto px-4">
         <div className="text-center max-w-3xl mx-auto mb-16">
           <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
             What's Included in the Bundle
           </h2>
           <p className="text-lg text-muted-foreground">
             All 3 core subjects with the most repeated questions
           </p>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
           {subjects.map((subject, index) => (
             <div
               key={subject.name}
               className="book-card bg-card border border-border p-8 shadow-lg hover:shadow-xl animate-fade-in-up"
               style={{ animationDelay: `${index * 150}ms` }}
             >
               <div className="text-5xl mb-4">{subject.emoji}</div>
               <h3 className="font-display text-2xl font-bold text-primary mb-2">
                 {subject.name}
               </h3>
               <div className="price-tag mb-3">{subject.questions}</div>
               <p className="text-muted-foreground text-sm mb-6">{subject.subtitle}</p>
               
               <ul className="space-y-3">
                 {subject.topics.map((topic) => (
                   <li key={topic} className="flex items-start gap-3">
                     <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                     <span className="text-foreground">{topic}</span>
                   </li>
                 ))}
               </ul>
             </div>
           ))}
         </div>
       </div>
     </section>
   );
 }