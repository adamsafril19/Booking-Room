<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8'
        ]);

        $user = \App\Models\User::create($validated);
        $user->roles()->attach(\App\Models\Role::where('name', 'user')->first());

        return response()->json([
            'token' => $user->createToken('auth_token')->plainTextToken
        ], 201);
    }

    public function login(Request $request)
    {
        // 1) Validasi input saja
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // 2) Ambil user berdasarkan email
        $user = \App\Models\User::where('email', $request->email)->first();
        // 3) Cek kredensial
        if (!$user || !Hash::check($request->password, $user->password)) {
            // Kembalikan 401 Unauthorized
            return response()->json([
                'message' => 'The provided credentials are incorrect.'
            ], 401);
        }

        // 4) Buat token dan kirim
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ], 200);
    }

    public function me(Request $request)
    {
        // Jika request bisa sampai ke baris ini, artinya middleware 'auth:sanctum'
        // sudah berhasil mengautentikasi user via cookie sesi.
        // Kita hanya perlu mengembalikan data user yang sudah terotentikasi tersebut.
        return response()->json(
            $request->user()->load('roles')
        );
    }

    public function index()
    {
        $users = User::with('roles')->get();

        return response()->json($users);
    }


    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
