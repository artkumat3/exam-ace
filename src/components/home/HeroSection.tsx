import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 animate-fade-in backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">🎯 CBSE Board Exam Preparation</span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 animate-fade-in-up leading-tight">
            Master Class 10 with{' '}
            <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              99 Guaranteed Questions
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in-up animation-delay-100 leading-relaxed">
            Analyzed from <strong>60+ sample papers</strong>. Curated for <strong>3 core subjects</strong>. 
            The most repeated questions from past <strong>10 years</strong> of board exams.
          </p>

          {/* Price Card */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-5 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-xl mb-10 animate-fade-in-up animation-delay-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl text-muted-foreground line-through">₹500</span>
              <span className="text-4xl md:text-5xl font-bold text-gradient">₹249</span>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-success/10 text-success border border-success/20 text-sm font-semibold">
              50% OFF
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300 mb-16">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg shadow-primary/25 font-semibold text-lg px-10 py-7 rounded-full transition-all hover:scale-105"
            >
              <Link to="/shop">
                Get Your Copy Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="font-semibold text-lg px-8 py-7 rounded-full border-border/50 hover:bg-primary/5"
            >
              <a href="#features">
                Learn More
              </a>
            </Button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-16 animate-fade-in-up animation-delay-300">
            {[
              { icon: BookOpen, text: '3 Core Subjects' },
              { icon: Target, text: 'High-Probability Questions' },
              { icon: Trophy, text: 'Instant Access' },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/30 text-sm text-muted-foreground">
                <feature.icon className="w-4 h-4 text-primary" />
                {feature.text}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {[
            { value: '10+', label: 'Years', sublabel: 'Of Board Exam Analysis' },
            { value: '60+', label: 'Papers', sublabel: 'Thoroughly Analyzed' },
            { value: '99', label: 'Questions', sublabel: 'Most Likely to Appear' },
            { value: '3', label: 'Subjects', sublabel: 'Complete Bundle Coverage' },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center p-5 md:p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-border/50 animate-fade-in-up hover:border-primary/30 transition-colors"
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
              <div className="text-foreground font-semibold text-sm md:text-base">{stat.label}</div>
              <div className="text-muted-foreground text-xs md:text-sm">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
