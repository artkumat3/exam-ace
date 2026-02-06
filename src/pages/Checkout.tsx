import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Copy, CheckCircle, AlertCircle, Send } from 'lucide-react';
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'payment' | 'otp'>('payment');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

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

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleProceedToVerification = async () => {
    if (!user) return;
    
    setIsSubmitting(true);

    try {
      // Generate OTP for verification
      const newOtp = generateOTP();
      setGeneratedOtp(newOtp);

      // Create order in pending state
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          transaction_id: transactionId,
          total_amount: total,
          discount_applied: items.reduce((sum, i) => sum + i.price, 0) - total,
          status: 'pending_otp',
        })
        .select()
        .single();

      if (orderError) {
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

      // Show OTP to user (in production, this would be sent via SMS/Email)
      toast({
        title: 'Verification Code',
        description: `Your OTP is: ${newOtp}`,
        duration: 10000,
      });

      setStep('otp');
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

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the complete 6-digit OTP',
        variant: 'destructive',
      });
      return;
    }

    if (otp !== generatedOtp) {
      toast({
        title: 'Incorrect OTP',
        description: 'The OTP you entered is incorrect. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update order status to verifying (admin will confirm)
      await supabase
        .from('orders')
        .update({ status: 'verifying' })
        .eq('id', orderId);

      // Add books to user's library immediately (can be reverted by admin if fraud)
      if (user && orderId) {
        for (const item of items) {
          await supabase.from('user_books').upsert({
            user_id: user.id,
            product_id: item.id,
            order_id: orderId,
          });
        }
      }

      clearCart();

      toast({
        title: 'Payment Verified!',
        description: 'Your books are now available in My Books.',
      });

      navigate('/my-books');
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = () => {
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    setOtp('');
    toast({
      title: 'New OTP Generated',
      description: `Your new OTP is: ${newOtp}`,
      duration: 10000,
    });
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
                <h2 className="font-semibold text-lg text-foreground mb-4">
                  1. Order Summary
                </h2>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span>₹{item.productType === 'addon' ? 19 : item.price}</span>
                    </div>
                  ))}
                  <Separator className="my-3" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-gradient">₹{total}</span>
                  </div>
                </div>
              </div>

              {step === 'payment' ? (
                <>
                  {/* Step 2: Pay via UPI */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="font-semibold text-lg text-foreground mb-4">
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
                      <code className="text-lg font-mono font-bold text-foreground">
                        {transactionId}
                      </code>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        asChild
                        className="flex-1 bg-gold-gradient text-white hover:opacity-90"
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
                          <strong>Important:</strong> Complete the UPI payment, then click the button below to verify with OTP.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Verify Payment */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="font-semibold text-lg text-foreground mb-4">
                      3. Verify Payment
                    </h2>

                    <Button
                      onClick={handleProceedToVerification}
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
                          <Send className="w-4 h-4 mr-2" />
                          I've Paid - Send OTP
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                      An OTP will be sent to verify your payment.
                    </p>
                  </div>
                </>
              ) : (
                /* OTP Verification Step */
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-semibold text-lg text-foreground mb-4">
                    Enter Verification OTP
                  </h2>

                  <p className="text-muted-foreground text-sm mb-6">
                    We've sent a 6-digit OTP. Enter it below to complete your purchase.
                  </p>

                  <div className="flex justify-center mb-6">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isSubmitting || otp.length !== 6}
                    className="w-full bg-gold-gradient text-white hover:opacity-90 shadow-gold font-semibold"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify & Complete Purchase
                      </>
                    )}
                  </Button>

                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOTP}
                      className="text-muted-foreground"
                    >
                      Didn't receive OTP? Resend
                    </Button>
                  </div>
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
