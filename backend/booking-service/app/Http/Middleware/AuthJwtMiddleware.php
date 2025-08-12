<?php

namespace App\Http\Middleware;

use Closure;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthJwtMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $req, Closure $next): Response
    {
        $token = $req->bearerToken() ?: abort(401);
        try {
            $resp = (new Client(['base_uri'=>config('services.auth.url')]))
                ->get('/api/me',['headers'=>['Authorization'=>"Bearer {$token}"]]);
            $req->attributes->set('auth_user', json_decode($resp->getBody(),true));
        } catch (\Exception $e) {
            abort(401);
        }
        return $next($req);
    }
}
