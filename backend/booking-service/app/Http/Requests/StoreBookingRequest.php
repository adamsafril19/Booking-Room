<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
public function authorize(): bool
{
    \Log::info('StoreBookingRequest@authorize called');
    return true;
}

public function prepareForValidation(): void
{
    if ($this->hasHeader('X-User-Id')) {
        $this->merge([
            'user_id' => $this->header('X-User-Id'),
        ]);
    }
}


protected function failedValidation(Validator $validator)
{
    \Log::error('Validation failed:', $validator->errors()->toArray());

    throw new HttpResponseException(response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors(),
    ], 422));
}

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
public function rules(): array
{
    \Log::info('StoreBookingRequest@rules called');
    return [
        'room_id' => 'required|integer',
        'user_id' => 'required|integer',
        'start_time' => 'required|date|before:end_time',
        'end_time' => 'required|date|after:start_time',
        'purpose'    => 'required|string',
    ];
}
}
