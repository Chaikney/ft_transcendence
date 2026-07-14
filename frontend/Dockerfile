FROM node:20-alpine AS development

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias primero para aprovechar la caché de Docker
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del frontend
COPY . .
# NOTE These are needed *before* the build begins, else vite doesn't see them
ARG VITE_API_URL
ARG VITE_CABLE_URL
ARG VITE_USE_MOCK
ARG VITE_42_CLIENT_ID
ARG VITE_42_REDIRECT_URI
ENV VITE_42_CLIENT_ID=${VITE_42_CLIENT_ID}
ENV VITE_42_REDIRECT_URI=${VITE_42_REDIRECT_URI}
ENV VITE_USE_MOCK=${VITE_USE_MOCK}
ENV VITE_42_CLIENT_ID=${VITE_42_CLIENT_ID}
# Exponemos el puerto por defecto de Vite
# RUN npm run  build
RUN npx vite build
# Arrancamos Vite asegurando que escuche en todas las interfaces de red (--host)
# CMD ["npm", "run", "dev", "--", "--host"]

FROM nginx:1.27-alpine
COPY --from=development /app/dist/ /usr/share/nginx/html/
# copy config and  certificates
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY secret/trans.crt /etc/nginx/ssl/server.crt
COPY secret/trans.key /etc/nginx/ssl/server.key
CMD ["nginx", "-g", "daemon off;"]
