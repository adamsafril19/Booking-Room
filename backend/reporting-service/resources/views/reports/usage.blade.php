<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: "DejaVu Sans", "Helvetica", Arial, sans-serif; font-size: 12px; color: #222; }
    table { width:100%; border-collapse: collapse;}
    th, td { border: 1px solid #e2e8f0; padding:6px; }
    thead th { background:#eff6ff; color:#1e3a8a; }
  </style>
</head>
<body>
  <h1>Room Usage Report</h1>
  <!-- isi tabel dsb -->
  @php
    $maxHours = max(array_column($rows, 'total_hours') ?: [1]);
    $maxHours = ($maxHours > 0) ? $maxHours : 1;
  @endphp

  <table>
    <thead>
      <tr><th>Room</th><th>Bookings</th><th>Total Hours</th><th>Utilization</th></tr>
    </thead>
    <tbody>
      @foreach($rows as $row)
      <tr>
        <td>{{ $row['room'] }}</td>
        <td>{{ $row['bookings_count'] }}</td>
        <td>{{ $row['total_hours'] }}</td>
        <td style="text-align:right">{{ number_format(($row['total_hours'] / $maxHours) * 100, 1) }}%</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
