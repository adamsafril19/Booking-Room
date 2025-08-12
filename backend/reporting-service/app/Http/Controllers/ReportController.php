<?php

namespace App\Http\Controllers;

use App\Models\ReportRequest;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function usage(Request $request)
    {
        // 1) Validasi presence header dan cast ke int
        if (! $request->hasHeader('X-User-Id') || ! is_numeric($request->header('X-User-Id'))) {
            return response()->json(['message' => 'Missing or invalid X-User-Id header'], 400);
        }

        $userId = $request->header('X-User-Id');
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
            'format' => 'sometimes|in:pdf,xlsx'
        ]);

        try {
            // 3) Buat ReportRequest dengan user_id valid
            $reportRequest = ReportRequest::create([
                'user_id'     => $userId,
                'report_type' => 'usage',
                'parameters'  => $validated,
            ]);

            // Set token pengguna ke service
            $this->reportService->setUserToken($request->bearerToken());

            // Set report request ke service
            $this->reportService->setCurrentRequest($reportRequest);

            // Mulai logging
            $this->reportService->log("Starting report generation", $reportRequest);

            // Fetch data
            $data = $this->reportService->fetchUsageData($validated);

            $format = $validated['format'] ?? 'pdf';
            if ($format === 'pdf') {
                $pdf = $this->reportService->generatePdf($data);
                return response($pdf)
                    ->header('Content-Type','application/pdf')
                    ->header('Content-Disposition','attachment; filename="usage_report.pdf"');
            }
            return $this->reportService->generateExcel($data);

        } catch (\Exception $e) {
            // Tangani exception
            if (isset($reportRequest)) {
                $this->reportService->log("Error generating report: " . $e->getMessage(), $reportRequest);
                $reportRequest->update(['status' => 'failed']);
            }
            return response()->json(['error' => $e->getMessage()], 500);

        } finally {
            // Tandai completed jika tidak error
            if (isset($reportRequest) && $reportRequest->status !== 'failed') {
                $reportRequest->update([
                    'status'       => 'completed',
                    'completed_at' => now(),
                ]);
            }
        }
    }

    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }
}
