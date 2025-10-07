# BM Orders

## Descripción

**Sistema de gestión de pedidos offline para vendedores móviles.**

BM Orders es una aplicación móvil y web diseñada específicamente para vendedores que necesitan registrar pedidos sin depender de una conexión a Internet. El sistema permite a los vendedores trabajar de manera autónoma en zonas sin cobertura, sincronizando los datos automáticamente cuando vuelven a tener conectividad. Ideal para representantes comerciales, distribuidores y equipos de ventas en campo que requieren continuidad operativa sin importar las condiciones de conectividad.

## Tecnologías Utilizadas

- **Angular 20** - Framework principal para la aplicación
- **Ionic 8** - Framework de UI para aplicaciones móviles híbridas
- **Capacitor 7** - Runtime nativo para iOS, Android y Web
- **TypeScript 5.8** - Lenguaje de programación
- **SQLite** - Base de datos local para almacenamiento offline
- **RxJS 7.8** - Programación reactiva
- **Capacitor Preferences** - Almacenamiento seguro de configuración y tokens
- **Capacitor Network** - Detección de conectividad
- **Service Worker** - PWA para funcionamiento offline en web
- **Moment.js** - Manejo de fechas y horarios

## Características Principales

- **Modo Offline Completo:** Registro y gestión de pedidos sin conexión a Internet
- **Base de Datos Local:** Almacenamiento persistente de catálogos, clientes y pedidos usando SQLite
- **Sincronización Automática:** Los datos se sincronizan automáticamente cuando hay conectividad
- **Gestión de Catálogos:** Importación y actualización de artículos y precios
- **Gestión de Clientes:** Administración completa de información de clientes
- **Multi-sucursal:** Soporte para vendedores con múltiples puntos de venta
- **Autenticación Segura:** Sistema de login con tokens JWT y almacenamiento encriptado
- **PWA (Progressive Web App):** Funciona como aplicación nativa en el navegador
- **Multiplataforma:** Compatible con iOS, Android y navegadores web
- **Importación por Lotes:** Sistema de importación optimizado para grandes volúmenes de datos

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18 o superior
- **npm** v9 o superior
- **Git** para clonar el repositorio
- **Angular CLI** v20 (se instalará con las dependencias)
- **Ionic CLI** v8 (se instalará con las dependencias)
- **(Opcional) Android Studio** para desarrollo en Android
- **(Opcional) Xcode** para desarrollo en iOS (solo macOS)

## Instalación

Sigue estos pasos para configurar el proyecto en tu máquina local:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/bm-orders.git
   cd bm-orders
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura el entorno:**
   Crea o edita los archivos de configuración en `src/environments/`:
   - `environment.ts` (desarrollo)
   - `environment.prod.ts` (producción)

4. **Sincroniza Capacitor (para desarrollo móvil):**
   ```bash
   npx ionic capacitor sync
   ```

## Uso

### Desarrollo Web

Para ejecutar el proyecto en modo de desarrollo web:

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### Desarrollo Móvil

**Para iOS:**
```bash
npx ionic capacitor run ios
```

**Para Android:**
```bash
npx ionic capacitor run android
```

### Build de Producción

Para generar un build de producción:

```bash
npx ionic build --prod --aot --configuration=production
```

### Deploy a S3 (AWS)

El proyecto incluye un script de deploy automatizado:

```bash
./upload-orders.sh
```

Este script ejecuta el build de producción y sube los archivos al bucket S3 configurado.

## Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Genera un build de desarrollo
- `npm test` - Ejecuta las pruebas unitarias
- `npm run lint` - Ejecuta el linter de código
- `./upload-orders.sh` - Build y deploy a AWS S3

## Estructura del Proyecto

```
bm-orders/
├── src/
│   ├── app/
│   │   ├── guards/          # Guards de autenticación
│   │   ├── interceptors/    # Interceptores HTTP
│   │   ├── models/          # Modelos de datos
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── services/        # Servicios (API, SQLite, Storage)
│   │   └── app.component.ts
│   ├── environments/        # Configuración de entornos
│   └── assets/             # Recursos estáticos
├── capacitor.config.ts     # Configuración de Capacitor
├── ionic.config.json       # Configuración de Ionic
└── package.json            # Dependencias del proyecto
```

## Funcionalidades Clave

### Gestión de Artículos
- Importación completa o por lotes de catálogos
- Búsqueda y filtrado de productos
- Almacenamiento local para acceso offline

### Gestión de Clientes
- Sincronización de base de clientes
- Información completa de contacto y ubicación
- Historial de pedidos

### Sistema de Pedidos
- Creación de pedidos sin conexión
- Cálculo automático de totales
- Gestión de estados de pedidos
- Cola de sincronización

### Sincronización
- Detección automática de conectividad
- Sincronización bidireccional
- Manejo de conflictos
- Reintentos automáticos
