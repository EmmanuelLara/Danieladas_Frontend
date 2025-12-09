// ⚠️ Ajusta esta IP/puerto cuando cambie tu servidor
window.SERVER_BASE_URL = "https://tape-restricted-foundation-discharge.trycloudflare.com";
window.SERVER_URL = `${window.SERVER_BASE_URL}/api`;
const API_URL = `${window.SERVER_URL}`;

// Crea una sola instancia de axios y reutilízala
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Agrega el token automáticamente si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== Ejemplos de funciones de negocio =====

// Crear nuevo pedido
const crearPedido = async (pedido) => {
  const { data } = await api.post("/pedidos", pedido);
  return data;
};

// Obtener pedido por ID
const obtenerPedido = async (id) => {
  const { data } = await api.get(`/pedidos/${id}`);
  return data;
};

// Agrega más funciones según las necesites...