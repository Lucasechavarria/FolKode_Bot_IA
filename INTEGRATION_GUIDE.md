
# Guía de Integración del Backend

Esta guía explica cómo recibir los datos de los leads y las transcripciones de las conversaciones.

- **Para recibir reportes por email:** ¡Ya está listo! Ve a la [Opción 1](#opción-1-conexión-rápida-por-email-configuración-actual).
- **Para integrar con Discord, Slack, o un CRM:** Sigue los pasos en la [Opción 2](#opción-2-integración-avanzada-con-discord-crm-etc).

---

## Opción 1: Conexión Rápida por Email (Configuración Actual)

**La aplicación está configurada para enviar notificaciones por email usando [FormSubmit.co](https://formsubmit.co/), un servicio gratuito que no requiere registro.**

### Cómo Funciona

1.  **Endpoint de Email:** En el archivo `services/backendService.ts`, la variable `WEBHOOK_URL` está configurada para apuntar a tu dirección de email.
    ```typescript
    const WEBHOOK_URL = 'https://formsubmit.co/contactofolkode@gmail.com';
    ```
2.  **Activación Única:** La **primera vez** que la aplicación envíe un reporte (por ejemplo, después de que un usuario complete un chat), FormSubmit enviará un email de activación a `contactofolkode@gmail.com`. **Debes hacer clic en el enlace de ese email** para confirmar que eres el propietario y autorizar el envío de futuros emails.
3.  **Recibe Reportes:** Una vez activado, recibirás dos tipos de emails:
    *   **Nuevos Leads:** Una notificación inmediata cuando un usuario llena el formulario inicial.
    *   **Reportes Completos de Chat:** Un resumen detallado con el análisis de la IA (incluyendo puntuación, punto de dolor, etc.), la transcripción completa del chat y los detalles de la reunión al finalizar una conversación.

Este es el método más simple y rápido para poner en marcha el sistema.

---

## Opción 2: Integración Avanzada con Discord, CRM, etc.

Si necesitas flujos de trabajo más complejos (como enviar notificaciones a **Discord**, guardar leads en un **CRM como HubSpot**, o crear tareas en **Trello**), puedes usar una herramienta de automatización como **[n8n](https://n8n.io/)** (gratuita y de código abierto), **[Make.com](https://www.make.com/)**, o **[Zapier](https://zapier.com/)**.

Este enfoque te da control total sobre los datos.

### Guía Paso a Paso (usando n8n)

1.  **Crea un Webhook en n8n:**
    1.  Inicia sesión en tu instancia de n8n y crea un nuevo flujo de trabajo.
    2.  Como disparador ("trigger"), selecciona el nodo **Webhook**.
    3.  Copia la **URL de Prueba (Test URL)** que n8n genera.

2.  **Actualiza la URL en la Aplicación:**
    1.  Abre el archivo `services/backendService.ts`.
    2.  Reemplaza la URL de FormSubmit con la URL de tu webhook de n8n:
        ```typescript
        // Reemplaza esta línea
        const WEBHOOK_URL = 'https://formsubmit.co/contactofolkode@gmail.com';
        // Por tu URL de n8n
        const WEBHOOK_URL = 'https://tu-instancia-de-n8n.com/webhook-test/TU_ID_UNICO'; // <-- PEGA TU URL AQUÍ
        ```
    3.  **Importante:** Cuando uses un webhook genérico, es posible que quieras volver a enviar los datos como un objeto JSON anidado en lugar de los pares clave-valor aplanados para FormSubmit. Puedes ajustar el `body` en las funciones `saveLead` y `sendFullChatReport` para que se ajusten a tus necesidades.

3.  **Prueba y Construye tu Flujo de Trabajo:**
    1.  En n8n, haz clic en **"Listen for Test Event"**.
    2.  Usa tu aplicación y completa un chat para enviar datos de prueba.
    3.  n8n recibirá los datos. Ahora puedes añadir nodos para enviar emails, mensajes de Discord, guardar en una base de datos y más.

### 4. Añade Enrutamiento Avanzado (Nodo `IF`)

Ahora que tienes la "temperatura" y la "puntuación" del lead, puedes enrutar las notificaciones.

1.  Añade un nodo **IF** después del Webhook.
2.  Crea una condición para leads de alta prioridad: `{{ $json.body.leadScore }}` -> `Larger or Equal` -> `8`.
3.  Esto creará dos salidas: `true` (para leads de alta prioridad) y `false`.

### 5. Notificaciones para Leads de Alta Prioridad (Email y Discord Urgente)

Conecta los siguientes nodos a la salida `true` del nodo `IF`.

1.  **Mensaje de Discord Prioritario**:
    *   Crea un webhook en tu servidor de Discord (`Server Settings` > `Integrations` > `Webhooks`).
    *   En n8n, añade un nodo `Discord`.
    *   **Webhook URL**: Pega la URL de tu webhook de Discord.
    *   **Content**: `@here 🔥 ¡Lead de Puntuación Alta ({{ $json.body.leadScore }}/10)! Contactar a **{{ $json.body.user.split('(')[0].trim() }}**`
    *   **Embeds Title**: `Reunión solicitada para {{ $json.body.meeting_request.split('via')[0].trim() }}`
    *   **Embeds Description**: `**Punto de Dolor:** {{ $json.body.painPoint }}`
    *   **Fields**: Añade campos para `Contacto`, `Temperatura` y `Etiquetas` usando las expresiones de n8n.

2.  **Email Urgente**:
    *   Añade un nodo de email.
    *   **To Address**: `equipo-ventas-prioritario@ejemplo.com`
    *   **Subject**: `🔥🔥🔥 LEAD (Score: {{ $json.body.leadScore }}/10): {{ $json.body.user.split('(')[0].trim() }}`
    *   **HTML**:
        ```html
        <h3>Lead de Alta Prioridad Detectado</h3>
        <p><strong>Puntuación:</strong> {{ $json.body.leadScore }}/10</p>
        <p><strong>Usuario:</strong> {{ $json.body.user }}</p>
        <p><strong>Solicitud de reunión:</strong> <strong>{{ $json.body.meeting_request }}</strong></p>
        <hr>
        <h4>Análisis de la IA:</h4>
        <p><strong>Punto de Dolor Clave:</strong> <em>{{ $json.body.painPoint }}</em></p>
        <p><strong>Mención de Presupuesto:</strong> <em>{{ $json.body.budgetMention }}</em></p>
        <p><strong>Mención de Plazo:</strong> <em>{{ $json.body.timelineMention }}</em></p>
        <hr>
        <h4>Resumen del Chat:</h4>
        <blockquote>{{ $json.body.summary.replace(/\n/g, '<br>') }}</blockquote>
        ```

### 6. Notificaciones para Otros Leads

Conecta un nodo de Discord o email normal a la salida `false` del nodo `IF` para manejar leads con menor puntuación, sin la mención `@here`.

### 7. Activa tu Flujo de Trabajo

1.  **Guarda** tu flujo de trabajo en n8n.
2.  Haz clic en el **interruptor** para **Activarlo**.
3.  n8n te dará una **URL de Producción**. **Vuelve a `services/backendService.ts` y reemplaza la URL de Prueba con esta nueva URL de Producción.**

¡Felicidades! Ahora tienes un sistema de calificación y enrutamiento de leads completamente automatizado.
