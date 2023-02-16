@ECHO OFF

REM  ╔═════════════════════════════════════════════════════╗
REM  ║                      CISEM                          ║
REM  ║              Sectores Parques Bomberos              ║
REM  ╚═════════════════════════════════════════════════════╝


REM Instrucción de ejecución:
REM [Ejecutable de ArcGIS Python] <PathAPP> <SdeDB> <SecuenciasLayer> <SectoresLayer> <MadridLayer>

REM <PathAPP>: Ruta de la aplicacion
REM <SdeDB>: Conector SDE/FGDB de base de datos
REM <SecuenciasLayer>: Feature Layer de Secuencias Operativas
REM <SectoresLayer>: Feature Layer final de Sectores de Parques de Bomberos
REM <MadridLayer>: Feature Layer con el contorno de Madrid para definicion y delimitacion

REM Proceso diario
C:\Python27\ArcGISx6410.7\python.exe "migracion_usoslugar.py"