# Documentación del proyecto — Backend

## Índice

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Objetivo](#2-objetivo)
3. [Problema que resuelve](#3-problema-que-resuelve)
4. [Alcance](#4-alcance)
5. [Stack tecnológico](#5-stack-tecnológico)
6. [Arquitectura](#6-arquitectura)
7. [Separación de responsabilidades](#7-separación-de-responsabilidades)
8. [Flujo funcional](#8-flujo-funcional)
9. [Modelo de datos](#9-modelo-de-datos)
10. [Seguridad](#10-seguridad)
11. [Auditoría y trazabilidad](#11-auditoría-y-trazabilidad)
12. [Pruebas y validaciones](#12-pruebas-y-validaciones)
13. [Limitaciones, aprendizajes y evolución](#13-limitaciones-aprendizajes-y-evolución)

---

# File Renamer / Document Management System

## 1. Descripción del proyecto

**¿Qué es?**

Sistema web para gestionar la carga, organización y validación de documentos a partir de una plantilla Excel que define las reglas de nombres y directorios requeridos.

El sistema permite asignar tareas de carga de documentos a usuarios, recibir los archivos correspondientes, validar su cumplimiento con las reglas definidas y autorizar o rechazar cada documento.

Cuando los documentos requeridos han sido aprobados, el sistema puede generar un archivo `.zip` con la estructura de directorios y los archivos definidos en la plantilla.

El archivo generado incluye:

* Los documentos organizados de acuerdo con la estructura indicada en la plantilla.
* Un archivo con las firmas digitales SHA-256 de los documentos incluidos.
* La estructura de directorios definida en la plantilla.

---

## 2. Objetivo

**¿Qué quería conseguir desarrollándolo?**

Desarrollar una aplicación MERN que permita gestionar el proceso de preparación y validación de documentos mediante una separación de responsabilidades basada en roles.

### ADMIN

Permite:

* Consultar los registros de auditoría.
* Supervisar las asignaciones de tareas.
* Supervisar los documentos cargados.
* Realizar operaciones administrativas o correcciones cuando sea necesario.
* Descargar el resultado final con los archivos procesados.

El ADMIN tiene capacidades de supervisión y administración, pero no representa al responsable funcional de aprobar los documentos.

### UPLOADER

Es responsable de iniciar y gestionar una solicitud:

* Cargar la plantilla Excel que define los documentos requeridos.
* Consultar los documentos asociados a la solicitud.
* Autorizar o rechazar los documentos cargados por el DOWNLOADER.
* Descargar el resultado final cuando el proceso puede completarse.

### DOWNLOADER

Es responsable de ejecutar las tareas que le fueron asignadas:

* Consultar las tareas que tiene asignadas.
* Cargar los documentos correspondientes a cada tarea.
* Consultar el estado de los documentos que ha cargado.

---

## 3. Problema que resuelve

**¿Qué problema aborda?**

Cuando un proceso requiere preparar un conjunto de documentos siguiendo una estructura específica de nombres y directorios, realizar esta tarea manualmente puede provocar errores de organización, nomenclatura y selección de archivos.

El sistema automatiza parte de este proceso mediante una plantilla que define los documentos requeridos y su ubicación dentro de la estructura final.

De esta forma, permite:

* Definir previamente los documentos requeridos.
* Distribuir su carga entre diferentes usuarios.
* Asociar cada archivo con una tarea específica.
* Validar y autorizar los documentos entregados.
* Generar una estructura final consistente con la plantilla.

---

## 4. Alcance

**¿Qué hace y qué no hace esta versión?**

La primera versión del sistema contempla:

* Carga de plantillas Excel para definir los documentos requeridos.
* Procesamiento de plantillas de hasta 15 documentos por solicitud.
* Tamaño máximo de archivo de 10 MB.
* Validación de la estructura definida en la plantilla.
* Gestión de documentos con las siguientes extensiones:

  * `.pdf`
  * `.docx`
  * `.png`
  * `.jpg`
  * `.jpeg`
* Asignación de tareas a usuarios.
* Carga de documentos asociados a tareas específicas.
* Autorización o rechazo de documentos.
* Registro de eventos relevantes del sistema.
* Generación del paquete final en formato `.zip`.

---

## 5. Stack tecnológico

### Backend

* **Node.js** — entorno de ejecución del backend.
* **Express.js 5** — framework para la construcción de la API REST.
* **Mongoose** — modelado y acceso a MongoDB.
* **JWT (jsonwebtoken)** — autenticación mediante tokens.
* **bcrypt** — hash de contraseñas.
* **Multer** — recepción y procesamiento de archivos mediante `multipart/form-data`.
* **XLSX (SheetJS)** — lectura y procesamiento de plantillas Excel.
* **Express Validator** — validación de datos de entrada.
* **CORS** — configuración de políticas de acceso entre frontend y backend.
* **Cookie Parser** — procesamiento de cookies HTTP.
* **Helmet** — configuración de cabeceras HTTP relacionadas con seguridad.
* **Express Rate Limit** — limitación de solicitudes para reducir abuso y ataques de fuerza bruta.
* **UA Parser** — análisis de información del `User-Agent`.

### Configuración

La aplicación utiliza dos mecanismos de configuración con responsabilidades diferentes:

* **Variables de entorno:** se encuentran definidas en el archivo .env ubicado en la raíz del backend. Contienen parámetros dependientes del entorno de ejecución, como conexiones a MongoDB, secretos, puerto, URL del cliente, duración de sesiones y rutas de almacenamiento.

* **Configuración funcional:** se almacena en la colección Settings de MongoDB. Contiene reglas relacionadas con el procesamiento de archivos y plantillas, como extensiones permitidas, caracteres no permitidos, límites de procesamiento y reglas de normalización.

Durante el arranque, el servidor intenta obtener la configuración activa desde Settings. La aplicación contempla valores predeterminados cuando no existe una configuración activa en la base de datos.

### Procesamiento de archivos

* **Archiver** — generación del archivo `.zip` final.
* **FS Extra** — operaciones sobre archivos y directorios.
* **UUID** — generación de identificadores únicos utilizados por la aplicación.

### Documentación y configuración

* **Swagger UI Express** — exposición de la documentación de la API.
* **dotenv** — gestión de variables de entorno.
* **js-yaml** — procesamiento de archivos YAML.

### Herramientas de desarrollo

* **Nodemon** — reinicio automático del servidor durante el desarrollo.

### Persistencia

* **MongoDB** — almacenamiento de usuarios, solicitudes, asignaciones, configuración y registros de auditoría.

---

## 6. Arquitectura

**¿Cómo está estructurado el sistema y por qué?**

La aplicación se desarrolló buscando separar las diferentes responsabilidades del sistema, evitando concentrar la lógica de negocio, el acceso a datos y el manejo de las peticiones HTTP en un mismo lugar.

La arquitectura organiza el código según la función que desempeña cada componente. De esta forma, una petición puede seguir un flujo definido desde su entrada mediante HTTP, pasando por las validaciones y la lógica del proceso, hasta el acceso a la base de datos y la generación de la respuesta.

Entre las principales responsabilidades separadas se encuentran:

* **Infraestructura:** configuración y recursos necesarios para ejecutar la aplicación.
* **HTTP:** recepción de peticiones y construcción de respuestas.
* **Validación:** comprobación de los datos recibidos antes de ejecutar las operaciones.
* **Servicios:** operaciones y reglas reutilizables del sistema.
* **Flujos de trabajo:** coordinación de las operaciones necesarias para completar un proceso.
* **Acceso a datos:** consultas y operaciones sobre MongoDB.
* **DAO y DTO:** separación entre la obtención de información y los datos que se exponen al resto de la aplicación.
* **Auditoría:** registro de las operaciones relevantes realizadas por los usuarios.

El objetivo de esta organización fue reducir la dependencia entre componentes y facilitar la comprensión, modificación y mantenimiento del código.

Esta arquitectura corresponde a la primera versión del proyecto. Durante su desarrollo se identificaron oportunidades para mejorar la distribución de responsabilidades y reducir aún más el acoplamiento entre componentes, las cuales forman parte de la evolución prevista para una siguiente versión.

---

# 7. Separación de responsabilidades

**¿Cómo se distribuyen las responsabilidades dentro del sistema?**

La aplicación distribuye las responsabilidades entre diferentes componentes para evitar concentrar el procesamiento de las peticiones, la lógica de negocio, el acceso a datos y la generación de respuestas en un mismo lugar.


### Comunicación HTTP


#### Routes

Define los puntos de entrada de la API y relaciona cada endpoint con la operación correspondiente.

#### Middleware

Interviene en el procesamiento de las peticiones HTTP para ejecutar controles previos a la operación, como autenticación, autorización, validaciones, limitación de solicitudes, cabeceras de seguridad y procesamiento de archivos.

#### Controller

Actúa como intermediario entre la petición HTTP, el flujo de trabajo y la respuesta HTTP. Recibe los datos de la petición, inicia el proceso correspondiente y entrega el resultado al mecanismo encargado de construir la respuesta.

#### Governance

Centraliza y estandariza la construcción de las respuestas HTTP y de sus cuerpos, evitando que cada operación tenga que definir su propia estructura de respuesta.


### Procesamiento


#### Workflow

Define el flujo de ejecución de cada operación. Coordina las validaciones, consultas y acciones necesarias para completar una tarea.

#### Executions

Organiza las operaciones específicas por entidad o funcionalidad, permitiendo dividir los procesos utilizados por los diferentes flujos de trabajo.

#### Services

Contiene operaciones de mayor complejidad que requieren procesamiento adicional y que pueden ser reutilizadas por diferentes partes del sistema.

### Acceso y transformación de datos

#### Query

Agrupa las consultas necesarias para obtener información de la base de datos, organizadas según el modelo o funcionalidad que las utiliza.

#### DAO — Data Access Object

Centraliza las interacciones con MongoDB y proporciona una separación entre la lógica de la aplicación y la implementación concreta del acceso a datos.

#### DTO — Data Transfer Object

Define los datos que serán transferidos como resultado de una operación, permitiendo exponer únicamente la información necesaria y evitar la exposición directa de los modelos internos.

#### Models

Representa las estructuras de datos utilizadas por el sistema y su relación con los documentos almacenados en MongoDB.

### Funciones auxiliares e infraestructura

#### Utils

Contiene funciones auxiliares reutilizables, como generación de identificadores, procesamiento y revisión de archivos, manejo de nombres de archivos, registro de auditoría y operaciones relacionadas con archivos.

Dentro de estas utilidades también se encuentra el procesamiento de las plantillas Excel, utilizado para extraer la estructura requerida, construir el mapa de renombrado y normalizar los nombres de los archivos.

#### Config

Centraliza configuraciones necesarias para el funcionamiento de la aplicación, como la conexión con la base de datos y parámetros generales del sistema.

#### Uploads

Directorio utilizado para almacenar temporalmente o procesar los archivos recibidos por la aplicación.

#### Docs

Contiene la documentación de la API REST generada mediante Swagger/OpenAPI.

#### Test

Contiene las pruebas utilizadas para comprobar el funcionamiento de las diferentes funcionalidades del sistema.

---

# 8. Flujo funcional

**¿Cómo funciona el sistema de principio a fin?**

El sistema utiliza tres roles principales: ADMIN, UPLOADER y DOWNLOADER. Cada rol dispone de diferentes funcionalidades de acuerdo con las responsabilidades asignadas dentro del proceso.

Los usuarios son registrados inicialmente con el rol DOWNLOADER. Para asignar los roles UPLOADER o ADMIN es necesario realizar una modificación administrativa del usuario.

## ADMIN

El ADMIN tiene funciones de supervisión y administración del sistema.

### Consultar la bitácora de auditoría

Inicio de sesión
→ Dashboard de auditoría
→ Consulta de registros

El sistema permite consultar los eventos registrados durante la operación de la aplicación.

### Filtrar registros de auditoría

Desde el dashboard de auditoría es posible filtrar y ordenar los registros por:

* Usuario.
* Tipo de actividad.
* Rango de fechas.
* Rol.

### Supervisar tareas

Inicio de sesión
→ Dashboard de tareas
→ Consulta y filtrado de solicitudes

El ADMIN puede consultar las tareas existentes y filtrarlas por criterios como:

* Nombre de la tarea.
* Documentos pendientes de revisión.
* Tareas completadas.
* Tareas canceladas.

### Supervisar documentos

Inicio de sesión
→ Dashboard de tareas
→ Selección de tarea
→ Consulta del documento
→ Descarga del documento

El ADMIN puede consultar los documentos asociados a las tareas para realizar funciones de supervisión o corrección administrativa.

### Cancelar una tarea

Inicio de sesión
→ Dashboard de tareas
→ Selección de tarea
→ Cancelación de la tarea

---

## UPLOADER

El UPLOADER es responsable de iniciar la solicitud y autorizar los documentos entregados para dicha solicitud.

### Crear una solicitud

Inicio de sesión
→ Dashboard de tareas
→ Descarga de plantilla Excel
→ Carga de plantilla Excel
→ Validación de la plantilla

El sistema procesa la plantilla y verifica que su estructura y contenido cumplan las reglas establecidas.

Si la plantilla es válida y cumple con las restricciones definidas por el sistema, se genera la solicitud y sus tareas correspondientes.

### Asignar tareas

Una vez creada la solicitud, el UPLOADER puede asignar las tareas de carga a los usuarios que participarán en el proceso.

### Revisar documentos

Inicio de sesión
→ Dashboard de tareas
→ Selección de solicitud
→ Selección de documento
→ Descarga del documento

El UPLOADER puede consultar y descargar los documentos entregados para verificar que correspondan con los documentos solicitados.

### Autorizar o rechazar documentos

Inicio de sesión
→ Dashboard de tareas
→ Selección de solicitud
→ Selección de documento
→ Autorizar / Rechazar

El UPLOADER determina si el documento entregado cumple con lo solicitado.

En caso de rechazo, puede registrar un comentario indicando el motivo.

### Consultar tareas

Desde el dashboard es posible filtrar las solicitudes por:

* Nombre de la tarea.
* Documentos pendientes de revisión.
* Tareas completadas.
* Tareas canceladas.

### Cancelar una tarea

Inicio de sesión
→ Dashboard de tareas
→ Selección de tarea
→ Cancelación de la tarea

### Generar el resultado final

Cuando los documentos requeridos han sido autorizados, el UPLOADER puede generar y descargar el archivo `.zip` correspondiente a la solicitud.

El archivo contiene los documentos organizados de acuerdo con la estructura definida en la plantilla y el archivo de firmas SHA-256.

---

## DOWNLOADER

El DOWNLOADER es responsable de ejecutar las tareas que le fueron asignadas mediante la carga de los documentos requeridos.

### Consultar tareas asignadas

Inicio de sesión
→ Dashboard de tareas asignadas
→ Consulta de tareas pendientes

El usuario puede consultar las tareas que le fueron asignadas.

### Cargar un documento

Inicio de sesión
→ Dashboard de tareas asignadas
→ Selección de tarea
→ Selección del documento requerido
→ Carga del archivo

El documento queda asociado a la tarea específica para su posterior autorización.

### Consultar un documento cargado

Inicio de sesión
→ Dashboard de tareas asignadas
→ Selección de tarea
→ Selección del documento
→ Descarga del documento

El DOWNLOADER puede consultar el documento que ha cargado.

### Consultar el resultado de la autorización

Inicio de sesión
→ Dashboard de tareas asignadas
→ Selección de tarea
→ Consulta del estado del documento

El sistema permite conocer si el documento se encuentra:

* Pendiente de autorización.
* Autorizado.
* Rechazado.

Cuando un documento es rechazado, el DOWNLOADER puede consultar el comentario registrado por el UPLOADER para conocer el motivo del rechazo.

En caso de requerir correcciones, el documento puede volver a cargarse o la solicitud puede cancelarse.

---

# 9. Modelo de datos

**¿Qué información necesita el sistema y cómo se relaciona?**

### Decisiones de modelado

El modelo de datos aprovecha la naturaleza documental de **MongoDB** para mantener información relacionada dentro de las entidades que participan directamente en el flujo.

En lugar de separar cada documento físico en una colección independiente, las plantillas mantienen las reglas de los documentos requeridos y las asignaciones mantienen el estado, metadatos, ubicación y firma de los archivos entregados.

Esto reduce la cantidad de relaciones necesarias y permite consultar información del proceso mediante estructuras documentales más completas.

Las principales colecciones son:

* `Users` — usuarios y roles del sistema.
* `Templates` — solicitudes y plantillas Excel cargadas por los usuarios.
* `Assignments` — tareas individuales derivadas de una plantilla y los documentos entregados para resolverlas.
* `Audits` — bitácora de eventos relevantes del sistema.
* `Settings` — configuración general utilizada para validar archivos y plantillas.

El modelo busca mantener separadas las responsabilidades de cada tipo de información, evitando almacenar todos los datos del proceso en una única colección.

### 9.1 Usuarios (`Users`)

Almacena la información necesaria para identificar y controlar el acceso de los usuarios.

Contiene:

* Identificador interno (`rid`).
* Identificador utilizado por las operaciones del sistema (`sid`).
* Correo electrónico.
* Nombre.
* Rol (`ADMIN`, `UPLOADER` o `DOWNLOADER`).
* Información interna relacionada con la sesión y contexto de seguridad.
* Fechas de vigencia del registro.

La contraseña y otros datos sensibles no se exponen mediante las respuestas JSON del modelo.

### Relaciones

Los usuarios se relacionan con otras colecciones mediante su `sid`:

* `Templates.uploadedBy` → usuario que creó la solicitud.
* `Templates.assignedTo` → usuario asignado a la solicitud.
* `Assignments.assignedTo` → usuario responsable de una tarea.
* `Audits.userId` → usuario que ejecutó una acción.

---

### 9.2 Plantillas (`Templates`)

Representa una **solicitud de procesamiento de documentos** creada a partir de una plantilla Excel.

Contiene:

* Información de la solicitud.
* Usuario que la creó.
* Usuario asignado para apoyar en la carga de documentos.
* Estado de la solicitud.
* Archivo Excel original.
* Número de documentos requeridos.
* Reglas de renombrado y organización.

Las reglas se almacenan dentro de `renamingRules`. Cada regla contiene:

```text
rowIndex
folderPath
desiredName
```

Esto permite que una misma plantilla contenga las reglas necesarias para todos los documentos de la solicitud sin crear un registro independiente por cada regla.

### Ejemplo conceptual

```text
Template

│
├── title
├── uploadedBy
├── assignedTo
├── status
├── rowCount
│
└── renamingRules
    ├── fila 2 → directorio A → documento.pdf
    ├── fila 3 → directorio B → documento.pdf
    ├── fila 4 → directorio C → documento.pdf
    └── fila 5 → directorio D → documento.pdf
```

---

### 9.3 Asignaciones (`Assignments`)

Representa una **tarea individual de carga de documentos** derivada de una plantilla.

Cada registro corresponde a una fila de `renamingRules` y, por tanto, a un documento que debe ser entregado.

Contiene:

* Identificador de la tarea.
* Usuario responsable de realizarla.
* Plantilla a la que pertenece.
* Número de fila de la plantilla.
* Estado de la tarea.
* Nombre original del archivo entregado.
* Firma SHA-256.
* Ruta física del archivo.
* Comentarios asociados al documento.
* Fecha de carga.

El vínculo entre una asignación y una plantilla se realiza mediante `templateSid`.

Además, existe una restricción de unicidad sobre:

```text
templateSid + rowIndex
```

Esto evita que una misma solicitud tenga dos asignaciones para la misma fila.

### Estados de una asignación

```text
PENDING
   ↓
UPLOADED
   ↓
APPROVED / REJECTED
```

También puede existir un estado `FAILED` para representar un fallo durante el procesamiento.

La asignación conserva los metadatos del archivo entregado, por lo que **no existe una colección independiente `Documents` en esta versión**.

---

### 9.4 Auditorías (`Audits`)

Almacena los eventos relevantes realizados dentro del sistema.

Cada registro contiene:

* Usuario que realizó la acción.
* Tipo de acción.
* Recurso afectado.
* Dirección IP.
* User-Agent.
* Información adicional de la operación.
* Fecha y hora.
* Información de vigencia del registro.

Las acciones se encuentran controladas mediante un conjunto definido de valores, por ejemplo:

```text
LOGIN
LOGOUT
UPLOAD_TEMPLATE
ASSIGN_TEMPLATE
UPLOAD_FILE
APPROVE_FILE
REJECT_FILE
GENERATE_ZIP
DOWNLOAD_ZIP
```

Esto permite reconstruir la secuencia de operaciones relevantes registradas, identificando qué ocurrió, quién realizó la operación y sobre qué recurso se realizó.

También existen índices sobre usuario, acción y fecha para facilitar las consultas de auditoría.

---

### 9.5 Configuración (`Settings`)

Almacena las reglas generales utilizadas por el sistema para controlar el procesamiento de archivos.

Entre ellas:

* Extensiones permitidas.
* Caracteres no permitidos.
* Tamaño máximo de archivo.
* Número máximo de filas de Excel.
* Reglas de normalización de nombres.

Por ejemplo:

```text
allowedExtensions
maxFileSizeMB
maxExcelRows
forbiddenChars
normalizeRules
```

Esto permite que determinadas reglas de procesamiento no tengan que estar distribuidas directamente por el código de las diferentes funcionalidades.

---

### 9.6 Relación entre las colecciones

La relación conceptual del modelo puede representarse de la siguiente manera:

```text
USERS
  │
  ├───────────────┐
  │               │
  ▼               ▼
TEMPLATES        AUDITS
  │               ▲
  │               │
  ▼               │
ASSIGNMENTS ──────┘
  │
  │
  ▼
Archivo físico
```

Y específicamente:

```text
Users

  │
  │ uploadedBy / assignedTo
  ▼
Templates

  │
  │ templateSid
  ▼
Assignments

  │
  │ filePath
  ▼
Sistema de archivos
```

Mientras que `Audits` registra las operaciones realizadas sobre estos recursos.

---

# 10. Seguridad

**¿Cómo protege el sistema la información y las operaciones?**

La aplicación incorpora controles de seguridad orientados a proteger las cuentas de usuario, las sesiones, los documentos y las operaciones realizadas sobre ellos.

### Autenticación

El acceso al sistema requiere autenticación mediante correo electrónico y contraseña.

* Las contraseñas se procesan mediante bcrypt antes de almacenarse.
* Las credenciales se validan contra el usuario registrado.
* Los campos sensibles de autenticación no se exponen mediante las respuestas normales de la API.
* El usuario se identifica operacionalmente mediante un SID, evitando utilizar directamente identificadores internos del registro.

### Gestión de sesiones

El sistema utiliza JWT para identificar la sesión, pero mantiene su estado en la base de datos mediante el campo `token` asociado al usuario.

Para que una sesión sea válida deben cumplirse las condiciones establecidas por el backend:

* El usuario debe estar autenticado.
* Debe existir un token de sesión almacenado para el usuario.
* El token presentado debe corresponder con el token registrado para ese usuario.
* La identidad y el rol contenidos en el JWT deben corresponder con el contexto autorizado de la sesión.

Esto permite que el sistema pueda invalidar una sesión desde el servidor, independientemente de que el JWT todavía no haya alcanzado su fecha de expiración.

Por ejemplo:

```text
Sesión válida
    ↓
Token almacenado en Users
    ↓
Cierre de sesión
    ↓
Token eliminado
    ↓
Sesión invalidada
```

De la misma manera, una sesión puede ser revocada administrativamente invalidando el token almacenado. Aunque el JWT continúe existiendo en el cliente, el backend ya no considera válida esa sesión.

Durante el inicio de sesión:

* Se validan las credenciales mediante bcrypt.
* Se genera un nuevo JWT.
* Se invalidan las sesiones anteriores del usuario.
* Se almacena el nuevo token asociado al usuario.
* Se registra información adicional del contexto del dispositivo.
* Las siguientes peticiones deben presentar una sesión que coincida con el estado almacenado en el servidor.

Esto proporciona una capa de control de sesión del lado servidor sobre el mecanismo stateless de JWT, permitiendo revocar sesiones sin esperar a que expire el token.

### Control de acceso

Las operaciones del sistema se encuentran condicionadas por el usuario autenticado y su rol.

Los principales roles son:

* **ADMIN:** supervisión y operaciones administrativas.
* **UPLOADER:** creación y gestión de solicitudes y aprobación de documentos.
* **DOWNLOADER:** ejecución de las tareas de carga asignadas.

El control de permisos evita que un usuario ejecute operaciones correspondientes a otro rol o manipule recursos que no tiene asignados.

Además del control de rol, las operaciones sobre tareas y documentos consideran la relación entre el usuario y el recurso. Por ejemplo, un DOWNLOADER debe estar autorizado para atender la tarea correspondiente.

### Protección de información sensible

La aplicación evita exponer información interna innecesaria mediante mapeos de respuesta.

Entre los datos que no se exponen directamente se encuentran:

* Contraseñas.
* Tokens de sesión.
* RID utilizados internamente.
* Rutas físicas de archivos.
* Otros campos internos utilizados para procesamiento o trazabilidad.

Los DTO y las transformaciones `toJSON` de los modelos actúan como una capa adicional para controlar qué información llega al cliente.

### Protección de archivos

La carga de archivos está restringida mediante reglas de validación.

La configuración del sistema contempla:

* Extensiones permitidas.
* Tamaño máximo de archivo.
* Validación de la plantilla Excel.
* Restricciones sobre nombres y caracteres.
* Validación de la estructura requerida antes de procesar los documentos.

Los archivos se almacenan fuera de la información pública del modelo y las rutas físicas no se devuelven directamente al cliente.

### Integridad de documentos

Los documentos procesados pueden identificarse mediante una firma SHA-256.

La firma se utiliza para generar un registro de integridad de los documentos incluidos en el paquete final, permitiendo posteriormente comprobar si el contenido de un archivo corresponde al contenido que fue procesado.

### Protección de la API

La aplicación incorpora mecanismos destinados a reducir el abuso de los endpoints, entre ellos:

* Limitación de solicitudes mediante `express-rate-limit`.
* Cabeceras de seguridad mediante `helmet`.
* Validación de datos de entrada mediante `express-validator`.
* Configuración de CORS.
* Manejo controlado de cookies mediante `cookie-parser`.

### Seguridad por capas

La seguridad no depende de un único mecanismo. El sistema distribuye los controles entre diferentes etapas:

```text
Petición HTTP
     ↓
Middleware
     ↓
Autenticación / autorización
     ↓
Workflow
     ↓
DAO / Query
     ↓
Persistencia
```

Esto permite que una petición no dependa únicamente de la interfaz para determinar si una operación está permitida.

---

# 11. Auditoría y trazabilidad

**¿Qué operaciones quedan registradas y cómo se puede reconstruir lo ocurrido?**

El sistema mantiene una bitácora de auditoría para registrar las principales operaciones realizadas por los usuarios y los eventos relevantes del sistema.

La bitácora permite relacionar una acción con el usuario que la realizó, el recurso afectado y el momento en que ocurrió, proporcionando información para reconstruir la secuencia de operaciones relevantes de una solicitud.

### Eventos registrados

Entre las operaciones registradas se encuentran:

* Registro de usuarios.
* Intentos de registro fallidos.
* Inicio de sesión exitoso o fallido.
* Cierre de sesión.
* Intentos de cierre de sesión fallidos.
* Eventos relacionados con intentos reiterados de acceso.
* Carga y actualización de plantillas.
* Cancelación de solicitudes.
* Asignación de tareas.
* Carga de documentos.
* Aprobación o rechazo de documentos.
* Generación del archivo `.zip`.
* Descarga del resultado final.
* Verificación de firmas SHA-256.
* Aprobación de una plantilla.

### Información asociada al evento

Cada registro de auditoría puede contener:

* Usuario que realizó la operación.
* Tipo de operación realizada.
* Identificador del recurso afectado.
* Fecha y hora del evento.
* Dirección IP.
* User-Agent del cliente.
* Información adicional relacionada con la operación.
* Versión del esquema utilizado para almacenar el evento.

Los identificadores permiten relacionar las operaciones con los recursos correspondientes, por ejemplo, una plantilla, una asignación o un usuario.

### Registro de operaciones exitosas y fallidas

La auditoría no se limita a registrar operaciones completadas correctamente.

También se registran determinados eventos que terminan en error, por ejemplo:

* `LOGIN_FAILED`
* `REGISTER_FAILED`
* `LOGOUT_FAILED`

Esto permite diferenciar entre una operación que ocurrió correctamente y un intento de operación que fue rechazado o que produjo un error.

### Consulta de la auditoría

Los usuarios con permisos administrativos pueden consultar la bitácora desde el sistema.

La información puede filtrarse por diferentes criterios, entre ellos:

* Usuario.
* Tipo de actividad.
* Rango de fechas.
* Rol.

Esto permite reducir el volumen de información y localizar eventos específicos dentro de la actividad registrada.

### Trazabilidad del proceso documental

La auditoría complementa el estado almacenado en las solicitudes y asignaciones.

Por ejemplo, el procesamiento de una solicitud puede seguir conceptualmente una secuencia como:

```text
Creación de plantilla
        ↓
Asignación de tareas
        ↓
Carga de documentos
        ↓
Aprobación / rechazo
        ↓
Generación del ZIP
        ↓
Descarga del resultado
```

Las operaciones realizadas durante este proceso pueden quedar asociadas a los usuarios y recursos correspondientes, permitiendo revisar quién realizó cada acción y cuándo.

### Objetivo de la auditoría

La bitácora tiene principalmente tres objetivos:

**1. Trazabilidad:** conocer qué ocurrió durante el procesamiento de una solicitud.

**2. Supervisión:** permitir que ADMIN revise la actividad realizada en el sistema.

**3. Investigación:** proporcionar información para analizar errores, rechazos, operaciones no esperadas o problemas durante el procesamiento.

---

# 12. Pruebas y validaciones

**¿Qué comprobé y cómo verifiqué que el sistema funciona correctamente?**

Durante el desarrollo se realizaron pruebas funcionales y de integración orientadas a comprobar el comportamiento de las principales capas del backend, el procesamiento de archivos y algunos controles de seguridad.

Las pruebas se realizaron mediante scripts de prueba ejecutados directamente sobre el código, pruebas con archivos reales y pruebas de los endpoints mediante Postman.

### Validación del procesamiento de plantillas

Se realizaron pruebas utilizando archivos Excel reales para comprobar el procesamiento de las plantillas.

Se verificó:

* Lectura correcta del archivo Excel.
* Extracción del número de filas.
* Generación de las reglas de renombrado.
* Normalización de los nombres.
* Generación del objeto utilizado para crear una plantilla.
* Generación de un SID para la plantilla.
* Procesamiento de plantillas con información incorrecta o problemática.

También se realizó una prueba de integración ejecutando el workflow completo de carga de una plantilla y verificando que la plantilla fuera creada y que las filas fueran procesadas correctamente.

### Validación de autenticación y persistencia

Se realizaron pruebas sobre diferentes niveles del flujo de autenticación.

#### Persistencia

Se comprobó la creación de usuarios directamente mediante el modelo de MongoDB, verificando la generación de identificadores y la asignación del rol.

#### Queries

Se verificó la creación de usuarios mediante las consultas de autenticación y posteriormente la recuperación de su perfil mediante las consultas correspondientes.

También se comprobó que una consulta destinada a obtener información pública no devolviera la contraseña del usuario.

#### Workflow y DTO

Se ejecutó el flujo de creación de usuario pasando por:

```text
DAO
 ↓
DTO
 ↓
Respuesta HTTP
```

y se comprobó que la respuesta final no contuviera información interna o sensible como:

* `password`
* `rid`
* `_id`

Esto permitió verificar que la separación entre los datos almacenados y los datos expuestos al cliente funcionara correctamente.

### Validación de autorización

Se realizaron pruebas utilizando diferentes usuarios y roles para verificar que las operaciones estuvieran restringidas de acuerdo con los permisos establecidos.

Se comprobó particularmente que un usuario no pudiera modificar recursos que no le correspondieran o ejecutar operaciones para las que no tuviera autorización.

Estas validaciones comenzaron mediante pruebas directas de la API con Postman y posteriormente se comprobaron durante la integración con el frontend.

### Validación de documentos

Se verificaron las restricciones relacionadas con la carga y procesamiento de documentos:

* Extensiones permitidas.
* Tamaño máximo configurado.
* Validación de la plantilla Excel.
* Estructura de los documentos requeridos.
* Asociación entre documentos y tareas.
* Estados de aprobación y rechazo.

### Validación de integridad

Se verificó el procesamiento de firmas SHA-256 para los documentos incluidos en el resultado final, con el objetivo de permitir la comprobación posterior de su integridad.

### Tipo de pruebas realizadas

| Tipo                          | Aplicación                                                 |
| ----------------------------- | ---------------------------------------------------------- |
| Pruebas de persistencia       | Creación y consulta de usuarios y plantillas               |
| Pruebas de componentes/lógica | DAO, Queries, DTO y procesamiento de Excel                 |
| Pruebas de workflow           | Ejecución de procesos completos desde el workflow          |
| Pruebas de integración        | Procesamiento de archivos y creación de plantillas         |
| Pruebas de API                | Verificación de endpoints mediante Postman                 |
| Pruebas de autorización       | Validación de roles y acceso a recursos                    |
| Pruebas de seguridad          | Verificación de que información sensible no fuera expuesta |

### Limitaciones de las pruebas

Estas pruebas fueron desarrolladas como parte del proceso de construcción y depuración del MVP. No constituyen una suite de pruebas automatizadas con cobertura formal del código.

La versión no cuenta con:

* Cobertura de código medida.
* Ejecución automatizada de pruebas en cada cambio.
* Pruebas de carga o estrés.
* Pruebas exhaustivas de todas las combinaciones de estados y roles.
* Pipeline CI dedicado a la ejecución de pruebas.

Por lo tanto, las pruebas permitieron validar los **flujos principales y controles relevantes del MVP**, pero no permiten afirmar que el sistema tenga una cobertura exhaustiva.

---

Sí. Conviene rehacerlo completo ahora que ya tenemos claro el comportamiento real del proyecto, porque el punto 13 debe cerrar la documentación sin contradecir los puntos 5, 6, 9, 10 y 12.

También quitaría algunas frases que suenan más a evaluación externa que a documentación del proyecto, como *"demostrar la capacidad de..."*. Es mejor que la propia evolución técnica lo demuestre.

Te propongo esta versión:

---

# 13. Limitaciones, aprendizajes y evolución

**¿Qué quedó pendiente, qué aprendí y qué cambiaría en una siguiente versión?**

Esta sección documenta las principales limitaciones de la versión actual, los aprendizajes obtenidos durante su desarrollo y los cambios identificados para una siguiente versión.

## Limitaciones de la versión actual

La aplicación corresponde a un MVP funcional desarrollado como primera implementación del sistema. Durante su construcción se tomaron decisiones que permitieron resolver el flujo principal, pero que pueden ser refinadas a medida que aumenten los requisitos funcionales y operativos.

Entre las principales limitaciones identificadas se encuentran:

* Las pruebas realizadas permiten comprobar los principales flujos y componentes del backend, pero no constituyen una suite automatizada con cobertura formal del código.
* No se realizaron pruebas de carga, estrés o comportamiento bajo escenarios de concurrencia elevada.
* No se cubrieron exhaustivamente todas las combinaciones posibles de roles, estados y transiciones del flujo documental.
* La distribución de responsabilidades de la arquitectura fue refinándose durante el desarrollo, por lo que algunas operaciones pueden reorganizarse o simplificarse en una siguiente versión.
* El almacenamiento de archivos utiliza el sistema de archivos local del servidor. Una implementación distribuida o de mayor escala podría requerir almacenamiento externo o compartido.
* La configuración de infraestructura y la configuración funcional tienen mecanismos diferentes. Actualmente las variables necesarias para ejecutar la aplicación se encuentran en `.env`, mientras que determinadas reglas funcionales se almacenan en `Settings`.
* La aplicación no incorpora en esta versión una estrategia completa de despliegue automatizado, observabilidad o infraestructura como código.
* La configuración funcional almacenada en `Settings` puede evolucionar hacia un mecanismo de administración más completo, incluyendo controles sobre quién puede modificarla y cómo se aplican sus cambios.

## Aprendizajes

El desarrollo permitió identificar que la separación de responsabilidades no consiste únicamente en distribuir código entre diferentes archivos o directorios. La separación requiere determinar **qué componente debe tomar cada decisión, qué información necesita para hacerlo y qué resultado debe entregar al siguiente componente**.

Entre los principales aprendizajes obtenidos se encuentran:

* Separar el procesamiento de las peticiones HTTP de la lógica necesaria para ejecutar los procesos de negocio.
* Utilizar middleware para aplicar controles previos, como autenticación, autorización, validación y limitación de solicitudes.
* Utilizar workflows para coordinar procesos compuestos sin concentrar todas las operaciones en los controllers.
* Utilizar DAO y queries para separar las operaciones de persistencia de la lógica que coordina los procesos.
* Utilizar DTO y transformaciones de los modelos para controlar la información que puede exponerse al cliente.
* Utilizar roles y estados como mecanismos para representar las diferentes responsabilidades y etapas del proceso documental.
* Identificar durante la integración con el frontend problemas que no se habían manifestado durante las pruebas directas realizadas con Postman.
* Comprender la utilidad de separar identificadores internos (`RID`) de los identificadores utilizados operacionalmente por la aplicación (`SID`).
* Comprobar que MongoDB permite mantener estructuras documentales internas más complejas, como las reglas de renombrado de una plantilla, sin necesidad de crear una colección independiente para cada documento requerido.
* Incorporar auditoría como parte del diseño del sistema para conservar información sobre las operaciones relevantes y facilitar su trazabilidad.
* Diferenciar entre **configuración de infraestructura** y **configuración funcional**. La primera pertenece al entorno donde se ejecuta la aplicación, mientras que la segunda forma parte de las reglas bajo las cuales funciona el sistema.
* Comprender que una decisión arquitectónica no solo resuelve un problema inmediato, sino que también genera consecuencias que deben considerarse durante la evolución del sistema.

## Evolución prevista — versión 2.0

La siguiente versión mantendría el objetivo funcional del MVP, pero utilizaría lo aprendido durante su desarrollo para revisar las decisiones arquitectónicas, mejorar los mecanismos de validación y reducir las limitaciones identificadas.

Entre los cambios previstos se encuentran:

### Pruebas

* Ampliar la cobertura de los flujos funcionales.
* Automatizar las pruebas existentes.
* Incorporar pruebas de integración y autorización para los diferentes roles.
* Incorporar pruebas de las transiciones de estado de plantillas y asignaciones.
* Incorporar pruebas de concurrencia, carga y comportamiento bajo condiciones de mayor demanda.
* Integrar la ejecución de pruebas en un pipeline de CI.

### Arquitectura

* Revisar la distribución de responsabilidades entre `Workflow`, `Execution`, `DAO`, `Query`, `Services` y `Utils`.
* Identificar responsabilidades que puedan simplificarse, consolidarse o trasladarse a componentes más adecuados.
* Revisar los flujos de autenticación y gestión de sesiones a partir de los problemas identificados durante la primera implementación.
* Documentar las decisiones arquitectónicas relevantes y sus consecuencias.

### Configuración

Mantener una separación explícita entre configuración de infraestructura y configuración funcional:

* Utilizar `.env` para los parámetros necesarios para ejecutar la aplicación, como conexión a MongoDB, puerto, origen del cliente, secreto de JWT y rutas de infraestructura.
* Mantener en la base de datos las reglas funcionales que puedan variar según las necesidades de operación, como límites, extensiones permitidas y reglas de procesamiento.
* Evitar que un cambio de política funcional requiera modificar el código o reconstruir el servidor.
* Incorporar mecanismos de administración y control de cambios para las configuraciones funcionales.

### Gestión de archivos

* Revisar el mecanismo de almacenamiento local.
* Evaluar almacenamiento externo o distribuido para escenarios donde varios servidores necesiten acceder a los mismos archivos.
* Reforzar las validaciones sobre los archivos recibidos y generados.
* Mejorar los mecanismos utilizados para comprobar la integridad de los archivos procesados.

### Operación y despliegue

* Incorporar una estrategia de despliegue automatizado.
* Preparar la aplicación para ejecutarse mediante contenedores.
* Incorporar mecanismos de observabilidad y monitoreo.
* Evaluar infraestructura como código para entornos que requieran despliegues reproducibles.

Sí. Viéndolo como **evolución real del proyecto**, la 2.0 no debería intentar resolver operación, CI/CD, observabilidad, contenedores, carga, etc. Eso convertiría la siguiente versión en otro proyecto.

Tiene más sentido plantear:

* **V1:** MVP funcional + arquitectura inicial.
* **V2:** consolidación arquitectónica + configuración + robustez.
* **V3:** automatización, CI/CD, observabilidad, despliegue más formal, etc.

Además, para tu portafolio te conviene dejar explícitamente algunas cosas fuera de V2. Así no parece que "faltó hacerlas", sino que **decidiste no abordarlas todavía**.

Yo reemplazaría desde **"Evolución prevista — versión 2.0"** por esto:

---

## Evolución prevista — versión 2.0

La siguiente versión se enfocaría principalmente en **consolidar la arquitectura existente y facilitar la configuración del sistema**, antes de incorporar mecanismos adicionales de automatización o infraestructura.

El objetivo sería revisar la primera implementación a partir de los problemas y decisiones identificados durante su desarrollo, manteniendo el alcance funcional principal del MVP.

### Arquitectura

* Revisar la distribución de responsabilidades entre `Workflow`, `Execution`, `DAO`, `Query`, `Services` y `Utils`.
* Identificar responsabilidades duplicadas o componentes que puedan simplificarse.
* Ajustar los límites entre las diferentes capas para que cada componente tenga una responsabilidad claramente definida.
* Revisar los flujos de autenticación, autorización y gestión de sesiones.
* Revisar las transiciones de estado de plantillas y asignaciones para garantizar que las operaciones permitidas sean consistentes con cada estado.
* Mantener la separación entre los datos internos del sistema y los datos expuestos mediante DTO y transformaciones de los modelos.

### Configuración

Una de las prioridades de la siguiente versión sería simplificar la configuración necesaria para instalar y ejecutar el sistema.

Se buscaría mantener una separación clara entre:

**Configuración de infraestructura**

Gestionada mediante `.env` y destinada a parámetros dependientes del entorno donde se ejecuta la aplicación, como:

* Entorno de ejecución.
* Puerto.
* Conexión a MongoDB.
* Origen permitido para el cliente.
* Secreto y parámetros de autenticación.
* Directorios utilizados para el almacenamiento de archivos.
* Ubicaciones de recursos necesarios para la ejecución.

**Configuración funcional**

Gestionada mediante `Settings` en MongoDB y destinada a reglas que determinan cómo funciona el procesamiento, como:

* Extensiones permitidas.
* Tamaño máximo de archivos.
* Número máximo de filas.
* Caracteres no permitidos.
* Reglas de normalización.

La separación permitiría modificar las condiciones de operación del sistema sin mezclar cambios de infraestructura con cambios en las reglas funcionales.

También se buscaría documentar de forma más clara **qué valores deben configurarse, dónde se configuran y bajo qué condiciones deben modificarse**, de manera que una nueva instalación pueda adaptarse al entorno sin necesidad de modificar el código fuente.

### Gestión de archivos

* Revisar la organización y ciclo de vida de los archivos almacenados.
* Revisar las condiciones bajo las cuales los archivos temporales, rechazados, procesados y generados deben conservarse o eliminarse.
* Mantener las rutas físicas fuera de las respuestas expuestas al cliente.
* Revisar las validaciones aplicadas a los archivos recibidos y generados.
* Evaluar posteriormente alternativas al almacenamiento local si los requisitos del sistema lo justifican.

### Pruebas

En esta versión se priorizaría **mejorar la confiabilidad de los flujos existentes** antes que ampliar considerablemente la infraestructura de pruebas.

Se buscaría:

* Consolidar las pruebas de los principales flujos.
* Añadir pruebas sobre los casos que hayan mostrado problemas durante la revisión de la primera versión.
* Reforzar las pruebas de autorización, autenticación y transiciones de estado.
* Mantener las pruebas de integración necesarias para comprobar que las diferentes capas funcionan correctamente en conjunto.

La automatización completa de las pruebas y su integración en procesos de CI/CD se dejaría para una etapa posterior.

### Documentación

* Mantener actualizada la documentación de la arquitectura respecto al código real.
* Documentar las decisiones que tengan consecuencias sobre el funcionamiento del sistema.
* Documentar los requisitos de configuración para una nueva instalación.
* Registrar los cambios arquitectónicos relevantes entre versiones.
