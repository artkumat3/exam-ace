 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { orderId, screenshotUrl } = await req.json();
     
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseKey);
 
     // Get order details
     const { data: order, error: orderError } = await supabase
       .from("orders")
       .select("*")
       .eq("id", orderId)
       .single();
 
     if (orderError || !order) {
       throw new Error("Order not found");
     }
 
     // Call AI to verify the screenshot
     const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-2.5-flash",
         messages: [
           {
             role: "system",
             content: `You are a payment verification assistant. Analyze UPI payment screenshots and extract transaction details. Return JSON with: transactionId, amount, status (success/failed/unclear).`
           },
           {
             role: "user",
             content: `Verify this payment screenshot. Expected: Transaction ID "${order.transaction_id}", Amount ₹${order.total_amount}. Screenshot URL: ${screenshotUrl}`
           }
         ],
       }),
     });
 
     if (!aiResponse.ok) {
       console.error("AI verification failed:", await aiResponse.text());
       return new Response(JSON.stringify({ verified: false, reason: "AI verification unavailable" }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const aiResult = await aiResponse.json();
     const content = aiResult.choices?.[0]?.message?.content || "";
     
     // Simple verification logic
     const isVerified = content.toLowerCase().includes("success") && 
                        content.includes(order.transaction_id);
 
     if (isVerified) {
       // Update order status and grant books
       await supabase.from("orders").update({ status: "completed" }).eq("id", orderId);
       
       const { data: orderItems } = await supabase
         .from("order_items")
         .select("product_id")
         .eq("order_id", orderId);
 
       if (orderItems) {
         for (const item of orderItems) {
           await supabase.from("user_books").upsert({
             user_id: order.user_id,
             product_id: item.product_id,
             order_id: orderId,
           });
         }
       }
     }
 
     return new Response(JSON.stringify({ verified: isVerified, aiResponse: content }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (error) {
     console.error("Verification error:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(JSON.stringify({ error: errorMessage }), {
       status: 500,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   }
 });