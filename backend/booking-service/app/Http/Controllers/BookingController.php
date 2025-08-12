<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use Illuminate\Http\Request;

class BookingController extends Controller
{

    public function index()
    {
        return Booking::orderByDesc('start_time')->get();
    }

    public function show(Booking $booking)
    {
        return $booking;
    }

    public function store(StoreBookingRequest $req)
    {
        \Log::info('Raw request input', $req->all());
        try {
            \Log::info('Start booking store...');
            $data = $req->validated();
            \Log::info('Validated booking data:', $data);

            if (!Room::on('pgsql_room')->where('id', $data['room_id'])->exists()) {
                return response()->json(['message' => 'Invalid room'], 422);
            }

            if (Booking::hasConflict($data['room_id'], $data['start_time'], $data['end_time'])) {
                return response()->json(['message' => 'Time slot is already booked.'], 422);
            }

            $booking = Booking::create($data);
            return response()->json($booking, 201);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Server error',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }


    public function update(UpdateBookingRequest $req, Booking $booking)
    {
        $data = $req->validated();

        if (
            isset($data['start_time'], $data['end_time']) &&
            Booking::hasConflict($data['room_id'], $data['start_time'], $data['end_time'], $booking->id)
        ) {
            return response()->json(['message' => 'Time slot is already booked.'], 422);
        }

        return response()->json(tap($booking)->update($data));
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();
        return response()->noContent();
    }
}
