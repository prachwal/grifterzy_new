# ============================================================================
# API Test Suite - PowerShell
# Test wszystkich endpointów Express Lambda API
# ============================================================================

param(
    [string]$BaseUrl = "http://localhost:3000",
    [switch]$Verbose,
    [switch]$SaveResponses,
    [int]$LoadTestCount = 5
)

# Kolory dla output
$Colors = @{
    Success = "Green"
    Error = "Red" 
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
}

# Funkcja do logowania z kolorami
function Write-ColorLog {
    param(
        [string]$Message,
        [string]$Level = "Info"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = $Colors[$Level]
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

# Funkcja do szczegółowego testowania endpointów
function Test-ApiEndpoint {
    param(
        [string]$Name,
        [string]$Uri,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [hashtable]$Headers = @{},
        [int]$ExpectedStatus = 200,
        [string]$Description = ""
    )
    
    Write-ColorLog "🧪 Testing: $Name" "Header"
    if ($Description) {
        Write-ColorLog "   Description: $Description" "Info"
    }
    Write-ColorLog "   $Method $Uri" "Info"
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $jsonBody = ($Body | ConvertTo-Json -Depth 5)
            $params.Body = $jsonBody
            $params.ContentType = "application/json"
            
            if ($Verbose) {
                Write-ColorLog "   Body: $jsonBody" "Info"
            }
        }
        
        if ($Headers.Count -gt 0 -and $Verbose) {
            Write-ColorLog "   Headers: $($Headers | ConvertTo-Json -Compress)" "Info"
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = [int]$response.StatusCode
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-ColorLog "   ✅ SUCCESS - Status: $statusCode" "Success"
        } else {
            Write-ColorLog "   ⚠️ UNEXPECTED STATUS - Expected: $ExpectedStatus, Got: $statusCode" "Warning"
        }
        
        # Parse response content
        try {
            $responseData = $response.Content | ConvertFrom-Json
            
            if ($Verbose) {
                Write-ColorLog "   Response:" "Info"
                Write-Host ($responseData | ConvertTo-Json -Depth 3) -ForegroundColor Gray
            }
            
            # Save response if requested
            if ($SaveResponses) {
                $filename = "$Name-response.json" -replace '[^\w\-_\.]', '_'
                $responseData | ConvertTo-Json -Depth 5 | Out-File -FilePath $filename -Encoding UTF8
                Write-ColorLog "   💾 Response saved to: $filename" "Info"
            }
            
            return @{
                Success = $true
                StatusCode = $statusCode
                Response = $responseData
                RequestId = $responseData.payload.requestId
            }
            
        } catch {
            Write-ColorLog "   📄 Raw response: $($response.Content)" "Info"
            return @{
                Success = $true
                StatusCode = $statusCode
                Response = $response.Content
                RequestId = $null
            }
        }
        
    } catch {
        $errorMessage = $_.Exception.Message
        $statusCode = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-ColorLog "   ✅ EXPECTED ERROR - Status: $statusCode" "Success"
            return @{
                Success = $true
                StatusCode = $statusCode
                Response = $errorMessage
                RequestId = $null
            }
        } else {
            Write-ColorLog "   ❌ ERROR - $errorMessage" "Error"
            if ($statusCode -gt 0) {
                Write-ColorLog "   Status Code: $statusCode" "Error"
            }
            return @{
                Success = $false
                StatusCode = $statusCode
                Response = $errorMessage
                RequestId = $null
            }
        }
    }
    
    Write-Host ""
}

# Funkcja do testu obciążenia
function Test-LoadEndpoint {
    param(
        [string]$Uri,
        [int]$Count = $LoadTestCount
    )
    
    Write-ColorLog "🚀 Load Testing: $Uri ($Count requests)" "Header"
    
    $results = @()
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    1..$Count | ForEach-Object {
        try {
            $start = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-RestMethod -Uri $Uri -Method GET -UseBasicParsing
            $start.Stop()
            
            $results += @{
                Request = $_
                Success = $true
                Duration = $start.ElapsedMilliseconds
                RequestId = $response.payload.requestId
            }
            
            Write-Progress -Activity "Load Testing" -Status "Request $_/$Count" -PercentComplete (($_ / $Count) * 100)
            
        } catch {
            $results += @{
                Request = $_
                Success = $false
                Duration = 0
                Error = $_.Exception.Message
            }
        }
    }
    
    $stopwatch.Stop()
    Write-Progress -Activity "Load Testing" -Completed
    
    $successful = ($results | Where-Object { $_.Success }).Count
    $avgDuration = ($results | Where-Object { $_.Success } | Measure-Object -Property Duration -Average).Average
    $minDuration = ($results | Where-Object { $_.Success } | Measure-Object -Property Duration -Minimum).Minimum
    $maxDuration = ($results | Where-Object { $_.Success } | Measure-Object -Property Duration -Maximum).Maximum
    
    Write-ColorLog "   📊 Results:" "Info"
    Write-ColorLog "   Total requests: $Count" "Info"
    Write-ColorLog "   Successful: $successful" "Success"
    Write-ColorLog "   Failed: $($Count - $successful)" "Error"
    Write-ColorLog "   Total time: $($stopwatch.ElapsedMilliseconds)ms" "Info"
    Write-ColorLog "   Average response time: $([math]::Round($avgDuration, 2))ms" "Info"
    Write-ColorLog "   Min response time: $minDuration ms" "Info"
    Write-ColorLog "   Max response time: $maxDuration ms" "Info"
    Write-ColorLog "   Requests per second: $([math]::Round($Count / ($stopwatch.ElapsedMilliseconds / 1000), 2))" "Info"
    
    Write-Host ""
}

# ============================================================================
# MAIN TEST EXECUTION
# ============================================================================

Write-ColorLog "🎯 Starting API Test Suite" "Header"
Write-ColorLog "Base URL: $BaseUrl" "Info"
Write-ColorLog "Verbose: $Verbose" "Info"
Write-ColorLog "Save Responses: $SaveResponses" "Info"
Write-Host ""

$testResults = @()

# Test 1: Root Endpoint - Lista endpointów
$testResults += Test-ApiEndpoint -Name "Root-Endpoint" -Uri "$BaseUrl/api/" -Description "Lista wszystkich dostępnych endpointów"

# Test 2: Health Check
$testResults += Test-ApiEndpoint -Name "Health-Check" -Uri "$BaseUrl/api/health" -Description "Sprawdzenie stanu API"

# Test 3: Health Check z trailing slash
$testResults += Test-ApiEndpoint -Name "Health-Check-TrailingSlash" -Uri "$BaseUrl/api/health/" -Description "Health check z trailing slash"

# Test 4: Hello Endpoint
$testResults += Test-ApiEndpoint -Name "Hello-Basic" -Uri "$BaseUrl/api/hello" -Description "Podstawowy hello endpoint"

# Test 5: Hello z custom User-Agent
$customHeaders = @{ "User-Agent" = "PowerShell-Test-Suite/1.0" }
$testResults += Test-ApiEndpoint -Name "Hello-CustomUA" -Uri "$BaseUrl/api/hello" -Headers $customHeaders -Description "Hello z custom User-Agent"

# Test 6: JSON Test - prosty obiekt
$simpleJson = @{
    test = "PowerShell-Test"
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    number = 42
    boolean = $true
}
$testResults += Test-ApiEndpoint -Name "JSON-Test-Simple" -Uri "$BaseUrl/api/test-json" -Method "POST" -Body $simpleJson -Description "Test prostego JSON-a"

# Test 7: JSON Test - złożony obiekt
$complexJson = @{
    user = @{
        name = "John Doe"
        age = 30
        active = $true
        roles = @("admin", "user")
    }
    metadata = @{
        source = "PowerShell-Test-Suite"
        version = "1.0"
        environment = "development"
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    }
    settings = @{
        notifications = $true
        theme = "dark"
        language = "pl"
    }
    array_test = @(1, 2, 3, "text", $true)
}
$testResults += Test-ApiEndpoint -Name "JSON-Test-Complex" -Uri "$BaseUrl/api/test-json" -Method "POST" -Body $complexJson -Description "Test złożonego JSON-a"

# Test 8: Token Validation GET - z query parameter
$testResults += Test-ApiEndpoint -Name "Token-GET-Query" -Uri "$BaseUrl/api/validate-token?token=test123456789" -Description "Walidacja tokenu przez query parameter"

# Test 9: Token Validation GET - z Authorization header
$authHeaders = @{ "Authorization" = "Bearer mySecretToken123456789" }
$testResults += Test-ApiEndpoint -Name "Token-GET-Header" -Uri "$BaseUrl/api/validate-token" -Headers $authHeaders -Description "Walidacja tokenu przez Authorization header"

# Test 10: Token Validation GET - brak tokenu (powinien zwrócić błąd 400)
$testResults += Test-ApiEndpoint -Name "Token-GET-Missing" -Uri "$BaseUrl/api/validate-token" -ExpectedStatus 400 -Description "Test braku tokenu (błąd 400)"

# Test 11: Token Validation POST - token w body
$tokenBody = @{ token = "postBodyToken123456789" }
$testResults += Test-ApiEndpoint -Name "Token-POST-Body" -Uri "$BaseUrl/api/validate-token" -Method "POST" -Body $tokenBody -Description "Walidacja tokenu w POST body"

# Test 12: Token Validation POST - token w header
$tokenPostHeaders = @{ "Authorization" = "Bearer postHeaderToken123456789" }
$emptyBody = @{}
$testResults += Test-ApiEndpoint -Name "Token-POST-Header" -Uri "$BaseUrl/api/validate-token" -Method "POST" -Body $emptyBody -Headers $tokenPostHeaders -Description "Walidacja tokenu w POST header"

# Test 13: Token Validation POST - brak tokenu (powinien zwrócić błąd 400)
$testResults += Test-ApiEndpoint -Name "Token-POST-Missing" -Uri "$BaseUrl/api/validate-token" -Method "POST" -Body @{} -ExpectedStatus 400 -Description "Test braku tokenu w POST (błąd 400)"

# Test 14: Nieistniejący endpoint (powinien zwrócić błąd 404)
$testResults += Test-ApiEndpoint -Name "NotFound-Endpoint" -Uri "$BaseUrl/api/nonexistent" -ExpectedStatus 404 -Description "Test nieistniejącego endpointu (błąd 404)"

# Load Testing
if ($LoadTestCount -gt 0) {
    Test-LoadEndpoint -Uri "$BaseUrl/api/health" -Count $LoadTestCount
}

# ============================================================================
# SUMMARY
# ============================================================================

Write-ColorLog "📊 TEST SUMMARY" "Header"

$totalTests = $testResults.Count
$successfulTests = ($testResults | Where-Object { $_.Success }).Count
$failedTests = $totalTests - $successfulTests

Write-ColorLog "Total tests: $totalTests" "Info"
Write-ColorLog "Successful: $successfulTests" "Success"
Write-ColorLog "Failed: $failedTests" $(if ($failedTests -eq 0) { "Success" } else { "Error" })

if ($failedTests -gt 0) {
    Write-ColorLog "❌ Failed tests:" "Error"
    $testResults | Where-Object { -not $_.Success } | ForEach-Object {
        Write-ColorLog "   - Test failed with status $($_.StatusCode): $($_.Response)" "Error"
    }
}

# Request IDs summary
$requestIds = $testResults | Where-Object { $_.RequestId } | Select-Object -ExpandProperty RequestId
if ($requestIds.Count -gt 0) {
    Write-ColorLog "🔍 Unique Request IDs generated: $($requestIds.Count)" "Info"
    if ($Verbose) {
        Write-ColorLog "Request IDs: $($requestIds -join ', ')" "Info"
    }
}

# Final status
if ($failedTests -eq 0) {
    Write-ColorLog "🎉 ALL TESTS PASSED!" "Success"
    exit 0
} else {
    Write-ColorLog "💥 SOME TESTS FAILED!" "Error"
    exit 1
}
