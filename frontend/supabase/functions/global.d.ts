declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
  serve(handler: (req: Request) => Response | Promise<Response>): void
}

declare module 'stripe' {
  const Stripe: any
  export default Stripe
}

declare module '@supabase/supabase-js' {
  export function createClient(url: string, key: string, options?: any): any
}
