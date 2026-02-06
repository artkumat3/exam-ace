import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-hero-gradient overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-purple w-96 h-96 top-20 -left-48 animate-float" />
        <div className="blob blob-orange w-72 h-72 top-40 right-20 animate-float animation-delay-200" />
        <div className="blob blob-purple w-80 h-80 bottom-20 right-10 animate-float animation-delay-300" />
        <div className="blob blob-orange w-64 h-64 bottom-40 left-20 animate-float animation-delay-100" />
      </div>

      <div className="relative container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground mb-8 animate-fade-in shadow-gold">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">The 99 Questions Challenge • CBSE Class 10</span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in-up">
            Crack Your Boards in{' '}
            <span className="text-gradient">30 Days</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-100">
            Your complete study system — discipline, resources, and motivation in one place. 
            Daily to-do lists, personalized timetables, and expert guidance until your exams.
          </p>

          {/* Price Card */}
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-lg mb-8 animate-fade-in-up animation-delay-200">
            <span className="text-2xl text-muted-foreground line-through">₹500</span>
            <span className="text-4xl md:text-5xl font-bold text-gradient">₹249</span>
            <span className="px-3 py-1 rounded-full bg-success text-success-foreground text-sm font-semibold">
              50% OFF
            </span>
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in-up animation-delay-300">
            <Button 
              asChild 
              size="lg" 
              className="bg-gold-gradient text-white hover:opacity-90 shadow-gold font-semibold text-lg px-10 py-7 rounded-full"
            >
              <Link to="/shop">
                Start Your Challenge
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20 max-w-4xl mx-auto">
          {[
            { value: '10+', label: 'Years', sublabel: 'Of Board Exam Analysis' },
            { value: '60+', label: 'Papers', sublabel: 'Thoroughly Analyzed' },
            { value: '99', label: 'Questions', sublabel: 'Most Likely to Appear' },
            { value: '3', label: 'Subjects', sublabel: 'Complete Bundle Coverage' },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center p-4 md:p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 animate-fade-in-up shadow-sm"
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <div className="stat-number mb-1">{stat.value}</div>
              <div className="text-foreground font-semibold text-sm md:text-base">{stat.label}</div>
              <div className="text-muted-foreground text-xs md:text-sm">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
