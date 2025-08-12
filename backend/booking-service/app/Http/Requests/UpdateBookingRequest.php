<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
public function authorize(): bool
{
    return true;
}

protected function prepareForValidation(): void
    {
        if ($this->route('booking')) {
            // kalau route bindingnya Route::put('/bookings/{booking}')
            $this->merge([
                'id' => $this->route('booking')->id,
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
public function rules(): array
{
    return [
        'id' => 'required|integer|exists:bookings,id',
        'room_id' => 'required|integer',
        'start_time' => 'sometimes|required|date|before:end_time',
        'end_time' => 'sometimes|required|date|after:start_time',
        'status' => 'sometimes|required|in:pending,confirmed,cancelled',
        'purpose' => 'required|string'
    ];
}
}
