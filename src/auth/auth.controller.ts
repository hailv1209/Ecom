import { Controller, Request, Post, UseGuards, Get, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { Response } from 'express';

@Controller("auth")
export class AuthsController {

    constructor(private authService: AuthService) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async login(@Request() req, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }

    @Get('account')
    async getAccount(@User() user: IUser) {
        return { user }
    }

    @Get('refresh')
    async handleRefreshToken(@Request() req, @Res({ passthrough: true }) response: Response) {
        const refresh_token = req.cookies['refresh_token'];
        return this.authService.processNewToken(refresh_token, response)
    }

    @Post('logout')
    async handleLogOut(@User() user: IUser, @Res({ passthrough: true }) response: Response) {
        return this.authService.processLogOut(user, response);
    }
}