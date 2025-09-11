<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ===== CONFIGURATION =====
$config = [
    'host' => 'db4free.net',
    'db' => 'stat_blanka',
    'user' => 'blanka_user',
    'password' => 'q5a.ssCr5TmF76L',
    'max_retries' => 3,
    'timeout' => 30
];

// ===== VALIDATION FUNCTIONS =====
function validateInput($data) {
    $errors = [];
    
    // Required fields validation
    $requiredFields = ['statystyka', 'wartosc', 'punkty'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Pole '$field' jest wymagane.";
        }
    }
    
    // Data type validation
    if (isset($data['wartosc']) && !is_numeric($data['wartosc'])) {
        $errors[] = "Wartość musi być liczbą.";
    }
    
    if (isset($data['punkty']) && !is_numeric($data['punkty'])) {
        $errors[] = "Punkty muszą być liczbą.";
    }
    
    // Range validation
    if (isset($data['wartosc']) && is_numeric($data['wartosc'])) {
        $wartosc = (int)$data['wartosc'];
        if ($wartosc < 0 || $wartosc > 1000) {
            $errors[] = "Wartość musi być między 0 a 1000.";
        }
    }
    
    if (isset($data['punkty']) && is_numeric($data['punkty'])) {
        $punkty = (int)$data['punkty'];
        if ($punkty < 0 || $punkty > 100) {
            $errors[] = "Punkty muszą być między 0 a 100.";
        }
    }
    
    // String length validation
    if (isset($data['statystyka']) && strlen($data['statystyka']) > 100) {
        $errors[] = "Nazwa statystyki nie może przekraczać 100 znaków.";
    }
    
    return $errors;
}

function sanitizeInput($data) {
    $sanitized = [];
    
    foreach ($data as $key => $value) {
        // Remove HTML tags and encode special characters
        $sanitized[$key] = htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
    }
    
    return $sanitized;
}

// ===== DATABASE FUNCTIONS =====
function connectToDatabase($config) {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset=utf8mb4";
    
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ];
    
    return new PDO($dsn, $config['user'], $config['password'], $options);
}

function saveStatistics($pdo, $data) {
    $sql = "INSERT INTO statystyki (statystyka, wartosc, punkty, created_at, ip_address, user_agent) 
            VALUES (:statystyka, :wartosc, :punkty, NOW(), :ip_address, :user_agent)";
    
    $stmt = $pdo->prepare($sql);
    
    return $stmt->execute([
        ':statystyka' => $data['statystyka'],
        ':wartosc' => (int)$data['wartosc'],
        ':punkty' => (int)$data['punkty'],
        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]);
}

function getStatistics($pdo, $limit = 100) {
    $sql = "SELECT * FROM statystyki ORDER BY created_at DESC LIMIT :limit";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    return $stmt->fetchAll();
}

// ===== ERROR RESPONSE FUNCTION =====
function sendErrorResponse($message, $code = 400, $details = []) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message,
        'details' => $details,
        'timestamp' => date('c')
    ]);
    exit();
}

function sendSuccessResponse($message, $data = []) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('c')
    ]);
    exit();
}

// ===== MAIN LOGIC =====
try {
    // Check request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendErrorResponse('Tylko metoda POST jest dozwolona.', 405);
    }
    
    // Get request data
    $input = $_POST;
    
    // Validate input
    $validationErrors = validateInput($input);
    if (!empty($validationErrors)) {
        sendErrorResponse('Błędy walidacji:', 400, $validationErrors);
    }
    
    // Sanitize input
    $sanitizedData = sanitizeInput($input);
    
    // Connect to database with retry mechanism
    $pdo = null;
    $lastException = null;
    
    for ($i = 0; $i < $config['max_retries']; $i++) {
        try {
            $pdo = connectToDatabase($config);
            break;
    } catch (PDOException $e) {
            $lastException = $e;
            if ($i < $config['max_retries'] - 1) {
                sleep(pow(2, $i)); // Exponential backoff
            }
        }
    }
    
    if (!$pdo) {
        throw $lastException;
    }
    
    // Save statistics
    $success = saveStatistics($pdo, $sanitizedData);
    
    if (!$success) {
        sendErrorResponse('Nie udało się zapisać danych do bazy.');
    }
    
    // Get updated statistics for response
    $statistics = getStatistics($pdo, 10);
    
    sendSuccessResponse('Dane zapisane pomyślnie!', [
        'statistics' => $statistics,
        'saved_record' => $sanitizedData
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    sendErrorResponse('Błąd bazy danych. Spróbuj ponownie za chwilę.', 500);
    
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    sendErrorResponse('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.', 500);
}
?>
