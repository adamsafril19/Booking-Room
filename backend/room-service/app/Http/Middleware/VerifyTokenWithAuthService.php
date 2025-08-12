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

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $authServiceUrl = env('AUTH_SERVICE_URL', 'http://127.0.0.1:8000');

        try {
            $response = Http::withToken($token)->get("{$authServiceUrl}/api/me");

            if ($response->status() !== 200) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $request->merge(['auth_user' => $response->json()]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Auth service unreachable.'], 500);
        }

        return $next($request);
    }
}
