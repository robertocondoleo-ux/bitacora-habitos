import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.robertocondoleo.bitacora',
  appName: 'Bitácora',
  webDir: 'public',
  // La app nativa muestra directamente el sitio en producción, no una
  // copia local — así cada push a main actualiza la app sin recompilar.
  server: {
    url: 'https://bitacora-habitos.vercel.app',
    androidScheme: 'https',
  },
};

export default config;
