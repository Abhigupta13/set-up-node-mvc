// TypeScript template content

const tsTemplates = {
    userController: `
        const { Request, Response } = require('express');
        const { registerUser, loginUser } = require('../services/userService');

        const create = async (req: Request, res: Response): Promise<Response> => {
            try {
                const response = await registerUser({
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
                const response = await loginUser(req.body.email, req.body.password);
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
        const { createUser, findUserByEmail } = require('../repositories/userRepository');
        const { JWT_KEY } = require('../config/serverConfig');

        interface UserData {
            email: string;
            password: string;
        }

        const registerUser = async (userData: UserData): Promise<any> => {
            const existingUser = await findUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('User already exists');
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const newUser = await createUser({ 
                ...userData, 
                password: hashedPassword 
            });
            return newUser;
        };

        const loginUser = async (email: string, plainPassword: string): Promise<string> => {
            const user = await findUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            const isMatch = await bcrypt.compare(plainPassword, user.password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }

            const token = jwt.sign({ id: user.id }, JWT_KEY, { expiresIn: '1h' });
            return token;
        };

        module.exports = {
            registerUser,
            loginUser
        };
    `,
    userRepository: `
        const { User } = require('../models/user');

        interface UserAttributes {
            email: string;
            password: string;
        }

        const createUser = async (data: UserAttributes): Promise<any> => {
            try {
                const user = await User.create(data);
                return user;
            } catch (error) {
                throw { error };
            }
        };

        const findUserByEmail = async (email: string): Promise<any> => {
            return await User.findOne({ where: { email } });
        };

        module.exports = {
            createUser,
            findUserByEmail
        };
    `,
};
