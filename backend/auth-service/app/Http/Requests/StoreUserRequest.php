<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true; // Will be updated with proper Gate check
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|min:8',
            'is_active' => 'sometimes|boolean',
            'roles'        => 'sometimes|array|exists:roles,id',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'name.required' => 'Nama harus diisi',
            'email.required' => 'Email harus diisi',
            'email.email' => 'Email harus berupa alamat email yang valid',
            'email.unique' => 'Email sudah digunakan',
            'password.required' => 'Password harus diisi',
            'password.min' => 'Password minimal 8 karakter',
            'is_active.boolean' => 'Is Active harus berupa boolean',
            'roles.array' => 'Role harus berupa array',
            'roles.exists' => 'Role yang dipilih tidak valid'
        ];
    }

    public function getValidatorInstance(): \Illuminate\Contracts\Validation\Validator
    {
        $validator = parent::getValidatorInstance();

        // Hash the password when validating to prevent confirmation
        if ($this->password) {
            $validator->after(function ($validator) {
                $this->merge(['password' => Hash::make($this->password)]);
            });
        }

        return $validator;
    }
}
