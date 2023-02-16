define([
  'dojo/_base/declare',
  'jimu/BaseWidgetSetting'
],
function(declare, BaseWidgetSetting) {
 
  return declare([BaseWidgetSetting], {
    baseClass: 'jimu-widget-demo-setting',
 
    postCreate: function(){
      //the config object is passed in
	  debugger;
      this.setConfig(this.config);
    },
 
    setConfig: function(config){
      this.textOrganizacionrecursos.value = config.OrganizacionRecursos;
	  this.textImagenVehiculo.value = config.ImagenVehiculo;
	  this.textNombre.value = config.Nombre;
	  this.textRecurso.value = config.Recurso;
    },
 
    getConfig: function(){
      //WAB will get config object through this method
      return {
        OrganizacionRecursos: this.textOrganizacionrecursos.value,
		ImagenVehiculo: this.textImagenVehiculo.value,
		Nombre: this.textNombre.value,
		Recurso: this.textRecurso.value,
		url_recurso:"https://dgegisprepcc.emergencias.madrid.es:8443/visorplanes/proxy/proxy.jsp?https://natlante.emergencias.madrid.es/emergencias/services/ServicioRecuperarRecursos",
		url_recursoInter:"https://dgegisprepcc.emergencias.madrid.es:8443/visorplanes/proxy/proxy.jsp?https://natlante.emergencias.madrid.es/ServicioWebGIS/services/ServicioWebGIS",
		TipoVehiculoAExcluir:"APIE",
		ClasePortatiles: "APIE",
		VehiculosDisponibles:"recuperarRecursosConFiltro",
		VehiculosSamurDisponibles: "recuperarRecursosConFiltro",
		VehiculosBomberosDisponibles: "recuperarRecursosConFiltro",
		PortatilesDisponibles: "recuperarRecursosConFiltro",
		EstadoVehiculo:"getEstadoVehiculo",
		TagNameRecuperarEstadoVehiculo:"getEstadoVehiculoResponse",
		TagNamerecuperarRecursosConFiltro: "recuperarRecursosConFiltroResponse",
		CampoCodigoVehiculo:"codigorecurso",
		CampoOrganizacionRecurso:"organizacionrecurso",
		CampoUltimoMovimiento:"ultimomomento",
		CampoUltimaLongitud:"ultimalongitud",
		CampoUltimaLatitud: "ultimalatitud",
		CampoClaseVehiculo:"claserecurso",
		CampoEstadoVehiculo:"estado",
		CampoNombreHospital:"hospital",
		CampoXHospital:"xutmetrs89hospital",
		CampoYHospital:"yutmetrs89hospital",
		CampoXIntervencion:"xutmetrs89intervencion",
		CampoYIntervencion:"yutmetrs89intervencion",
		ImagenEstela:"/Vehiculos/estela.png",
		VehiculosSamurEnIntervencion: "getVehiculosSamurEnIntervencion",
		VehiculosBomberosEnIntervencion: "getVehiculosBomberosEnIntervencion",
		VehiculosSamurEnCuadrante:"getVehiculosCuadrante",
		TagNamegetVehiculosSamurEnIntervencion: "getVehiculosSamurEnIntervencionResponse",
		TagNamegetVehiculosBomberosEnIntervencion: "getVehiculosBomberosEnIntervencionResponse",
		TagNamegetVehiculosEnCuadrante: "getVehiculosCuadranteResponse",
		CapaIntervencionesEnCurso: "Intervenciones en Curso",
		CapaSamur:0,
		CapaBomberos:1,
		urlLeyendaBomberos:"widgets/Posicionamiento_Intervencion/images/Bomberos/Leyenda.png",
        urlLeyendaSamur:"widgets/Posicionamiento_Intervencion/images/Samur/Leyenda.png",
		Etiquetas:
		{
			Samur:
			{
			FondoEstado1: "widgets/Posicionamiento_Intervencion/images/Samur/Estado1.png",
			ColorTexto1: [255,255,255],
			FondoEstado2: "widgets/Posicionamiento_Intervencion/images/Samur/Estado2.png",
			ColorTexto2: [255,255,255],
			FondoEstado3: "widgets/Posicionamiento_Intervencion/images/Samur/Estado3.png",
			ColorTexto3: [0,0,0],
			FondoEstado4: "widgets/Posicionamiento_Intervencion/images/Samur/Estado4.png",
			ColorTexto4: [0,0,0],
			FondoEstado5: "widgets/Posicionamiento_Intervencion/images/Samur/Estado5.png",
			ColorTexto5: [0,0,0],
			FondoEstado6: "widgets/Posicionamiento_Intervencion/images/Samur/Estado6.png",
			ColorTexto6: [255,214,0],
			FondoSinEstado:"widgets/Posicionamiento_Intervencion/images/Samur/SinEstado.png",
			ColorSinEstado: [0,0,0]
			},
			Bomberos:
			{
			FondoEstado1: "widgets/Posicionamiento_Intervencion/images/Bomberos/Estado1.png",
			ColorTexto1: [0,0,0],
			FondoEstado2: "widgets/Posicionamiento_Intervencion/images/Bomberos/Estado1.png",
			ColorTexto2: [0,0,0],
			FondoEstado3: "widgets/Posicionamiento_Intervencion/images/Bomberos/Estado2.png",
			ColorTexto3: [255,255,255],
			FondoEstado4: "widgets/Posicionamiento_Intervencion/images/Bomberos/Estado3.png",
			ColorTexto4: [255,255,255],
			FondoEstado5: "widgets/Posicionamiento_Intervencion/images/Bomberos/Estado4.png",
			ColorTexto5: [0,0,0],
			FondoSinEstado:"widgets/Posicionamiento_Intervencion/images/Bomberos/SinEstado.png",
			ColorSinEstado: [0,0,0]
			}
		}	
      };
    }
  });
});