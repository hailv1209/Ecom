import { IsEmail, IsNotEmpty, IsPhoneNumber } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: 'Name is not allow null' })
    name: string;

    @IsNotEmpty({ message: 'Email is not allow null' })
    @IsEmail({}, { message: 'Email wrong format' })
    email: number;

    @IsNotEmpty({ message: 'Password is not allow null' })
    password: string;

    @IsNotEmpty({ message: 'Address is not allow null' })
    address: string;

    @IsNotEmpty({ message: 'Phone is not allow null' })
    @IsPhoneNumber('VN')
    phone: number;


}
