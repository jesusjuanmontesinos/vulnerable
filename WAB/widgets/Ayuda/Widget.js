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

define(['dojo/_base/declare', 'dojo/html', 'jimu/BaseWidget'],
function(declare, html, BaseWidget,) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    // DemoWidget code goes here
	
    startup: function() {
		debugger;
    var domain = window.location.protocol + "//" + window.location.host;
		var htmlIn = '<div style="text-align: center; width: 250px; height: 300px; border: 0 none; padding:10px">'
		//+'<img src="widgets/Ayuda/images/logoAytoMadrid.png" alt="Logo Ayuntamiento">'
        +'<div id="imgAyto"></div><div id="AyudaDialogMsgDiv" style="margin-top:10px; margin-bottom:15px"><h2 id="titulo">'+this.config.Titulo+'</h2>'
           +'<p class="textoAyuda" id="subtitulo">'+this.config.Subtitulo+'</p>'
           +'<hr width="80%" />'
           +'<p class="textoAyuda" id="version">'+this.config.Version+'</p>'
           +'<p class="textoAyuda" id="fecha">'+this.config.Fecha+'</p>'
           +'<a href="'+ domain + this.config.TituloAyuda+'" id="lnkVersion" target="_blank">Manual de Usuario</a>'
           +'<br>'
           +'<a href="'+ domain +"//"+this.config.TituloVersion+'" id="lnkAyuda" target="_blank" style="display:none">Novedades de esta versión<span style="color: rgb(0, 0, 0);"></span></a>'
        +'</div></div>'
		html.set(dojo.byId("divAyuda"), htmlIn)
		console.log('startup');
    },
  });
});