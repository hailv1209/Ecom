import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findName(username);
        if (user) {
            const IsValidPass = this.usersService.checkPass(pass, user.password)
            if (IsValidPass) return user
        }
        return null;
    };

    async login(user: IUser, response: Response) {
        const { _id, name, email } = user
        const payload = {
            sub: "token login",
            iss: "from server",
            _id: _id,
            name: name,
            email: email
        };

        //create refresh token
        const refreshToken = this.createRefreshToken(payload)

        //update user with refresh_token created
        await this.usersService.updateUserToken(refreshToken, _id)

        //save refresh_token as cookies
        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000
        })


        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email
            }
        };
    }
    createRefreshToken(payload: { sub: string; iss: string; _id: any; name: any; email: any; }) {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000
        });
        return refresh_token
    }

    async processNewToken(refresh_token: string, response: Response) {
        try {
            this.jwtService.verify(refresh_token, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
            })
            let user = await this.usersService.findUserByToken(refresh_token);
            if (user) {
                const { _id, name, email } = user
                const payload = {
                    sub: "refresh access token login",
                    iss: "from server",
                    _id: _id,
                    name: name,
                    email: email
                };

                //create refresh token
                const refreshToken = this.createRefreshToken(payload)

                //update user with refresh_token created
                await this.usersService.updateUserToken(refreshToken, _id.toString())

                //save refresh_token as cookies
                response.clearCookie('refresh_token');
                response.cookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000
                })


                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        name,
                        email
                    }
                };
            } else {
                throw new BadRequestException('Refresh Token is not valid ! Please try to login again.')
            }

        } catch (error) {
            throw new BadRequestException('Refresh Token is not valid ! Please try to login again.')
        }
    };

    async processLogOut(user: IUser, response: Response) {
        await this.usersService.updateUserToken('', user._id);
        response.clearCookie('refresh_token');
        return "Ok"
    };
}