import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

<<<<<<< HEAD
export const createClient = async () => { // Deve essere async
  const cookieStore = await cookies();     // Deve avere l'await
=======
export const createClient = async () => { 
  const cookieStore = await cookies();   
>>>>>>> 2c56f90 (test commit)

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
<<<<<<< HEAD
            // Ignora se chiamato da un Server Component
=======
>>>>>>> 2c56f90 (test commit)
          }
        },
      },
    }
  );
};