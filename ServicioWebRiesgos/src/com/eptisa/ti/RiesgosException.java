package com.eptisa.ti;
//********************************************************
//Clase que se extiende de la exception general y se le a�ade un nuevo atributo
//function que es el nombre de la funcion donde se ha generado el error
//********************************************************
public class RiesgosException extends Exception {

	private static final long serialVersionUID = 1L;

	private String funcion;

	public String getFuncion() {
		return funcion;
	}
	public void setFuncion(String funcion) {
		this.funcion= funcion;
	}
	public RiesgosException(String msg) {
		super(msg);
	}

}



