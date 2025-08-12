<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
Schema::create('bookings', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('room_id');
    $table->unsignedBigInteger('user_id');
    $table->timestampTz('start_time');
    $table->timestampTz('end_time');
    $table->string('status')->default('pending');
    $table->text('purpose')->nullable();
    $table->timestamps();
    $table->index(['room_id','start_time','end_time'], 'idx_booking_room_time');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
