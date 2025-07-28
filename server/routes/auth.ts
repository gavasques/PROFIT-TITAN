import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { hashPassword, comparePassword, generateToken, authenticateToken } from '../auth';
import { loginSchema, registerSchema } from '../../shared/schema';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(validatedData.password);
    const newUser = await storage.createUser({
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    // Return user data without password
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: error.errors 
      });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    // Find user by email
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: error.errors 
      });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Get current user (protected route)
router.get('/user', async (req, res) => {
  try {
    // In development mode with SKIP_AUTH, return mock user without token validation
    if (process.env.SKIP_AUTH === 'true') {
      const mockUser = {
        id: 'dev-user-123',
        email: 'dev@local.dev',
        firstName: 'Developer',
        lastName: 'Local',
        profileImageUrl: null,
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return res.json(mockUser);
    }
    
    // In production, use token authentication
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify token and get user  
    const { verifyToken } = await import('../auth.js');
    const decoded = verifyToken(token);
    const { userId } = decoded as any;
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Logout user (clear session/token)
router.post('/logout', async (req, res) => {
  try {
    // In development mode with SKIP_AUTH, just return success
    if (process.env.SKIP_AUTH === 'true') {
      return res.json({ message: 'Logout realizado com sucesso' });
    }
    
    // In production, the token is managed client-side (JWT)
    // So we just return success - the client will remove the token
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;