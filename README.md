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

## Service Worker y Actualizaciones Automáticas

### ¿Cómo Funciona?

La aplicación utiliza un **Service Worker** de Angular que proporciona funcionalidad PWA (Progressive Web App) y gestiona actualizaciones automáticas sin intervención del usuario.

### Estrategia de Actualización

#### 1. Verificación Periódica
- El Service Worker verifica actualizaciones cada **2 minutos** automáticamente
- La verificación se activa después de que la aplicación está estable (30 segundos)
- No requiere que el usuario refresque el navegador

#### 2. Detección de Nueva Versión
Cuando se detecta una nueva versión:
1. El Service Worker descarga los nuevos archivos en segundo plano
2. Una vez descargada, la aplicación **se recarga automáticamente**
3. El usuario obtiene la versión actualizada sin acción manual

#### 3. Caché de Archivos

**Archivos con Caché:**
- JavaScript bundles (`*.js`)
- Hojas de estilo (`*.css`)
- Imágenes y assets (`*.png`, `*.svg`, `*.jpg`, etc.)

**Archivos SIN Caché:**
- `index.html` - Siempre se obtiene la versión más reciente
- `ngsw.json` - Archivo de control del Service Worker (contiene hash de versión)

### Proceso de Deploy y Actualización

#### Paso 1: Build y Upload
```bash
./upload-orders.sh
```

Este script:
1. Genera el build de producción
2. Sube todos los archivos a S3
3. Configura headers `no-cache` para `index.html` y `ngsw.json`
4. Muestra recordatorio para invalidar CloudFront

#### Paso 2: Invalidación de CloudFront
Solicitar al equipo de DevOps/AWS que ejecute:
```bash
aws cloudfront create-invalidation --distribution-id XXXXXX --paths "/*"
```

#### Paso 3: Actualización Automática en Clientes
- En menos de **2 minutos**, todos los usuarios activos obtienen la nueva versión
- La app se recarga automáticamente cuando detecta la actualización
- No se requiere Ctrl+F5 ni refrescar manualmente

### Configuración Técnica

**Service Worker Config:** `ngsw-config.json`
```json
{
  "app": {
    "installMode": "prefetch",  // Descarga archivos principales inmediatamente
    "files": ["/*.css", "/*.js"]
  },
  "assets": {
    "installMode": "lazy",      // Descarga assets bajo demanda
    "updateMode": "prefetch"     // Pre-descarga assets en actualizaciones
  }
}
```

**Auto-Update Service:** `src/app/services/pwa.service.ts`
- Implementa `SwUpdate` de Angular
- Verifica actualizaciones cada 2 minutos con `interval(120000)`
- Escucha eventos `VERSION_READY` para recargar automáticamente

### Troubleshooting

**La aplicación no se actualiza:**
1. Verificar que el Service Worker esté activo: Abrir DevTools → Application → Service Workers
2. Comprobar que se corrió la invalidación de CloudFront
3. Forzar actualización manual: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)

**Deshabilitar Service Worker en desarrollo:**
El Service Worker solo está activo en producción (`!isDevMode()`). En desarrollo local no interfiere con hot-reload.
