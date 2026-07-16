#!/bin/bash

echo "🚀 Iniciando Examen Rápido de la API..."
echo "--------------------------------------"

# 1. Test de Salud (Debería devolver 200 OK)
HEALTH_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost:8443/health)
if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "✅ Health Check: SUPERADO (Status $HEALTH_STATUS)"
else
    echo "❌ Health Check: FALLO (Status $HEALTH_STATUS)"
fi

# 2. Test de Seguridad OAuth (Intentar entrar sin token, debería devolver 401)
# Cambia '/api/profile' por cualquier ruta tuya que esté protegida
AUTH_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost:8443/api/profile)
if [ "$AUTH_STATUS" -eq 401 ]; then
    echo "✅ Seguridad OAuth: SUPERADO (Bloqueo correcto - Status $AUTH_STATUS)"
else
    echo "❌ Seguridad OAuth: FALLO (Dejó pasar o dio otro error - Status $AUTH_STATUS)"
fi

echo "--------------------------------------"
echo "🏁 Examen terminado."
