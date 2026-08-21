# React File Renamer – Frontend

Aplicación cliente del sistema de gestión de documentos, desarrollada con **React** + **Vite**, que permite a los roles `ADMIN`, `UPLOADER` y `DOWNLOADER` interactuar con el backend de forma segura, responsiva y siguiendo una arquitectura modular.

---

## 1. Arquitectura del proyecto

El frontend se organiza en una arquitectura basada en **componentes funcionales** y hooks, separando las capas de presentación, estado global, servicios y constantes.

**Principios aplicados:**

- **Migración completa de BEM a Bootstrap 5.3.8** – se eliminaron CSS Modules y clases BEM en favor de clases utilitarias de Bootstrap para mantener consistencia visual y reducir deuda técnica.
- **Rutas centralizadas** – todas las rutas internas se gestionan mediante un objeto `INTERNAL_ROUTES` importado desde `/src/constants/routes.js`.
- **Metadatos SEO dinámicos** – uso de `react-helmet-async` con un objeto `PAGE_META` centralizado para controlar título, descripción y keywords por página.
- **Gestión de entorno** – la URL base de la API se inyecta mediante `import.meta.env.VITE_API_URL`, con fallback a `http://localhost:5000`.
- **Estado global** – contexto de autenticación (`AuthContext`) que provee usuario, rol y funciones de login/logout.
- **Comunicación con backend** – servicio `api.js` que abstrae todas las llamadas HTTP (subida de archivos, descarga de ZIPs, etc.).
- **Validación de formularios** – se utiliza **Zod** para definir esquemas de validación en el cliente, garantizando la integridad de los datos antes de enviarlos al backend.

### 1.1 Estructura de directorios

El proyecto mantiene una organización simple pero funcional, separando los estilos en archivos CSS independientes que luego se importan desde un `index.css` central. Los componentes se agrupan por dominio (Admin, Dashboard, Downloader, Layout, Upload, common) y las páginas se corresponden una a una con las rutas principales. Las utilidades transversales (validaciones, manejo de sesiones, consumo de API, constantes) se aíslan en directorios específicos para favorecer la reutilización y el mantenimiento.

.
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── public
├── src
│   ├── App.jsx
│   ├── components
│   │   ├── Admin
│   │   │   ├── AdminAuditTable.jsx
│   │   │   ├── AdminStats.jsx
│   │   │   └── AdminTable.jsx
│   │   ├── Auth
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Dashboard
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TemplateDetails.jsx
│   │   │   └── TemplatesTable.jsx
│   │   ├── Downloader
│   │   │   ├── DownloaderPanel.jsx
│   │   │   ├── DownloaderRow.jsx
│   │   │   └── DownloaderTable.jsx
│   │   ├── Layout
│   │   │   ├── Footer.jsx
│   │   │   └── Header.jsx
│   │   ├── Upload
│   │   │   ├── ExcelUploader.jsx
│   │   │   └── FileUploader.jsx
│   │   └── common
│   │       ├── FilterFields.jsx
│   │       ├── HelmetMeta.jsx
│   │       ├── Pagination.jsx
│   │       └── Spinner.jsx
│   ├── constants
│   │   ├── images.js
│   │   ├── index.js
│   │   ├── meta.js
│   │   ├── routes.js
│   │   └── titles.js
│   ├── contexts
│   │   ├── AuthContext.jsx
│   │   └── index.js
│   ├── css
│   │   ├── Dashboard.css
│   │   ├── Downloader.css
│   │   ├── Footer.css
│   │   ├── Header.css
│   │   ├── Login.css
│   │   ├── Spinner.css
│   │   └── index.css
│   ├── hooks
│   │   ├── useApiError.js
│   │   └── useValidation.js
│   ├── main.jsx
│   ├── pages
│   │   ├── AdminPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── DownloaderPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── UploadPage.jsx
│   ├── routes
│   │   ├── AppRoutes.jsx
│   │   ├── PrivateRoutes.jsx
│   │   ├── PublicRoutes.jsx
│   │   └── index.jsx
│   ├── services
│   │   └── api.js
│   └── utils
│       ├── sessionHelper.js
│       └── validations.js
└── vite.config.js

19 directories, 58 files

A continuación se describe el propósito de cada carpeta:

- **`components/`** – Contiene todos los componentes de interfaz, organizados en subcarpetas según su función (Admin, Auth, Dashboard, Downloader, Layout, Upload, common). Los componentes comunes (Spinner, Paginación, Filtros, HelmetMeta) se alojan en `common/`.
- **`constants/`** – Centraliza valores fijos del proyecto: rutas internas (`routes.js`), metadatos SEO (`meta.js`), títulos de página, descripciones de imágenes (`images.js`). Todos se exportan desde un `index.js` para facilitar las importaciones.
- **`contexts/`** – Define los contextos de React, principalmente `AuthContext` para la gestión de autenticación y estado global del usuario.
- **`css/`** – Archivos de estilos propios (aunque la mayoría de los componentes han migrado a Bootstrap, se conservan algunos estilos específicos como `Dashboard.css`, `Header.css`, etc.). El archivo `index.css` importa los demás y aplica reglas globales.
- **`hooks/`** – Custom hooks que encapsulan lógica repetitiva: `useApiError` para el manejo centralizado de errores de API y `useValidation` para integrar validaciones con Zod.
- **`pages/`** – Componentes de nivel superior que representan cada vista de la aplicación (`AdminPage`, `DashboardPage`, `LoginPage`, etc.). Cada página se encarga de orquestar la carga de datos, el SEO (mediante `HelmetMeta`) y la composición de los componentes necesarios.
- **`routes/`** – Define el sistema de enrutamiento: `AppRoutes` combina las rutas públicas y privadas, `PublicRoutes` protege rutas de autenticación (redirige si ya hay sesión), `PrivateRoutes` valida el rol del usuario y redirige en consecuencia.
- **`services/`** – Contiene `api.js`, el módulo encargado de todas las comunicaciones con el backend (autenticación, CRUD de plantillas, subida de archivos, descarga de ZIP, auditoría). Utiliza `fetch` y maneja automáticamente las cookies de sesión.
- **`utils/`** – Funciones auxiliares que no pertenecen a un componente específico: `sessionHelper.js` para operaciones de sesión (limpieza, verificación) y `validations.js` donde se definen los esquemas de Zod para validar formularios (login, registro, subida de archivos).
- **Raíz** – Archivos de configuración (`vite.config.js`, `eslint.config.js`, `package.json`), el punto de entrada `index.html` y el directorio `public/` para recursos estáticos.

Esta separación permite que cada aspecto del proyecto (estilos, lógica de negocio, validaciones, enrutamiento) resida en un lugar predecible, facilitando la escalabilidad y la incorporación de nuevos desarrolladores.

---

## 2. Organización de componentes

Los componentes se agrupan por dominio funcional dentro de `/src/components`:

- **Admin** – componentes para el panel de monitoreo (estadísticas, tablas de plantillas, auditoría).
- **Dashboard** – lista de plantillas, tabla de asignaciones y vista de detalles.
- **Downloader** – panel de tareas del rol DOWNLOADER, tabla agrupada por plantilla y fila para subir documentos.
- **Layout** – componentes estructurales (`Header`, `Footer`).
- **Upload** – formulario de subida de plantilla Excel y subida de archivos individuales.
- **auth** – componente de login.
- **common** – componentes reutilizables (`Spinner`, `FilterFields`, `Pagination`, `HelmetMeta`).

Cada componente es funcional, utiliza hooks de React y se comunica con el backend a través del servicio `api.js`. Los estados locales se manejan con `useState` y `useMemo`; no se utiliza Redux.

---

## 3. Configuración y buenas prácticas

### 3.1 Variables de entorno

Se definen archivos `.env.development`, `.env.production` y opcionalmente `.env.local` con la variable `VITE_API_URL`. Vite inyecta el valor correspondiente según el entorno.

### 3.2 Autenticación y autorización

- El `AuthContext` almacena el usuario logueado y su rol.
- Las páginas verifican el rol para mostrar/ocultar contenido o redirigir.
- El backend provee cookies `httpOnly`; el frontend no manipula tokens directamente.

### 3.3 Manejo de errores y feedback

Se utiliza **SweetAlert2** para modales de confirmación y errores. Los mensajes de error provienen del backend o se generan localmente con Zod.

### 3.4 Subida de archivos

- `ExcelUploader` valida el archivo Excel (extensión, estructura) usando Zod y envía al endpoint correspondiente.
- `DownloaderRow` permite subir documentos (PDF, JPG, etc.) con validación de tipo y tamaño.
- Ambos componentes muestran un spinner durante la carga y refrescan la vista al completarse.

### 3.5 Paginación y filtros

Las tablas utilizan componentes reutilizables `Pagination` y `FilterFields`. Los filtros (búsqueda por título, estado, ordenamiento) se aplican en el frontend mediante `useMemo`.

---

## 4. Despliegue

1. Ejecutar `npm run build` para generar la carpeta `dist/`.
2. Servir los archivos estáticos con Nginx, Apache o plataformas como Vercel/Netlify.
3. Configurar el servidor para redirigir todas las rutas a `index.html` (SPA).
4. Asegurar que la variable `VITE_API_URL` apunte al backend correcto antes del build.

---

## 5. Prácticas de desarrollo

- **Rutas centralizadas** – cualquier cambio se hace en un solo lugar.
- **Metadatos dinámicos** – mejora el SEO y la experiencia en redes sociales.
- **Componentes funcionales puros** – facilitan pruebas y reutilización.
- **Validación con Zod** – esquemas declarativos que evitan envíos inválidos al backend.
- **Estado local suficiente** – solo la autenticación es global; el resto se maneja localmente.
- **Responsive por defecto** – Bootstrap garantiza adaptación a todos los dispositivos.