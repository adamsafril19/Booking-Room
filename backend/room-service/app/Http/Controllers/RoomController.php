<?php

namespace App\Http\Controllers;
use App\Models\Room;
use App\Models\RoomFacility;
use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;

class RoomController extends Controller
{
    public function index()
    {
        return Room::with('facilities')->get();
    }

    public function show(Room $room)
    {
        return $room->load('facilities');
    }

    public function store(StoreRoomRequest $req)
    {
        $room = Room::create($req->only('name','capacity','location'));
        if ($req->filled('facilities')) {
            foreach ($req->facilities as $f) {
                $room->facilities()->create(['facility_name'=>$f]);
            }
        }
        return response()->json($room->load('facilities'),201);
    }

    public function update(UpdateRoomRequest $req, Room $room)
    {
        $room->update($req->only('name','capacity','location'));
        if ($req->filled('facilities')) {
            $room->facilities()->delete();
            foreach ($req->facilities as $f) {
                $room->facilities()->create(['facility_name'=>$f]);
            }
        }
        return $room->load('facilities');
    }

    public function destroy(Room $room)
    {
        $room->delete();
        return response()->noContent();
    }
}
