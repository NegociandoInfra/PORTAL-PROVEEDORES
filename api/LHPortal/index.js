const axios = require("axios");

module.exports = async function (context, req) {
  context.log("Proxy para servidor OData.");

  // Configuración de Credenciales
  const ODATA_USER = "train-24";
  const ODATA_PASS = "Welcome180618";

  // Codifica las credenciales en Base64 (formato requerido para Basic Authentication)
  const base64Credentials = Buffer.from(`${ODATA_USER}:${ODATA_PASS}`).toString(
    "base64"
  );

  const odataServer = "http://s4dhost.wdf.sap.corp:44310"; // servidor LH

  const odataPath = req.params.odataPath; // obtenemos el OData

  const sUrl = `${odataServer}/${odataPath}`; // construimos la url con el servidor y el odata

  try {
    // Ejecutar el GET al servidor de datos
    const odataResponse = await axios.get(sUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${base64Credentials}`,
      },
    });

    context.res = {
      status: odataResponse.status,
      body: odataResponse.data,
      headers: {
        "Content-Type":
          odataResponse.headers["content-type"] || "application/json",
      },
    };
  } catch (error) {
    context.log.error(
      "Error al obtener los datos del servidor:",
      error.message
    );
    let status = error.response?.status || 500;
    let message = `Error en la comunicación con el servidor OData. Código: ${status}`;

    if (status === 401) {
      message =
        "Error 401: Falló la autenticación con el servidor OData. Revisa el usuario/contraseña en el proxy.";
    }

    context.res = { status: status, body: message };
  }
};
