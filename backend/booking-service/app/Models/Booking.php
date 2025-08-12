<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $connection = 'pgsql_booking';
    protected $fillable = [
        'room_id','user_id','start_time','end_time','status', 'purpose',
    ];

    public static function hasConflict($room_id, $start_time, $end_time, $excludeBookingId = null): bool
    {
        return self::where('room_id', $room_id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($start_time, $end_time) {
                $query->whereBetween('start_time', [$start_time, $end_time])
                    ->orWhereBetween('end_time', [$start_time, $end_time])
                    ->orWhere(function ($q) use ($start_time, $end_time) {
                        $q->where('start_time', '<=', $start_time)
                            ->where('end_time', '>=', $end_time);
                    });
            })
            ->when($excludeBookingId, fn($q) => $q->where('id', '!=', $excludeBookingId))
            ->exists();
    }

}
