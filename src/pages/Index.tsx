 import { Navbar } from '@/components/layout/Navbar';
 import { Footer } from '@/components/layout/Footer';
 import { HeroSection } from '@/components/home/HeroSection';
 import { FeaturesSection } from '@/components/home/FeaturesSection';
 import { BundleSection } from '@/components/home/BundleSection';
 import { BenefitsSection } from '@/components/home/BenefitsSection';
 import { CTASection } from '@/components/home/CTASection';
 
 export default function Index() {
   return (
     <div className="min-h-screen">
       <Navbar />
       <main>
         <HeroSection />
         <FeaturesSection />
         <BundleSection />
         <BenefitsSection />
         <CTASection />
       </main>
       <Footer />
     </div>
   );
 }
