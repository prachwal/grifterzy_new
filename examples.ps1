# ============================================================================
# API Examples - PowerShell Commands
# Pojedyncze komendy do testowania API
# ============================================================================

# Konfiguracja
$BaseUrl = "http://localhost:3000"

Write-Host "📚 API Examples - Copy & Paste Commands" -ForegroundColor Magenta
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host ""

Write-Host "# ============================================================================" -ForegroundColor Gray
Write-Host "# GET ENDPOINTS" -ForegroundColor Gray
Write-Host "# ============================================================================" -ForegroundColor Gray
Write-Host ""

Write-Host "# Lista dostępnych endpointów:" -ForegroundColor Yellow
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/" -Method GET' -ForegroundColor White
Write-Host ""

Write-Host "# Health Check:" -ForegroundColor Yellow
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET' -ForegroundColor White
Write-Host ""

Write-Host "# Hello Endpoint:" -ForegroundColor Yellow
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/hello" -Method GET' -ForegroundColor White
Write-Host ""

Write-Host "# Hello z custom User-Agent:" -ForegroundColor Yellow
Write-Host '$headers = @{ "User-Agent" = "PowerShell-Test/1.0" }' -ForegroundColor White
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/hello" -Method GET -Headers $headers' -ForegroundColor White
Write-Host ""

Write-Host "# Token Validation GET - query parameter:" -ForegroundColor Yellow
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/validate-token?token=test123456789" -Method GET' -ForegroundColor White
Write-Host ""

Write-Host "# Token Validation GET - Authorization header:" -ForegroundColor Yellow
Write-Host '$authHeaders = @{ "Authorization" = "Bearer mySecretToken123" }' -ForegroundColor White
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/validate-token" -Method GET -Headers $authHeaders' -ForegroundColor White
Write-Host ""

Write-Host "# ============================================================================" -ForegroundColor Gray
Write-Host "# POST ENDPOINTS" -ForegroundColor Gray
Write-Host "# ============================================================================" -ForegroundColor Gray
Write-Host ""

Write-Host "# JSON Test - prosty obiekt:" -ForegroundColor Yellow
Write-Host '$body = @{' -ForegroundColor White
Write-Host '    test = "value"' -ForegroundColor White
Write-Host '    number = 123' -ForegroundColor White
Write-Host '    boolean = $true' -ForegroundColor White
Write-Host '} | ConvertTo-Json' -ForegroundColor White
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/test-json" -Method POST -Body $body -ContentType "application/json"' -ForegroundColor White
Write-Host ""

Write-Host "# JSON Test - złożony obiekt:" -ForegroundColor Yellow
Write-Host '$complexBody = @{' -ForegroundColor White
Write-Host '    user = @{' -ForegroundColor White
Write-Host '        name = "John Doe"' -ForegroundColor White
Write-Host '        age = 30' -ForegroundColor White
Write-Host '        active = $true' -ForegroundColor White
Write-Host '    }' -ForegroundColor White
Write-Host '    permissions = @("read", "write", "admin")' -ForegroundColor White
Write-Host '    metadata = @{' -ForegroundColor White
Write-Host '        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")' -ForegroundColor White
Write-Host '        source = "PowerShell"' -ForegroundColor White
Write-Host '    }' -ForegroundColor White
Write-Host '} | ConvertTo-Json -Depth 3' -ForegroundColor White
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/test-json" -Method POST -Body $complexBody -ContentType "application/json"' -ForegroundColor White
Write-Host ""

Write-Host "# Token Validation POST - token w body:" -ForegroundColor Yellow
Write-Host '$tokenBody = @{' -ForegroundColor White
Write-Host '    token = "myTestToken123456789"' -ForegroundColor White
Write-Host '} | ConvertTo-Json' -ForegroundColor White
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/validate-token" -Method POST -Body $tokenBody -ContentType "application/json"' -ForegroundColor White
Write-Host ""

Write-Host "# Token Validation POST - token w header:" -ForegroundColor Yellow
Write-Host '$headers = @{ "Authorization" = "Bearer headerToken123" }' -ForegroundColor White
Write-Host '$emptyBody = @{} | ConvertTo-Json' -ForegroundColor White
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/validate-token" -Method POST -Body $emptyBody -ContentType "application/json" -Headers $headers' -ForegroundColor White
Write-Host ""

Write-Host "# ============================================================================" -ForegroundColor Gray
Write-Host "# ERROR TESTING" -ForegroundColor Gray
Write-Host "# ============================================================================" -ForegroundColor Gray
Write-Host ""

Write-Host "# Test brakującego tokenu (GET) - oczekiwany błąd 400:" -ForegroundColor Yellow
Write-Host 'try {' -ForegroundColor White
Write-Host '    Invoke-RestMethod -Uri "http://localhost:3000/api/validate-token" -Method GET' -ForegroundColor White
Write-Host '} catch {' -ForegroundColor White
Write-Host '    Write-Host "Error: $($_.Exception.Message)"' -ForegroundColor White
Write-Host '    $_.Exception.Response.StatusCode' -ForegroundColor White
Write-Host '}' -ForegroundColor White
Write-Host ""

Write-Host "# Test brakującego tokenu (POST) - oczekiwany błąd 400:" -ForegroundColor Yellow
Write-Host 'try {' -ForegroundColor White
Write-Host '    $emptyBody = @{} | ConvertTo-Json' -ForegroundColor White
Write-Host '    Invoke-RestMethod -Uri "http://localhost:3000/api/validate-token" -Method POST -Body $emptyBody -ContentType "application/json"' -ForegroundColor White
Write-Host '} catch {' -ForegroundColor White
Write-Host '    Write-Host "Error: $($_.Exception.Message)"' -ForegroundColor White
Write-Host '    $_.Exception.Response.StatusCode' -ForegroundColor White
Write-Host '}' -ForegroundColor White
Write-Host ""

Write-Host "# ============================================================================" -ForegroundColor Gray
Write-Host "# ADVANCED TESTING" -ForegroundColor Gray
Write-Host "# ============================================================================" -ForegroundColor Gray
Write-Host ""

Write-Host "# Szczegółowy test z pełną odpowiedzią:" -ForegroundColor Yellow
Write-Host '$response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET' -ForegroundColor White
Write-Host 'Write-Host "Status Code: $($response.StatusCode)"' -ForegroundColor White
Write-Host 'Write-Host "Content Type: $($response.Headers."Content-Type")"' -ForegroundColor White
Write-Host '$data = $response.Content | ConvertFrom-Json' -ForegroundColor White
Write-Host '$data | ConvertTo-Json -Depth 3' -ForegroundColor White
Write-Host ""

Write-Host "# Test wydajności - 10 żądań:" -ForegroundColor Yellow
Write-Host '1..10 | ForEach-Object {' -ForegroundColor White
Write-Host '    $start = Get-Date' -ForegroundColor White
Write-Host '    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET' -ForegroundColor White
Write-Host '    $end = Get-Date' -ForegroundColor White
Write-Host '    $duration = ($end - $start).TotalMilliseconds' -ForegroundColor White
Write-Host '    Write-Host "Request $_: $([math]::Round($duration, 2))ms - RequestId: $($response.payload.requestId)"' -ForegroundColor White
Write-Host '}' -ForegroundColor White
Write-Host ""

Write-Host "# Zapisanie odpowiedzi do pliku:" -ForegroundColor Yellow
Write-Host '$response = Invoke-RestMethod -Uri "http://localhost:3000/api/" -Method GET' -ForegroundColor White
Write-Host '$response | ConvertTo-Json -Depth 3 | Out-File -FilePath "api-response.json" -Encoding UTF8' -ForegroundColor White
Write-Host 'Write-Host "Response saved to api-response.json"' -ForegroundColor White
Write-Host ""

Write-Host "# Test z timeout:" -ForegroundColor Yellow
Write-Host 'try {' -ForegroundColor White
Write-Host '    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5' -ForegroundColor White
Write-Host '    Write-Host "Success: $($response.message)"' -ForegroundColor White
Write-Host '} catch [System.Net.WebException] {' -ForegroundColor White
Write-Host '    if ($_.Exception.Message -like "*timeout*") {' -ForegroundColor White
Write-Host '        Write-Host "Request timed out"' -ForegroundColor White
Write-Host '    } else {' -ForegroundColor White
Write-Host '        Write-Host "Network error: $($_.Exception.Message)"' -ForegroundColor White
Write-Host '    }' -ForegroundColor White
Write-Host '}' -ForegroundColor White
Write-Host ""

Write-Host "# ============================================================================" -ForegroundColor Gray
Write-Host "# FUNKCJE POMOCNICZE" -ForegroundColor Gray
Write-Host "# ============================================================================" -ForegroundColor Gray
Write-Host ""

Write-Host "# Funkcja do testowania endpointu:" -ForegroundColor Yellow
Write-Host 'function Test-ApiEndpoint {' -ForegroundColor White
Write-Host '    param([string]$Uri, [string]$Method = "GET", [hashtable]$Body = $null)' -ForegroundColor White
Write-Host '    try {' -ForegroundColor White
Write-Host '        $params = @{ Uri = $Uri; Method = $Method }' -ForegroundColor White
Write-Host '        if ($Body) {' -ForegroundColor White
Write-Host '            $params.Body = ($Body | ConvertTo-Json -Depth 3)' -ForegroundColor White
Write-Host '            $params.ContentType = "application/json"' -ForegroundColor White
Write-Host '        }' -ForegroundColor White
Write-Host '        $response = Invoke-RestMethod @params' -ForegroundColor White
Write-Host '        Write-Host "✅ SUCCESS: $($response.message)" -ForegroundColor Green' -ForegroundColor White
Write-Host '        return $response' -ForegroundColor White
Write-Host '    } catch {' -ForegroundColor White
Write-Host '        Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red' -ForegroundColor White
Write-Host '        return $null' -ForegroundColor White
Write-Host '    }' -ForegroundColor White
Write-Host '}' -ForegroundColor White
Write-Host ""

Write-Host "# Użycie funkcji:" -ForegroundColor Yellow
Write-Host 'Test-ApiEndpoint -Uri "http://localhost:3000/api/health"' -ForegroundColor White
Write-Host 'Test-ApiEndpoint -Uri "http://localhost:3000/api/test-json" -Method "POST" -Body @{test="value"}' -ForegroundColor White
Write-Host ""

Write-Host "🎯 Gotowe! Skopiuj i wklej wybrane komendy do PowerShell" -ForegroundColor Magenta
