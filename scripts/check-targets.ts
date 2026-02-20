import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

async function check() {
  const { data } = await supabase
    .from('monthly_targets')
    .select('*')
    .eq('pipeline_type', 'wedding')
    .order('month')
  
  console.table(data)
}

check()
