import jwt from 'jsonwebtoken';

export class EphmeralTokenService {
    private readonly SECRET = process.env.EPHMERAL_TOKEN_SECRET || 'default_secret'
    private readonly EXPIRATION = parseInt(process.env.EPHMERAL_TOKEN_EXPIRATION || '3600') // in seconds

    async generateToken(username: string, userId: string, duration: number): Promise<string> {
        try {
            // Implementation to generate a token
            const payload = {
                username,
                sub: userId,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + duration
            }
    
            const token = jwt.sign(payload, this.SECRET);
            return Promise.resolve(token);
        } catch (error) {
            console.error('Error generating token:', error);
            return Promise.reject(error);               
        }
    }
    async validateToken(token: string): Promise<boolean> {
        // Implementation to validate a token
        try {
            const decoded = jwt.verify(token, this.SECRET);

            if (!decoded) {
                return Promise.resolve(false);
            }

            return Promise.resolve(true);
        } catch (error) {
            console.error('Error validating token:', error);
            return Promise.resolve(false);
        }
    }
}