 import { useState, useEffect } from 'react';
 import { useNavigate, useSearchParams, Link } from 'react-router-dom';
 import { BookOpen, Mail, Lock, User, Phone, Loader2, ArrowLeft } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useAuth } from '@/contexts/AuthContext';
 import { useToast } from '@/hooks/use-toast';
 import { z } from 'zod';
 
 const signUpSchema = z.object({
   fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
   email: z.string().email('Please enter a valid email'),
   phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number').optional().or(z.literal('')),
   password: z.string().min(6, 'Password must be at least 6 characters'),
 });
 
 const signInSchema = z.object({
   email: z.string().email('Please enter a valid email'),
   password: z.string().min(1, 'Password is required'),
 });
 
 export default function Auth() {
   const [isSignUp, setIsSignUp] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [formData, setFormData] = useState({
     fullName: '',
     email: '',
     phone: '',
     password: '',
   });
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   const { user, signUp, signIn } = useAuth();
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const { toast } = useToast();
 
   const redirect = searchParams.get('redirect') || '/';
 
   useEffect(() => {
     if (user) {
       navigate(redirect);
     }
   }, [user, navigate, redirect]);
 
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target;
     setFormData(prev => ({ ...prev, [name]: value }));
     setErrors(prev => ({ ...prev, [name]: '' }));
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
     setErrors({});
 
     try {
       if (isSignUp) {
         const result = signUpSchema.safeParse(formData);
         if (!result.success) {
           const fieldErrors: Record<string, string> = {};
           result.error.errors.forEach(err => {
             if (err.path[0]) {
               fieldErrors[err.path[0] as string] = err.message;
             }
           });
           setErrors(fieldErrors);
           setIsLoading(false);
           return;
         }
 
         const { error } = await signUp(
           formData.email,
           formData.password,
           formData.fullName,
           formData.phone || undefined
         );
 
         if (error) {
           if (error.message.includes('already registered')) {
             toast({
               title: 'Account already exists',
               description: 'Please sign in instead or use a different email.',
               variant: 'destructive',
             });
           } else {
             toast({
               title: 'Sign up failed',
               description: error.message,
               variant: 'destructive',
             });
           }
         } else {
           toast({
             title: 'Check your email',
             description: 'We sent you a confirmation link. Please verify your email to continue.',
           });
         }
       } else {
         const result = signInSchema.safeParse(formData);
         if (!result.success) {
           const fieldErrors: Record<string, string> = {};
           result.error.errors.forEach(err => {
             if (err.path[0]) {
               fieldErrors[err.path[0] as string] = err.message;
             }
           });
           setErrors(fieldErrors);
           setIsLoading(false);
           return;
         }
 
         const { error } = await signIn(formData.email, formData.password);
 
         if (error) {
           if (error.message.includes('Invalid login')) {
             toast({
               title: 'Invalid credentials',
               description: 'Please check your email and password.',
               variant: 'destructive',
             });
           } else if (error.message.includes('Email not confirmed')) {
             toast({
               title: 'Email not verified',
               description: 'Please check your inbox and verify your email first.',
               variant: 'destructive',
             });
           } else {
             toast({
               title: 'Sign in failed',
               description: error.message,
               variant: 'destructive',
             });
           }
         }
       }
     } catch (err) {
       toast({
         title: 'Something went wrong',
         description: 'Please try again later.',
         variant: 'destructive',
       });
     } finally {
       setIsLoading(false);
     }
   };
 
   return (
     <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
       <div className="w-full max-w-md">
         {/* Back to home */}
         <Link
           to="/"
           className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-8 transition-colors"
         >
           <ArrowLeft className="w-4 h-4" />
           Back to home
         </Link>
 
         {/* Card */}
         <div className="bg-card rounded-2xl shadow-xl p-8 animate-scale-in">
           {/* Logo */}
           <div className="flex items-center justify-center gap-2 mb-8">
             <div className="w-12 h-12 bg-gold-gradient rounded-xl flex items-center justify-center shadow-gold">
               <BookOpen className="w-7 h-7 text-primary" />
             </div>
             <span className="font-display text-2xl font-bold text-primary">ProCBSE</span>
           </div>
 
           {/* Title */}
           <h1 className="font-display text-2xl font-bold text-center text-primary mb-2">
             {isSignUp ? 'Create Account' : 'Welcome Back'}
           </h1>
           <p className="text-center text-muted-foreground mb-8">
             {isSignUp
               ? 'Start your board exam preparation journey'
               : 'Sign in to access your books'}
           </p>
 
           {/* Form */}
           <form onSubmit={handleSubmit} className="space-y-4">
             {isSignUp && (
               <div className="space-y-2">
                 <Label htmlFor="fullName">Full Name</Label>
                 <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                     id="fullName"
                     name="fullName"
                     placeholder="Your full name"
                     value={formData.fullName}
                     onChange={handleInputChange}
                     className="pl-10"
                   />
                 </div>
                 {errors.fullName && (
                   <p className="text-sm text-destructive">{errors.fullName}</p>
                 )}
               </div>
             )}
 
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <Input
                   id="email"
                   name="email"
                   type="email"
                   placeholder="your@email.com"
                   value={formData.email}
                   onChange={handleInputChange}
                   className="pl-10"
                 />
               </div>
               {errors.email && (
                 <p className="text-sm text-destructive">{errors.email}</p>
               )}
             </div>
 
             {isSignUp && (
               <div className="space-y-2">
                 <Label htmlFor="phone">Phone Number (Optional)</Label>
                 <div className="relative">
                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                     id="phone"
                     name="phone"
                     type="tel"
                     placeholder="10-digit mobile number"
                     value={formData.phone}
                     onChange={handleInputChange}
                     className="pl-10"
                   />
                 </div>
                 {errors.phone && (
                   <p className="text-sm text-destructive">{errors.phone}</p>
                 )}
               </div>
             )}
 
             <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <Input
                   id="password"
                   name="password"
                   type="password"
                   placeholder={isSignUp ? 'Min. 6 characters' : 'Your password'}
                   value={formData.password}
                   onChange={handleInputChange}
                   className="pl-10"
                 />
               </div>
               {errors.password && (
                 <p className="text-sm text-destructive">{errors.password}</p>
               )}
             </div>
 
             <Button
               type="submit"
               className="w-full bg-gold-gradient text-primary hover:opacity-90 shadow-gold font-semibold"
               size="lg"
               disabled={isLoading}
             >
               {isLoading ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
               ) : isSignUp ? (
                 'Create Account'
               ) : (
                 'Sign In'
               )}
             </Button>
           </form>
 
           {/* Toggle */}
           <div className="mt-6 text-center">
             <p className="text-muted-foreground">
               {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
               <button
                 type="button"
                 onClick={() => {
                   setIsSignUp(!isSignUp);
                   setErrors({});
                 }}
                 className="text-primary font-semibold hover:underline"
               >
                 {isSignUp ? 'Sign In' : 'Sign Up'}
               </button>
             </p>
           </div>
         </div>
       </div>
     </div>
   );
 }