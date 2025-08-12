<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportRequest extends Model
{
    use HasFactory;

    protected $connection = 'pgsql_reporting';
    protected $fillable = [
        'user_id',
        'report_type',
        'parameters',
        'status',
        'completed_at'
    ];

    protected $casts = [
        'parameters' => 'array',
        'completed_at' => 'datetime'
    ];

    public function logs()
    {
        return $this->hasMany(ReportLog::class, 'request_id');
    }
}
