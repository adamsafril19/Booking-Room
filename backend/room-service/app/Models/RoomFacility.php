<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomFacility extends Model
{
    protected $connection = 'pgsql_room';
    protected $fillable = ['room_id','facility_name'];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
