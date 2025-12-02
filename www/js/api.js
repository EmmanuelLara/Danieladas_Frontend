// ⚠️ Ajusta esta IP/puerto cuando cambie tu servidor
const SERVER_URL = "http://192.168.1.72:4000";
const API_URL = `${SERVER_URL}/api`;

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