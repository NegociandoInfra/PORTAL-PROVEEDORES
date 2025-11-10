sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("zOrdenes.controller.Object", {
    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("object").attachPatternMatched(this._onObjectMatched, this);
    },

    _onObjectMatched: function (oEvent) {
      var sNoPedido = oEvent.getParameter("arguments").orderId; // obtiene el id de la url
      var oView = this.getView();
      var oModel = oView.getModel("localModel");

      var aOrders = oModel.getProperty("/Pedidos");

      var oSelectedOrder = null;
      var VboxFecha = this.byId("_IDGenVBox3");
      //---------------------------------------------
      oSelectedOrder = aOrders.find(function(oOrder) {
        return oOrder.NoPedido === sNoPedido;
    });
    if (oSelectedOrder) {
      this.getView().setModel(new JSONModel(oSelectedOrder), "pedidoModel");
    } else {
      console.error("Pedido no encontrado");
    }
      //---------------------------------------------
      if(oSelectedOrder.Pendiente===true){
        VboxFecha.setVisible(false);
      }else{
        VboxFecha.setVisible(true);
      }
     
    },
    currencyFormat: function (currency) {
      var oFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance({
        "decimals": 2
      });
      return oFormat.format(currency);
    }
    
    // Asigna el registro al modelo de vista (para binding en XML)
    /* Me sirve cuando tenga el odata
    var oFilter = new Filter("NoPedido", FilterOperator.EQ, sOrderId);
    oView.bindElement({
      path: "/Pedidos(" + sOrderId + ")", // ruta OData para detalle
      parameters: {
        filters: [oFilter]
      }
        
    });
    */
  });
});
