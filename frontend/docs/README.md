# Documentación propuesta para el frontend

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Objetivo](#2-objetivo)
3. [Problema que resuelve](#3-problema-que-resuelve)
4. [Alcance](#4-alcance)
5. [Stack tecnológico](#5-stack-tecnológico)
6. [Arquitectura](#6-arquitectura)
7. [Organización y separación de responsabilidades](#7-organización-y-separación-de-responsabilidades)
8. [Navegación y control de acceso](#8-navegación-y-control-de-acceso)
9. [Gestión de estado y sesión](#9-gestión-de-estado-y-sesión)
10. [Integración con la API](#10-integración-con-la-api)
11. [Validaciones y manejo de errores](#11-validaciones-y-manejo-de-errores)
12. [Flujo funcional](#12-flujo-funcional)
13. [Seguridad del cliente](#13-seguridad-del-cliente)
14. [Pruebas y validaciones](#14-pruebas-y-validaciones)
15. [Configuración y ejecución](#15-configuración-y-ejecución)
16. [Limitaciones, aprendizajes y evolución](#16-limitaciones-aprendizajes-y-evolución)

---

## 1. Descripción del proyecto

Sistema web para gestionar la carga, organización y validación de documentos a partir de una plantilla Excel que define las reglas de nombres y directorios requeridos.

El sistema permite asignar tareas de carga de documentos a diferentes usuarios, recibir los archivos correspondientes, validar su cumplimiento con las reglas definidas y autorizar o rechazar cada documento.

Una vez aprobados los documentos requeridos, el sistema puede generar un archivo `.zip` que contiene la estructura de directorios y los archivos definidos en la plantilla.

El archivo generado incluye:

* Los documentos organizados de acuerdo con la estructura indicada en la plantilla.
* Un archivo con las huellas/hash SHA-256 de los documentos incluidos.
* La estructura de directorios definida en la plantilla.

El frontend corresponde a una **Single Page Application (SPA)** desarrollada con React y proporciona la interfaz para interactuar con las diferentes funcionalidades del sistema:

* autenticación;
* gestión de plantillas;
* asignación de tareas;
* carga de documentos;
* revisión de documentos;
* descarga de archivos ZIP;
* monitoreo administrativo;
* consulta de tareas según el rol del usuario.

---

## 2. Objetivo

### ¿Qué quería conseguir desarrollándolo?

Desarrollar una aplicación MERN que permita gestionar el proceso de preparación y validación de documentos mediante una separación de responsabilidades basada en roles.

El frontend proporciona la **interfaz de interacción con los servicios expuestos por el backend**, implementando la navegación, validaciones de datos en el cliente y control de acceso a las diferentes vistas según el estado de autenticación y el rol del usuario.

La autorización efectiva para ejecutar operaciones y acceder a recursos es responsabilidad del backend.

---

## 3. Problema que resuelve

### ¿Qué problema aborda?

Cuando un proceso requiere preparar un conjunto de documentos siguiendo una estructura específica de nombres y directorios, realizar esta tarea manualmente puede provocar errores de organización, nomenclatura y selección de archivos.

El sistema automatiza parte de este proceso mediante una plantilla que define los documentos requeridos y su ubicación dentro de la estructura final.

Desde el frontend, la interfaz facilita la interacción con el sistema mediante menús y funcionalidades adaptadas al rol del usuario, así como mediante la presentación de mensajes claros ante los diferentes errores que pueden producirse durante el proceso.

Entre estos casos se encuentran la carga incorrecta de archivos y los errores detectados durante el procesamiento de las plantillas de reglas. Cuando se encuentran inconsistencias en una plantilla, el sistema permite recibir un archivo Excel con los errores detectados, indicando el registro que originó cada uno de ellos.

---

## 4. Alcance

La interfaz del proyecto proporciona una experiencia de uso sencilla y responsiva para las funcionalidades disponibles en el sistema.

### Incluye

* Autenticación.
* Navegación según el rol del usuario.
* Gestión de plantillas.
* Carga de archivos.
* Consulta de tareas.
* Revisión de documentos.
* Descarga de archivos.
* Monitoreo administrativo.
* Gestión de sesiones expiradas o revocadas.

### No incluye

* Persistencia de datos.
* Autorización definitiva sobre operaciones y recursos.
* Procesamiento de archivos en el servidor.
* Generación de archivos en el servidor.
* Auditoría como fuente de verdad.

Estas responsabilidades corresponden al backend.

---

# 5. Stack tecnológico

| Categoría            | Tecnología         |
| -------------------- | ------------------ |
| UI                   | React              |
| Build tool           | Vite               |
| Routing              | React Router       |
| Validación           | Zod                |
| HTTP                 | Fetch API          |
| Feedback de interfaz | SweetAlert2        |
| Indicadores de carga | React Spinners     |
| Metadata             | React Helmet Async |
| CSS / UI             | Bootstrap 5 / CSS  |
| Runtime / tooling    | Node.js            |
| Desarrollo           | Nodemon            |

---

# 6. Arquitectura

El proyecto está organizado mediante una separación de responsabilidades que permite mantener agrupadas las funcionalidades relacionadas con las diferentes partes de la interfaz.

Los componentes se organizan principalmente por funcionalidad o pantalla, mientras que las páginas (`pages`) actúan como puntos de composición de las vistas. La comunicación con el backend se centraliza mediante servicios y las funcionalidades transversales se separan mediante contextos, hooks, utilidades y constantes.

Los estilos se mantienen centralizados mediante CSS, utilizando la metodología **BEM** junto con **Bootstrap 5**. Las variables y clases de uso general se agrupan en los archivos CSS globales e importados desde `index.css`, mientras que los estilos específicos de los componentes se mantienen organizados para evitar duplicación y pérdida de estilos durante la composición de las vistas.

La estructura principal del proyecto es:

```text
src/
├── components/
├── constants/
├── contexts/
├── hooks/
├── pages/
├── routes/
├── services/
├── utils/
├── css/
├── App.jsx
└── main.jsx
```

### `components/`

Contiene las diferentes partes reutilizables de las páginas de la interfaz, organizadas por funcionalidad.

### `constants/`

Centraliza información estática utilizada por la aplicación, como:

* rutas de navegación;
* nombres y referencias de imágenes;
* textos alternativos de imágenes;
* títulos de página;
* metadatos.

### `contexts/`

Gestiona información transversal relacionada principalmente con la autenticación y el estado de acceso del usuario dentro de la interfaz.

### `hooks/`

Contiene lógica reutilizable que requiere comportamiento de React, como:

* validación de datos;
* manejo de errores de la API;
* gestión de determinados comportamientos de la interfaz.

### `pages/`

Contiene las pantallas principales de la aplicación y sirve como capa de composición entre las rutas y los componentes correspondientes.

### `routes/`

Define las rutas de navegación de la SPA y los mecanismos de control de acceso a las diferentes vistas.

### `services/`

Centraliza la comunicación con la API REST del backend.

### `utils/`

Contiene funciones auxiliares independientes de la composición de los componentes, como las relacionadas con la lectura y limpieza del contexto de sesión.

### `css/`

Centraliza las reglas de estilos de la aplicación y permite mantener organizados los estilos globales y específicos de los componentes.

### `App.jsx`

Actúa como punto principal de composición de la aplicación y conecta las funcionalidades generales con la estructura de navegación.

### `main.jsx`

Es el punto de entrada de la aplicación. Configura los proveedores globales de React, el sistema de navegación mediante `BrowserRouter` y la carga global de los estilos CSS.

---

# 7. Organización y separación de responsabilidades

La estructura del frontend busca evitar que las responsabilidades de la aplicación se concentren directamente en los componentes de interfaz.

### `pages/`

Define las pantallas principales y compone los componentes necesarios para cada vista.

### `components/`

Contiene los componentes visuales y funcionales de la aplicación, agrupados por las funcionalidades a las que pertenecen.

### `services/`

Centraliza las operaciones de comunicación con el backend. El archivo `api.js` concentra las solicitudes realizadas a los diferentes recursos de la API.

### `contexts/`

Mantiene información de estado que debe estar disponible para diferentes partes de la aplicación, principalmente la información relacionada con la autenticación y la sesión.

### `hooks/`

Agrupa lógica reutilizable relacionada con el comportamiento de React, como `useValidation` y `useApiError`.

### `constants/`

Centraliza valores estáticos compartidos por diferentes partes de la aplicación, evitando duplicar rutas, títulos, metadatos y referencias de recursos.

### `utils/`

Agrupa funciones auxiliares que no requieren formar parte de un componente o hook de React, como las utilizadas para obtener y limpiar el contexto de sesión.

Esta separación permite mantener las responsabilidades distribuidas entre diferentes módulos en lugar de concentrar la lógica de presentación, comunicación, validación y sesión dentro de los mismos componentes.

---

# 8. Navegación y control de acceso

El frontend implementa el **control de acceso a las vistas**, pero no constituye el mecanismo definitivo de autorización del sistema.

La autorización de operaciones y recursos, incluyendo la carga de documentos y la consulta de información, es responsabilidad exclusiva de las políticas implementadas en el backend.

En el frontend, el acceso a las diferentes pantallas se limita considerando principalmente:

* el estado de autenticación;
* el rol del usuario;
* las rutas permitidas para dicho rol.

Las principales rutas de la aplicación son:

| Ruta             |   ADMIN  | UPLOADER | DOWNLOADER | No autenticado |
| ---------------- | :------: | :------: | :--------: | :------------: |
| `/login`         | Redirige | Redirige |  Redirige  |        ✓       |
| `/register`      | Redirige | Redirige |  Redirige  |        ✓       |
| `/dashboard`     |     ✓    |     ✓    |      ✗     |    Redirige    |
| `/upload`        |     ✓    |     ✓    |      ✗     |    Redirige    |
| `/my-tasks`      |     ✓    |     ✗    |      ✓     |    Redirige    |
| `/admin/monitor` |     ✓    |     ✗    |      ✗     |    Redirige    |

Las rutas públicas utilizan `PublicRoute`, que evita que un usuario autenticado acceda nuevamente a las pantallas de autenticación.

Las rutas privadas utilizan `PrivateRoute`, que verifica el estado de autenticación y, cuando corresponde, el rol requerido para acceder a la vista.

---

# 9. Gestión de estado y sesión

Perfecto. Para el **punto 9** sí conviene ser bastante preciso porque aquí hay una distinción importante entre **estado de la interfaz** y **sesión/autenticación real**.

Con el código que me proporcionaste, yo lo redactaría así:

---

# 9. Gestión de estado y sesión

El frontend utiliza un contexto global de React para centralizar el estado relacionado con la autenticación y la sesión del usuario.

La gestión se concentra principalmente en `AuthContext`, mientras que `sessionHelper` proporciona las funciones necesarias para consultar y limpiar el contexto de usuario disponible en el cliente.

### Estado de autenticación

`AuthContext` mantiene tres elementos principales:

* `user`: información del usuario disponible para la interfaz.
* `isAuthenticated`: indica si el cliente dispone de un contexto de usuario válido para continuar con la navegación.
* `loading`: permite evitar decisiones de navegación mientras se inicializa el contexto de autenticación.

Además, el contexto expone las operaciones principales relacionadas con la sesión:

* `login()`
* `register()`
* `logout()`

De esta manera, los componentes de la aplicación no necesitan implementar individualmente la lógica de autenticación.

```text
                    AuthProvider
                         │
          ┌──────────────┼──────────────┐
          │              │              │
        user      isAuthenticated     loading
          │
          ├── login()
          ├── register()
          └── logout()
```

### Inicialización del contexto

Al inicializarse la aplicación, `AuthContext` consulta la cookie `user_context` mediante `getContextFromCookie()`.

Si existe un contexto válido, se utiliza para inicializar el estado del usuario:

```text
Aplicación
    │
    ▼
AuthProvider
    │
    ▼
getContextFromCookie()
    │
    ├── Existe contexto
    │       ↓
    │   user + autenticado
    │
    └── No existe
            ↓
        usuario no autenticado
```

Este mecanismo permite que la interfaz determine inicialmente qué rutas y elementos de navegación puede mostrar sin almacenar directamente las credenciales de autenticación en el estado de React.

### Inicio de sesión

El proceso de inicio de sesión delega la autenticación al backend mediante `api.login()`.

Una vez que el backend responde correctamente, el contexto normaliza la información del usuario y actualiza el estado local:

```text
Login
  │
  ▼
api.login()
  │
  ▼
Backend
  │
  ├── Cookie de sesión
  │
  └── Información del usuario
          │
          ▼
      AuthContext
          │
          ├── user
          └── isAuthenticated
```

El frontend no genera ni valida por sí mismo las credenciales de autenticación. Su función es mantener el estado necesario para representar la sesión en la interfaz y utilizar la sesión proporcionada por el backend.

### Control de sesión durante la navegación

`PrivateRoutes` utiliza el estado proporcionado por `AuthContext` para determinar si una ruta puede ser renderizada.

El flujo general es:

```text
Usuario solicita una ruta
          │
          ▼
    PrivateRoutes
          │
          ▼
¿Está cargando?
   │          │
  Sí          No
   │          │
 Spinner      ▼
         ¿Autenticado?
          │       │
         No       Sí
          │       │
       /login     ▼
              ¿Rol permitido?
                │       │
               No       Sí
                │       │
          redirección   │
                        ▼
                    componente
```

El control de roles realizado en el frontend tiene como finalidad controlar la navegación y la presentación de las pantallas. **No sustituye la autorización del backend**, que permanece como autoridad para determinar si una operación puede ejecutarse.

### Detección de sesión expirada o revocada

Las respuestas de la API son procesadas mediante `handleResponse()` en `services/api.js`.

Cuando el backend devuelve un `401`, el frontend analiza el motivo de la respuesta. Para los casos de sesión expirada o sesión revocada, se genera un evento global:

```text
Solicitud a la API
       │
       ▼
   HTTP 401
       │
       ▼
handleResponse()
       │
       ▼
session:expired
       │
       ▼
AuthContext
       │
       ├── limpia estado local
       ├── limpia user_context
       ├── muestra aviso
       └── redirige a /login
```

`AuthContext` escucha el evento `session:expired`, elimina el usuario del estado de React y establece `isAuthenticated` en `false`.

Posteriormente se muestra una notificación mediante SweetAlert2 y, una vez confirmada, el usuario es dirigido nuevamente al inicio de sesión.

Esto permite que una sesión invalidada por el backend se refleje también en el estado de la interfaz, evitando que el usuario continúe navegando con un contexto local que ya no corresponde con la sesión del servidor.

### Cierre de sesión

El cierre de sesión intenta primero invalidar la sesión mediante `api.logout()`.

Independientemente de que la solicitud al backend tenga éxito o falle, el frontend realiza la limpieza de su estado local:

```text
logout()
   │
   ▼
api.logout()
   │
   ├── éxito
   │
   └── error
        │
        ▼
limpieza local
   │
   ├── user = null
   ├── isAuthenticated = false
   └── user_context eliminada
        │
        ▼
     /login
```

La limpieza local se realiza incluso cuando el backend no responde correctamente, evitando mantener una sesión aparente en la interfaz después de que el usuario haya solicitado cerrar sesión.

---

# 10. Integración con la API

Perfecto. Para el **punto 10** mantendría el mismo criterio: documentar **cómo está implementada actualmente la integración**, sin intentar corregirla todavía. Las inconsistencias que encontremos quedan para V2.

Con `services/api.js` que proporcionaste, propondría esta redacción:

---

# 10. Integración con la API

La comunicación entre el frontend y el backend se centraliza principalmente en `services/api.js`, donde se definen las operaciones disponibles para consumir los servicios REST de la aplicación.

La URL base de la API se obtiene mediante la variable de entorno `VITE_API_URL` y se complementa con el prefijo de versión utilizado por el backend:

```text
VITE_API_URL
      │
      ▼
/api/v1
      │
      ▼
URL base de la API
```

De esta forma, el frontend puede utilizar diferentes direcciones del backend según el ambiente en el que se ejecute la aplicación sin modificar directamente el código de los servicios.

### Organización de los servicios

Las operaciones disponibles en `api.js` se encuentran agrupadas de acuerdo con el módulo funcional al que pertenecen:

| Módulo      | Operaciones principales                               |
| ----------- | ----------------------------------------------------- |
| Auth        | Registro, inicio y cierre de sesión                   |
| Templates   | Consulta, carga, aprobación, cancelación y asignación |
| Assignments | Carga y revisión de documentos                        |
| ZIP         | Descarga de paquetes                                  |
| Dashboard   | Consulta de plantillas y estados                      |
| Admin       | Consulta de plantillas y auditoría                    |
| Tasks       | Consulta de tareas y plantillas asignadas             |
| Users       | Consulta de usuarios por rol                          |

Esta organización permite que los componentes de la interfaz utilicen operaciones específicas del servicio sin implementar directamente las solicitudes HTTP.

Por ejemplo, un componente puede utilizar:

```text
Componente
    │
    ▼
api.getDashboardTemplates()
    │
    ▼
fetch()
    │
    ▼
Backend REST
```

En lugar de construir directamente la URL, método HTTP y configuración de cada solicitud dentro del componente.

### Configuración de las solicitudes

Las operaciones utilizan la API nativa `fetch` y configuran los parámetros necesarios según el tipo de operación.

Para las solicitudes que requieren autenticación se utiliza:

```js
credentials: 'include'
```

Esto permite que el navegador incluya las credenciales asociadas a la sesión en las solicitudes realizadas al backend.

Para el envío de datos estructurados se utiliza `application/json`:

```text
Datos JavaScript
      ↓
JSON.stringify()
      ↓
HTTP request
      ↓
Backend
```

Mientras que las operaciones de carga de archivos utilizan `FormData`, permitiendo enviar archivos junto con los datos asociados:

```text
Archivo + datos
      ↓
FormData
      ↓
fetch()
      ↓
Backend
```

No se establece manualmente el `Content-Type` para las solicitudes que utilizan `FormData`, permitiendo que el navegador genere automáticamente el `multipart/form-data` correspondiente.

### Orquestación común de respuestas

Las respuestas de las solicitudes HTTP se procesan mediante la función `handleResponse()`.

Esta función centraliza el tratamiento general de las respuestas exitosas y de los errores:

```text
fetch()
   │
   ▼
handleResponse()
   │
   ├── 2xx
   │    └── JSON / null
   │
   └── Error
        │
        ├── 401
        │    └── gestión de sesión
        │
        └── otros errores
             └── Error
```

Cuando la respuesta es exitosa, `handleResponse()` devuelve el contenido JSON de la respuesta, excepto en operaciones `204 No Content`, donde devuelve `null`.

En caso de error, obtiene la información proporcionada por el backend y genera un error utilizando el mensaje disponible.

### Manejo centralizado de sesiones

Las respuestas `401 Unauthorized` reciben un tratamiento específico.

Cuando el backend informa que la sesión fue invalidada o expiró, `handleResponse()`:

1. limpia las cookies de contexto accesibles desde el cliente;
2. identifica el motivo de la respuesta;
3. genera el evento `session:expired`;
4. permite que `AuthContext` gestione el estado global de la sesión.

```text
Backend
   │
   ▼
HTTP 401
   │
   ▼
handleResponse()
   │
   ▼
session:expired
   │
   ▼
AuthContext
   │
   ├── limpia estado
   ├── informa al usuario
   └── redirige a login
```

De esta manera, la lógica relacionada con una sesión invalidada no necesita implementarse individualmente en cada servicio o componente.

### Operaciones de descarga

Las operaciones que devuelven archivos, como la generación y descarga de paquetes ZIP, utilizan `response.blob()` en lugar de procesar la respuesta como JSON.

```text
Solicitud
   ↓
Backend
   ↓
Archivo binario
   ↓
Blob
   ↓
Interfaz
   ↓
Descarga
```

Este mecanismo permite que el frontend trabaje con las respuestas binarias proporcionadas por el backend.

### Responsabilidad del servicio

`api.js` funciona como una capa de comunicación entre la interfaz y los servicios REST.

Su responsabilidad principal es:

* construir las solicitudes HTTP;
* enviar los datos requeridos;
* incluir las credenciales de sesión;
* procesar las respuestas;
* centralizar el tratamiento general de errores HTTP;
* proporcionar una interfaz de acceso a las operaciones del backend.

La lógica de negocio y la autorización definitiva permanecen en el backend. El frontend consume los servicios disponibles y adapta sus respuestas para utilizarlas dentro de la interfaz.

---


# 11. Validaciones y manejo de errores

Sí. En el **punto 11** conviene separar claramente dos cosas que en tu frontend están relacionadas, pero no cumplen la misma función: **validación preventiva en el cliente** y **manejo de errores provenientes del backend**.

Con el código que pasaste, lo redactaría así:

---

# 11. Validaciones y manejo de errores

El frontend implementa mecanismos de validación y manejo de errores para proporcionar retroalimentación al usuario y evitar solicitudes innecesarias al backend.

Estas validaciones tienen carácter preventivo y de usabilidad. **No sustituyen las validaciones ni las reglas de negocio implementadas en el backend**, que permanecen como autoridad para validar la información recibida.

## Validación de datos

Las validaciones de formularios se implementan principalmente mediante **Zod**, utilizando esquemas definidos en `utils/validations.js`.

Entre las validaciones implementadas se encuentran:

* formato de correo electrónico;
* campos obligatorios;
* longitud mínima de contraseña;
* roles permitidos;
* existencia de un archivo;
* tamaño máximo de archivos;
* extensiones permitidas;
* formatos de archivos Excel.

Los esquemas se utilizan junto con el hook `useValidation`, que centraliza el resultado de la validación y transforma los errores de Zod en una estructura que puede ser utilizada por la interfaz.

El flujo general es:

```text
Datos introducidos por el usuario
            │
            ▼
       Zod Schema
            │
       ┌────┴────┐
       │         │
     Válido    Inválido
       │         │
       ▼         ▼
   continuar   errores
   operación   en UI
```

### Validación de archivos

Los archivos se validan antes de enviarse al backend.

Para documentos asociados a tareas se controla, entre otros aspectos:

* existencia del archivo;
* tamaño máximo de 10 MB;
* extensión permitida.

Para las plantillas utilizadas por el sistema se valida que el archivo corresponda a un formato Excel compatible.

Estas validaciones reducen errores derivados de la selección de archivos incorrectos y proporcionan una respuesta inmediata al usuario.

## Validación específica de componentes

Además de los esquemas Zod, algunos componentes realizan validaciones directamente sobre los datos seleccionados.

Por ejemplo, `FileUploader` verifica la extensión del archivo al producirse el evento de selección:

```text
Seleccionar archivo
       │
       ▼
Comprobar extensión
       │
   ┌───┴───┐
   │       │
Válido   Inválido
   │       │
   ▼       ▼
Guardar   Mostrar
archivo   error
```

Esto permite impedir que el usuario intente enviar archivos que la interfaz ya identifica como incompatibles.

## Manejo de errores de la API

Las solicitudes realizadas mediante `services/api.js` utilizan `handleResponse()` para centralizar el tratamiento de las respuestas HTTP.

Las respuestas exitosas se procesan normalmente, mientras que las respuestas de error se convierten en excepciones para que puedan ser gestionadas por el componente o mecanismo correspondiente.

```text
Solicitud
   │
   ▼
Backend
   │
   ▼
handleResponse()
   │
   ├── Éxito → datos
   │
   └── Error
        │
        ├── 401 → gestión de sesión
        │
        └── otros → Error
```

Esto evita que cada servicio tenga que implementar individualmente la lógica básica para interpretar las respuestas del backend.

## Errores de autenticación y sesión

Las respuestas `401` reciben un tratamiento específico.

Cuando el backend indica que la sesión ha expirado o ha sido revocada, `handleResponse()` genera el evento `session:expired`, que posteriormente es gestionado por `AuthContext`.

El flujo permite:

* limpiar el contexto local;
* informar al usuario;
* cerrar el estado de autenticación del frontend;
* redirigir a la pantalla de inicio de sesión.

Este mecanismo se encuentra documentado con mayor detalle en la sección **9. Gestión de estado y sesión**.

## Errores funcionales y de comunicación

Los errores que no corresponden a una invalidación de sesión se transforman en objetos `Error` utilizando el mensaje proporcionado por el backend cuando está disponible.

Los componentes pueden posteriormente mostrar estos errores mediante los mecanismos de retroalimentación de la interfaz, principalmente:

* mensajes de error dentro de formularios;
* alertas de SweetAlert2;
* mensajes específicos para operaciones de carga;
* mensajes asociados a errores de conexión.

Por ejemplo, una operación de carga puede distinguir entre:

```text
Carga de archivo
      │
      ▼
   fetch()
      │
 ┌────┴─────┐
 │          │
Éxito      Error
 │          │
 ▼          ▼
Mensaje   mensaje
éxito     de error
```

## Diferenciación de responsabilidades

La validación se distribuye entre ambos extremos de la aplicación:

| Validación / control                  |    Frontend   | Backend |
| ------------------------------------- | :-----------: | :-----: |
| Formato de campos                     |       ✓       |    ✓    |
| Campos requeridos                     |       ✓       |    ✓    |
| Extensión de archivos                 |       ✓       |    ✓    |
| Tamaño de archivo                     |       ✓       |    ✓    |
| Autenticación                         |       —       |    ✓    |
| Autorización                          | Navegación UI |    ✓    |
| Reglas de negocio                     |       —       |    ✓    |
| Integridad de la información          |       —       |    ✓    |
| Asociación del recurso con el usuario |       —       |    ✓    |

El frontend utiliza las validaciones como una primera barrera para mejorar la experiencia de usuario y evitar solicitudes evidentemente inválidas. El backend vuelve a validar la información recibida antes de ejecutar las operaciones correspondientes.

---

# 12. Flujo funcional

Sí. En el **punto 12** ya no conviene describir archivos o tecnologías, sino **qué hace el usuario y qué papel desempeña el frontend en cada proceso**.

Con todo el código que compartiste, propondría esta versión:

---

# 12. Flujo funcional

El frontend implementa la interfaz mediante la cual los usuarios interactúan con los procesos principales del sistema. Los flujos se encuentran condicionados por el estado de autenticación y el rol del usuario, mientras que las operaciones y validaciones definitivas son ejecutadas por el backend.

## 12.1 Registro e inicio de sesión

El usuario puede crear una cuenta y posteriormente iniciar sesión mediante las pantallas correspondientes.

```text
Registro
   │
   ▼
Formulario
   │
   ▼
Validación de datos
   │
   ▼
API
   │
   ▼
Backend
   │
   ▼
Cuenta creada
   │
   ▼
Login
   │
   ▼
Validación de credenciales
   │
   ▼
Sesión
   │
   ▼
Dashboard según rol
```

El frontend valida previamente los datos introducidos y posteriormente envía la información al backend.

Una vez completada la autenticación, `AuthContext` actualiza el estado de la aplicación y permite que las rutas privadas determinen qué sección puede consultar el usuario.

---

## 12.2 Navegación según rol

Una vez autenticado, el usuario es dirigido a las funcionalidades correspondientes a su rol.

El frontend utiliza `PrivateRoutes` para restringir el acceso a determinadas pantallas:

```text
Usuario autenticado
        │
        ▼
    PrivateRoute
        │
        ▼
      Rol
        │
 ┌──────┼──────────┐
 │      │          │
ADMIN UPLOADER DOWNLOADER
 │      │          │
 ▼      ▼          ▼
Admin  Dashboard  My Tasks
Monitor Upload
```

Estas restricciones controlan la navegación de la interfaz. La autorización definitiva de las operaciones y de los recursos consultados permanece en el backend.

---

## 12.3 Gestión de plantillas

Los usuarios con permisos correspondientes pueden interactuar con las plantillas utilizadas para definir los documentos requeridos.

El flujo general desde la interfaz es:

```text
Seleccionar plantilla Excel
          │
          ▼
Validación del archivo
          │
          ▼
Datos de plantilla
          │
          ▼
API
          │
          ▼
Backend
          │
          ▼
Procesamiento y validación
          │
          ├── Correcto
          │      ↓
          │   Plantilla disponible
          │
          └── Error
                 ↓
          Resultado informado al usuario
```

La interfaz permite iniciar la carga y comunicar el resultado de la operación, mientras que el procesamiento de la plantilla y la validación de sus reglas corresponden al backend.

---

## 12.4 Asignación y carga de documentos

Las plantillas pueden utilizarse para asignar tareas a los usuarios responsables de proporcionar los documentos.

El flujo general es:

```text
Plantilla
    │
    ▼
Asignación
    │
    ▼
Usuario asignado
    │
    ▼
Consulta de tareas
    │
    ▼
Selección del documento
    │
    ▼
Validación en frontend
    │
    ▼
FormData
    │
    ▼
API
    │
    ▼
Backend
```

El frontend proporciona la interfaz para seleccionar y enviar los archivos, además de realizar validaciones preventivas sobre ellos.

El backend determina si el archivo puede asociarse realmente con la tarea y ejecuta las validaciones y operaciones correspondientes.

---

## 12.5 Revisión de documentos

Los documentos enviados pueden pasar por un proceso de revisión.

```text
Documento cargado
       │
       ▼
Consulta de documentos
       │
       ▼
Revisión
       │
   ┌───┴────┐
   │        │
Aprobado  Rechazado
   │        │
   ▼        ▼
Continúa   Corrección
proceso     requerida
```

La interfaz permite presentar la información necesaria para la revisión y enviar la decisión correspondiente al backend.

El cambio de estado y las reglas asociadas al proceso son responsabilidad del backend.

---

## 12.6 Generación y descarga de paquetes

Cuando el proceso correspondiente ha sido completado, el usuario puede solicitar la generación o descarga del paquete de documentos.

```text
Documentos aprobados
        │
        ▼
Solicitud de descarga
        │
        ▼
API
        │
        ▼
Backend
        │
        ▼
Archivo ZIP
        │
        ▼
Blob
        │
        ▼
Descarga desde el navegador
```

El frontend recibe la respuesta binaria y la procesa como `Blob` para permitir su descarga.

La organización de los documentos, generación de la estructura de directorios, creación del archivo ZIP y generación de las firmas SHA-256 corresponden al backend.

---

## 12.7 Monitoreo administrativo

Los usuarios con rol `ADMIN` disponen de una pantalla de monitoreo que concentra información relacionada con las plantillas y el estado del proceso.

```text
Administrador
      │
      ▼
/admin/monitor
      │
      ├── Plantillas
      │
      ├── Estadísticas
      │
      └── Auditoría
```

La interfaz consulta la información mediante los servicios correspondientes y la presenta mediante componentes específicos de administración.

Las operaciones de consulta y las restricciones de acceso a la información son determinadas por el backend.

---

## 12.8 Manejo de errores y sesión durante los flujos

Los flujos funcionales pueden ser interrumpidos cuando el backend devuelve un error o cuando la sesión deja de ser válida.

```text
Operación
    │
    ▼
Backend
    │
    ├── Éxito → continuar flujo
    │
    └── Error
          │
          ├── Error funcional → mostrar información
          │
          └── 401 → invalidar sesión
                         │
                         ▼
                      /login
```

De esta forma, el frontend adapta la respuesta del backend a una interacción comprensible para el usuario sin asumir responsabilidades propias del procesamiento o autorización del servidor.

---

# 13. Seguridad del cliente

La seguridad del frontend se plantea como una **capa complementaria a los controles implementados en el backend**. Las restricciones realizadas en el navegador no se consideran mecanismos suficientes para proteger los recursos del sistema.

### Gestión de sesión

La sesión utiliza cookies gestionadas por el backend. El frontend realiza las solicitudes autenticadas utilizando:

```javascript
credentials: 'include'
```

La aplicación también utiliza una cookie de contexto accesible desde JavaScript para disponer de información no sensible necesaria para adaptar la interfaz, como el rol, nombre, `sid` y otros datos de contexto.

La información utilizada para adaptar la interfaz no se considera una fuente confiable para autorizar operaciones sobre los recursos.

### Control de acceso en la interfaz

Las rutas protegidas utilizan los roles disponibles en el contexto de autenticación para limitar el acceso a determinadas pantallas.

Por ejemplo:

* `ADMIN` puede acceder a las funciones administrativas;
* `UPLOADER` puede acceder a las funciones relacionadas con la carga;
* `DOWNLOADER` puede acceder a sus tareas.

Si un usuario intenta acceder desde el frontend a una ruta que no corresponde a su rol, se redirige a la pantalla correspondiente.

Estas restricciones tienen únicamente alcance de **interfaz y navegación**. La autorización efectiva de las operaciones y recursos es responsabilidad del backend.

### Validación de archivos

El frontend limita inicialmente los archivos que pueden seleccionarse de acuerdo con las extensiones permitidas por la aplicación y, mediante los esquemas correspondientes, puede validar también restricciones como el tamaño máximo.

Estas restricciones mejoran la experiencia de usuario y evitan solicitudes que claramente no cumplen los requisitos conocidos.

### Validación de entradas

Zod permite validar determinados datos directamente en el navegador antes de enviarlos al backend.

Estas validaciones tienen como finalidad principal:

* proporcionar retroalimentación inmediata;
* reducir solicitudes inválidas;
* mejorar la experiencia de usuario;
* evitar errores previsibles durante la interacción.

No constituyen un mecanismo de seguridad suficiente, ya que cualquier validación ejecutada en el cliente puede ser modificada o eludida. Por este motivo, las solicitudes son nuevamente validadas y autorizadas por el backend.

### Manejo de sesiones inválidas

Las respuestas `401` provenientes del backend son procesadas centralmente para detectar sesiones expiradas o revocadas, limpiar el contexto local y solicitar al usuario que vuelva a autenticarse.

### Metadata

Las páginas pueden establecer metadatos mediante `React Helmet Async`. En las vistas que corresponda se puede utilizar `noindex, nofollow` para evitar su indexación por motores de búsqueda.

---

# 14. Pruebas y validaciones

La versión actual utiliza principalmente pruebas **funcionales y manuales** para verificar el comportamiento de la aplicación.

Entre los escenarios considerados se encuentran:

* inicio de sesión;
* cierre de sesión;
* expiración de sesión;
* revocación de sesión;
* permisos según rol;
* navegación entre pantallas;
* carga de archivos;
* validación de extensiones;
* validación del tamaño de archivos;
* descargas;
* tratamiento de errores de API;
* comportamiento cuando el backend no está disponible.

La incorporación de pruebas automatizadas queda contemplada como una evolución posterior del proyecto.

---

# 15. Configuración y ejecución

Las principales operaciones disponibles para ejecutar el proyecto son:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

La URL del backend se configura mediante la variable de entorno `VITE_API_URL`.

El valor de esta variable depende del entorno donde se ejecute la aplicación:

```env
# Local
VITE_API_URL=http://localhost:3000

# Desarrollo en servidor
# VITE_API_URL=

# Producción
# VITE_API_URL=
```

Los valores concretos para los entornos de servidor deben establecerse de acuerdo con la infraestructura utilizada.

### Configuración de Vite

Durante el desarrollo se utiliza:

```javascript
server: {
    port: 3000,
    host: true
}
```

El puerto `3000` establece el puerto utilizado por el servidor de desarrollo de Vite.

La configuración `host: true` permite que el servidor de desarrollo sea accesible desde interfaces de red distintas de `localhost`, lo que resulta útil en determinados escenarios de desarrollo y para realizar pruebas desde otros dispositivos o configuraciones de red.

### Nodemon

`nodemon` se mantiene como dependencia de desarrollo debido a una particularidad del entorno utilizado para desarrollar el proyecto.

El proyecto se trabaja utilizando volúmenes en macOS, donde se presentaron problemas con la detección de cambios de archivos y la recarga automática durante el desarrollo con Vite.

En consecuencia, Nodemon se utiliza como mecanismo auxiliar para reiniciar el proceso de desarrollo cuando se detectan cambios.

No constituye un requisito funcional de la aplicación ni es necesario para ejecutar la aplicación construida para producción.

---

# 16. Limitaciones, aprendizajes y evolución

### MVP / versión actual

La versión actual corresponde a un **MVP funcional**, cuyo objetivo principal es demostrar el flujo operativo del sistema y la integración entre el frontend y el backend.

La interfaz permite ejecutar las operaciones principales del sistema, aunque todavía existen aspectos de arquitectura, experiencia de usuario y presentación que pueden evolucionar.

### Versión 2 — Compatibilidad y corrección técnica

La siguiente versión estará orientada principalmente a mantener la compatibilidad con la evolución del backend y corregir inconsistencias identificadas durante el desarrollo del MVP.

Entre los cambios previstos se encuentran:

* adaptación a cambios en la API;
* actualización de endpoints;
* adaptación a modificaciones en las validaciones;
* corrección de inconsistencias arquitectónicas;
* refactorización de componentes y responsabilidades cuando sea necesario.

El objetivo de esta versión no es remodelar la aplicación, sino **mantener y estabilizar la implementación existente frente a la evolución del backend**.

### Versión 3 — Evolución funcional y de producto

Una tercera versión podría abordar cambios de mayor alcance en la interfaz y en la experiencia de uso, dependiendo de las necesidades identificadas durante la evolución del proyecto.

Entre las posibilidades consideradas se encuentran:

* separación o reorganización de pantallas;
* reorganización de componentes;
* incorporación de funcionalidades adicionales;
* mejoras de experiencia de usuario;
* incorporación de branding;
* adaptación de la interfaz para una eventual comercialización.

Estos cambios se mantienen como posibilidades futuras y no forman parte del alcance actual del MVP.