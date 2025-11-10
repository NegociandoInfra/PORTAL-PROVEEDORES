// Archivo: api/sat-consulta/index.js

const axios = require('axios');

module.exports = async function (context, req) {
    const satServiceUrl = 'https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc';
    
    // El cuerpo de la solicitud AJAX/SOAP (tu XML) está en req.body
    const sSoapRequest = req.body; 

    // 1. Verificar el método POST
    if (req.method !== "POST") {
        context.res = { status: 405, body: "Method Not Allowed. Use POST." };
        return;
    }

    try {
        // 2. Realiza la llamada POST/SOAP al SAT desde el servidor (sin CORS)
        const satResponse = await axios.post(
            satServiceUrl,
            sSoapRequest,
            {
                responseType: 'text',
                headers: {
                    // Headers esenciales para la petición SOAP
                    'Content-Type': 'text/xml; charset=utf-8', 
                    'SOAPAction': 'http://tempuri.org/IConsultaCFDIService/Consulta'
                },
                // Permite manejar códigos de error 4xx del SAT
                validateStatus: (status) => status >= 200 && status < 500 
            }
        );
        let cleanXmlString = satResponse.data.toString();
        // 3. Devuelve la respuesta del SAT a tu aplicación UI5
        context.res = {
            status: satResponse.status,
            body: cleanXmlString,
            headers: {
                'Content-Type': satResponse.headers['content-type'] || 'text/xml'
            }
        };

    } catch (error) {
        // Manejo de errores de conexión (ej. el SAT está caído)
        context.log('Error calling SAT service:', error.message);
        context.res = {
            status: error.response?.status || 500,
            body: "Error al intentar conectar con el servicio del SAT desde el backend."
        };
    }
};