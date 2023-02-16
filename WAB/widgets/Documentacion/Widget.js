///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
var map;
var _esto_documentacion;

define(['dojo/_base/declare', 'jimu/BaseWidget', "dojox/xml/parser", "esri/graphic",'dojo/_base/lang', 'dijit/Dialog', 'esri/layers/FeatureLayer', 'esri/tasks/query', 'esri/tasks/QueryTask',],
function(declare, BaseWidget, xmlParser, Graphic, lang, Dialog, FeatureLayer, query, QueryTask) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    // DemoWidget code goes here
	  baseClass: 'jimu-widget-Documentación',
    idEditarDocumento:null,
    idMaximoDocumento:null,
    urlObtenerServicio:null,
    dialog:null,
	
    postCreate: function() {
      this.inherited(arguments);
      console.log('SeLanza post');
    },
    insertComboBoxElement: function (combo, text, value, selected) {
      var elOptNew = document.createElement('option');
      elOptNew.text = text;
      elOptNew.value = value;

      if (selected)
        elOptNew.selected = true;
      try {
        combo.add(elOptNew, null); // standards compliant; doesn't work in IE
      }
      catch (ex) {
        combo.add(elOptNew); // IE only
      }
    },
    startup: function() {
      debugger
      console.log("Widget Documentación")
      _esto_documentacion = this
      if (this.config) {
        this.urlObtenerServicio = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSRiesgo
      }
      this.getTipoDocumento()
      document.getElementById("btAltaDocumentacion").onclick = function () { _esto_documentacion.validarFormularioDocumento() }
      document.getElementById("btCerrarDocumentacion").onclick = function () { _esto_documentacion._onClose(event) }
    },
    rellenarFormularioDocumentacion: function (result) {
      try {
        document.getElementsByName("campoTipoDocumento")[0].options[this.getIndexTipoDocumento(result.features[0].attributes.ID_TIPODOCUMENTO)].selected = true
        document.getElementsByName("campoNombre")[0].value = result.features[0].attributes.NOMBRE
        document.getElementsByName("campoDescripcion")[0].value = result.features[0].attributes.DESCRIPCION
        document.getElementsByName("campoEnlace")[0].value = result.features[0].attributes.ENLACE
        this.setIdEditarDocumento(result)
      } catch (e) {
        console.error("Se ha producido un error, " + e)
        this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error, " + e)
      }
    },
    limpiarFormularioDocumentacion: function () {
      try {
        document.getElementsByName("campoTipoDocumento")[0].options[0].selected = true
        document.getElementsByName("campoNombre")[0].value = ""
        document.getElementsByName("campoDescripcion")[0].value = ""
        document.getElementsByName("campoEnlace")[0].value = ""
      } catch (e) {
        console.error("Se ha producido un error, " + e)
        this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error, " + e)
      }
    },
    setIdEditarDocumento : function (result) {
      this.idEditarDocumento = result.features[0].attributes.OBJECTID
    },
    getIndexTipoDocumento : function (id_tipoDocumento) {
      try {
        var id = 0;
        var options = document.getElementsByName("campoTipoDocumento")[0]
        for (let i = 0; i < options.length; i++) {
          if (parseInt(options.options[i].value) === id_tipoDocumento) {
            id = options.options[i].index
          }
        }
        return id;
      } catch (e) {
        console.error("Se ha producido un error, " + e)
        this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error, " + e)
      }
    },
    /** 
    Método que obtiene los tipos de documentos de la tabla TIPODOCUMENTO
    * */
    getTipoDocumento : function () {
        try {
          var peticionSoap = this.crearRequest(null, this.config.funcionGetTiposDocumento)

          var xmlhttp = new XMLHttpRequest();
              xmlhttp.open('POST', this.urlObtenerServicio, true);

              xmlhttp.onreadystatechange = function () {
                  if (xmlhttp.readyState == 4) {
                      if (xmlhttp.status == 200) {
                          var data = xmlParser.parse(xmlhttp.response);
                          var tagname = _esto_documentacion.config.tagNameGetTiposDocumento
                          var tipos = dojo.query(tagname, data)[0].childNodes;
                          var selectTipos = dojo.byId("campoTipoDocumento");
                          for (let index = 0; index < tipos.length; index++) {
                              var  descripcion = _esto_documentacion.parsearDescripcion(tipos[index])
                              _esto_documentacion.insertComboBoxElement(selectTipos, descripcion.descripcion, descripcion.id)
                          }
                      }
                  }
              }
              xmlhttp.setRequestHeader('Content-Type', 'text/xml');
              xmlhttp.send(peticionSoap);
        } catch (e) {
          console.error("Se ha producido un error, " + e)
          this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error, " + e)
        }
    },
    /** 
    * Este método obtiene el id_documento maximo de la tabla DOCUMENTOS
    * */
    altaDocumento: function () {
      debugger
          try {
            var peticionSoap = this.crearRequest("<tabla>" + this.config.layerRiesgos.nameLayer.DOCUMENTOS + "</tabla>", "getNextVal")
    
            var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', this.urlObtenerServicio, true);
    
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        if (xmlhttp.status == 200) {
                            var data = xmlParser.parse(xmlhttp.response);
                            var tagname = "getNextValReturn"
                            var maxId = dojo.query(tagname, data)[0].childNodes;
                            _esto_documentacion.idMaximoDocumento = maxId[0].nodeValue
                            _esto_documentacion.executeActionAltaDocumento()
                        }
                    }
                }
                xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                xmlhttp.send(peticionSoap);
          } catch (e) {
            console.error("Se ha producido un error, " + e)
            this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error, " + e)
          }
    },
    validarFormularioDocumento : function () {
        debugger
        if (
          document.getElementsByName("campoTipoDocumento")[0].options[document.getElementsByName("campoTipoDocumento")[0].selectedIndex].value === ""
            ||
            document.getElementById("campoNombre").value === ""
            ||
            document.getElementById("campoEnlace").value === ""
            ) {
                this.mostrarVentanaEmergenteMensajes("Alta Documentación", "Los siguiente campos son obligatorios:<br/>Tipo documento<br/>Nombre<br/>Enlace")
                return;
            }
        if (document.getElementsByName("btAltaDocumentacion")[0] === undefined)
          this.executeActionEditarDocumento()
        else
          this.altaDocumento()
    },
    executeActionDocumento: function () {
      var myQuery = new query()
      myQuery.where = "ID_DOCUMENTO=" + id_documento
      myQuery.returnGeometry = false
      myQuery.outFields = ["*"]
      //Realizamos la busqueda
      var myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlDocumentos)
      myQueryTask.execute(myQuery, lang.hitch(this, this.rellenarFormularioDocumentacion), lang.hitch(this, this.callbackErrorGenerico))
    },
    executeActionAltaDocumento: function () {
        try {
          debugger
          if (_esto_documentacion.idMaximoDocumento && parseInt(_esto_documentacion.idMaximoDocumento) > -1) {
              var attributes = {};
              attributes["ID_Documento"] = _esto_documentacion.idMaximoDocumento
              attributes["ID_TipoDocumento"] =  parseInt(document.getElementsByName("campoTipoDocumento")[0].value)
              attributes["Documento"] = null
              attributes["Nombre"] = document.getElementById("campoNombre").value
              attributes["Descripcion"] = document.getElementById("campoDescripcion").value
              attributes["Enlace"] = document.getElementById("campoEnlace").value

              var addFeature = new Graphic({
                  attributes: attributes,
              });

              var newFeature = new FeatureLayer(this.config.layerRiesgos.seviceUrlDocumentos);
              newFeature.applyEdits([addFeature], null, null, 
              function (result) {
                debugger
                if (result) {
                  if (result[0]["success"] === true) {
                    _esto_documentacion.mostrarVentanaEmergenteMensajes("Documentación","Se ha insertado correctamente")
                    _esto_documentacion.limpiarFormularioDocumentacion()
                  } else {
                    _esto_documentacion.mostrarVentanaEmergenteMensajes("Error",result[0]["error"]["message"])
                  }
                } else {
                  _esto_documentacion.mostrarVentanaEmergenteMensajes("Documentación","No se ha insertado el documento")
                }
              }, 
              lang.hitch(this, this.callbackErrorGenerico));
          } else {
            this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error, " + e)
          }
        } catch (e) {
          console.error("Se ha producido un error, " + e)
          this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error, " + e)
        }
    },
    executeActionEditarDocumento: function () {
      debugger
      try {
        var featureLayer = new FeatureLayer(this.config.layerRiesgos.seviceUrlDocumentos);
        featureLayer.queryFeatures({
            objectIds: [_esto_documentacion.idEditarDocumento],
            outFields: ["*"],
            returnGeometry: true
          })
            .then(function(results) {
              try {
                let editFeature = results.features[0]
                editFeature.attributes.ID_TIPODOCUMENTO = document.getElementsByName("campoTipoDocumento")[0].options[document.getElementsByName("campoTipoDocumento")[0].selectedIndex].value
                editFeature.attributes.DOCUMENTO = null
                editFeature.attributes.NOMBRE = document.getElementsByName("campoNombre")[0].value
                editFeature.attributes.DESCRIPCION = document.getElementsByName("campoDescripcion")[0].value
                editFeature.attributes.ENLACE = document.getElementsByName("campoEnlace")[0].value

                featureLayer.applyEdits(null,[editFeature],null)
                _esto_documentacion.mostrarVentanaEmergenteMensajes('Edición Documento', 'Se ha editado correctamente')
                _esto_documentacion.limpiarFormularioDocumentacion()
              } catch (e) {
                _esto_documentacion.mostrarVentanaEmergenteMensajes('ERROR', "Se ha producido un error, " + e)
                console.error(e)
              }
            }, function (error) {
              _esto_documentacion.mostrarVentanaEmergenteMensajes('ERROR', 'Update Error:<br />'+error.message)
            })
      } catch (e) {
        _esto_documentacion.mostrarVentanaEmergenteMensajes('ERROR', "Se ha producido un error, " + e)
        console.error(e)
      }
    },
    mostrarVentanaEmergenteMensajes: function (titulo,contenido) {
      this.dialog = new Dialog({
        title: titulo,
        content: contenido,
        style: "width: 300px",
        onHide: function onHide() {
        }});
        this.dialog.set("buttonOk", "Aceptar");
        this.dialog.on('execute', lang.hitch(this, function () {
        //No hacer nada
        }));
      this.dialog.show();
    },
    buscarEnArray:  function(array, localname) {
        var valor;
        var baseName;		 
        for (var x = 0; x < array.length; x++) {
            if (array[x].baseName) {//En ie localname no existe
                baseName = array[x].baseName;
            } else {
                baseName = array[x].localName;
            }
            if (baseName == localname) {
                if (array[x].lastChild) {
                    valor = array[x].lastChild.data;
                } else { valor = ""; }
                break;
            }
        }
        return valor;
    },
    crearRequest: function (parametros, metodo) {
        var soapRequest = "";
        if (parametros != null) {
            soapRequest = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' > <soapenv:Header><Access-Control-Allow-Origin>*</Access-Control-Allow-Origin></soapenv:Header> <soapenv:Body>" +
                "<" + metodo + "> " + parametros + " </" + metodo + "></soapenv:Body></soapenv:Envelope>";
        } else {
            soapRequest = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' ><soapenv:Header><Access-Control-Allow-Origin>*</Access-Control-Allow-Origin></soapenv:Header> <soapenv:Body>" +
                "<" + metodo + "/></soapenv:Body></soapenv:Envelope>";
        }
        return soapRequest;
    },
    parsearDescripcion: function (array) {
        var descripcion = {}
        descripcion.id = _esto_documentacion.buscarEnArray(array.childNodes, "id");
        descripcion.descripcion = _esto_documentacion.buscarEnArray(array.childNodes, "descripcion");
        return descripcion
    },
    cambiarActionBoton:function (atributoViejo, atributoNuevo, contenido) {

      if (document.getElementById(atributoViejo) != null) {
        document.getElementById(atributoViejo).name = atributoNuevo
        document.getElementById(atributoViejo).id = atributoNuevo
        document.getElementById(atributoNuevo).textContent = contenido
        document.getElementById(atributoNuevo).onclick = function () { _esto_documentacion.validarFormularioDocumento() }
      }
    },
    onOpen: function onOpen() {
      try {
        console.log('Documentación::onOpen');
        if (id_documento) {
          this.executeActionDocumento()
          this.cambiarActionBoton("btAltaDocumentacion","btEditarDocumentacion","Editar")
        }
        console.log(id_documento)
      } catch (e) {

      }
    },
    _onClose: function (event) {
        debugger
        if (event["path"] != undefined)
            event.path[9].children[0].children[1].children[2].click()
        else
            document.getElementById("widgets_documentacion_Widget_6_panel").children[0].children[1].children[2].click()
    },
    onClose: function () {
      this.limpiarFormularioDocumentacion()
      this.cambiarActionBoton("btEditarDocumentacion","btAltaDocumentacion","Alta")
      id_documento = undefined
    },
    callbackErrorGenerico: function callbackErrorGenerico(error) {
        console.log('Se ha producido un error, ', error);
    },
  })
});