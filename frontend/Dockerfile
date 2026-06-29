FROM node:20-alpine AS development

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias primero para aprovechar la caché de Docker
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del frontend
COPY . .

# Copiamos el script de inicio y le damos permisos de ejecución
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Exponemos el puerto por defecto de Vite
# RUN npm run  build
RUN npx vite build
# Arrancamos Vite asegurando que escuche en todas las interfaces de red (--host)
# CMD ["/app/start.sh"]
# CMD ["npm", "run", "dev", "--", "--host"]

FROM nginx:1.27-alpine
COPY --from=development /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
