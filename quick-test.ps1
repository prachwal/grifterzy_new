# ============================================================================
# Quick API Tests - PowerShell
# Szybkie testy poszczególnych endpointów
# ============================================================================

# Konfiguracja
$BaseUrl = "http://localhost:3000"

Write-Host "🚀 Quick API Tests - $BaseUrl" -ForegroundColor Magenta
Write-Host ""

# ============================================================================
# BASIC TESTS
# ============================================================================

Write-Host "📋 1. Lista dostępnych endpointów:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/" -Method GET
    Write-Host "✅ Status: OK" -ForegroundColor Green
    Write-Host "📍 Dostępne endpointy:" -ForegroundColor Cyan
    $response.payload.endpoints | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "🏥 2. Health Check:" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method GET
    Write-Host "✅ Status: $($health.payload.status)" -ForegroundColor Green
    Write-Host "🆔 Request ID: $($health.payload.requestId)" -ForegroundColor Cyan
    Write-Host "⏰ Timestamp: $($health.payload.timestamp)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "👋 3. Hello Endpoint:" -ForegroundColor Yellow
try {
    $hello = Invoke-RestMethod -Uri "$BaseUrl/api/hello" -Method GET
    Write-Host "✅ Message: $($hello.message)" -ForegroundColor Green
    Write-Host "🆔 Request ID: $($hello.payload.requestId)" -ForegroundColor Cyan
    Write-Host "🌐 User Agent: $($hello.payload.userAgent)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================================================
# JSON TESTS
# ============================================================================

Write-Host "🧪 4. JSON Test - Prosty obiekt:" -ForegroundColor Yellow
try {
    $testData = @{
        message = "Hello from PowerShell"
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        testNumber = 42
        isTest = $true
    }
    
    $jsonResponse = Invoke-RestMethod -Uri "$BaseUrl/api/test-json" -Method POST -Body ($testData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ JSON Test Success" -ForegroundColor Green
    Write-Host "📦 Body Type: $($jsonResponse.payload.bodyType)" -ForegroundColor Cyan
    Write-Host "📏 Body Size: $($jsonResponse.payload.bodySize) chars" -ForegroundColor Cyan
    Write-Host "✔️ Parsed Successfully: $($jsonResponse.payload.parsedSuccessfully)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "🧪 5. JSON Test - Złożony obiekt:" -ForegroundColor Yellow
try {
    $complexData = @{
        user = @{
            name = "Test User"
            id = 123
            active = $true
        }
        permissions = @("read", "write", "admin")
        config = @{
            theme = "dark"
            language = "pl"
            notifications = $true
        }
        metadata = @{
            source = "PowerShell Quick Test"
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        }
    }
    
    $complexResponse = Invoke-RestMethod -Uri "$BaseUrl/api/test-json" -Method POST -Body ($complexData | ConvertTo-Json -Depth 3) -ContentType "application/json"
    Write-Host "✅ Complex JSON Test Success" -ForegroundColor Green
    Write-Host "📦 Body Type: $($complexResponse.payload.bodyType)" -ForegroundColor Cyan
    Write-Host "🔧 Is Object: $($complexResponse.payload.testResults.isObject)" -ForegroundColor Cyan
    Write-Host "🔑 Keys in received object: $(($complexResponse.payload.receivedBody | Get-Member -MemberType NoteProperty).Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================================================
# TOKEN VALIDATION TESTS
# ============================================================================

Write-Host "🔐 6. Token Validation GET (Query Parameter):" -ForegroundColor Yellow
try {
    $tokenGet = Invoke-RestMethod -Uri "$BaseUrl/api/validate-token?token=myTestToken123456789" -Method GET
    Write-Host "✅ Token Valid: $($tokenGet.payload.valid)" -ForegroundColor Green
    Write-Host "🔑 Token Prefix: $($tokenGet.payload.tokenPrefix)" -ForegroundColor Cyan
    Write-Host "📝 Method: $($tokenGet.payload.method)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "🔐 7. Token Validation GET (Authorization Header):" -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer headerTestToken123456789" }
    $tokenHeader = Invoke-RestMethod -Uri "$BaseUrl/api/validate-token" -Method GET -Headers $headers
    Write-Host "✅ Token Valid: $($tokenHeader.payload.valid)" -ForegroundColor Green
    Write-Host "🔑 Token Prefix: $($tokenHeader.payload.tokenPrefix)" -ForegroundColor Cyan
    Write-Host "📝 Method: $($tokenHeader.payload.method)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "🔐 8. Token Validation POST (Body):" -ForegroundColor Yellow
try {
    $tokenBody = @{ token = "postBodyToken123456789" }
    $tokenPost = Invoke-RestMethod -Uri "$BaseUrl/api/validate-token" -Method POST -Body ($tokenBody | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Token Valid: $($tokenPost.payload.valid)" -ForegroundColor Green
    Write-Host "🔑 Token Prefix: $($tokenPost.payload.tokenPrefix)" -ForegroundColor Cyan
    Write-Host "📝 Method: $($tokenPost.payload.method)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================================================
# ERROR TESTS
# ============================================================================

Write-Host "⚠️ 9. Test braku tokenu (GET) - oczekiwany błąd 400:" -ForegroundColor Yellow
try {
    $errorTest = Invoke-RestMethod -Uri "$BaseUrl/api/validate-token" -Method GET
    Write-Host "❓ Unexpected success: $($errorTest.message)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Expected 400 error received" -ForegroundColor Green
        Write-Host "📄 Error details: $($_.Exception.Message)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "⚠️ 10. Test braku tokenu (POST) - oczekiwany błąd 400:" -ForegroundColor Yellow
try {
    $emptyBody = @{}
    $errorTestPost = Invoke-RestMethod -Uri "$BaseUrl/api/validate-token" -Method POST -Body ($emptyBody | ConvertTo-Json) -ContentType "application/json"
    Write-Host "❓ Unexpected success: $($errorTestPost.message)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Expected 400 error received" -ForegroundColor Green
        Write-Host "📄 Error details: $($_.Exception.Message)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# ============================================================================
# PERFORMANCE TEST
# ============================================================================

Write-Host "⚡ 11. Quick Performance Test (5 requests):" -ForegroundColor Yellow
$times = @()
1..5 | ForEach-Object {
    try {
        $start = Get-Date
        $perfTest = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method GET
        $end = Get-Date
        $duration = ($end - $start).TotalMilliseconds
        $times += $duration
        Write-Host "   Request $_/5: $([math]::Round($duration, 2))ms (ID: $($perfTest.payload.requestId))" -ForegroundColor White
    } catch {
        Write-Host "   Request $_/5: Failed - $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($times.Count -gt 0) {
    $avgTime = ($times | Measure-Object -Average).Average
    $minTime = ($times | Measure-Object -Minimum).Minimum
    $maxTime = ($times | Measure-Object -Maximum).Maximum
    
    Write-Host "📊 Performance Summary:" -ForegroundColor Cyan
    Write-Host "   Average: $([math]::Round($avgTime, 2))ms" -ForegroundColor White
    Write-Host "   Min: $([math]::Round($minTime, 2))ms" -ForegroundColor White
    Write-Host "   Max: $([math]::Round($maxTime, 2))ms" -ForegroundColor White
}
Write-Host ""

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host "🎯 Quick Tests Completed!" -ForegroundColor Magenta
Write-Host ""
Write-Host "💡 Tip: Uruchom pełne testy z:" -ForegroundColor Yellow
Write-Host "   .\test-api.ps1 -Verbose -SaveResponses" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Lub z testami obciążenia:" -ForegroundColor Yellow
Write-Host "   .\test-api.ps1 -LoadTestCount 20" -ForegroundColor White
