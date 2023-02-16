package com.eptisa.ti;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Descripcion implements Serializable {
	private static final long serialVersionUID = -5159402296199246678L;
	private int id;
	private String descripcion;
}
