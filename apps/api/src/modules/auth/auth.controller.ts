import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../shared/config/database.js';
import { hashPassword, comparePassword, generateToken } from '../../shared/utils/auth.util.js';
import { successResponse } from '../../shared/utils/response.util.js';
import { AppError } from '../../shared/middleware/error.middleware.js';
import { RegisterInput, LoginInput } from './auth.schema.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role, firstName, lastName, phone } = req.body as RegisterInput;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(400, 'User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        phone,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json(
      successResponse(
        {
          user,
          token,
        },
        'User registered successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json(
      successResponse(
        {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
          },
          token,
        },
        'Login successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
};

