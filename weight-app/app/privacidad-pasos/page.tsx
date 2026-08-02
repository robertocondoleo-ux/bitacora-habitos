export const metadata = {
  title: "Privacidad de datos de salud — Bitácora",
};

export default function PrivacidadPasosPage() {
  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-lg mx-auto card p-6 space-y-5">
        <div>
          <h1 className="font-display font-extrabold text-2xl">Privacidad de datos de salud</h1>
          <p className="text-xs text-soft mt-1">Bitácora — última actualización: agosto de 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base">Qué datos leemos</h2>
          <p className="text-sm text-soft leading-relaxed">
            Si activás la sincronización automática de pasos, Bitácora le pide permiso a{" "}
            <strong className="text-ink">Health Connect</strong> (el sistema de salud de Android)
            para leer únicamente tu <strong className="text-ink">cantidad de pasos</strong>. No
            leemos ningún otro dato de salud (ritmo cardíaco, sueño, peso corporal desde Health
            Connect, etc.), aunque el permiso general de Android a veces se muestre agrupado.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base">Para qué lo usamos</h2>
          <p className="text-sm text-soft leading-relaxed">
            Guardamos el total de pasos del día en tu cuenta de Bitácora, exactamente igual que si
            lo hubieras escrito a mano en la pestaña "Pasos". Es solo para mostrarte tu progreso
            diario y tu meta — no lo usamos para publicidad, no lo vendemos ni lo compartimos con
            nadie fuera de tu cuenta.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base">Dónde se guarda</h2>
          <p className="text-sm text-soft leading-relaxed">
            Se guarda en la base de datos de Bitácora (Supabase), protegida para que solo vos (y,
            si activaste el vínculo, tu nutricionista o entrenador) puedan verla.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base">Cómo revocar el permiso</h2>
          <p className="text-sm text-soft leading-relaxed">
            Podés desactivar el acceso en cualquier momento desde Android: Configuración → Salud
            y estado físico → Health Connect → Apps con permisos → Bitácora. Al revocarlo, Bitácora
            simplemente deja de leer pasos automáticamente; podés seguir cargándolos a mano cuando
            quieras.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base">Contacto</h2>
          <p className="text-sm text-soft leading-relaxed">
            Dudas sobre esta política: {" "}
            <a href="mailto:roberto.condoleo@gmail.com" className="text-clay underline">
              roberto.condoleo@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
