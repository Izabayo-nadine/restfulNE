# Free FEMS backend ports (run before npm run dev if you see EADDRINUSE)
$ports = 5000, 5001, 5002, 5003, 5004, 5005
foreach ($port in $ports) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    $procId = $c.OwningProcess
    if ($procId -and $procId -ne 0) {
      Write-Host "Stopping PID $procId on port $port"
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
  }
}
Write-Host "Done. Ports $($ports -join ', ') should be free."
