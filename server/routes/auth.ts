import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { hashPassword, comparePassword, generateToken, authenticateToken } from '../auth';
import { getUserId } from '../authUtils';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../../shared/schema';
import { emailService } from '../emailService';
import { randomBytes } from 'crypto';

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
router.get('/user', authenticateToken, async (req: any, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Dados de usuário não encontrados' });
    }
    
    const userId = req.user.userId;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Logout user (clear session/token)
router.post('/logout', async (req, res) => {
  try {
    // JWT tokens are managed client-side, so just return success
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Forgot password - send reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    
    // Check if user exists
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({ message: 'Se o email existir no sistema, você receberá um código de recuperação' });
    }

    // Generate reset token and 6-digit code
    const resetToken = randomBytes(32).toString('hex');
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save reset token in database
    await storage.createPasswordResetToken({
      userId: user.id,
      token: resetToken,
      code: resetCode,
      expiresAt,
      isUsed: false,
    });

    // Send email with reset code
    await emailService.sendPasswordResetEmail(user.email, resetCode);

    res.json({ 
      message: 'Código de recuperação enviado para seu email',
      token: resetToken // Return token for the reset form
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: error.errors 
      });
    }
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Erro ao processar solicitação' });
  }
});

// Reset password with code
router.post('/reset-password', async (req, res) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    
    // Find reset token
    const resetToken = await storage.getPasswordResetToken(validatedData.token);
    if (!resetToken) {
      return res.status(400).json({ message: 'Token de recuperação inválido' });
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({ message: 'Código de recuperação expirado' });
    }

    // Check if token is already used
    if (resetToken.isUsed) {
      return res.status(400).json({ message: 'Código de recuperação já foi utilizado' });
    }

    // Verify code
    if (resetToken.code !== validatedData.code) {
      return res.status(400).json({ message: 'Código de recuperação inválido' });
    }

    // Get user and update password
    const user = await storage.getUser(resetToken.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(validatedData.password);
    await storage.updateUserPassword(user.id, hashedPassword);

    // Mark token as used
    await storage.markPasswordResetTokenUsed(resetToken.id);

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: error.errors 
      });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
});

// Administrative route to change user password (now creates user for guilherme@profithub.com)
router.post('/admin/change-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email e nova senha são obrigatórios' });
    }

    // Check if user exists
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Create user if doesn't exist
      const hashedPassword = await hashPassword(newPassword);
      const [firstName, lastName] = email.split('@')[0].split('.').map((name: string) => 
        name.charAt(0).toUpperCase() + name.slice(1)
      );
      
      user = await storage.createUser({
        email: email,
        password: hashedPassword,
        firstName: firstName || 'Usuário',
        lastName: lastName || 'Sistema',
      });
      
      return res.json({ 
        message: 'Usuário criado com sucesso',
        user: { email: user.email, id: user.id }
      });
    } else {
      // Update existing user password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      
      return res.json({ 
        message: 'Senha alterada com sucesso',
        user: { email: user.email, id: user.id }
      });
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;