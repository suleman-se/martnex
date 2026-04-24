import { Client } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://martnex:martnex_dev_password@localhost:5432/martnex';

export async function getEmailVerificationToken(email: string): Promise<string | null> {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    const res = await client.query(
      'SELECT token FROM email_verification WHERE email = $1 AND used_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    return res.rows[0]?.token || null;
  } catch (error) {
    console.error('Error fetching verification token:', error);
    return null;
  } finally {
    await client.end();
  }
}

export async function getPasswordResetToken(email: string): Promise<string | null> {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    const res = await client.query(
      'SELECT token FROM password_reset WHERE email = $1 AND used_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    return res.rows[0]?.token || null;
  } catch (error) {
    console.error('Error fetching password reset token:', error);
    return null;
  } finally {
    await client.end();
  }
}
