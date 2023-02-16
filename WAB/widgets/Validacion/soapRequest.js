dojo.provide("eptisati.soapRequest");
dojo.declare(
	"eptisati.soapRequest",
	[],
	{
	    constructor: function (/*Object*/params) {
	    },
	    metodo: null,
	    parametros: null,
	    getMetodo: function () {
	        return this.metodo;
	    },
	    setMetodo: function (value) {
	        this.metodo = value;
	    },
	    getParametros: function () {
	        return this.parametros;
	    },
	    setParametros: function (value) {
	        this.parametros = value;
	    },
	    crearRequest: function () {
	        var soapRequest = "";
	        if (this.parametros != null) {
	            soapRequest = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' > <soapenv:Header><Access-Control-Allow-Origin>*</Access-Control-Allow-Origin></soapenv:Header> <soapenv:Body>" +
                "<" + this.metodo + "> " + this.parametros + " </" + this.metodo + "></soapenv:Body></soapenv:Envelope>";
	        }
	        else {
	            soapRequest = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' ><soapenv:Header><Access-Control-Allow-Origin>*</Access-Control-Allow-Origin></soapenv:Header> <soapenv:Body>" +
                "<" + this.metodo + "/></soapenv:Body></soapenv:Envelope>";
	        }
	        
	        return soapRequest;
	    }

	}
);

