--------------------------------------------------------
-- Archivo creado  - jueves-noviembre-17-2022   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for View VIEW_TIPOLOGIA_ELEMENTOVULNERABLEP
--------------------------------------------------------

  CREATE OR REPLACE FORCE EDITIONABLE VIEW "RIESGOS"."VIEW_TIPOLOGIA_ELEMENTOVULNERABLEP" ("OBJECTID", "SHAPE", "SE_ANNO_CAD_DATA", "ID_ELEMENTOVULNERABLEP", "ID_PLANDIRECTOR", "NOMBRE", "DESCRIPCION", "DIRTIPO", "DIRNOMBRE", "DIRNUMERO", "DIRCALIFICADOR", "DIRPOBLACION", "DISTRITO", "FECHAINI", "FECHAFIN", "UTMX", "UTMY", "AFORO", "TELCONTACTO", "CLASE", "CATEGORIA", "SUBCATEGORIA") AS 
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
    clase.clase,
    categoria.categoria,
    subcategoria.subcategoria
FROM
    elementovulnerablep,
    tipologia,
    clase,
    categoria,
    subcategoria
WHERE
    elementovulnerablep.id_elementovulnerablep = tipologia.id_elementovulnerablep
    AND
    tipologia.id_clase = clase.id_clase
    AND
    (tipologia.id_categoria = categoria.id_categoria OR tipologia.id_categoria = null)
    AND
    (tipologia.id_subcategoria = subcategoria.id_subcategoria OR tipologia.id_subcategoria = null)
    AND
    elementovulnerablep.borrado != 1
;
