import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Upload, Image, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'payment' | 'upload' | 'verifying'>('payment');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState('');

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

  // Generate unique transaction ID (stored but not shown to user)
  useEffect(() => {
    const generateTxnId = () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `PCBSE${timestamp}${random}`;
    };
    setTransactionId(generateTxnId());
  }, []);

  const upiWebLink = `https://www.upi.me/pay?pa=arbish@fam&am=${total}&tn=${transactionId}`;

  const handleOpenUPI = () => {
    window.open(upiWebLink, '_blank');
  };

  const handleProceedToUpload = async () => {
    if (!user) return;
    
    setIsSubmitting(true);

    try {
      // Create order in pending state
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          transaction_id: transactionId,
          total_amount: total,
          discount_applied: items.reduce((sum, i) => sum + i.price, 0) - total,
          status: 'pending_verification',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      setOrderId(order.id);

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        price: item.price,
      }));

      await supabase.from('order_items').insert(orderItems);

      setStep('upload');
      
      toast({
        title: 'Ready for verification',
        description: 'Please upload your payment screenshot.',
      });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image under 10MB.',
          variant: 'destructive',
        });
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyScreenshot = async () => {
    if (!screenshotFile || !orderId || !user) {
      toast({
        title: 'Please upload a screenshot',
        description: 'Upload your payment screenshot to verify.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setStep('verifying');
    setVerificationMessage('Uploading screenshot...');

    try {
      // Upload screenshot to storage
      const fileExt = screenshotFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${orderId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, screenshotFile, {
          contentType: screenshotFile.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload screenshot');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);

      const screenshotUrl = urlData.publicUrl;
      console.log('Screenshot uploaded:', screenshotUrl);

      // Update order with screenshot URL
      await supabase
        .from('orders')
        .update({ 
          screenshot_url: screenshotUrl,
          status: 'verifying' 
        })
        .eq('id', orderId);

      setVerificationMessage('Analyzing payment with AI...');

      // Call AI verification edge function
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
        body: { orderId, screenshotUrl }
      });

      console.log('Verification response:', verifyData);

      if (verifyError) {
        console.error('Verification error:', verifyError);
        throw new Error('Verification service unavailable');
      }

      if (verifyData?.verified) {
        // AI verified - books already granted by edge function
        clearCart();

        toast({
          title: 'Payment Verified! ✅',
          description: 'Your books are now available in My Books.',
        });

        navigate('/my-books');
      } else {
        // Pending manual verification - still give access but mark for review
        setVerificationMessage('');
        
        // Grant books anyway for now (admin can revoke if fraud)
        for (const item of items) {
          await supabase.from('user_books').upsert({
            user_id: user.id,
            product_id: item.id,
            order_id: orderId,
          }, {
            onConflict: 'user_id,product_id'
          });
        }
        
        clearCart();

        toast({
          title: 'Order Submitted',
          description: verifyData?.message || 'Your payment is being reviewed. Books have been added to your library.',
        });
        
        navigate('/my-books');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStep('upload');
      setVerificationMessage('');
      toast({
        title: 'Verification failed',
        description: 'Please try again or contact support if the issue persists.',
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
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to cart
            </Link>

            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
              Complete Payment
            </h1>

            <div className="space-y-6">
              {/* Step 1: Order Summary */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    1
                  </div>
                  <h2 className="font-semibold text-lg text-foreground">
                    Order Summary
                  </h2>
                </div>
                <div className="space-y-2 ml-11">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">₹{item.productType === 'addon' ? 19 : item.price}</span>
                    </div>
                  ))}
                  <Separator className="my-3" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-gradient">₹{total}</span>
                  </div>
                </div>
              </div>

              {step === 'payment' && (
                <>
                  {/* Step 2: Pay via UPI */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        2
                      </div>
                      <h2 className="font-semibold text-lg text-foreground">
                        Pay via UPI
                      </h2>
                    </div>

                    <div className="ml-11">
                      <div className="bg-primary/5 rounded-lg p-4 mb-4 border border-primary/10">
                        <p className="text-sm text-muted-foreground flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                          <span>
                            Click the button below to pay <strong className="text-foreground">₹{total}</strong> via UPI. After payment, take a <strong className="text-foreground">clear screenshot</strong> showing the success message and amount.
                          </span>
                        </p>
                      </div>

                      <Button
                        onClick={handleOpenUPI}
                        className="w-full bg-gold-gradient text-white hover:opacity-90 font-semibold shadow-gold"
                        size="lg"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Pay ₹{total} via UPI
                      </Button>
                    </div>
                  </div>

                  {/* Step 3: Upload Screenshot */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        3
                      </div>
                      <h2 className="font-semibold text-lg text-foreground">
                        Upload Payment Screenshot
                      </h2>
                    </div>

                    <div className="ml-11">
                      <Button
                        onClick={handleProceedToUpload}
                        disabled={isSubmitting}
                        className="w-full bg-purple-gradient text-white hover:opacity-90 shadow-primary-glow font-semibold"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            I've Paid - Upload Screenshot
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground mt-4">
                        Our AI will verify your payment automatically.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {step === 'upload' && (
                /* Screenshot Upload Step */
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-accent" />
                    </div>
                    <h2 className="font-semibold text-lg text-foreground">
                      Upload Payment Screenshot
                    </h2>
                  </div>

                  <p className="text-muted-foreground text-sm mb-6">
                    Upload a clear screenshot of your UPI payment showing:
                  </p>
                  
                  <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Payment success message
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Amount paid (₹{total})
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Transaction ID/UTR number
                    </li>
                  </ul>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {screenshotPreview ? (
                    <div className="mb-6">
                      <div className="relative rounded-lg overflow-hidden border border-border bg-secondary/30">
                        <img 
                          src={screenshotPreview} 
                          alt="Payment screenshot" 
                          className="w-full max-h-72 object-contain"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-3 right-3"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-6 border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <Image className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-foreground font-medium mb-1">
                        Click to upload screenshot
                      </p>
                      <p className="text-muted-foreground text-xs">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleVerifyScreenshot}
                    disabled={isSubmitting || !screenshotFile}
                    className="w-full bg-gold-gradient text-white hover:opacity-90 shadow-gold font-semibold"
                    size="lg"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify & Complete Purchase
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    AI will automatically verify your payment. If verification fails, admin will review manually.
                  </p>
                </div>
              )}

              {step === 'verifying' && (
                /* Verification in Progress */
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h2 className="font-semibold text-lg text-foreground mb-2">
                    Verifying Payment
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {verificationMessage || 'Please wait while we verify your payment...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
