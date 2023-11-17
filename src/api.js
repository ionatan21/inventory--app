const express = require("express");
const cors = require('cors');
const axios = require("axios");
const app = express();
const { ejecutarScript } = require("./server.js");
const { refreshNewToken } = require("./server.js");
const tiempoEspera = 600000;

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'], // Métodos HTTP permitidos
};



// Habilitar CORS con opciones específicas
app.use(cors(corsOptions));

// Habilitar CORS para todas las rutas
app.use(cors());



app.get("/llamar_script", (req, res) => { 
  console.log("recargando el token")
  ejecutarScript();
  res.send("Script ejecutado con éxito desde el servidor");
});



app.listen(8000, () => {
  console.log("Servidor web escuchando en el puerto 8000");
});
