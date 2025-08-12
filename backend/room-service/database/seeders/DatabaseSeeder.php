<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed users
        \App\Models\User::factory(10)->create();

        // Seed rooms
        \App\Models\Room::insert([
            [
                'name' => 'Meeting Room A',
                'capacity' => 10,
                'location' => 'Lantai 1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Meeting Room B',
                'capacity' => 20,
                'location' => 'Lantai 2',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed room facilities
        \App\Models\RoomFacility::insert([
            [
                'room_id' => 1,
                'facility_name' => 'Projector',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'room_id' => 1,
                'facility_name' => 'Whiteboard',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'room_id' => 2,
                'facility_name' => 'Conference Phone',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
