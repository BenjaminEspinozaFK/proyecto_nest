# MCP Server for NestJS Admin Tools

Este servidor MCP permite a un LLM (como Claude) interactuar con tu backend NestJS para gestionar usuarios vía chat.

## Instalación

1. Ve a la carpeta: `cd /home/benjamin/proyecto_nest/mcp-server`
2. Instala dependencias: `npm install`

## Configuración

- Edita `server.js` y reemplaza `ADMIN_TOKEN` con un JWT token válido de un admin (obténlo logueándote como admin en tu app).

## Ejecutar

- `npm start` o `node server.js`
- El server se queda corriendo.

## Integrar con Claude Desktop

1. Instala Claude Desktop.
2. En Settings > MCP Servers, agrega:
   - Command: `node /home/benjamin/proyecto_nest/mcp-server/server.js`
3. Reinicia Claude.
4. En chat, di cosas como: "Agrega un usuario llamado Juan con email juan@example.com, edad 25 y password 123456"

## Tools disponibles

- add_user: Agrega usuario
- find_user: Busca por email
- delete_user: Elimina por ID
