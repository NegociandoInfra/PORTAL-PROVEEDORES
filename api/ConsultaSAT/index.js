const axios = require('axios'); //Libreria Axios

module.exports = async function (context, req) {
    context.log('Proxy para ConsultaCFDIService del SAT iniciado.');

    // 1. Obtener el cuerpo SOAP de la solicitud (de OpenUI5)
    const soapRequest = req.body; 

    if (!soapRequest) {
        context.res = {
            status: 400,
            body: "Error: No se encontró el cuerpo XML SOAP en la solicitud."
        };
        return;
    }

    const satUrl = "https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc";
    const soapActionHeader = "http://tempuri.org/IConsultaCFDIService/Consulta";

    try {
        // 2. Ejecutar la solicitud POST al servicio del SAT (servidor a servidor)
        const satResponse = await axios.post(satUrl, soapRequest, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': soapActionHeader
            }
        });

        // 3. Devolver la respuesta del SAT al cliente OpenUI5
        context.res = {
            status: satResponse.status,
            body: satResponse.data, // El XML de respuesta
            headers: {
                'Content-Type': 'text/xml; charset=utf-8'
            }
        };
        
    } catch (error) {
        context.log.error("Error al reenviar la solicitud al SAT:", error.message);

        // Devolver un mensaje de error detallado
        context.res = {
            status: error.response?.status || 500,
            body: `Error en la comunicación con el SAT (Proxy): ${error.message}`
        };
    }
};