# -*- coding: utf-8 -*-
import re
import os
import arcserver #para que tire de la licencia al invocar arcpy
import arcpy
#from arcpy import env

sdeFileOrigen = r"BDDGE_DGE_RIESGOS.sde"
sdeFileDestino = r"DGEORACC_POSPRE19_RIESGOS.sde"

class Tipologia:
    def __init__(self, clase, categoria, subcategoria, elementoVulnerableId, oldUsoLugarCod):
        self.clase = clase
        self.categoria = categoria
        self.subcategoria = subcategoria
        self.elementoVulnerableId = elementoVulnerableId
        self.oldUsoLugarCod = oldUsoLugarCod

class DocVulnerabilidad:
    def __init__(self, nombre, documento, elementoVulnerableId, oldTipoRiesgo, newTipoDoc):
        self.nombre = nombre
        self.documento = documento
        self.elementoVulnerableId = elementoVulnerableId
        self.oldTipoRiesgo = oldTipoRiesgo
        self.newTipoDoc = newTipoDoc

class FactorVulnerabilidad:
    def __init__(self, tipoFactorId, elementoVulnerableId, descripcion):
        self.tipoFactorId = tipoFactorId
        self.elementoVulnerableId = elementoVulnerableId
        self.descripcion = descripcion

try:
    print('Empezamos a leer datos del origen: ' + sdeFileOrigen);
    tipologias = [];
    documentosEV = [];
    factorVulnerabilidades = [];

    print('Vamos al SearchCursor');
    with arcpy.da.SearchCursor(sdeFileOrigen+'/RAM', "*") as cur:
          for row in cur:
            print('Procesamos la fila: ');
            print(row);
            doc = row[11];
            tipoRiesgo = row[7];
            if doc: 
                print('Tiene un documento asociado y es de tipo riesgo: ' + str(tipoRiesgo));
                #print('El doc es: ' + str(doc));
                print('Vamos a ver tipo de riesgo');
                if tipoRiesgo == 10 or tipoRiesgo == 9: #Preplan
                    documentosEV.append(DocVulnerabilidad( row[1], doc, row[0], row[7], 1));
                elif tipoRiesgo == 11: #Plan de distrito
                    documentosEV.append(DocVulnerabilidad( row[1], doc, row[0], row[7], 2));
                elif tipoRiesgo == 12:  #Simulacro
                    documentosEV.append(DocVulnerabilidad( row[1], doc, row[0], row[7], 4));
                elif tipoRiesgo == 15: #DPI
                    documentosEV.append(DocVulnerabilidad( row[1], doc, row[0], row[7], 5));
                else:
                    documentosEV.append(DocVulnerabilidad( row[1], doc, row[0], row[7], 6));

            usoLugarCod = row[8];
            print('Vamos a ver Uso lugar: ' + str(usoLugarCod));

            if usoLugarCod == 1:
                tipologias.append(Tipologia(2, 13, 6, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(2, row[0], "Infraestructuras y medios de transporte"))
            elif usoLugarCod == 2:
                tipologias.append(Tipologia(2, 12, 5, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(2, row[0], "Infraestructuras y medios de transporte"))
            elif usoLugarCod == 3:
                tipologias.append(Tipologia(3, 24, 37, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 4:
                tipologias.append(Tipologia(1, 10, 4, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(1, row[0], "Redes de suministro y servicios básicos"))
            elif usoLugarCod == 5:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 6:
                tipologias.append(Tipologia(2, 14, 10, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(2, row[0], "Infraestructuras y medios de transporte"))
            elif usoLugarCod == 7:
                tipologias.append(Tipologia(2, 14, 9, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(2, row[0], "Infraestructuras y medios de transporte"))
            elif usoLugarCod == 8:
                tipologias.append(Tipologia(2, 14, 10, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(2, row[0], "Infraestructuras y medios de transporte"))
            elif usoLugarCod == 9:
                tipologias.append(Tipologia(1, 6, 3, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(1, row[0], "Redes de suministro y servicios básicos"))
            elif usoLugarCod == 10:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 11:
                tipologias.append(Tipologia(3, 19, 17, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 12:
                tipologias.append(Tipologia(3, 24, 41, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 13:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 14:
                tipologias.append(Tipologia(3, 19, 17, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 15:
                tipologias.append(Tipologia(3, 18, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 16:
                tipologias.append(Tipologia(3, 21, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 17:
                tipologias.append(Tipologia(3, 24, 38, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 18:
                tipologias.append(Tipologia(3, 24, 38, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 19:
                tipologias.append(Tipologia(3, 24, 37, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 20:
                tipologias.append(Tipologia(3, 24, 39, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 21:
                tipologias.append(Tipologia(3, 24, 37, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 22:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 23:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 24:
                tipologias.append(Tipologia(3, 17, 11, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 26:
                tipologias.append(Tipologia(3, 24, 40, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 27:
                tipologias.append(Tipologia(3, 24, 41, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 28:
                tipologias.append(Tipologia(3, 24, 42, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 29:
                tipologias.append(Tipologia(3, 20, 22, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 30:
                tipologias.append(Tipologia(3, 18, 13, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 31:
                tipologias.append(Tipologia(3, 19, 19, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 32:
                tipologias.append(Tipologia(3, 18, 14, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 34:
                tipologias.append(Tipologia(3, 24, 43, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 35:
                tipologias.append(Tipologia(3, 25, 47, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 36:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 38:
                tipologias.append(Tipologia(3, 24, 37, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 39:
                tipologias.append(Tipologia(3, 20, 23, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 40:
                tipologias.append(Tipologia(3, 19, 17, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 41:
                tipologias.append(Tipologia(3, 24, 37, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 42:
                tipologias.append(Tipologia(3, 24, 41, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 43:
                tipologias.append(Tipologia(3, 24, 43, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 44:
                tipologias.append(Tipologia(3, 24, 41, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 45:
                tipologias.append(Tipologia(3, 24, 43, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 46:
                tipologias.append(Tipologia(4, 27, 49, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(9, row[0], "Entorno natural y al exterior"))
            elif usoLugarCod == 47:
                tipologias.append(Tipologia(3, 24, 37, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 48:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 49:
                tipologias.append(Tipologia(3, 24, 41, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 50:
                tipologias.append(Tipologia(3, 24, 43, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 52:
                tipologias.append(Tipologia(3, 20, 24, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 53:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 54:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 55:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 56:
                tipologias.append(Tipologia(3, 18, 12, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 57:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 58:
                tipologias.append(Tipologia(3, 25, 47, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 59:
                tipologias.append(Tipologia(3, 22, 69, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 60:
                tipologias.append(Tipologia(3, 23, 35, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 61:
                tipologias.append(Tipologia(2, 13, 7, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(2, row[0], "Infraestructuras y medios de transporte"))
            elif usoLugarCod == 62:
                tipologias.append(Tipologia(3, 19, 20, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 63:
                tipologias.append(Tipologia(3, 19, 66, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 64:
                tipologias.append(Tipologia(1, 3, 2, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(1, row[0], "Redes de suministro y servicios básicos"))
            elif usoLugarCod == 65:
                tipologias.append(Tipologia(3, 20, 25, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 66:
                tipologias.append(Tipologia(2, 13, 6, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(2, row[0], "Infraestructuras y medios de transporte"))
            elif usoLugarCod == 67:
                tipologias.append(Tipologia(2, 14, 10, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(2, row[0], "Infraestructuras y medios de transporte"))
            elif usoLugarCod == 68:
                tipologias.append(Tipologia(3, 23, 35, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 69:
                tipologias.append(Tipologia(3, 22, 69, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 70:
                tipologias.append(Tipologia(3, 24, 45, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 71:
                tipologias.append(Tipologia(3, 24, 45, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 72:
                tipologias.append(Tipologia(3, 20, 26, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 73:
                tipologias.append(Tipologia(3, 21, 28, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 74:
                tipologias.append(Tipologia(3, 24, 45, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 75:
                tipologias.append(Tipologia(3, 19, 19, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 76:
                tipologias.append(Tipologia(3, 24, 46, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 77:
                tipologias.append(Tipologia(3, 19, 17, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 78:
                tipologias.append(Tipologia(4, 27, 49, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(9, row[0], "Entornos naturales y espacios al exterior"))
            elif usoLugarCod == 79:
                tipologias.append(Tipologia(3, 20, 25, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 80:
                tipologias.append(Tipologia(3, 20, 27, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 81:
                tipologias.append(Tipologia(2, 13, 8, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(2, row[0], "Infraestructuras y medios de transporte"))
            elif usoLugarCod == 82:
                tipologias.append(Tipologia(1, 1, 1, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(1, row[0], "Redes de suministro y servicios básicos"))
            elif usoLugarCod == 83:
                tipologias.append(Tipologia(3, 24, 43, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 84:
                tipologias.append(Tipologia(3, 21, 29, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 85:
                tipologias.append(Tipologia(3, 18, 15, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 86:
                tipologias.append(Tipologia(3, 22, 33, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 87:
                tipologias.append(Tipologia(3, 22, 32, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 88:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 89:
                tipologias.append(Tipologia(3, 22, 34, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 90:
                tipologias.append(Tipologia(6, None, None, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 91:
                tipologias.append(Tipologia(3, 21, 30, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 92:
                tipologias.append(Tipologia(3, 18, 16, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 93:
                tipologias.append(Tipologia(3, 21, 31, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 94:
                tipologias.append(Tipologia(3, 22, 69, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 95:
                tipologias.append(Tipologia(2, 13, 6, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(2, row[0], "Infraestructuras y medios de transporte"))
            elif usoLugarCod == 96:
                tipologias.append(Tipologia(3, 17, 11, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 97:
                tipologias.append(Tipologia(3, 19, 21, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 98:
                tipologias.append(Tipologia(3, 25, 48, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 99:
                tipologias.append(Tipologia(3, 24, 44, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 100:
                tipologias.append(Tipologia(3, 22, 32, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 101:
                tipologias.append(Tipologia(3, 24, 37, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 102:
                tipologias.append(Tipologia(3, 24, 43, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 103:
                tipologias.append(Tipologia(3, 19, 17, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 104:
                tipologias.append(Tipologia(3, 23, 36, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 105:
                tipologias.append(Tipologia(3, 24, 39, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))
            elif usoLugarCod == 106:
                tipologias.append(Tipologia(3, 22, 34, row[0], usoLugarCod));
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividad/Uso sensible"))

            print('Tipo riesgo: ' + str(tipoRiesgo));

            if  tipoRiesgo == 1:
                factorVulnerabilidades.append(FactorVulnerabilidad(7, row[0], "Actividades"))
            elif tipoRiesgo == 3:
                factorVulnerabilidades.append(FactorVulnerabilidad(3, row[0], "Aforo"))
            elif tipoRiesgo == 4:
                factorVulnerabilidades.append(FactorVulnerabilidad(6, row[0], "Riesgos intrínsecos"))
            elif tipoRiesgo == 9:
                factorVulnerabilidades.append(FactorVulnerabilidad(4, row[0], "EGA (Edificio gran altura)"))
            elif tipoRiesgo == 13:
                factorVulnerabilidades.append(FactorVulnerabilidad(4, row[0], "EGA (25 a 50 metros)"))


    print('Vamos al InsertCursor en el destino: ' + sdeFileDestino);

    count = 0;

    fieldsDocumentos = ['ID_DOCUMENTO', 'ID_TIPODOCUMENTO', 'NOMBRE', 'ENLACE'];
    cursor = arcpy.da.InsertCursor(sdeFileDestino + '/Documentos', fieldsDocumentos)
    print('Vamos a por los documentos');
    print('Primero registramos los documentos');
    for doc in documentosEV:
        print('El id del EV es: ' + str(doc.elementoVulnerableId));
        #print('El nombre es: ' + doc.nombre);
        cursor.insertRow((count, doc.newTipoDoc, doc.nombre, doc.documento))
        count+=1;
    del cursor;
    print('hemos insertado: ' + str(count));

    count = 0;
    print(r'Los relacionamos con el EV');
    fieldDocsVulnerable = ['ID_DOCVUL', 'ID_DOCUMENTO', 'ID_ELEMENTOVULNERABLEP'];
    cursor = arcpy.da.InsertCursor(sdeFileDestino + '/DocumentosVulnerable', fieldDocsVulnerable)
    for doc in documentosEV:
        cursor.insertRow((count, count, doc.elementoVulnerableId))
        count+=1;
    del cursor;
    print('hemos insertado: ' + str(count));

    count = 0;

    fieldsClasesVulnerabilidad = ['ID_TIPOLOGIA', 'ID_CLASE', 'ID_ELEMENTOVULNERABLEP', 'ID_CATEGORIA', 'ID_SUBCATEGORIA'];
    cursor = arcpy.da.InsertCursor(sdeFileDestino + '/Tipologia', fieldsClasesVulnerabilidad)
    print('Vamos a por los usos lugar => clases de Tipologia');
    for vul in tipologias:
        cursor.insertRow((count, vul.clase, vul.elementoVulnerableId, vul.categoria, vul.subcategoria))
        count+=1;
    del cursor;
    print('hemos insertado: ' + str(count));

    count = 0;

    fieldsFactorVulnerabilidad = ['ID_FACTORVULNERABILIDAD', 'ID_TIPOFACTOR', 'ID_ELEMENTOVULNERABLEP', 'DESCRIPCION']
    cursor = arcpy.da.InsertCursor(sdeFileDestino + '/FactorVulnerabilidad', fieldsFactorVulnerabilidad)
    print('Vamos a por tipos de riesgos => clases de FactorVulnerabilidad');
    for factor in factorVulnerabilidades:
        cursor.insertRow((count, factor.tipoFactorId, factor.elementoVulnerableId, factor.descripcion))
        count+=1;
    del cursor;
    print('hemos insertado: ' + str(count));

    print('Finalizado importando valores');

except:
    e = sys.exc_info()[1]
    print(e.args[0])


