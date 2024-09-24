import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import * as bcrypt from 'bcryptjs';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>) { }

  getHashPassword(password: string) {
    let salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, address, phone } = createUserDto;


    let data = await this.userModel.create({
      name: name,
      email: email,
      password: this.getHashPassword(password),
      address: address,
      phone: phone
    });

    return {
      _id: data?._id,
      createdAt: data?.createdAt
    }
  }

  async findAll(currentPage: number, pageSize: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.currentPage;
    delete filter.pageSize;

    const defaultlimit = +pageSize ? +pageSize : 10
    const offset = (+currentPage - 1) * defaultlimit

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultlimit);

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultlimit)
      .sort(sort as any)
      .select(projection)
      .populate(population)
      .exec()

    return {
      meta: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: currentPage,
        pageSize: pageSize,
      },
      result
    };
  }

  async findOne(id: string) {
    return await this.userModel.findById(id);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findName(username: string) {
    return await this.userModel.findOne({ email: username });
  }

  checkPass(pass: string, hash: string) {
    return bcrypt.compareSync(pass, hash);
  }
}
