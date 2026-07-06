-- =============================================================================
-- Database.sql  –  Temporal & Regional Data Normalisation
-- Standard : UTC ISO-8601 for every date/datetime column.
-- All timestamps are stored in UTC (TIMESTAMP / DATETIME UTC_TIMESTAMP).
-- Server timezone mutations are prohibited; conversion happens only at the
-- render layer in the frontend.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Session-level UTC enforcement
-- Run this SET at the top of every application connection.
-- ---------------------------------------------------------------------------
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- Convention: every table that stores a point-in-time value MUST use one of
-- the column types below.  String columns for dates are forbidden.
--
--   Point-in-time  →  DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP)
--   Date-only      →  DATE NOT NULL
--   Time-of-day    →  TIME NOT NULL
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Example: attendance table (checkin / checkout)
-- Replace with your actual schema; the types and defaults shown here are the
-- authoritative pattern for the whole database.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    employee_id INT UNSIGNED    NOT NULL,

    -- UTC point-in-time columns — DEFAULT is UTC_TIMESTAMP, never NOW()
    -- because NOW() is session-timezone–aware whereas UTC_TIMESTAMP is not.
    checkin     DATETIME        NOT NULL DEFAULT (UTC_TIMESTAMP),
    checkout    DATETIME                 DEFAULT NULL,

    created_at  DATETIME        NOT NULL DEFAULT (UTC_TIMESTAMP),
    updated_at  DATETIME        NOT NULL DEFAULT (UTC_TIMESTAMP)
                                    ON UPDATE UTC_TIMESTAMP,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Example: sessions / hearings table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    case_id     INT UNSIGNED    NOT NULL,

    -- DATE column for the calendar date; no timezone ambiguity.
    session_date DATE           NOT NULL,

    -- TIME columns for start/end within that local calendar day.
    -- These are stored as-is; the application must combine them with the
    -- session_date and the user's timezone when presenting to the user.
    start_time  TIME                     DEFAULT NULL,
    end_time    TIME                     DEFAULT NULL,

    -- Absolute deadline stored in UTC.
    deadline_at DATETIME                 DEFAULT NULL,

    created_at  DATETIME        NOT NULL DEFAULT (UTC_TIMESTAMP),
    updated_at  DATETIME        NOT NULL DEFAULT (UTC_TIMESTAMP)
                                    ON UPDATE UTC_TIMESTAMP,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Trigger guard: prevent non-UTC datetimes being inserted.
-- MySQL stores DATETIME without a timezone tag, so we rely on the connection
-- always running SET time_zone = '+00:00'.  The trigger below validates that
-- the session timezone is UTC before allowing writes to the attendance table.
-- ---------------------------------------------------------------------------
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS trg_attendance_utc_checkin
BEFORE INSERT ON attendance
FOR EACH ROW
BEGIN
    -- @@session.time_zone returns '+00:00' when the connection is UTC.
    IF @@session.time_zone != '+00:00' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Connection timezone must be UTC (+00:00) before writing attendance timestamps.';
    END IF;
END$$

CREATE TRIGGER IF NOT EXISTS trg_attendance_utc_checkout
BEFORE UPDATE ON attendance
FOR EACH ROW
BEGIN
    IF @@session.time_zone != '+00:00' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Connection timezone must be UTC (+00:00) before writing attendance timestamps.';
    END IF;
END$$

DELIMITER ;
