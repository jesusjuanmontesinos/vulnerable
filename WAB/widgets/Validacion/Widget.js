

var esto;
define(["dojo/_base/declare","dojo/dom", "jimu/utils","jimu/BaseWidget", "jimu/WidgetManager",
     "jimu/PanelManager", "dojox/xml/parser", "esri/map","dojo/_base/array", "dojo/request", "libs/jquery/jquery-1-11-1.js", 'dojo/html'],
function (declare,dom,utils, BaseWidget, WidgetManager, PanelManager , xmlParser, map, array, request, Jquery, html) {
    return declare( [BaseWidget], {
        widgetsInTemplate: true,
        _initialized: false,
        i18nStrings: null,
        _servicioWebGIS: null,
        _servicioValidacion: null,
        _urlsServicio: null,
        _contadorServicio: 0,
        _targetResultadosUrlsWSValidacion: null,
        _metodoGetUrlsWSValidacion: null,
        _metodoValidacion: null,
        _metodoRecuperarPermisos: null,
        _idAplicacion: null,
        _idUsuario: null,
        _nombreUsuario: null,
        _perfil: null,
        _permisosPefil: null,
        parametrosUsuario: null,
        configData: null,
        //templatePath: dojo.moduleUrl("eptisati", "widgets/templates/ValidationWidget.html"),
        constructor: function (/*Object*/params) {
        },
        setPerfil: function (perfil) {
            this._perfil = perfil;
        },
        getPerfil: function (perfil) {
            return this._perfil;
        },
        setPermisosPerfil: function (permisosperfil) {
            this._permisosPefil = permisosPerfil;
        },
        getPermisosPerfil: function () {
            return this._permisosPerfil;
        },
        setIdUsuario: function (idUsuario) {
            this._idUsuario = idUsuario;
        },
        getIdUsuario: function () {
            return this._idUsuario;
        },
        setNombreUsuario: function (nombreUsuario) {
            this._nombreUsuario = nombreUsuario;
        },
        getNombreUsuario: function () {
            return this._nombreUsuario;
        },
        postMixInProperties: function () {
            // 
            try {
                this.inherited(arguments);
                // Init i18n
                //this.i18nStrings = dojo.i18n.getLocalization("eptisati.widgets", "ValidationWidgetStrings");

            }
            catch (err) { console.error(err); }
        },
        postCreate: function () {
            this.inherited(arguments);
            try {
                dojo.parser.parse(this.domNode);
                jQuery.support.cors = true;
            }
            catch (err) { console.error(err); }
        },
        cargarVentanaValidacion: function () {
            
            //Cargamos la venta de validacion de usuario
            var params = {
                message: "",
                title: this.i18nStrings.titulo,
                type: "A"
            };
            dojo.publish("showdialogEvent", ["CustomDialog", this, params]);
        },
        startup: function () {
			esto= this
			document.getElementById("map_root").style.display="none"
			this.map.disableMapNavigation();
			this.map.disableKeyboardNavigation();
			this.map.disablePan();
			this.map.disableRubberBandZoom();
			this.map.disableScrollWheelZoom();
            //this.cargarVentanaValidacion();
			document.getElementById("aceptar").addEventListener("click", function(){
				var parametros ={
				usuario: document.getElementById("usuario").value.toUpperCase(),
				password: document.getElementById("password").value
				}
				esto.dialogResult(parametros);
			});

            var domain = window.location.protocol + "//" + window.location.host;
            var htmlIn = '<div style="text-align: center; width: 250px; height: 300px; border: 0 none; padding:10px">'
            +'<div id="imgAyto"></div><div id="AyudaDialogMsgDiv" style="margin-top:10px; margin-bottom:15px"><h2 id="titulo">'+this.config.Titulo+'</h2>'
               +'<p class="textoAyuda" id="subtitulo">'+this.config.Subtitulo+'</p>'
               +'<hr width="80%" />'
               +'<p class="textoAyuda" id="version">'+this.config.Version+'</p>'
               +'<p class="textoAyuda" id="fecha">'+this.config.Fecha+'</p>'
               +'<a href="'+ domain + this.config.TituloAyuda+'" id="lnkVersion" target="_blank">Manual de Usuario</a>'
               +'<br>'
               +'<a href="'+ domain +"//"+this.config.TituloVersion+'" id="lnkAyuda" target="_blank" style="display:none">Novedades de esta versión<span style="color: rgb(0, 0, 0);"></span></a>'
            +'</div></div>'
            html.set(dojo.byId("divAyudaLogin"), htmlIn)

        },
		
		getWidgetConfig: function(widgetName){  
			var widgetCnfg = null;  
			var wm = WidgetManager.getInstance();
			var widgets = wm.appConfig.widgetPool.widgets
			for (var i = 0; i < widgets.length; i++) {
				if ( widgetName != "HeaderController"){
					var length = widgetName[widgets[i].name].length
					if(widgetName[widgets[i].name] == 1) {  
					    widgetCnfg = widgets[i]; 
						esto.visibleWidget(widgetCnfg)
					} 
					else if (length){
						for (var j = 0; j < length; j++) {
						   if (widgets[i].label == widgetName[widgets[i].name][j]){
								widgetCnfg = widgets[i];
								esto.visibleWidget(widgetCnfg)								
						   }
						}
					}
				}
				if(!widgetCnfg){  
				/*Check OnScreen widgets if not found in widgetPool*/  
				array.some(wm.appConfig.widgetOnScreen.widgets, function(aWidget) {  
				// correcto es usar name no label pero al repetir widget el nombre se repite
				  if(aWidget.name == widgetName) {  
					widgetCnfg = aWidget;  
					return true;  
				  }  
				  return false;  
				});  
			  }  	
			}
		return widgetCnfg;	    
		},  
		
				
		onOpen: function(){
            console.log("abre")
            var firstNode = dom.byId("usuario");
            utils.initFirstFocusNode(this.domNode, firstNode);
            var lastNode = dom.byId("aceptar");
            utils.initLastFocusNode(this.domNode, lastNode);
            if (utils.isAutoFocusFirstNodeWidget(this)) {
            firstNode.focus();
            }
			
		},
		visibleWidget : function(widgetCfg){
			if (widgetCfg.visible == false){
				widgetCfg.visible = true
				}
			else {
				widgetCfg.visible = false
			};
		},
		
		OcultarWidget: function(array){
			//call utility function to get the proper widget config based on the widget name !Not Label but Name!  
			//The label can be changed by the widget configurer  
			var widgetCfg = this.getWidgetConfig(array);  		
			var wm = WidgetManager.getInstance();		
			var headerCfg = this.getWidgetConfig('HeaderController');  
			var headerWidget = wm.getWidgetByLabel(headerCfg.label);  
			//This is need to show the widgets icon in the header  
			headerWidget.resize();  
			document.getElementById("map_root").style.display=""
		},
		onClose: function(){
			debugger;
			switch(this._perfil) {
			  case '1':
			  debugger;
				esto.OcultarWidget(this.config.configLevels.Level1);
				break;
			  case '2':
				esto.OcultarWidget(this.config.configLevels.Level2);
				break;
			  case '3':
				esto.OcultarWidget(this.config.configLevels.Level3);
				break;
			  case '4':
				esto.OcultarWidget(this.config.configLevels.Level4);
				break;
			  default:
				var level= "Level3"	
			}
            // la liena de abajo guarda el perfil para mostrar o no las capas
            esto.appConfig.perfil = this._perfil;
			this.map.enableMapNavigation();
			this.map.enableKeyboardNavigation();
			this.map.enablePan();
			this.map.enableRubberBandZoom();
			this.map.enableScrollWheelZoom();
			
		},
		
        validaPermisos: function (data) {
            try {
				data = xmlParser.parse(data);
                var tagname = this.config.TagNameRecuperarPermisos;
                this._perfil = dojo.query(tagname, data)[1].childNodes[1].lastChild.data;
				var pm = PanelManager.getInstance();
				pm.closePanel(pm.activePanel.id)
				//PanelManager.getInstance().closePanel(widgetid + ‘_panel’);
                //Una vez que tenemos el perfil es necesario recuperar las herramientas y capas a las que tiene acceso dicho perfil
                esto.llamadaRecuperarPermisos();

            }
            catch (error) {
                this.showAceptarDialog(true, "No tiene permisos", "");
                console.error("ValidationWidget::validaPermisos", error);
            }
        },
        recuperaPermisosPerfil: function (data) {

            try {
                data = xmlParser.parse(data);
                var tagname = this.config.tagNameGetPermisosPerfil;
                this._permisosPerfil = dojo.query(tagname, data)[0].childNodes[0].lastChild.data;
                console.info("permisosperfil: " + this._permisosPerfil);
                // this.configData.profile = this._permisosPerfil;
                dojo.publish("onClose", this, "continuaConfig");
                dojo.publish("hidedialogEvent", ["CustomDialog", this, "true"]);
            }
            catch (error) {

                this.showAceptarDialog(true, "No es posible recuperar los permisos del perfil", "");
                //console.error("ValidationWidget::recuperaPermisosPerfil", error);
            }
        },
        validaUsuario: function (data) {

            try {
				data = xmlParser.parse(data);
                var tagname = this.config.TagNameValidarUsuario;
                var respuesta = dojo.query(tagname, data)[0].childNodes[0];
                if (respuesta) {

                    this._idUsuario = respuesta.childNodes[0].childNodes[0].data;
                    this._nombreUsuario = respuesta.childNodes[1].childNodes[0].data;
                    this.llamadaValidarPermisos();
                }
                else {
                    alert("Usuario o contraseña incorrecto");
                }
            }
            catch (error) {
                this.showAceptarDialog(true, "Usuario o contrase&ntilde;a incorrecto", "");
                console.error("ValidationWidget::validaUsuario", error);
            }
        },
        obtenerServicioValidacion: function (data) {
            try {
				data = xmlParser.parse(data);
                var tagname = this.config.tagNameGetUrlsWSValidacion;
                var respuesta = dojo.query(tagname, data);
                this._urlsServicio = respuesta[0].childNodes; //Recogemos la respuesta
                //llamamos al servicio de validacion con el usuario y contrasena
                this.llamadaWSValidacion(this._contadorServicio, this.parametrosUsuario);
            }
            catch (error) {

                console.error("ValidationWidget::obtenerServicioValidacion", error);
            }
        },
        llamadaRecuperarPermisos: function () {

            if (this._perfil > 0) {//Recuperamos los permisos
                console.info("perfil: " + this._perfil);
                var p4 = "<perfil>" + this._perfil + "</perfil>";
                //var soapRequest = new eptisati.soapRequest();
                //soapRequest.setMetodo(this._metodoGetPermisosPefil);
                //soapRequest.setParametros(p4);
				var peticionSoap = esto.crearRequest(p4,this._metodoGetPermisosPefil);
                //Hacemos la consulta a la base de datos
				request.post(this._servicioWebGIS,{
						data:peticionSoap,
						handleAs: "xml"
						}).then(function(response){
						esto.recuperaPermisosPerfil(response)
						},function(err){esto.processError(err)});
            }
        },
        llamadaValidarPermisos: function () {

            if (this._idUsuario) {//Si hemos obtenido resultados pasamos al siguiente
                //Si el usuario tiene idUsuario es que está validado y a continuacion se comprueban sus permisos
                var p3 = "<idusuario>" + this._idUsuario + "</idusuario><idaplicacion>" + this._idAplicacion + "</idaplicacion>";
                console.info("usuario: " + this._idUsuario + "aplicacion: " + this._idAplicacion);
                //var soapRequest = new eptisati.soapRequest();
                //soapRequest.setMetodo(this._metodoRecuperarPermisos);
                //soapRequest.setParametros(p3);
                //var peticionSoap = soapRequest.crearRequest();
				var peticionSoap = esto.crearRequest(p3,this._metodoRecuperarPermisos);
                //Hacemos la consulta a la base de datos
				request.post(this._servicioValidacion,{
						data:peticionSoap,
						handleAs: "xml"
						}).then(function(response){
						esto.validaPermisos(response)
						},function(err){esto.processError(err)});
            }
        },
        llamadaWSValidacion: function (indice, p) {
            //********************************************************************************************
            //Llamamos al metodo del servicio web. 
            //Recibe el indice y los parametros
            //Devuelve: true si puede realizar la consulta, false si no puede realizar la consulta
            //Nota: solo da error si el servicio no está disponible, si el usuario o password es incorrecta 
            //*******************************************************************************************
            try {

                this._servicioValidacion = window.location.protocol + "//" + window.location.host + this.config.configGlobal.proxy + this._urlsServicio[indice].lastChild.data;
                this._metodoValidacion = this.config.getValidarUsuario;
                var peticionSoap = esto.crearRequest(p,this._metodoValidacion);
                //Hacemos la consulta a la base de datos
				request.post(this._servicioValidacion,{
						data:peticionSoap,
						handleAs: "xml"
						}).then(function(response){
						esto.validaUsuario(response)
						},function(err){esto.processErrorServicioValidacion(err)});

            }
            catch (e) {
                return false;
            }


        },
        processError: function (soapResponse) {

            // this.showSpinner(false);
            this.showAceptarDialog(true, "No se ha podido validar el usuario", "");
            console.error("ValidationWidget::processError::");
        },
        processErrorServicioValidacion: function (soapResponse) {

            //Si existe un error con el servicio
            if (this._contadorServicio < this._urlsServicio.length - 1) {
                this._contadorServicio = this._contadorServicio + 1;
                this.llamadaWSValidacion(this._contadorServicio, this.parametrosUsuario);
            }
            else {
                //this.showAceptarDialog(true, "No se ha podido validar el usuario", "Mensaje de Información");
                console.error("processErrorServicioValidacion:: No es posible validar el usuario");
				alert("usuario o contraseña no son correctos"); 
            }

        },
        showAceptarDialog: function (/*boolean*/mostrar, mensaje, titulo) {
            //*********************************************************************************************
            //Metodo para controlar la visualizacion de la ventana de espera cuando el usuario guarda
            //**********************************************************************************************
            if (mostrar) {
                var params = {
                    message: mensaje,
                    title: titulo,
                    type: "Aceptar"
                };

                dojo.publish("showdialogEvent", ["AceptarDialog", this, params]);
            }
            else {
                dojo.publish("hidedialogEvent", ["AceptarDialog", this, "true"]); //Escondemos la ventana
            }

        },
		crearRequest: function (parametros, metodo) {
			var soapRequest = "";
				if (parametros != null) {
					soapRequest = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' > <soapenv:Header><Access-Control-Allow-Origin>*</Access-Control-Allow-Origin></soapenv:Header> <soapenv:Body>" +
					"<" + metodo + "> " + parametros + " </" + metodo + "></soapenv:Body></soapenv:Envelope>";
				}
				else {
					soapRequest = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' ><soapenv:Header><Access-Control-Allow-Origin>*</Access-Control-Allow-Origin></soapenv:Header> <soapenv:Body>" +
					"<" + metodo + "/></soapenv:Body></soapenv:Envelope>";
				}
				
				return soapRequest;
		},
        dialogResult: function (result) {
            
            try { 
                if (result.usuario && result.password) {
                    //Definicion de variables
					//Definimos la urls de los posibles  servicios de validacion 
                        this._servicioWebGIS = window.location.protocol + "//" + window.location.host + this.config.configGlobal.proxy + this.config.configGlobal.urlWSGIS;
                        //Metodo para obtener las urls de servicio de validacion
                        this._metodoGetUrlsWSValidacion = this.config.getUrlsWSValidacion;
                        //Target resultado
                        this._targetResultadosUrlsWSValidacion = this.config.tagNameGetUrlsWSValidacion;
                        //identificador de la aplicaicon visor de planes
                        this._idAplicacion = this.config.idAplicacion;
                        this._metodoValidacion = this.configgetValidarUsuario;
                        //metodo de obtener permisos asociados a un usuario
                        this._metodoRecuperarPermisos = this.config.getPermisosUsuario;
                        //Definicion del servicio de validacion con el proxy
                        this._servicioValidacion = this.config.configGlobal.proxy + this._servicioValidacion;
                        this._metodoGetPermisosPefil = this.config.getPermisosPerfil;
                        //Definicion de parametros
                        this.parametrosUsuario = "<nomuser>" + result.usuario + "</nomuser><clave>" + result.password + "</clave>";
                       //var soapRequest = new eptisati.soapRequest();
                        //soapRequest.setMetodo(this._metodoGetUrlsWSValidacion);
                        var peticionSoap = esto.crearRequest(null,this._metodoGetUrlsWSValidacion);
                        //Hacemos la consulta a la base de datos para obtener el listado de servicios de validacion
						request.post(this._servicioWebGIS,{
						data:peticionSoap,
						handleAs: "xml"
						}).then(function(response){
						esto.obtenerServicioValidacion(response)
						},function(err){esto.processError(err)});
                }
                else {
					alert("Introduzca  usuario o contrase&ntilde;a") 
                }
            }

            catch (error) {

                this.showAceptarDialog(true, "Usuario o contraseña incorrecto", "");
                dojo.publish("hidedialogEvent", ["CustomDialog", this, "false"]); //Indicamos que no se va a cerrar la ventana
                console.error("ValidationWidget::obtenerServicioValidacion", error);
            }

        }

    });
});
