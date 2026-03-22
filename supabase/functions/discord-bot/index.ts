import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bot-secret',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify bot secret
    const botSecret = req.headers.get('x-bot-secret')
    const expectedSecret = Deno.env.get('DISCORD_BOT_SECRET')
    if (!expectedSecret || botSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { action, ...payload } = await req.json()

    switch (action) {
      // Get player by discord_id
      case 'get_player': {
        const { discord_id } = payload
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('discord_id', discord_id)
          .single()
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404, headers: corsHeaders })
        return new Response(JSON.stringify({ player: data }), { headers: corsHeaders })
      }

      // Update coins
      case 'update_coins': {
        const { discord_id, amount, reason } = payload
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, coins')
          .eq('discord_id', discord_id)
          .single()
        if (!profile) return new Response(JSON.stringify({ error: 'Player not found' }), { status: 404, headers: corsHeaders })

        const newCoins = Math.max(0, profile.coins + amount)
        const { error } = await supabase
          .from('profiles')
          .update({ coins: newCoins, updated_at: new Date().toISOString() })
          .eq('id', profile.id)
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
        return new Response(JSON.stringify({ success: true, coins: newCoins, reason }), { headers: corsHeaders })
      }

      // Add EXP
      case 'add_exp': {
        const { discord_id, amount } = payload
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, exp, level')
          .eq('discord_id', discord_id)
          .single()
        if (!profile) return new Response(JSON.stringify({ error: 'Player not found' }), { status: 404, headers: corsHeaders })

        let newExp = profile.exp + amount
        let newLevel = profile.level
        // Simple level-up check
        const expForLevel = (lv: number) => Math.floor(100 * Math.pow(1.5, lv - 1))
        while (newExp >= expForLevel(newLevel)) {
          newExp -= expForLevel(newLevel)
          newLevel++
        }

        const { error } = await supabase
          .from('profiles')
          .update({ exp: newExp, level: newLevel, updated_at: new Date().toISOString() })
          .eq('id', profile.id)
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
        return new Response(JSON.stringify({ success: true, exp: newExp, level: newLevel }), { headers: corsHeaders })
      }

      // Send reward (coins + exp + optional inventory item)
      case 'send_reward': {
        const { discord_id, coins = 0, exp = 0, item } = payload
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, coins, exp, level')
          .eq('discord_id', discord_id)
          .single()
        if (!profile) return new Response(JSON.stringify({ error: 'Player not found' }), { status: 404, headers: corsHeaders })

        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (coins) updates.coins = profile.coins + coins
        if (exp) {
          let newExp = profile.exp + exp
          let newLevel = profile.level
          const expForLevel = (lv: number) => Math.floor(100 * Math.pow(1.5, lv - 1))
          while (newExp >= expForLevel(newLevel)) {
            newExp -= expForLevel(newLevel)
            newLevel++
          }
          updates.exp = newExp
          updates.level = newLevel
        }

        await supabase.from('profiles').update(updates).eq('id', profile.id)

        if (item) {
          await supabase.from('inventory').insert({
            user_id: profile.id,
            item_name: item.name,
            item_icon: item.icon || '📦',
            item_type: item.type || 'material',
            rarity: item.rarity || 'common',
            quantity: item.quantity || 1,
          })
        }

        return new Response(JSON.stringify({ success: true, message: 'Reward sent' }), { headers: corsHeaders })
      }

      // Redeem code
      case 'redeem_code': {
        const { discord_id, code } = payload
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('discord_id', discord_id)
          .single()
        if (!profile) return new Response(JSON.stringify({ error: 'Player not found' }), { status: 404, headers: corsHeaders })

        const { data: codeData } = await supabase
          .from('redeem_codes')
          .select('*')
          .eq('code', code)
          .eq('is_active', true)
          .single()
        if (!codeData) return new Response(JSON.stringify({ error: 'Invalid or expired code' }), { status: 400, headers: corsHeaders })

        if (codeData.used_count >= codeData.max_uses) {
          return new Response(JSON.stringify({ error: 'Code fully redeemed' }), { status: 400, headers: corsHeaders })
        }
        if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
          return new Response(JSON.stringify({ error: 'Code expired' }), { status: 400, headers: corsHeaders })
        }

        // Check if already redeemed
        const { data: existing } = await supabase
          .from('code_redemptions')
          .select('id')
          .eq('user_id', profile.id)
          .eq('code_id', codeData.id)
          .single()
        if (existing) return new Response(JSON.stringify({ error: 'Already redeemed' }), { status: 400, headers: corsHeaders })

        // Apply reward
        if (codeData.reward_type === 'coins') {
          await supabase.rpc('increment_coins', { p_user_id: profile.id, p_amount: codeData.reward_amount })
            .then(() => {}, async () => {
              // Fallback if RPC doesn't exist
              const { data: p } = await supabase.from('profiles').select('coins').eq('id', profile.id).single()
              if (p) await supabase.from('profiles').update({ coins: p.coins + codeData.reward_amount }).eq('id', profile.id)
            })
        }

        // Record redemption
        await supabase.from('code_redemptions').insert({ user_id: profile.id, code_id: codeData.id })
        await supabase.from('redeem_codes').update({ used_count: codeData.used_count + 1 }).eq('id', codeData.id)

        return new Response(JSON.stringify({
          success: true,
          reward_type: codeData.reward_type,
          reward_amount: codeData.reward_amount,
          description: codeData.reward_description
        }), { headers: corsHeaders })
      }

      // Get leaderboard
      case 'get_leaderboard': {
        const { limit = 10 } = payload
        const { data } = await supabase
          .from('profiles')
          .select('display_name, city_name, coins, level')
          .order('coins', { ascending: false })
          .limit(limit)
        return new Response(JSON.stringify({ leaderboard: data }), { headers: corsHeaders })
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders })
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
