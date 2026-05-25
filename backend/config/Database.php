<?php
namespace Config;

use PDO;
use PDOException;
use Exception;

class Database {
    private static $instance = null;
    private $conn;

    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;

    private function __construct() {
        // Read database credentials from environment variables (e.g. on Render)
        // with default fallbacks for local development.
        $this->host = getenv('DB_HOST') ?: "127.0.0.1";
        $this->db_name = getenv('DB_NAME') ?: "watch2_web";
        $this->username = getenv('DB_USER') ?: "root";
        $this->password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : "";
        $this->port = getenv('DB_PORT') ?: "3306";

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $exception) {
            error_log("Database Connection Error: " . $exception->getMessage());
            throw new Exception("Lỗi kết nối cơ sở dữ liệu.");
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
}
