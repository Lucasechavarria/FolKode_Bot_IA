# Guía de Integración: Conectando a Email y Discord

Esta guía explica cómo conectar tu Asistente de IA a servicios de backend como email y Discord para recibir notificaciones de clientes potenciales en tiempo real.

La aplicación utiliza el archivo `services/backendService.ts` para enviar los datos del cliente y los registros de conversación a un único endpoint de webhook. Recomendamos usar una herramienta de automatización de flujos de trabajo como **[n8n](https://n8n.io/)** (gratuita, de código abierto y auto-hospedable), **[Make.com](https://www.make.com/)**, o **[Zapier](https://zapier.com/)** para recibir estos datos y reenviarlos a otros servicios.

Este enfoque es seguro (mantiene las claves de API fuera del frontend) y muy flexible.

---

## Guía Paso a Paso (usando n8n)

### 1. Crea un Nuevo Flujo de Trabajo en n8n

1.  Inicia sesión en tu instancia de n8n (Cloud o auto-hospedada).
2.  Crea un nuevo flujo de trabajo vacío.
3.  Para tu primer nodo (el disparador o "trigger"), selecciona el nodo **Webhook**.
4.  n8n generará una **URL de Prueba (Test URL)**. Cópiala. La usarás para enviar datos de prueba desde tu aplicación.

### 2. Actualiza la URL del Webhook en tu Aplicación

1.  Abre el archivo `services/backendService.ts` en tu proyecto.
2.  Busca la constante `N8N_WEBHOOK_URL`.
3.  Reemplaza la URL de marcador de posición con la **URL de Prueba** que copiaste de tu nodo Webhook en n8n.

```typescript
// services/backendService.ts

// ...
const N8N_WEBHOOK_URL = 'https://tu-instancia-de-n8n.com/webhook-test/TU_ID_UNICO'; // <-- PEGA TU URL AQUÍ
// ...
```

### 3. Prueba la Conexión

1.  En tu nodo Webhook de n8n, haz clic en **"Listen for Test Event"** (Escuchar evento de prueba).
2.  En tu aplicación web, iníciala, completa el formulario y **finaliza el chat después de programar la reunión**.
3.  n8n debería mostrar que ha recibido los datos. El payload ahora es mucho más rico e incluye el análisis de la IA y los detalles de la reunión:

```json
{
  "body": {
    "type": "CHAT_REPORT",
    "data": {
      "user": {
        "name": "Jane Doe",
        "contactMethod": "whatsapp",
        "contactInfo": "+1234567890"
      },
      "summary": {
        "summary": "- The client wants to build a mobile app for pet grooming services...",
        "tags": ["Mobile App", "UI/UX Design"],
        "temperature": "Hot",
        "leadScore": 9,
        "painPoint": "Current manual booking system is inefficient and causing lost revenue.",
        "budgetMention": "Mentioned they have a 'healthy budget' for this.",
        "timelineMention": "Wants to launch in the next 3 months."
      },
      "meetingDetails": {
          "contactMethod": "whatsapp",
          "contactInfo": "+1234567890",
          "timeSlot": "Tomorrow Morning"
      },
      "transcript": [ ... ]
    }
  }
}
```

### 4. Añade Enrutamiento Avanzado (Nodo `IF`)

Ahora que tienes la "temperatura" y la "puntuación" del lead, puedes enrutar las notificaciones.

1.  Añade un nodo **IF** después del Webhook.
2.  Crea una condición para leads de alta prioridad: `{{ $json.body.data.summary.leadScore }}` -> `Larger or Equal` -> `8`.
3.  Esto creará dos salidas: `true` (para leads de alta prioridad) y `false`.

### 5. Notificaciones para Leads de Alta Prioridad (Email y Discord Urgente)

Conecta los siguientes nodos a la salida `true` del nodo `IF`.

1.  **Email Urgente**:
    *   **To Address**: `equipo-ventas-prioritario@ejemplo.com`
    *   **Subject**: `🔥🔥🔥 LEAD (Score: {{ $json.body.data.summary.leadScore }}/10): {{ $json.body.data.user.name }} pide llamar {{ $json.body.data.meetingDetails.timeSlot }}`
    *   **HTML**:
        ```html
        <h3>Lead de Alta Prioridad Detectado</h3>
        <p><strong>Puntuación:</strong> {{ $json.body.data.summary.leadScore }}/10</p>
        <p><strong>Nombre:</strong> {{ $json.body.data.user.name }}</p>
        <p><strong>Contacto Preferido:</strong> {{ $json.body.data.meetingDetails.contactMethod }} - <code>{{ $json.body.data.meetingDetails.contactInfo }}</code></p>
        <p><strong>Horario Sugerido:</strong> <strong>{{ $json.body.data.meetingDetails.timeSlot }}</strong></p>
        <hr>
        <h4>Análisis de la IA:</h4>
        <p><strong>Punto de Dolor Clave:</strong> <em>{{ $json.body.data.summary.painPoint }}</em></p>
        <p><strong>Mención de Presupuesto:</strong> <em>{{ $json.body.data.summary.budgetMention }}</em></p>
        <p><strong>Mención de Plazo:</strong> <em>{{ $json.body.data.summary.timelineMention }}</em></p>
        <hr>
        <h4>Resumen del Chat:</h4>
        <blockquote>{{ $json.body.data.summary.summary.replace(/\n/g, '<br>') }}</blockquote>
        ```
2.  **Mensaje de Discord Prioritario**:
    *   Usa una URL de Webhook para un canal de `#leads-urgentes`.
    *   **Content**: `@here 🔥 ¡Lead de Puntuación Alta ({{ $json.body.data.summary.leadScore }}/10)! Contactar a **{{ $json.body.data.user.name }}**`
    *   **Embeds Title**: `Reunión solicitada para {{ $json.body.data.meetingDetails.timeSlot }}`
    *   **Embeds Description**: `**Punto de Dolor:** {{ $json.body.data.summary.painPoint }}`
    *   **Fields**: Añade campos para `Contacto`, `Temperatura` y `Etiquetas` usando las expresiones de n8n.

### 6. Notificaciones para Otros Leads

Conecta un nodo de email normal a la salida `false` del nodo `IF` para manejar leads con menor puntuación.

### 7. Activa tu Flujo de Trabajo

1.  **Guarda** tu flujo de trabajo.
2.  Haz clic en el **interruptor** para **Activarlo**.
3.  n8n te dará una **URL de Producción**. **Vuelve a `services/backendService.ts` y reemplaza la URL de Prueba con esta nueva URL de Producción.**

¡Felicidades! Ahora tienes un sistema de calificación y enrutamiento de leads completamente automatizado.