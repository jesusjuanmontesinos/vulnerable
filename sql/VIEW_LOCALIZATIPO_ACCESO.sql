--------------------------------------------------------
-- Archivo creado  - martes-febrero-07-2023   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for View VIEW_LOCALIZATIPO_ACCESO
--------------------------------------------------------

  CREATE OR REPLACE FORCE EDITIONABLE VIEW "RIESGOS"."VIEW_LOCALIZATIPO_ACCESO" ("OBJECTID", "SHAPE", "SE_ANNO_CAD_DATA", "ID_ELEMENTOVULNERABLEP", "ID_PLANDIRECTOR", "NOMBRE", "DESCRIPCION", "DIRTIPO", "DIRNOMBRE", "DIRNUMERO", "DIRCALIFICADOR", "DIRPOBLACION", "DISTRITO", "FECHAINI", "FECHAFIN", "UTMX", "UTMY", "AFORO", "TELCONTACTO", "BORRADO") AS 
  select "OBJECTID","SHAPE","SE_ANNO_CAD_DATA","ID_ELEMENTOVULNERABLEP","ID_PLANDIRECTOR","NOMBRE","DESCRIPCION","DIRTIPO","DIRNOMBRE","DIRNUMERO","DIRCALIFICADOR","DIRPOBLACION","DISTRITO","FECHAINI","FECHAFIN","UTMX","UTMY","AFORO","TELCONTACTO","BORRADO" from elementovulnerablep where id_elementovulnerablep in (select id_elementovulnerablep from localizaciones where id_localizacion in (select id_localizacion from tipado where id_tipo = 2))
;
