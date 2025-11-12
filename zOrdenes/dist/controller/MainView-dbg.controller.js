/* eslint-disable fiori-custom/sap-no-hardcoded-url */
/* eslint-disable max-statements */
/* eslint-disable no-console */
sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Filter, FilterOperator, MessageBox) {
    "use strict";
    return Controller.extend("zOrdenes.controller.MainView", {
      onInit() {
        this.oTable = this.byId("table");
        this.oFileUploader = this.byId("_IDGenFileUploader");
        this.oButtonDownload = this.byId("oButtonDownload");
        this.oColumn = this.byId("FechaEntrega");
        this.oCountsModel = new sap.ui.model.json.JSONModel({
          all: 0,
          opened: 0,
          PorFacturar: 0,
          Facturado: 0,
        });
        this.getView().setModel(this.oCountsModel, "countsModel");
        this._filters = {
          date: [],
          search: [],
        };
      },
      onAfterRendering: function () {
        this.contadorgeneral();
      },

      onPress: function (oEvent) {
        const oItem = oEvent.getSource();
        const oContext = oItem.getBindingContext("localModel");
        const sNoPedido = oContext.getProperty("NoPedido");

        //pasa el id como parametro en la url
        this.getOwnerComponent().getRouter().navTo("object", {
          orderId: sNoPedido,
        });
      },
      onQuickFilter: function (oEvent) {
        const sKey = oEvent.getParameter("key");
        switch (sKey) {
          case "all":
            this._showAllItems();
            break;
          case "opened":
            this._showOpenItems();
            break;
          case "toinvoice":
            this._showToInvoiceItems();
            break;
          case "invoiced":
            this._showInvoicedItems();
            break;
          default:
            console.log(`Filtro no reconocido: ${sKey}`);
            this._showAllItems(); // Por seguridad, mostrar todo
        }
      },

      _showOpenItems: function () {
        const oBinding = this.oTable.getBinding("items");
        const oFilter = new Filter("Pendiente", FilterOperator.EQ, true);
        this._aCurrentFilters = [oFilter];
        oBinding.filter(this._aCurrentFilters);
        this.oTable.setMode("None");
        this.oFileUploader.setVisible(false);
        this.oButtonDownload.setVisible(false);
        this.oColumn.setVisible(false);
      },
      _showAllItems: function () {
        const oBinding = this.oTable.getBinding("items");
        this._aCurrentFilters = [];
        oBinding.filter([]);
        this.oTable.setMode("None");
        this.oFileUploader.setVisible(false);
        this.oButtonDownload.setVisible(false);
        this.oColumn.setVisible(true);
      },
      _showToInvoiceItems: function () {
        const oBinding = this.oTable.getBinding("items");
        const oFilter = new Filter("PorFacturar", FilterOperator.EQ, true);
        this._aCurrentFilters = [oFilter];
        oBinding.filter(this._aCurrentFilters);
        this.oColumn.setVisible(true);
        this.oTable.setMode("SingleSelectLeft");
        this.oFileUploader.setVisible(true);
        this.oButtonDownload.setVisible(false);
      },
      _showInvoicedItems: function () {
        const oBinding = this.oTable.getBinding("items");
        const oFilter = new Filter("Facturado", FilterOperator.EQ, true);
        this._aCurrentFilters = [oFilter];
        oBinding.filter(this._aCurrentFilters);
        this.oTable.setMode("SingleSelectLeft");
        this.oFileUploader.setVisible(false);
        this.oButtonDownload.setVisible(true);
        this.oColumn.setVisible(true);
      },

      applySearchFilter: function (sQuery) {
        const aColumnas = ["NoPedido", "Solicitante"];
        sQuery = sQuery.trim().toLowerCase();

        if (sQuery) {
          const aSearchFilters = aColumnas.map(
            (sCol) =>
              new sap.ui.model.Filter({
                path: sCol,
                operator: sap.ui.model.FilterOperator.Contains,
                value1: sQuery,
                caseSensitive: false,
              })
          );

          this._filters.search = [
            new sap.ui.model.Filter({ filters: aSearchFilters, and: false }),
          ];
        } else {
          this._filters.search = [];
        }

        this.applyAllFilters();
      },

      applyDateFilter: function () {
        this.oDateRange = this.byId("filterdate");
        const oFirstDate = this.oDateRange.getDateValue();
        const oSecondDate = this.oDateRange.getSecondDateValue();

        if (oFirstDate && oSecondDate) {
          const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: "yyyy-MM-dd",
          });
          const sFirst = oDateFormat.format(oFirstDate);
          const sSecond = oDateFormat.format(oSecondDate);

          this._filters.date = [
            new Filter("Fechadeentrega", FilterOperator.BT, sFirst, sSecond),
          ];
        } else {
          this._filters.date = [];
        }

        this.applyAllFilters();
      },
      applyAllFilters: function () {
        const oBinding = this.oTable.getBinding("items");

        const aCombinedFilters = [
          ...this._filters.date,
          ...this._filters.search,
        ];

        oBinding.filter(aCombinedFilters, "Application");
      },
      onSearch: function (oEvent) {
        const sQuery = oEvent.getSource().getValue();
        this.applySearchFilter(sQuery);
      },
      onSearchDate: function () {
        this.applyDateFilter();
      },

      contadorgeneral: function () {
        const oModel = this.getView().getModel("localModel");
        const aAllItems = oModel.getProperty("/Pedidos");

        this.oCountsModel.setData({
          all: aAllItems.length,
          opened: aAllItems.filter((pedido) => pedido.Pendiente === true)
            .length,
          PorFacturar: aAllItems.filter((pedido) => pedido.PorFacturar === true)
            .length,
          Facturado: aAllItems.filter((pedido) => pedido.Facturado === true)
            .length,
        });
      },
      currencyFormat: function (currency) {
        var oFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance({
          decimals: 2,
        });
        return oFormat.format(currency);
      },
      onSelectionChange: function (oEvent) {
        this.oFileUploader.setEnabled(true);
        this.oFileUploader.clear();
        const oSelectedParam = oEvent.getParameter("listItem");
        const oBindingContext = oSelectedParam.getBindingContext("localModel");
        this.oSelectedItem = oBindingContext.getObject();
        console.log("Item de tabla seleccionado:", this.oSelectedItem);
        this.RFCR = oBindingContext.getObject("RFCR");
        this.RFCE = oBindingContext.getObject("RFCE");
        var Posiciones = oBindingContext.getObject("Posiciones");
        var PrimeraPosicion = Posiciones[0];
        this.Moneda = PrimeraPosicion.Moneda;
        this.MetodoPago = oBindingContext.getObject("MetodoPago");
        var oSubtotal = oBindingContext.getObject("Subtotal");
        this.Subtotal = oSubtotal.toFixed(2);
        var oTotalImTr = oBindingContext.getObject("TotalImpuestosTrasladados");
        this.TotalImTr = oTotalImTr.toFixed(2);
        var oTotal = oBindingContext.getObject("Total");
        this.Total = oTotal.toFixed(2);
        console.log("RFC DEL ITEM:", this.RFCR);
        console.log("Tipo de moneda:", this.Moneda);
        console.log("Metodo de pago:", this.MetodoPago);
        console.log("Subtotal:", this.Subtotal);
        console.log("Total Impuestos Trasladados:", this.TotalImTr);
        console.log("Total:", this.Total);
      },

      onFileUploaderChange: function (oEvent) {
        const FileUploader = oEvent.getSource();
        var lFile = FileUploader.oFileUpload.files;
        var aFile = Array.from(lFile);
        if (aFile.length > 2) {
          MessageBox.error(
            "Solo se permiten seleccionar un máximo de 2 archivos."
          );
          FileUploader.clear();
          return;
        }
        var oFileXML = null;
        var oFilePDF = null;
        aFile.forEach(function (oFile) {
          if (oFile.type === "text/xml") {
            oFileXML = oFile;
          } else if (oFile.type === "application/pdf") {
            oFilePDF = oFile;
          } else {
            MessageBox.error("Solo se permiten archivos XML y PDF.");
            return;
          }
        });

        if (!oFileXML || !oFilePDF) {
          MessageBox.error("Por favor, selecciona un archivo XML y un PDF.");
          return;
        }
        // Procesar el XML
        var oReader = new FileReader();
        oReader.onload = function (e) {
          var sXMLContent = e.target.result;
          this._verifyFile(sXMLContent); // Función para procesar el XML
        }.bind(this);
        oReader.readAsText(oFileXML);
        FileUploader.clear();
      },
      _verifyFile: function (sXMLContent) {
        var oParser = new DOMParser();
        var oXMLDoc = oParser.parseFromString(sXMLContent, "text/xml");
        this.RFCRXML = oXMLDoc
          .getElementsByTagName("cfdi:Receptor")[0]
          .getAttribute("Rfc");
        this.RFCEXML = oXMLDoc
          .getElementsByTagName("cfdi:Emisor")[0]
          .getAttribute("Rfc");
        this.FolioFXML = oXMLDoc
          .getElementsByTagName("tfd:TimbreFiscalDigital")[0]
          .getAttribute("UUID");
        var MonedaXML = oXMLDoc
          .getElementsByTagName("cfdi:Comprobante")[0]
          .getAttribute("Moneda");
        var MetodoPagoXML = oXMLDoc
          .getElementsByTagName("cfdi:Comprobante")[0]
          .getAttribute("MetodoPago");
        var SubtotalXML = oXMLDoc
          .getElementsByTagName("cfdi:Traslado")[0]
          .getAttribute("Base");
        // ---- Arreglo para encontrar el cfdi: Impuestos con el atributo "TotalImpuestosTrasladados"
        var oImpuestos = oXMLDoc.getElementsByTagName("cfdi:Impuestos");
        var aImpuestos = Array.from(oImpuestos).find((Impuestos) => {
          return Impuestos.hasAttribute("TotalImpuestosTrasladados");
        });
        var TotalImTrXML = aImpuestos.getAttribute("TotalImpuestosTrasladados");
        //--------------------------------------------------------------------------------------------
        this.TotalXML = oXMLDoc
          .getElementsByTagName("cfdi:Comprobante")[0]
          .getAttribute("Total");
        console.log("RFCEXML:", this.RFCEXML);
        console.log("RFCR:", this.RFCRXML);
        console.log("SubtotalXML:", SubtotalXML);
        console.log("IVAXML:", TotalImTrXML);
        console.log("TotalXML", this.TotalXML);
        const aErrorMessages = [];

        // --- Validación 1: RFC del Receptor ---
        if (this.RFCRXML !== this.RFCR) {
          aErrorMessages.push("El RFC del Receptor no coincide.");
        }
        // --- Validación 2: RFC del Emisor ---
        if (this.RFCEXML !== this.RFCE) {
          aErrorMessages.push("El RFC del Emisor no coincide.");
        }
        // --- Validación 3: Folio Fiscal ---
        if (this.FolioFXML.length < 1 && this.FolioFXML.length > 40) {
          aErrorMessages.push(
            "El Folio Fiscal debe de tener entre 1 a 40 caracteres alfanúmericos."
          );
        }
        // --- Validación 4: Moneda ---
        if (MonedaXML !== this.Moneda) {
          aErrorMessages.push("El tipo de Moneda no coicide.");
        }
        // --- Validación 5: Metodo de Pago ---
        if (MetodoPagoXML !== this.MetodoPago) {
          aErrorMessages.push("Metodo de Pago diferente.");
        }
        // --- Validación 6: Subtotal ---
        if (SubtotalXML !== this.Subtotal) {
          aErrorMessages.push("El subtotal no coincide.");
        }
        // --- Validación 7: IVA ---
        if (TotalImTrXML !== this.TotalImTr) {
          aErrorMessages.push("IVA incorrecto");
        }
        // --- Validación 8: Total ---
        if (this.TotalXML !== this.Total) {
          aErrorMessages.push("El Total no coincide.");
        }
        // --- Manejo de los resultados de la validación ---
        if (aErrorMessages.length > 0) {
          const sFullErrorMessage =
            "Error al cargar los archivos.\n" +
            "Se encontraron los siguientes problemas:\n\n" +
            aErrorMessages.join("\n");
          MessageBox.error(sFullErrorMessage);
          return false;
        } else {
          this.callSATService();
          this.onClean();
        }
      },
      callSATService: function () {
        var that = this;
        var sPath = jQuery.sap.getModulePath("zordenes");
        //var sUrl = sPath + "/ConsultaCFDIService.svc";
        var sUrl = "/api/ConsultaSAT";
        var sSoapRequest = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                xmlns:tem="http://tempuri.org/">
                <soapenv:Header/>
                <soapenv:Body>
                    <tem:Consulta>
                        <tem:expresionImpresa><![CDATA[?re=${this.RFCEXML}&rr=${this.RFCRXML}&tt=${this.TotalXML}&id=${this.FolioFXML}]]></tem:expresionImpresa>
                    </tem:Consulta>
                </soapenv:Body>
            </soapenv:Envelope>
            `;
        $.ajax({
          url: sUrl,
          type: "POST",
          dataType: "xml", 
          contentType: "text/xml; charset=utf-8",
          data: sSoapRequest,
          headers: {
            SOAPAction: "http://tempuri.org/IConsultaCFDIService/Consulta",
          },
          success: function (response) {
            var oXmlDoc = response;
            
            // Extrae el contenido de la respuesta cuando se hace el post.
            var estado =
              oXmlDoc.getElementsByTagName("a:Estado")[0]?.textContent || "";
            var codigoEstatus =
              oXmlDoc.getElementsByTagName("a:CodigoEstatus")[0]?.textContent ||
              "";
            var esCancelable =
              oXmlDoc.getElementsByTagName("a:EsCancelable")[0]?.textContent ||
              "";
            var estatusCancelacion =
              oXmlDoc.getElementsByTagName("a:EstatusCancelacion")[0]
                ?.textContent || "";

            // Valida si se pudo extraer algo
            if (!estado) {
              sap.m.MessageBox.error(
                "❌ No se pudieron extraer los datos de la respuesta del SAT."
              );
              return;
            }

            // Valida el estado de la factura para permitir su carga
            if (estado === "Vigente" || estado === "Timbrado") {
              // Espacio para hacer la carga del archivo
              that.oSelectedItem.PorFacturar = false;
              that.oSelectedItem.Facturado = true;

              // Mostrar al usuario la información extraída
              sap.m.MessageBox.information(
                "✅ Archivos subidos correctamente.\n\n" +
                  "Respuesta del SAT:\n" +
                  "📄 Estado: " +
                  estado +
                  "\n" +
                  "📌 Código Estatus: " +
                  codigoEstatus +
                  "\n" +
                  "🔄 Es Cancelable: " +
                  esCancelable
              );
            } else {
              sap.m.MessageBox.information(
                "❌ No es posible cargar la factura.\n\n" +
                  "Respuesta del SAT:\n" +
                  "📄 Estado: " +
                  estado +
                  "\n" +
                  "📌 Código Estatus: " +
                  codigoEstatus +
                  "\n" +
                  "🔄 Es Cancelable: " +
                  esCancelable +
                  "\n" +
                  "🚫 Estatus de Cancelación: " +
                  estatusCancelacion
              );
            }
            that.contadorgeneral();
          },
          error: function () {
            sap.m.MessageBox.error(
              "Error al conectar con el servicio del SAT."
            );
          },
        });
      },
      onClean: function () {
        this.oFileUploader.clear();
        this.oFileUploader.setEnabled(false);
        this.oTable.removeSelections();
      },
      onClearDateRange: function () {
        this.oDateRange.setDateValue(null);
        this.oDateRange.setSecondDateValue(null);
        this._filters.date = [];
        this.applyAllFilters();
      },
    });
  }
);
