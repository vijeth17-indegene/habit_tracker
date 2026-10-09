npm install @supabase/supabase-js @tanstack/react-query react-router react-hook-form zod @hookform/resolvers zustand

Tailwind CSS
1) npm i -D tailwindcss @tailwindcss/vite

2) in vite.config.ts
import tailwindcss from '@tailwindcss/vite'
plugin: [react(), tailwindcss()]

3) src/index.css
@import "tailwindcss"

Supabase
1) created habit-tracker project
2) Added URL and Key in .env.local(Vite's default  .gitignore)
already ignores *.local files
