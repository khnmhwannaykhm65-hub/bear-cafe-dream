import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const DISCORD_CLIENT_ID = Deno.env.get("DISCORD_CLIENT_ID")!;
  const DISCORD_CLIENT_SECRET = Deno.env.get("DISCORD_CLIENT_SECRET")!;
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { action, code, redirect_uri } = await req.json();

    // Return Discord OAuth URL
    if (action === "get_auth_url") {
      const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri,
        response_type: "code",
        scope: "identify email",
      });
      return new Response(
        JSON.stringify({ url: `https://discord.com/oauth2/authorize?${params}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange code for session
    if (action === "exchange_code") {
      // 1. Exchange code for Discord token
      const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri,
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error("Discord token exchange failed:", err);
        return new Response(
          JSON.stringify({ error: "Discord token exchange failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // 2. Get Discord user info
      const userRes = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userRes.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to get Discord user info" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const discordUser = await userRes.json();
      const discordId = discordUser.id;
      const discordUsername = discordUser.username;
      const discordAvatar = discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png?size=256`
        : null;
      const discordEmail = discordUser.email;

      // Use a deterministic email for this Discord user
      const userEmail = discordEmail || `discord_${discordId}@beancity.app`;
      // Deterministic password from discord_id + secret
      const encoder = new TextEncoder();
      const data = encoder.encode(`${discordId}:${DISCORD_CLIENT_SECRET}`);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const userPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      // 3. Try to find existing user by discord_id in profiles
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("discord_id", discordId)
        .maybeSingle();

      let userId: string;

      if (existingProfile) {
        // User exists — sign in
        userId = existingProfile.id;
        // Update password to ensure consistency
        await supabaseAdmin.auth.admin.updateUserById(userId, { password: userPassword });
      } else {
        // Check if user with this email exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(
          (u: any) => u.email === userEmail
        );

        if (existingUser) {
          userId = existingUser.id;
          await supabaseAdmin.auth.admin.updateUserById(userId, { password: userPassword });
        } else {
          // Create new user
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: userEmail,
            password: userPassword,
            email_confirm: true,
          });

          if (createError || !newUser.user) {
            return new Response(
              JSON.stringify({ error: createError?.message || "Failed to create user" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          userId = newUser.user.id;
        }
      }

      // 4. Update profile with Discord info
      await supabaseAdmin.from("profiles").update({
        discord_id: discordId,
        discord_username: discordUsername,
        avatar_url: discordAvatar,
        display_name: discordUsername,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);

      // 5. Sign in to get session tokens
      // Create a temporary Supabase client with anon key for sign-in
      const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });

      if (signInError || !signInData.session) {
        return new Response(
          JSON.stringify({ error: signInError?.message || "Failed to sign in" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          user: {
            id: userId,
            discord_id: discordId,
            discord_username: discordUsername,
            avatar_url: discordAvatar,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("discord-auth error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
