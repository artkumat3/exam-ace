import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-purple-gradient rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">P</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-foreground">PROCBSE</span>
                <span className="text-[10px] text-muted-foreground -mt-1">THE 99 QUESTIONS</span>
              </div>
            </div>
            <p className="text-muted-foreground max-w-md">
              Helping students master CBSE board exams with carefully curated question banks 
              based on 10+ years of exam pattern analysis.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/my-books" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Books
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                  Login / Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ProCBSE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
