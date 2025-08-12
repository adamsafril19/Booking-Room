<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoomController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth.token')->group(function(){
    Route::get('/rooms', [RoomController::class,'index']);
    Route::get('/rooms/{room}', [RoomController::class,'show']);
});

Route::middleware(['auth.token'])->group(function(){
    Route::post('/rooms', [RoomController::class,'store']);
    Route::put('/rooms/{room}', [RoomController::class,'update']);
    Route::delete('/rooms/{room}', [RoomController::class,'destroy']);
});
