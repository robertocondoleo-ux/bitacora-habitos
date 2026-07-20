# Bitácora — seguimiento de peso, hábitos, pasos y comidas

App para cargar tu peso, hábitos diarios personalizados (desayuno, mate, etc.),
pasos y comidas, con un dashboard que te dice si vas bien hacia tu objetivo o
si conviene ajustar algo.

Stack: **Next.js** + **Supabase** (base de datos + login) + **Tailwind**.
Todo se puede correr con planes gratuitos (Supabase Free + Vercel Hobby).

---

## Paso 1 — Crear el proyecto en Supabase (gratis)

1. Andá a https://supabase.com y creá una cuenta (podés usar GitHub o Google).
2. Click en **"New project"**.
   - Nombre: el que quieras (ej. "bitacora").
   - Contraseña de base de datos: generá una y guardala (no la vas a necesitar
     para esta app, pero por las dudas).
   - Región: elegí la más cercana (ej. South America si está disponible).
3. Esperá 1-2 minutos a que se cree el proyecto.
4. Andá a **Authentication → Providers → Email** y confirmá que esté
   habilitado (viene así por defecto).
   - Opcional: en **Authentication → Settings**, podés desactivar "Confirm
     email" si querés que el usuario pueda entrar apenas se registra, sin
     confirmar el mail. Para uso personal es lo más simple.
5. Andá a **SQL Editor → New query**, pegá **todo** el contenido del archivo
   `supabase/schema.sql` de este proyecto, y tocá **Run**. Esto crea todas las
   tablas (peso, hábitos, pasos, comidas) con seguridad para que solo vos
   puedas ver tus datos.
6. Andá a **Project Settings → API**. Vas a necesitar dos valores para el
   paso 3:
   - **Project URL**
   - **anon public key**

---

## Paso 1.5 — Importar tu historial desde tu planilla de Excel

Ya tenés cargado un archivo de seguimiento (`import_datos.sql`) con tus datos
reales extraídos de tu Excel: **38 registros de peso** (desde el 23/12 con
105 kg hasta julio con 79,8 kg), tu objetivo de **78 kg**, y tus **12
hábitos** con los checks diarios de julio (Desayuno, Dientes mañana, 2 Litros
de agua, Entrenamiento, Caminar 10.000 pasos, Mate, Comida sana, Creatina,
Dientes noche, Crema pies, Crema brazos, Sin gaseosa). No incluye la
Metformina, como pediste.

Para importarlo:

1. Primero necesitás un usuario creado. Corré la app (local o ya
   desplegada) y registrate con tu email y contraseña (Paso 2 o 4).
2. En Supabase, andá a **Authentication → Users** y copiá el **UID** (un
   código largo tipo `a1b2c3d4-...`) de tu usuario recién creado.
3. Abrí el archivo `supabase/import_datos.sql` de este proyecto y reemplazá
   donde dice `'TU_USER_ID'` por ese UID (entre comillas simples).
4. Pegá el contenido completo en **SQL Editor → New query** de Supabase y
   tocá **Run**.
5. Recargá el dashboard de la app — vas a ver todo tu historial de peso, el
   objetivo y los hábitos con los checks de julio ya cargados.

Podés correr este script una sola vez; si lo corrés de nuevo no duplica
hábitos, pero sí puede duplicar días de peso ya cargados manualmente después
(usa "actualizar" en vez de duplicar, así que no pasa nada grave).

---

## Paso 2 — Probar la app en tu computadora (opcional pero recomendado)

Necesitás tener [Node.js](https://nodejs.org) instalado (versión 18 o
superior).

```bash
cd weight-app
npm install
cp .env.local.example .env.local
```

Abrí `.env.local` y pegá los valores de Supabase que copiaste en el paso 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Después corré:

```bash
npm run dev
```

Y abrí http://localhost:3000 — deberías ver la pantalla de login. Creá tu
usuario con email y contraseña y probá cargar un peso.

---

## Paso 3 — Subir el código a GitHub

1. Creá un repositorio nuevo en https://github.com/new (puede ser privado).
2. Desde la carpeta `weight-app`:

```bash
git init
git add .
git commit -m "Primera version de la app"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

(`.env.local` no se sube porque está en `.gitignore` — las claves las vas a
cargar directo en Vercel en el paso siguiente.)

---

## Paso 4 — Desplegar en Vercel (gratis)

1. Andá a https://vercel.com y creá una cuenta (podés usar la misma de
   GitHub).
2. Click en **"Add New… → Project"** y elegí el repositorio que acabás de
   subir.
3. Vercel va a detectar que es un proyecto Next.js automáticamente. No hace
   falta tocar nada de la configuración de build.
4. Antes de darle a "Deploy", abrí la sección **Environment Variables** y
   agregá las mismas dos variables que usaste en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click en **Deploy**. En 1-2 minutos vas a tener una URL pública (algo como
   `https://tu-app.vercel.app`) que podés abrir desde el celular o donde
   quieras.

Cada vez que hagas un cambio y lo subas a GitHub (`git push`), Vercel
redespliega la app automáticamente.

---

## Cómo usar la app

- **Objetivo**: definí tu peso objetivo arriba del dashboard. El cartel de al
  lado te va a decir si la tendencia de las últimas dos semanas va en la
  dirección correcta o si conviene ajustar algo (comidas, pasos, hábitos).
- **Peso**: cargá el peso del día (podés editar fechas pasadas también).
- **Pasos**: lo mismo, por día.
- **Hábitos**: agregá los que quieras (Desayuno, Mate, Tomar agua, etc.) y
  marcá el check por día en la grilla de los últimos 7 días.
- **Comidas**: registrá qué comiste, con tipo de comida (desayuno, almuerzo,
  merienda, cena, snack) y una descripción libre.

Todos los datos son privados: cada usuario solo ve lo que cargó (protegido a
nivel de base de datos con Row Level Security en Supabase).

---

## Instalarla como app en el celular

La app ahora es una **PWA** (Progressive Web App): se puede "instalar" desde
el navegador y queda como un ícono más en tu celular, abriendo en pantalla
completa (sin la barra de direcciones del navegador).

**Android (Chrome):**
1. Abrí tu URL de Vercel en Chrome.
2. Iniciá sesión.
3. Chrome puede mostrar automáticamente un banner "Instalar app" — tocalo. Si
   no aparece, tocá los tres puntitos (⋮) arriba a la derecha → **"Instalar
   app"** (o "Agregar a pantalla de inicio").
4. Confirmá.

**iPhone (tiene que ser Safari, no Chrome):**
1. Abrí tu URL en Safari.
2. Tocá el ícono de compartir (el cuadrado con flecha hacia arriba).
3. Deslizá y tocá **"Agregar a pantalla de inicio"**.
4. Confirmá.

En ambos casos te va a quedar un ícono propio (el monograma "B") y al abrirlo
entra directo, sin ver el navegador por arriba.

---

## Estructura del proyecto

```
weight-app/
  app/
    page.tsx            → redirige a /login o /dashboard
    login/page.tsx       → login y registro
    dashboard/page.tsx   → pantalla principal
  components/
    QuickStats.tsx          → tarjetas de resumen rápido (peso, cambio, pasos, hábitos de hoy)
    GoalCard.tsx             → objetivo + tendencia
    WeightSection.tsx        → carga y gráfico de peso
    MonthlyWeightSummary.tsx → tabla de peso promedio por mes, cambio y acumulado
    StepsSection.tsx         → carga y gráfico de pasos
    HabitsSection.tsx        → hábitos personalizados (grilla semanal)
    MonthlyHabitsSummary.tsx → % de cumplimiento por hábito y mes
    MealsSection.tsx         → registro de comidas
  lib/
    supabaseClient.ts     → conexión a Supabase
    dates.ts               → utilidades de fechas
  supabase/
    schema.sql             → script para crear las tablas
```

## Ideas para seguir mejorando (no incluidas todavía)

- Notificaciones/recordatorios diarios.
- Exportar los datos a CSV.
- Gráfico de correlación entre hábitos cumplidos y variación de peso.
- Modo oscuro.

Si querés que agreguemos alguna de estas, avisame.
