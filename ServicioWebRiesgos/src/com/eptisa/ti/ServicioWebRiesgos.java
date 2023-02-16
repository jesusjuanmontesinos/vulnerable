package com.eptisa.ti;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.naming.InitialContext;
import javax.sql.DataSource;

import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

import com.eptisa.ti.interfaces.IServicioWebRiesgos;


public class ServicioWebRiesgos implements IServicioWebRiesgos {

	protected final String RUTA_FICHERO_LOG4J_PROPIEDADES = "/com/eptisa/ti/Log4j.properties";
	protected final String RUTA_FICHERO_PROPIEDADES = "/com/eptisa/ti/Propiedades.properties";
	protected final String RUTA_FICHERO_PROPIEDADES_SQL = "/com/eptisa/ti/Sql.properties";
	protected static final String ELEMENTO_VULNERABLE_P = "ELEMENTOVULNERABLEP";
	protected static final String ELEMENTO_VULNERABLE_A = "ELEMENTOVULNERABLEA";
	protected static final String LOCALIZACIONES = "LOCALIZACIONES";
	protected static final String PLAN_DIRECTOR = "PLANDIRECTOR";
	protected static final String DOCUMENTOS = "DOCUMENTOS";
	protected static final String DOCUMENTOS_VULNERABLE = "DOCUMENTOSVULNERABLE";
	protected static final String DOCUMENTOS_LOCALIZACION = "DOCUMENTOSLOCALIZACION";
	protected static final String DOCUMENTOS_PLAN = "DOCUMENTOSPLAN";
	protected static final String FACTOR_VULNERABILIDAD = "FACTORVULNERABILIDAD";
	protected static final String TIPADO = "TIPADO";
	protected static final String TIPOLOGIA = "TIPOLOGIA";
	protected Logger log;
	protected Properties propiedades;
	protected Connection conexionBD;
	protected String dataSourceRiesgos;


	public ServicioWebRiesgos() throws IOException {
		InputStream inputStream = getClass().getResourceAsStream(this.RUTA_FICHERO_LOG4J_PROPIEDADES);
		Properties logProperties = new Properties();
		logProperties.load(inputStream);
		PropertyConfigurator.configure(logProperties);
		this.log = Logger.getLogger(ServicioWebRiesgos.class);
		this.propiedades = new Properties();
		inputStream = getClass().getResourceAsStream(this.RUTA_FICHERO_PROPIEDADES);

		try {
			this.propiedades.load(inputStream);
			this.dataSourceRiesgos = this.propiedades.getProperty("DATASOURCE_RIESGOS");
		} catch (Exception e) {
			this.log.error("Se ha producido un error al intentar leer el fichero de propiedades: " + this.RUTA_FICHERO_PROPIEDADES);
			this.log.error("Error:", e);
		}
	}

	@Override
	public int getMaxIdTipologia() {
		int total = -1;

		String sql = getQuery("sql.buscar.idMaxTipologia");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {
			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();
				rs.next();
				total = Integer.parseInt(rs.getString("ID"));
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return total;
	}

	@Override
	public int getMaxIdFactorVulnerabilidad() {
		int total = -1;

		String sql = getQuery("sql.buscar.idMaxFactorVulneravilidad");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {
			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();
				rs.next();
				total = Integer.parseInt(rs.getString("ID"));
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return total;
	}

	@Override
	public Descripcion[] getDistritos() {

		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.distritos");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();

				while (rs.next()) {
					Descripcion descripcion=new Descripcion();
					descripcion.setId(rs.getInt("ID_DISTRITO"));
					descripcion.setDescripcion(rs.getString("DISTRITO"));
					lista.add(descripcion);
				}
			}

		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}

		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getTipoRiesgo() {

		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.tipoRiesgos");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();

				while (rs.next()) {
					Descripcion descripcion=new Descripcion();
					descripcion.setId(rs.getInt("ID_TIPORIESGO"));
					descripcion.setDescripcion(rs.getString("TIPORIESGO"));
					lista.add(descripcion);
				}
			}

		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}

		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getTiposFactor() {

		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.tiposFactor");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();

				while (rs.next()) {
					Descripcion descripcion=new Descripcion();
					descripcion.setId(rs.getInt("ID_TIPOFACTOR"));
					descripcion.setDescripcion(rs.getString("TIPOFACTOR"));
					lista.add(descripcion);
				}
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return lista.toArray(new Descripcion[lista.size()]);
	}


	@Override
	public Descripcion[] getFactor() {

		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.clase");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();

				while (rs.next()) {
					Descripcion descripcion=new Descripcion();
					descripcion.setId(rs.getInt("ID_CLASE"));
					descripcion.setDescripcion(rs.getString("CLASE"));
					lista.add(descripcion);
				}
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getCategoria(String idClase) {

		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.categoria");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				expr.setInt(1, Integer.parseInt(idClase));
				ResultSet rs = expr.executeQuery();

				while (rs.next()) {
					Descripcion descripcion=new Descripcion();
					descripcion.setId(rs.getInt("ID_CATEGORIA"));
					descripcion.setDescripcion(rs.getString("CATEGORIA"));
					lista.add(descripcion);
				}
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}

		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getSubcategoria(String idCategoria) {
		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.subcategoria");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				expr.setInt(1, Integer.parseInt(idCategoria));
				ResultSet rs = expr.executeQuery();

				while (rs.next()) {
					Descripcion descripcion=new Descripcion();
					descripcion.setId(rs.getInt("ID_SUBCATEGORIA"));
					descripcion.setDescripcion(rs.getString("SUBCATEGORIA"));
					lista.add(descripcion);
				}
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}

		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getFactoresPorId(int[] idFactores) {
		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.id_clase");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				for (int i = 0; i < idFactores.length; i++) {
					PreparedStatement expr = this.conexionBD.prepareStatement(sql);
					expr.setInt(1, idFactores[i]);
					ResultSet rs = expr.executeQuery();

					while (rs.next()) {
						Descripcion descripcion=new Descripcion();
						descripcion.setId(rs.getInt("ID_CLASE"));
						descripcion.setDescripcion(rs.getString("CLASE"));
						lista.add(descripcion);
					}
				}
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}

		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getCategoriasPorId(int[] idCategorias) {
		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.id_categoria");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				for (int i = 0; i < idCategorias.length; i++) {
					PreparedStatement expr = this.conexionBD.prepareStatement(sql);
					expr.setInt(1, idCategorias[i]);
					ResultSet rs = expr.executeQuery();

					while (rs.next()) {
						Descripcion descripcion=new Descripcion();
						descripcion.setId(rs.getInt("ID_CATEGORIA"));
						descripcion.setDescripcion(rs.getString("CATEGORIA"));
						lista.add(descripcion);
					}
				}
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getSubcategoriasPorId(int[] idSubcategorias) {
		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.id_subcategoria");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				for (int i = 0; i < idSubcategorias.length; i++) {
					PreparedStatement expr = this.conexionBD.prepareStatement(sql);
					expr.setInt(1, idSubcategorias[i]);
					ResultSet rs = expr.executeQuery();

					while (rs.next()) {
						Descripcion descripcion=new Descripcion();
						descripcion.setId(rs.getInt("ID_SUBCATEGORIA"));
						descripcion.setDescripcion(rs.getString("SUBCATEGORIA"));
						lista.add(descripcion);
					}
				}
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getTiposFactoresXId(int[] idTipo) {
		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.tipoFactor");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				for (int i = 0; i < idTipo.length; i++) {
					PreparedStatement expr = this.conexionBD.prepareStatement(sql);
					expr.setInt(1, idTipo[i]);
					ResultSet rs = expr.executeQuery();

					while (rs.next()) {
						Descripcion descripcion=new Descripcion();
						descripcion.setId(rs.getInt("ID_TIPOFACTOR"));
						descripcion.setDescripcion(rs.getString("TIPOFACTOR"));
						lista.add(descripcion);
					}
				}
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getElementosVulnerables() {
		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.elementosVul");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();

				while (rs.next()) {
					Descripcion descripcion=new Descripcion();
					descripcion.setId(rs.getInt("ID_ELEMENTOVULNERABLEP"));
					descripcion.setDescripcion(rs.getString("NOMBRE"));
					lista.add(descripcion);
				}
			}

		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}

		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getLocalizaciones(int id_elemenetoVulnerable) {
		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.localizaciones");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {
			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				expr.setInt(1, id_elemenetoVulnerable);
				ResultSet rs = expr.executeQuery();

				while (rs.next()) {
					Descripcion descripcion=new Descripcion();
					descripcion.setId(rs.getInt("ID_LOCALIZACION"));
					descripcion.setDescripcion(rs.getString("NOMBRE"));
					lista.add(descripcion);
				}
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}

		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getTiposLocalizaciones() {

		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.tiposLocalizaciones");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();

				while (rs.next()) {
					Descripcion descripcion=new Descripcion();
					descripcion.setId(rs.getInt("ID_TIPOLOCALIZACION"));
					descripcion.setDescripcion(rs.getString("TIPOLOCALIZACION"));
					lista.add(descripcion);
				}
			}

		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}

		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getTiposDocumento() {

		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.tipoDocumento");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {

			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();

				while (rs.next()) {
					Descripcion descripcion=new Descripcion();
					descripcion.setId(rs.getInt("ID_TIPODOCUMENTO"));
					descripcion.setDescripcion(rs.getString("NOMBRE"));
					lista.add(descripcion);
				}
			}

		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}

		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public Descripcion[] getDocumentosVulnerables(int tipoDocumento) {
		List<Descripcion> lista = new ArrayList<Descripcion>();

		String sql = getQuery("sql.buscar.documentoVulnerables");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {
			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				expr.setInt(1, tipoDocumento);
				ResultSet rs = expr.executeQuery();

				while (rs.next()) {
					Descripcion descripcion=new Descripcion();
					descripcion.setId(rs.getInt("ID_DOCUMENTO"));
					descripcion.setDescripcion(rs.getString("NOMBRE"));
					lista.add(descripcion);
				}
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return lista.toArray(new Descripcion[lista.size()]);
	}

	@Override
	public int getMaxIdDocumentoPlanDirector() {
		int total = -1;

		String sql = getQuery("sql.buscar.idMaxDocumentoPlanDirector");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {
			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();
				rs.next();
				total = Integer.parseInt(rs.getString("ID"));
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return total;
	}

	@Override
	public int getMaxIdDocumentoVulnerable() {
		int total = -1;

		String sql = getQuery("sql.buscar.idMaxDocumentoVulnerable");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {
			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();
				rs.next();
				total = Integer.parseInt(rs.getString("ID"));
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return total;
	}

	@Override
	public int getMaxIdDocumentoLocalizacion() {
		int total = -1;

		String sql = getQuery("sql.buscar.idMaxDocumentoLocalizacion");
		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {
			if(conexion && this.conexionBD!=null) {
				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();
				rs.next();
				total = Integer.parseInt(rs.getString("ID"));
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return total;
	}

	@Override
	public int getNextVal (String tabla) {

		int total = -1;

		boolean conexion = this.conectarBD(this.dataSourceRiesgos);

		try {
			String sql = getSql (tabla);

			if(conexion && this.conexionBD!=null) {

				PreparedStatement expr = this.conexionBD.prepareStatement(sql);
				ResultSet rs = expr.executeQuery();
				rs.next();
				total = Integer.parseInt(rs.getString("ID"));
			}
		} catch (SQLException e) {
			log.error("Lanzada excepcion: ", e);
		} finally {
			desconectarBD();
		}
		return total;
	}

	private String getSql (String capa) {

		String sql = "";

		switch (capa.toUpperCase().trim()) {
		case ELEMENTO_VULNERABLE_P:
			sql = getQuery("sql.buscar.sec_elementovulnerablep");
			break;
		case ELEMENTO_VULNERABLE_A:
			sql = getQuery("sql.buscar.sec_elementovulnerablea");
			break;
		case LOCALIZACIONES:
			sql = getQuery("sql.buscar.sec_localizaciones");
			break;
		case PLAN_DIRECTOR:
			sql = getQuery("sql.buscar.sec_plandirector");
			break;
		case DOCUMENTOS:
			sql = getQuery("sql.buscar.sec_documentos");
			break;
		case DOCUMENTOS_VULNERABLE:
			sql = getQuery("sql.buscar.sec_documentosvulnerable");
			break;
		case DOCUMENTOS_LOCALIZACION:
			sql = getQuery("sql.buscar.sec_documentoslocalizacion");
			break;
		case DOCUMENTOS_PLAN:
			sql = getQuery("sql.buscar.sec_documentosplan");
			break;
		case FACTOR_VULNERABILIDAD:
			sql = getQuery("sql.buscar.sec_factorvulnerabilidad");
			break;
		case TIPADO:
			sql = getQuery("sql.buscar.sec_tipado");
			break;
		case TIPOLOGIA:
			sql = getQuery("sql.buscar.sec_tipologia");
			break;
		default:
			sql = "";
			break;
		}
		return sql;
	}

	private String getQuery(String label) {
		InputStream inputStream = getClass().getResourceAsStream(this.RUTA_FICHERO_PROPIEDADES_SQL);
		Properties logProperties = new Properties();
		try {
			logProperties.load(inputStream);
			return logProperties.getProperty(label);
		} catch (IOException e) {
			this.log.error("Se ha producido un error al intentar leer el fichero de propiedades: " + this.RUTA_FICHERO_PROPIEDADES_SQL);
			this.log.error("Error:", e);
		}
		return null;
	}

	private boolean conectarBD(String datasource) {
		//***************************************************************************************
		//Metodo para conectar a la base de datos a partir del datasource almacenado en propiedades
		//Recibe: datasource
		//Devuelve: un boolean que es true si la conexion ha sido posible y false si no lo ha logrado
		//***************************************************************************************
		InitialContext ic = null;
		DataSource ds = null;
		boolean resultado;
		if(log.isInfoEnabled()) {
			log.info("conectarBD() - Obteniendo conexiÃƒÂ³n de BD Oracle por datasource....");
		}
		try {
			ic = new InitialContext();
			ds = (DataSource) ic.lookup("java:comp/env/jdbc/" + datasource);
			this.conexionBD = ds.getConnection();
			resultado = true;
			if (log.isInfoEnabled()) {
				log.info("conectarBBDD() - Conexion satisfactoriamente realizada con el data source: " + datasource);
			}
		} catch (Exception exception) {
			log.error("conectarBBDD() - Se ha producido un error al intentar realizar la conexion con el data source: " + datasource + ". Error: " + exception.getMessage());
			resultado = false;
		}
		return resultado;
	}

	private void desconectarBD() {
		//***************************************************************************************
		//Metodo para conectar a la base de datos a partir del datasource almacenado en propiedades
		//Recibe: datasource
		//Devuelve:
		//***************************************************************************************
		if(log.isInfoEnabled()) {
			log.info("desconectarBBDD() - Cerrando conexiÃƒÂ³n BBDDOracle....");
		}

		if (this.conexionBD != null) {
			try {
				this.conexionBD.close();
				if (log.isInfoEnabled()) {
					log.info("desconectarBD() -  ConexiÃƒÂ³n BD cerrada satisfactoriamente.");
				}
			} catch (SQLException e) {
				log.error("desconectarBD() -  Error al intentar cerrar la conexiÃƒÂ³n con la BD. ", e);

			}

		} else {
			if (log.isInfoEnabled()) {
				log.info("desconectarBD() -  ConexiÃƒÂ³n BD era null.");
			}
		}

		this.conexionBD = null;
	}

}
