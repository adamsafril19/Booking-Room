<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class VerifyTokenWithAuthService
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        // Log token presence
        \Log::info('Token received: ' . ($token ? 'present' : 'absent'));
        if ($token) \Log::debug('Token value: ' . $token);

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $authServiceUrl = env('AUTH_SERVICE_URL', 'http://127.0.0.1:8000');

        try {
            $response = Http::withToken($token)
                ->timeout(5) // Add 5-second timeout
                ->get("{$authServiceUrl}/api/me");

            // Log auth service response
            \Log::info('Auth service response status: ' . $response->status());
            \Log::debug('Auth service body: ' . $response->body());

            if ($response->status() !== 200) {
                \Log::error('Auth validation failed', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $request->merge(['auth_user' => $response->json()]);
        } catch (\Exception $e) {
            \Log::error('Auth service error: ' . $e->getMessage());
            return response()->json(['message' => 'Auth service unreachable.'], 500);
        }

        return $next($request);
    }
}
