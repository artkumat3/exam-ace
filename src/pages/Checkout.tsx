 import { useState, useEffect } from 'react';
 import { useNavigate, Link } from 'react-router-dom';
 import { ArrowLeft, Upload, Loader2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Navbar } from '@/components/layout/Navbar';
 import { Footer } from '@/components/layout/Footer';
 import { useCart } from '@/contexts/CartContext';
 import { useAuth } from '@/contexts/AuthContext';
 import { useToast } from '@/hooks/use-toast';
 import { supabase } from '@/integrations/supabase/client';
 import { Separator } from '@/components/ui/separator';
 
 export default function Checkout() {
   const { items, getTotal, clearCart } = useCart();
   const { user } = useAuth();
   const navigate = useNavigate();
   const { toast } = useToast();
 
   const [transactionId, setTransactionId] = useState('');
   const [isUploading, setIsUploading] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
   const [copied, setCopied] = useState(false);
 
   const total = getTotal();
 
   useEffect(() => {
     if (!user) {
       navigate('/auth?redirect=/checkout');
       return;
     }
     if (items.length === 0) {
       navigate('/shop');
     }
   }, [user, items, navigate]);
 
   // Generate unique transaction ID
   useEffect(() => {
     const generateTxnId = () => {
       const timestamp = Date.now().toString(36).toUpperCase();
       const random = Math.random().toString(36).substring(2, 8).toUpperCase();
       return `PCBSE${timestamp}${random}`;
     };
     setTransactionId(generateTxnId());
   }, []);
 
   const upiLink = `upi://pay?pa=arbish@fam&am=${total}&tn=${transactionId}&cu=INR`;
   const upiWebLink = `https://www.upi.me/pay?pa=arbish@fam&am=${total}&tn=${transactionId}`;
 
   const handleCopyTxnId = () => {
     navigator.clipboard.writeText(transactionId);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
     toast({ title: 'Copied!', description: 'Transaction ID copied to clipboard' });
   };
 
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       if (file.size > 5 * 1024 * 1024) {
         toast({
           title: 'File too large',
           description: 'Please upload a screenshot smaller than 5MB',
           variant: 'destructive',
         });
         return;
       }
       setScreenshotFile(file);
     }
   };
 
   const handleSubmit = async () => {
     if (!screenshotFile) {
       toast({
         title: 'Screenshot required',
         description: 'Please upload your payment screenshot',
         variant: 'destructive',
       });
       return;
     }
 
     if (!user) return;
 
     setIsSubmitting(true);
 
     try {
       // Upload screenshot
       const fileExt = screenshotFile.name.split('.').pop();
       const fileName = `${user.id}/${transactionId}.${fileExt}`;
 
       const { error: uploadError } = await supabase.storage
         .from('payment-screenshots')
         .upload(fileName, screenshotFile);
 
       // Get public URL (or signed URL)
       const { data: urlData } = supabase.storage
         .from('payment-screenshots')
         .getPublicUrl(fileName);
 
       const screenshotUrl = urlData?.publicUrl || fileName;
 
       // Create order
       const { data: order, error: orderError } = await supabase
         .from('orders')
         .insert({
           user_id: user.id,
           transaction_id: transactionId,
           total_amount: total,
           discount_applied: items.reduce((sum, i) => sum + i.price, 0) - total,
           status: 'verifying',
           screenshot_url: screenshotUrl,
         })
         .select()
         .single();
 
       if (orderError) {
         throw orderError;
       }
 
       // Create order items
       const orderItems = items.map(item => ({
         order_id: order.id,
         product_id: item.id,
         price: item.price,
       }));
 
       const { error: itemsError } = await supabase
         .from('order_items')
         .insert(orderItems);
 
       if (itemsError) {
         console.error('Order items error:', itemsError);
         // Don't throw - order is created, items can be fixed
       }
 
       clearCart();
 
       toast({
         title: 'Order submitted!',
         description: 'Your payment is being verified. You\'ll get access to your books shortly.',
       });
 
       navigate('/my-books');
     } catch (error) {
       console.error('Checkout error:', error);
       toast({
         title: 'Something went wrong',
         description: 'Please try again or contact support.',
         variant: 'destructive',
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
   if (!user || items.length === 0) {
     return null;
   }
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
 
       <main className="pt-24 pb-20">
         <div className="container mx-auto px-4">
           <div className="max-w-2xl mx-auto">
             {/* Header */}
             <Link
               to="/cart"
               className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
             >
               <ArrowLeft className="w-4 h-4" />
               Back to cart
             </Link>
 
             <h1 className="font-display text-2xl md:text-3xl font-bold text-primary mb-8">
               Complete Payment
             </h1>
 
             <div className="space-y-6">
               {/* Step 1: Order Summary */}
               <div className="bg-card rounded-xl border border-border p-6">
                 <h2 className="font-semibold text-lg text-primary mb-4">
                   1. Order Summary
                 </h2>
                 <div className="space-y-2">
                   {items.map(item => (
                     <div key={item.id} className="flex justify-between text-sm">
                       <span className="text-muted-foreground">{item.name}</span>
                       <span>₹{item.price}</span>
                     </div>
                   ))}
                   <Separator className="my-3" />
                   <div className="flex justify-between font-bold text-lg">
                     <span>Total</span>
                     <span className="text-primary">₹{total}</span>
                   </div>
                 </div>
               </div>
 
               {/* Step 2: Pay via UPI */}
               <div className="bg-card rounded-xl border border-border p-6">
                 <h2 className="font-semibold text-lg text-primary mb-4">
                   2. Pay via UPI
                 </h2>
 
                 <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm text-muted-foreground">Transaction ID</span>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={handleCopyTxnId}
                       className="h-8"
                     >
                       {copied ? (
                         <CheckCircle className="w-4 h-4 text-success" />
                       ) : (
                         <Copy className="w-4 h-4" />
                       )}
                     </Button>
                   </div>
                   <code className="text-lg font-mono font-bold text-primary">
                     {transactionId}
                   </code>
                 </div>
 
                 <div className="flex flex-col sm:flex-row gap-3">
                   <Button
                     asChild
                     className="flex-1 bg-gold-gradient text-primary hover:opacity-90"
                   >
                     <a href={upiLink}>
                       Pay ₹{total} via UPI App
                     </a>
                   </Button>
                   <Button
                     asChild
                     variant="outline"
                     className="flex-1"
                   >
                     <a href={upiWebLink} target="_blank" rel="noopener noreferrer">
                       Open UPI Web
                     </a>
                   </Button>
                 </div>
 
                 <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                   <p className="text-sm text-muted-foreground flex items-start gap-2">
                     <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                     <span>
                       <strong>Important:</strong> The transaction ID above will appear in your UPI app. 
                       Make sure it matches in your payment screenshot.
                     </span>
                   </p>
                 </div>
               </div>
 
               {/* Step 3: Upload Screenshot */}
               <div className="bg-card rounded-xl border border-border p-6">
                 <h2 className="font-semibold text-lg text-primary mb-4">
                   3. Upload Payment Screenshot
                 </h2>
 
                 <div className="space-y-4">
                   <div>
                     <Label htmlFor="screenshot">Payment Screenshot</Label>
                     <div className="mt-2">
                       <label
                         htmlFor="screenshot"
                         className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                           screenshotFile
                             ? 'border-success bg-success/5'
                             : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                         }`}
                       >
                         {screenshotFile ? (
                           <div className="text-center">
                             <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
                             <p className="font-medium text-success">{screenshotFile.name}</p>
                             <p className="text-sm text-muted-foreground">Click to change</p>
                           </div>
                         ) : (
                           <div className="text-center">
                             <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                             <p className="font-medium">Click to upload</p>
                             <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                           </div>
                         )}
                         <Input
                           id="screenshot"
                           type="file"
                           accept="image/*"
                           className="hidden"
                           onChange={handleFileChange}
                         />
                       </label>
                     </div>
                   </div>
 
                   <Button
                     onClick={handleSubmit}
                     disabled={!screenshotFile || isSubmitting}
                     className="w-full bg-gold-gradient text-primary hover:opacity-90 shadow-gold font-semibold"
                     size="lg"
                   >
                     {isSubmitting ? (
                       <>
                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                         Submitting...
                       </>
                     ) : (
                       'Submit for Verification'
                     )}
                   </Button>
 
                   <p className="text-xs text-center text-muted-foreground">
                     Our AI will verify your payment automatically. 
                     You'll get access to your books within minutes.
                   </p>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </main>
 
       <Footer />
     </div>
   );
 }