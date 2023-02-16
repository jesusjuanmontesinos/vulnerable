--------------------------------------------------------
-- Archivo creado  - jueves-noviembre-17-2022   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for View VIEW_FACTOR_ELEMENTOVULNERABLEP
--------------------------------------------------------

  CREATE OR REPLACE FORCE EDITIONABLE VIEW "RIESGOS"."VIEW_FACTOR_ELEMENTOVULNERABLEP" ("OBJECTID", "SHAPE", "SE_ANNO_CAD_DATA", "ID_ELEMENTOVULNERABLEP", "ID_PLANDIRECTOR", "NOMBRE", "DESCRIPCION", "DIRTIPO", "DIRNOMBRE", "DIRNUMERO", "DIRCALIFICADOR", "DIRPOBLACION", "DISTRITO", "FECHAINI", "FECHAFIN", "UTMX", "UTMY", "AFORO", "TELCONTACTO", "TIPOFACTOR") AS 
  SELECT
    elementovulnerablep.objectid,
    elementovulnerablep.shape,
    elementovulnerablep.se_anno_cad_data,
    elementovulnerablep.id_elementovulnerablep,
    elementovulnerablep.id_plandirector,
    elementovulnerablep.nombre,
    elementovulnerablep.descripcion,
    elementovulnerablep.dirtipo,
    elementovulnerablep.dirnombre,
    elementovulnerablep.dirnumero,
    elementovulnerablep.dircalificador,
    elementovulnerablep.dirpoblacion,
    elementovulnerablep.distrito,
    elementovulnerablep.fechaini,
    elementovulnerablep.fechafin,
    elementovulnerablep.utmx,
    elementovulnerablep.utmy,
    elementovulnerablep.aforo,
    elementovulnerablep.telcontacto,
    tipofactor.tipofactor
FROM
    elementovulnerablep,
    factorvulnerabilidad,
    tipofactor
WHERE
elementovulnerablep.id_elementovulnerablep = factorvulnerabilidad.id_elementovulnerablep
and factorvulnerabilidad.id_tipofactor = tipofactor.id_tipofactor
AND elementovulnerablep.borrado != 1
;
