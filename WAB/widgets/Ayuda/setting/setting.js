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
      this.textTitulo.value = config.titulo;
	  this.textSubtitulo.value = config.subtitulo;
	  this.textVersion.value = config.version;
	  this.textFecha.value = config.fecha;
	  this.textTituloAyuda.value = config.tituloAyuda;
	  this.textTituloVersion.value = config.tituloVersion;
    },
 
    getConfig: function(){
      //WAB will get config object through this method
      return {
        Titulo: this.textTitulo.value,
		Subtitulo: this.textSubtitulo.value,
		Version: this.textVersion.value,
		Fecha: this.textFecha.value,
		TituloAyuda: this.textTituloAyuda.value,
		TituloVersion: this.textTituloVersion.value
      };
    }
  });
});