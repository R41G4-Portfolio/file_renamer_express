# Proyecto: Express File Renamer (Pattern-Refactor)

## 1. Arquitectura del proyecto
Este proyecto implementa una arquitectura CQS (Command Query Separation) con un enfoque funcional, evolucionada a partir de los patrones de Arquitectura de Capas (Layered Architecture). A diferencia de las implementaciones tradicionales basadas en Programación Orientada a Objetos (POO), este sistema se construye sobre la composición de funciones puras, eliminando el uso de clases y el estado compartido (this) para reducir la complejidad cognitiva y facilitar la testabilidad.
Naturaleza de la Arquitectura

La arquitectura ha sido refinada para introducir una capa de Gobernanza de Datos que separa explícitamente la Consulta (Query) del Acceso (DAO) y la Transformación (DTO). Este diseño permite un aislamiento total entre el motor de persistencia y la lógica de negocio, asegurando que el sistema sea agnóstico a los cambios en la infraestructura de datos.
¿Por qué se utilizó esta arquitectura?

La elección de este diseño responde a tres pilares fundamentales de ingeniería de software:

Seguridad por Diseño (Security by Design): La separación estricta entre RID (Resource ID) y SID (Subject ID) exige un flujo de datos controlado. Al centralizar la transformación en la capa de repository/DTO, se garantiza que los identificadores privados nunca trasciendan a las capas superiores o a la interfaz pública.

Mantenibilidad y Escalabilidad: Inspirado en la robustez de los sistemas empresariales (estilo Spring), el desacoplamiento de las consultas SQL/Mongoose en un directorio de queries independiente permite optimizar el rendimiento de la base de datos sin alterar los flujos de trabajo (executions).

Transparencia Operacional: El uso de un Response Protocol en la capa de governance elimina la ambigüedad en la comunicación entre el backend y el cliente, estandarizando cada posible salida del sistema bajo un contrato semántico único.

.
├── commands
├── config
├── controllers
├── docs
├── executions
├── governance
├── middleware
├── models
├── queries
├── repository
│   ├── DAO
│   └── DTO
├── routes
├── services
├── tests
└── utils

### Especificación de Capas y Directorios

commands/ (Administrative Interface): Implementa la lógica de gestión del sistema mediante CLI. Garantiza la ejecución de tareas administrativas críticas (ej. escalamiento de privilegios) de forma aislada al flujo de red.

config/ (System Configuration): Provee un estado inmutable de configuración. Gestiona la inyección de variables de entorno y la gobernanza de conexiones hacia servicios de infraestructura.

controllers/ (Interface Adapters): Capa de entrada encargada del manejo del protocolo HTTP. Deserializa las peticiones, delega la orquestación a la capa de ejecución y canaliza la salida mediante el protocolo de gobernanza.

docs/ (Technical Documentation & Specifications): Repositorio de la verdad técnica del proyecto. Centraliza la documentación de la API (Swagger/OpenAPI), diagramas de arquitectura, especificaciones de requisitos y manuales de gobernanza. Actúa como la referencia principal para el mantenimiento y la escalabilidad del sistema.

executions/ (Business Logic / Workflows): Núcleo de orquestación del sistema. Define los casos de uso mediante flujos de trabajo asíncronos y funcionales, coordinando la persistencia, la auditoría y el cumplimiento de reglas de negocio, Si son flujos complejo se harán en commands/.

governance/ (System Response Protocol): Registro semántico que estandariza las respuestas del sistema. Centraliza los códigos de estado y mensajes de error para asegurar una comunicación coherente y predecible.

middleware/ (Pre-processing Layers): Interceptores encargados de la validación de esquemas, integridad de tokens y control de acceso (RBAC) previo al procesamiento de la lógica de negocio.

models/ (Schema Definitions): Define la estructura formal de las entidades en el motor de persistencia, aplicando restricciones de integridad y políticas de nomenclatura (colecciones en plural).

queries/ (Data Access Layer): Contiene la lógica de consulta pura al motor de datos. Actúa como el "SQL del sistema", utilizando operaciones optimizadas (.lean()) para extraer información sin procesar.

repository/ (Data Governance & Transformation): Actúa como el mediador entre las consultas crudas y el resto del sistema.

	DAO/ (Data Access Objects): Componentes encargados de consumir las queries. Aplican la lógica de obtención y persistencia, aislando al framework del motor de base de datos.

	DTO/ (Data Transfer Objects): Capa de transformación que "objetiviza" los datos crudos. Realiza el filtrado de campos sensibles (eliminación de rid) y asegura que la data saliente cumpla con los contratos de la interfaz.

routes/ (API Topology): Define el mapa de recursos y métodos del sistema, vinculando los endpoints con sus controladores específicos.

services/ (Infrastructure Services): Abstrae la complejidad de servicios externos o módulos del sistema operativo (File System, ZIP Compression) mediante interfaces funcionales.

tests/ (Validation & Quality Assurance): Espacio dedicado a la verificación sistemática del software. Incluye pruebas unitarias de funciones puras, pruebas de integración de workflows y registros de pruebas de escritorio. Su objetivo es garantizar que cada componente cumpla con su contrato funcional antes de ser promovido a producción.

utils/ (Cross-Cutting Utilities): Biblioteca de funciones puras de propósito general, agnósticas al dominio del negocio.

## 2. Configuraciones
2. Configuraciones del Sistema

El proyecto implementa un modelo de configuración híbrido que combina persistencia en base de datos con optimización en memoria para garantizar alto rendimiento y seguridad.
### 2.1 Gobernanza de Reglas Dinámicas (Settings)

A diferencia de las configuraciones estáticas, las reglas de negocio críticas se gestionan mediante una colección dedicada en MongoDB (Settings).

	Mecanismo de Caché: Para evitar latencia y saturación de consultas a la base de datos, el sistema implementa una Caché Inicial en memoria.

	Sincronización: Esta caché se actualiza automáticamente mediante un intervalo programado, permitiendo que cambios en las reglas (ej. límites de subida, estados de mantenimiento) se propaguen al sistema sin necesidad de reiniciar el servidor.

### 2.1.1 Políticas de Integridad de Archivos
Las reglas definidas en Settings actúan como el primer firewall de la capa de persistencia:

    Sanitización Estricta: Uso de forbiddenChars y normalizeRules para prevenir inyecciones de ruta y colisiones de nombres en sistemas de archivos externos.

    Cuotas de Procesamiento: Control de carga mediante maxFileSizeMB y límites de profundidad en documentos (maxExcelRows), protegiendo la disponibilidad de los recursos de cómputo (CPU/RAM).

### 2.2 Configuración de Autenticación (/config/authConfig.js)

Centraliza las políticas de seguridad para el transporte de credenciales y la gestión de sesiones.

	Security Cookies: Define las opciones de httpOnly, secure, y sameSite para las cookies de JWT, asegurando protección contra ataques XSS y CSRF.

	Estrategia de Expiración: Configura los tiempos de vida de los tokens y las sesiones, alineados con el protocolo de gobernanza para mantener un equilibrio entre seguridad y experiencia de usuario.

### 2.3 Variables de Entorno y Entornos de Ejecución

El sistema utiliza un cargador de configuración inmutable que valida la presencia de variables críticas (JWT Secrets, MongoDB URIs) antes de permitir el levantamiento del servicio. Soporta múltiples perfiles de ejecución (development, production, test) para aislar los entornos de datos.

### 2.4 Control de Tráfico y Anti-Brute Force
El sistema integra políticas de Rate Limiting configurables para mitigar vectores de ataque automatizados:

    Umbrales Restrictivos: Se aplican límites diferenciados para endpoints críticos (ej. 2 intentos para /login y /register) frente a rutas de consulta general.

    Respuesta Inteligente: Al exceder el límite, el sistema no solo responde con un estado 429 (Too Many Requests), sino que interrumpe el procesamiento antes de ejecutar validaciones de esquema o lógica de negocio.

    Señal de Seguridad: Cada bloqueo genera una entrada automática en la bitácora de auditoría bajo la acción BRUTE_FORCE_STRIKE, permitiendo el análisis forense de IPs sospechosas.

### 2.5 Directivas de Indexación y Anti-Scraping
El sistema implementa controles de visibilidad para prevenir el mapeo automatizado de endpoints:

    Robots Exclusion Protocol: Uso de robots.txt para desautorizar el rastreo de rutas críticas (/api, /docs).

    HTTP Security Headers: Inyección de X-Robots-Tag en todas las respuestas del servidor para asegurar que los motores de búsqueda no almacenen metadatos de la estructura de la API.

### 2.6 Aislamiento de Sistema de Archivos (Anti-Enumeration)
A diferencia de los servidores tradicionales (Apache/Nginx), el sistema no implementa indexación de directorios.

    Acceso Controlado: Los recursos no estáticos se sirven mediante flujos de orquestación (Workflows), impidiendo la exploración directa de carpetas mediante el navegador.

    Denegación por Defecto: Cualquier ruta de directorio no mapeada explícitamente en la topología de la API resulta en una denegación automática (404), mitigando ataques de enumeración de recursos.

### 2.7 Gobernanza de Autenticación y Autorización (RBAC)

El sistema implementa un modelo de Control de Acceso Basado en Roles (RBAC) y sesiones de estado controlado mediante la persistencia de JWT en el modelo User.

### 2.7.1 Estrategia de Sesión y Fingerprinting

Como pilar de la gobernanza de acceso, el sistema vincula el token al contexto físico del usuario:

    Device Fingerprint: Generación de un hash único (User-Agent + IP) en cada executeLogin.

    Validación de Integridad: El middleware authenticate recrea el fingerprint en cada petición y lo contrasta con el almacenado en la base de datos. Cualquier discrepancia invalida la sesión de forma inmediata (Anti-Session Hijacking).

### 2.7.2 Capas de Protección de Rutas (Middleware Stack)

El acceso a los recursos se gestiona mediante una cadena de responsabilidad:

    Identity Guard (authenticate): Valida la presencia e integridad del JWT en las cookies, extrae el sid del usuario y verifica la vigencia de la sesión en MongoDB.

    Role Guard (authorize): Implementa el RBAC. Filtra el acceso según los roles definidos (ADMIN, UPLOADER, DOWNLOADER). Si el usuario no posee el nivel de privilegio requerido, el sistema deniega el acceso antes de tocar cualquier lógica de negocio.

    Ownership Guard: Para rutas sensibles, un middleware adicional verifica que el userSid del token coincida con el propietario del recurso solicitado (ej. un Downloader solo puede ver sus propias asignaciones).

Actualización para el punto 6 (Gestión de Archivos)
6.3 Motor de Compresión Determinista (ZIP Service)

El cierre del ciclo de vida de un Template culmina con la generación de un paquete ZIP distribuible, diseñado bajo principios de inmutabilidad y transparencia.

    Generación Determinista: Se ha eliminado el uso de timestamps en los nombres de archivos de salida. El ZIP se identifica unívocamente mediante el templateSid (ej. package_[templateSid].zip). Esto permite una recuperación predecible del recurso y evita la acumulación de basura digital (archivos huérfanos) en el servidor.

    Firma de Integridad Interna: Cada paquete generado incluye automáticamente un archivo signature.checksum. Este documento actúa como un manifiesto de transparencia que contiene:

        La ruta lógica final de cada archivo dentro del ZIP.

        El hash SHA-256 original capturado en el momento de la subida.

    Dual-Path Search (Fallback): El motor de compresión implementa una lógica de búsqueda resiliente. Si un archivo no se encuentra en la ruta de trabajo original (/documents), el sistema consulta automáticamente en el repositorio de procesados (/processed), garantizando la generación del paquete incluso después de movimientos físicos de archivos.

### 2.7.3 Persistencia de Sesión y Revocación Atómica

A diferencia de los sistemas puramente stateless, este proyecto implementa un mecanismo de Validación de Token en Base de Datos:

    Almacenamiento de Estado: El token generado se persiste en el modelo User. Esto permite que el servidor actúe como la "Fuente de la Verdad", invalidando sesiones de forma proactiva si se detectan anomalías.

    Ciclo de Validación: El middleware de autenticación no solo verifica la firma criptográfica del JWT; realiza un cruce con la base de datos para asegurar que el token enviado coincida exactamente con el almacenado.

    Logout Seguro: Al cerrar sesión, el campo token en el modelo User se establece en null (u vacío), invalidando inmediatamente cualquier copia del JWT que el cliente posea, mitigando el riesgo de ataques por reutilización de tokens.

## 3. Flujo de desarrollo

### 3.1 Modelos de datos
El primer paso en el ciclo de desarrollo consiste en la definición de los esquemas de Mongoose. Para garantizar consistencia y evitar pluralizaciones automáticas erróneas, se debe forzar el nombre de las colecciones en plural (ej. `collection: 'Users'`).

### 3.2 Operativa de Controladores (Auth)
Los controladores de autenticación actúan como orquestadores estrictos siguiendo tres pasos:

    Extracción: Captura de credenciales y metadatos de contexto (userAgent, IP).

    Delegación: Ejecución de Workflows asíncronos que contienen la lógica de negocio.

    Protocolo de Salida: Uso de authResponses para la gestión de Cookies de Seguridad y estandarización de cuerpos JSON.

#### Reglas de Desarrollo Seguro

1.  **Identidad basada en UUID:** Se descarta el uso del `_id` nativo de MongoDB para operaciones lógicas. Se implementa **UUID v4** como estándar de identificación.
2.  **Aislamiento del RID (Resource ID):** El `rid` actúa como llave primaria privada para operaciones críticas de identidad (autenticación, validación de contraseñas y gestión de sesiones). Su uso está restringido exclusivamente a las consultas de la capa de Auth.
3.  **Exposición mediante SID (Subject ID):** Se implementa el campo `sid` como identificador público operacional. Toda la comunicación entre Frontend y Backend, así como la vinculación de archivos y otras entidades, se realiza mediante el `sid`, evitando la exposición del `rid` en el tráfico de red.
4.  **Consumo de datos mediante POJOs (Lean):** Todas las consultas a la base de datos deben invocar el método `.lean()`. Esto garantiza la obtención de objetos planos de JavaScript, eliminando la sobrecarga de Mongoose y previniendo efectos secundarios mediante setters/getters.
5.  **Inmutabilidad y Blindaje:** Los identificadores `rid` y `sid` se definen como inmutables en el esquema. La integridad de los datos se refuerza mediante el uso de DTOs para el filtrado de campos sensibles y DAOs especializados que limitan el alcance de las consultas.

#### Estructura de Módulos de consulta (Por acciones)
La lógica de persistencia se divide en archivos especializados para mantener la cohesión:

*   **authQueries.js:** Gestión de acceso, creación de cuentas, validación de credenciales y registro de sesiones.
*   **templateQueries.js:** Operaciones para la generación de solicitudes/tareas por parte de perfiles `UPLOADER`.
*   **assignmentQueries.js:** Ciclo de vida de las solicitudes (carga, aprobación y listado de documentos vinculados).
*   **zipQueries.js:** Control y orquestación de la generación de paquetes comprimidos según la estructura de la solicitud.
*   **userQueries.js:** Provisión de información de perfil y datos de usuario a las diversas funcionalidades del sistema.
*   **auditQueries.js:** Registro histórico de actividades críticas (eventos de sesión, creación/cancelación de solicitudes, gestión de archivos y descargas).

### 3.3 Protocolo de Pruebas y Validación (Tests)

El directorio tests/ no solo almacena scripts, sino que actúa como el registro de la Lógica de Verificación del sistema. Se han documentado las pruebas de escritorio del primer router bajo tres ejes fundamentales:

	1. Ciclo de Identidad (Creación de Usuarios):

		Validación de la inmutabilidad del rid y sid.

		Verificación del hash de contraseñas (Bcrypt salt rounds: 10).

		Comprobación de la política de "Identidad Única" (IDENTITY_ALREADY_EXISTS).

	2. Integridad de Persistencia (Revisión de Usuarios):

		Validación del consumo mediante .lean() para asegurar objetos planos (POJOs).

		Verificación de que el rid no trascienda la capa DAO/DTO.

		Pruebas de recuperación de candidatos de autenticación.

	3. Flujos de Trabajo (Orquestación de Workflows):

		Registro: Validación del encadenamiento Controller -> Workflow -> DAO -> Audit.

		Login: Prueba de entropía (generación de salt y fingerprint por dispositivo).

		Logout: Verificación de limpieza atómica de sesión en la base de datos.

### 4. Trazabilidad y Auditoría (Observabilidad)

El sistema implementa un Audit Engine centralizado en utils/auditLogger.js. Cada acción crítica del sistema dispara un evento de auditoría que captura:

    Actor: El userId vinculado (o ANONYMOUS en fallos de acceso o ataques).

    Contexto: IP real del cliente y userAgent (normalizado por familia de dispositivo).

    Acción Discreta: Uso de Enums estrictos para facilitar el monitoreo:

        Operativos: REGISTER, LOGIN, LOGOUT.

        Seguridad: LOGIN_FAILED, REGISTER_FAILED, BRUTE_FORCE_STRIKE.

    Metadatos: Detalles específicos del fallo o éxito, incluyendo el endpoint, method HTTP y mensajes de error del sistema.

### 5. Gestión de Plantillas (Templates)

La capa de Templates representa la intención de carga. Es el contrato maestro que define qué archivos se esperan, cómo deben renombrarse y quién es el responsable de atender cada fila.

### 5.1 Flujo de Orquestación de Plantillas

A diferencia de una subida de archivos convencional, la creación de un Template dispara un proceso de introspección:

1. Ingesta de Excel: El sistema recibe el archivo .xlsx y lo almacena temporalmente.

2. Extracción de Reglas: Se parsea el documento para extraer las renamingRules (ruta de destino y nombre deseado).

3. Generación de Asignaciones: Por cada fila válida en el Excel, el sistema crea una entrada en la colección Assignments con estado PENDING.

4. Vinculación Atómica: El Template no se considera ACTIVE hasta que todas sus asignaciones han sido persistidas y vinculadas mediante el templateSid.

### 5.2 Estados del Ciclo de Vida

    ACTIVE: La plantilla está abierta y disponible para que los DOWNLOADERS suban archivos.

    PROCESSING: Se ha iniciado un proceso masivo (ej. generación de ZIP).

    COMPLETED: Todas las filas han sido aprobadas y el paquete final ha sido generado.

    CANCELLED: El UPLOADER o ADMIN invalida la plantilla, bloqueando cualquier acción sobre sus asignaciones.

### 6. Ciclo de Vida de Asignaciones (Assignments)

La asignación es el átomo de trabajo del sistema. Representa el vínculo entre un actor (Downloader), un recurso físico (Documento) y una regla de negocio (Renombrado).

### 6.1 Máquina de Estados de la Asignación

Para garantizar la integridad, cada asignación transita por una serie de estados validados por el assignmentWorkflow:

    PENDING: Estado inicial. La fila está creada en base de datos pero no contiene metadatos de archivo ni ruta en disco.

    UPLOADED: El Downloader ha persistido un archivo. El sistema registra el sha256, el originalName y la ruta relativa inicial.

    REJECTED: El Uploader rechaza el documento. Esta acción dispara un movimiento físico del archivo a la zona de /rejected y libera la fila para una nueva carga.

    APPROVED: El Uploader valida el documento. El archivo se bloquea para ediciones y queda marcado como "Apto para Renombrado".

### 6.2 Gobernanza y Seguridad en la Gestión de Archivos

El manejo de archivos sigue principios de seguridad operativa para prevenir colisiones y fugas:

    Aislamiento por SID: Los archivos no se mezclan en una carpeta raíz; se organizan en directorios nombrados mediante el templateSid, dificultando la predicción de rutas por terceros.

    Integridad por Hash: Cada subida genera un checksum SHA-256 que se almacena en la asignación. Esto permite verificar que el archivo no ha sido alterado manualmente en el servidor.

    Rutas Relativas Portables: Se prohíbe el almacenamiento de rutas absolutas. El uso de path.join garantiza que el sistema de archivos sea portable entre entornos de desarrollo, staging y producción.

### 7. Protocolo de Revisión y Auditoría

La revisión de documentos es un proceso auditado que conecta la capa de ejecución con el Audit Engine.
7.1 Acciones de Revisión

    Aprobación (APPROVE): Cambia el estado a APPROVED. Es una operación lógica que no requiere movimiento de archivos, optimizando el I/O del servidor.

    Rechazo (REJECT): Es una operación física y lógica. Requiere un rejectionReason obligatorio que se almacena en el campo comments. El movimiento al repositorio de descartes asegura que la carpeta de documentos activos solo contenga archivos candidatos a la aprobación.

### 7.2 Trazabilidad de la Revisión

Cada decisión tomada por un Uploader genera un evento de auditoría detallado que incluye:

    El targetId (SID de la asignación).

    La transición de estado (ej. UPLOADED_TO_REJECTED).

    El motivo del rechazo, permitiendo análisis posteriores sobre la calidad de la carga de los usuarios.