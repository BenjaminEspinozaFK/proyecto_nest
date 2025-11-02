import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";

const API_BASE = "http://localhost:3001"; // Tu backend NestJS
const ADMIN_TOKEN = "tu-jwt-token-de-admin-aqui"; // Reemplaza con un token real de admin (obténlo logueándote como admin)

const server = new Server(
  { name: "nestjs-admin-tools", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Tool 1: Agregar usuario
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "add_user") {
    const { name, email, age, password } = request.params.arguments;
    try {
      const response = await axios.post(
        `${API_BASE}/admins/users`,
        { name, email, age, password },
        {
          headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        }
      );
      return {
        content: [
          {
            type: "text",
            text: `Usuario agregado: ${JSON.stringify(response.data)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.response?.data?.message || error.message}`,
          },
        ],
      };
    }
  }

  // Tool 2: Buscar usuario
  if (request.params.name === "find_user") {
    const { email } = request.params.arguments;
    try {
      const response = await axios.get(
        `${API_BASE}/admins/users/search?email=${email}`,
        {
          headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        }
      );
      return {
        content: [
          {
            type: "text",
            text: `Usuario encontrado: ${JSON.stringify(response.data)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.response?.data?.message || error.message}`,
          },
        ],
      };
    }
  }

  // Tool 3: Eliminar usuario
  if (request.params.name === "delete_user") {
    const { id } = request.params.arguments;
    try {
      await axios.delete(`${API_BASE}/admins/users/${id}`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      return { content: [{ type: "text", text: `Usuario eliminado` }] };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.response?.data?.message || error.message}`,
          },
        ],
      };
    }
  }

  return { content: [{ type: "text", text: "Tool no reconocida" }] };
});

// Lista de tools disponibles
server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "add_user",
        description: "Agrega un nuevo usuario",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            age: { type: "number" },
            password: { type: "string" },
          },
          required: ["name", "email", "age", "password"],
        },
      },
      {
        name: "find_user",
        description: "Busca un usuario por email",
        inputSchema: {
          type: "object",
          properties: { email: { type: "string" } },
          required: ["email"],
        },
      },
      {
        name: "delete_user",
        description: "Elimina un usuario por ID",
        inputSchema: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("MCP server running");
