
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.5.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Define product info
const productConfig = {
  growth: {
    name: "Growth Plan",
    description: "Up to 500 subscribers with basic recovery and churn prediction",
    features: ["Up to 500 subscribers", "Basic recovery", "Churn prediction", "Email notifications", "Standard support"],
    price: 4900, // £49 in pence
  },
  scale: {
    name: "Scale Plan",
    description: "Up to 2,000 subscribers with advanced recovery and AI churn prevention",
    features: ["Up to 2,000 subscribers", "Advanced recovery", "AI churn prevention", "Win-back campaigns", "Priority support"],
    price: 9900, // £99 in pence
  },
  pro: {
    name: "Pro Plan",
    description: "Unlimited subscribers with enterprise features and dedicated support",
    features: ["Unlimited subscribers", "Enterprise features", "Custom retention workflows", "Dedicated account manager", "24/7 premium support"],
    price: 19900, // £199 in pence
  }
};

// Function to ensure products and prices exist
async function ensureProductsAndPrices() {
  console.log("Ensuring products and prices exist...");
  
  try {
    // For each product config
    for (const [planId, config] of Object.entries(productConfig)) {
      // Define the lookup key for the price
      const lookupKey = `price_${planId}`;
      
      // Check if price already exists
      console.log(`Checking if price with lookup key ${lookupKey} exists...`);
      const existingPrices = await stripe.prices.list({
        lookup_keys: [lookupKey],
        limit: 1,
        active: true,
      });
      
      if (existingPrices.data.length > 0) {
        console.log(`Price with lookup key ${lookupKey} already exists, skipping creation`);
        continue;
      }
      
      // Create product
      console.log(`Creating product for ${planId} plan...`);
      const product = await stripe.products.create({
        name: config.name,
        description: config.description,
        metadata: {
          features: JSON.stringify(config.features),
          plan_id: planId,
        },
      });
      
      // Create price
      console.log(`Creating price for ${planId} plan with lookup key ${lookupKey}...`);
      await stripe.prices.create({
        product: product.id,
        unit_amount: config.price,
        currency: 'gbp',
        recurring: {
          interval: 'month',
        },
        lookup_key: lookupKey,
        metadata: {
          plan_id: planId,
        },
      });
      
      console.log(`Successfully created product and price for ${planId} plan`);
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring products and prices:", error);
    throw error; // Re-throw to handle it in the main function
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting checkout session creation process");
    
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get user information from the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error("User auth error:", userError);
      throw new Error("Invalid user token");
    }

    console.log("User authenticated:", user.id);

    // Get the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw new Error("Invalid request body");
    }

    const { priceId, successUrl, cancelUrl } = requestBody;
    
    console.log(`Received checkout request for priceId: ${priceId}`);

    // Make sure we have a valid priceId format
    if (!priceId) {
      throw new Error("Missing priceId parameter");
    }

    // Ensure all products and prices exist in Stripe
    try {
      await ensureProductsAndPrices();
      console.log("Products and prices verified/created successfully");
    } catch (error) {
      console.error("Failed to ensure products and prices:", error);
      throw new Error(`Failed to create required products and prices: ${error.message}`);
    }
    
    // Extract the plan name from the priceId (e.g., "price_growth" -> "growth")
    const planName = priceId.replace('price_', '');
    
    // Verify the plan exists in our config
    if (!productConfig[planName]) {
      throw new Error(`Unknown plan: ${planName}`);
    }

    // Look up the price in Stripe using the lookup_key
    console.log(`Looking up price with lookup key: ${priceId}`);
    const prices = await stripe.prices.list({
      lookup_keys: [priceId],
      active: true,
      limit: 1,
    });

    if (prices.data.length === 0) {
      throw new Error(`Price not found for lookup key: ${priceId} even after creation attempt`);
    }

    const price = prices.data[0];
    console.log(`Found price: ${price.id} for lookup key: ${priceId}`);

    // Get user metadata to include their business name in Stripe
    const { data: userMetadata, error: metadataError } = await supabaseClient
      .from("user_metadata")
      .select("*")
      .eq("id", user.id)
      .single();

    if (metadataError) {
      console.error("Error fetching user metadata:", metadataError);
    }

    const businessName = userMetadata?.business_name || "Customer";

    // Look for existing customer
    let customerId;
    const customerSearch = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customerSearch.data.length > 0) {
      customerId = customerSearch.data[0].id;
      console.log(`Found existing customer: ${customerId}`);
    } else {
      // Create a new customer if one doesn't exist
      const newCustomer = await stripe.customers.create({
        email: user.email,
        name: businessName,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = newCustomer.id;
      console.log(`Created new customer: ${customerId}`);
    }

    // Create a Stripe checkout session with a trial period
    console.log("Creating checkout session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7, // Add a 7-day free trial
      },
      success_url: successUrl || `${req.headers.get("origin")}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/checkout?cancelled=true`,
      customer: customerId,
      client_reference_id: user.id,
      currency: 'gbp', // Set currency to GBP
      metadata: {
        user_id: user.id,
        business_name: businessName
      },
    });

    console.log(`Checkout session created successfully: ${session.id}`);
    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in create-checkout function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred",
        statusCode: 500
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
