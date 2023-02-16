package com.eptisa.ti.interfaces;

import com.eptisa.ti.Descripcion;

public interface IServicioWebRiesgos {

	Descripcion[] getDistritos();
	Descripcion[] getTipoRiesgo();
	Descripcion[] getTiposFactor();
	Descripcion[] getFactor();
	Descripcion[] getCategoria(String idFactor);
	Descripcion[] getSubcategoria(String idCategoria);
	Descripcion[] getFactoresPorId(int[]idFactores);
	Descripcion[] getCategoriasPorId(int[]idCategorias);
	Descripcion[] getSubcategoriasPorId(int[]idSubcategorias);
	Descripcion[] getTiposFactoresXId(int[] idTipo);
	Descripcion[] getElementosVulnerables();
	Descripcion[] getLocalizaciones(int id_elemenetoVulnerable);
	Descripcion[] getTiposLocalizaciones();
	Descripcion[] getTiposDocumento();
	Descripcion[] getDocumentosVulnerables(int tipoDocumento);
	int getMaxIdFactorVulnerabilidad();
	int getMaxIdTipologia();
	int getMaxIdDocumentoPlanDirector();
	int getMaxIdDocumentoVulnerable();
	int getMaxIdDocumentoLocalizacion();
	int getNextVal(String tabla);
}
