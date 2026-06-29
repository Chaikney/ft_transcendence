El **Especialista en DevOps (Docker & Infraestructura)** es la persona que hace que el desarrollo pase de ser "código en una carpeta" a "un sistema vivo". Su prioridad debe ser la **estabilidad del entorno**.

Aquí tienes el orden de ejecución y la arquitectura de sincronía para este rol:

### 🚀 Orden de Ejecución de Tareas

1. **Fundamentos de Contenedores (Dockerfiles):**
    
    - **Tarea:** Crear el `Dockerfile` para Rails y para los servicios independientes (si fuera necesario).
        
    - **Objetivo:** Definir el entorno base (Ruby, Node, dependencias del sistema).
        
    - **Por qué:** Si el entorno no es reproducible, el equipo pierde horas depurando "en mi máquina funciona".
        
2. **Orquestación Básica (Docker-Compose):**
    
    - **Tarea:** Configurar `docker-compose.yml`.
        
    - **Objetivo:** Levantar el contenedor de la aplicación junto con la base de datos (PostgreSQL) y Redis (para ActionCable).
        
    - **Por qué:** Es el comando único (`make up`) que usará todo el equipo para trabajar.
        
3. **Proxy Inverso y Redes (Nginx):**
    
    - **Tarea:** Configurar el contenedor de Nginx como puerta de entrada.
        
    - **Objetivo:** Enrutar el tráfico externo (`/api` -> Rails, `/` -> Frontend/React).
        
    - **Por qué:** Es vital para resolver problemas de CORS y centralizar la gestión de peticiones.
        
4. **Seguridad y Producción:**
    
    - **Tarea:** Configuración de SSL/TLS (HTTPS) y gestión de secretos (`.env`).
        
    - **Objetivo:** Que el proyecto sea seguro para la evaluación.
        
    - **Por qué:** Los requisitos de 42 sobre seguridad son estrictos.
        

### 🏗️ Arquitectura de Sincronía (Reglas de Oro)

Para que el equipo de DevOps no sea un cuello de botella, debe seguir estas reglas:

- **Configuración como Código:** Ningún contenedor debe requerir configuración manual. Todo debe estar en el `Dockerfile` o en archivos de configuración dentro de `/infra`.
    
- **Healthchecks:** Debe implementar comprobaciones de estado. Si Rails intenta conectar a la DB antes de que esta esté lista, el contenedor debe esperar automáticamente (usando herramientas como `wait-for-it` o `healthcheck` nativo de Docker).
    
- **Entornos Idénticos:** El DevOps es responsable de que las variables de entorno (`.env.example`) estén siempre actualizadas. Si alguien añade una API Key, debe actualizar el ejemplo.
    

### 🛠️ Flujo de Trabajo para Sincronizar con el Equipo

1. **Iteración Continua:** No debe esperar a que el proyecto esté terminado. Debe entregar el `docker-compose` básico en las primeras 48 horas.
    
2. **Estrategia de Volúmenes:** Debe asegurar que los datos de la base de datos no se pierdan al reiniciar los contenedores (usar volúmenes locales en `./data`).
    
3. **Documentación (El Makefile):** Es su responsabilidad mantener un `Makefile` limpio:
    
    - `make up` (arranca todo).
        
    - `make down` (detiene todo).
        
    - `make clean` (borra volúmenes y reinicia el estado).

### ⚠️ El "Check" 

La clave en este rol debe enfocarse en la **limpieza**. Si el `Dockerfile` tiene 100 líneas, está mal. Si el `docker-compose` no gestiona los secretos, está mal. El entorno de desarrollo debe ser **"cero fricción"**: un compañero nuevo debe poder clonar, hacer `make up` y ver la aplicación funcionando sin errores.