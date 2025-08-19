<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11px;
      color: #1f2937;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      background: #ffffff;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px 0;
      border-bottom: 3px solid #6366f1;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      margin: -20px -20px 40px -20px;
      padding: 40px 20px;
    }

    .header h1 {
      color: #1e293b;
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .header .subtitle {
      color: #64748b;
      font-size: 14px;
      font-weight: 400;
      margin: 0;
    }

    .report-info {
      background: #f1f5f9;
      border-left: 4px solid #6366f1;
      padding: 15px 20px;
      margin-bottom: 30px;
      border-radius: 0 8px 8px 0;
    }

    .report-info h3 {
      color: #1e293b;
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .report-info p {
      color: #64748b;
      font-size: 11px;
      margin: 0;
    }

    .stats-grid {
      display: table;
      width: 100%;
      margin-bottom: 30px;
    }

    .stats-card {
      display: table-cell;
      width: 25%;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin-right: 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .stats-card:last-child {
      margin-right: 0;
    }

    .stats-value {
      font-size: 24px;
      font-weight: 700;
      color: #6366f1;
      display: block;
      margin-bottom: 5px;
    }

    .stats-label {
      font-size: 10px;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 30px;
    }

    th, td {
      border: none;
      padding: 16px 20px;
      text-align: left;
    }

    thead th {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #4f46e5;
    }

    tbody tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background-color 0.2s;
    }

    tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    tbody tr:hover {
      background: #e0e7ff;
    }

    tbody td {
      color: #374151;
      font-size: 11px;
    }

    .room-name {
      font-weight: 600;
      color: #1e293b;
    }

    .bookings-count {
      text-align: center;
      font-weight: 500;
      color: #059669;
    }

    .total-hours {
      text-align: center;
      font-weight: 500;
      color: #dc2626;
    }

    .utilization {
      text-align: center;
      font-weight: 700;
      padding: 8px 12px;
      border-radius: 6px;
    }

    .utilization-high {
      background: #dcfce7;
      color: #166534;
    }

    .utilization-medium {
      background: #fef3c7;
      color: #92400e;
    }

    .utilization-low {
      background: #fee2e2;
      color: #991b1b;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 10px;
    }

    .footer .generated-time {
      font-weight: 500;
      color: #374151;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Room Usage Report</h1>
    <p class="subtitle">Comprehensive Analytics & Utilization Insights</p>
  </div>

  <div class="report-info">
    <h3>Report Summary</h3>
    <p>This report provides detailed insights into room utilization patterns, booking frequencies, and usage efficiency across all available rooms.</p>
  </div>
  @php
    $maxHours = max(array_column($rows, 'total_hours') ?: [1]);
    $maxHours = ($maxHours > 0) ? $maxHours : 1;
    $totalRooms = count($rows);
    $totalBookings = array_sum(array_column($rows, 'bookings_count'));
    $totalHoursSum = array_sum(array_column($rows, 'total_hours'));
    $averageUtilization = $totalRooms > 0 ? round(($totalHoursSum / ($maxHours * $totalRooms)) * 100, 1) : 0;
  @endphp

  <div class="stats-grid">
    <div class="stats-card">
      <span class="stats-value">{{ $totalRooms }}</span>
      <span class="stats-label">Total Rooms</span>
    </div>
    <div class="stats-card">
      <span class="stats-value">{{ $totalBookings }}</span>
      <span class="stats-label">Total Bookings</span>
    </div>
    <div class="stats-card">
      <span class="stats-value">{{ number_format($totalHoursSum, 1) }}</span>
      <span class="stats-label">Total Hours</span>
    </div>
    <div class="stats-card">
      <span class="stats-value">{{ $averageUtilization }}%</span>
      <span class="stats-label">Avg. Utilization</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Room Name</th>
        <th>Total Bookings</th>
        <th>Usage Hours</th>
        <th>Utilization Rate</th>
      </tr>
    </thead>
    <tbody>
      @foreach($rows as $row)
      @php
        $utilizationPercent = ($row['total_hours'] / $maxHours) * 100;
        $utilizationClass = '';
        if ($utilizationPercent >= 70) {
          $utilizationClass = 'utilization-high';
        } elseif ($utilizationPercent >= 40) {
          $utilizationClass = 'utilization-medium';
        } else {
          $utilizationClass = 'utilization-low';
        }
      @endphp
      <tr>
        <td class="room-name">{{ e($row['room']) }}</td>
        <td class="bookings-count">{{ e($row['bookings_count']) }}</td>
        <td class="total-hours">{{ e($row['total_hours']) }} hrs</td>
        <td class="utilization {{ $utilizationClass }}">{{ e(number_format($utilizationPercent, 1)) }}%</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <div class="footer">
    <div class="generated-time">Report Generated: {{ date('F j, Y \a\t g:i A') }}</div>
    <div>Booking Room Management System - Usage Analytics</div>
  </div>
</body>
</html>
