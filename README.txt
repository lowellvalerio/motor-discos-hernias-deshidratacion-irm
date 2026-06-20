MOTOR LINGÜÍSTICO - DISCOS / HERNIAS / DESHIDRATACIÓN

Archivos incluidos:
1. IRM_LUMBAR_MAESTRO_CON_DISCOS_HERNIAS_v8.html
   - HTML maestro integrado para Bubble.
   - Incluye módulo de discos con toggle Normal / Patológico.
   - En Normal muestra textbox editable y llena txt_discos con:
     "Discos intervertebrales bien hidratados, de altura normal y no sobrepasan en ningún segmento la superficie posterior dorsal de los cuerpos vertebrales."
   - En Patológico muestra motor de hernias y deshidratación asociada.
   - No genera texto patológico si faltan: tipo, localización, nivel o compromiso radicular.
   - Niveles incluidos: D10-D11, D11-D12, D12-L1, L1-L2, L2-L3, L3-L4, L4-L5, L5-S1.

2. server.js
   - Backend Node.js para Render.
   - Endpoint: POST /generar-discos
   - Incluye hernia, protrusión, bulging, desgarro anular, migración, compromiso radicular y deshidratación discal.

3. package.json
   - Configuración mínima para Render.

En Render:
- Build command: npm install
- Start command: npm start

En el HTML:
Cambiar esta línea por la URL real de Render:
const RID_RENDER_URL='https://TU-SERVICIO-EN-RENDER.onrender.com/generar-discos';
