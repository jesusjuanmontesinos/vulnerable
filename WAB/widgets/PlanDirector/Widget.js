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
var _esto_planDirector;

define(['dojo/_base/declare','jimu/BaseWidget', "dojox/xml/parser",
        "esri/graphic", 'dojo/on', 'dojo/_base/lang', 'dijit/Dialog',
        "dojo/store/Memory", "dijit/form/FilteringSelect", 'esri/tasks/query', 'esri/tasks/QueryTask', 'esri/layers/FeatureLayer'],
function(declare, BaseWidget, xmlParser,
         Graphic, on, lang, Dialog,
        Memory, FilteringSelect, query, QueryTask, FeatureLayer ) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    // DemoWidget code goes here
	  baseClass: 'jimu-widget-PlanDirector',
    idMaximoDocumento:null,
    urlObtenerServicio:null,
    dialog:null,
    listaElementosVulnerables:[],
    elementosVulnerables:[],
    tiposDocumentos:[],
    documentos:[],
    documentosPlan:[],
    idMaximoPlanDirector:null,
    idMaximoDocumentoPlanDirector:null,
    filterSelectDocumentos:null,
	
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
      _esto_planDirector = this
      if (this.config) {
        this.urlObtenerServicio = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSRiesgo
      }
      //this.executeActionElementosVulnerables()
      this.cargarElementosVulnerables()
      this.crearSelectElementosVulnerables()
      this.executeActionDocumentos()
      this.getTipoDocumento()
      this.crearSelectTipoDocumentos()
      this.crearSelectDocumento()

      document.getElementById("btAniadirPlan").onclick = function () {_esto_planDirector.aniadirElementoVulnerable()}
      document.getElementById("btAniadirDocumentoPlan").onclick = function () {_esto_planDirector.aniadirDocumentoPlanDirector()}
      document.getElementById("btAlta_plan").onclick = function () { _esto_planDirector.validarPlanDirector() }
      document.getElementById("btCerrarPlan").onclick = function () { _esto_planDirector.onCerrar(event) }
    },

    /**
    * ************************************************************************* Métodos sobre la parte de  vulnerabilidades ***************************************************************************************
    */
    cargarElementosVulnerables: function () {
      try {
        var peticionSoap = this.crearRequest(null, this.config.funcionGetElementosVulnerables)
        var xmlhttp = new XMLHttpRequest();
          xmlhttp.open('POST', this.urlObtenerServicio, true);

          xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
              if (xmlhttp.status == 200) {
                var data = xmlParser.parse(xmlhttp.response);
                var tagname = _esto_planDirector.config.tagNameGetElementosVulnerables 
                var elementosVulnerables = dojo.query(tagname, data)[0].childNodes;
                for (let index = 0; index < elementosVulnerables.length; index++) {
                  var  descripcion = _esto_planDirector.parsearDescripcion(elementosVulnerables[index])
                  _esto_planDirector.listaElementosVulnerables.push( {"id":parseInt(descripcion.id),"name":descripcion.descripcion, } )
                }
              }
            }
          }
          xmlhttp.setRequestHeader('Content-Type', 'text/xml');
          xmlhttp.send(peticionSoap);
      } catch (error) {
        console.error("Se ha producido un error en el método-> cargarElementosVulnerables()")
        this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error en el método-> cargarElementosVulnerables()")
      }
    },
    /** 
     * Select de autocompletado en el aparatado de  Localizaciones
     * */
    crearSelectElementosVulnerables: function () {
      new FilteringSelect({
        id: "campoNombreElementoVulnerablePlan",
        name: "selectElementoVulnerablePlan",
        required : false,
        store: new Memory({
          data: _esto_planDirector.listaElementosVulnerables
        }),
        queryExpr:"*${0}*",
        autoComplete: false,
          style: "width: 80%;",
          searchAttr: "name",
       }, "campoNombreElementoVulnerablePlan");
    },
    aniadirElementoVulnerable: function () {
      var elementoVulnerable =   dojo.byId("campoNombreElementoVulnerablePlan").value
      var idElementoVulnerable = document.getElementsByName("selectElementoVulnerablePlan")[0].value

      if ((idElementoVulnerable && !isNaN(idElementoVulnerable)) && elementoVulnerable) {
        var table = document.getElementById("myTable_elementoPlan");
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        this.elementosVulnerables.push({"id":idElementoVulnerable,"nombre":elementoVulnerable})
        console.log(this.elementosVulnerables)
        cell1.innerHTML = `<td><p id="txt_elementoVulPlan" name="txt_elementoVulPlan">${elementoVulnerable}</p></td>`
        cell2.innerHTML = `<td><button id="btnEliminarElementoVulnerable" name="btnEliminarElementoVulnerable" type="button" dojoType="dijit.form.Button"  onclick='_esto_planDirector.eliminarElementoVulnerable(event)'>Eliminar</button></td>`
      }
    },
    eliminarElementoVulnerable :function (event) {
      var elemento  = event.target.parentElement.parentElement
      var pos = elemento.rowIndex
      document.getElementById("myTable_elementoPlan").deleteRow(pos)
      this.elementosVulnerables.splice(pos-1,1)
      console.log(this.elementosVulnerables)
    },
    eliminarElementosVulnerabilidades: function () {
      var filas = document.getElementById("myTable_elementoPlan").rows
      for (let index = 0; index < filas.length; index++) {
          if (index > 0) {
              document.getElementById("myTable_elementoPlan").deleteRow(index)
              index = 0
          }
      }
      this.elementosVulnerables = []
    },
    /**
    * ************************************************************************* Métodos sobre la parte de  documentación ***************************************************************************************
    */

    /** 
     * Método que obtiene los tipos de documentos
     * */
    getTipoDocumento : function () {
        var peticionSoap = this.crearRequest(null, this.config.funcionGetTiposDocumento)
    
          var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', this.urlObtenerServicio, true);
            xmlhttp.onreadystatechange = function () {
              if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                  var data = xmlParser.parse(xmlhttp.response);
                  var tagname = _esto_planDirector.config.tagNameGetTiposDocumento
                  var tipos = dojo.query(tagname, data)[0].childNodes;
                  for (let index = 0; index < tipos.length; index++) {
                    var  descripcion = _esto_planDirector.parsearDescripcion(tipos[index])
                    _esto_planDirector.tiposDocumentos.push( {"id":descripcion.id, "name":descripcion.descripcion} )
                  }
                }
              }
            }
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.send(peticionSoap);
    },
    /** 
     * Select de autocompletado para el campo tipo documento
     * */
    crearSelectTipoDocumentos: function () {

        this.filterSelectDocumentos = new FilteringSelect({
          id: "campoTipoDocumentoPlan",
          name: "filterTipoDocumentoPlan",
          required : false,
          store: new Memory({ data: _esto_planDirector.tiposDocumentos }),
          autoComplete: true,
          style: "width: 150;",
          searchAttr: "name",
          onChange: function(){
            _esto_planDirector.cargarDocumentosPlanDirector()
          }
       }, "campoTipoDocumentoPlan");
    },
    crearSelectDocumento: function () {
      new FilteringSelect({
          id: "campoDocumentoPlan",
          name: "comboDocumentoPlan",
          store: new Memory({ data: _esto_planDirector.documentos }),
          queryExpr:"*${0}*",
          autoComplete: false,
          style: "width: 80%;",
          required: false,
          searchAttr: "name",
      }, "campoDocumentoPlan");
    },
    obtenerDocumentos: function (results) {
        for (let index = 0; index < results.features.length; index++) {
          const feature = results.features[index]
          _esto_planDirector.documentos.push( {"id":feature.attributes.ID_DOCUMENTO+";"+feature.attributes.ID_TIPODOCUMENTO+";"+feature.attributes.ENLACE, "name":feature.attributes.NOMBRE} )
        }
        dijit.byId("campoDocumentoPlan").store.data =  _esto_planDirector.documentos.sort((a,b)=>{return a.name<b.name?-1: a.name>b.name?1:0});
    },
    cargarDocumentosPlanDirector : function () {
      debugger
      try {
        var tipoDocumento = document.getElementsByName("filterTipoDocumentoPlan")[0].value

        if (this.documentos.length !== 0) {
          _esto_planDirector.documentos = []
          dijit.byId("campoDocumentoPlan").store.data = [];
          dojo.byId("campoDocumentoPlan").value = "";
        }
        if (tipoDocumento) {
          this.executeActioDocumentosXTipo(tipoDocumento)
        } else if (tipoDocumento === "") {
          this.executeActionDocumentos()
        }
      } catch (e) {
        this.mostrarVentanaEmergenteMensajes("Plan Director","Se ha producido un error, " + e)
        console.error("Se ha producido un error, " + e)
      }
    },
    aniadirDocumentoPlanDirector: function () {
      var documento =   dojo.byId("campoDocumentoPlan").value
      var value = document.getElementsByName("comboDocumentoPlan")[0].value

      var idDocumento = value.split(";")[0]
      var idTipoDocumento = value.split(";")[1]

      if ((idDocumento && !isNaN(idDocumento)) && documento) {
        var table = document.getElementById("myTable_documentacionPlan");
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        this.documentosPlan.push({"id":parseInt(idDocumento),"nombre":documento})
        for (let index = 0; index < this.tiposDocumentos.length; index++) {
          if (parseInt(this.tiposDocumentos[index].id) === parseInt(idTipoDocumento)) {
            cell1.innerHTML = `<td><p id="txt_tiposDocumentos" name="txt_tiposDocumentos">${this.tiposDocumentos[index].name}</p></td>`
            break;
          }
        }
        var enlace = value.split(";")[2].replaceAll("\\","/")
        enlace = this.config.enlace + this.config.urlProxy + "file:" + enlace
        cell2.innerHTML = `<td><a href='${enlace}' target='_blank' id="txt_documentoPlan" name="txt_documentoPlan">${documento}</a></td>`
        cell3.innerHTML = `<td><button id="btn_EliminarDocumentoPlan" name="btn_EliminarDocumentoPlan" type="button" dojoType="dijit.form.Button"  onclick='_esto_planDirector.eliminarDocumentoPlanDirector(event)'>Eliminar</button></td>`  
      }
      console.log(this.documentosPlan)

      //document.getElementsByName("filterTipoDocumentoPlan")[0].value = ""
      //dojo.byId("campoTipoDocumentoPlan").value = ""
      document.getElementsByName("comboDocumentoPlan")[0].value = ""
      dojo.byId("campoDocumentoPlan").value = ""

      //this.filterSelectDocumentos.onChange()
    },
    eliminarDocumentoPlanDirector :function (event) {
      debugger
      var elemento  = event.target.parentElement.parentElement
      var pos = elemento.rowIndex
      document.getElementById("myTable_documentacionPlan").deleteRow(pos)
      this.documentosPlan.splice(pos-1,1)
      console.log(this.documentosPlan)
    },
    eliminarTodosDocumentosPlan: function () {
      var filas = document.getElementById("myTable_documentacionPlan").rows
      for (let index = 0; index < filas.length; index++) {
          if (index > 0) {
              document.getElementById("myTable_documentacionPlan").deleteRow(index)
              index = 0
          }
      }
      this.documentosPlan = []
    },
     /**
    * **************************************************************************** Métodos de alta de plan director ***************************************************************************************
    */
    validarPlanDirector : function () {
      debugger
      try {
        if (
          document.getElementById("campoNombrePlan").value === ""
          ||
          this.elementosVulnerables.length === 0
          ) {
              this.mostrarVentanaEmergenteMensajes("Alta Plan Director","Los siguiente campos son obligatorios:Nombre Plan director<br/>Debe elegir un Elementos vulnerables")
              return;
          }
          this.altaPlanDirector()
      } catch(error) {
        this.mostrarVentanaEmergenteMensajes("Plan Director","Se ha producido un error en el método-> validarPlanDirector()")
        console.error("Se ha producido un error en el método-> validarPlanDirector()")
      }
    },
    altaPlanDirector: function () {
      debugger
      try {
        var peticionSoap = this.crearRequest("<tabla>" + this.config.layerRiesgos.nameLayer.PLANDIRECTOR + "</tabla>", "getNextVal")

        var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', this.urlObtenerServicio, true);

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var data = xmlParser.parse(xmlhttp.response);
                        var tagname = "getNextValReturn"
                        var maxId = dojo.query(tagname, data)[0].childNodes;
                        _esto_planDirector.idMaximoPlanDirector= maxId[0].nodeValue
                        _esto_planDirector.obtenerIdDocumentoPlanDirector()
                    }
                }
            }
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.send(peticionSoap);
      } catch(error) {
        console.error("Se ha producido un error en el método-> altaPlanDirector()")
      }
    },
    obtenerIdDocumentoPlanDirector: function () {
      debugger
      try {
        if (_esto_planDirector.documentosPlan.length === 0) {
          _esto_planDirector.idMaximoDocumentoPlanDirector = "0"
          _esto_planDirector.executeActionPlanDirector()
        } else {
          var peticionSoap = this.crearRequest(null, "getMaxIdDocumentoPlanDirector")

          var xmlhttp = new XMLHttpRequest();
              xmlhttp.open('POST', this.urlObtenerServicio, true);

               xmlhttp.onreadystatechange = function () {
                  if (xmlhttp.readyState == 4) {
                      if (xmlhttp.status == 200) {
                          var data = xmlParser.parse(xmlhttp.response);
                          var tagname = "getMaxIdDocumentoPlanDirectorReturn"
                          var maxId = dojo.query(tagname, data)[0].childNodes;
                          _esto_planDirector.idMaximoDocumentoPlanDirector= maxId[0].nodeValue
                          _esto_planDirector.executeActionPlanDirector()
                      }
                  }
              }
              xmlhttp.setRequestHeader('Content-Type', 'text/xml');
              xmlhttp.send(peticionSoap);
          }
      } catch(error) {
        this.mostrarVentanaEmergenteMensajes("Plan Director","Se ha producido un error")
        console.error("Se ha producido un error en el método-> altaPlanDirector()")
      }
    },
    executeActionDocumentos: function () {
      var myQuery = new query()
      myQuery.where = "1=1"
      myQuery.returnGeometry = false
      myQuery.outFields = ["*"]
      //Realizamos la busqueda
      var myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlDocumentos)
      myQueryTask.execute(myQuery, lang.hitch(this, this.obtenerDocumentos), lang.hitch(this, this.callbackErrorGenerico))
    },
    executeActioDocumentosXTipo: function (tipoDocumento) {
      var myQuery = new query()
      myQuery.where = "ID_TIPODOCUMENTO=" + tipoDocumento
      myQuery.returnGeometry = false
      myQuery.outFields = ["*"]
      //Realizamos la busqueda
      var myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlDocumentos)
      myQueryTask.execute(myQuery, lang.hitch(this, this.obtenerDocumentos), lang.hitch(this, this.callbackErrorGenerico))
    },
    executeActionPlanDirector: function () {
      try {
        debugger
        console.log(this.elementosVulnerables)
        console.log(this.documentosPlan)

        if ((this.idMaximoPlanDirector && parseInt(this.idMaximoPlanDirector) > -1) && (this.idMaximoDocumentoPlanDirector && parseInt(this.idMaximoDocumentoPlanDirector) > -1)) {
          var attributes = {};
          attributes["ID_Plan"] = parseInt(this.idMaximoPlanDirector)
          attributes["Nombre"] = document.getElementById("campoNombrePlan").value
          attributes["Descripcion"] = document.getElementById("campoDescripcionPlan").value
          
          var addFeature = new Graphic({
            attributes: attributes,
          });

          this.idMaximoPlanDirector = attributes["ID_Plan"]

          var planDirector_objectId = 0
          var listaObjectIdElementosVulnerables = []

          var newFeaturePlan = new FeatureLayer(this.config.layerRiesgos.seviceUrlPlanDirector);
          var newFeatureElementoVulP = new FeatureLayer(this.config.layerRiesgos.seviceUrlElementoVulnerableP);
          var newFeatureDocumentacion = new FeatureLayer(this.config.layerRiesgos.seviceUrlDocumentosPlan);

          //insert objects planDirector
          newFeaturePlan.applyEdits([addFeature], null, null).then(function(result) {
            debugger 
            console.log(result)
            if (result && result[0]["success"] === true) {
              planDirector_objectId = result[0]["objectId"]
              if (_esto_planDirector.documentosPlan.length == 0 && _esto_planDirector.elementosVulnerables.length == 0) {
                _esto_planDirector.mostrarVentanaEmergenteMensajes("Plan Director","Se ha insertado correctamente el plan director")
                _esto_planDirector.limpiarFormularioPlanDirector()
              } else {
                //update ids of id_plandirector in the table elemento vulnerable
                //var arrayIds = _esto_planDirector.elementosVulnerables.map(ev=> ev.id);
                newFeatureElementoVulP.queryFeatures({
                  outFields: ["*"],
                  returnGeometry: true
                })
                  .then(function(results) {//inicio update
                    console.log(results)
                    if (results.features.length > 0) {
                      for (let i = 0; i < results.features.length; i++) {
                        for (let c = 0; c < _esto_planDirector.elementosVulnerables.length; c++) {
                          if (results.features[i].attributes.ID_ELEMENTOVULNERABLEP === parseInt(_esto_planDirector.elementosVulnerables[c].id)) {
                            let editFeature = results.features[i]
                            editFeature.attributes.ID_PLANDIRECTOR = _esto_planDirector.idMaximoPlanDirector
                            newFeatureElementoVulP.applyEdits(null,[editFeature],null)
                            listaObjectIdElementosVulnerables.push(editFeature)
                          }
                        }
                      }
                      if (_esto_planDirector.documentosPlan.length > 0) {
                        var listaDocumento = new Array(_esto_planDirector.documentosPlan.length)
                        for (let index = 0; index < _esto_planDirector.documentosPlan.length; index++) {
                          var documentosPlanAttributes = {};
                          documentosPlanAttributes["ID_DocPlan"] = (parseInt(_esto_planDirector.idMaximoDocumentoPlanDirector)+index)
                          documentosPlanAttributes["ID_Plan"] = _esto_planDirector.idMaximoPlanDirector
                          documentosPlanAttributes["ID_Documento"] = parseInt(_esto_planDirector.documentosPlan[index].id)
                        
                          var addFeatureDocumentoPlan = new Graphic({
                            attributes: documentosPlanAttributes,
                          });
                          listaDocumento[index] = addFeatureDocumentoPlan
                        }

                        newFeatureDocumentacion.applyEdits(listaDocumento, null, null).then(function(result) {//insert documentos inicio
                          debugger
                          console.log(result)
                          if (result) {
                            for (let index = 0; index < result.length; index++) {
                              if (result[index]["success"] === true) {
                                if (index === result.length-1) {
                                  _esto_planDirector.mostrarVentanaEmergenteMensajes("Alta Plan Director","Se ha insertado correctamente el Plan Director")
                                  _esto_planDirector.limpiarFormularioPlanDirector()
                                }
                              } else {
                                _esto_planDirector.executeActionEliminarPlanDirector(newFeaturePlan,planDirector_objectId)
                                _esto_planDirector.executeActionEliminarElementosVulnerables(newFeatureElementoVulP,listaObjectIdElementosVulnerables)
                                _esto_planDirector.executeActionEliminarDocumentosPlanDirector(newFeatureDocumentacion,result)
                                _esto_planDirector.mostrarVentanaEmergenteMensajes("Error",result[index]["error"]["message"])
                                break;
                              }
                            }
                          } else {
                            _esto_planDirector.executeActionEliminarPlanDirector(newFeaturePlan,planDirector_objectId)
                            _esto_planDirector.executeActionEliminarElementosVulnerables(newFeatureElementoVulP, listaObjectIdElementosVulnerables)
                            _esto_planDirector.mostrarVentanaEmergenteMensajes("Alta Plan Director","No se ha guardado Plan Director")
                          }
                        }, function (error) { // insert fin
                          _esto_planDirector.mostrarVentanaEmergenteMensajes('ERROR', 'execute PlanDirector Error:<br />'+error.message)
                          _esto_planDirector.executeActionEliminarPlanDirector(newFeaturePlan,planDirector_objectId)
                        });
                      } else {
                        _esto_planDirector.mostrarVentanaEmergenteMensajes("Alta Plan Director","Se ha guardado correctamente el Plan Director")
                        _esto_planDirector.limpiarFormularioPlanDirector()
                      }
                    } else {
                      _esto_planDirector.mostrarVentanaEmergenteMensajes("Alta Plan Director","No se ha guardado Plan Director")
                      _esto_planDirector.executeActionEliminarPlanDirector(newFeaturePlan,planDirector_objectId)
                    }

                  }, function (error) { //fin update
                      _esto_planDirector.mostrarVentanaEmergenteMensajes('ERROR', 'execute PlanDirector Error:<br />'+error.message)
                  });
              }
            } else {
              _esto_planDirector.mostrarVentanaEmergenteMensajes("Error",result[0]["error"]["message"])
            }
          }, function(error) {
            _esto_alta.mostrarVentanaEmergenteMensajes("Error", result[0]["error"]["message"])
          });
        } else {
          _esto_planDirector.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error")
        }
      } catch (error) {
        console.error("Se ha producido un error en el método-> executeActionPlanDirector()")
        this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error en el método-> executeActionPlanDirector()")
      }
    },
    limpiarFormularioPlanDirector: function () {
      try {
          document.getElementById("campoNombrePlan").value = ""
          document.getElementById("campoDescripcionPlan").value = ""
          dojo.byId("campoNombreElementoVulnerablePlan").value = ""
          document.getElementsByName("selectElementoVulnerablePlan")[0].value = ""
          this.eliminarElementosVulnerabilidades()
          this.eliminarTodosDocumentosPlan()
      } catch (e) {
          console.error("Se ha producido un error en el método-> limpiarFormularioPlanDirector()")
      }
    },
    executeActionEliminarPlanDirector: function (layer, objectId) {
      layer.queryFeatures({
          objectIds: [objectId],
          returnGeometry: false,
          outFields: ["*"]
      }).then(function(results) {
          if (results.features.length > 0) {
              layer.applyEdits(null,null,[results.features[0]]);
          }
      });
    },
    executeActionEliminarElementosVulnerables: function (layer,result) {

      let listaObjectIdElementosVulnerables = []
      for (let index = 0; index < result.length; index++) {
          listaObjectIdElementosVulnerables.push(result[index].attributes.OBJECTID)
      }

      layer.queryFeatures({
        objectIds: listaObjectIdElementosVulnerables,
        returnGeometry: true,
        outFields: ["*"]
      }).then(function(results) {
          if (results.features.length > 0) {
            for (let index = 0; index < results.features.length; index++) {
              let editFeature = results.features[index]
              editFeature.attributes.ID_PLANDIRECTOR = null
              layer.applyEdits(null,[editFeature],null);
            }
          }
      });
    },
    executeActionEliminarDocumentosPlanDirector: function (layer,result) {
      let objectIdDocumentosPlanDirector = []
      for (let index = 0; index < result.length; index++) {
        if (result[index]["success"] === true) {
          objectIdDocumentosPlanDirector.push(result[index]["objectId"])
        }
      }

      layer.queryFeatures({
          objectIds: objectIdDocumentosPlanDirector,
          returnGeometry: false,
          outFields: ["*"]
      }).then(function(results) {
          if (results.features.length > 0) {
              layer.applyEdits(null,null,[results.features[0]]);
          }
      });
    },
    /**
    * ****************************************************************************** Otros métodos ************************************************************************************************************
    */
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
  onCerrar: function (event) {
    debugger
    if (event["path"])
        event.path[9].children[0].children[1].children[2].click()
    else
        document.getElementById("widgets_planDirector_Widget_8_panel").children[0].children[1].children[2].click()
  },
  shutdown: function () {
    console.info("shutDown PlanDirector::shutdown");
    this.limpiarFormularioPlanDirector()
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
    descripcion.id = _esto_planDirector.buscarEnArray(array.childNodes, "id");
    descripcion.descripcion = _esto_planDirector.buscarEnArray(array.childNodes, "descripcion");
    return descripcion
  },
  callbackErrorGenerico: function callbackErrorGenerico(error) {
    console.log('CrearParquesBomberos::callbackErrorGenerico', error);
  },
  onClose: function () {
    this.shutdown();
  }
})

});