// Persistent mock database for testing
export interface MockUser {
  id: string
  email: string
  password: string
  name?: string | null
  role: 'CUSTOMER' | 'PROVIDER'
  createdAt: Date
  updatedAt: Date
}

class MockDatabase {
  private users: Map<string, MockUser> = new Map()
  private emailIndex: Map<string, string> = new Map()

  async findUserByEmail(email: string): Promise<MockUser | null> {
    const id = this.emailIndex.get(email)
    if (!id) return null
    return this.users.get(id) || null
  }

  async findUserById(id: string): Promise<MockUser | null> {
    return this.users.get(id) || null
  }

  async createUser(data: Partial<MockUser>): Promise<MockUser> {
    const user: MockUser = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      email: data.email || '',
      password: data.password || '',
      name: data.name || null,
      role: data.role || 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.set(user.id, user)
    this.emailIndex.set(user.email, user.id)
    console.log(`[MockDB] Created user: ${user.email} (${user.id})`)
    return user
  }

  async updateUser(id: string, data: Partial<MockUser>): Promise<MockUser | null> {
    const user = this.users.get(id)
    if (!user) return null
    
    const updated: MockUser = {
      ...user,
      ...data,
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    }
    this.users.set(id, updated)
    console.log(`[MockDB] Updated user: ${updated.email}`)
    return updated
  }

  async deleteUser(id: string): Promise<MockUser | null> {
    const user = this.users.get(id)
    if (!user) return null
    
    this.users.delete(id)
    this.emailIndex.delete(user.email)
    console.log(`[MockDB] Deleted user: ${user.email}`)
    return user
  }

  async getAllUsers(): Promise<MockUser[]> {
    return Array.from(this.users.values())
  }

  async clear(): Promise<void> {
    this.users.clear()
    this.emailIndex.clear()
    console.log('[MockDB] Cleared all data')
  }

  getStats() {
    return {
      totalUsers: this.users.size,
      users: Array.from(this.users.values()).map(u => ({ id: u.id, email: u.email, role: u.role }))
    }
  }
}

// Global singleton instance
export const mockDB = new MockDatabase()
