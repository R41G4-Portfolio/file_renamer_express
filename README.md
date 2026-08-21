# File Renamer

Aplicación web para la preparación, gestión y organización de documentos a partir de plantillas que definen la estructura y nomenclatura requerida.

El sistema permite administrar usuarios y roles, asignar tareas, cargar y validar documentos, revisar archivos y generar un paquete final con la estructura de directorios y documentos correspondiente.

## 📌 Descripción

File Renamer es una aplicación **MERN full-stack** compuesta por:

- **Backend:** API REST desarrollada con Node.js y Express.
- **Frontend:** SPA desarrollada con React y Vite.
- **Base de datos:** MongoDB.

El backend concentra la lógica de negocio, procesamiento de archivos, persistencia y controles de seguridad, mientras que el frontend proporciona la interfaz para interactuar con el sistema.

El proyecto fue desarrollado con énfasis en **backend, separación de responsabilidades y desarrollo seguro**, manteniendo también la experiencia adquirida en desarrollo frontend.

---

## 🎯 Objetivo

Automatizar la preparación de documentos que deben cumplir una estructura y nomenclatura determinadas.

El sistema busca reducir errores relacionados con:

- nombres de archivos;
- estructura de directorios;
- selección de documentos;
- asignación de tareas;
- validación de información;
- revisión de documentos;
- preparación del paquete final.

---

## ⚙️ Principales funcionalidades

### Usuarios y sesiones

- Registro e inicio de sesión.
- Gestión de sesiones.
- Roles de usuario.
- Control de acceso basado en roles.

### Plantillas

- Carga de plantillas Excel.
- Validación de información.
- Consulta y gestión de plantillas.
- Identificación de inconsistencias.

### Tareas

- Asignación de tareas a usuarios.
- Consulta de tareas.
- Carga de documentos.
- Revisión de documentos.

### Procesamiento de documentos

- Validación de archivos.
- Organización de documentos.
- Generación de paquetes `.zip`.
- Generación de huellas SHA-256.
- Descarga de paquetes generados.

### Administración

- Consulta del estado de los procesos.
- Información administrativa.
- Información relacionada con auditoría.

---

## 🏗️ Arquitectura

El proyecto utiliza una organización por responsabilidades para mantener separadas las diferentes partes de la aplicación.

### Backend

El backend utiliza una arquitectura por capas y aplica principios como:

- separación de responsabilidades;
- Command Query Separation (CQS);
- DAO / DTO;
- separación entre lógica de negocio y acceso a datos;
- validación de entradas;
- controles de autenticación y autorización.

La API REST funciona como punto de comunicación entre el frontend y los servicios del sistema.

### Frontend

El frontend está desarrollado como una SPA utilizando React.

Se separan las responsabilidades relacionadas con:

- presentación;
- navegación;
- comunicación con la API;
- manejo de sesión;
- validación de entradas;
- componentes reutilizables.

---

## 🔐 Seguridad

La seguridad se considera como parte transversal del desarrollo.

Entre los controles implementados se encuentran:

- autenticación mediante sesión;
- cookies HttpOnly;
- control de acceso basado en roles;
- validación de entradas;
- validación de archivos;
- restricciones de tamaño y extensiones;
- Content Security Policy;
- manejo de sesiones expiradas o revocadas;
- autorización aplicada en backend.

Las validaciones realizadas en el frontend tienen principalmente una función preventiva y de experiencia de usuario.

Los controles de seguridad que protegen los recursos del sistema se aplican en el backend y no dependen exclusivamente del navegador.

---

## 🛠️ Tecnologías

### Backend

- Node.js
- Express
- MongoDB
- API REST
- JWT
- Arquitectura por capas
- CQS
- DAO / DTO

### Frontend

- React
- Vite
- React Router
- Zod — validación de entradas
- Fetch API
- Bootstrap 5
- SweetAlert2

### Seguridad

- Cookies HttpOnly
- Control de acceso basado en roles
- Content Security Policy
- Validación de entradas
- Validación de archivos
- Gestión de sesiones

### Herramientas

- Git / GitHub
- ESLint
- Nodemon

---

## 📚 Documentación técnica

La documentación técnica está separada por área para mantener independientes los detalles de implementación del backend y frontend.

### Backend

Documentación sobre arquitectura, organización, responsabilidades, procesamiento, API y decisiones técnicas del backend.

👉 [Documentación técnica del Backend](./backend/docs/README.md)

### Frontend

Documentación sobre la arquitectura de la SPA, componentes, navegación, comunicación con la API y decisiones técnicas del frontend.

👉 [Documentación técnica del Frontend](./frontend/docs/README.md)

---

## 📈 Evolución del proyecto

El proyecto se desarrolla mediante versiones sucesivas, donde cada etapa tiene un objetivo diferente.

### V1 — Funcionalidad

La primera versión establece una implementación funcional del flujo principal del sistema.

La prioridad es contar con una aplicación capaz de ejecutar el proceso completo y establecer una base sobre la cual realizar mejoras posteriores.

### V2 — Estabilidad y optimización

La siguiente versión estará orientada a:

- corregir inconsistencias identificadas durante la primera versión;
- mejorar la estabilidad;
- optimizar procesos;
- refactorizar responsabilidades cuando sea necesario;
- adaptar la integración entre frontend y backend;
- fortalecer aspectos técnicos y de seguridad.

### Evolución futura — Producto

Una evolución posterior podrá orientarse hacia una solución preparada para una eventual comercialización, considerando:

- mejoras de experiencia de usuario;
- reorganización de pantallas y componentes;
- nuevas funcionalidades;
- branding;
- mejoras administrativas;
- preparación para comercialización.

Las decisiones de cada versión dependerán de las necesidades identificadas durante la evolución del proyecto.

---

## 💻 Enfoque de desarrollo

El proyecto fue desarrollado de manera integral, participando tanto en **backend como en frontend**.

La evolución profesional del proyecto está orientada principalmente hacia el **desarrollo backend**, manteniendo la capacidad de participar en proyectos full-stack gracias a la experiencia previa en frontend.

La experiencia en **ciberseguridad y desarrollo seguro** se incorpora como un componente transversal durante el diseño y desarrollo de la aplicación.

---

## 📂 Estructura principal

```text
file-renamer/
├── backend/
│   ├── docs/
│   │   └── README.md
│   └── ...
│
├── frontend/
│   ├── docs/
│   │   └── README.md
│   └── ...
│
├── .gitignore
└── README.md
