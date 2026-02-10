import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, screenshotUrl } = await req.json();
    
    console.log("Verifying payment for order:", orderId);
    console.log("Screenshot URL:", screenshotUrl);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ verified: false, reason: "API key not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      console.error("Order not found:", orderError);
      return new Response(JSON.stringify({ verified: false, reason: "Order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Order details:", {
      id: order.id,
      transaction_id: order.transaction_id,
      total_amount: order.total_amount
    });

    // Call AI to verify the screenshot with vision capability
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
            content: `You are a payment verification assistant for UPI payments in India. 
Analyze payment screenshots and verify if the payment was successful.

You must check:
1. Payment status (should show "Success", "Completed", "Payment Successful", or similar)
2. Transaction amount (should match the expected amount)
3. Transaction ID/UTR number (should be present)

Respond with a JSON object ONLY (no markdown, no code blocks):
{
  "verified": true/false,
  "status": "success" | "failed" | "unclear",
  "extracted_amount": number or null,
  "extracted_transaction_id": string or null,
  "reason": "explanation of your verification decision"
}

Be lenient with transaction ID matching - just verify a valid transaction ID exists.
The amount should match within ₹1 tolerance.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Verify this UPI payment screenshot. Expected payment amount: ₹${order.total_amount}. Check if the payment was successful.`
              },
              {
                type: "image_url",
                image_url: {
                  url: screenshotUrl
                }
              }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI verification failed:", errorText);
      return new Response(JSON.stringify({ 
        verified: false, 
        reason: "AI verification service unavailable. Manual verification required." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "";
    
    console.log("AI Response:", content);

    // Parse AI response
    let verificationResult;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      verificationResult = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: check for success indicators in the text
      const isLikelySuccess = content.toLowerCase().includes("success") && 
                              !content.toLowerCase().includes("not successful") &&
                              !content.toLowerCase().includes("failed");
      verificationResult = {
        verified: isLikelySuccess,
        status: isLikelySuccess ? "success" : "unclear",
        reason: "AI response parsing failed, using keyword analysis"
      };
    }

    const isVerified = verificationResult.verified === true && 
                       verificationResult.status === "success";

    console.log("Verification result:", { isVerified, verificationResult });

    if (isVerified) {
      // Update order status to completed
      await supabase.from("orders").update({ status: "completed" }).eq("id", orderId);
      
      // Get order items and grant books to user
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
          }, {
            onConflict: 'user_id,product_id'
          });
        }
        console.log("Books granted to user:", order.user_id);
      }
    }

    return new Response(JSON.stringify({ 
      verified: isVerified, 
      details: verificationResult,
      message: isVerified ? "Payment verified successfully!" : verificationResult.reason || "Verification pending manual review"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ 
      verified: false, 
      reason: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
