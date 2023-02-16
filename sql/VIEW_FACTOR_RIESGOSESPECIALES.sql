--------------------------------------------------------
-- Archivo creado  - mi�rcoles-noviembre-23-2022   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for View VIEW_FACTOR_RIESGOSESPECIALES
--------------------------------------------------------

  CREATE OR REPLACE FORCE EDITIONABLE VIEW "RIESGOS"."VIEW_FACTOR_RIESGOSESPECIALES" ("OBJECTID", "SHAPE", "SE_ANNO_CAD_DATA", "ID_ELEMENTOVULNERABLEP", "ID_PLANDIRECTOR", "NOMBRE", "DESCRIPCION", "DIRTIPO", "DIRNOMBRE", "DIRNUMERO", "DIRCALIFICADOR", "DIRPOBLACION", "DISTRITO", "FECHAINI", "FECHAFIN", "UTMX", "UTMY", "AFORO", "TELCONTACTO", "BORRADO") AS 
  select "OBJECTID","SHAPE","SE_ANNO_CAD_DATA","ID_ELEMENTOVULNERABLEP","ID_PLANDIRECTOR","NOMBRE","DESCRIPCION","DIRTIPO","DIRNOMBRE","DIRNUMERO","DIRCALIFICADOR","DIRPOBLACION","DISTRITO","FECHAINI","FECHAFIN","UTMX","UTMY","AFORO","TELCONTACTO","BORRADO" from elementovulnerablep where id_elementovulnerablep in (select id_elementovulnerablep from factorvulnerabilidad where id_tipofactor = 6)
;
