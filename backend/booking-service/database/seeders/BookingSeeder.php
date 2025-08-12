<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Booking;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // Hapus data lama untuk menghindari duplikasi saat seeder dijalankan ulang
        Booking::truncate();

        // Daftar status yang mungkin untuk booking
        $statuses = ['pending', 'confirmed', 'cancelled'];
        $validRoomIds = [1, 3, 4, 5, 6];

        // Buat 20 data booking palsu
        foreach (range(1, 20) as $index) {
            // Buat waktu mulai secara acak dalam rentang 10 hari ke depan
            $startTime = Carbon::now()
                ->addDays(rand(0, 10))
                ->addHours(rand(8, 18)) // Jam kerja antara 8 pagi sampai 6 sore
                ->setMinutes(0)
                ->setSeconds(0);

            // Buat waktu selesai 1 sampai 3 jam setelah waktu mulai
            // Gunakan ->copy() agar tidak mengubah variabel $startTime asli
            $endTime = $startTime->copy()->addHours(rand(1, 3));
             // Pilih room_id secara acak dari array $validRoomIds
             $roomId = $validRoomIds[array_rand($validRoomIds)];

            Booking::create([
                'room_id' => $roomId,

                // ATURAN: user_id hanya boleh 1
                'user_id' => 1,

                'start_time' => $startTime,
                'end_time' => $endTime,
                'status' => $statuses[array_rand($statuses)], // Pilih status secara acak
            ]);
        }
    }
}
