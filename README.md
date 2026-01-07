# CRM NEWAVE

Sistema de gestión de miembros de la comunidad NEWAVE para tracking del pipeline de colocación laboral.

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Drag & Drop**: dnd-kit
- **Forms**: React Hook Form + Zod
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (CVs)
- **Auth**: Supabase Auth

## Configuración

### 1. Variables de Entorno

Copia `env.example` a `.env.local` y configura las variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Prisma)
DATABASE_URL=your-postgresql-connection-string
DIRECT_URL=your-postgresql-direct-connection-string
```

### 2. Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > API y copia las URLs y keys
3. En Storage, crea un bucket llamado `cvs` con acceso público
4. Configura las políticas de RLS o desactívalas para el bucket de CVs

### 3. Base de Datos

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Aplicar migraciones
npx prisma db push

# Sembrar datos iniciales (etapas del pipeline)
npm run db:seed
```

### 4. Crear Usuarios Admin

En Supabase Dashboard > Authentication > Users, crea 2 usuarios con email/password para Jaime y Santiago.

### 5. Ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Estructura del Proyecto

```
crm-newave/
├── app/
│   ├── (dashboard)/       # Rutas protegidas
│   │   ├── members/       # Tabla y detalle de miembros
│   │   └── pipeline/      # Kanban de colocación
│   ├── apply/             # Formulario público de intake
│   └── login/             # Autenticación
├── components/
│   ├── members/           # Componentes de miembros
│   ├── pipeline/          # Componentes de Kanban
│   └── ui/                # shadcn/ui components
├── actions/               # Server Actions
├── lib/                   # Utilidades y clientes
└── prisma/                # Schema y seed
```

## Features

- ✅ Formulario público de intake (`/apply`)
- ✅ Tabla de miembros con búsqueda y ordenamiento
- ✅ Detalle de miembro con edición
- ✅ Gestión de referrals (empresas a las que fue referido)
- ✅ Kanban de pipeline con drag & drop
- ✅ Gestión de etapas (agregar/renombrar/eliminar)
- ✅ Modal de contratación con captura de empresa, fecha y salario
- ✅ Subida y descarga de CVs
- ✅ Autenticación con Supabase

## Deploy en Vercel

1. Conecta el repositorio a Vercel
2. Configura las variables de entorno
3. Deploy
