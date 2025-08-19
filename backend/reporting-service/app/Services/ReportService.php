<?php

namespace App\Services;

use App\Models\ReportLog;
use App\Models\ReportRequest;
use GuzzleHttp\Client;
use Dompdf\Dompdf;
use Dompdf\Options;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;

class ReportService
{
    protected $httpClient;
    protected $authServiceUrl;
    protected $bookingServiceUrl;
    protected $roomServiceUrl;
    protected $userToken;
    protected ?ReportRequest $currentRequest = null;

    public function __construct()
    {
        $this->httpClient = new Client([
            'timeout' => 10,
        ]);

        // Ambil dari config/services.php atau env
        $this->authServiceUrl    = config('services.auth.url', 'http://127.0.0.1:8000');
        $this->bookingServiceUrl = config('services.booking.url', 'http://127.0.0.1:8002');
        $this->roomServiceUrl    = config('services.room.url', 'http://127.0.0.1:8001');
    }

    public function setUserToken(string $token): void
    {
        $this->userToken = $token;
    }

    public function setCurrentRequest(ReportRequest $r): void
    {
        $this->currentRequest = $r;
    }

    // -------------------------
    // Public methods
    // -------------------------
    public function fetchUsageData(array $params)
    {
        $this->log("Fetching usage data from booking service", $this->currentRequest);
        $bookings = $this->fetchBookings($params);
        $this->log("Fetched " . count($bookings) . " bookings", $this->currentRequest);

        $this->log("Fetching room data from room service", $this->currentRequest);
        $rooms = $this->fetchRooms();
        $this->log("Fetched " . count($rooms) . " rooms", $this->currentRequest);

        // sanitize bookings & rooms before aggregate
        $bookings = $this->sanitizeArrayDeep($bookings);
        $rooms    = $this->sanitizeArrayDeep($rooms);

        return $this->aggregateData($bookings, $rooms);
    }

    public function generatePdf(array $rows)
    {
        $this->log("Generating PDF report", $this->currentRequest);

        // sanitize rows (just in case)
        $rows = $this->sanitizeArrayDeep($rows);

        // render view menjadi HTML (string)
        $html = view('reports.usage', compact('rows'))->render();

        // Pastikan HTML juga valid UTF-8
        $html = $this->forceUtf8($html);

        // Set opsi Dompdf
        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $options->set('isHtml5ParserEnabled', true);
        $options->set('defaultFont', 'Arial'); // gunakan font yang lebih aman
        $options->set('defaultPaperSize', 'a4');
        $options->set('defaultMediaType', 'print');
        $options->set('chroot', []);

        $dompdf = new Dompdf($options);

        // Supaya cache font dan tmp directory benar
        $fontCacheDir = storage_path('fonts');
        if (!file_exists($fontCacheDir)) {
            mkdir($fontCacheDir, 0755, true);
        }

        $dompdf->set_option('fontCache', $fontCacheDir);
        $dompdf->set_option('tempDir', sys_get_temp_dir());
        $dompdf->set_option('isFontSubsettingEnabled', true);

        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $this->log("PDF generated (size: ".strlen($dompdf->output())." bytes)", $this->currentRequest);

        return $dompdf->output();
    }

    public function generateExcel(array $rows)
    {
        $this->log("Generating Excel report", $this->currentRequest);
        // implementasi Excel tetap seperti sebelumnya
        return Excel::download(new \App\Exports\UsageReportExport($rows), 'usage_report.xlsx');
    }

    // -------------------------
    // Helpers / internal
    // -------------------------
    private function fetchBookings(array $params)
    {
        $response = $this->httpClient->get($this->bookingServiceUrl . '/api/bookings', [
            'query' => $params,
            'headers' => $this->getAuthHeaders(),
        ]);

        return json_decode((string) $response->getBody(), true) ?? [];
    }

    private function fetchRooms()
    {
        $response = $this->httpClient->get($this->roomServiceUrl . '/api/rooms', [
            'headers' => $this->getAuthHeaders(),
        ]);

        return json_decode((string)$response->getBody(), true) ?? [];
    }

    private function aggregateData(array $bookings, array $rooms)
    {
        $roomMap = collect($rooms)->keyBy('id');
        $usage = [];

        foreach ($bookings as $booking) {
            $roomId = $booking['room_id'] ?? null;
            if ($roomId === null) continue;

            if (!isset($usage[$roomId])) {
                $usage[$roomId] = [
                    'room' => $roomMap[$roomId]['name'] ?? 'Unknown',
                    'bookings_count' => 0,
                    'total_hours' => 0
                ];
            }

            $usage[$roomId]['bookings_count']++;

            $start = \Carbon\Carbon::parse($booking['start_time']);
            $end = \Carbon\Carbon::parse($booking['end_time']);
            $usage[$roomId]['total_hours'] += $end->diffInHours($start);
        }

        return array_values($usage);
    }

    private function getAuthHeaders()
    {
        $headers = [
            'Accept' => 'application/json',
        ];

        if (!empty($this->userToken)) {
            $headers['Authorization'] = 'Bearer ' . $this->userToken;
        }

        return $headers;
    }

    public function log(string $message, ReportRequest $r = null)
    {
        Log::info($message);
        if ($r) {
            try {
                $log = new ReportLog(['message' => $message, 'logged_at' => now()]);
                $r->logs()->save($log);
            } catch (\Throwable $e) {
                Log::warning("Cannot persist report log: ".$e->getMessage());
            }
        }
    }

    // ======================
    // Encoding / sanitization utilities
    // ======================

    /**
     * Convert string to UTF-8 and remove invalid byte sequences.
     */
    private function forceUtf8(string $s): string
    {
        // Jika string kosong, return langsung
        if (empty($s)) {
            return $s;
        }

        // ensure it's UTF-8: convert from detected enc to UTF-8, then iconv IGNORE
        $enc = mb_detect_encoding($s, ['UTF-8', 'ISO-8859-1', 'WINDOWS-1252', 'ASCII'], true) ?: 'UTF-8';

        // Jika sudah UTF-8, masih perlu dibersihkan dari karakter invalid
        if ($enc !== 'UTF-8') {
            $s = mb_convert_encoding($s, 'UTF-8', $enc);
        }

        // remove invalid sequences dengan lebih aman
        $clean = @iconv('UTF-8', 'UTF-8//IGNORE', $s);
        if ($clean === false) {
            // Fallback jika iconv gagal
            $clean = mb_convert_encoding($s, 'UTF-8', 'UTF-8');
        }

        return $clean ?: '';
    }

    /**
     * Deep sanitize array values (strings) to valid UTF-8.
     */
    private function sanitizeArrayDeep(array $arr): array
    {
        $result = [];
        foreach ($arr as $k => $v) {
            if (is_string($v)) {
                $result[$k] = $this->forceUtf8($v);
            } elseif (is_array($v)) {
                $result[$k] = $this->sanitizeArrayDeep($v);
            } else {
                $result[$k] = $v;
            }
        }
        return $result;
    }
}
