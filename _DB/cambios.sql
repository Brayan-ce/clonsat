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
