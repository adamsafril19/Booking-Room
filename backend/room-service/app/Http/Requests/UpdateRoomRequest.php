<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'=>'sometimes|required|string|max:100',
            'capacity'=>'sometimes|required|integer|min:1',
            'location'=>'nullable|string|max:150',
            'facilities'=>'nullable|array',
            'facilities.*'=>'string|max:100',
        ];
    }
}
