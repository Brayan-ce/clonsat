-- ═══════════════════════════════════════════════════════
--  CAMBIOS.SQL  —  nuevas tablas para clonsat
--  Ejecutar después de tablas.sql
-- ═══════════════════════════════════════════════════════

USE clonsat;

-- ── 1. REGISTRO DE BÚSQUEDAS ──────────────────────────
--  Guarda cada vez que un visitante presiona "Buscar"
--  en ingreso.js, independientemente del resultado.
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registro_busquedas (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tipo            ENUM('pedimento','vin','contenedor') NOT NULL,

  -- parámetros introducidos por el usuario
  aduana          VARCHAR(10)    DEFAULT NULL,
  aduana_label    VARCHAR(120)   DEFAULT NULL,
  anio            CHAR(4)        DEFAULT NULL,
  patente         VARCHAR(20)    DEFAULT NULL,
  documento       VARCHAR(20)    DEFAULT NULL,
  vin             VARCHAR(17)    DEFAULT NULL,
  contenedor      VARCHAR(30)    DEFAULT NULL,

  -- datos del navegante (para SEO / analítica)
  ip              VARCHAR(45)    DEFAULT NULL,   -- IPv4 o IPv6
  user_agent      TEXT           DEFAULT NULL,
  pais            VARCHAR(80)    DEFAULT NULL,
  pais_codigo     CHAR(2)        DEFAULT NULL,
  region          VARCHAR(80)    DEFAULT NULL,
  ciudad          VARCHAR(80)    DEFAULT NULL,
  latitud         DECIMAL(9,6)   DEFAULT NULL,
  longitud        DECIMAL(9,6)   DEFAULT NULL,
  isp             VARCHAR(120)   DEFAULT NULL,

  -- resultado
  encontrado      TINYINT(1)     NOT NULL DEFAULT 0,   -- 1=sí encontró, 0=no encontró
  total_resultados SMALLINT      NOT NULL DEFAULT 0,

  fecha           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_tipo    (tipo),
  INDEX idx_fecha   (fecha),
  INDEX idx_pais    (pais_codigo),
  INDEX idx_ip      (ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. VISITOR ID ─────────────────────────────────────
--  Cookie UUID asignada al visitante en su primera visita.
--  Permite agrupar búsquedas del mismo usuario anónimo.
-- ─────────────────────────────────────────────────────
ALTER TABLE registro_busquedas
  ADD COLUMN visitor_id VARCHAR(36) NULL DEFAULT NULL AFTER id,
  ADD INDEX idx_visitor (visitor_id);

-- ── 3. VEHÍCULOS DE PEDIMENTO ─────────────────────────
--  Datos del importador/vehículo ligados a un pedimento con VIN.
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedimentos_vehiculo (
  id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_pedimento     INT UNSIGNED  NOT NULL,
  clave_documento  VARCHAR(10)       NULL,
  rfc              VARCHAR(20)       NULL,
  curp             VARCHAR(20)       NULL,
  importador       VARCHAR(150)      NULL,
  fecha_pago       VARCHAR(30)       NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_vehiculo_pedimento FOREIGN KEY (id_pedimento) REFERENCES pedimentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO pedimentos_vehiculo (id_pedimento, clave_documento, rfc, curp, importador, fecha_pago) VALUES
  (3, 'VU', 'ABC190925SA8', NULL, 'IMPORTADOR EJEMPLO S.A. DE C.V.',  '20/02/2026 08:30:15'),
  (4, 'VU', 'XYZ100101AA1', NULL, 'OTRO IMPORTADOR S.A. DE C.V.',     '10/03/2026 14:47:55');

-- ── 4. COMPLEMENTOS DE PEDIMENTO ─────────────────────
--  Filas de la tabla grdComplementos (ID DE CASO, COMPLEMENTO 1-3)
-- ─────────────────────────────────────────────────────
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

-- Datos de ejemplo — busca el pedimento con VIN 1C4GJWAG1JL931083 dinámicamente
INSERT INTO pedimentos_complemento (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'ED', '01712604GJ2D1', NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;
INSERT INTO pedimentos_complemento (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'VU', '1',             NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;
INSERT INTO pedimentos_complemento (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'ED', '01922617AN0Z6', NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;
INSERT INTO pedimentos_complemento (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'ED', '01682601VO7W5', NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;
INSERT INTO pedimentos_complemento (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'ED', '01712604GJ2E2', NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;
INSERT INTO pedimentos_complemento (id_pedimento, id_caso, complemento1, complemento2, complemento3)
SELECT p.id, 'ED', '0436260NN82R7', NULL, NULL FROM pedimentos p WHERE p.vin = '1C4GJWAG1JL931083' LIMIT 1;
