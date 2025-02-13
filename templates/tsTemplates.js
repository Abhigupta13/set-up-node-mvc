// TypeScript template content

const tsTemplates = {
    userController: `
        const { Request, Response } = require('express');
        const { UserService } = require('../services/userService');

        const create = async (req: Request, res: Response): Promise<Response> => {
            try {
                const response = await UserService.registerUser({
                    email: req.body.email,
                    password: req.body.password
                });
                return res.status(201).json({
                    success: true,
                    message: 'Successfully created a new user',
                    data: response,
                    err: {}
                });
            } catch (error: any) {
                return res.status(error.statusCode || 500).json({
                    message: error.message,
                    data: {},
                    success: false,
                    err: error.explanation || error
                });
            }
        };

        const signIn = async (req: Request, res: Response): Promise<Response> => {
            try {
                const response = await UserService.loginUser(req.body.email, req.body.password);
                return res.status(200).json({
                    success: true,
                    data: response,
                    err: {},
                    message: 'Successfully signed in'
                });
            } catch (error: any) {
                return res.status(error.statusCode || 500).json({
                    message: error.message,
                    data: {},
                    success: false,
                    err: error.explanation || error
                });
            }
        };

        module.exports = {
            create,
            signIn
        };
    `,
    userService: `
        const jwt = require('jsonwebtoken');
        const bcrypt = require('bcrypt');
        const { UserRepository } = require('../repositories/userRepository');
        const { JWT_KEY } = require('../config/serverConfig');

        interface UserData {
            email: string;
            password: string;
        }

        class UserService {
            private userRepository: UserRepository;

            constructor() {
                this.userRepository = new UserRepository();
            }

            async registerUser(userData: UserData): Promise<any> {
                const existingUser = await this.userRepository.findUserByEmail(userData.email);
                if (existingUser) {
                    throw new Error('User already exists');
                }

                const hashedPassword = await bcrypt.hash(userData.password, 10);
                const newUser = await this.userRepository.createUser({ 
                    ...userData, 
                    password: hashedPassword 
                });
                return newUser;
            }

            async loginUser(email: string, plainPassword: string): Promise<string> {
                const user = await this.userRepository.findUserByEmail(email);
                if (!user) {
                    throw new Error('User not found');
                }

                const isMatch = await bcrypt.compare(plainPassword, user.password);
                if (!isMatch) {
                    throw new Error('Invalid credentials');
                }

                const token = jwt.sign({ id: user.id }, JWT_KEY, { expiresIn: '1h' });
                return token;
            }
        }

        module.exports = { UserService };
    `,
    userRepository: `
        const { User } = require('../models/user');

        interface UserAttributes {
            email: string;
            password: string;
        }

        class UserRepository {
            async createUser(data: UserAttributes): Promise<any> {
                try {
                    const user = await User.create(data);
                    return user;
                } catch (error) {
                    throw { error };
                }
            }

            async findUserByEmail(email: string): Promise<any> {
                return await User.findOne({ where: { email } });
            }
        }

        module.exports = { UserRepository };
    `,
};

// Example usage
console.log(tsTemplates);