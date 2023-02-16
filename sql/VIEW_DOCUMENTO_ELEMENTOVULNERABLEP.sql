--------------------------------------------------------
-- Archivo creado  - martes-febrero-07-2023   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for View VIEW_DOCUMENTO_ELEMENTOVULNERABLEP
--------------------------------------------------------

  CREATE OR REPLACE FORCE EDITIONABLE VIEW "RIESGOS"."VIEW_DOCUMENTO_ELEMENTOVULNERABLEP" ("OBJECTID", "ID_ELEMENTOVULNERABLEP", "SHAPE", "ID_PLANDIRECTOR", "NOMBRE", "DESCRIPCION", "DIRTIPO", "DIRNOMBRE", "DIRNUMERO", "DIRCALIFICADOR", "DIRPOBLACION", "DISTRITO", "FECHAINI", "FECHAFIN", "UTMX", "UTMY", "AFORO", "TELCONTACTO", "ID_TIPODOCUMENTO", "NOMBREDOC", "DESCRIPCIONDOC", "ENLACE", "NOMBRETIPO") AS 
  SELECT 
    elementovulnerablep.objectid,
    elementovulnerablep.id_elementovulnerablep as ID_ELEMENTOVULNERABLEP,
    elementovulnerablep.shape,
    elementovulnerablep.id_plandirector,
    elementovulnerablep.nombre as nombre,
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
    documentos.id_tipodocumento,
    documentos.nombre as nombredocumento,
    documentos.descripcion as descripciondocumento,
    documentos.enlace,
    tipodocumento.nombre as nombreTipoDocumento
  FROM 
    elementovulnerablep,
       documentosvulnerable,
       documentos,
       tipodocumento
  WHERE  
    elementovulnerablep.id_elementovulnerablep = documentosvulnerable.id_elementovulnerablep
    AND 
    documentosvulnerable.id_documento = documentos.id_documento
    AND
    documentos.id_tipodocumento = tipodocumento.id_tipodocumento
    AND 
    elementovulnerablep.borrado =0
;
  GRANT SELECT ON "RIESGOS"."VIEW_DOCUMENTO_ELEMENTOVULNERABLEP" TO "SDE";
