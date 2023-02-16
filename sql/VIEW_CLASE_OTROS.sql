--------------------------------------------------------
-- Archivo creado  - martes-febrero-07-2023   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for View VIEW_CLASE_OTROS
--------------------------------------------------------

  CREATE OR REPLACE FORCE EDITIONABLE VIEW "RIESGOS"."VIEW_CLASE_OTROS" ("OBJECTID", "SHAPE", "SE_ANNO_CAD_DATA", "ID_ELEMENTOVULNERABLEP", "ID_PLANDIRECTOR", "NOMBRE", "DESCRIPCION", "DIRTIPO", "DIRNOMBRE", "DIRNUMERO", "DIRCALIFICADOR", "DIRPOBLACION", "DISTRITO", "FECHAINI", "FECHAFIN", "UTMX", "UTMY", "AFORO", "TELCONTACTO", "BORRADO") AS 
  select "OBJECTID","SHAPE","SE_ANNO_CAD_DATA","ID_ELEMENTOVULNERABLEP","ID_PLANDIRECTOR","NOMBRE","DESCRIPCION","DIRTIPO","DIRNOMBRE","DIRNUMERO","DIRCALIFICADOR","DIRPOBLACION","DISTRITO","FECHAINI","FECHAFIN","UTMX","UTMY","AFORO","TELCONTACTO","BORRADO" from elementovulnerablep where id_elementovulnerablep in (select id_elementovulnerablep from tipologia where id_clase = 6)
;
