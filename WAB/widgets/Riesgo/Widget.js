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
var _esto_alta;
var id_documento;
const ACTION_ANIADIR= "añadir";
const ACTION_EDITAR = "editar";
const TABLA_DOCUMENTACION = "myTable_documentacion";
const NOMBRE_WIDGET = "widgets_Riesgo_Widget_10_panel";

define(['dojo/_base/declare',"esri/SpatialReference", 'jimu/BaseWidget', "esri/geometry/Point", "esri/geometry/Polygon", "dojox/xml/parser", "dojo/request","dojo/_base/connect",
        "esri/graphic", 'dojo/_base/lang', 'dojo/keys', 'jimu/dijit/Popup', 'dijit/Dialog', "dijit/ConfirmDialog", "esri/toolbars/edit", "esri/tasks/ProjectParameters",
        "dojo/store/Memory","dijit/form/FilteringSelect", 'esri/tasks/query', 'esri/tasks/QueryTask', 'esri/layers/FeatureLayer', "esri/toolbars/draw", "esri/tasks/GeometryService"],
function(declare, SpatialReference, BaseWidget, Point, Polygon, xmlParser, request, connect,
        Graphic, lang, keys, Popup, Dialog, ConfirmDialog, Edit, ProjectParameters,
        Memory, FilteringSelect, query, QueryTask, FeatureLayer, Draw, GeometryService) {
        //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {
        // DemoWidget code goes here
        baseClass: 'jimu-widget-Riesgo',
        puntoX:null,
        puntoY:null,
        idLayerElementoVulnerableP:null,
        idLayerLocalizacion:null,
        idFilter:null,
        selectFilter:null,
        selectFilterElementoVulnerable:null,
        selectFilterTipoDocumento:null,
        atributosCandidato: {},
        direccion:{},
        listavias: [],
        listaCodPdis: [],
        tiposFactor:[],
        tipologias:[],
        tipologias_aux:[],
        factoresVulnerables:[],
        factoresVulnerables_aux:[],
        descripciones:{},
        elementosVulnerables:[],
        tiposDocumentos:[],
        documentos:[],
        documentosVulnerables:[],
        documentosVulnerables_aux:[],
        clases: [],
        categorias: [],
        subCategorias: [],
        polygonJson: [],
        urlObtenerDireccion: null,
        urlObtenerServicio:null,
        ctxMenuAniadirRiesgo:null,
        ctxMenuModificar:null,
        ctxMenuLocalizacion:null,
        ctxMenuArea:null,
        ventana:null,
        popupElementosVulnerables:null,
        dialog:null,
        confirmDialog:null,
        contenido: "",
        mostarPopup:false,
        modificar:false,
        editarTipologia:false,
        editarTipoFactor:false,
        editarDocumento:false,
        factor_texto:null,
        categoria_texto:null,
        subcategoria_texto:null,
        posicion:1,
        atributos:null,
        atributosLocalizacion:null,
        atributosArea:null,
        objectIdElementoVulnetableP: null,
        objectIdFactoresVulnerables:[],
        objectIdTipologias:[],
        objectIdDocumentosElementoVulnerable:[],
        objectIdLocalizacion:[],
        objectIdTipado:[],
        listaObjectIdDocumentosLocalizacion:[],
        idMaximoElementoVulnerable:null,
        idMaximoFactorVulnerabilidad:null,
        idMaximoElementoVulnerableA:null,
        idMaximoVulnerabilidad:null,
        idMaximoLocalizacion:null,
        idMaximoDocumentoLocalizacion:null,
        idMaximoDocumentoVulnerabilidad:null,
        editToolbar:null,
        capaElementoVulnerable:null,
        capaLocalizacion:null,
        capaArea:null,
        desconectadoDbClick:null,
        myQuery:null,
	
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
            } catch (ex) {
            combo.add(elOptNew); // IE only
            }
        },
        RemoveComboBoxElements: function (combo) {
            try {
            combo.length = 0;
            } catch (ex) {
            // combo.remove(0); // IE only
            }
        },
        startup: function() {
            try {
                debugger
                console.log("Widget Riesgo")
                _esto_alta = this

                if (this.config) {
                    this.urlObtenerServicio = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSRiesgo
                }

                document.getElementById(NOMBRE_WIDGET).children[0].children[0].textContent = this.config.titulo

                this.idLayerLocalizacion = this.config.layerRiesgos.featureLayer["localizacionesId"]
                this.idLayerElementoVulnerableA = this.config.layerRiesgos.featureLayer["elementoAreaId"]
                this.idLayerElementoVulnerableP = this.config.layerRiesgos.featureLayer["elementoVulnerablePId"]

                $('#inputCategoria').prop('disabled', 'disabled');
                $('#inputSubcategoria').prop('disabled', 'disabled');

                this.insertComboBoxElement(document.getElementsByName("inputCategoria")[0], "Seleccione Categoria", "")
                this.insertComboBoxElement(document.getElementsByName("inputSubcategoria")[0], "Seleccione Subcategoría", "")
                this.getDistritos()
                this.getTiposFactor()
                this.getClases(undefined, false, 1)
                this.getTipoDocumento();
                this.executeActionDocumentos();
                this.crearSelectTipoDocumentos("inputTipoDocumento","selectTipoDocumento", "inputDocumento")
                this.crearSelectDocumentos("inputDocumento", "selectDocumento")
                this.crearSelectTiposLocalizacion()
                this.crearSelectTipoDocumentos("inputTipoDocumento_localizacion","selectTipoDocumento_localizacion", "inputDocumento_localizacion")
                this.crearSelectDocumentos("inputDocumento_localizacion","selectDocumentoLozalizacion")
                this.cambiarActionBoton("btModificar","btAlta","Alta");
                this.activarEventosSobreMapa();
                this.crearContextMenu(); //Creamos los menus contextuales
                this.map.graphics.enableMouseEvents(); //habilitamos los eventos del raton sobre los gráficos del mapa
                this.map.disableDoubleClickZoom();
                document.getElementById("widgetPanel_form").children[1].children[0].children[9].style.display = 'none'
                document.getElementById("inputClase").onchange = function () {_esto_alta.getCategorias(undefined, false, 1); _esto_alta.posicion=1}
                document.getElementById("inputCategoria").onchange = function () {_esto_alta.getSubcategoria(undefined, false, 1)}
                document.getElementById("btAniadirTipoFactor").onclick = function () {_esto_alta.aniadirTipoFactor()}
                document.getElementById("btAniadir").onclick = function () {_esto_alta.aniadirTipologia()}
                document.getElementById("btAlta").onclick = function () { _esto_alta.validarElementoVulnerable() }
                document.getElementById("btAltaLocalizacion").onclick = function () { _esto_alta.validarLocalizacion() }
                document.getElementById("btCerrarAlta").onclick = function () { _esto_alta.onCerrar(event) }
                document.getElementById("btCerrarAltaLocalizacion").onclick = function () { _esto_alta.onCerrar(event) }
                document.getElementById("btAniadirDocumentoVulnerable").onclick = function () {_esto_alta.aniadirDocumentos("inputDocumento","selectDocumento",TABLA_DOCUMENTACION,"ElementoVulnerable")}
            } catch (e) {
                console.error("Se ha producido un error. " + e)
                this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error" + e)
            }
        },
        /**
        * Método que crea los menús de añadir pulsando click derecho sobre el mapa
        * */
        activarEventosSobreMapa: function () {
            try {
                if (this.editToolbar == null) {
                    this.editToolbar = new Edit(this.map);
                }
                this.map._layers[this.idLayerElementoVulnerableP].on("MouseOver", function (event) {
                    _esto_alta.activarMenuElementoVulnerable(event)
                })
                this.map._layers[this.idLayerElementoVulnerableP].on("MouseDown", function (event) {
                    if (event.which === 3) {
                        _esto_alta.atributos = event.graphic.attributes
                        _esto_alta.capaElementoVulnerable = event.graphic
                    }
                })
                this.map._layers[this.idLayerLocalizacion].on("MouseOver", function (event) {
                    _esto_alta.activarMenuLocalizacion(event)
                })
                this.map._layers[this.idLayerLocalizacion].on("MouseDown", function (event) {
                    if (event.which === 3) {
                        _esto_alta.atributosLocalizacion = event.graphic.attributes
                        _esto_alta.capaLocalizacion = event.graphic
                    }
                })
                this.map._layers[this.idLayerElementoVulnerableA].on("MouseOver", function (event) {
                    _esto_alta.activarMenuArea(event)
                })
                this.map._layers[this.idLayerElementoVulnerableA].on("MouseDown", function (event) {
                    if (event.which === 3) {
                        _esto_alta.atributosArea = event.graphic.attributes
                        _esto_alta.capaArea = event.graphic;
                    }
                })
                this.map.on("MouseDown", function (event) {
                    if(event.which === 3) {
                        var Coord = event.mapPoint  
                        var Punt = new Point(Coord.x, Coord.y, Coord.spatialReference);
                        if (_esto_alta.map.spatialReference.wkid == 25830) { 
                            console.log(Punt["x"] + " " + Punt["y"])
                            _esto_alta.puntoX = Punt["x"];
                            _esto_alta.puntoY = Punt["y"];
                        }
                    }
                })
            } catch (e) {
                console.error("Se ha producido un error. " + e)
                this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error" + e)
            }
        },
        crearContextMenu: function () {
            debugger
            try {

                if (this.ctxMenuAniadirRiesgo === null) {

                    this.ctxMenuAniadirRiesgo = new dijit.Menu({ refocus: false });
                    var itemAniadirElementoVulnerable = new dijit.MenuItem({
                        label: "Añadir Elemento vulnerable",
                        onClick: dojo.hitch(this, "aniadirElementoVulnerable")
                    });
                    var itemAniadirLocalizacion = new dijit.MenuItem({
                        label: "Añadir Localización",
                        onClick: dojo.hitch(this, "aniadirLocalizacion_aux")
                    });
                    this.ctxMenuAniadirRiesgo.addChild(itemAniadirElementoVulnerable);
                    this.ctxMenuAniadirRiesgo.addChild(itemAniadirLocalizacion);
                    this.ctxMenuAniadirRiesgo.startup();
                    this.ctxMenuAniadirRiesgo.bindDomNode(this.map.container.children[0].children[0].children[0]);
                }

                if (this.ctxMenuModificar === null) {
                    this.ctxMenuModificar = new dijit.Menu({ refocus: false });
                    var itemModificarElementoVulnerable = new dijit.MenuItem({
                        label: "Editar",
                        onClick: dojo.hitch(this, "getDPIs")
                    });
                    var itemEliminarElementoVulnerable = new dijit.MenuItem({
                        label: "Eliminar",
                        onClick: dojo.hitch(this, "confirmElementoVulnerable")
                    });
                    var itemAniadirAreaElementoVulnerable = new dijit.MenuItem({
                        label: "Añadir área",
                        onClick: dojo.hitch(this, "initToolbar")
                    });
                    var itemAniadirLocalizacion = new dijit.MenuItem({
                        label: "Añadir Localización",
                        onClick: dojo.hitch(this, "aniadirLocalizacion")
                    });
                    var itemVerDocumentos= new dijit.MenuItem({
                        label: "Ver Documentos",
                        onClick: dojo.hitch(this, "VerDocumentos")
                    });
                    this.ctxMenuModificar.addChild(itemModificarElementoVulnerable);
                    this.ctxMenuModificar.addChild(itemEliminarElementoVulnerable);
                    this.ctxMenuModificar.addChild(itemAniadirAreaElementoVulnerable);
                    this.ctxMenuModificar.addChild(itemAniadirLocalizacion);
                    this.ctxMenuModificar.addChild(itemVerDocumentos);
                    this.ctxMenuModificar.startup();
                }
                if (this.ctxMenuLocalizacion === null) {
                    this.ctxMenuLocalizacion = new dijit.Menu({ refocus: false });
                    var itemMove = new dijit.MenuItem({
                        label: "Mover",
                        onClick: dojo.hitch(this, "moverLocalizacion")
                    });

                    this.ctxMenuLocalizacion.addChild(itemMove);
                    this.ctxMenuLocalizacion.startup();
                }
                if (this.ctxMenuArea === null) {
                    this.ctxMenuArea = new dijit.Menu({ refocus: false });
                    var itemEliminar = new dijit.MenuItem({
                        label: "Eliminar área",
                        onClick: dojo.hitch(this, "confirmArea")
                    });
                    var itemEditar = new dijit.MenuItem({
                        label: "Editar área",
                        onClick: dojo.hitch(this, "editarArea")
                    });
                    this.ctxMenuArea.addChild(itemEliminar);
                    this.ctxMenuArea.addChild(itemEditar);
                    this.ctxMenuArea.startup();
                }
            } catch (e) {
                console.error("Se ha producido un error. " + e)
                this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error" + e)
            }
        },
        activarMenuElementoVulnerable: function (evt) {
            try {
                if (this.ctxMenuModificar !== null)
                    this.ctxMenuModificar.bindDomNode(evt.graphic.getDojoShape().getNode());
            } catch (e) {
                console.error("EditorCallesWidget::activarMenuElementoVulnerable", e);
            }
        },
        activarMenuLocalizacion: function (evt) {
            try {
                if (this.ctxMenuLocalizacion !== null) {
                    this.ctxMenuLocalizacion.bindDomNode(evt.graphic.getDojoShape().getNode());
                }
            } catch (e) {
                console.error("EditorWidget::activarMenuLocalizacion:", e);
            }
        },
        activarMenuArea: function (evt) {
            try {
                if (this.ctxMenuArea !== null)
                    this.ctxMenuArea.bindDomNode(evt.graphic.getDojoShape().getNode());
            } catch (e) {
                console.error("EditorWidget::activarMenuArea:", e);
            }
        },
        aniadirElementoVulnerable: function () {
            try {
                this.cambiarEdicionFalse()
                this.cambiarActionBoton("btModificar","btAlta","Alta");
                this.limpiarFormularioElementoVulnerable();
                this.limpiarListas()
                this.ocultarFormularioLocalizacion()
                this.cambiarLabelWidget(this.config.titulo)
                dojo.byId("widgetPanel_info").style.display = 'none'
                dojo.byId("widgetPanel_form_localizaciones").style.display = 'none'
                dojo.byId("widgetPanel_form").style.display = 'block'
                document.getElementById("inputPoblacion").value = 'MADRID'
                document.getElementById("inputUTMX").value = _esto_alta.puntoX
                document.getElementById("inputUTMY").value = _esto_alta.puntoY
                if (document.getElementById(NOMBRE_WIDGET).style.display === 'none') {
                    document.getElementsByClassName("container-section")[0].children[5].click()   
                }
            } catch (e) {
                console.error("Se ha producido un error. " + e)
                this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error" + e)
            }
        },
        getDPIs: function () {
            console.log(_esto_alta.capaElementoVulnerable)
            var myQuery = new query()
            myQuery.where = "UTMX=" + _esto_alta.atributos.UTMX + " AND "  +"UTMY=" + _esto_alta.atributos.UTMY
            myQuery.returnGeometry = true
            myQuery.outFields =["*"]
            //Realizamos la busqueda
            var myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlElementoVulnerableP)
            myQueryTask.execute(myQuery, lang.hitch(this.elegirDPI),lang.hitch(this, this.callbackErrorGenerico));
        },
        featuresEVs : null,
        elegirDPI: function (results) {
            try {
                featuresEVs = results.features
                if (results.features.length === 0 || results.features.length === 1) {
                    _esto_alta.modificarElementoVulnerable()
                } else {
                    var html = '<select name="selectDPI" for="elemento vulnerable">'
                    for (let index = 0; index < results.features.length; index++) {
                        html += '<option value=' +  results.features[index].attributes.ID_ELEMENTOVULNERABLEP + '>' +   results.features[index].attributes.NOMBRE + '</option>'   
                    }
                    html += '</select><br/>'
                    html += `<button id="elegirDPI" type="button" onclick='_esto_alta.rellenarDPI()'>Editar</button>`

                    _esto_alta.popupElementosVulnerables = new Popup({
                        width: 600,
                        height: 200,
                        autoHeight: true,
                        titleLabel: results.features.length + " elementos vulnerables",
                        content: html,
                        container: 'main-page',
                        buttons: [{
                        label: "Cerrar",
                        classNames: ['jimu-btn-vacation'],
                        key: keys.ESCAPE
                        }]
                    });
                }
            } catch (e) {
                console.error("Se ha producido un error. " + e)
                this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error" + e)
            }
        },
        rellenarDPI: function () {
            try {
                debugger
                var idElementoVulnerable = document.getElementsByName("selectDPI")[0].value
                var elementoVulnerable = featuresEVs.filter((e)=>{return e.attributes.ID_ELEMENTOVULNERABLEP === parseInt(idElementoVulnerable)})
                _esto_alta.popupElementosVulnerables.close()
                console.log(elementoVulnerable)
                if (elementoVulnerable.length > 0) {
                    this.atributos.AFORO =  elementoVulnerable[0].attributes.AFORO
                    this.atributos.DESCRIPCION =  elementoVulnerable[0].attributes.DESCRIPCION
                    this.atributos.DIRCALIFICADOR =  elementoVulnerable[0].attributes.DIRCALIFICADOR
                    this.atributos.DIRNOMBRE =  elementoVulnerable[0].attributes.DIRNOMBRE
                    this.atributos.DIRNUMERO =  elementoVulnerable[0].attributes.DIRNUMERO
                    this.atributos.DIRPOBLACION =  elementoVulnerable[0].attributes.DIRPOBLACION
                    this.atributos.DIRTIPO =  elementoVulnerable[0].attributes.DIRTIPO
                    this.atributos.DISTRITO =  elementoVulnerable[0].attributes.DISTRITO
                    this.atributos.FECHAFIN =  elementoVulnerable[0].attributes.FECHAFIN
                    this.atributos.FECHAINI =  elementoVulnerable[0].attributes.FECHAINI
                    this.atributos.ID_ELEMENTOVULNERABLEP =  elementoVulnerable[0].attributes.ID_ELEMENTOVULNERABLEP
                    this.atributos.ID_PLANDIRECTOR =  elementoVulnerable[0].attributes.ID_PLANDIRECTOR
                    this.atributos.NOMBRE =  elementoVulnerable[0].attributes.NOMBRE
                    this.atributos.OBJECTID =  elementoVulnerable[0].attributes.OBJECTID
                    this.atributos.TELCONTACTO =  elementoVulnerable[0].attributes.TELCONTACTO
                    this.atributos.UTMX =  elementoVulnerable[0].attributes.UTMX
                    this.atributos.UTMY =  elementoVulnerable[0].attributes.UTMY

                    _esto_alta.modificarElementoVulnerable()
                }
            } catch (e) {
                console.error("Se ha producido un error. " + e)
                this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error" + e)
            }
        },
        modificarElementoVulnerable: function () {
            this._onEditClose()
            this.cambiarEdicionFalse()
            this.limpiarFormularioElementoVulnerable();
            this.limpiarListas()
            this.rellenarFormularioDatosAsociadosElementoVulnerable()
            this.cambiarLabelWidget(this.config.titulo)
            if (document.getElementById(NOMBRE_WIDGET).style.display === 'none') {
                document.getElementsByClassName("container-section")[0].children[5].click()   
            }
            dojo.byId("widgetPanel_info").style.display = 'none'
            dojo.byId("widgetPanel_form_localizaciones").style.display = 'none'
            dojo.byId("widgetPanel_form").style.display = 'block'
        },
        aniadirLocalizacion_aux: function(evt) {
            this.atributos = null;
            this.aniadirLocalizacion()
        },
        aniadirLocalizacion: function() {
            try {
                console.log("Método aniadirLocalizacion")
                this.cambiarEdicionFalse()
                this.limpiarFormularioLocalizacion()
                this.limpiarFactoresVulnerables()
                this.limpiarVulnerabilidades()
                this.mostrarFormularioLocalizacion()
            } catch (e) {
                console.error("Se ha producido un error. " + e)
                this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error" + e)
            }
        },
        mostrarFormularioLocalizacion: function () {
            debugger
            this.cambiarLabelWidget("Localización")
            dojo.byId("widgetPanel_info").style.display = 'none'
            dojo.byId("widgetPanel_form").style.display = 'none'
            dojo.byId("widgetPanel_form_localizaciones").style.display = 'block'
            document.getElementById("inputLocalizacionUTMX").value = _esto_alta.puntoX
            document.getElementById("inputLocalizacionUTMY").value = _esto_alta.puntoY
            if (this.selectFilterElementoVulnerable === null) {
                this.crearSelectElementosVulnerables()
            }
            this.cargarElementosVulnerables()
            if (document.getElementById(NOMBRE_WIDGET).style.display === 'none') {
                document.getElementsByClassName("container-section")[0].children[5].click()   
            }
            document.getElementById("btAniadirDocumentoLocalizacion").onclick = function () {
                _esto_alta.aniadirDocumentos("inputDocumento_localizacion","selectDocumentoLozalizacion","myTable_localizacion","Localización")
            }
        },
        ocultarFormularioLocalizacion: function () {
            document.getElementById("widgetPanel_form").children[1].children[0].children[9].style.display = 'none'
        },
        VerDocumentos: function () {
            debugger
            try {
                var tiposDocumentos = ["Preplan", "Plan de Distrito", "Plan Director", "Simulacro", "DPI", "Otros"]
                var documentos = []

                var myQuery = new query()
                myQuery.where = "UTMX=" + _esto_alta.atributos.UTMX + " AND "  +"UTMY=" + _esto_alta.atributos.UTMY
                myQuery.returnGeometry = true
                myQuery.outFields = ["ID_ELEMENTOVULNERABLEP","NOMBRE"]
                var myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlElementoVulnerableP)
                myQueryTask.execute(myQuery, (results)=> {
                    myQuery.where = "ID_ELEMENTOVULNERABLEP in" + "("+(results.features.map(f=>f.attributes.ID_ELEMENTOVULNERABLEP).join(",")) +")"
                    myQuery.returnGeometry = false
                    myQuery.outFields = ["*"]
                    //Realizamos la busqueda
                    var myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlDocumentosVulnerable)
                    myQueryTask.execute(myQuery, (results_docVul)=> {
                        console.log(results_docVul)
                        myQuery.where = "ID_DOCUMENTO in"+ "("+(results_docVul.features.map(d=>d.attributes.ID_DOCUMENTO).join(",")) +")"
                        myQuery.returnGeometry = false
                        myQuery.outFields = ["*"]
                        myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlDocumentos)
                        myQueryTask.execute(myQuery, (result_doc)=> {
                            console.log(result_doc)
                            for (let doc = 0; doc < result_doc.features.length; doc++) {
                                var enlace = result_doc.features[doc].attributes.ENLACE.replaceAll("\\","/")
                                enlace = this.config.enlace + this.config.urlProxy + "file:" + enlace
                                documentos.push({
                                    "id":result_doc.features[doc].attributes.ID_DOCUMENTO,
                                    "idTipoDoc":result_doc.features[doc].attributes.ID_TIPODOCUMENTO,
                                    "nombre":result_doc.features[doc].attributes.NOMBRE,
                                    "enlace":enlace
                                })
                            }

                            var html = ""
                            for (let i = 0; i < results.features.length; i++) {
                                html += `<div>
                                    <span>Elemento vulnerable: ${results.features[i].attributes.ID_ELEMENTOVULNERABLEP} -  ${results.features[i].attributes.NOMBRE}</span><br/>
                                    <table>
                                    <th>Tipo</th><th>&nbsp;&nbsp;&nbsp;Documentos</th>`
                                for (let j = 0; j < results_docVul.features.length; j++) {
                                    if (results.features[i].attributes.ID_ELEMENTOVULNERABLEP === results_docVul.features[j].attributes.ID_ELEMENTOVULNERABLEP) {
                                        for (let d = 0; d < documentos.length; d++) {
                                            if (results_docVul.features[j].attributes.ID_DOCUMENTO === documentos[d].id) {
                                                html += `<tr>
                                                    <td>${tiposDocumentos[documentos[d].idTipoDoc-1]}</td>
                                                    <td>&nbsp;&nbsp;&nbsp;<a href="${documentos[d].enlace}" target="_blank">${documentos[d].nombre}</a></td>
                                                    </tr>`
                                            }
                                        }
                                    }
                                }
                                html+= `</table>
                                        </div>
                                        <br/>`
                            }
                            new Popup({
                                width: 850,
                                height: 400,
                                autoHeight: true,
                                titleLabel: results_docVul.features.length + (results_docVul.features.length === 1? " documento" : " documentos"),
                                content:html,
                                container: 'main-page',
                                buttons: [{
                                    label: "Cerrar",
                                    classNames: ['jimu-btn-vacation'],
                                    key: keys.ESCAPE
                                }]
                                });

                        },
                        lang.hitch(this, this.callbackErrorGenerico)
                        )
                    }, 
                    lang.hitch(this, this.callbackErrorGenerico)
                    )
                })
            } catch (e) {
                console.error("Se ha producido un error. " + e)
                this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error" + e)
            }
        },
        confirmElementoVulnerable: function () {
            this.dialog = null
            this.dialog = new ConfirmDialog({
                title: "Eliminar",
                content: "¿Está seguro qué quiere eliminar?",
                style: "width: 300px",
                onHide: function onHide() {
                    //No hacer nada
                } });
            this.dialog.set("buttonOk", "Aceptar");
            this.dialog.set("buttonCancel", "Cancelar");
            this.dialog.on('execute', lang.hitch(this, function () {
            _esto_alta.executeActionEliminarElementoVulnerable()
            }));
            this.dialog.show();
        },
        confirmArea: function () {
            this.dialog = null
            this.dialog = new ConfirmDialog({
                title: "Eliminar",
                content: "¿Está seguro qué quiere eliminar área?",
                style: "width: 300px",
                onHide: function onHide() {
                    //No hacer nada
                } });
            this.dialog.set("buttonOk", "Aceptar");
            this.dialog.set("buttonCancel", "Cancelar");
            this.dialog.on('execute', lang.hitch(this, function () {
            _esto_alta.executeActionEliminarArea()
            }));
            this.dialog.show();
        },
        ventanaInformacionLupa: function (event) {
            this.dialog = null
            this.dialog = new ConfirmDialog({
                title: "Información",
                content: "Se va a perder la información del mapa por la lupa",
                style: "width: 300px",
                onHide: function onHide() {
                    //No hacer nada
                } });
            this.dialog.set("buttonOk", "Seguir");
            this.dialog.set("buttonCancel", "Cancelar");
            this.dialog.on('execute', lang.hitch(this, function () {
            _esto_alta.onBaseMapBtnClick(event)
            }));
            this.dialog.show();
        },
        onBaseMapBtnClick: function(result) {
            this.eliminarOptionVacio()
            debugger
            if (result instanceof Object && (result.pointerType === "mouse" || result.pointerType === undefined)) {
                var nombreVia = document.getElementById("inputNombreVia").value
                if (nombreVia) {
                    var params = this.definirParametros();
                    if (params) {
                        this.urlObtenerDireccion = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSAccesoDireccion + "/" + this.config.funcionBuscar + "?" + params;
                        request(this.urlObtenerDireccion, {
                            handleAs: "xml"
                        }).then(function(response) {
                            if (_esto_alta.ventana) _esto_alta.ventana.close()
                            _esto_alta.mostarPopup = false
                            _esto_alta.procesarRespuesta(response)
                            _esto_alta.formatearTextoDireccion("1")
                            _esto_alta.onBaseMapBtnClick("resultado")
                        },
                        function (error) {
                            if (_esto_alta.ventana) _esto_alta.ventana.close()
                            _esto_alta.contenido = "No hay resultados"
                            _esto_alta.limpiarCamposDireccion()
                             _esto_alta.onBaseMapBtnClick("resultado")
    
                        })
                    }
                } else {
                    this.contenido = "<span>Debe indicar un nombre de vía para su localización</span>"
                }
            }
            this.ventanaLocalizador()
            if (this.mostarPopup)
                this.ventana.close()
        },
        definirParametros: function () {
            var tipoVia = document.getElementById("inputTipoVia").value
            var nombreVia = document.getElementById("inputNombreVia").value
            var numeroVia = document.getElementById("inputNumeroVia").value
            var calificadorVia = document.getElementById("inputCalificador").value
            var params = ""

            if (tipoVia) {
                if (params == "")
                { params = params + "tipoVia=" + tipoVia; }
                else
                { params = params + "&tipoVia=" + tipoVia; }
            }
            if (numeroVia) {
                if (params == "")
                { params = params + "numeroVia=" + numeroVia; }
                else
                { params = params + "&numeroVia=" + numeroVia; }
            }
            if (calificadorVia) {
                if (params == "")
                { params = params + "calificadorVia=" + calificadorVia.toUpperCase(); }
                else
                { params = params + "&calificadorVia=" + calificadorVia.toUpperCase(); }
            }
            if (params == "")
            { params = params + "nombreVia=" + nombreVia; }
            else
            { params = params + "&nombreVia=" + nombreVia; }

            params += "&tipoBusqueda=" + 3;

            return params;
        },
        procesarRespuesta: function (response) {
            debugger
            var data = xmlParser.parse(response);
            var nodosDirecciones = data.getElementsByTagName(this.config.tagNameVia); //Recogemos las vias propuestas
            for(var i=0; i < nodosDirecciones.length; i++) {
                var atributos = nodosDirecciones[i];
                this.atributosCandidato["tipoVia"] = _esto_alta.obtenerValorXML(atributos, this.config.atributoViaClaseTx);
                this.atributosCandidato["nombreVia"] = _esto_alta.obtenerValorXML(atributos, this.config.atributoNombreVia);
                this.atributosCandidato["codigoVia"] = _esto_alta.obtenerValorXML(atributos, this.config.atributoCodVia);

                this.listavias.push(this.atributosCandidato)
                this.atributosCandidato = {}
            }
            //if (this.listavias.length > 0) {
                var dpis = data.getElementsByTagName('pdi'); //Recogemos las dpis propuestas
                for(var i=0; i < dpis.length; i++) {
                    var atributos = dpis[i];
                    this.atributosCandidato["tipoVia"] = _esto_alta.obtenerValorXML(atributos, this.config.atributoViaClaseTx);
                    this.atributosCandidato["actividad"] = _esto_alta.obtenerValorXML(atributos, "actividad");
                    this.atributosCandidato["nombreVia"] = _esto_alta.obtenerValorXML(atributos, "nombreVia");
                    this.atributosCandidato["numeroVia"] = _esto_alta.obtenerValorXML(atributos, "numeroVia");
                    this.atributosCandidato["utmx"] = _esto_alta.obtenerValorXML(atributos, this.config.atributoUtmX);
                    this.atributosCandidato["utmy"] = _esto_alta.obtenerValorXML(atributos, this.config.atributoUtmY);
                    this.atributosCandidato["nombreDistrito"] = _esto_alta.obtenerValorXML(atributos, "nombreDistrito");
                    this.atributosCandidato["codDistrito"] = _esto_alta.obtenerValorXML(atributos, "codDistrito");

                    this.listaCodPdis.push(this.atributosCandidato)
                    this.atributosCandidato = {}
                }
            //}
        },
        ventanaLocalizador : function () {
            this.ventana = new Popup({
                width: 400,
                height: 700,
                autoHeight: true,
                titleLabel: "Localizador",
                content: this.contenido,
                container: 'main-page',
                buttons: [{
                label: "Cerrar",
                classNames: ['jimu-btn-vacation'],
                key: keys.ESCAPE
                }],
                onClose: lang.hitch(this, '_onEditClose')
            });
        },
        mostrarVentanaEmergenteMensajes: function (titulo,contenido) {
            this.dialog = null
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
        obtenerNDPRelacionado: function () {
            debugger
            var params = this.definirParametros()

            if (params && params.includes("numeroVia")) {
                this.urlObtenerDireccion = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSAccesoDireccion + "/" + this.config.funcionBuscar + "?" + params;
                request(this.urlObtenerDireccion, {
                    handleAs: "xml"
                }).then(function(response) {
                    _esto_alta.procesarRespuesta(response)
                    if (_esto_alta.listavias.length === 1) {
                        _esto_alta.obtenerCruceCodigo(_esto_alta.listavias[0]["codigoVia"])
                    }
                },
                function (error) {
                    var numeroVia = parseInt(document.getElementById("inputNumeroVia").value)
                    if (!(numeroVia > 0 ||  isNaN(numeroVia))) {
                        _esto_alta.mostrarVentanaEmergenteMensajes("Error", error)
                    }
                    document.getElementById("inputNDPRelacionado").value = ""
                })
            }
        },
        obtenerCruceCodigo: function (codigoVia) {
            this.urlObtenerDireccion = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSAccesoDireccion + "/" + this.config.funcionCruceCodigo + "?" + "codigoVia1="+codigoVia;
            request(this.urlObtenerDireccion, {
                handleAs: "xml"
            }).then(function(response) {
                var data = xmlParser.parse(response);
                var crucesPropuestos = data.getElementsByTagName("crucesPropuestos");
                if (crucesPropuestos.length > 0) {
                    var cruce = data.getElementsByTagName("cruce");
                    if (cruce.length > 0) {
                        var codNdp = _esto_alta.obtenerValorXML(cruce[0], 'codNdp');
                        document.getElementById("inputNDPRelacionado").value = codNdp
                    }
                }
            },
            function (error) {
                _esto_alta.mostrarVentanaEmergenteMensajes("Error", error)
            })
        },
        formatearTextoDireccion : function(parte) {
            debugger
            this.contenido = ""

            if (parte === "2") {
                for(var i=0; i < this.listavias.length; i++) {
                    var codigoVia = this.listavias[i]["codigoVia"]
                    var numeroVia = this.listavias[i]["numero"]
                    this.contenido += `<span style="cursor:pointer;" onclick="_esto_alta.obtenerDireccionPorCodigoYNumero('${codigoVia}','${numeroVia}')">` + this.listavias[i]["tipoVia"] + " " +  this.listavias[i]["nombreVia"] + " " +  this.listavias[i]["numero"] + "</span>" + "<br/>"
                }
            } else {

                if (this.listavias && this.listavias.length === 1) {
                    this.obtenerDireccionPorCodigo(this.listavias[0]["codigoVia"])
                } else {

                    for(var i=0; i < this.listavias.length; i++) {
                        this.contenido += `<span style='cursor:pointer;' onclick="_esto_alta.obtenerDireccionPorCodigo('${this.listavias[i]["codigoVia"]}')">` + this.listavias[i]["tipoVia"] + " " +  this.listavias[i]["nombreVia"] + "</span>" + "<br/>"
                    }

                    if (this.listaCodPdis && this.listaCodPdis.length > 0) {
                        this.contenido += "<br/>" + "<span> - Puntos de Interés - </span><br/><br/>"
                        for(var i=0; i < this.listaCodPdis.length; i++) {
                            var direccion = {
                                "calificador":"",
                                "tipoVia" : this.listaCodPdis[i]["tipoVia"],
                                "nombreVia": this.listaCodPdis[i]["nombreVia"],
                                "numeroVia":this.listaCodPdis[i]["numeroVia"],
                                "utmx": this.listaCodPdis[i]["utmx"],
                                "utmy": this.listaCodPdis[i]["utmy"],
                                "nombreDistrito": this.listaCodPdis[i]["nombreDistrito"],
                                "codDistrito": this.listaCodPdis[i]["codDistrito"],
                            }
                            direccion = JSON.stringify(direccion)
                            this.contenido += `<span style='cursor:pointer;'  onclick='_esto_alta.rellenarCamposDireccion(${direccion})'>` + this.listaCodPdis[i]["actividad"] + "</span>" + "<br/>"
                        }
                    }
                }
            }

            if (this.listavias.length === 0 && this.listaCodPdis.length === 0) {
                if (this.ventana)
                    this.ventana.close();
                this.contenido = "No hay resultados"
                this.limpiarCamposDireccion()
            }
        },
        obtenerDireccionPorCodigo: function (data) {
            this.listavias = []
            if (this.ventana)
                this.ventana.close();

            this.urlObtenerDireccion = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSAccesoDireccion + "/" + this.config.funcionDireccionCodigo + "?" + "codigoVia="+data;

            request(this.urlObtenerDireccion, {
                handleAs: "xml"
            }).then(function(response) {
                _esto_alta.responseObtenerDireccionCodigo(response)
                _esto_alta.onBaseMapBtnClick("resultado");
            },
            function (error) {
                _esto_alta.processError(error)
            })
        },
        responseObtenerDireccionCodigo: function (response) {
            var data = xmlParser.parse(response);
            var viaUnica = data.getElementsByTagName(this.config.tagNameVia); //Recogemos las vias propuestas
            if (this.ventana) this.ventana.close();

            if (viaUnica.length === 1) {
                var numeros = data.getElementsByTagName(this.config.tagNameNumero);
                for(var i=0; i < numeros.length; i++) {
                        var atrNumero = numeros[i];
                        this.atributosCandidato["tipoVia"] = _esto_alta.obtenerValorXML(viaUnica[0], this.config.atributoViaClaseTx);
                        this.atributosCandidato["nombreVia"] = _esto_alta.obtenerValorXML(viaUnica[0], this.config.atributoNombreVia);
                        this.atributosCandidato["codigoVia"] = _esto_alta.obtenerValorXML(viaUnica[0], this.config.atributoCodVia);
                        this.atributosCandidato["numero"] = atrNumero.textContent

                        this.listavias.push(this.atributosCandidato)
                        this.atributosCandidato = {}
                }
                var numeroVia = document.getElementById("inputNumeroVia").value
                if (numeroVia) {
                    this.isExisteNumeroVia(numeroVia)
                } else {
                    this.formatearTextoDireccion("2")  
                }
            }
        },
        obtenerDireccionPorCodigoYNumero: function (codigoVia, numeroVia) {

            this.urlObtenerDireccion = window.location.protocol + "//" + window.location.host + this.config.urlProxy + this.config.urlWSAccesoDireccion + "/" + this.config.funcionDireccionCodigo + "?" + "codigoVia="+codigoVia + "&numeroVia="+numeroVia;

            request(this.urlObtenerDireccion, {
                handleAs: "xml"
            }).then(function(response) {
                _esto_alta.responseObtenerDireccionPorCodigoYNumero(response)
            },
            function (error) {
                _esto_alta.processError(error)
            })
        },
        responseObtenerDireccionPorCodigoYNumero : function (response) {
            var data = xmlParser.parse(response);
            var viaUnica = data.getElementsByTagName(this.config.tagNameVia);

            var numeroCompleto = data.getElementsByTagName(this.config.atributoNumeroCompleto);
            var calificador = "";
            if (numeroCompleto[0].children[0].textContent !== '') {
                calificador = _esto_alta.obtenerValorXML(numeroCompleto[0], "calificador")
            }
            //var codBarrio = _esto_alta.obtenerValorXML(numeroCompleto[0], "codBarrio")
            var codDistrito = _esto_alta.obtenerValorXML(numeroCompleto[0], "codDistrito")
            //var codPostal = _esto_alta.obtenerValorXML(numeroCompleto[0], "codPostal")
            //var nombreBarrio = _esto_alta.obtenerValorXML(numeroCompleto[0], "nombreBarrio")
            var nombreDistrito = _esto_alta.obtenerValorXML(numeroCompleto[0], "nombreDistrito")
            var numero = _esto_alta.obtenerValorXML(numeroCompleto[0], "numero")
            //var origen = _esto_alta.obtenerValorXML(numeroCompleto[0], "origen")
            var utmx = _esto_alta.obtenerValorXML(numeroCompleto[0], "utmX")
            var utmy = _esto_alta.obtenerValorXML(numeroCompleto[0], "utmY")

            var direccion = {
                "calificador":calificador,
                "codigoVia":_esto_alta.obtenerValorXML(viaUnica[0], this.config.atributoCodVia),
                "tipoVia" : _esto_alta.obtenerValorXML(viaUnica[0], this.config.atributoViaClaseTx),
                "nombreVia": _esto_alta.obtenerValorXML(viaUnica[0], this.config.atributoNombreVia),
                "numeroVia":numero,
                "utmx": utmx,
                "utmy": utmy,
                "nombreDistrito": nombreDistrito,
                "codDistrito": codDistrito,
            }
            
            this.rellenarCamposDireccion(direccion)
        },
        rellenarCamposDireccion:function(direccion) {
            if (this.ventana) this.ventana.close();
            document.getElementById("inputTipoVia").value =  direccion["tipoVia"].toUpperCase()
            document.getElementById("inputNombreVia").value =  direccion["nombreVia"].toUpperCase()
            document.getElementById("inputNumeroVia").value = direccion["numeroVia"].toUpperCase()
            document.getElementById("inputCalificador").value = direccion["calificador"].toUpperCase()
            document.getElementById("inputUTMX").value = direccion["utmx"]
            document.getElementById("inputUTMY").value = direccion["utmy"]

            var selectDistrito = dojo.byId("inputDistrito").options

            for (let index = 0; index < selectDistrito.length; index++) {
                if (this.remplazarVocalesConTilde(selectDistrito[index].childNodes[0].data).toUpperCase().includes(direccion["nombreDistrito"]) ) {
                    selectDistrito[index].selected = true
                }
            }
            if (direccion["nombreDistrito"] === "") {
                var option = document.createElement("option");
                option.text = direccion["nombreDistrito"]
                selectDistrito.add(option, "")
                selectDistrito.selectedIndex = 0
            }
            this.obtenerNDPRelacionado()
            var punto = new Point(parseFloat(direccion["utmx"]), parseFloat(direccion["utmy"]), new SpatialReference({ wkid:23030}));
            this.cambioCordenadas(punto,25830,15932,true)
        },
        cambioCordenadas: function (geometria_original,spr_final,datum_transformacion,directa) {
            debugger
            var params = new ProjectParameters();
            params.geometries = [geometria_original];
            params.transformForward = directa
            params.outSR = new SpatialReference({ wkid:spr_final});
            if(datum_transformacion > 0) {
                params.transformation = {wkid:datum_transformacion};
            }
            geometryService = new GeometryService(this.config.urlGeometry);
            geometryService.project(params, function(geome) {
                var punto = new Point(geome[0].x, geome[0].y, new SpatialReference({ wkid:geome[0].spatialReference.wkid}));
                _esto_alta.map.centerAndZoom(punto,18);
            },function (error){
                console.log(error)
            })
        },
        limpiarCamposDireccion: function() {
            document.getElementById("inputTipoVia").value =  ""
            document.getElementById("inputNombreVia").value =  ""
            document.getElementById("inputNumeroVia").value = ""
            document.getElementById("inputCalificador").value = ""
            document.getElementById("inputUTMX").value = ""
            document.getElementById("inputUTMY").value = ""
        },
        eliminarOptionVacio : function () {
            var selectDistrito = dojo.byId("inputDistrito").options
            for (let index = 0; index < selectDistrito.length; index++) {
                if (selectDistrito[index].childNodes.length === 0 && "" === selectDistrito[index].textContent) {
                    dojo.byId("inputDistrito").remove(0)
                }
            }
        },
        remplazarVocalesConTilde(nombreDistrito) {
            if (nombreDistrito.includes("á")) nombreDistrito = nombreDistrito.replace(/á/g,"a")
            if (nombreDistrito.includes("é")) nombreDistrito = nombreDistrito.replace(/é/g,"e")
            if (nombreDistrito.includes("í")) nombreDistrito = nombreDistrito.replace(/í/g,"i")
            if (nombreDistrito.includes("ó")) nombreDistrito = nombreDistrito.replace(/ó/g,"o")
            if (nombreDistrito.includes("ú")) nombreDistrito = nombreDistrito.replace(/ú/g,"u")
            return nombreDistrito;
        },
        isExisteNumeroVia : function (numero) {
            for (let index = 0; index < this.listavias.length; index++) {
                if(this.listavias[index]["numero"] === numero) {
                    this.mostarPopup = true;
                    this.obtenerDireccionPorCodigoYNumero(this.listavias[index]["codigoVia"],numero);
                }
            }
            if (!this.mostarPopup) {
                this.formatearTextoDireccion("2") 
            }
        },
    /**
    *********************************************************************************                                                ***************************************************************************************
    * ****************************************************************************** Métodos factor vulnerabilidad en Categorización ***************************************************************************************
    * ******************************************************************************                                                 ***************************************************************************************
    */
    getTiposFactor : function () {
        try {
            var peticionSoap = this.crearRequest(null,"getTiposFactor")

            var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', this.urlObtenerServicio, true);

                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        if (xmlhttp.status == 200) {
                            var data = xmlParser.parse(xmlhttp.response);
                            var tagname = "getTiposFactorResponse"
                            var tiposFactor = dojo.query(tagname, data)[0].childNodes;
                            var selectTipoFactor = dojo.byId("campoTipoFactor");
                            for (let index = 0; index < tiposFactor.length; index++) {
                                var  descripcion = _esto_alta.parsearDescripcion(tiposFactor[index])
                                _esto_alta.insertComboBoxElement(selectTipoFactor, descripcion.descripcion, descripcion.id)
                            }
                        }
                    }
                }
                xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                xmlhttp.send(peticionSoap);
        } catch (e) {
            console.error("Se ha producido un error, "+e)
            this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error, "+e)
        }
    },
    obtenerMaxIdFactorVulnerabilidad: function (action) {
        try {
            var peticionSoap = this.crearRequest(null, "getMaxIdFactorVulnerabilidad")

            var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', this.urlObtenerServicio, true);

                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        try {
                            if (xmlhttp.status == 200) {
                                var data = xmlParser.parse(xmlhttp.response);
                                var tagname = "getMaxIdFactorVulnerabilidadReturn"
                                var maxId = dojo.query(tagname, data)[0].childNodes;
                                _esto_alta.idMaximoFactorVulnerabilidad = maxId[0].nodeValue
                                _esto_alta.executeActionFactoresVulnerables(action)
                            }
                            if (xmlhttp.status == 500 && action === ACTION_ANIADIR) {
                                _esto_alta.eliminarElementoVulnerablePXObjectId()
                                _esto_alta.mostrarVentanaEmergenteMensajes("Elemento Vulnerable", "No se ha podido guardar correctamente")
                            }
                        } catch (e) {
                                _esto_alta.eliminarElementoVulnerablePXObjectId()
                                console.error("Se ha producido un error, "+e)
                                this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error, "+e)
                        }
                    }
                }
                xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                xmlhttp.send(peticionSoap);
        } catch (e) {
            _esto_alta.eliminarElementoVulnerablePXObjectId()
            console.error("Se ha producido un error, "+e)
            this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error, "+e)
        }
    },
    aniadirTipoFactor: function () {
        debugger
        try {
            var tipoFactor =  document.getElementsByName("campoTipoFactor")[0].options[document.getElementsByName("campoTipoFactor")[0].selectedIndex]

            var tipoFactorText = tipoFactor.textContent
            var tipoFactorValue = tipoFactor.value

            var table = document.getElementById("myTable_factor");
            var row = table.insertRow(-1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            this.factoresVulnerables.push({"id":null ,"idTipoFactor":parseInt(tipoFactorValue)})

            cell1.innerHTML = `<td><p id="txt_tipoFactor" name="inputTipoFactor">${tipoFactorText}</p></td>`
            cell2.innerHTML = `<td><button id="btEliminarTipoFactor" name="btEliminarTipoFactor" type="button" dojoType="dijit.form.Button" onclick='_esto_alta.limpiarTipoFactor(event)'>Eliminar</button></td>`

            document.getElementsByName("campoTipoFactor")[0].options[0].selected = true

            this.editarTipoFactor = true
        } catch (e) {
            this.mostrarVentanaEmergenteMensajes("Elemento vulnerable","Se ha producido un error, " + e)
            console.error("Se ha producido un error, " + e)
        }
    },
    limpiarTipoFactor: function (event) {
        try {
            var elemento  = event.target.parentElement.parentElement
            var pos = elemento.rowIndex
            document.getElementById("myTable_factor").deleteRow(pos)
            this.factoresVulnerables.splice(pos-2,1)
            console.log(this.factoresVulnerables)
            this.editarTipoFactor = true
        } catch (e) {
            this.mostrarVentanaEmergenteMensajes("Elemento vulnerable","Se ha producido un error, " + e)
            console.error("Se ha producido un error, " + e)
        }
    },
    executeActionFactoresVulnerables: function (action) {
        debugger
        try {
            //var hash = {}

            if (this.idMaximoFactorVulnerabilidad && parseInt(this.idMaximoFactorVulnerabilidad) > -1) {
                //_esto_alta.factoresVulnerables = _esto_alta.factoresVulnerables.filter(f=> hash[f.id]? false : hash[f.id] = true)

                var layerFactorVulnerable = new FeatureLayer(this.config.layerRiesgos.seviceUrlFactorVulneravilidad);

                    let tipos = _esto_alta.getListaTiposFactor()
                    var factoresVulnerables = new Array(tipos.length)
                     for (let index = 0; index < tipos.length; index++) {
                        var addFeatureTipoFactor = new Graphic({
                            attributes: tipos[index]
                        });
                        factoresVulnerables[index] = addFeatureTipoFactor
                    }

                    if (action && action === ACTION_ANIADIR) {
                            layerFactorVulnerable.applyEdits(
                                factoresVulnerables, 
                                null, 
                                null, 
                                lang.hitch(this, this.infoSuccessAddFeatureLayerFactorVulnerabilidad),
                                () =>  _esto_alta.eliminarElementoVulnerablePXObjectId()
                            );
                    } else  if (action && action === ACTION_EDITAR) {
                            layerFactorVulnerable.applyEdits(
                                factoresVulnerables, 
                                null, 
                                null, 
                                lang.hitch(this, this.infoSuccessEditarFeatureLayerFactorVulnerable), 
                                lang.hitch(this, this.callbackErrorGenerico)
                            );
                    }
            } else {
                this.mostrarVentanaEmergenteMensajes("Elemento vulnerable","Se ha producido un error")
                if (action && action === ACTION_ANIADIR) {
                    this.eliminarElementoVulnerablePXObjectId()
                }
            }

        } catch (e) {
            _esto_alta.eliminarElementoVulnerablePXObjectId()
            this.mostrarVentanaEmergenteMensajes("Elemento vulnerable","Se ha producido un error, " + e)
            console.error("Se ha producido un error, " + e)
        }
    },
    executeActionQueryFactoresVulnerables: function () {
        debugger
        var myQuery = new query()
        myQuery.where = "ID_ELEMENTOVULNERABLEP=" + _esto_alta.atributos.ID_ELEMENTOVULNERABLEP
        myQuery.returnGeometry = false
        myQuery.outFields =["*"]
        //Realizamos la busqueda
        var myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlFactorVulneravilidad)
        myQueryTask.execute(myQuery, lang.hitch(this, this.getFactoresVulnerables), lang.hitch(this, this.callbackErrorGenerico))
    },
    getFactoresVulnerables: function (results) {
        debugger
        this.factoresVulnerables = []
        this.factoresVulnerables_aux = []
        if (results) {
            for (let index = 0; index < results.features.length; index++) {
                var atributos = results.features[index].attributes
                this.factoresVulnerables.push({"id":atributos.ID_FACTORVULNERABILIDAD,"idTipoFactor":atributos.ID_TIPOFACTOR})
                this.factoresVulnerables_aux.push(
                    {"objectId":atributos.OBJECTID,"idFactor":atributos.ID_FACTORVULNERABILIDAD,"idTipoFactor":atributos.ID_TIPOFACTOR, "idElementoVulmerableP":atributos.ID_ELEMENTOVULNERABLEP,"descripción":atributos.DESCRIPCION}
                )
            }
            this.getTiposFactoresXId()
        } else {
            this.mostrarVentanaEmergenteMensajes("Elemento vulnerable","Se ha producido un error, " + e)
        }
    },
    getTiposFactoresXId: function () {
        debugger

        if (this.factoresVulnerables.length > 0) {
            var xml = ""
            for (let key in this.factoresVulnerables) {
                xml += "<idTipo>" +  this.factoresVulnerables[key].idTipoFactor +"</idTipo>"
            }
            var peticionSoap = this.crearRequest(xml, "getTiposFactoresXId")

            var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', this.urlObtenerServicio, true);
        
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        if (xmlhttp.status == 200) {
                            var data = xmlParser.parse(xmlhttp.response);
                            var tagname = "getTiposFactoresXIdResponse"
                            var tipos = dojo.query(tagname, data)[0].childNodes;
                            _esto_alta.descripciones.tiposFactor=[]
                            for (let index = 0; index < tipos.length; index++) {
                                var  descripcion = _esto_alta.parsearDescripcion(tipos[index])
                                _esto_alta.descripciones.tiposFactor.push(descripcion)
                            }
                            _esto_alta.cargarFactoresVulnerablesAlmodificar()
                        }
                    }
                }
                xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                xmlhttp.send(peticionSoap);
        }
    },
    getListaTiposFactor: function () {
        var factoresVulnerables = []
        let idFactor = parseInt(_esto_alta.idMaximoFactorVulnerabilidad)

        for (let index = 0; index < _esto_alta.factoresVulnerables.length; index++) {
            var factorVulnerable = {};
            factorVulnerable["ID_FACTORVULNERABILIDAD"] = ++idFactor
            factorVulnerable["ID_TIPOFACTOR"] = parseInt(_esto_alta.factoresVulnerables[index].idTipoFactor)
            factorVulnerable["ID_ELEMENTOVULNERABLEP"] = _esto_alta.idMaximoElementoVulnerable
            factorVulnerable["DESCRIPCION"] = document.getElementById("inputNombreRiesgo").value
            
            factoresVulnerables.push(factorVulnerable)
        }
        return factoresVulnerables
    },
    /**
    *********************************************************************************                                     ***************************************************************************************
    * ****************************************************************************** Métodos tipologías en Categorización ***************************************************************************************
    * ******************************************************************************                                      ***************************************************************************************
    */
    getDistritos : function () {
        debugger
        var peticionSoap = this.crearRequest(null, this.config.funcionGetDistritos)

        var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', this.urlObtenerServicio, true);

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var data = xmlParser.parse(xmlhttp.response);
                        var tagname = _esto_alta.config.tagNameGetDistrito
                        var distritos = dojo.query(tagname, data)[0].childNodes;
                        var selectDistritos = dojo.byId("inputDistrito");
                        for (let index = 0; index < distritos.length; index++) {
                            var  descripcion = _esto_alta.parsearDescripcion(distritos[index])
                            _esto_alta.insertComboBoxElement(selectDistritos, descripcion.descripcion, descripcion.id)
                        }
                    }
                }
            }
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.send(peticionSoap);
    },
    getClases: function (event, bool, posicion) {
        debugger
        this.modificar = bool

        var peticionSoap = this.crearRequest(null, this.config.funcionGetFactor)

        this.getPosicion(event,posicion)

        var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', this.urlObtenerServicio, true);

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var data = xmlParser.parse(xmlhttp.response);
                        var tagname = _esto_alta.config.tagNameGetFactor
                        var factores = dojo.query(tagname, data)[0].childNodes;
                        var selectFactor
                        if (_esto_alta.posicion && _esto_alta.posicion != 0) {
                            selectFactor= document.getElementsByName("inputClase")[_esto_alta.posicion-1]
                        }
                        _esto_alta.RemoveComboBoxElements(selectFactor);
                        _esto_alta.insertComboBoxElement(selectFactor, "Seleccione clase", "")
                        for (let index = 0; index < factores.length; index++) {
                            var  descripcion = _esto_alta.parsearDescripcion(factores[index])
                            _esto_alta.insertComboBoxElement(selectFactor, descripcion.descripcion, descripcion.id)
                        }
                        if (_esto_alta.modificar) {
                            _esto_alta.preCargarSelects("inputClase")
                            document.getElementsByName("inputClase")[_esto_alta.posicion-1].options[0].disabled = true
                            _esto_alta.getCategorias(undefined, true, posicion)
                        }
                    }
                }
            }
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.send(peticionSoap);
    },
    getCategorias: function (event, bool, posicion) {
        try {
            debugger
            var idFactor = -1
            this.modificar = bool

            document.getElementsByName("inputCategoria")[this.posicion-1].disabled = false

            this.getPosicion(event,posicion)

            if (document.getElementsByName("inputClase")[this.posicion-1].options.length !== 0) {
                idFactor = document.getElementsByName("inputClase")[this.posicion-1].options[document.getElementsByName("inputClase")[this.posicion-1].selectedIndex].value
            }

            
            if (idFactor === "6") {
                var selectSubcategoria = document.getElementsByName("inputSubcategoria")[_esto_alta.posicion-1]
                document.getElementsByName("inputSubcategoria")[_esto_alta.posicion-1].disabled = true 
            }

            if (idFactor) {
            
                var peticionSoap = this.crearRequest("<idFactor>"+ idFactor +"</idFactor>", this.config.funcionGetCategoria)

                var xmlhttp = new XMLHttpRequest();
                    xmlhttp.open('POST', this.urlObtenerServicio, true);
            
                    xmlhttp.onreadystatechange = function () {
                        if (xmlhttp.readyState == 4) {
                            if (xmlhttp.status == 200) {
                                var data = xmlParser.parse(xmlhttp.response);
                                var tagname = _esto_alta.config.tagNameGetCategoria
                                var categorias = dojo.query(tagname, data)[0].childNodes;
                                var selectCategoria
                                if (_esto_alta.posicion && _esto_alta.posicion != 0) {
                                    selectCategoria= document.getElementsByName("inputCategoria")[_esto_alta.posicion-1]
                                }
                                _esto_alta.RemoveComboBoxElements(selectCategoria);
                                _esto_alta.insertComboBoxElement(selectCategoria, "Seleccione Categoría", "")
                                for (let index = 0; index < categorias.length; index++) {
                                    var  descripcion = _esto_alta.parsearDescripcion(categorias[index])
                                    _esto_alta.insertComboBoxElement(selectCategoria, descripcion.descripcion, descripcion.id)
                                }
                                if (_esto_alta.modificar) {
                                    _esto_alta.preCargarSelects("inputCategoria")
                                    document.getElementsByName("inputCategoria")[_esto_alta.posicion-1].options[0].disabled = true
                                    _esto_alta.getSubcategoria(undefined, true, posicion)
                                }
                            }
                        }
                    }
                    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                    xmlhttp.send(peticionSoap);
            } else {
                document.getElementsByName("inputCategoria")[_esto_alta.posicion-1].options[document.getElementsByName("inputCategoria")[0].selectedIndex = 0]
                document.getElementsByName("inputCategoria")[0].disabled = true 
                document.getElementsByName("inputSubcategoria")[_esto_alta.posicion-1].options[document.getElementsByName("inputSubcategoria")[0].selectedIndex = 0]
                document.getElementsByName("inputSubcategoria")[0].disabled = true
            }
        } catch (error) {

        }
    },
    getSubcategoria: function (event, bool, posicion) {
        try {
            document.getElementsByName("inputSubcategoria")[this.posicion-1].disabled = false
            this.modificar = bool

            var idCategoria = -1

            this.getPosicion(event,posicion)

            if (document.getElementsByName("inputCategoria")[this.posicion-1].options.length !== 0) {
                idCategoria = document.getElementsByName("inputCategoria")[this.posicion-1].options[document.getElementsByName("inputCategoria")[this.posicion-1].selectedIndex].value
            }

            if (idCategoria) {
            
                var peticionSoap = this.crearRequest("<idCategoria>"+ idCategoria +"</idCategoria>", this.config.funcionGetsubCategoria)

                var xmlhttp = new XMLHttpRequest();
                    xmlhttp.open('POST', this.urlObtenerServicio, true);
            
                    xmlhttp.onreadystatechange = function () {
                        if (xmlhttp.readyState == 4) {
                            if (xmlhttp.status == 200) {
                                var data = xmlParser.parse(xmlhttp.response);
                                var tagname = _esto_alta.config.tagNameGetsubCategoria
                                var subcategorias = dojo.query(tagname, data)[0].childNodes;
                                var selectSubcategoria
                                if (_esto_alta.posicion && _esto_alta.posicion != 0) {
                                    selectSubcategoria = document.getElementsByName("inputSubcategoria")[_esto_alta.posicion-1]
                                }
                                _esto_alta.RemoveComboBoxElements(selectSubcategoria);
                                _esto_alta.insertComboBoxElement(selectSubcategoria, "Seleccione Subcategoría", "")
                                for (let index = 0; index < subcategorias.length; index++) {
                                    var  descripcion = _esto_alta.parsearDescripcion(subcategorias[index])
                                    _esto_alta.insertComboBoxElement(selectSubcategoria, descripcion.descripcion, descripcion.id)
                                }
                                if (_esto_alta.modificar) {
                                    _esto_alta.preCargarSelects("inputSubcategoria")
                                    document.getElementsByName("inputSubcategoria")[_esto_alta.posicion-1].options[0].disabled = true
                                }
                            }
                        }
                    }
                    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                    xmlhttp.send(peticionSoap);
            } else {

                if (document.getElementsByName("inputClase")[_esto_alta.posicion-1].options[document.getElementsByName("inputClase")[_esto_alta.posicion-1].selectedIndex].value === "6") {
                    var selectSubcategoria = document.getElementsByName("inputSubcategoria")[_esto_alta.posicion-1]
                    _esto_alta.insertComboBoxElement(selectSubcategoria,"Seleccione Subcategoría","")
                }
                document.getElementsByName("inputSubcategoria")[_esto_alta.posicion-1].options[document.getElementsByName("inputSubcategoria")[0].selectedIndex = 0]
                document.getElementsByName("inputSubcategoria")[_esto_alta.posicion-1].disabled = true 
            }
        } catch (error) {
            console.error(error)
        }
    },
    getPosicion: function (event, posicion) {
        var index
        if (event) {
            var elemento  = event.target.parentElement.parentElement
            index = elemento.rowIndex
            if (index === 1) {
                this.posicion = index
            }
        }

        if (index === undefined || index === -1)
            this.posicion = posicion
    },
    cargarLocalizacionesXIdElementoVulnerable: function () {

        var peticionSoap = this.crearRequest("<id_elemenetoVulnerable>" + this.atributos.ID_ELEMENTOVULNERABLEP + "</id_elemenetoVulnerable>", this.config.funcionGetLocalizaciones)

        var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', this.urlObtenerServicio, true);
    
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var data = xmlParser.parse(xmlhttp.response);
                        var tagname = _esto_alta.config.tagNameGetLocalizaciones
                        var localizaciones = dojo.query(tagname, data)[0].childNodes;
                        var selectLocalizaciones = document.getElementsByName("inputLocalizaciones")[0]
                        _esto_alta.RemoveComboBoxElements(selectLocalizaciones);
                        for (let index = 0; index < localizaciones.length; index++) {
                            var  descripcion = _esto_alta.parsearDescripcion(localizaciones[index])
                            _esto_alta.insertComboBoxElement(selectLocalizaciones, descripcion.descripcion, descripcion.id)
                        }
                    }
                }
            }
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.send(peticionSoap);
    },
    cargarElementosVulnerables: function () {

        try {

            var peticionSoap = this.crearRequest(null, this.config.funcionGetElementosVulnerables)

            var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', this.urlObtenerServicio, true);
        
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        if (xmlhttp.status == 200) {
                            var data = xmlParser.parse(xmlhttp.response);
                            var tagname = _esto_alta.config.tagNameGetElementosVulnerables
                            var elementosVulnerables = dojo.query(tagname, data)[0].childNodes;
                            if (_esto_alta.elementosVulnerables.length > 0) {
                                _esto_alta.elementosVulnerables = []
                                dijit.byId("selectElemento").store.data = [];
                                dojo.byId("selectElemento").value = "";
                            }
                            for (let index = 0; index < elementosVulnerables.length; index++) {
                                var  descripcion = _esto_alta.parsearDescripcion(elementosVulnerables[index])
                                _esto_alta.elementosVulnerables.push( {"name":descripcion.descripcion, "id":descripcion.id} )
                            }
                            dijit.byId("selectElemento").store.data = _esto_alta.elementosVulnerables;
                            if (_esto_alta.atributos) {
                                _esto_alta.selectFilterElementoVulnerable.set('item',_esto_alta.elementosVulnerables.filter((ev)=>ev.id == _esto_alta.atributos.ID_ELEMENTOVULNERABLEP)[0])
                            } else {
                                _esto_alta.selectFilterElementoVulnerable.set('item',{})
                                document.getElementsByName("selectElementoVulnerable")[0].value = ""
                            }
                        }
                    }
                }
                xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                xmlhttp.send(peticionSoap);
        } catch (e) {
            this.mostrarVentanaEmergenteMensajes("Elemento vulnerable","Se ha producido un error, " + e)
            console.error("Se ha producido un error, " + e)
        }
    },
    /**
     * Método que valida los combobox de la vulnerabilidad
     */
    validarSelects: function (posicion) {
        debugger
        try {
            var selectFactor = document.getElementsByName("inputClase")[posicion]
            var selectCategoria  = document.getElementsByName("inputCategoria")[posicion]
            var selectSubcategoria = document.getElementsByName("inputSubcategoria")[posicion]

            var idFactor =  selectFactor.options[selectFactor.selectedIndex].value
            var idCategoria = selectCategoria.options[selectCategoria.selectedIndex].value
            var idSubcategoria = selectSubcategoria.options[selectSubcategoria.selectedIndex].value

            var textFactor =  selectFactor.options[selectFactor.selectedIndex].textContent
            var textCategoria = selectCategoria.options[selectCategoria.selectedIndex].textContent
            var textSubcategoria = selectSubcategoria.options[selectSubcategoria.selectedIndex].textContent

            if (textFactor === "Otros" 
                && textCategoria === "Seleccione Categoría" 
                && textSubcategoria === "Seleccione Subcategoría") {
                return true;
            }

            if (textFactor !== "Otros" 
                && textCategoria === "Otros" 
                && textSubcategoria === "Seleccione Subcategoría" 
                && selectSubcategoria.disabled === false) {
                    return true;
            }

            return (selectFactor.disabled === false && 
                    selectCategoria.disabled === false && 
                    selectSubcategoria.disabled === false &&
                    idFactor !== "" && idCategoria !== "" && idSubcategoria !== "")? true : false
        } catch (e) {
            this.mostrarVentanaEmergenteMensajes("Elemento vulnerable","Se ha producido un error, " + e)
            console.error("Se ha producido un error, " + e)
        }
    },   
    aniadirTipologia: function () {
        debugger
        try {
            if (this.validarSelects(0)) {
                var clase =  document.getElementsByName("inputClase")[0].options[document.getElementsByName("inputClase")[0].selectedIndex]
                var categoria = document.getElementsByName("inputCategoria")[0].options[document.getElementsByName("inputCategoria")[0].selectedIndex]
                var subcategoria =    document.getElementsByName("inputSubcategoria")[0].options[document.getElementsByName("inputSubcategoria")[0].selectedIndex]

                var table = document.getElementById("myTable");
                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                //var cell4 = row.insertCell(3);
                //var cell5 = row.insertCell(4);

                var claseValue = clase.value
                var categoriaValue = categoria.value
                var subCategoriaValue = subcategoria.value
                var claseText = clase.textContent
                var categoriaText = categoria.textContent
                var subCategoriaText = subcategoria.textContent

                if (clase.text === "Otros" && categoria.value === "" && subcategoria.value === "") {
                    categoriaValue = 30
                    subCategoriaValue = 50
                    categoriaText = ""
                    subCategoriaText = ""
                }
                if (clase.text !== "Otros" && categoria.text === "Otros" && subcategoria.value === "") {
                    subCategoriaValue = 50
                    subCategoriaText = ""
                }

                this.tipologias.push({"idClase":parseInt(claseValue),"idCategoria":parseInt(categoriaValue),"idSubcategoria":parseInt(subCategoriaValue)})
                console.log(this.tipologias)

                cell1.innerHTML = `<td><p id="txt_clase" name="inputClase">${claseText}</p></td>`
                cell2.innerHTML = `<td><p id="txt_categoria" name="inputCategoria">${categoriaText}</p></td>`
                cell3.innerHTML = `
                <td><p id="txt_subcategoria" name="inputSubcategoria">${subCategoriaText}</p>
                    <br/>
                    <button id="btn_Modificar" name="btn_Modificar" type="button" dojoType="dijit.form.Button"  onclick='_esto_alta.modificarTipologias(event)'>Modificar</button>
                    <button id="btEliminar" name="btEliminar" type="button" dojoType="dijit.form.Button" onclick='_esto_alta.limpiarTipologia(event)'>Eliminar</button>
                    <br/>
                </td>`
                //cell4.innerHTML = `<td><button id="btEliminar" name="btEliminar" type="button" dojoType="dijit.form.Button" onclick='_esto_alta.limpiarTipologia(event)'>Eliminar</button></td>`
                //cell5.innerHTML = `<td><button id="btn_Modificar" name="btn_Modificar" type="button" dojoType="dijit.form.Button"  onclick='_esto_alta.modificarTipologias(event)'>Modificar</button></td>`

                document.getElementsByName("inputClase")[0].options[0].selected = true
                document.getElementsByName("inputCategoria")[0].options[0].selected = true
                document.getElementsByName("inputSubcategoria")[0].options[0].selected = true
                document.getElementsByName("inputCategoria")[0].disabled = true
                document.getElementsByName("inputSubcategoria")[0].disabled = true
                this.editarTipologia = true
            }
        } catch (e) {
            this.mostrarVentanaEmergenteMensajes("Elemento vulnerable","Se ha producido un error, " + e)
            console.error("Se ha producido un error, " + e)
        }
    },
    /**
     * Método que habilta los selects de las vulnerabilidades cuando se pulsa el boton editar
     */
     modificarTipologias : function (event) {
        try {
            debugger
            var elemento  = event.target.parentElement.parentElement
            var pos = elemento.rowIndex
            this.posicion = pos

            this.modificar = true;
            this.factor_texto =  document.getElementsByName("inputClase")[this.posicion-1].textContent
            this.categoria_texto =  document.getElementsByName("inputCategoria")[this.posicion-1].textContent
            this.subcategoria_texto =  document.getElementsByName("inputSubcategoria")[this.posicion-1].textContent

            var table = document.getElementById("myTable");
            table.deleteRow(pos)
            var row = table.insertRow(pos);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            //var cell4 = row.insertCell(3);
            //var cell5 = row.insertCell(4);

            cell1.innerHTML = `<td><select class="dijitReset dijitInputInner" name="inputClase"></select></td>`
            cell2.innerHTML = `<td><select class="dijitReset dijitInputInner" name="inputCategoria" style="width:100%;"></select></td>`
            cell3.innerHTML = `
            <td>
                <select class="dijitReset dijitInputInner" name="inputSubcategoria" style="width:100%;"></select>
                <button id="btGuardar" name="btGuardar" type="button" dojoType="dijit.form.Button" onclick='_esto_alta.guardarTipologias(event)'>Guardar</button>
            </td>`
            //cell4.innerHTML = ` <td><button id="btGuardar" name="btGuardar" type="button" dojoType="dijit.form.Button" onclick='_esto_alta.guardarTipologias(event)'>Guardar</button></td>`
            //cell5.innerHTML = ""

            this.getClases(event, true, pos)

            document.getElementsByName("inputClase")[this.posicion-1].onchange = function () {
                _esto_alta.getCategorias(event, true, pos)
                document.getElementsByName("inputSubcategoria")[_esto_alta.posicion-1].options[document.getElementsByName("inputSubcategoria")[_esto_alta.posicion-1].selectedIndex = 0]
                document.getElementsByName("inputSubcategoria")[_esto_alta.posicion-1].disabled = true
            }
            document.getElementsByName("inputCategoria")[_esto_alta.posicion-1].disabled = true 
            document.getElementsByName("inputCategoria")[this.posicion-1].onchange = function () {_esto_alta.getSubcategoria(event, true, pos)}
            this.editarTipologia = this.modificar
        } catch (e) {
            this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error, " + e)
            console.error("Se ha producido un error, " + e)
        }
    },
    /** Eliminar todas las vulneravilidades al cerrar el widget o al cambiar de acción en el menú contextual*/
    limpiarFactoresVulnerables: function () {
        var filas = document.getElementById("myTable_factor").rows
        for (let index = 0; index < filas.length; index++) {
            if (index > 1) {
                document.getElementById("myTable_factor").deleteRow(index)
                index = 0
            }
        }
        this.factoresVulnerables = []
        this.descripciones = []
    },    
    /** 
     * Eliminar cada tipologia al pulsar el botón eliminar
     * */
    limpiarTipologia: function (event) {
        try {
            var elemento  = event.target.parentElement.parentElement
            var pos = elemento.rowIndex
            document.getElementById("myTable").deleteRow(pos)
            this.tipologias.splice(pos-2,1)
            this.editarTipologia = true
            console.log(this.tipologias)
        } catch (e) {
            this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error, " + e)
            console.error("Se ha producido un error, " + e)
        }
    },
    /** Eliminar todas las vulneravilidades al cerrar el widget o al cambiar de acción en el menú contextual*/
    limpiarVulnerabilidades: function () {
        var filas = document.getElementById("myTable").rows// hay que eliminar todas
        for (let index = 0; index < filas.length; index++) {
            if (index > 1) {
                document.getElementById("myTable").deleteRow(index)
                index = 0
            }
        }
        this.tipologias = []
        this.descripciones = []
    },
    /** Eliminar todas los documentos al cerrar el widget o al cambiar de acción en el menú contextual*/
    limpiarDocumentos: function (id) {
        var filas = document.getElementById(id).rows
        for (let index = 0; index < filas.length; index++) {
            if (index > 0) {
                document.getElementById(id).deleteRow(index)
                index = 0
            }
        }
        this.documentosVulnerables = []
        this.descripciones = []
    },
    /** Guarda vulnerabilidad después de modificar datos en los combo y pulsar el botón 'Guardar'*/
    guardarTipologias : function (event) {
        debugger
        console.log("método guardar tipologias")
        if (this.validarSelects(this.posicion-1)) {
        this.modificar = false;
        var elemento  = event.target.parentElement.parentElement
        var pos = elemento.rowIndex
        this.posicion = pos

        var clases =  document.getElementsByName("inputClase")[this.posicion-1].options
        var clase = clases[clases.selectedIndex]

        var categorias =  document.getElementsByName("inputCategoria")[this.posicion-1].options
        var categoria = categorias[categorias.selectedIndex]

        var subcategorias =  document.getElementsByName("inputSubcategoria")[this.posicion-1].options
        var subcategoria = subcategorias[subcategorias.selectedIndex]

        var claseText = clase.textContent
        var categoriaText = categoria.textContent;
        var subCategoriaText = subcategoria.textContent;
        var claseValue = clase.value
        var categoriaValue = categoria.value;
        var subCategoriaValue = subcategoria.value;


        if (clase.text === "Otros" && categoria.value === "" && subcategoria.value === "") {
            categoriaValue = 30
            subCategoriaValue = 50
            categoriaText = ""
            subCategoriaText = ""
        }
        if (clase.text !== "Otros" && categoria.text === "Otros" && subcategoria.value === "") {
            subCategoriaValue = 50
            subCategoriaText = ""
        }

        var table = document.getElementById("myTable");
        table.deleteRow(pos)
        var row = table.insertRow(pos);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        //var cell4 = row.insertCell(3);
        //var cell5 = row.insertCell(4);

        cell1.innerHTML = `<td><p id="txt_clase" name="inputClase">${claseText}</p></td>`
        cell2.innerHTML = `<td><p id="txt_categoria" name="inputCategoria">${categoriaText}</p></td>`
        cell3.innerHTML =  `
        <td>
            <p id="txt_subcategoria" name="inputSubcategoria">${subCategoriaText}</p>
            <button id="btEliminar" name="btEliminar" type="button" dojoType="dijit.form.Button" onclick='_esto_alta.limpiarTipologia(event)'>Eliminar</button>
            <button id="btn_Modificar" name="btn_Modificar" type="button" dojoType="dijit.form.Button"  onclick='_esto_alta.modificarTipologias(event)'>Modificar</button>
        </td>`
        //cell4.innerHTML = `<td><button id="btEliminar" name="btEliminar" type="button" dojoType="dijit.form.Button" onclick='_esto_alta.limpiarTipologia(event)'>Eliminar</button></td>`
        //cell5.innerHTML = `<td><button id="btn_Modificar" name="btn_Modificar" type="button" dojoType="dijit.form.Button"  onclick='_esto_alta.modificarTipologias(event)'>Modificar</button></td>`

        this.tipologias.splice(pos-2, 1, {"idClase":parseInt(claseValue),"idCategoria":parseInt(categoriaValue),"idSubcategoria":parseInt(subCategoriaValue)})
        console.log(this.tipologias)
    }

    },
    /** 
     * Select de autocompletado en el aparatado de  Localizaciones
     * */
    crearSelectElementosVulnerables: function () {
        this.selectFilterElementoVulnerable = new FilteringSelect({
            id: "selectElemento",
            name: "selectElementoVulnerable",
            store: new Memory({
                data: _esto_alta.elementosVulnerables
            }),
            value:"",
            queryExpr:"*${0}*",
            autoComplete: false,
            style: "width: 80%;",
            searchAttr: "name",
        }, "selectElemento");
    },
    /** 
    * Select de autocompletado para el campo tipo documento
    * */
    crearSelectTipoDocumentos: function (id, name, byId) {
        this.selectFilterTipoDocumento =  new FilteringSelect({
            id: id,
            name: name,
            required : false,
            store: new Memory({
                data: _esto_alta.tiposDocumentos
            }),
            autoComplete: true,
            style: "width: 150px;",
            searchAttr: "name",
            onChange: function(){
                _esto_alta.cargarDocumentosVulnerables(name,byId)
            }
         }, id);
    },   
    crearSelectDocumentos: function (id, name) {
        new FilteringSelect({
            id: id,
            name: name,
            store: new Memory({ data: _esto_alta.documentos}),
            queryExpr:"*${0}*",
            autoComplete: false,
            style: "width: 80%;",
            required: false,
            searchAttr: "name",
        }, id);
     },
    /** Carga todos los select con el valor seleccionado, después de pulsar botón editar del menú contextual*/
    preCargarSelects: function (name) {
        debugger
        var options = document.getElementsByName(name)[this.posicion-1].options
        for (let index = 0; index < options.length; index++) {
            const element = options[index];
            if (
                element.textContent === this.factor_texto && name === "inputClase"
                || 
                element.textContent === this.categoria_texto  && name === "inputCategoria"
                || 
                element.textContent === this.subcategoria_texto && name === "inputSubcategoria") {
                element.selected = true
                break;
            }
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
    /** Valida los datos obligatorias del elemento vulnerable antes de enviar a guardar en base de datos*/
    validarElementoVulnerable : function () {
        try {
            if (
                document.getElementById("inputNombreVia").value.length === 0 
                ||
                document.getElementById("inputUTMX").value.length === 0
                ||
                document.getElementById("inputUTMY").value.length === 0 
                ||
                document.getElementById("inputNombreRiesgo").value.length === 0
                ||
                this.tipologias.length === 0
                ||
                this.isExisteSelectTipologia()
                ) {
                    this.mostrarVentanaEmergenteMensajes("Alta elemento vulnerable","Los siguiente campos son obligatorios:<br/>Nombre Vía<br/>UTM X<br/>UTM Y<br/>Nombre riesgo<br/>Añadir una tipología o alguna tipología sin guardar")
                    return;
                }
                this.altaElementoVulnerable()
        } catch (e) {
            this.mostrarVentanaEmergenteMensajes("Error",e)
        }
    },
    validarLocalizacion : function () {
        if (
            document.getElementsByName("selectElementoVulnerable")[0].value === ""
            ||
            document.getElementById("inputNombLocalizacion").value === ""
            ||
            document.getElementById("inputLocalizacionUTMX").value.length === ""
            ||
            document.getElementById("inputLocalizacionUTMY").value.length === 0
            ||
            document.getElementsByName("selectTiposLocalizacion")[0].value === ""
            ) {
                this.mostrarVentanaEmergenteMensajes("Alta Localización","Los siguiente campos son obligatorios:<br/>Elemento vulnerable<br/>Nombre localizacion<br/>UTM X<br/>UTM Y<br/>Tipo localización")
                return;
            }
            this.altaLocalizacion()
    },
    validarModificacionElementoVulnerable: function () {
        console.log("método -> validarModificacionElementoVulnerable")

        if (
            document.getElementById("inputNombreVia").value.length === 0 
            ||
            document.getElementById("inputUTMX").value.length === 0
            ||
            document.getElementById("inputUTMY").value.length === 0 
            ||
            document.getElementById("inputNombreRiesgo").value.length === 0
            ||
            this.tipologias.length === 0
            || 
            this.isExisteSelectTipologia()
            ) {
                this.mostrarVentanaEmergenteMensajes("Editar elemento vulnerable","Los siguiente campos son obligatorios:<br/>Nombre Vía<br/>UTM X<br/>UTM Y<br/>Nombre riesgo<br/>Añadir una vulnerabilidad")
                return;
            }
            this.executeActionEditarElementoVulnerable()
    },
    limpiarFormularioElementoVulnerable: function (nombreTabla) {
        try {
            document.getElementById("inputNombreVia").value = ""
            document.getElementById("inputNumeroVia").value = ""
            document.getElementById("inputTipoVia").value = ""
            document.getElementById("inputUTMX").value = ""
            document.getElementById("inputUTMY").value = ""
            document.getElementById("inputAforo").value = ""
            document.getElementById("inputNombreRiesgo").value = ""
            document.getElementById("textarea_descripcion").value = ""
            document.getElementById("inputCalificador").value = ""
            document.getElementsByName("inputDistrito")[0].options[document.getElementsByName("inputDistrito")[0].selectedIndex = 0]
            document.getElementById("inputDocumento").value =  ""
            document.getElementById("inputFechaFin").value = ""
            document.getElementById("inputHoraFin").value = ""
            document.getElementById("inputFechaInicio").value = ""
            document.getElementById("inputHoraInicio").value = ""
            document.getElementById("inputTelefonoContacto").value = ""
            document.getElementById("inputNDPRelacionado").value = ""
        } catch (e) {
            console.error("Se ha producido un error, "+e)
        }
    },
    limpiarFormularioLocalizacion: function () {
        try {
            document.getElementById("inputNombLocalizacion").value = ""
            document.getElementById("inputDescripcionLocalizacion").value = ""
            //document.getElementById("inputLocalizacionUTMX").value = ""
            //document.getElementById("inputLocalizacionUTMY").value = ""
            if (document.getElementsByName("selectElementoVulnerable")[0]) {
                document.getElementsByName("selectElementoVulnerable")[0].value=""
            }
            document.getElementsByName("selectTipoDocumento_localizacion")[0].value=""
            document.getElementsByName("selectDocumentoLozalizacion")[0].value=""
            this.limpiarDocumentos("myTable_localizacion")
        } catch (e) {
            console.error("Se ha producido un error, "+e)
        }
    },
    limpiarListas: function () {
        try {
            this.limpiarVulnerabilidades()
            this.limpiarFactoresVulnerables()
            this.limpiarDocumentos(TABLA_DOCUMENTACION)
            this.factoresVulnerables_aux = []
            this.tipologias_aux = []
            this.documentosVulnerables_aux = []
        } catch (e) {
            console.error("Se ha producido un error, "+e)
        }
    },
    desabilitarSelectsVulnerables: function () {
        document.getElementsByName("inputClase")[0].options[0].selected = true
        document.getElementsByName("inputCategoria")[0].options[0].selected = true
        document.getElementsByName("inputCategoria")[0].disabled = true
        document.getElementsByName("inputSubcategoria")[0].options[0].selected = true
        document.getElementsByName("inputSubcategoria")[0].disabled = true
    },
    isExisteSelectTipologia : function () {
        console.log(document.getElementsByName("inputClase")[1])
        var array = document.getElementsByName("inputClase")
        for (let index = 1; index < array.length; index++) {
            const element = array[index];
            if (element.tagName === 'SELECT') {
                return true;
            }
        }
        return false;
    },
    /** 
     * Se rellena todos los datos del formulario elemento vulnerable, al hacer click derecho sobre un punto y pulsar modificar
     * */
    rellenarFormularioDatosAsociadosElementoVulnerable: function () {
        try {
            console.log(this.atributos)
            var fechaFin = new Date(this.atributos.FECHAFIN)
            var fechaInicio = new Date(this.atributos.FECHAINI)
            debugger
            document.getElementById("inputAforo").value = this.atributos.AFORO
            document.getElementById("textarea_descripcion").value = this.atributos.DESCRIPCION
            document.getElementById("inputCalificador").value = this.atributos.DIRCALIFICADOR
            document.getElementById("inputNombreVia").value = this.atributos.DIRNOMBRE
            document.getElementById("inputNumeroVia").value = this.atributos.DIRNUMERO
            document.getElementById("inputPoblacion").value = this.atributos.DIRPOBLACION
            document.getElementById("inputTipoVia").value = this.atributos.DIRTIPO

            var optionsDistrito =  document.getElementsByName("inputDistrito")[0].options
            for (let index = 0; index < optionsDistrito.length; index++) {
                if (parseInt(optionsDistrito[index].value) === this.atributos.DISTRITO) {
                    optionsDistrito[index].selected = true
                }
            }
            if (this.atributos.FECHAFIN) {
                document.getElementById("inputFechaFin").value = fechaFin.getUTCFullYear()+"-"+(fechaFin.getUTCMonth() >= 9? fechaFin.getUTCMonth()+1 : 
                                                                    "0"+(fechaFin.getUTCMonth()+1))+"-"+(fechaFin.getUTCDate() > 9? fechaFin.getUTCDate() : 
                                                                        "0" + fechaFin.getUTCDate())
                document.getElementById("inputHoraFin").value = (fechaFin.getUTCHours() > 9? fechaFin.getUTCHours() : 
                                                                    "0"+fechaFin.getUTCHours())+":"+(fechaFin.getUTCMinutes() > 9?fechaFin.getUTCMinutes() : 
                                                                        "0"+fechaFin.getUTCMinutes())
            }
            if (this.atributos.FECHAINI) {
                document.getElementById("inputFechaInicio").value = fechaInicio.getUTCFullYear()+"-"+(fechaInicio.getUTCMonth() >= 9? fechaInicio.getUTCMonth()+1 : 
                                                                        "0"+(fechaInicio.getUTCMonth()+1))+"-"+(fechaInicio.getUTCDate() > 9? fechaInicio.getUTCDate() : 
                                                                            "0" + fechaInicio.getUTCDate())
                document.getElementById("inputHoraInicio").value = (fechaInicio.getUTCHours() > 9? fechaInicio.getUTCHours() : 
                                                                    "0"+fechaInicio.getUTCHours())+":"+(fechaInicio.getUTCMinutes() > 9?fechaInicio.getUTCMinutes() : 
                                                                        "0"+fechaInicio.getUTCMinutes())
            }

            document.getElementById("inputNombreRiesgo").value = this.atributos.NOMBRE
            document.getElementById("inputTelefonoContacto").value = this.atributos.TELCONTACTO
            document.getElementById("inputUTMX").value = this.atributos.UTMX
            document.getElementById("inputUTMY").value = this.atributos.UTMY

            this.obtenerNDPRelacionado()
            var punto = new Point(this.atributos.UTMX, this.atributos.UTMY,new SpatialReference({ wkid:this.map.spatialReference.wkid}));
            this.map.centerAndZoom(punto,18);

            document.getElementById("widgetPanel_form").children[1].children[0].children[9].style.display = 'block'
            document.getElementById("widgetPanel_form").children[1].children[0].children[9].style.display = ''
            this.cambiarEdicionFalse()
            this.cargarLocalizacionesXIdElementoVulnerable()
            this.executeActionQueryFactoresVulnerables()
            this.executeActionTipologias()
            this.executeActionDocumentoVulnerabilidad()
            this.cambiarActionBoton("btAlta","btModificar", "Modificar");
        } catch (e) {
            console.error("Se ha producido un error, "+e)
            this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error, "+e)
        }
    },
    /** 
     * Este método obtiene el id_elementoVulnerablep maximo de la tabla  ELEMENTOVULNERABLEP
     * */
    obtenerMaxIdElementoVulnerableP: function () {

        try {
            var peticionSoap = this.crearRequest("<tabla>" + this.config.layerRiesgos.nameLayer.ELEMENTOVULNERABLEP + "</tabla>", "getNextVal")
            var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', this.urlObtenerServicio, true);

                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        if (xmlhttp.status == 200) {
                            var data = xmlParser.parse(xmlhttp.response);
                            var tagname = "getNextValReturn"
                            var maxId = dojo.query(tagname, data)[0].childNodes;
                            _esto_alta.idMaximoElementoVulnerable = maxId[0].nodeValue
                            _esto_alta.executeActionAltaElementoVulnerableP()
                        }
                    }
                }
                xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                xmlhttp.send(peticionSoap);
        } catch (e) {
            _esto_alta.mostrarVentanaEmergenteMensajes("Elemento Vulnerable","No se ha guardado el Elemento vulnerable")
        }
    },
    /** 
     * Este método obtiene el id_elementoVulnerablep maximo de la tabla VULNERABILIDAD
     * */
    obtenerMaxIdTipologia: function (action) {

        try {
            var peticionSoap = this.crearRequest(null, "getMaxIdTipologia")
            var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', this.urlObtenerServicio, true);

                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        try {
                            if (xmlhttp.status == 200) {
                                var data = xmlParser.parse(xmlhttp.response);
                                var tagname = "getMaxIdTipologiaReturn"
                                var maxId = dojo.query(tagname, data)[0].childNodes;
                                _esto_alta.idMaximoVulnerabilidad = maxId[0].nodeValue
                                _esto_alta.executeActionTipologia(action)
                            }

                            if (xmlhttp.status == 500 && action === ACTION_ANIADIR) {
                                _esto_alta.eliminarElementoVulnerablePXObjectId()
                                _esto_alta.eliminarFactoresVulnerablesXObjectId()
                                _esto_alta.mostrarVentanaEmergenteMensajes("Elemento Vulnerable","No se ha guardado el Elemento vulnerable")
                            }

                        } catch (e) {
                            debugger
                            _esto_alta.eliminarElementoVulnerablePXObjectId()
                            _esto_alta.eliminarFactoresVulnerablesXObjectId()
                            _esto_alta.mostrarVentanaEmergenteMensajes("Elemento Vulnerable","No se ha guardado el Elemento vulnerable")
                        }
                    }
                }
                xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                xmlhttp.send(peticionSoap);
        } catch (e) {
            _esto_alta.eliminarElementoVulnerablePXObjectId()
            _esto_alta.eliminarFactoresVulnerablesXObjectId()
            _esto_alta.mostrarVentanaEmergenteMensajes("Elemento Vulnerable","No se ha guardado el Elemento vulnerable")
        }
    },
    /** 
     * Este método obtiene el id maximo de la tabla DOCUMENTOSVULNERABILIDAD
     * */
     obtenerMaxIdDocumentoVulnerabilidad: function (action) {

        try {
            var peticionSoap = this.crearRequest(null, "getMaxIdDocumentoVulnerable")
            var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', this.urlObtenerServicio, true);
        
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        try {
                            if (xmlhttp.status == 200) {
                                var data = xmlParser.parse(xmlhttp.response);
                                var tagname = "getMaxIdDocumentoVulnerableReturn"
                                var maxId = dojo.query(tagname, data)[0].childNodes;
                                _esto_alta.idMaximoDocumentoVulnerabilidad = maxId[0].nodeValue
                                _esto_alta.executeActionAltaDocumentosVulnerablesP(action)
                            }

                            if (xmlhttp.status == 500 && action === ACTION_ANIADIR) {
                                _esto_alta.eliminarElementoVulnerablePXObjectId()
                                _esto_alta.eliminarFactoresVulnerablesXObjectId()
                                _esto_alta.eliminarTipologiasXObjectId()
                                _esto_alta.mostrarVentanaEmergenteMensajes("Elemento Vulnerable","No se ha guardado el Elemento vulnerable")
                            }
                        } catch (e) {
                            _esto_alta.eliminarElementoVulnerablePXObjectId()
                            _esto_alta.eliminarFactoresVulnerablesXObjectId()
                            _esto_alta.eliminarTipologiasXObjectId()
                            _esto_alta.mostrarVentanaEmergenteMensajes("Elemento Vulnerable","No se ha guardado el Elemento vulnerable")
                        }
                    }
                }
                xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                xmlhttp.send(peticionSoap);

        } catch (e) {
            _esto_alta.mostrarVentanaEmergenteMensajes("Elemento Vulnerable","No se ha guardado el Elemento vulnerable")
            _esto_alta.eliminarElementoVulnerablePXObjectId()
            _esto_alta.eliminarFactoresVulnerablesXObjectId()
            _esto_alta.eliminarTipologiasXObjectId()
        }
    },
    /** 
     * Este método obtiene el id_elementoVulnerablep maximo de la tabla  ELEMENTOVULNERABLEA
     * */
     obtenerMaxIdElementoVulnerableA: function () {

        var peticionSoap = _esto_alta.crearRequest("<tabla>" + _esto_alta.config.layerRiesgos.nameLayer.ELEMENTOVULNERABLEA + "</tabla>", "getNextVal")
        var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', _esto_alta.urlObtenerServicio, true);

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var data = xmlParser.parse(xmlhttp.response);
                        var tagname = "getNextValReturn"
                        var maxId = dojo.query(tagname, data)[0].childNodes;
                        _esto_alta.idMaximoElementoVulnerableA = maxId[0].nodeValue
                        _esto_alta.executeActionAltaArea()
                    }
                }
            }
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.send(peticionSoap);
    },
    altaElementoVulnerable : function () {
        this.obtenerMaxIdElementoVulnerableP()
    },
    altaLocalizacion : function () {
        this.obtenerMaxIdLozalizacion()
    },
    getClasesXId: function () {
        debugger
        try {
            if (this.clases.length > 0) {
                var xml = this.vulnerablididadToXML("idFactores",this.clases)
                var peticionSoap = this.crearRequest(xml, "getFactoresPorId")

                var xmlhttp = new XMLHttpRequest();
                    xmlhttp.open('POST', this.urlObtenerServicio, true);
            
                    xmlhttp.onreadystatechange = function () {
                        if (xmlhttp.readyState == 4) {
                            if (xmlhttp.status == 200) {
                                var data = xmlParser.parse(xmlhttp.response);
                                var tagname = "getFactoresPorIdResponse"
                                var factores = dojo.query(tagname, data)[0].childNodes;
                                _esto_alta.descripciones.factores=[]    
                                for (let index = 0; index < factores.length; index++) {
                                    var  descripcion = _esto_alta.parsearDescripcion(factores[index])
                                    _esto_alta.descripciones.factores.push(descripcion)
                                }
                                _esto_alta.getCategoriasXId()
                            }
                        }
                    }
                    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                    xmlhttp.send(peticionSoap);
            }
        } catch(e) {
            console.error(e)
        }
    },
    getCategoriasXId: function () {
        debugger
        try {
            var xml = this.vulnerablididadToXML("idCategorias",this.categorias)
            var peticionSoap = this.crearRequest(xml, "getCategoriasPorId")

            var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', this.urlObtenerServicio, true);
        
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        if (xmlhttp.status == 200) {
                            var data = xmlParser.parse(xmlhttp.response);
                            var tagname = "getCategoriasPorIdResponse"
                            var categorias = dojo.query(tagname, data)[0].childNodes;
                            _esto_alta.descripciones.categorias=[]
                            for (let index = 0; index < categorias.length; index++) {
                                var  descripcion = _esto_alta.parsearDescripcion(categorias[index])
                                _esto_alta.descripciones.categorias.push(descripcion)
                            }
                            _esto_alta.getsubcategoriasXId()
                        }
                    }
                }
                xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                xmlhttp.send(peticionSoap);
        } catch (e) {
            console.error(e)
        }
    },
    getsubcategoriasXId: function () {
        debugger
        var xml = this.vulnerablididadToXML("idSubcategorias",this.subCategorias)
        var peticionSoap = this.crearRequest(xml, "getSubcategoriasPorId")

        var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', this.urlObtenerServicio, true);
    
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var data = xmlParser.parse(xmlhttp.response);
                        var tagname = "getSubcategoriasPorIdResponse"
                        var subcategorias = dojo.query(tagname, data)[0].childNodes;
                       _esto_alta.descripciones.subcategorias=[]
                        for (let index = 0; index < subcategorias.length; index++) {
                            var  descripcion = _esto_alta.parsearDescripcion(subcategorias[index])
                            _esto_alta.descripciones.subcategorias.push(descripcion)
                        }
                        _esto_alta.cargarTipologiasAlmodificar()
                    }
                }
            }
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.send(peticionSoap);
    },
    /** Método que se usa para guardar un elemento vulnerable */
    executeActionAltaElementoVulnerableP: function () {
        debugger
        try {
            if (this.idMaximoElementoVulnerable && parseInt(this.idMaximoElementoVulnerable) > -1) {

                var attributes = {};
                attributes["ID_ELEMENTOVULNERABLEP"] = this.idMaximoElementoVulnerable
                attributes["ID_PLANDIRECTOR"] = null
                attributes["NOMBRE"] = document.getElementById("inputNombreRiesgo").value != ""? document.getElementById("inputNombreRiesgo").value : null
                attributes["DESCRIPCION"] = document.getElementById("textarea_descripcion").value !== "" ? document.getElementById("textarea_descripcion").value : null
                attributes["DIRTIPO"] = document.getElementById("inputTipoVia").value !== "" ? document.getElementById("inputTipoVia").value : null
                attributes["DIRNOMBRE"] = document.getElementById("inputNombreVia").value !== "" ? document.getElementById("inputNombreVia").value : null
                attributes["DIRNUMERO"] = document.getElementById("inputNumeroVia").value != "" ? document.getElementById("inputNumeroVia").value : null
                attributes["DIRCALIFICADOR"] = document.getElementById("inputCalificador").value !== "" ? document.getElementById("inputCalificador").value : null
                attributes["DIRPOBLACION"] = document.getElementById("inputPoblacion").value !== "" ?  document.getElementById("inputPoblacion").value : null
                attributes["DISTRITO"] = document.getElementsByName("inputDistrito")[0].options[document.getElementsByName("inputDistrito")[0].selectedIndex].value != ""? parseInt(document.getElementsByName("inputDistrito")[0].options[document.getElementsByName("inputDistrito")[0].selectedIndex].value) : 0

                let fechaInicio =  document.getElementById("inputFechaInicio").value !== "" ? document.getElementById("inputFechaInicio").value : null
                let horaIncio =  document.getElementById("inputHoraInicio").value !== ""? document.getElementById("inputHoraInicio").value : null

                let fechaFin = document.getElementById("inputFechaFin").value != ""? document.getElementById("inputFechaFin").value : null
                let horaFin = document.getElementById("inputHoraFin").value != "" ? document.getElementById("inputHoraFin").value : null

                fechaInicio = this.convertirFechaYHoraAMilisegundos(fechaInicio,horaIncio)
                fechaFin = this.convertirFechaYHoraAMilisegundos(fechaFin,horaFin)

                attributes["FECHAINI"] = fechaInicio
                attributes["FECHAFIN"] = fechaFin
                attributes["UTMX"] = document.getElementById("inputUTMX").value !== ""? parseFloat(document.getElementById("inputUTMX").value) : null
                attributes["UTMY"] = document.getElementById("inputUTMY").value !== ""? parseFloat(document.getElementById("inputUTMY").value) : null
                attributes["AFORO"] =  document.getElementById("inputAforo").value !== ""? parseInt(document.getElementById("inputAforo").value) : null
                attributes["TELCONTACTO"] = document.getElementById("inputTelefonoContacto").value !== ""? document.getElementById("inputTelefonoContacto").value : null
                attributes["BORRADO"] = 0

                this.idMaximoElementoVulnerable = attributes["ID_ELEMENTOVULNERABLEP"]

                var addFeature = new Graphic({
                    attributes: attributes,
                    geometry: new Point(attributes["UTMX"], attributes["UTMY"], 25830)
                });

                var layerElementoVulnerable = new FeatureLayer(this.config.layerRiesgos.seviceUrlElementoVulnerableP);
                layerElementoVulnerable.applyEdits([addFeature], null, null, lang.hitch(this, this.infoSuccessAddFeatureLayerElementoVulnerableP), lang.hitch(this, this.callbackErrorGenerico));

            } else {
                this.mostrarVentanaEmergenteMensajes("Error", "No se ha ejecutado correctamente el servicio")
            }
        } catch (e) {
            console.error("Se ha producido un error, "+e)
            this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error, "+e)
        }
    },
    executeActionTipologia : function (action) {
        debugger
        try {
            var layerVulnerabilidad = new FeatureLayer(this.config.layerRiesgos.seviceUrlVulnerabilidad);

            if (_esto_alta.idMaximoVulnerabilidad && parseInt(_esto_alta.idMaximoVulnerabilidad) > -1) {
                if (_esto_alta.tipologias.length > 0 ) {
                    var tipologias = _esto_alta.getListaTipologias(parseInt(_esto_alta.idMaximoElementoVulnerable))
                    var listaTipologias = new Array(tipologias.length)
                    for (let index = 0; index < tipologias.length; index++) {
                        var addFeatureVulnerabilidad = new Graphic({
                            attributes: tipologias[index]
                        });
                        listaTipologias[index] = addFeatureVulnerabilidad
                    }
                    if (action && action === ACTION_ANIADIR) {
                        layerVulnerabilidad.applyEdits(
                            listaTipologias, 
                            null, 
                            null, 
                            lang.hitch(this, this.infoSuccessAddFeatureLayerTipologias), 
                            () => {
                                this.eliminarElementoVulnerablePXObjectId()
                                this.eliminarFactoresVulnerablesXObjectId()
                            }
                        );
                    } else  if (action && action === ACTION_EDITAR) {
                        layerVulnerabilidad.applyEdits(
                            listaTipologias, 
                            null, 
                            null,
                            lang.hitch(this, this.infoSuccessEditarFeatureLayerTipologias), 
                            lang.hitch(this, this.callbackErrorGenerico)
                        );
                    }
                }
            } else {
                _esto_alta.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error")
                if (action && action === ACTION_ANIADIR) {
                    this.eliminarElementoVulnerablePXObjectId()
                    this.eliminarFactoresVulnerablesXObjectId()
                }
            }
        } catch (e) {
            console.error(e)
            _esto_alta.eliminarElementoVulnerablePXObjectId()
            _esto_alta.eliminarFactoresVulnerablesXObjectId()
            _esto_alta.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error")
        }
    },
    executeActionAltaDocumentosVulnerablesP: function (action) {
        var hash = {}
        var layerDocumentacion = new FeatureLayer(this.config.layerRiesgos.seviceUrlDocumentosVulnerable);

        if (_esto_alta.idMaximoDocumentoVulnerabilidad && parseInt(_esto_alta.idMaximoDocumentoVulnerabilidad) > -1) {
            // atributos documentos vulnerables
            _esto_alta.documentosVulnerables = _esto_alta.documentosVulnerables.filter(d=> hash[d.id]? false : hash[d.id] = true)
            var listaDocumentosVulnerables = new Array(_esto_alta.documentosVulnerables.length)
            for (let index = 0; index < _esto_alta.documentosVulnerables.length; index++) {
                var attributes_doc = {};
                attributes_doc["ID_DocVul"] = (parseInt(_esto_alta.idMaximoDocumentoVulnerabilidad)+(index+1))
                attributes_doc["ID_Documento"] = parseInt(_esto_alta.documentosVulnerables[index].id)
                attributes_doc["ID_ElementoVulnerableP"] = parseInt(_esto_alta.idMaximoElementoVulnerable)

                var addFeatureDocumentos = new Graphic({
                    attributes: attributes_doc
                });
                listaDocumentosVulnerables[index] = addFeatureDocumentos
            }
            if (action && action === ACTION_ANIADIR) {
                layerDocumentacion.applyEdits(
                    listaDocumentosVulnerables, 
                    null, 
                    null, 
                    lang.hitch(this, this.infoSuccessAddDocumentosVulnerables), 
                    lang.hitch(this, this.callbackErrorGenerico)
                );//callbackErrorGenerico --> mirar
            } else if (action && action === ACTION_EDITAR) {
                layerDocumentacion.applyEdits(
                    listaDocumentosVulnerables, 
                    null, 
                    null, 
                    lang.hitch(this, this.infoSuccessEditarDocumentosVulnerables), 
                    lang.hitch(this, this.callbackErrorGenerico)
                );//callbackErrorGenerico --> mirar
            }
        } else {
            if (action && action === ACTION_ANIADIR) {
                _esto_alta.mostrarVentanaEmergenteMensajes("Error", "No se ha ejecutado correctamente la llamada a la tabla elemento vulnerable")
                _esto_alta.eliminarElementoVulnerablePXObjectId()
                _esto_alta.eliminarFactoresVulnerablesXObjectId()
                _esto_alta.eliminarTipologiasXObjectId()
            }
        }
    },
    infoSuccessAddFeatureLayerElementoVulnerableP: function (result) {
        debugger
        if (result) {
            if (result[0]["success"] === true) {
                if (_esto_alta.factoresVulnerables.length === 0 && _esto_alta.tipologias.length === 0 && _esto_alta.documentosVulnerables.length === 0) {
                    _esto_alta.mostrarVentanaEmergenteMensajes("Alta elemento vulnerable", "Se ha guardado correctamente el Elemento Vulnerable")
                    _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
                    _esto_alta.limpiarFormularioElementoVulnerable()
                    _esto_alta.limpiarListas()
                } else {
                    _esto_alta.objectIdElementoVulnetableP = result[0]["objectId"]
                    _esto_alta.obtenerMaxIdFactorVulnerabilidad(ACTION_ANIADIR)
                }
            } else {
                _esto_alta.mostrarVentanaEmergenteMensajes("Error", result[0]["error"]["message"])
            }
        } else {
            _esto_alta.mostrarVentanaEmergenteMensajes("Elemento Vulnerable", "No se ha guardado el Elemento Vulnerable")
        }
    },
    infoSuccessAddFeatureLayerFactorVulnerabilidad: function (result) {
        debugger
        if (result) {
            for (let index = 0; index < result.length; index++) {
                if (result[index]["success"] === true) {
                    _esto_alta.objectIdFactoresVulnerables.push(result[index]["objectId"])
                    if (index === result.length-1) {
                        _esto_alta.obtenerMaxIdTipologia(ACTION_ANIADIR)
                    }
                }  else {
                    _esto_alta.eliminarElementoVulnerablePXObjectId()
                    _esto_alta.eliminarFactoresVulnerablesXObjectId()
                    _esto_alta.mostrarVentanaEmergenteMensajes("Error",result[index]["error"]["message"])
                    break;
                }
            }
        } else {
            if (_esto_alta.factoresVulnerables.length === 0) {
                _esto_alta.obtenerMaxIdTipologia(ACTION_ANIADIR)
            } else {
                _esto_alta.mostrarVentanaEmergenteMensajes("Elemento Vulnerable","No se ha guardado guardar el Elemento vulnerable")
                _esto_alta.eliminarElementoVulnerablePXObjectId()
            }
        }
    },
    infoSuccessAddFeatureLayerTipologias: function (result) {
        debugger
        if (result) {
            for (let index = 0; index < result.length; index++) {
                if (result[index]["success"] === true) {
                    _esto_alta.objectIdTipologias.push(result[index]["objectId"])
                    if (index === result.length-1) {
                        _esto_alta.obtenerMaxIdDocumentoVulnerabilidad(ACTION_ANIADIR)
                    }
                } else {
                    _esto_alta.eliminarElementoVulnerablePXObjectId()
                    _esto_alta.eliminarFactoresVulnerablesXObjectId()
                    _esto_alta.eliminarTipologiasXObjectId()
                    _esto_alta.mostrarVentanaEmergenteMensajes("Error",result[index]["error"]["message"])
                    break;
                } 
            }
        } else {
            if (_esto_alta.tipologias.length === 0) {
                _esto_alta.obtenerMaxIdDocumentoVulnerabilidad(ACTION_ANIADIR)
            } else {
                _esto_alta.mostrarVentanaEmergenteMensajes("Elemento Vulnerable","No se ha guardado el Elemento vulnerable")
                _esto_alta.eliminarElementoVulnerablePXObjectId()
                _esto_alta.eliminarFactoresVulnerablesXObjectId()
            }
        }
    },
    infoSuccessAddDocumentosVulnerables: function (result) {
        if (_esto_alta.documentosVulnerables.length === 0) {
            _esto_alta.mostrarVentanaEmergenteMensajes("Alta elemento vulnerable", "Se ha guardado correctamente el Elemento Vulnerable")
            _esto_alta.limpiarFormularioElementoVulnerable()
            _esto_alta.limpiarListas()
            _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
        } else {
            if (result) {
                for (let index = 0; index < result.length; index++) {
                    if (result[index]["success"] === true) {
                        _esto_alta.objectIdDocumentosElementoVulnerable.push(result[index]["objectId"])
                        if (index === result.length-1) {
                            _esto_alta.mostrarVentanaEmergenteMensajes("Alta elemento vulnerable", "Se ha guardado correctamente el Elemento Vulnerable")
                            _esto_alta.limpiarFormularioElementoVulnerable()
                            _esto_alta.limpiarListas()
                            _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
                        }
                    } else {
                        _esto_alta.eliminarElementoVulnerablePXObjectId()
                        _esto_alta.eliminarFactoresVulnerablesXObjectId()
                        _esto_alta.eliminarTipologiasXObjectId()
                        _esto_alta.eliminarDocumentosVulnerableXObjectId()
                        _esto_alta.mostrarVentanaEmergenteMensajes("Error",result[index]["error"]["message"])
                        break;
                    } 
                }
            } else {
                if (_esto_alta.documentosVulnerables.length === 0) {
                    _esto_alta.mostrarVentanaEmergenteMensajes("Alta elemento vulnerable", "Se ha guardado correctamente el Elemento Vulnerable")
                    _esto_alta.limpiarFormularioElementoVulnerable()
                    _esto_alta.limpiarListas()
                    _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
                } else {
                    _esto_alta.eliminarElementoVulnerablePXObjectId()
                    _esto_alta.eliminarFactoresVulnerablesXObjectId()
                    _esto_alta.eliminarTipologiasXObjectId()
                    this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error")
                }
            }
        }
    },
    infoSuccessEditarFeatureLayerFactorVulnerable: function (result) {
        debugger
        _esto_alta.objectIdFactoresVulnerables = _esto_alta.factoresVulnerables_aux.map(o=> o["objectId"]).filter(id => id!=undefined)
        if (result) {
            for (let index = 0; index < result.length; index++) {
                if (result[index]["success"] === true) {
                    if (index === result.length-1) {
                        _esto_alta.informacionAsociadaEditarFactorVulnerabilidad(ACTION_EDITAR)
                    }
                } else {
                    _esto_planDirector.mostrarVentanaEmergenteMensajes("Error",result[index]["error"]["message"])
                    break;
                } 
            }
        } else {
            _esto_alta.informacionAsociadaEditarFactorVulnerabilidad(ACTION_EDITAR,TABLA_DOCUMENTACION)
        }
    },
    informacionAsociadaEditarFactorVulnerabilidad: function (action) {
        debugger
        if (_esto_alta.tipologias_aux.length > 0 && _esto_alta.editarTipologia) {
            _esto_alta.objectIdTipologias = _esto_alta.tipologias_aux.map(o=> o["objectId"]).filter(id => id!=undefined)
            console.log(_esto_alta.tipologias)
            _esto_alta.eliminarTipologiasXObjectId(action)
        } else if (_esto_alta.tipologias.length > 0 && _esto_alta.editarTipologia) {
            _esto_alta.obtenerMaxIdTipologia(action)
        } else if (_esto_alta.documentosVulnerables_aux.length > 0 && _esto_alta.editarDocumento) {
            _esto_alta.objectIdDocumentosElementoVulnerable = _esto_alta.documentosVulnerables_aux.map(o=> o["objectId"]).filter(id => id!=undefined)
            console.log(_esto_alta.documentosVulnerables)
            _esto_alta.eliminarDocumentosVulnerableXObjectId(action)
        } else if (_esto_alta.documentosVulnerables.length > 0 && _esto_alta.editarDocumento) {
            _esto_alta.obtenerMaxIdDocumentoVulnerabilidad(action)
        } else {
            _esto_alta.mostrarVentanaEmergenteMensajes("Alta elemento vulnerable", "Se ha guardado correctamente el Elemento Vulnerable")
            _esto_alta.limpiarFormularioElementoVulnerable()
            _esto_alta.limpiarListas()
            _esto_alta.cambiarActionBoton("btModificar","btAlta","Alta");
            _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
        }
    },
    infoSuccessEditarFeatureLayerTipologias: function (result) {
        debugger
        if (result) {
            for (let index = 0; index < result.length; index++) {
                if (result[index]["success"] === true) {
                    if (index === result.length-1) {
                        _esto_alta.informacionAsociadaEditarTipologias(ACTION_EDITAR)
                    }
                } else {
                    _esto_planDirector.mostrarVentanaEmergenteMensajes("Error",result[index]["error"]["message"])
                    break;
                } 
            }
        } else {
            _esto_alta.informacionAsociadaEditarTipologias(ACTION_EDITAR)
        }
    },
    informacionAsociadaEditarTipologias: function (action) {
        debugger
        if (_esto_alta.documentosVulnerables_aux.length > 0 && _esto_alta.editarDocumento) {
            _esto_alta.objectIdDocumentosElementoVulnerable = _esto_alta.documentosVulnerables_aux.map(o=> o["objectId"]).filter(id => id!=undefined)
            console.log(_esto_alta.documentosVulnerables)
            _esto_alta.eliminarDocumentosVulnerableXObjectId(action)
        } else if (_esto_alta.documentosVulnerables.length > 0 && _esto_alta.editarDocumento) {
            _esto_alta.obtenerMaxIdDocumentoVulnerabilidad(action)
        } else {
            _esto_alta.mostrarVentanaEmergenteMensajes("Alta elemento vulnerable", "Se ha insertado correctamente el Elemento Vulnerable")
            _esto_alta.limpiarFormularioElementoVulnerable()
            _esto_alta.limpiarListas()
            _esto_alta.cambiarActionBoton("btModificar","btAlta","Alta");
            _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
        }
    },
    infoSuccessEditarDocumentosVulnerables: function (result) {
        if (_esto_alta.documentosVulnerables.length === 0) {
            _esto_alta.mostrarVentanaEmergenteMensajes("Modificación elemento vulnerable", "Se ha modificado correctamente el Elemento Vulnerable")
            _esto_alta.limpiarFormularioElementoVulnerable()
            _esto_alta.limpiarListas()
            _esto_alta.cambiarActionBoton("btModificar","btAlta","Alta");
            _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
        } else {
            if (result) {
                for (let index = 0; index < result.length; index++) {
                    if (result[index]["success"] === true) {
                        if (index === result.length-1) {
                            _esto_alta.mostrarVentanaEmergenteMensajes("Modificación elemento vulnerable", "Se ha modificado correctamente el Elemento Vulnerable")
                            _esto_alta.limpiarFormularioElementoVulnerable()
                            _esto_alta.limpiarListas()
                            _esto_alta.cambiarActionBoton("btModificar","btAlta","Alta");
                            _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
                        }
                    } else {
                        _esto_planDirector.mostrarVentanaEmergenteMensajes("Error",result[index]["error"]["message"])
                        break;
                    } 
                }
            } else {
                if (_esto_alta.documentosVulnerables_aux.length === 0) {
                    _esto_alta.mostrarVentanaEmergenteMensajes("Modificación elemento vulnerable", "Se ha modificado correctamente el Elemento Vulnerable")
                    _esto_alta.limpiarFormularioElementoVulnerable()
                    _esto_alta.limpiarListas()
                    _esto_alta.cambiarActionBoton("btModificar","btAlta","Alta");
                    _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
                }
                //this.mostrarVentanaEmergenteMensajes("Error", "No se ha ejecutado correctamente la llamada a la tabla elemento vulnerable")
            }
        }
    },
    /**
     * Método que sirve para editar una vulnerabilidad
     */
     executeActionEditarElementoVulnerable: function () {
        try {
            debugger
            var featureLayer = new FeatureLayer(this.config.layerRiesgos.seviceUrlElementoVulnerableP);
            featureLayer.queryFeatures({
                objectIds: [_esto_alta.atributos.OBJECTID],
                outFields: ["*"],
                returnGeometry: true
              })
                .then(function(results) {
                    if (results.features.length > 0) {
                        for (let index = 0; index < results.features.length; index++) {
                            if (results.features[index].attributes.ID_ELEMENTOVULNERABLEP === _esto_alta.atributos.ID_ELEMENTOVULNERABLEP) {
                                let editFeature = results.features[index]
                                _esto_alta.idMaximoElementoVulnerable = _esto_alta.atributos.ID_ELEMENTOVULNERABLEP
                                editFeature.attributes.AFORO = document.getElementById("inputAforo").value !== ""? parseInt(document.getElementById("inputAforo").value) : null
                                editFeature.attributes.DESCRIPCION = document.getElementById("textarea_descripcion").value !== "" ? document.getElementById("textarea_descripcion").value : null
                                editFeature.attributes.DIRCALIFICADOR = document.getElementById("inputCalificador").value !== "" ? document.getElementById("inputCalificador").value : null
                                editFeature.attributes.DIRNOMBRE = document.getElementById("inputNombreVia").value !== "" ? document.getElementById("inputNombreVia").value : null
                                editFeature.attributes.DIRNUMERO = document.getElementById("inputNumeroVia").value != "" ? document.getElementById("inputNumeroVia").value : null
                                editFeature.attributes.DIRPOBLACION = document.getElementById("inputPoblacion").value !== "" ?  document.getElementById("inputPoblacion").value : null
                                editFeature.attributes.DIRTIPO = document.getElementById("inputTipoVia").value !== "" ? document.getElementById("inputTipoVia").value : null
                                editFeature.attributes.DISTRITO =  document.getElementsByName("inputDistrito")[0].options[document.getElementsByName("inputDistrito")[0].selectedIndex].value != ""? 
                                                                parseInt(document.getElementsByName("inputDistrito")[0].options[document.getElementsByName("inputDistrito")[0].selectedIndex].value) : 0
                                //extra
                                let fechaInicio =  document.getElementById("inputFechaInicio").value !== "" ? document.getElementById("inputFechaInicio").value : null
                                let horaIncio =  document.getElementById("inputHoraInicio").value !== ""? document.getElementById("inputHoraInicio").value : null

                                let fechaFin = document.getElementById("inputFechaFin").value !== ""? document.getElementById("inputFechaFin").value : null
                                let horaFin = document.getElementById("inputHoraFin").value !== "" ? document.getElementById("inputHoraFin").value : null

                                fechaInicio = _esto_alta.convertirFechaYHoraAMilisegundos(fechaInicio,horaIncio)
                                fechaFin = _esto_alta.convertirFechaYHoraAMilisegundos(fechaFin,horaFin)

                                editFeature.attributes.FECHAFIN = fechaFin
                                editFeature.attributes.FECHAINI = fechaInicio
                                editFeature.attributes.NOMBRE = document.getElementById("inputNombreRiesgo").value !== ""? document.getElementById("inputNombreRiesgo").value : null
                                editFeature.attributes.TELCONTACTO = document.getElementById("inputTelefonoContacto").value !== ""? document.getElementById("inputTelefonoContacto").value : null
                                editFeature.attributes.UTMX = document.getElementById("inputUTMX").value !== ""? parseFloat(document.getElementById("inputUTMX").value.trim()) : null
                                editFeature.attributes.UTMY = document.getElementById("inputUTMY").value !== ""? parseFloat(document.getElementById("inputUTMY").value.trim()) : null

                                editFeature.geometry.x = editFeature.attributes.UTMX
                                editFeature.geometry.y = editFeature.attributes.UTMY

                                featureLayer.applyEdits(null,[editFeature],null)
                            }
                            _esto_alta.editarInformacionAsociadaAlElementoVulnerableP()
                        }
                    }  else {
                        _esto_alta.mostrarVentanaEmergenteMensajes("Modificación Elemento Vulnerable","No existe el elemento vulnerable")
                        console.error("Se ha producido un error, " + e)
                    }
            }, function (error) {
                _esto_alta.mostrarVentanaEmergenteMensajes('ERROR', 'Update Error:<br />'+error.message)
            })
        } catch (e) {
            console.error(e)
            this.mostrarVentanaEmergenteMensajes("Error", e)
        }
    },
    editarInformacionAsociadaAlElementoVulnerableP: function () {

        try {

            if (_esto_alta.tipologias.length === 0 && _esto_alta.documentosVulnerables.length === 0) {
                _esto_alta.limpiarFormularioElementoVulnerable()
                _esto_alta.limpiarListas()
                _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
                _esto_alta.cambiarActionBoton("btModificar","btAlta","Alta");
                _esto_alta.mostrarVentanaEmergenteMensajes("Alta elemento vulnerable", "Se ha insertado correctamente el Elemento Vulnerable")
            } else {
                if (_esto_alta.factoresVulnerables_aux.length > 0 && _esto_alta.editarTipoFactor) {
                    _esto_alta.objectIdFactoresVulnerables = _esto_alta.factoresVulnerables_aux.map(o=> o["objectId"]).filter(id => id!=undefined)
                    _esto_alta.eliminarFactoresVulnerablesXObjectId(ACTION_EDITAR)
                } else  if (_esto_alta.factoresVulnerables.length > 0 && _esto_alta.editarTipoFactor) { 
                    _esto_alta.obtenerMaxIdFactorVulnerabilidad(ACTION_EDITAR)
                } else if (_esto_alta.tipologias_aux.length > 0 && _esto_alta.editarTipologia) {
                    _esto_alta.objectIdTipologias = _esto_alta.tipologias_aux.map(o=> o["objectId"]).filter(id => id!=undefined)
                    _esto_alta.eliminarTipologiasXObjectId(ACTION_EDITAR)
                } else if (_esto_alta.tipologias.length > 0 && _esto_alta.editarTipologia) {
                    _esto_alta.obtenerMaxIdTipologia(ACTION_EDITAR)
                } else if (_esto_alta.documentosVulnerables_aux.length > 0 && _esto_alta.editarDocumento) {
                    _esto_alta.objectIdDocumentosElementoVulnerable = _esto_alta.documentosVulnerables_aux.map(o=> o["objectId"]).filter(id => id!=undefined)
                    _esto_alta.eliminarDocumentosVulnerableXObjectId(ACTION_EDITAR)
                } else if (_esto_alta.documentosVulnerables.length > 0 && _esto_alta.editarDocumento) {
                    _esto_alta.obtenerMaxIdDocumentoVulnerabilidad(ACTION_EDITAR)
                } else if (!_esto_alta.editarTipologia && !_esto_alta.editarTipoFactor && !_esto_alta.editarDocumento) {
                    _esto_alta.mostrarVentanaEmergenteMensajes("Modificación elemento vulnerable", "Se ha modificado correctamente el Elemento Vulnerable")
                    _esto_alta.limpiarFormularioElementoVulnerable()
                    _esto_alta.limpiarListas()
                    _esto_alta.cambiarActionBoton("btModificar","btAlta","Alta");
                    _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
                }
            }
        } catch (e) {
            console.error(e)
            this.mostrarVentanaEmergenteMensajes("Error", e)
        }
    },
    /** Método que se usa para obtener todas las vulnerabilidades que correspondan con el ID_ELEMENTOVULNERABLE*/
    executeActionTipologias: function () {
        debugger
        console.log(this.atributos.ID_ELEMENTOVULNERABLEP)
        var myQuery = new query()
        myQuery.where = "ID_ELEMENTOVULNERABLEP="+this.atributos.ID_ELEMENTOVULNERABLEP
        myQuery.returnGeometry = false
        myQuery.outFields = ["*"]
        //Realizamos la busqueda
        var myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlVulnerabilidad)
        myQueryTask.execute(myQuery, lang.hitch(this, this.getVulnerabilidadesXId), lang.hitch(this, this.callbackErrorGenerico))
    },
    /** 
     * Método que se usa para obtener todas los documentos vulnerables
     * */
    executeActionDocumentoVulnerabilidad: function () {
        var myQuery = new query()
        myQuery.where = "ID_ELEMENTOVULNERABLEP="+this.atributos.ID_ELEMENTOVULNERABLEP
        myQuery.returnGeometry = false
        myQuery.outFields = ["*"]
        //Realizamos la busqueda
        var myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlDocumentosVulnerable)
        myQueryTask.execute(myQuery, lang.hitch(this, this.getDocumentosVulnerablesXId), lang.hitch(this, this.callbackErrorGenerico))
    },
    /**
    *********************************************************************************                                                ***************************************************************************************
    * *******************************************************************************          Métodos Localización                  ***************************************************************************************
    * *******************************************************************************                                                ***************************************************************************************
    */
    executeActionAltaLocalizacion: function () {
        debugger
        try {
            if (this.idMaximoLocalizacion && parseInt(this.idMaximoLocalizacion) > -1) {
                var attributes = {};
                attributes["ID_Localizacion"] = this.idMaximoLocalizacion
                attributes["ID_ElementoVulnerableP"] =  document.getElementsByName("selectElementoVulnerable")[0].value
                attributes["Nombre"] = document.getElementById("inputNombLocalizacion").value
                attributes["Descripcion"] = document.getElementById("inputDescripcionLocalizacion").value
                attributes["FechaBaja"] = null
                attributes["UTMX"] = document.getElementById("inputLocalizacionUTMX").value
                attributes["UTMY"] = document.getElementById("inputLocalizacionUTMY").value

                var addFeature = new Graphic({
                    attributes: attributes,
                    geometry: new Point(attributes["UTMX"], attributes["UTMY"], 25830)
                });

                this.idMaximoLocalizacion = attributes["ID_Localizacion"]

                var feature = new FeatureLayer(this.config.layerRiesgos.seviceUrlLocalizaciones);
                feature.applyEdits([addFeature], null, null, lang.hitch(this, this.infoSuccessAddFeatureLayerLocalizacion), lang.hitch(this, this.callbackErrorGenerico));
            } else {
                this.mostrarVentanaEmergenteMensajes("Localización","Se ha producido un error")
            }
        } catch (e) {
            this.mostrarVentanaEmergenteMensajes("Alta Localización","Se ha producido un error, " + e)
            console.error("Se ha producido un error, " + e)
        }
    },
    /**
    * Informa al usuario que la operacion de añadir la localización en la feature a la capa se ha realizado correctamente
    */
     infoSuccessAddFeatureLayerLocalizacion : function (result) {
        debugger
        try {
            if (result && result[0]["success"] === true) {
                _esto_alta.objectIdLocalizacion.push(result[0]["objectId"])
                if (document.getElementsByName("selectTiposLocalizacion")[0] && document.getElementsByName("selectTiposLocalizacion")[0].value) {
                    _esto_alta.obtenerMaxIdTipado()
                } else {
                    _esto_alta.this.mostrarVentanaEmergenteMensajes("Alta Localización","Los siguiente campos son obligatorios:<br/>Elemento vulnerable<br/>Nombre localizacion<br/>UTM X<br/>UTM Y")
                }
            } else {
                _esto_alta.mostrarVentanaEmergenteMensajes("Localización","No se ha guardado Localización")
            }
        } catch (e) {
            _esto_alta.mostrarVentanaEmergenteMensajes("Alta Localización","Se ha producido un error, " + e)
            console.error(e)
        }
    },
    executeActionAltaTipado: function () {
        if (this.idMaximoTipado && parseInt(this.idMaximoTipado) > -1) {
            var attributes = {};
            attributes["ID_LOCALIZACIONTIPO"] = _esto_alta.idMaximoTipado
            attributes["ID_TIPO"] = parseInt(document.getElementsByName("selectTiposLocalizacion")[0].value)
            attributes["ID_LOCALIZACION"] = parseInt(_esto_alta.idMaximoLocalizacion)

            var addFeature = new Graphic({
                attributes: attributes,
            });

            var feature = new FeatureLayer(this.config.layerRiesgos.seviceUrlTipado);
            feature.applyEdits([addFeature], null, null, lang.hitch(this, this.infoSuccessAddFeatureLayerTipado), lang.hitch(this, this.callbackErrorGenerico));
        } else {
            _esto_alta.mostrarVentanaEmergenteMensajes("Localización", "No se ha guardado Localización")
            _esto_alta.eliminarLocalizacion()
        }
    },
    infoSuccessAddFeatureLayerTipado : function (result) {
        debugger
        try {
            if (result && result[0]["success"] === true) {
                _esto_alta.objectIdTipado.push(result[0]["objectId"])
                if (_esto_alta.documentosVulnerables.length > 0) {
                    _esto_alta.obtenerMaxIdDocumentoLozalizacion()
                } else {
                    _esto_alta.mostrarVentanaEmergenteMensajes("Localización","Se ha guardado Localización")
                    _esto_alta.limpiarFormularioLocalizacion()
                    _esto_alta.map.getLayer(_esto_alta.idLayerLocalizacion).refresh();
                }
            } else {
                _esto_alta.mostrarVentanaEmergenteMensajes("Localización","No se ha guardado Localización")
                _esto_alta.eliminarLocalizacion()
            }
        } catch (e) {
            _esto_alta.mostrarVentanaEmergenteMensajes("Alta Localización","Se ha producido un error, " + e)
            _esto_alta.eliminarLocalizacion()
            console.error(e)
        }
    },
    executeActionAltaDocumentosLocalizacion: function () {
        debugger
        try {
            if (_esto_alta.idMaximoDocumentoLocalizacion && parseInt(_esto_alta.idMaximoDocumentoLocalizacion) > -1) {

                if (_esto_alta.documentosVulnerables.length > 0) {
                    let listaDocumentosLocalizacion = new Array(_esto_alta.documentosVulnerables.length)
                    for (let index = 0; index < _esto_alta.documentosVulnerables.length; index++) {
                        var attributes = {};
                        attributes["ID_DocLoc"] = (parseInt(_esto_alta.idMaximoDocumentoLocalizacion)+(index+1))
                        attributes["ID_Documento"] = parseInt(_esto_alta.documentosVulnerables[index].id)
                        attributes["ID_Localizacion"] = parseInt(_esto_alta.idMaximoLocalizacion)
            
                        var addFeature = new Graphic({
                            attributes: attributes,
                        });
                        listaDocumentosLocalizacion[index] = addFeature
                    }
                    
                    var newFeatureDocumentoLocalizacion = new FeatureLayer(this.config.layerRiesgos.seviceUrlDocumentosLozalizacion);

                    newFeatureDocumentoLocalizacion.applyEdits(listaDocumentosLocalizacion, null, null).then(function(result) {
                        if (result) {
                            for (let index = 0; index < result.length; index++) {
                                if (result[index]["success"] === true) {
                                    if (index === result.length-1) {
                                        _esto_alta.map.getLayer(_esto_alta.idLayerLocalizacion).refresh();
                                        _esto_alta.mostrarVentanaEmergenteMensajes("Localización","Se ha guardado correctamente")
                                        _esto_alta.limpiarFormularioLocalizacion()
                                    }
                                } else {
                                    _esto_alta.eliminarLocalizacion()
                                    _esto_alta.eliminarTipado()
                                    _esto_alta.eliminarDocumentosLocalizacion(newFeatureDocumentoLocalizacion,result)
                                    _esto_alta.mostrarVentanaEmergenteMensajes("Error",result[index]["error"]["message"])
                                    break;
                                }
                            }
                        } else {
                            _esto_alta.eliminarLocalizacion()
                            _esto_alta.eliminarTipado()
                            _esto_alta.mostrarVentanaEmergenteMensajes("Localización","No se ha guardado Localización")
                        }
                    }, function (error) {
                        _esto_alta.mostrarVentanaEmergenteMensajes('ERROR', 'executeActionAltaDocumentosLocalizacion:<br />'+error.message)
                    });
                } else {
                    this.mostrarVentanaEmergenteMensajes("Localización", "Se ha guardado Localización")
                    _esto_alta.map.getLayer(_esto_alta.idLayerLocalizacion).refresh();
                    this.limpiarFormularioLocalizacion()
                }
            } else {
                _esto_alta.eliminarLocalizacion()
                _esto_alta.eliminarTipado()
                _esto_alta.mostrarVentanaEmergenteMensajes("Localización","No se ha guardado Localización")
            }
        } catch (e) {
            _esto_alta.eliminarLocalizacion()
            _esto_alta.eliminarTipado()
            this.mostrarVentanaEmergenteMensajes("Error", e)
            console.error(e)
        }
    },
    moverLocalizacion: function () {
        if (_esto_alta.editToolbar == null) {
            _esto_alta.editToolbar = new Edit(this.map);
        }
        var options = {
            allowAddVertices: false,
            allowDeleteVertices: false,
            uniformScaling: false
        };
        _esto_alta.editToolbar.activate(Edit.MOVE, _esto_alta.capaLocalizacion, options);
        _esto_alta.editToolbar.on("graphic-move-stop", _esto_alta.executeActionEditarLocalizacion);
        _esto_alta.editToolbar = null
    },
    executeActionEditarLocalizacion: function (event) {

        try {
            debugger
            
            if ( _esto_alta.editToolbar) {
                _esto_alta.editToolbar.deactivate();
            }
            if (_esto_alta.desconectadoDbClick) {
                _esto_alta.desconectadoDbClick.remove()
            }

            var featureLayer = new FeatureLayer(_esto_alta.config.layerRiesgos.seviceUrlLocalizaciones);
            featureLayer.queryFeatures({
                objectIds: [_esto_alta.atributosLocalizacion.OBJECTID],
                outFields: ["*"],
                returnGeometry: true
            })
            .then(function(results) {
                if (results.features.length > 0) {
                    let editFeature = results.features[0]
                    editFeature.geometry.x = event.graphic.geometry.x
                    editFeature.geometry.y = event.graphic.geometry.y

                    featureLayer.applyEdits(null,[editFeature],null)
                    _esto_alta.mostrarVentanaEmergenteMensajes("Localización", "Se ha editado correctamente")
                    _esto_alta.map.getLayer(_esto_alta.idLayerLocalizacion).refresh();
                }
            })
        } catch (e) {
            console.error("Se ha producido un error. " + e)
            this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error" + e)
        }
    },
    /** 
    * Select de autocompletado en el aparatado de  Localizaciones
    * */
    crearSelectTiposLocalizacion: function () {
        this.selectFilter = new FilteringSelect({
            id: "campoTiposLocalizacion",
            name: "selectTiposLocalizacion",
            store: new Memory({
                data: [
                        {"name":"Acceso", "id":2},
                        {"name":"Andén", "id":3},
                        {"name":"Otros", "id":7},
                        {"name":"Puerta principal", "id":1},
                        {"name":"Punto de encuentro", "id":4},
                        {"name":"Parada de transporte público", "id":5},
                        {"name":"Salida de emergencia", "id":6},
                    ]
            }),
            queryExpr:"*${0}*",
            required:false,
            style: "width: 80%;",
            searchAttr: "name",
        }, "campoTiposLocalizacion");
    },
    /** 
     * Este método obtiene el id maximo de la tabla LOCALIZACIONES
    * */
     obtenerMaxIdLozalizacion: function () {

        var peticionSoap = this.crearRequest("<tabla>" + this.config.layerRiesgos.nameLayer.LOCALIZACIONES + "</tabla>", "getNextVal")

        var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', this.urlObtenerServicio, true);
    
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var data = xmlParser.parse(xmlhttp.response);
                        var tagname = "getNextValReturn"
                        var maxId = dojo.query(tagname, data)[0].childNodes;
                        _esto_alta.idMaximoLocalizacion = maxId[0].nodeValue
                        _esto_alta.executeActionAltaLocalizacion()
                    }
                }
            }
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.send(peticionSoap);
    },
    /** 
     * Este método obtiene el id maximo de la tabla TIPADO
     * */
     obtenerMaxIdTipado: function () {
        try {
            var peticionSoap = this.crearRequest("<tabla>" + this.config.layerRiesgos.nameLayer.TIPADO + "</tabla>", "getNextVal")

            var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', this.urlObtenerServicio, true);
        
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        if (xmlhttp.status == 200) {
                            var data = xmlParser.parse(xmlhttp.response);
                            var tagname = "getNextValReturn"
                            var maxId = dojo.query(tagname, data)[0].childNodes;
                            _esto_alta.idMaximoTipado = maxId[0].nodeValue
                            _esto_alta.executeActionAltaTipado()
                        }
                        if (xmlhttp.status == 500) {
                            _esto_alta.eliminarLocalizacion()
                        }
                    }
                }
                xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                xmlhttp.send(peticionSoap);
        } catch (e) {
            _esto_alta.eliminarLocalizacion()
            _esto_alta.mostrarVentanaEmergenteMensajes("Localización", "No se ha insertado Localización")
        }
    },
    /** 
     * Este método obtiene el id maximo de la tabla DOCUMENTOSLOCALIZACIONES
     * */
     obtenerMaxIdDocumentoLozalizacion: function () {

        try {

        var peticionSoap = this.crearRequest(null, "getMaxIdDocumentoLocalizacion")

        var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', this.urlObtenerServicio, true);
    
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var data = xmlParser.parse(xmlhttp.response);
                        var tagname = "getMaxIdDocumentoLocalizacionReturn"
                        var maxId = dojo.query(tagname, data)[0].childNodes;
                        _esto_alta.idMaximoDocumentoLocalizacion = maxId[0].nodeValue
                        _esto_alta.executeActionAltaDocumentosLocalizacion()
                    }

                    if (xmlhttp.status == 500) {
                        _esto_alta.eliminarLocalizacion()
                        _esto_alta.eliminarTipado()
                    }
                }
            }
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.send(peticionSoap);
        } catch (e) {
            _esto_alta.eliminarLocalizacion()
            _esto_alta.eliminarTipado()
            _esto_alta.mostrarVentanaEmergenteMensajes("Localización", "No se ha insertado Localización")
        }
    },
    /**
    *********************************************************************************                                        ***************************************************************************************
    * *******************************************************************************          Métodos Área                  ***************************************************************************************
    * *******************************************************************************                                        ***************************************************************************************
    */
        executeActionAltaArea: function () {
            debugger
            try {
                if (_esto_alta.idMaximoElementoVulnerableA && parseInt(_esto_alta.idMaximoElementoVulnerableA) > -1) {
                    var attributes = {};
                    attributes["ID_ElementoVulnerableA"] = _esto_alta.idMaximoElementoVulnerableA
                    attributes["ID_ElementoVulnerableP"] = this.atributos.ID_ELEMENTOVULNERABLEP
                    attributes["Nombre"] = this.atributos.NOMBRE
                    attributes["Descripcion"] = this.atributos.DESCRIPCION

                    var addFeature = new Graphic({
                        attributes: attributes,
                        geometry: new Polygon(
                            {
                                rings:[
                                    _esto_alta.polygonJson
                                ],
                                "spatialReference": 25830
                            })
                    });

                    var featureLayer = new FeatureLayer(this.config.layerRiesgos.seviceUrlElementoVulnerableA);

                    featureLayer.applyEdits([addFeature],null,null).then(function(result) {
                        if (result && result[0]["success"] === true) {
                            _esto_alta.mostrarVentanaEmergenteMensajes("Área", "Se ha insertado correctamente")
                            _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableA).refresh();
                        } else {
                            _esto_alta.mostrarVentanaEmergenteMensajes("Localización","No se ha insertado el área del elemento vulnerable")
                        }
                    })
                } else {
                    this.mostrarVentanaEmergenteMensajes("Localización","No se ha insertado el área del elemento vulnerable")
                }
            } catch (e) {
                console.error(e)
                this.mostrarVentanaEmergenteMensajes("Error", e)
            }
        },
        initToolbar: function () {
            tb = new Draw(_esto_alta.map);
            tb.on("draw-end", _esto_alta.obtenerRings);
            tb.on("draw-end", _esto_alta.obtenerMaxIdElementoVulnerableA);
            tb.activate(Draw.POLYGON)
        },
        obtenerRings: function(evt) {
            _esto_alta.polygonJson = evt.geometry.rings[0]
            tb.deactivate()
        },
        editarArea: function (evt) {
            debugger
            if (_esto_alta.editToolbar == null) {
                _esto_alta.editToolbar = new Edit(_esto_alta.map);
            }
            _esto_alta.editToolbar.deactivate()
            if (this.desconectadoDbClick) {
                this.desconectadoDbClick.remove()
            }
            var options = {
                allowAddVertices: true,
                allowDeleteVertices: true,
                uniformScaling: false
            };

            this.myQuery = new query();
            var tool = 0;
            this.editToolbar.activate(tool | Edit.EDIT_VERTICES, _esto_alta.capaArea, options);
            this.editToolbar.on("vertex-move-stop", _esto_alta.selectFeatures);
            this.desconectadoDbClick = connect.connect(this.map.getLayer(_esto_alta.idLayerElementoVulnerableA),"onDblClick",_esto_alta.executeActionEditarArea)
            console.log(_esto_alta.atributosArea)
        },
        selectFeatures: function (evt) {
            console.log(evt)
            debugger
            _esto_alta.myQuery.objectIds = [evt.graphic.attributes[_esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableA).objectIdField]];
            _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableA).selectFeatures(_esto_alta.myQuery);
        },
        executeActionEditarArea: function (evt) {
            try {
                debugger
                if (_esto_alta.atributosArea.OBJECTID === evt.graphic.attributes.OBJECTID) {
                    var featureLayer = new FeatureLayer(_esto_alta.config.layerRiesgos.seviceUrlElementoVulnerableA);
                    featureLayer.queryFeatures({
                        objectIds: [_esto_alta.atributosArea.OBJECTID],
                        outFields: ["*"],
                        returnGeometry: true
                    })
                    .then(function(results) {
                        if (results.features.length > 0) {
                            let editFeature = results.features[0]
                            editFeature.geometry.rings = evt.graphic.geometry.rings
                            featureLayer.applyEdits(null,[editFeature],null)
                            _esto_alta.mostrarVentanaEmergenteMensajes("Área", "Se ha editado correctamente")
                            _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableA).refresh();
                        }
                    })
                }
                _esto_alta.editToolbar.deactivate()
                connect.disconnect(_esto_alta.desconectadoDbClick)
            } catch (e) {
                console.error("Se ha producido un error. " + e)
                this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error" + e)
            }
        },
        /**
         * Método que da de baja lógica un elemento vulnerable
        */
        executeActionEliminarElementoVulnerable: function () {
            try {
                var featureLayer = new FeatureLayer(this.config.layerRiesgos.seviceUrlElementoVulnerableP);
                featureLayer.queryFeatures({
                    outFields: ["*"],
                    returnGeometry: true
                })
                    .then(function(results) {
                    if (results.features.length > 0) {
                        for (let index = 0; index < results.features.length; index++) {
                            if (results.features[index].attributes.ID_ELEMENTOVULNERABLEP === _esto_alta.atributos.ID_ELEMENTOVULNERABLEP) {
                                let editFeature = results.features[index]
                                editFeature.attributes.BORRADO = 1 //-> indica que es baja lógica
                                featureLayer.applyEdits(null,[editFeature],null)
                                _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
                                _esto_alta.mostrarVentanaEmergenteMensajes("Eliminar", "Se ha eliminado correctamente")
                            }
                        }
                    }
                }, function (error) {
                    _esto_alta.mostrarVentanaEmergenteMensajes('ERROR', 'Eliminar Error:<br />'+error.message)
                })
            } catch (e) {
                console.error(e)
                this.mostrarVentanaEmergenteMensajes("Error", e)
            }
        },
        getVulnerabilidadesXId: function (result) {
            debugger
            this.clases = []
            this.categorias = []
            this.subCategorias = []
            this.tipologias = []
            this.tipologias_aux = []
            if (result) {
                for (let index = 0; index < result.features.length; index++) {
                    this.clases.push(result.features[index].attributes.ID_CLASE)
                    this.categorias.push((result.features[index].attributes.ID_CATEGORIA === null)?30:result.features[index].attributes.ID_CATEGORIA)
                    this.subCategorias .push((result.features[index].attributes.ID_SUBCATEGORIA === null)?50:result.features[index].attributes.ID_SUBCATEGORIA)
                    this.tipologias.push({"objectId":result.features[index].attributes.OBJECTID,"idTipologia":result.features[index].attributes.ID_TIPOLOGIA,"idClase":result.features[index].attributes.ID_CLASE,"idCategoria":result.features[index].attributes.ID_CATEGORIA,"idSubcategoria":result.features[index].attributes.ID_SUBCATEGORIA})
                    this.tipologias_aux.push({"objectId":result.features[index].attributes.OBJECTID,"idTipologia":result.features[index].attributes.ID_TIPOLOGIA,"idClase":result.features[index].attributes.ID_CLASE,"idCategoria":result.features[index].attributes.ID_CATEGORIA,"idSubcategoria":result.features[index].attributes.ID_SUBCATEGORIA})
                }
                this.getClasesXId()
            } else {
                _esto_alta.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error")
            }
        },
        getDocumentosVulnerablesXId: function (result) {
            debugger
            this.documentosVulnerables = []
            this.documentosVulnerables_aux = []
            for (let index = 0;index < result.features.length; index++) {
                this.documentosVulnerables_aux.push({"objectId":result.features[index].attributes.OBJECTID,"id":result.features[index].attributes.ID_DOCUMENTO})
                var myQuery = new query()
                myQuery.where = "ID_DOCUMENTO="+result.features[index].attributes.ID_DOCUMENTO
                myQuery.returnGeometry = false
                myQuery.outFields = ["*"]
                //Realizamos la busqueda
                var myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlDocumentos)
                myQueryTask.execute(myQuery, lang.hitch(this, this.getDocumentos), lang.hitch(this, this.callbackErrorGenerico))
            }
        },
        getDocumentos: function (result) {
            debugger
            var table = document.getElementById(TABLA_DOCUMENTACION);

            for (let index = 0; index < result.features.length; index++) {
                this.documentosVulnerables.push({"id":result.features[index].attributes.ID_DOCUMENTO,"nombre":result.features[index].attributes.NOMBRE})
                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
                for (let t = 0; t < this.tiposDocumentos.length; t++) {
                    if (parseInt(this.tiposDocumentos[t].id) === parseInt(result.features[index].attributes.ID_TIPODOCUMENTO)) {
                        cell1.innerHTML = `<td><p id="txt_tiposDocumentos" name="txt_tiposDocumentos">${this.tiposDocumentos[t].name}</p></td>`
                        break;
                    }
                }
                var enlace = result.features[index].attributes.ENLACE.replaceAll("\\","/")
                enlace = this.config.enlace + this.config.urlProxy + "file:" + enlace
                cell2.innerHTML = `<td><a href='${enlace}' target="_blank" id="elementoVulnerable" name="elementoVulnerable">${result.features[index].attributes.NOMBRE}</a></td>`
                cell3.innerHTML = `<td><button id="btn_documentoVulnerable" name="btn_documentoVulnerable" type="button" dojoType="dijit.form.Button"  onclick='_esto_alta.eliminarDocumentoVulnerable(event,"myTable_documentacion")'>Eliminar</button></td>`
                cell4.innerHTML = `<td><button id="btn_editarDocumentoVulnerable" name="btn_editarDocumentoVulnerable" type="button" dojoType="dijit.form.Button"  onclick='_esto_alta.editarDocumentoVulnerable(event)'>Editar</button></td>`
            }
        },
        cargarFactoresVulnerablesAlmodificar: function () {
            debugger
            //var hash = {}
            //this.descripciones.tiposFactor = this.descripciones.tiposFactor.filter(d=> hash[d.id]? false : hash[d.id] = true)
            console.log(this.descripciones.tiposFactor)
            var table = document.getElementById("myTable_factor");
            for (let index = 0; index < this.descripciones.tiposFactor.length; index++) {
                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                cell1.innerHTML = `<td><p id="txt_tipoFactor" name="txt_tipoFactor">${this.descripciones.tiposFactor[index].descripcion}</p></td>`
                cell2.innerHTML = `<td><button id="btEliminarTipoFactor" name="btEliminarTipoFactor" type="button" dojoType="dijit.form.Button" onclick='_esto_alta.limpiarTipoFactor(event)'>Eliminar</button></td>`
            }
        },
        cargarTipologiasAlmodificar: function () {
            debugger
            var table = document.getElementById("myTable");
            for (let index = 0; index < this.descripciones.factores.length; index++) {
                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                //var cell4 = row.insertCell(3);
                //var cell5 = row.insertCell(4);
                cell1.innerHTML = `<td><p id="txt_factor" name="inputClase">${this.descripciones.factores[index].descripcion}</p></td>`
                cell2.innerHTML = `<td><p id="txt_categoria" name="inputCategoria">${this.descripciones.categorias[index].descripcion}</p></td>`
                cell3.innerHTML =  `
                <td>
                    <p id="txt_subcategoria" name="inputSubcategoria">${this.descripciones.subcategorias[index].descripcion}</p>
                    <button id="btEliminar" name="btEliminar" type="button" dojoType="dijit.form.Button" onclick='_esto_alta.limpiarTipologia(event)'>Eliminar</button>
                    <button id="btn_Modificar" name="btn_Modificar" type="button" dojoType="dijit.form.Button"  onclick='_esto_alta.modificarTipologias(event)'>Modificar</button>
                </td>`
                //cell4.innerHTML = `<td><button id="btEliminar" name="btEliminar" type="button" dojoType="dijit.form.Button" onclick='_esto_alta.limpiarTipologia(event)'>Eliminar</button></td>`
                //cell5.innerHTML = `<td><button id="btn_Modificar" name="btn_Modificar" type="button" dojoType="dijit.form.Button"  onclick='_esto_alta.modificarTipologias(event)'>Modificar</button></td>`
            }
        },
        getListaTipologias: function (id_elementoVulnerablep) {
            debugger
            var tipologias = []
            let idVulnerabilidad = parseInt(_esto_alta.idMaximoVulnerabilidad)

            for (let index = 0; index < _esto_alta.tipologias.length; index++) {
                var vulnerabilidad = {};
                vulnerabilidad["ID_TIPOLOGIA"] = ++idVulnerabilidad
                vulnerabilidad["ID_CLASE"] = parseInt(_esto_alta.tipologias[index].idClase)
                vulnerabilidad["ID_ELEMENTOVULNERABLEP"] = id_elementoVulnerablep
                vulnerabilidad["ID_CATEGORIA"] = parseInt(_esto_alta.tipologias[index].idCategoria)
                vulnerabilidad["ID_SUBCATEGORIA"] = parseInt(_esto_alta.tipologias[index].idSubcategoria)
                
                tipologias.push(vulnerabilidad)
            }
            return tipologias
        },
        convertirFechaYHoraAMilisegundos: function (fecha, hora) {

            if (fecha !== null) {
                let arrayFecha = fecha.split("-")
                if (hora !== null) {
                    let arrayHora = hora.split(":")
                    fecha = new Date(parseInt(arrayFecha[0]), (parseInt(arrayFecha[1])-1), parseInt(arrayFecha[2]), parseInt(arrayHora[0]), parseInt(arrayHora[1])).getTime()
                } else {
                    fecha = new Date(parseInt(arrayFecha[0]), (parseInt(arrayFecha[1])-1), parseInt(arrayFecha[2]), 0, 0).getTime()
                }
            }
            return fecha
        },
        parsearDescripcion: function (array) {
            var descripcion = {}
            descripcion.id = _esto_alta.buscarEnArray(array.childNodes, "id");
            descripcion.descripcion = _esto_alta.buscarEnArray(array.childNodes, "descripcion");
            return descripcion
        },
        vulnerablididadToXML (tag,idVulnerabilidad) {
            debugger
            
            var vulnerabilidad = ""
            for (let key in idVulnerabilidad) {
                vulnerabilidad+= "<"+tag+">"+ idVulnerabilidad[key] +"</"+tag+">"
            }
            console.log(vulnerabilidad)
            return vulnerabilidad;
        },
        cambiarActionBoton: function (atributoViejo, atributoNuevo, contenido) {
            if (document.getElementById(atributoViejo) != null) {
                document.getElementById(atributoViejo).name = atributoNuevo
                document.getElementById(atributoViejo).id = atributoNuevo
                document.getElementById(atributoNuevo).textContent = contenido
                if (contenido === "Modificar")
                    document.getElementById(atributoNuevo).onclick = function () {_esto_alta.validarModificacionElementoVulnerable()}
                else
                    document.getElementById(atributoNuevo).onclick = function () { _esto_alta.validarElementoVulnerable() }
            }
        },
        cambiarLabelWidget: function (label) {
            dojo.byId(NOMBRE_WIDGET).children[0].children[0].textContent = label
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
        /**
        * ************************************************************************* Métodos de eliminacion ***************************************************************************************
        */
        eliminarElementoVulnerablePXObjectId: function () {
            debugger
            var layer = new FeatureLayer(this.config.layerRiesgos.seviceUrlElementoVulnerableP);

            layer.queryFeatures({
                objectIds: [_esto_alta.objectIdElementoVulnetableP],
                returnGeometry: true,
                outFields: ["*"]
            }).then(function(results) {
                if (results.features.length > 0) {
                    layer.applyEdits(null,null,[results.features[0]]);
                }
            });
        },
        eliminarFactoresVulnerablesXObjectId: function (action) {
            debugger

            var layer = new FeatureLayer(this.config.layerRiesgos.seviceUrlFactorVulneravilidad);

            layer.queryFeatures({
                objectIds: _esto_alta.objectIdFactoresVulnerables,
                returnGeometry: true,
                outFields: ["*"]
            }).then(function(results) {
                if (results.features.length > 0) {
                    for (let index = 0; index < results.features.length; index++) {
                        layer.applyEdits(null,null,[results.features[index]]);   
                    }
                    if (action && action === ACTION_EDITAR && _esto_alta.editarTipoFactor) {
                        _esto_alta.obtenerMaxIdFactorVulnerabilidad(ACTION_EDITAR)
                    }
                } else {
                    this.mostrarVentanaEmergenteMensajes("Modificación elemento vulnerable", "No se ha podido modificar los factores del Elemento vulnerable")
                    _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
                }
            });
        },
        eliminarTipologiasXObjectId: function (action) {
            debugger

            var layer = new FeatureLayer(this.config.layerRiesgos.seviceUrlVulnerabilidad);
            layer.queryFeatures({
                objectIds: _esto_alta.objectIdTipologias,
                returnGeometry: true,
                outFields: ["*"]
            }).then(function(results) {
                if (results.features.length > 0) {
                    for (let index = 0; index < results.features.length; index++) {
                        layer.applyEdits(null,null,[results.features[index]]);   
                    }
                    if (action && action === ACTION_EDITAR ) {
                        _esto_alta.obtenerMaxIdTipologia(ACTION_EDITAR)
                    }
                } else {
                    this.mostrarVentanaEmergenteMensajes("Modificación elemento vulnerable", "No se ha podido modificar las tipologías del Elemento vulnerable")
                    _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
                }
            });
        },
        eliminarDocumentosVulnerableXObjectId: function (action) {
            debugger
            var layer = new FeatureLayer(this.config.layerRiesgos.seviceUrlDocumentosVulnerable);

            layer.queryFeatures({
                objectIds: _esto_alta.objectIdDocumentosElementoVulnerable,
                returnGeometry: true,
                outFields: ["*"]
            }).then(function(results) {
                if (results.features.length > 0) {
                    for (let index = 0; index < results.features.length; index++) {
                        layer.applyEdits(null,null,[results.features[index]]);   
                    }
                    if (action && action === ACTION_EDITAR) {
                        _esto_alta.obtenerMaxIdDocumentoVulnerabilidad(action)
                    }
                } else {
                    this.mostrarVentanaEmergenteMensajes("Modificación elemento vulnerable", "No se ha podido modificar los documentos del Elemento vulnerable")
                    _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableP).refresh();
                }
            });
        },
        eliminarLocalizacion: function () {

            var layer = new FeatureLayer(this.config.layerRiesgos.seviceUrlLocalizaciones);

            layer.queryFeatures({
                objectIds: _esto_alta.objectIdLocalizacion,
                returnGeometry: true,
                outFields: ["*"]
            }).then(function(results) {
                if (results.features.length > 0) {
                    layer.applyEdits(null,null,[results.features[0]]);
                }
            });
        },
        eliminarTipado: function () {

            var layer = new FeatureLayer(this.config.layerRiesgos.seviceUrlTipado);

            layer.queryFeatures({
                objectIds: _esto_alta.objectIdTipado,
                returnGeometry: true,
                outFields: ["*"]
            }).then(function(results) {
                if (results.features.length > 0) {
                    layer.applyEdits(null,null,[results.features[0]]);
                }
            });
        },
        eliminarDocumentosLocalizacion: function (layer, result) {
            let listaObjectIdDocumentosLocalizacion = []
            for (let index = 0; index < result.length; index++) {
                if (result[index]["success"] === true) {
                    listaObjectIdDocumentosLocalizacion.push(result[index]["objectId"])
                }
            }
            layer.queryFeatures({
                objectIds: listaObjectIdDocumentosLocalizacion,
                returnGeometry: true,
                outFields: ["*"]
            }).then(function(results) {
                if (results.features.length > 0) {
                    for (let index = 0; index < results.features.length; index++) {
                        layer.applyEdits(null,null,[results.features[index]]);
                    }
                }
            });
        },
        executeActionEliminarArea: function () {
            debugger
            try {
                if ( _esto_alta.editToolbar) {
                    _esto_alta.editToolbar.deactivate();
                }
                if (_esto_alta.desconectadoDbClick) {
                    _esto_alta.desconectadoDbClick.remove()
                }
                console.log(_esto_alta.atributosArea.OBJECTID)
                
                var layer = new FeatureLayer(this.config.layerRiesgos.seviceUrlElementoVulnerableA);
                layer.queryFeatures({
                    objectIds: [_esto_alta.atributosArea.OBJECTID],
                    returnGeometry: true,
                    outFields: ["*"]
                }).then(function(results) {
                    if (results.features.length > 0) {
                        layer.applyEdits(null,null,[results.features[0]]);
                        _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableA).remove(_esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableA)._graphicsVal.filter(v=>v.attributes.OBJECTID === _esto_alta.atributosArea.OBJECTID)[0])
                        _esto_alta.mostrarVentanaEmergenteMensajes("Mensaje", "Se ha eliminado el área correctamente")
                        _esto_alta.map.getLayer(_esto_alta.idLayerElementoVulnerableA).refresh();
                    }
                });
            } catch (e) {
                console.error("Se ha producido un error, " + e)
                this.mostrarVentanaEmergenteMensajes("Error", "Se ha producido un error, " + e)
            }
        },
    /**
    * ************************************************************************* Métodos sobre la parte de  documentación ***************************************************************************************
    */
    getTipoDocumento : function () {
        debugger
        var peticionSoap = this.crearRequest(null, this.config.funcionGetTiposDocumento)
  
        var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', this.urlObtenerServicio, true);
  
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var data = xmlParser.parse(xmlhttp.response);
                        var tagname = _esto_alta.config.tagNameGetTiposDocumento
                        var tipos = dojo.query(tagname, data)[0].childNodes;
                        for (let index = 0; index < tipos.length; index++) {
                            var  descripcion = _esto_alta.parsearDescripcion(tipos[index])
                            _esto_alta.tiposDocumentos.push( {"name":descripcion.descripcion, "id":descripcion.id} )
                        }
                    }
                }
            }
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.send(peticionSoap);
    },
    cargarDocumentosVulnerables : function (nameHidden,id) {
        try {
            debugger
            var tipoDocumento = document.getElementsByName(nameHidden)[0].value
            
            if (this.documentos.length !== 0) {
                _esto_alta.documentos = []
                dijit.byId(id).store.data = [];
                dojo.byId(id).value = "";
            }
            this.idFilter = id
            if (tipoDocumento && !isNaN(tipoDocumento)) {
                this.executeActionDocumentosXTipo(tipoDocumento)
            } else if (tipoDocumento === "") {
                this.executeActionDocumentos()
            }
        } catch (e) {
            console.error("Se ha producido un error, " + e)
            this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error, " + e)
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
    executeActionDocumentosXTipo: function (tipoDocumento) {
        var myQuery = new query()
        myQuery.where = "ID_TIPODOCUMENTO=" + tipoDocumento
        myQuery.returnGeometry = false
        myQuery.outFields = ["*"]
        //Realizamos la busqueda
        var myQueryTask = new QueryTask(this.config.layerRiesgos.seviceUrlDocumentos)
        myQueryTask.execute(myQuery, lang.hitch(this, this.obtenerDocumentos), lang.hitch(this, this.callbackErrorGenerico))
    },
    obtenerDocumentos: function (results) {
        debugger
        for (let index = 0; index < results.features.length; index++) {
            const feature = results.features[index]
            _esto_alta.documentos.push( {"id":feature.attributes.ID_DOCUMENTO+";"+feature.attributes.ID_TIPODOCUMENTO+";"+feature.attributes.ENLACE, "name":feature.attributes.NOMBRE} )
        }
        if (this.idFilter !== null)
            dijit.byId(this.idFilter).store.data =  _esto_alta.documentos.sort((a,b)=>{return a.name<b.name?-1: a.name>b.name?1:0});
        _esto_alta.documentos.sort((a,b)=>{return a.name<b.name?-1: a.name>b.name?1:0});
    },
    aniadirDocumentos: function (id,name,idTabla,parte) {
        debugger
        try {
            var documento = dojo.byId(id).value
            var value = document.getElementsByName(name)[0].value

            var idDocumento = value.split(";")[0]
            var idTipoDocumento = value.split(";")[1]

            if ((idDocumento && !isNaN(idDocumento)) && documento) {
                var table = document.getElementById(idTabla);
                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                this.documentosVulnerables.push({"id":parseInt(idDocumento),"nombre":documento})
                for (let index = 0; index < this.tiposDocumentos.length; index++) {
                    if (parseInt(this.tiposDocumentos[index].id) === parseInt(idTipoDocumento)) {
                    cell1.innerHTML = `<td><p id="txt_tiposDocumentos" name="txt_tiposDocumentos">${this.tiposDocumentos[index].name}</p></td>`
                    break;
                    }
                }
                var enlace = value.split(";")[2].replaceAll("\\","/")
                enlace = this.config.enlace + this.config.urlProxy + "file:" + enlace
                if (parte === "ElementoVulnerable") {
                    var cell4 = row.insertCell(3);
                    cell2.innerHTML = `<td><a href='${enlace}' target='_blank' id="elementoVulnerable" name="elementoVulnerable">${documento}</p></td>`
                    cell3.innerHTML = `<td><button id="btn_documentoVulnerable" name="btn_documentoVulnerable" type="button" dojoType="dijit.form.Button"  onclick='_esto_alta.eliminarDocumentoVulnerable(event,"myTable_documentacion")'>Eliminar</button></td>`
                    cell4.innerHTML = `<td><button id="btn_editarDocumentoVulnerable" name="btn_editarDocumentoVulnerable" type="button" dojoType="dijit.form.Button"  onclick='_esto_alta.editarDocumentoVulnerable(event)'>Editar</button></td>`

                    //dojo.byId("inputTipoDocumento").value = ""
                    //document.getElementsByName("selectTipoDocumento")[0].value = ""
                    document.getElementsByName("selectDocumento")[0].value = ""
                    dojo.byId("inputDocumento").value = ""
                } else if (parte === "Localización")  {
                    cell2.innerHTML = `<td><a href='${enlace}' target='_blank' id="elementoVulLocalizacion" name="elementoVulLocalizacion">${documento}</a></td>`
                    cell3.innerHTML = `<td><button id="btn_documentoLocalizacion" name="btn_documentoLocalizacion" type="button" dojoType="dijit.form.Button"  onclick='_esto_alta.eliminarDocumentoVulnerable(event,"myTable_localizacion")'>Eliminar</button></td>`

                    //dojo.byId("inputTipoDocumento_localizacion").value = ""
                    //document.getElementsByName("selectTipoDocumento_localizacion")[0].value = ""
                    document.getElementsByName("selectDocumentoLozalizacion")[0].value = ""
                    dojo.byId("inputDocumento_localizacion").value = ""
                }
                this.editarDocumento = true
            }
            console.log(this.documentosVulnerables)
        } catch (e) {
            console.error("Se ha producido un error, " + e)
            this.mostrarVentanaEmergenteMensajes("Error","Se ha producido un error, " + e)
        }
    },
    eliminarDocumentoVulnerable :function (event,idTabla) {
        var elemento  = event.target.parentElement.parentElement
        var pos = elemento.rowIndex
        document.getElementById(idTabla).deleteRow(pos)
        this.documentosVulnerables.splice(pos-1,1)
        this.editarDocumento = true
        console.log(this.documentosVulnerables)
    },
    editarDocumentoVulnerable :function (event) {
        debugger
        var elemento  = event.target.parentElement.parentElement
        var pos = elemento.rowIndex
        id_documento = this.documentosVulnerables[pos-1].id
        document.getElementsByClassName("container-section")[0].children[4].click()
    },
    cambiarEdicionFalse:function () {
        this.editarTipologia = false;
        this.editarTipoFactor = false;
        this.editarDocumento = false;
    },
    /**
    * ****************************************************************************** Otros métodos ***************************************************************************************
    */
    onCerrar: function (event) {
        debugger
        if (event["path"] != undefined)
            event.path[9].children[0].children[1].children[2].click()
        else
            document.getElementById(NOMBRE_WIDGET).children[0].children[1].children[2].click()
    },
    _onEditClose: function () {
        this.ventana = null
        this.listavias = []
        this.listaCodPdis = []
        this.contenido = null
    },
    shutdown: function () {
        console.info("inicio EditorFichas::shutdown");
        this.cambiarEdicionFalse()
        this.ocultarFormularioLocalizacion()
        this.cambiarActionBoton("btModificar","btAlta","Alta");
        this.limpiarFormularioElementoVulnerable()
        this.limpiarListas()
        this.limpiarFormularioLocalizacion()
        this.desabilitarSelectsVulnerables()
    },
    onOpen: function onOpen() {
        console.log('AltaWidget::onOpen');
        this.crearContextMenu()
    },
    onClose: function () {
        this.shutdown();
    },
    processError: function (soapResponse) {
          console.error(soapResponse)
    },
    callbackErrorGenerico: function callbackErrorGenerico(error) {
        console.log('callbackErrorGenerico', error);
    },
  });
});