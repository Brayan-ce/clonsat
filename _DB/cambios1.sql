-- ═══════════════════════════════════════════════════════
--  CAMBIOS1.SQL  —  detalle de importación de vehículo
--  Ejecutar después de cambios.sql
-- ═══════════════════════════════════════════════════════

USE clonsat;

-- ── 1. Ampliar pedimentos_vehiculo con datos completos del importador ──
ALTER TABLE pedimentos_vehiculo
  ADD COLUMN calle              VARCHAR(200)  NULL AFTER importador,
  ADD COLUMN numero_ext         VARCHAR(50)   NULL AFTER calle,
  ADD COLUMN municipio          VARCHAR(100)  NULL AFTER numero_ext,
  ADD COLUMN apartado_postal    VARCHAR(50)   NULL AFTER municipio,
  ADD COLUMN cp                 VARCHAR(10)   NULL AFTER apartado_postal,
  ADD COLUMN entidad_federativa VARCHAR(100)  NULL AFTER cp,
  ADD COLUMN pais               VARCHAR(150)  NULL AFTER entidad_federativa,
  ADD COLUMN aduana_completa    VARCHAR(200)  NULL AFTER pais;

-- Actualizar pedimento 5 con datos del importador real
UPDATE pedimentos_vehiculo
SET
  calle              = 'CENTRO COMERCIAL Col. OTAY CONSTITUYENTES',
  numero_ext         = '17115 / B-1',
  municipio          = 'Tijuana',
  apartado_postal    = 'No declarado',
  cp                 = '22457',
  entidad_federativa = 'BAJA CALIFORNIA',
  pais               = 'MEXICO (ESTADOS UNIDOS MEXICANOS)',
  aduana_completa    = 'TIJUANA, TIJUANA, BAJA CALIFORNIA.'
WHERE id_pedimento = 5;

-- ── 2. Tabla de fracciones arancelarias del vehículo ──
CREATE TABLE IF NOT EXISTS pedimentos_vehiculo_fraccion (
  id                INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  id_pedimento      INT UNSIGNED   NOT NULL,
  fraccion          VARCHAR(20)    NULL,
  secuencia         SMALLINT       NULL DEFAULT 1,
  marca             VARCHAR(100)   NULL,
  modelo            VARCHAR(100)   NULL,
  anio_vehiculo     CHAR(4)        NULL,
  numero_serie      VARCHAR(17)    NULL,
  kilometraje       VARCHAR(20)    NULL,
  valor_aduana      VARCHAR(20)    NULL,
  fp_iva            VARCHAR(50)    NULL,
  importe_iva       DECIMAL(12,2)  NULL DEFAULT 0,
  fp_advalorem      VARCHAR(50)    NULL,
  importe_advalorem DECIMAL(12,2)  NULL DEFAULT 0,
  fp_isan           VARCHAR(50)    NULL,
  importe_isan      DECIMAL(12,2)  NULL DEFAULT 0,
  fp_tenencia       VARCHAR(50)    NULL,
  importe_tenencia  DECIMAL(12,2)  NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_fraccion_pedimento FOREIGN KEY (id_pedimento) REFERENCES pedimentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fracción del vehículo para pedimento 5 (Jeep Wrangler 2018)
INSERT INTO pedimentos_vehiculo_fraccion
  (id_pedimento, fraccion, secuencia, marca, modelo, anio_vehiculo, numero_serie,
   kilometraje, valor_aduana,
   fp_iva, importe_iva, fp_advalorem, importe_advalorem,
   fp_isan, importe_isan, fp_tenencia, importe_tenencia)
VALUES
  (5, '87032402', 1, 'JEEP', 'WRANGLER', '2018', '1C4GJWAG1JL931083',
   '5,000', '112029',
   'EFECTIVO', 19860.00, 'EFECTIVO', 11203.00,
   'NO DECLARADO', 0.00, 'NO DECLARADO', 0.00);
