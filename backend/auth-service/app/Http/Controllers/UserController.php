<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the users with eager-loaded roles.
     */
    public function index()
    {
        $users = User::with('roles')->get();
        return response()->json([
            'success' => true,
            'message' => 'Daftar Pengguna',
            'data' => $users
        ]);
    }

    /**
     * Display the specified user with roles.
     */
    public function show(User $user)
    {
        $user->load('roles'); // Eager load roles
        return response()->json([
            'success' => true,
            'message' => 'Detail Pengguna',
            'data' => $user
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request)
    {
        $userData = $request->validated();

        $user = User::create([
            'name' => $userData['name'],
            'email' => $userData['email'],
            'password' => $userData['password'],
            'is_active' => $userData['is_active'] ?? false,
        ]);

        if (isset($userData['roles'])) {
            $user->roles()->sync($userData['roles']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengguna baru berhasil dibuat',
            'data' => $user
        ], 201);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $userData = $request->validated();

        // Update user data
        $user->update([
            'name' => $userData['name'] ?? $user->name,
            'email' => $userData['email'] ?? $user->email,
            'is_active' => $userData['is_active'] ?? $user->is_active,
        ]);

        // Update password if provided
        if (isset($userData['password'])) {
            $user->password = bcrypt($userData['password']);
            $user->save();
        }

        // Sync roles if provided
        if (isset($userData['roles'])) {
            $user->roles()->sync($userData['roles']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil diperbarui',
            'data' => $user->load('roles')
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil dihapus'
        ]);
    }
}
