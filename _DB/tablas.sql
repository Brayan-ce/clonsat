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
  fecha            VARCHAR(30)       NULL,
  banco            VARCHAR(100)      NULL,
  secuencia        VARCHAR(10)       NULL,
  numero_operacion VARCHAR(50)       NULL,
  factura          VARCHAR(50)       NULL,
  vin              VARCHAR(17)       NULL,
  contenedor       VARCHAR(30)       NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

INSERT INTO pedimentos (aduana, aduana_label, anio, patente, documento, estado, fecha, banco, secuencia, numero_operacion, factura, vin, contenedor) VALUES
  ('330', 'SAN LUIS RIO COLORADO, SON.', '2026', '3414', '6009679', 'DESADUANADO', '27/03/2026 13:21:37', '',          '0', '416152019', '',            NULL,                 'HLXU8020617'),
  ('430', 'VERACRUZ, VER.',              '2026', '3739', '5001234', 'DESADUANADO', '15/01/2026 10:05:22', 'BANAMEX',   '1', '512309876', 'INV-2026-001', NULL,                'MSCU1234567'),
  ('200', 'MEXICO',                      '2026', '1234', '0009999', 'DESADUANADO', '20/02/2026 08:30:15', 'SANTANDER', '0', '698321450', '',            'JH4KA7650MC000001',  'TCKU3456789'),
  ('240', 'NUEVO LAREDO, TAMPS.',        '2026', '2312', '0023123', 'EN PROCESO',  '10/03/2026 14:47:55', 'HSBC',      '2', '334019287', 'FC-4421',     'WVWZZZ1JZ3W386703',  'TCKU3456789');

INSERT INTO pedimentos_detalle (id_pedimento, banco, numero_operacion, importe, fecha_hora_pago, linea_captura, estado_linea_captura) VALUES
  (1, 'BBVA BANCOMER', '01226085731680', '11778.00',  '2026-03-26 16:45:03', '0326018KACP149234283', 'PAGO REGISTRADO EN SAAI'),
  (2, 'BANAMEX',       '00151234768920', '48350.50',  '2026-01-15 09:12:44', '0115072KACV001254600', 'PAGO REGISTRADO EN SAAI'),
  (3, 'SANTANDER',     '00298765432100', '127500.00', '2026-02-19 17:22:08', '0219044KACS200999900', 'PAGO REGISTRADO EN SAAI'),
  (4, 'HSBC',          '00367890123456', '55250.75',  '2026-03-09 11:05:30', '0309067KACM231230000', 'PAGO REGISTRADO EN SAAI');
