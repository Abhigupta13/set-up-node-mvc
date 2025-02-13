// JavaScript template content

const jsTemplates = {
    userController: `
        const UserService = require('../services/userService');

        const create = async (req, res) => {
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
            } catch (error) {
                return res.status(error.statusCode || 500).json({
                    message: error.message,
                    data: {},
                    success: false,
                    err: error.explanation || error
                });
            }
        };

        const signIn = async (req, res) => {
            try {
                const response = await UserService.loginUser(req.body.email, req.body.password);
                return res.status(200).json({
                    success: true,
                    data: response,
                    err: {},
                    message: 'Successfully signed in'
                });
            } catch (error) {
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
        const UserRepository = require('../repositories/userRepository');
        const { JWT_KEY } = require('../config/serverConfig');

        const userRepository = new UserRepository();

        const registerUser = async (userData) => {
            const existingUser = await userRepository.findUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('User already exists');
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const newUser = await userRepository.createUser({ ...userData, password: hashedPassword });
            return newUser;
        };

        const loginUser = async (email, plainPassword) => {
            const user = await userRepository.findUserByEmail(email);
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

        const create = async (data) => {
            try {
                const user = await User.create(data);
                return user;
            } catch (error) {
                throw { error };
            }
        };

        const findUserByEmail = async (email) => {
            return await User.findOne({ where: { email } });
        };

        module.exports = {
            create,
            findUserByEmail
        };
    `,
    userRoute: `
        const express = require('express');
        const { create, signIn } = require('../controllers/userController');

        const router = express.Router();

        router.post('/signup', create);
        router.post('/signin', signIn);

        module.exports = router;
    `
};

module.exports = jsTemplates;