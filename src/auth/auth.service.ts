import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findName(username);
        if (user) {
            const IsValidPass = this.usersService.checkPass(pass, user.password)
            if (IsValidPass) return user
        }
        return null;
    };

    async login(user: any) {
        const { _id, name, email } = user
        const payload = {
            sub: "token login",
            iss: "from server",
            _id: _id,
            name: name,
            email: email
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email
            }
        };
    }
}