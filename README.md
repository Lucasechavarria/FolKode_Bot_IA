## Ejecutar localmente

**Requisitos previos:**  Tener Node.js instalado en tu máquina.

1.  **Instalar dependencias**:
    Para instalar los paquetes necesarios, debes usar la bandera `--legacy-peer-deps` para resolver los conflictos de dependencias.
    
    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Configurar tu clave de API**:
    Crea un archivo llamado `.env` en la raíz de tu proyecto y añade tu clave de API de Gemini de la siguiente manera:
    
    ```
    GEMINI_API_KEY="TU_CLAVE_DE_API_AQUÍ"
    ```
    
    Reemplaza `TU_CLAVE_DE_API_AQUÍ` con la clave que obtuviste en AI Studio.

3.  **Ejecutar la aplicación**:
    Usa el script `dev` para iniciar el servidor de desarrollo que proporciona Vite.
    
    ```bash
    npm run dev
    ```

Este comando iniciará un servidor local y te dará una URL (como `http://localhost:5173`) para que veas tu bot funcionando en el navegador.

---

### ¿Por qué estos cambios?

* **`npm install --legacy-peer-deps`**: Este es el comando que realmente funcionó para ti debido al conflicto de dependencias entre React y `react-markdown`. Es crucial incluirlo para que otros usuarios no se topen con el mismo error.
* **`.env` vs `.env.local`**: Tu configuración de Vite está buscando la clave de API en un archivo `.env`, no en `.env.local`. Por eso, es más preciso cambiar la instrucción para que coincida.
* **`npm run dev`**: Este es el comando correcto para ejecutar el servidor de desarrollo que configuramos con Vite. El comando `npm run start` en tu `package.json` solo mostraba un mensaje, no iniciaba la aplicación.

Con este `README` actualizado, cualquier persona que descargue el proyecto podrá configurarlo y ejecutarlo sin problemas.