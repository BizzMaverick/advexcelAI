// Simple authentication service with mock user database

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
}

// Mock user database
const users: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'password123'
  },
  {
    id: '2',
    email: 'admin@advexcel.com',
    name: 'Admin User',
    password: 'admin123'
  }
];

// In a real application, this would be a secure hash function
const hashPassword = (password: string): string => {
  return password; // This is just a placeholder - NEVER do this in production
};

export const authService = {
  // Login a user
  login: async (email: string, password: string): Promise<User | null> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.password !== hashPassword(password)) {
      throw new Error('Invalid password');
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },
  
  // Register a new user
  register: async (email: string, password: string, name: string): Promise<User | null> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    // Create new user
    const newUser: User = {
      id: (users.length + 1).toString(),
      email,
      name,
      password: hashPassword(password)
    };
    
    // Add to mock database
    users.push(newUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword as User;
  },
  
  // Verify email with code
  verifyEmail: async (email: string, code: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, we would check the code against one sent to the user's email
    // For this demo, we'll accept "123456" as a valid code
    return code === '123456';
  }
};

export default authService;