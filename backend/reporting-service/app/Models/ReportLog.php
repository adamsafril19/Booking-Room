<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportLog extends Model
{
    use HasFactory;

    protected $connection = 'pgsql_reporting';

    protected $fillable = [
        'request_id',
        'message',
        'logged_at'
    ];

    protected $casts = [
        'logged_at' => 'datetime'
    ];

    public function request()
    {
        return $this->belongsTo(ReportRequest::class, 'request_id');
    }
}
