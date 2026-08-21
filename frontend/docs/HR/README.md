# Índice — File Renamer

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Objetivo](#2-objetivo)
3. [Problema que resuelve](#3-problema-que-resuelve)
4. [Mi participación](#4-mi-participación)
5. [Principales funcionalidades](#5-principales-funcionalidades)
6. [Tecnologías utilizadas](#6-tecnologías-utilizadas)
7. [Enfoque de desarrollo](#7-enfoque-de-desarrollo)
8. [Seguridad](#8-seguridad)
9. [Resultados y capacidades demostradas](#9-resultados-y-capacidades-demostradas)
10. [Estado actual y evolución](#10-estado-actual-y-evolución)
11. [Relación con mi perfil profesional](#11-relación-con-mi-perfil-profesional)

Perfecto. Para esta primera versión conviene que sea **un borrador completo**, pero sin meter todavía detalles técnicos que ya están en el README técnico. Así puedes revisar si el enfoque representa correctamente tu perfil antes de pulir el lenguaje.

# File Renamer — Resumen profesional

## 1. Descripción del proyecto

**File Renamer** es una aplicación web desarrollada para gestionar la preparación, carga, validación y organización de documentos a partir de una plantilla Excel que define los nombres y directorios requeridos.

El sistema permite gestionar usuarios con diferentes roles, asignar tareas de carga de documentos, recibir y revisar archivos y, una vez completado el proceso, generar un paquete `.zip` con la estructura de directorios y documentos requerida.

El proyecto fue desarrollado como una aplicación **MERN**, compuesta por un backend que concentra la lógica de negocio y procesamiento, y un frontend SPA desarrollado con React para la interacción con el sistema.

---

## 2. Objetivo

El objetivo del proyecto es automatizar un proceso que normalmente requiere organizar manualmente múltiples documentos de acuerdo con reglas previamente definidas.

La aplicación busca reducir errores relacionados con:

* nomenclatura de archivos;
* organización de directorios;
* selección de documentos;
* asignación de tareas;
* validación de información;
* preparación del paquete final.

Además del desarrollo de las funcionalidades, el proyecto fue utilizado para aplicar principios de **separación de responsabilidades, desarrollo seguro y organización arquitectónica** tanto en backend como en frontend.

---

## 3. Problema que resuelve

Cuando una organización necesita preparar grandes cantidades de documentación siguiendo una estructura específica, el proceso manual puede generar errores y dificultar la revisión del cumplimiento de los requisitos.

File Renamer centraliza este proceso mediante una plantilla que define qué documentos son necesarios, cómo deben identificarse y dónde deben ubicarse.

El sistema permite distribuir las tareas entre diferentes usuarios, validar los documentos recibidos y controlar su revisión antes de generar el paquete final.

De esta forma, el proceso pasa de una preparación manual y dispersa a un flujo centralizado que permite **definir, asignar, cargar, revisar y organizar los documentos**.

---

## 4. Mi participación

El proyecto fue desarrollado de manera integral, participando tanto en el **backend como en el frontend**.

Mi participación incluye:

* diseño y organización de la arquitectura de la aplicación;
* desarrollo del backend y sus servicios REST;
* desarrollo de la interfaz web con React;
* implementación de autenticación y manejo de sesiones;
* implementación de roles y control de acceso;
* desarrollo de validaciones;
* integración entre frontend y backend;
* manejo de carga y descarga de archivos;
* implementación del flujo de asignación y revisión de documentos;
* incorporación de controles de seguridad;
* identificación de inconsistencias técnicas y planificación de su evolución.

El proyecto también implicó tomar decisiones sobre cómo distribuir las responsabilidades entre los diferentes componentes del sistema y cómo mantener separadas las funciones de presentación, comunicación, lógica de negocio, persistencia y seguridad.

---

## 5. Principales funcionalidades

### Gestión de usuarios

* Registro e inicio de sesión.
* Gestión de sesiones.
* Diferentes roles de usuario.
* Control de acceso según rol.

### Gestión de plantillas

* Carga de plantillas Excel.
* Validación de la información proporcionada.
* Consulta y gestión de plantillas.
* Identificación de errores en los datos de las plantillas.

### Gestión de tareas

* Asignación de tareas a usuarios.
* Consulta de tareas asignadas.
* Carga de documentos asociados a las tareas.
* Revisión de documentos.

### Procesamiento de documentos

* Validación de archivos.
* Organización de documentos.
* Generación de paquetes `.zip`.
* Generación de huellas SHA-256 de los documentos incluidos.
* Descarga de los paquetes generados.

### Administración

* Monitoreo del estado de los procesos.
* Consulta de información administrativa.
* Consulta de información relacionada con auditoría.

---

## 6. Tecnologías utilizadas

### Backend

* Node.js
* Express
* MongoDB
* API REST
* JWT
* Arquitectura por capas
* CQS
* DAO / DTO

### Frontend

* React
* Vite
* React Router
* Zod
* Fetch API
* Bootstrap 5
* SweetAlert2

### Seguridad

* Cookies HttpOnly
* Control de acceso basado en roles
* Validación de entradas
* Validación de archivos
* Content Security Policy
* Manejo de sesiones
* Validaciones de seguridad en backend

### Herramientas

* Git / GitHub
* ESLint
* Nodemon para desarrollo

---

## 7. Enfoque de desarrollo

El desarrollo del proyecto se realizó buscando mantener una separación clara entre las diferentes responsabilidades de la aplicación.

En el backend se separan las responsabilidades relacionadas con la exposición de servicios, lógica de negocio, acceso a datos, validaciones y seguridad.

En el frontend se separan las responsabilidades de presentación, navegación, comunicación con la API, manejo de sesión, validaciones y componentes reutilizables.

El proyecto también se desarrolló considerando la seguridad desde el diseño, diferenciando los controles que corresponden al cliente de aquellos que deben ser aplicados obligatoriamente en el servidor.

Una parte importante del proceso fue identificar las decisiones que funcionan para el MVP y aquellas que pueden ser mejoradas posteriormente, evitando considerar la primera implementación como una solución definitiva.

---

## 8. Seguridad

La seguridad es uno de los aspectos considerados durante el desarrollo del proyecto.

Entre los mecanismos implementados se encuentran:

* autenticación mediante sesión;
* cookies HttpOnly para proteger las credenciales de sesión;
* control de acceso basado en roles;
* validación de entradas;
* validación de archivos;
* límites de tamaño y extensiones permitidas;
* Content Security Policy;
* manejo de sesiones expiradas o revocadas;
* separación entre control de acceso del frontend y autorización del backend.

El frontend realiza validaciones preventivas para mejorar la experiencia del usuario, pero **la autorización y las validaciones definitivas permanecen en el backend**.

Esto permite evitar depender de controles ejecutados exclusivamente en el navegador para proteger los recursos del sistema.

---

## 9. Resultados y capacidades demostradas

El proyecto permite demostrar experiencia práctica en diferentes áreas del desarrollo de aplicaciones web:

### Desarrollo

* Desarrollo full-stack.
* Desarrollo de APIs REST.
* Desarrollo de SPA con React.
* Integración frontend/backend.
* Manejo de archivos.
* Persistencia de información.

### Arquitectura

* Separación de responsabilidades.
* Organización modular.
* Diseño de flujos entre frontend y backend.
* Identificación y gestión de deuda técnica.
* Planificación de evolución de una aplicación.

### Seguridad

* Aplicación práctica de controles de seguridad.
* Autenticación y autorización.
* Validación de entradas.
* Gestión de sesiones.
* Seguridad del lado del cliente y servidor.

### Desarrollo profesional

El proyecto también demuestra capacidad para trabajar sobre una aplicación que no solamente requiere implementar funcionalidades, sino **analizar las decisiones técnicas tomadas, identificar sus limitaciones y establecer una estrategia para su evolución**.

---

## 10. Estado actual y evolución

### MVP — Versión actual

La versión actual es un **MVP funcional** que permite ejecutar el flujo principal del sistema y demuestra la integración entre frontend y backend.

La prioridad de esta versión fue alcanzar una implementación funcional y establecer las bases de la aplicación.

### Versión 2 — Corrección y compatibilidad

La siguiente evolución estará orientada principalmente a:

* adaptar el frontend a cambios del backend;
* actualizar endpoints;
* adaptar validaciones;
* corregir inconsistencias arquitectónicas;
* refactorizar componentes y responsabilidades cuando sea necesario.

### Versión 3 — Evolución del producto

Una evolución posterior podría incorporar:

* reorganización de pantallas;
* reorganización de componentes;
* nuevas funcionalidades;
* mejoras de experiencia de usuario;
* branding;
* preparación para una eventual comercialización.

Las funcionalidades futuras dependerán de las necesidades identificadas durante la evolución del proyecto.

---

## 11. Relación con mi perfil profesional

File Renamer representa una evolución de mi experiencia previa en desarrollo de aplicaciones web hacia un perfil con mayor énfasis en **backend, arquitectura y seguridad**.

El proyecto me permitió combinar experiencia en desarrollo frontend con conocimientos de backend y ciberseguridad, aplicando estos últimos directamente en el diseño y desarrollo de una aplicación funcional.

Actualmente estoy orientando mi desarrollo profesional hacia posiciones relacionadas con **backend y desarrollo full-stack**, manteniendo la seguridad como un componente transversal de mi trabajo.

Este proyecto forma parte de mi portafolio como evidencia práctica de esa orientación y complementa mi experiencia profesional previa en desarrollo de aplicaciones web de alto tráfico.