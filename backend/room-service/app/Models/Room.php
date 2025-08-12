<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $connection = 'pgsql_room';
    protected $fillable = ['name','capacity','location'];

    public function facilities()
    {
        return $this->hasMany(RoomFacility::class);
    }
}
