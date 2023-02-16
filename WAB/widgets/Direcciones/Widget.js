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
var tipointer;
var RecursoFiltro;
var CapaGrafica;
var _esto;
//var esto;
var geometryService 

define(['dojo/_base/declare', 'dojo/html',"dojo/dom",'jimu/utils','jimu/PanelManager', 'jimu/BaseWidget',"dojox/xml/parser", "dojo/request","esri/tasks/ProjectParameters", 
"esri/tasks/GeometryService", "esri/graphic","esri/InfoTemplate","esri/layers/GraphicsLayer","esri/symbols/PictureMarkerSymbol",
"esri/geometry/Point","esri/SpatialReference","dojo/_base/connect", "dijit/registry",],
function(declare, html, dom, utils, PanelManager, BaseWidget, xmlParser, request, ProjectParameters, GeometryService, Graphic, InfoTemplate, 
    GraphicsLayer,PictureMarkerSymbol, Point, SpatialReference,connect, registry) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    // DemoWidget code goes here
	baseClass: 'jimu-widget-posicionamiento_Intervencion',
	atributosCandidato: null,
	urlObtenerDireccion: null,
	lsCandidatos: null,
	pkCalle30:null,// Variable que recoge los puntos km de la calle 30.  
	urlSLocalizacionPKCalle30:"",
	incluirPuntosInteres: null,
	nodosDirecciones: null,
    nodosNumeros: null,
	seleccionevent: null,
	urlObtenerDireccionCodigo: null,
	capaLocalizador: null,
	symAnillo:null,
	escala: null,
    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,
	

    postCreate: function() {
      this.inherited(arguments);
      console.log('SeLanza post');
    },
	
	limpiar: function () {
        //Inicializamos la variable atributos candidato
         this.atributosCandidato = new Array();
               //Limpiamos busquedas anteriores
               // this.clearGraphics();
               //Escondemos el div de mensajes
               //this.divMsgs.style.visibility = "hidden";
               //this.divMsgCoordenadas.style.visibility = "hidden";
               //Inicializamos la lista de candidatos
               this.lsCandidatos.length = 0;
               this.pkCalle30=null;           
    },
		
	/*showSpinner: function (/*boolean*//*showAnimation, nodo) {
               if (showAnimation) {
                   this.spinnerNodes[nodo].style.visibility = "visible";
               }
               else {
                   this.spinnerNodes[nodo].style.visibility = "hidden";
               }
    },*/
	
	definirParametros: function (operacion) {
        //************************************************************************
        //Recogemos las variables introducidas por los usuarios
        //Si el usuario esta buscando una dirección es necesario recoger: 
        //- tipoVia, nombreVia, numeroVia, calificador
        //Si el usuario busca un cruce solo debemos tener en cuenta:
        //- tipoVia, nombreVia
        //*************************************************************************
        var pm = PanelManager.getInstance();
        
        var direccion = document.getElementById("textSearch").value;
        var params = ""; //Inicializamos la variable
        if (direccion != "") {//Es un campo obligatorio
            // this.divMsgs.innerHTML = this.i18nStrings.msgNoCalle;
            // this.divMsgs.style.visibility = "visible";
            //esto.showSpinner(true, 0); //Activamos la imagen de espera
            params = params + "nombreVia=" + direccion;
            var tipoVia = document.getElementById("textTiposVia").value;
            if (tipoVia) //si existe lo añadimos
            {
                if (params == "")
                { params = params + "tipoVia=" + tipoVia; }
                else
                { params = params + "&tipoVia=" + tipoVia; }
            }
            if (operacion == "direccion") { //Si estamos buscando una dirección es necesario tener el cuenta el numero y el calificador
                var numero = document.getElementById("textNumber").value;
                if (numero) //si existe lo añadimos
                {
                    if (params == "")
                    { params = params + "numeroVia=" + numero; }
                    else
                    { params = params + "&numeroVia=" + numero; }
                }
                var calificador =document.getElementById("textCalificador").value;
                if (calificador) //si existe lo añadimos
                {
                    if (params == "")
                    { params = params + "calificadorVia=" + calificador.toUpperCase(); }
                    else
                    { params = params + "&calificadorVia=" + calificador.toUpperCase(); }
                }
            }
            if (params != "") { //Si tipoBusqueda=1 no se incluyen los puntos de interes, si es 3 si se incluyen

                params = params + "&tipoBusqueda=" + incluirPuntosInteres;
            }
        }
        return params;
    },

	insertCBElement: function (combo, text, value, selected) {
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

	obtenerValorXML: function (/*DOMNode*/node, /*String*/text) {
        var valor = "";
        try {
            var nodo = node.getElementsByTagName(text).item(0);
            if (nodo)
            { valor = nodo.firstChild.nodeValue; }
            else {

                valor = "";
            }
        } catch (ex2) {
            if (node.text) {
                valor = node.text;
            }
            else {
                valor = node.textContent;
            }
        }
        return valor;
    },
    crearParametros: function () {
        //Crearmos los parametros
        var params = "";
        if (this.atributosCandidato["codigoVia"]) //si existe lo añadimos
        {
            if (params == "")
            { params = params + "codigoVia=" + this.atributosCandidato["codigoVia"]; }
            else
            { params = params + "&codigoVia=" + this.atributosCandidato["codigoVia"]; }
        }
        if (this.atributosCandidato["numeroVia"]) //si existe lo añadimos
        {
            if (params == "")
            { params = params + "numeroVia=" + this.atributosCandidato["numeroVia"]; }
            else
            { params = params + "&numeroVia=" + this.atributosCandidato["numeroVia"]; }
        }
        return params;
    },
        
		    procesarCandidatos: function (response) {
           //**********************************************************************************
           //Metodo que permite gestionar los resultados de la consulta al servicio web de direcciones
           //Recibe: data: datos de respuesta, status: estado de la respuesta, req: Peticion realizada al servicio
           //El método carga los resultados en componente lscandidatos
           //**********************************************************************************  
				try {	
					var data = xmlParser.parse(response);
					var nodoErrores = data.getElementsByTagName(this.config.tagNameError).item(0);
                       if (nodoErrores) {
                        _esto.removeCB(this.lsCandidatos);
                           var textoError = this.obtenerValorXML(data, this.config.tagNameError);
                           _esto.insertCBElement(this.lsCandidatos, textoError, "");
                       } else {
                           this.nodosNumeros = data.getElementsByTagName(this.config.atributoNumero);

                           if (this.nodosNumeros.length > 0) {
                            _esto.removeCB(this.lsCandidatos);
                               for (var i = 0; i < this.nodosNumeros.length; i++) {
                                   var nodoDir = this.nodosNumeros[i];
                                   var nombreCalle = this.atributosCandidato["nombreVia"];
                                   var tipoVia = this.atributosCandidato["tipoVia"];
                                   var numero;
                                   if (nodoDir.text) {
                                       numero = nodoDir.text;
                                   }
                                   else {
                                       numero = nodoDir.textContent;
                                   }
                                   var cadena = tipoVia + " " + nombreCalle + " " + numero;
                                   this.insertCBElement(this.lsCandidatos, cadena);
                               }
                               if (this.lsCandidatos.length > 0) {
                                   this.lsCandidatos.focus();
                                   this.lsCandidatos.selectedIndex = 0;
                               }
                           }
                           else {
                               this.atributosCandidato["codigoVia"] = null;

                               //this.showAceptarDialog(true, this.i18nStrings.msgNoNumerosParaCalle, this.i18nStrings.msgTituloInformacion);
                           }
                       }

                   //this.showSpinner(false, 0);
               }
               catch (e) {
                   //this.showAceptarDialog(true, this.i18nStrings.msgNoCoincidencias, this.i18nStrings.msgTituloError);
                   //this.showSpinner(false, 0);
                   console.error("DireccionWidget::procesarCandidatos::", e);

               }
           },
		   
		    irCoordenadas: function (response) {
				var data = xmlParser.parse(response);
                var index = this.lsCandidatos.selectedIndex;
                var nodoErrores = data.getElementsByTagName(this.config.tagNameError).item(0);
                   if (nodoErrores) {
                    _esto.removeCB(this.lsCandidatos);
                       var textoError = this.obtenerValorXML(data, this.config.tagNameError);
                       _esto.insertCBElement(this.lsCandidatos, textoError, "");
                   } else {
                       this.nodosDirecciones = data.getElementsByTagName(this.config.atributoNumeroCompleto);
                       _esto.removeCB(this.lsCandidatos);
                       for (var i = 0; i < this.nodosDirecciones.length; i++) {
                           var nombreCalle = this.atributosCandidato["nombreVia"];
                           var tipoVia = this.atributosCandidato["tipoVia"];
                           var numero = this.atributosCandidato["numeroVia"];
                           var itemNumero = this.nodosNumeros[index];
                           this.nodosNumeros = [];
                           this.nodosNumeros.push(itemNumero);
                           var cadena = tipoVia + " " + nombreCalle + " " + numero;
                           _esto.insertCBElement(this.lsCandidatos, cadena);
                       }

                       if (this.lsCandidatos.length == 1) {
                           if (this.lsCandidatos.length > 0) {
                               this.lsCandidatos.focus();
                               this.lsCandidatos.selectedIndex = 0;
                           }
                           var atributos = this.nodosDirecciones[0];
                           this.atributosCandidato["utmX"] = this.obtenerValorXML(atributos, this.config.atributoUtmX);
                           this.atributosCandidato["utmY"] = this.obtenerValorXML(atributos, this.config.atributoUtmY);
                           _esto.localizar();
                       } /// <reference path="../../../../../Default.htm" />

                   }

               //this.showSpinner(false, 0);
           },
		
		seleccionHerramienta: function () {
        	//Permite diferenciar la herramienta que tenemos activa
            if (seleccionevent == "cruces") {
                this.cargarCruces();
               }
            else {
                this.onGo();
            }
        },
		
		removeCB: function (combo) {

			try {
				combo.length = 0;
			}
			catch (ex) {
				// combo.remove(0); // IE only
			}
		},
		onGo: function () {
               //**************************************************************************************************
               //Funcion que se ejecuta al seleccionar un candidato
               //Pueden ocurrir dos casos
               //1. Seleccion del nombre  de una calle. En este caso tienen que cargan todos los numeros de la calle
               //2. Seleccion de una direccion completa. En este caso localizamos
               //***************************************************************************************************
               var params = "";
               		if(this.pkCalle30)//Identificacion de los puntos km en la calle 30
               		{
               		    var x = parseFloat(this.pkCalle30[this.lsCandidatos.selectedIndex].feature.geometry.x);
                        var y = parseFloat(this.pkCalle30[this.lsCandidatos.selectedIndex].feature.geometry.y);
                        //Las coordenadas estan en ed50 planas
                        //Hay que pasarlas a geograficas
                        //Cambio de sistema de referencia
                        if (x > 0 && y > 0) {
                            var punto = new Point(x, y, map.spatialReference);
                            this.map.centerAndZoom(punto, this.escala);
                            var graphic = new esri.Graphic(punto, this.symAnillo);
                            var infoTemplate = new InfoTemplate();
                            infoTemplate.setTitle("Localizador");
                            var contenido=this.pkCalle30[this.lsCandidatos.selectedIndex].feature.attributes.NOMBRE  + " <br/>" +this.pkCalle30[this.lsCandidatos.selectedIndex].feature.attributes.TRAMO + "<br/>" + this.pkCalle30[this.lsCandidatos.selectedIndex].feature.attributes.DESCRIPCION;
                            infoTemplate.setContent(contenido);
                            graphic.setInfoTemplate(infoTemplate);
                            this.capaLocalizador.add(graphic);
                            _esto.abreVentana(graphic);
                        }
               			return;//Terminamos
               		}
               		
               //Comprobar los atributos que tiene el atributosCandidatos
               //Si son suficientes para identificar una direccion
               if (this.lsCandidatos.selectedIndex != -1) {
                   if (this.atributosCandidato["codigoVia"]) {// Si ya sabemos la via
                       if (this.nodosNumeros == null) {
                           this.atributosCandidato["codigoVia"] = null;

                           //this.showAceptarDialog(true, this.i18nStrings.msgNoNumerosParaCalle, this.i18nStrings.msgTituloInformacion);
                           return;
                       }
                       if ((this.nodosDirecciones.length == 1) || (this.nodosNumeros.length != 0)) { // Estamos en el caso de seleccionar un numero de la via
                           var atributos = this.nodosNumeros[this.lsCandidatos.selectedIndex];
                           //var nodosNumerosPropuestos = atributos.getElementsByTagName('numerosPropuestos');
                           // var nodosNumeros = nodosNumerosPropuestos[0].getElementsByTagName('numero');
                           if ((atributos.text) || (atributos.textContent)) {//No existen numeros propuestos, solo existe uno
                               if (atributos.text) {
                                   this.atributosCandidato["numeroVia"] = atributos.text;
                               }
                               else {
                                   this.atributosCandidato["numeroVia"] = atributos.textContent;
                               }   
                           }

                           else {//Si existen varios los recorremos y los cargamos
                               var cadena = this.atributosCandidato["tipoVia"] + " " + this.atributosCandidato["nombreVia"];
                               for (var i = 0; i < this.nodosNumeros.length; i++) {
                                   var nodoDir = this.nodosNumeros[i];
                                   var numero = nodoDir.text;
                                   _esto.insertCBElement(this.lsCandidatos, cadena + " " + numero);
                               } //end for
                               //this.nodosNumeros = nodosNumeros; //Recogemos las vias propuestas

                           } // end if (nodosNumeros.length == 0)
                       } // end if this.nodosDirecciones.length == 1
                       params = _esto.crearParametros();
                       if (params) {
                           this.urlObtenerDireccionCodigo = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSAccesoDireccion + "/" + this.config.funcionDireccionCodigo + "?" + params;
						   request(this.urlObtenerDireccionCodigo,{
								handleAs: "xml"
								}).then(function(response){
									_esto.irCoordenadas(response);
							});
                       }
                   }
                   else // Se selecciona una via entre varias
                   {
                	   var atributos = this.nodosDirecciones[this.lsCandidatos.selectedIndex];
                       if (atributos)
                    	   {
                       //Almacenamos las variables
                       this.atributosCandidato["tipoVia"] = this.obtenerValorXML(atributos, this.config.atributoViaClaseTx);
                       this.atributosCandidato["nombreVia"] = this.obtenerValorXML(atributos, this.config.atributoNombreVia);
                       this.atributosCandidato["codigoVia"] = this.obtenerValorXML(atributos, this.config.atributoCodVia);
                       params = _esto.crearParametros();
                       if (params) {
                           this.urlObtenerDireccionCodigo = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSAccesoDireccion + "/" + this.config.funcionDireccionCodigo + "?" + params;
						   request(this.urlObtenerDireccionCodigo,{
								handleAs: "xml"
								}).then(function(response){
									_esto.procesarCandidatos(response);
							});
                       }
                   } //end if
                  
                   }

               }

           },
		   cargarCruces: function () {
               //***********************************************************************************
               //Funcion que se ejecuta cuando el usuario busca un cruce y hace clic sobre el listado de opciones
               //Existen dos posibilidades:
               //1. No tenga ningun codigo de via y este seleccionando la calle principal.
               //2. El usuario este seleccionando un cruce
               //Comprobar los atributos que tiene el atributosCandidatos
               //Si son suficientes para identificar un cruce
               try {
                   if (this.lsCandidatos.selectedIndex != -1) {
                       var nodoSeleccionado = this.nodosDirecciones[this.lsCandidatos.selectedIndex];
                       if ((_esto.obtenerValorXML(nodoSeleccionado, "coordX")) && (_esto.obtenerValorXML(nodoSeleccionado, "coordY"))) {
                        _esto.removeCB(this.lsCandidatos);
                           // var nodoSeleccionado = this.nodosDirecciones[this.lsCandidatos.selectedIndex];
                           this.atributosCandidato["tipoVia"] = _esto.obtenerValorXML(nodoSeleccionado, this.config.atributoTipoVia1);
                           this.atributosCandidato["nombreVia"] = _esto.obtenerValorXML(nodoSeleccionado, this.config.atributoNombreVia1);
                           this.atributosCandidato["codigoVia"] = _esto.obtenerValorXML(nodoSeleccionado, this.config.atributoCodVia1);
                           this.atributosCandidato["tipoVia2"] = _esto.obtenerValorXML(nodoSeleccionado, this.config.atributoTipoVia2);
                           this.atributosCandidato["nombreVia2"] = _esto.obtenerValorXML(nodoSeleccionado, this.config.atributoNombreVia2);
                           this.atributosCandidato["codVia2"] = _esto.obtenerValorXML(nodoSeleccionado, this.config.atributoCodVia2);
                           this.atributosCandidato["utmX"] = _esto.obtenerValorXML(nodoSeleccionado, this.config.atributoCoordX);
                           this.atributosCandidato["utmY"] = _esto.obtenerValorXML(nodoSeleccionado, this.config.atributoCoordY);
                           var cadena = "CRUCE DE " + this.atributosCandidato["tipoVia"] + " " + this.atributosCandidato["nombreVia"] + " CON " + " " + this.atributosCandidato["tipoVia2"] + " " + this.atributosCandidato["nombreVia2"];
                           _esto.insertCBElement(this.lsCandidatos, cadena);
                           if (this.lsCandidatos.length > 0) {
                               this.lsCandidatos.focus();
                               this.seleccionarValorCombo(this.lsCandidatos, this.lsCandidatos[0].innerText);
                           }
                           this.localizar();
                       }
                       else {
                           this.atributosCandidato["tipoVia"] = _esto.obtenerValorXML(nodoSeleccionado, this.config.atributoViaClaseTx);
                           this.atributosCandidato["nombreVia"] = _esto.obtenerValorXML(nodoSeleccionado, this.config.atributoNombreVia);
                           //this.atributosCandidato["codigoVia"] = this.obtenerValorXML(nodoSeleccionado, "codVia");
                           //Llamada al servicioweb para buscar los posibles cruces
                           var params = "tipoVia=" + this.atributosCandidato["tipoVia"] + "&nombreVia=" + this.atributosCandidato["nombreVia"];
                           this.urlObtenerDireccion = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSAccesoDireccion + "/" + this.config.funcionBuscarCruces + "?" + params;
							request(this.urlObtenerDireccion,{
								handleAs: "xml"
							}).then(function(response){
								_esto.procesarRespuestaCruces(response);
								})
                       }
                   }
               }
               catch (e) {
                   //this.showAceptarDialog(true, this.i18nStrings.msgNoCoincidencias, this.i18nStrings.msgTituloError);
                   console.error("DireccionWidget::cargarCruces::", e);
               }
           },
		   procesarRespuestaCruces: function (response) {
			   var data = xmlParser.parse(response);
               try {
                     var nodoErrores = data.getElementsByTagName('Error').item(0);
                       if (nodoErrores) {//Si existe algun error
                           var textoError = _esto.obtenerValorXML(data, 'Error');
                           _esto.insertCBElement(this.lsCandidatos, textoError, "");
                       }
                       else {//Si hay resultados

                           if ((data.getElementsByTagName('cruce')).length > 0) {
                               this.removeCB(this.lsCandidatos);
                               this.nodosDirecciones = data.getElementsByTagName('cruce'); //Recogemos las vias propuestas                          
                               for (var i = 0; i < this.nodosDirecciones.length; i++) { //Comprobar que solo existe un numero
                                   var atributos = this.nodosDirecciones[i];
                                   // var nodosNumerosPropuestos = atributos.getElementsByTagName('numerosPropuestos');
                                   // var nodosNumeros = nodosNumerosPropuestos[0].getElementsByTagName('numero');
                                   var tipoVia1 = _esto.obtenerValorXML(atributos, this.config.atributoTipoVia1);
                                   var nombreVia1 = _esto.obtenerValorXML(atributos, this.config.atributoNombreVia1);      
                                   var tipoVia2 = _esto.obtenerValorXML(atributos, this.config.atributoTipoVia2);
                                   var nombreVia2 = _esto.obtenerValorXML(atributos, this.config.atributoNombreVia2);              
                                   var cadena = "CRUCE DE " + tipoVia1 + " " + nombreVia1 + " CON " + " " + tipoVia2 + " " + nombreVia2;
                                   _esto.insertCBElement(this.lsCandidatos, cadena);
                               }
                               if (this.lsCandidatos.length > 0) {
                                   this.lsCandidatos.focus();
                                   this.seleccionarValorCombo(this.lsCandidatos, this.lsCandidatos[0].innerText);
                               }
                           }
                           else {
                               //this.showAceptarDialog(true, this.i18nStrings.msgNoCoincidencias, this.i18nStrings.msgTituloInformacion);
                           }
                       }

                       //this.showSpinner(false, 0);
               }
               catch (e) {

                   //this.showAceptarDialog(true, this.i18nStrings.msgNoCoincidencias, this.i18nStrings.msgTituloError);
                   console.error("DireccionWidget::procesarRespuestaCruces", e);
               }
           },
           limpiarFormulario: function () {
               debugger
                dojo.byId("textTiposVia").value = "";
                dojo.byId("textSearch").value = "";
                dojo.byId("textNumber").value = "";
                dojo.byId("textCalificador").value = "";
                this.atributosCandidato = new Array();
                this.lsCandidatos.length = 0;
            },
		   shutdown: function () {
               this.inherited(arguments);
               this.capaLocalizador.clear();
               this.map.infoWindow.hide();
               this.inherited(arguments);
               dojo.publish("widgetDrawRequestEvent", [null]);
           },
		   seleccionarValorCombo : function (combo, valor) {
				try {

					if (combo.length > 0) {
						for (var i = 0; i < combo.length; i++) { //Comprobar que solo existe un numero
							var select = combo[i].innerText;
							if (select == valor) {
								combo.selectedIndex = i;
							}
						} //cierre for
					}
				}
				catch (e) {

				}
		},

        cambioCordenadas: function (geometria_original,spr_final,datum_transformacion,tipo_accion,directa,cadena =""){
        //***********************************************************************************
        //Funcion que se ejecuta cuando se necesita hacer una transformacion, consumeido el server de gisprepcc o degegisserv
        //Existen dos posibilidades:
         // segun el parametro tipi_accion: parametro numero entero una vez obtenida las nuevas cocrdenadas se navegar a ellas o se realizara otras acciones
         //1 pa
         //directa: si es true sera foward si es false sera inversa
            var params = new ProjectParameters();
            _esto.cadena = cadena;
            params.geometries = [geometria_original];
            params.transformForward = directa
            params.outSR = new SpatialReference({ wkid:spr_final});
            if(datum_transformacion > 0){
                params.transformation = {wkid:datum_transformacion};
            }
            _esto.tipo_accion = tipo_accion
            geometryService.project(params, function(geome){ 
                switch (_esto.tipo_accion) {
                    case 1:
                        var punto = new Point(geome[0].x, geome[0].y, new SpatialReference({ wkid:geome[0].spatialReference.wkid})); 
                        this.map.centerAndZoom(punto, _esto.escala);
                        var graphic = new Graphic(punto, _esto.symAnillo);
                        var infoTemplate = new InfoTemplate();
                        infoTemplate.setTitle("localizador");
                        infoTemplate.setContent(_esto.lsCandidatos[_esto.lsCandidatos.selectedIndex].text);
                        graphic.setInfoTemplate(infoTemplate);
                        _esto.capaLocalizador.add(graphic);
                        _esto.abreVentana(graphic);
                        console.log(geome)   
                        break;
                    case 2:
                        _esto.navegarCoordenadas(geome[0].x, geome[0].y, _esto.cadena);
                        break;
                    case 3:
                        var coor = "UTMX: "+geome[0].x+" UTMY: " +geome[0].y
                        var htmliner = `<button name="btnCopyCoordenadasED" id ="btnCopyCoordenadasED" type="button" dojoType="dijit.form.Button" onclick="_esto.copyToClipboard('${geome[0].x+"#"+geome[0].y}')">Copiar</button><p>Las coodenadas ${coor} EN ED50 estan en su porta papeles"</p>` + dojo.byId("copybutton").children[0].outerHTML+dojo.byId("copybutton").children[1].outerHTML+dojo.byId("copybutton").children[2].outerHTML+dojo.byId("copybutton").children[3].outerHTML+dojo.byId("copybutton").children[4].outerHTML+dojo.byId("copybutton").children[5].outerHTML
                        html.set(dojo.byId("copybutton"),htmliner )
                        //var coor = geome[0].x+"#" +geome[0].y
		                //_esto.copyToClipboard(coor)
		                debugger;
                    default:
                        break;
                }
                
            },function (error){
                console.log(error)
            })
        },

		localizar: function () {
            //**********************************************************************
        	//Método que permite realziar la localización geográfica de los elementos
        	//Permite centrar el mapa y hacer zoom a las coordenadas del elementos. 
        	//Además abre una ventana en dicho punto con los datos de la dirección
        	//**********************************************************************
			_esto.shutdown();
               if (this.lsCandidatos.selectedIndex != -1) {
                   var x = parseFloat(this.atributosCandidato[this.config.atributoUtmX]);
                   var y = parseFloat(this.atributosCandidato[this.config.atributoUtmY]);
                   //Las coordenadas estan en ed50 planas
                   //Hay que pasarlas a geograficas
                   //Cambio de sistema de referencia
                   if (x > 0 && y > 0) {
                    var Point_ED50 = new Point(x, y, new SpatialReference({ wkid:23030}));
                        if (map.spatialReference.wkid != 25830) {
                            _esto.cambioCordenadas(Point_ED50,4326,15933,1,true)
                        }
                        else{
                            debugger;
                            _esto.cambioCordenadas(Point_ED50,25830,15932,1,true)
                        }
                   }
                   else {
                       this.atributosCandidato["codigoVia"] = null;

                       //this.showAceptarDialog(true, this.i18nStrings.msgNoNumerosParaCalle, this.i18nStrings.msgTituloInformacion);
                   }

               }
        },
		abreVentana: function (g) {
               this.map.infoWindow.features = [];
               if (this.map.infoWindow.isShowing) {
                   this.map.infoWindow.hide();
               }
               this.map.infoWindow.setFeatures(g);
               var punto = new Point(g.geometry.x, g.geometry.y, this.map.spatialReference);
               this.map.infoWindow.setContent(g.getContent());
               this.map.infoWindow.setTitle(g.getTitle());
               this.map.infoWindow.resize(300, 80);
               var screenPoint = this.map.toScreen(g.geometry);
               this.map.infoWindow.show(punto, this.map.getInfoWindowAnchor(screenPoint));
        },
		procesarRespuesta: function (response) {
              //************************************************************************************
        	  //Método que permite gestionar la respuesta al servicio web de localización del CISEM
        	  //Si no existen resultados, realiza una consulta sobre la capa de Puntos Kilómetricos
        	  //de la calle 30
        	  //************************************************************************************
			  debugger
              var data = xmlParser.parse(response);
        	   try {
                       var nodoErrores = data.getElementsByTagName('Error').item(0);
                       if (nodoErrores) {//Si existe algun error lo cargamos en los resultados
                           var textoError = _esto.obtenerValorXML(data, 'Error');
                           _esto.insertCBElement(this.lsCandidatos, textoError, "");
                       }
                       else {//Si hay resultados es necesario comprobar si estamos cargando las calles o si el usuario ya ha seleccionado la calle en 
                    	   	 //cuyo caso es necesarioc cargar los números
                           this.nodosDirecciones = data.getElementsByTagName('via'); //Recogemos las vias propuestas
                           if (this.nodosDirecciones.length > 0) {
                               //this.showPanel(1);//Nos movemos al panel de resultados
                               if (this.nodosDirecciones.length == 1) { //Comprobar si solo existe un resultado o varios
                                   var atributos = this.nodosDirecciones[0];
                                   var nodosNumerosPropuestos = atributos.getElementsByTagName(this.config.tagNameNumerosPropuestos);
                                   var nodosNumeros = nodosNumerosPropuestos[0].getElementsByTagName(this.config.tagNameNumero);
                                   this.atributosCandidato["tipoVia"] = _esto.obtenerValorXML(atributos, this.config.atributoViaClaseTx);
                                   this.atributosCandidato["nombreVia"] = _esto.obtenerValorXML(atributos, this.config.atributoNombreVia);
                                   this.atributosCandidato["codigoVia"] = _esto.obtenerValorXML(atributos, this.config.atributoCodVia);
                                   if (nodosNumeros.length == 0) {//No existen numeros propuestos, solo existe uno
                                       this.atributosCandidato["numeroVia"] = _esto.obtenerValorXML(atributos, this.config.atributoNumero);
                                       this.atributosCandidato["codigoVia"] = _esto.obtenerValorXML(atributos, this.config.atributoCodVia);
                                       this.nodosCoordenadas = atributos.getElementsByTagName(this.config.tagNameNumeroCompleto);
                                       this.atributosCandidato["utmX"] = _esto.obtenerValorXML(atributos, this.config.atributoUtmX);
                                       this.atributosCandidato["utmY"] = _esto.obtenerValorXML(atributos, this.config.atributoUtmY);
                                       if (document.getElementById("textCalificador").value != "") {
                                           this.atributosCandidato["calificadorVia"] = _esto.obtenerValorXML(atributos, this.config.atributoCalificador);
                                       } else {
                                           this.atributosCandidato["calificadorVia"] = "";
                                       }
                                       var cadena = this.atributosCandidato["tipoVia"] + " " + this.atributosCandidato["nombreVia"] + " " + this.atributosCandidato["numeroVia"] + " " + this.atributosCandidato["calificadorVia"];
                                       _esto.insertCBElement(this.lsCandidatos, cadena);
                                       if (this.lsCandidatos.length > 0) {
                                           this.lsCandidatos.focus();
                                           this.seleccionarValorCombo(this.lsCandidatos, this.lsCandidatos[0].innerText);
                                       }
                                       _esto.localizar();
                                   }
                                   else {//Hay que cargar la calle con todos los numeros

                                       var cadena = this.atributosCandidato["tipoVia"] + " " + this.atributosCandidato["nombreVia"];
                                       for (var i = 0; i < nodosNumeros.length; i++) {
                                           var nodoDir = nodosNumeros[i];
                                           var numero;
                                           if (nodoDir.text) {
                                               numero = nodoDir.text;
                                           }
                                           else {
                                               numero = nodoDir.textContent;
                                           }

                                           _esto.insertCBElement(this.lsCandidatos, cadena + " " + numero);
                                       }
                                       this.nodosNumeros = nodosNumeros; //Recogemos las vias propuestas
                                       if (this.lsCandidatos.length > 0) {
                                           this.lsCandidatos.focus();
                                           this.seleccionarValorCombo(this.lsCandidatos, this.lsCandidatos[0].innerText);
                                       }
                                   }
                               }
                               else {//Si existe mas de un elemento rellenamos la lista
                                   for (var i = 0; i < this.nodosDirecciones.length; i++) {
                                       var nodoDir = this.nodosDirecciones[i];
                                       var tipoVia = _esto.obtenerValorXML(nodoDir, this.config.atributoViaClaseTx);
                                       var dir = _esto.obtenerValorXML(nodoDir, this.config.atributoNombreVia);
                                       _esto.insertCBElement(this.lsCandidatos, tipoVia + " " + dir);
                                   }
                                   if (this.lsCandidatos.length > 0) {
                                	   
                                       this.lsCandidatos.focus();
                                       this.seleccionarValorCombo(this.lsCandidatos, this.lsCandidatos[0].innerText);
                                   }

                               }
                           }
                           else {//Si no hay resultados comprobamos si está buscando un pk de la calle 30  
                        	   var find = new esri.tasks.FindTask(this.urlSLocalizacionPKCalle30);
                        	   var params = new esri.tasks.FindParameters();
                        	   params.layerIds = [this.config.capaCalle30];
                        	   params.returnGeometry=true;
                        	   params.searchFields = [this.config.campoBusquedaCalle30];
                        	   var pk=dojo.byId("textSearch").value;
                        	   var pkcercano=pk;
                        	   if (pk.length==6)//Si introduce el número completo, calculamos el mas cercano
                        		   {
                        		    pkcercano=this.getPKCalle30Cercano(pk.substr(pk.length-2, pk.length));
                        		    params.searchText = pk.substr(0, pk.length-2) + pkcercano.toString();
                        		   }
                        	   else
                        		   {
                        		   params.searchText = pkcercano;
                        		   }
                        	  
                        	   
                        	   find.execute(params,  dojo.hitch(this, "resultadosCalle30"));
                           }
                       }

                   //this.showSpinner(false, 0);

               }
               catch (e) {
            	   //this.showSpinner(false, 0);
                   //this.showAceptarDialog(true, this.i18nStrings.msgNoCoincidencias, this.i18nStrings.msgTituloError);
                   console.error("DireccionWidget::procesarRespuesta", e);
               }
           },
	       onSearch: function () {
               //Método que se ejecuta al hacer clic sobre el botón buscardireccion
               try {
                    //Limpiamos el formulario
                    this.limpiar();
                    seleccionevent = "direcciones";
                    //Recogemos las variables
                    var params = this.definirParametros("direccion");
                    if (params) {
                        this.urlObtenerDireccion = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSAccesoDireccion + "/" + this.config.funcionBuscar + "?" + params;
                            request(this.urlObtenerDireccion,{
                                handleAs: "xml"
                            }).then(function(response){
                                _esto.procesarRespuesta(response);
                                })
                    } else {
                        //this.showAceptarDialog(true, this.i18nStrings.msgIntroducirParametros, this.i18nStrings.msgTituloInformacion);
                    }
                } catch(e) {
                    console.error("DireccionWidget::onSearch", e);
                }
           },
		   onBuscarCruces: function () {
               //**************************************************************************
               //Funcion que se ejecuta al hacer clic sobre el boton buscarCruces
               //Pasos: 
               //1. Limpiamos 
               //2. Creamos la variable con los parametros
               //3. Llamada al metodo del servicioweb y asignación de la función de respuesta
               //************************************************************************
               this.limpiar(); //1
               seleccionevent = "cruces";
               var params = this.definirParametros("cruces"); //2
               if (params != "") {

                   this.urlObtenerDireccion = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSAccesoDireccion + "/" + this.config.funcionBuscar + "?" + params;
				   request(this.urlObtenerDireccion,{
						handleAs: "xml"
					}).then(function(response){
						_esto.buscarDireccionCruces(response);
						})
               }
               else {
                   this.showAceptarDialog(true, this.i18nStrings.msgIntroducirParametros, this.i18nStrings.msgTituloInformacion);
               }
               //this.connects.push(dojo.connect(document.getElementById("cboPosiblesCalles"), "ondblclick", this, "cargarCruces"));
               //this.connects.push(dojo.connect(document.getElementById("cboPosiblesCalles"), "ondblclick", this, "cargarCruces"));
           },
		    buscarDireccionCruces: function (response) {
				var data = xmlParser.parse(response);
               try {
                       var nodoErrores = data.getElementsByTagName('Error').item(0);
                       if (nodoErrores) {//Si existe algun error
                           var textoError = _esto.obtenerValorXML(data, 'Error');
                           _esto.insertCBElement(this.lsCandidatos, textoError, "");
                       }
                       else {//Si hay resultados
                           this.nodosDirecciones = data.getElementsByTagName('via'); //Recogemos las vias propuestas
                           if (this.nodosDirecciones.length > 0) {
                               //this.showPanel(1);
                               if (this.nodosDirecciones.length == 1) { //Comprobar que solo existe un numero
                                   var atributos = this.nodosDirecciones[0];
                                   this.atributosCandidato["tipoVia"] = _esto.obtenerValorXML(atributos, this.config.atributoViaClaseTx);
                                   this.atributosCandidato["nombreVia"] = _esto.obtenerValorXML(atributos, this.config.atributoNombreVia);
                                   this.atributosCandidato["codigoVia"] = _esto.obtenerValorXML(atributos, this.config.atributoCodVia);
                                   var cadena = this.atributosCandidato["tipoVia"] + " " + this.atributosCandidato["nombreVia"];
                                   _esto.insertCBElement(this.lsCandidatos, cadena);
                               }
                               else {//Si existe mas de un elemento rellenamos la lista
                                   // this.nodosDirecciones = xmlDoc.getElementsByTagName('via');
                                   for (var i = 0; i < this.nodosDirecciones.length; i++) {
                                       var nodoDir = this.nodosDirecciones[i];
                                       var tipoVia = _esto.obtenerValorXML(nodoDir, this.config.atributoViaClaseTx);
                                       var dir = _esto.obtenerValorXML(nodoDir, this.config.atributoNombreVia);
                                       _esto.insertCBElement(this.lsCandidatos, tipoVia + " " + dir);
                                   }
                               }
                           }
                           else {
                               //this.showAceptarDialog(true, this.i18nStrings.msgNoCoincidencias, this.i18nStrings.msgTituloInformacion);
                           }
                       }
                   if (this.lsCandidatos.length > 0) {
                       this.lsCandidatos.focus();
                       this.seleccionarValorCombo(this.lsCandidatos, this.lsCandidatos[0].innerText);
                   }
                   //this.showSpinner(false, 0);
               }
               catch (e) {
                   //this.showAceptarDialog(true, this.i18nStrings.msgNoCoincidencias, this.i18nStrings.msgTituloError);
                   console.error("DireccionWidget:: buscarDireccionCruces", e);

               }

           },
	onBuscarCoordenadas: function (sistema) {
               //conveirte las cordenadas ETRS89 ED50 a WGS84 y las pinta, las WGS84 las pinta directamente
			   if (sistema == "ETRS"){
				   var x = parseFloat(document.getElementById("textCoordXutmETRS89").value.replace(",", "."));
				   var y = parseFloat(document.getElementById("textCoordYutmETRS89").value.replace(",", "."));

				   if ((x != "") && (y != "")) {
						var cadena = "X (ETRS89): " + x + " ,Y (ETRS89): " + y;
						_esto.navegarCoordenadas(x,y, cadena);

				   }
				   else {

					   //this.showAceptarDialog(true, this.i18nStrings.msgIntroducirLatLon, this.i18nStrings.msgTituloInformacion);
				   }
			   }
			   else if ( sistema == "ED"){
				   var x = parseFloat(document.getElementById("textCoordXutmED50").value.replace(",", "."));
				   var y = parseFloat(document.getElementById("textCoordYutmED50").value.replace(",", "."));
				   var cadena = "X(ED50): " + x + " , y(ED50): " + y;
				   if ((x != "") && (y != "")) {
                        var Point_ED50 = new Point(x, y, new SpatialReference({ wkid:23030}));
                        if (map.spatialReference.wkid != 25830) {
                            _esto.cambioCordenadas(Point_ED50,25830,15933,2,true,cadena)
                        }
                        else{
                            _esto.cambioCordenadas(Point_ED50,25830,15932,2,true,cadena)
                        }

				   }
				   else {

					   //this.showAceptarDialog(true, this.i18nStrings.msgIntroducirLatLon, this.i18nStrings.msgTituloInformacion);
				   }
			   }
			   else if (sistema == "ETRSLatLong"){
				   var Lat = parseFloat(document.getElementById("textCoordLat").value.replace(",", "."));
				   var Lng = parseFloat(document.getElementById("textCoordLon").value.replace(",", "."));
				   var cadena = "Latitud: " + Lat + " , Longitud: " + Lng;
				   if ((Lat != "") && (Lng != "")) {
                    var Point_ETRS89_Latlong = new Point(Lng, Lat, new SpatialReference({ wkid:4258}));
                    if (map.spatialReference.wkid = 25830) {
                        _esto.cambioCordenadas(Point_ETRS89_Latlong,25830,0,2,true,cadena)
                     }
                        else{
                            _esto.cambioCordenadas(Point_ETRS89_Latlong,4326,0,2,true,cadena)
                        }
				   }
				   else {

					   //this.showAceptarDialog(true, this.i18nStrings.msgIntroducirLatLon, this.i18nStrings.msgTituloInformacion);
				   }
				   
			   }
			   else {
				   var long = parseFloat(document.getElementById("textCoordLong").value.replace(",", "."));
                   var lonm = parseFloat(document.getElementById("textCoordLonm").value.replace(",", "."));
                   var lons = parseFloat(document.getElementById("textCoordLons").value.replace(",", "."));
                   var latg = parseFloat(document.getElementById("textCoordLatg").value.replace(",", "."));
                   var latm = parseFloat(document.getElementById("textCoordLatm").value.replace(",", "."));
                   var lats = parseFloat(document.getElementById("textCoordLats").value.replace(",", "."));
                   var lon;
                   var lat;
                   var cadena;
                   if (long) {
                       lon = Math.abs(long);
                       cadena = "lon:" + long + "º";
                       if (lonm) {
                           lon = lon + (lonm / 60);
                           cadena = cadena + lonm + "' ";
                       }
                       if (lons) {
                           lon = lon + (lons / 3600);
                           cadena = cadena + lons + "''";
                       }
                       if (long < 0) {
                           lon = -1 * lon;
                       }
                   }
                   else {
                       //this.showAceptarDialog(true, this.i18nStrings.msgIntroducirLatLon, this.i18nStrings.msgTituloInformacion);
                   }

                   if (latg) {
                       lat = latg;
                       cadena = cadena + " lat:" + latg + "º";
                       if (latm) {

                           lat = lat + (latm / 60);
                           cadena = cadena + latm + "' ";
                       }
                       if (lats) {
                           lat = lat + (lats / 3600);
                           cadena = cadena + lats + "''";
                       }
                   }
                   else {
                       //this.showAceptarDialog(true, this.i18nStrings.msgIntroducirLatLon, this.i18nStrings.msgTituloInformacion);
                   }
                   if ((lon) && (lat)) {
                    var Point_ETRS89_LatlongGr = new Point(lon, lat, new SpatialReference({ wkid:4258}));
                    if (map.spatialReference.wkid = 25830) {
                        _esto.cambioCordenadas(Point_ETRS89_LatlongGr,25830,0,2,true,cadena)
                    }
                       else{
                        _esto.cambioCordenadas(Point_ETRS89_LatlongGr,4326,0,2,true,cadena)
                       }
                       
                   }
                   else {
                       //this.showAceptarDialog(true, this.i18nStrings.msgIntroducirLatLon, this.i18nStrings.msgTituloInformacion);
                   }
               }
    },
	
	onActivarCoordenadas : function(){
		debugger;
		this.map.on("click", function (event) {
			var Coord = event.mapPoint  
			var Punt = new Point(Coord.x, Coord.y, Coord.spatialReference);
            if (_esto.map.spatialReference.wkid == 25830){  
                _esto.cambioCordenadas(Punt,23030,15932,3,false)
                _esto.pintarCoordenadasETRS89(Punt)
            }
            else{
                var geom = webMercatorUtils.webMercatorToGeographic(Punt);
                _esto.cambioCordenadas(Punt,23030,15933,3,false)
            }
		});
		console.log("click")
	},
    pintarCoordenadasETRS89: function (geometria_original) {
        debugger
        html.set(dojo.byId("copybutton"),"")
        var coor = "UTMX: "+geometria_original["x"]+" UTMY: " +geometria_original["y"]
        var htmliner = "<br/>" + `<button name="btnCopyCoordenadasETRS" id ="btnCopyCoordenadasETRS" type="button" dojoType="dijit.form.Button" onclick="_esto.copyToClipboard('${geometria_original["x"]+"#" +geometria_original["y"]}')">Copiar</button><br/><p>Las coodenadas ${coor} EN ETRS89 estan en su porta papeles"</p><br/><button name="btnActivarCoordenadas" id ="btnActivarCoordenadas" type="button" dojoType="dijit.form.Button">Activar</button>`
        html.set(dojo.byId("copybutton"),htmliner)
    },
    copyToClipboard: function (text) {
        var dummy = document.createElement("textarea");
        // to avoid breaking orgain page when copying more words
        // cant copy when adding below this code
        // dummy.style.display = 'none'
        document.body.appendChild(dummy);
        //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
        dummy.value = text;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
    },
	
	navegarCoordenadas: function (x, y, cadena) {
               //******************************************************************************************
               //Funcion que navega a las coordenadas x e y 
               //Comprueba si se encuentran dentro de madrid
               //*************************************************************************************
               try {
                _esto.shutdown()
                   this.limpiar(); //1
                   //Asignar las variables
                   //this.widgets[this.declaredClass].textSearch.get("value");
                   if (map.spatialReference.wkid == 25830){
                    var xmin = this.config.fullExtentETRS89[0];
                    var ymin = this.config.fullExtentETRS89[1];
                    var xmax = this.config.fullExtentETRS89[2];
                    var ymax = this.config.fullExtentETRS89[3];
                   }
                   else{
                    var xmin = this.config.fullExtentWGS84[0];
                    var ymin = this.config.fullExtentWGS84[1];
                    var xmax = this.config.fullExtentWGS84[2];
                    var ymax = this.config.fullExtentWGS84[3];
                   }
                   

                   if (!(isNaN(x)) && !(isNaN(y))) {
                       if ((x <= xmax) && (x >= xmin) && (y <= ymax) && (y >= ymin)) {
                           var punto = new Point(x, y, new SpatialReference({ wkid:this.map.spatialReference.wkid}));
                           this.map.centerAndZoom(punto, this.escala);
                           var graphic = new Graphic(punto, this.symAnillo);
                           var infoTemplate = new esri.InfoTemplate();
                           infoTemplate.setTitle("localizador");
                           infoTemplate.setContent(cadena);
                           graphic.setInfoTemplate(infoTemplate);
                           this.capaLocalizador.add(graphic);
                           _esto.abreVentana(graphic);
                       }
                       else {

                           //this.showAceptarDialog(true, this.i18nStrings.msgCoordenadasFueraMadrid, this.i18nStrings.msgTituloInformacion);
                       }
                   }
                   else {

                       this.showAceptarDialog(true, this.i18nStrings.msgNoCoordenadas, this.i18nStrings.msgTituloInformacion);
                       // this.mensajeSinCoordenadas();
                   }
               }
               catch (e) {
				   alert("Las coordenadas introducidas se encuentran fuera del municipio de Madrid")
                   //this.showAceptarDialog(true, this.i18nStrings.msgErrorLocalizacion, this.i18nStrings.msgTituloInformacion);
                   //this.mensajeSinCoordenadas();
               }
           },
	
    startup: function() {
        //esto= this
        _esto = this
        geometryService = new GeometryService(this.config.urlGeometry);
		this.capaLocalizador = new GraphicsLayer();
        this.capaLocalizador.id = "capaLocalizador";
        this.map.addLayer(this.capaLocalizador);
		var ringImageUrl = this.config.image;
		var size = this.config.size
		this.escala = this.config.escala;
        this.symAnillo = new PictureMarkerSymbol(ringImageUrl, size, size);
		this.urlSLocalizacionPKCalle30 = this.config.urlSLocalizacionPKCalle30
		if (this.config.incluirPuntosInteres == false) {
                incluirPuntosInteres = 1;
            }
        else {
                incluirPuntosInteres = 3;
            }
		var pm = PanelManager.getInstance();
		this.lsCandidatos = dojo.byId("cboPosiblesCalles");

		arrayEstelaVehiculos = new Array();
		document.getElementById("cboPosiblesCalles").ondblclick = function(){_esto.seleccionHerramienta()};
		document.getElementById("btnSearch").onclick = function() {_esto.onSearch()};
		document.getElementById("btnBuscarCruces").onclick = function() {_esto.onBuscarCruces()};
        document.getElementById("btnBorrarBusqueda").onclick = function() {_esto.limpiarFormulario()};
		document.getElementById("btnBuscarCoordenadasUTMETRS89").onclick = function(){_esto.onBuscarCoordenadas("ETRS")};
		document.getElementById("btnBuscarCoordenadasUTMED50").onclick = function(){_esto.onBuscarCoordenadas("ED")};
		document.getElementById("btnBuscarCoordenadasGeo").onclick = function(){_esto.onBuscarCoordenadas("ETRSLatLong")};
		document.getElementById("btnBuscarCoordenadasGeoDecimales").onclick = function(){_esto.onBuscarCoordenadas("ETRSLatLongDec")};
		console.log('startup');
		document.getElementById("btnActivarCoordenadas").onclick = function(){_esto.onActivarCoordenadas()};
		console.log('startup');

    },

    onOpen: function(){
		map = this.map
        //pertime acceder con tabulacion al formulario
        var firstNode = dom.byId("textTiposVia");
        utils.initFirstFocusNode(this.domNode, firstNode);
        var lastNode = dom.byId("btnBuscarCruces");
        utils.initLastFocusNode(this.domNode, lastNode);
        if (utils.isAutoFocusFirstNodeWidget(this)) {
        firstNode.focus();
        }
	},
    onClose: function(){
		this.shutdown();
		this.removeCB(this.lsCandidatos);
		console.log('onClose');
		html.set(dojo.byId("copybutton"),'<p>Haga clic sobre un punto del mapa para copiar las coordenadas en formato UTMX / UTMY ED50 Y ETRS89</p><button name="btnActivarCoordenadas" id ="btnActivarCoordenadas" type="button" dojoType="dijit.form.Button">Activar</button>' )	
					
    },

    onMinimize: function(){
      console.log('onMinimize');
    },

    onMaximize: function(){
      console.log('onMaximize');
    },

    onSignIn: function(credential){
      /* jshint unused:false*/
      console.log('onSignIn');
    },

    onSignOut: function(){
      console.log('onSignOut');
    },

    showVertexCount: function(count){
      this.vertexCount.innerHTML = 'The vertex count is: ' + count;
    }
  });
});