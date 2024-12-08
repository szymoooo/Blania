<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Dane do połączenia z bazą db4free.net
    $host = 'db4free.net';            // Host serwera
    $db = 'stat_blanka';              // Zmieniona nazwa bazy danych
    $user = 'blanka_user';            // Twój użytkownik (zarejestrowany na db4free.net)
    $password = 'q5a.ssCr5TmF76L';  // Twoje hasło

    try {
        // Połączenie z bazą danych
        $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Pobierz dane z żądania POST
        $statystyka = $_POST['statystyka'];
        $wartosc = $_POST['wartosc'];
        $punkty = $_POST['punkty'];

        // Zapisz dane w tabeli
        $stmt = $pdo->prepare("INSERT INTO statystyki (statystyka, wartosc, punkty) VALUES (:statystyka, :wartosc, :punkty)");
        $stmt->execute([
            ':statystyka' => $statystyka,
            ':wartosc' => $wartosc,
            ':punkty' => $punkty
        ]);

        echo "Dane zapisane pomyślnie!";
    } catch (PDOException $e) {
        echo "Błąd: " . $e->getMessage();
    }
} else {
    echo "Nieprawidłowa metoda żądania.";
}
?>
