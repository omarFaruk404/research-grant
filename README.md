$port = "51233"

$redirect = [uri]::EscapeDataString("http://localhost:$port/oauth-callback")

$scope = [uri]::EscapeDataString( "https://www.googleapis.com/auth/cloud-platform " + "https://www.googleapis.com/auth/userinfo.email " + "https://www.googleapis.com/auth/userinfo.profile " + "https://www.googleapis.com/auth/cclog " + "https://www.googleapis.com/auth/experimentsandconfigs" )

$clientId = "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com" $state = [uri]::EscapeDataString([guid]::NewGuid().ToString())

$url = "https://accounts.google.com/o/oauth2/v2/auth" + "?client_id=$clientId" + "&redirect_uri=$redirect" + "&response_type=code" + "&scope=$scope" + "&access_type=offline" + "&prompt=consent" + "&state=$state"

Start-Process "chrome.exe" $url