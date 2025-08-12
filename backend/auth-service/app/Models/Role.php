<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $connection = 'pgsql_auth';
    // Jika nama tabel di DB bukan 'roles', atur secara eksplisit
    protected $table = 'roles';

    // Field yang boleh diisi secara mass-assignment
    protected $fillable = [
        'name',
        'description'
    ];

    // Contoh relasi: satu role dimiliki banyak user
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
