<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "marketplace_mysql.sql";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password) || !isset($data->fullName)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing email, password, or fullName"]);
    exit();
}

$email = $conn->real_escape_string($data->email);
$password = $data->password;
$fullName = $conn->real_escape_string($data->fullName);

$sql_check = "SELECT id FROM users WHERE email = '$email' LIMIT 1";
$result_check = $conn->query($sql_check);
if ($result_check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["error" => "Email already registered"]);
    exit();
}

$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$sql_insert = "INSERT INTO users (email, password, fullName, role, createdAt) VALUES ('$email', '$hashed_password', '$fullName', 'user', NOW())";

if ($conn->query($sql_insert) === TRUE) {
    $user_id = $conn->insert_id;
    $response = [
        "id" => $user_id,
        "email" => $email,
        "fullName" => $fullName,
        "role" => "user"
    ];
    http_response_code(201);
    echo json_encode($response);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to register user"]);
}

$conn->close();
?>
