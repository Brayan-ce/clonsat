CREATE DATABASE IF NOT EXISTS clonsat
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE clonsat;

CREATE TABLE IF NOT EXISTS usuarios (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario    VARCHAR(80)   NOT NULL UNIQUE,
  contrasena VARCHAR(255)  NOT NULL,
  activo     TINYINT(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO usuarios (usuario, contrasena) VALUES
  ('superadmin', '123456');

CREATE TABLE IF NOT EXISTS pedimentos (
  id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  aduana           VARCHAR(10)   NOT NULL,
  aduana_label     VARCHAR(100)      NULL,
  anio             CHAR(4)       NOT NULL,
  patente          VARCHAR(20)       NULL,
  documento        VARCHAR(20)       NULL,
  estado           VARCHAR(50)       NULL,
  tipo_operacion   VARCHAR(80)       NULL,
  clave_documento  VARCHAR(10)       NULL,
  fecha            VARCHAR(30)       NULL,
  banco            VARCHAR(100)      NULL,
  secuencia        VARCHAR(10)       NULL,
  numero_operacion VARCHAR(50)       NULL,
  factura          VARCHAR(50)       NULL,
  vin              VARCHAR(17)       NULL,
  contenedor       VARCHAR(30)       NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedimentos_detalle (
  id                   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_pedimento         INT UNSIGNED  NOT NULL,
  banco                VARCHAR(100)      NULL,
  numero_operacion     VARCHAR(50)       NULL,
  importe              VARCHAR(30)       NULL,
  fecha_hora_pago      VARCHAR(30)       NULL,
  linea_captura        VARCHAR(60)       NULL,
  estado_linea_captura VARCHAR(100)      NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_detalle_pedimento FOREIGN KEY (id_pedimento) REFERENCES pedimentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedimentos_vehiculo (
  id                   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_pedimento         INT UNSIGNED  NOT NULL,
  clave_documento      VARCHAR(10)       NULL,
  rfc                  VARCHAR(20)       NULL,
  curp                 VARCHAR(20)       NULL,
  importador           VARCHAR(150)      NULL,
  fecha_pago           VARCHAR(30)       NULL,
  calle                VARCHAR(200)      NULL,
  numero_ext           VARCHAR(50)       NULL,
  municipio            VARCHAR(100)      NULL,
  apartado_postal      VARCHAR(50)       NULL,
  cp                   VARCHAR(10)       NULL,
  entidad_federativa   VARCHAR(100)      NULL,
  pais                 VARCHAR(150)      NULL,
  aduana_completa      VARCHAR(200)      NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_vehiculo_pedimento FOREIGN KEY (id_pedimento) REFERENCES pedimentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedimentos_complemento (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_pedimento INT UNSIGNED NOT NULL,
  id_caso      VARCHAR(10)  NOT NULL,
  complemento1 VARCHAR(100) NULL,
  complemento2 VARCHAR(100) NULL,
  complemento3 VARCHAR(100) NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_comp_pedimento FOREIGN KEY (id_pedimento) REFERENCES pedimentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS pedimentos_movimientos (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_pedimento INT UNSIGNED  NOT NULL,
  situacion    VARCHAR(100)  NOT NULL,
  detalle      VARCHAR(200)  NULL DEFAULT '',
  fecha        VARCHAR(30)   NULL,
  orden        SMALLINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_movimiento_pedimento FOREIGN KEY (id_pedimento) REFERENCES pedimentos(id) ON DELETE CASCADE,
  INDEX idx_mov_pedimento (id_pedimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registro_busquedas (
  id               INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  visitor_id       VARCHAR(36)        NULL DEFAULT NULL,
  tipo             ENUM('pedimento','vin','contenedor') NOT NULL,
  aduana           VARCHAR(10)        NULL,
  aduana_label     VARCHAR(120)       NULL,
  anio             CHAR(4)            NULL,
  patente          VARCHAR(20)        NULL,
  documento        VARCHAR(20)        NULL,
  vin              VARCHAR(17)        NULL,
  contenedor       VARCHAR(30)        NULL,
  ip               VARCHAR(45)        NULL,
  user_agent       TEXT               NULL,
  pais             VARCHAR(80)        NULL,
  pais_codigo      CHAR(2)            NULL,
  region           VARCHAR(80)        NULL,
  ciudad           VARCHAR(80)        NULL,
  latitud          DECIMAL(9,6)       NULL,
  longitud         DECIMAL(9,6)       NULL,
  isp              VARCHAR(120)       NULL,
  encontrado       TINYINT(1)     NOT NULL DEFAULT 0,
  total_resultados SMALLINT       NOT NULL DEFAULT 0,
  fecha            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_visitor (visitor_id),
  INDEX idx_tipo    (tipo),
  INDEX idx_fecha   (fecha),
  INDEX idx_pais    (pais_codigo),
  INDEX idx_ip      (ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO pedimentos
  (aduana, aduana_label, anio, patente, documento, estado, tipo_operacion, clave_documento,
   fecha, banco, secuencia, numero_operacion, factura, vin, contenedor)
VALUES
  ('330', 'SAN LUIS RIO COLORADO, SON.', '2026', '3414', '6009679', 'DESADUANADO', 'IMPORTACIÓN', NULL,
   '27/03/2026 13:21:37', '',          '0', '416152019', '',            NULL,                'HLXU8020617'),
  ('430', 'VERACRUZ, VER.',              '2026', '3739', '5001234', 'DESADUANADO', 'IMPORTACIÓN', NULL,
   '15/01/2026 10:05:22', 'BANAMEX',   '1', '512309876', 'INV-2026-001', NULL,              'MSCU1234567'),
  ('200', 'MEXICO',                      '2026', '1234', '0009999', 'DESADUANADO', 'IMPORTACIÓN', NULL,
   '20/02/2026 08:30:15', 'SANTANDER', '0', '698321450', '',            'JH4KA7650MC000001', 'TCKU3456789'),
  ('240', 'NUEVO LAREDO, TAMPS.',        '2026', '2312', '0023123', 'EN PROCESO',  'IMPORTACIÓN', NULL,
   '10/03/2026 14:47:55', 'HSBC',      '2', '334019287', 'FC-4421',     'WVWZZZ1JZ3W386703', 'TCKU3456789');

INSERT INTO pedimentos_detalle
  (id_pedimento, banco, numero_operacion, importe, fecha_hora_pago, linea_captura, estado_linea_captura)
VALUES
  (1, 'BBVA BANCOMER', '01226085731680', '11778.00',  '2026-03-26 16:45:03', '0326018KACP149234283', 'PAGO REGISTRADO EN SAAI'),
  (2, 'BANAMEX',       '00151234768920', '48350.50',  '2026-01-15 09:12:44', '0115072KACV001254600', 'PAGO REGISTRADO EN SAAI'),
  (3, 'SANTANDER',     '00298765432100', '127500.00', '2026-02-19 17:22:08', '0219044KACS200999900', 'PAGO REGISTRADO EN SAAI'),
  (4, 'HSBC',          '00367890123456', '55250.75',  '2026-03-09 11:05:30', '0309067KACM231230000', 'PAGO REGISTRADO EN SAAI');

INSERT INTO pedimentos_vehiculo
  (id_pedimento, clave_documento, rfc, curp, importador, fecha_pago,
   calle, numero_ext, municipio, apartado_postal, cp, entidad_federativa, pais, aduana_completa)
VALUES
  (3, 'VU', 'ABC190925SA8', NULL, 'IMPORTADOR EJEMPLO S.A. DE C.V.', '20/02/2026 08:30:15',
   'CENTRO COMERCIAL Col. OTAY CONSTITUYENTES', '17115 / B-1', 'Tijuana', 'No declarado',
   '22457', 'BAJA CALIFORNIA', 'MEXICO (ESTADOS UNIDOS MEXICANOS)', 'TIJUANA, TIJUANA, BAJA CALIFORNIA.'),
  (4, 'VU', 'XYZ100101AA1', NULL, 'OTRO IMPORTADOR S.A. DE C.V.',    '10/03/2026 14:47:55',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO pedimentos_complemento
  (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'ED', '01712604GJ2D1', NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;
INSERT INTO pedimentos_complemento
  (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'VU', '1',             NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;
INSERT INTO pedimentos_complemento
  (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'ED', '01922617AN0Z6', NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;
INSERT INTO pedimentos_complemento
  (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'ED', '01682601VO7W5', NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;
INSERT INTO pedimentos_complemento
  (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'ED', '01712604GJ2E2', NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;
INSERT INTO pedimentos_complemento
  (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'ED', '0436260NN82R7', NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;

INSERT INTO pedimentos_vehiculo_fraccion
  (id_pedimento, fraccion, secuencia, marca, modelo, anio_vehiculo, numero_serie,
   kilometraje, valor_aduana,
   fp_iva, importe_iva, fp_advalorem, importe_advalorem,
   fp_isan, importe_isan, fp_tenencia, importe_tenencia)
SELECT
  p.id, '87032402', 1, 'JEEP', 'WRANGLER', '2018', '1C4GJWAG1JL931083',
  '5,000', '112029',
  'EFECTIVO', 19860.00, 'EFECTIVO', 11203.00,
  'NO DECLARADO', 0.00, 'NO DECLARADO', 0.00
FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;

INSERT INTO pedimentos
  (aduana, aduana_label, anio, patente, documento, estado,
   tipo_operacion, clave_documento,
   fecha, banco, secuencia, numero_operacion, factura, vin, contenedor)
VALUES
  ('190', 'MEXICALI, B.C.', '2026', '1656', '6001452', 'DESADUANADO',
   '1 IMPORTACIÓN', 'VF',
   '02/04/2026 08:40:26', 'BBVA BANCOMER', '0', '1', '1625400', NULL, NULL);

SET @id_nuevo = LAST_INSERT_ID();

INSERT INTO pedimentos_detalle
  (id_pedimento, banco, numero_operacion, importe, fecha_hora_pago, linea_captura, estado_linea_captura)
VALUES
  (@id_nuevo, 'BBVA BANCOMER', '1', '0.00', '2026-04-01 15:41:00', '', 'PAGO REGISTRADO EN SAAI');

INSERT INTO pedimentos_movimientos (id_pedimento, situacion, detalle, fecha, orden)
VALUES
  (@id_nuevo, 'PAGADO',                 '',                      '01/04/2026 15:41:00', 1),
  (@id_nuevo, 'SELECCIÓN AUTOMATIZADA', 'DESADUANAMIENTO LIBRE', '02/04/2026 08:40:26', 2),
  (@id_nuevo, 'DESADUANADO/CUMPLIDO',   'DESADUANADO',           '02/04/2026 08:40:26', 3),
  (@id_nuevo, 'DESADUANADO/CUMPLIDO',   'CUMPLIDO',              '02/04/2026 08:40:26', 4);