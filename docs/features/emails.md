# Email Features

The framework provides multiple email strategies for authentication.

## Email Strategies

### JS Package Strategy
- Basic JavaScript package for email functionality
- Intended for development environments
- Not optimal for spam prevention but necessary for native development

### Resend Plugin Strategy
- Direct Resend plugin integration
- Production-ready email delivery
- Reliable email service integration

## Email Authentication Features

### Verification Emails
- **Email Verification**: Send confirmation emails after user registration
- **Verification Tokens**: Secure token generation and validation
- **Customizable Templates**: Editable email templates in HTML/CSS

### Password Reset
- **Reset Flow**: Complete password reset flow with email links
- **Expiration**: Configurable token expiration
- **Security**: One-time use tokens

### Security Codes
- **OTP Generation**: One-time password codes for 2FA and login verification
- **Expiration Control**: Configurable code expiration times
- **Retry Limits**: Prevention of brute force attacks

## Plugin Extension System

### Custom Email Plugins

The framework supports custom email plugins for different services:

```typescript
// Custom email plugin structure
interface EmailPlugin {
  name: string;
  strategy: 'smtp' | 'api' | 'service';
  setup: (config: EmailConfig) => EmailProvider;
  send: (email: EmailData) => Promise<EmailResult>;
  templates?: {
    [key: string]: EmailTemplate;
  };
}

// Example custom SMTP plugin
const smtpPlugin: EmailPlugin = {
  name: 'smtp-email',
  strategy: 'smtp',
  setup: (config) => {
    return createSMTPTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.auth
    })
  }
}
```

## Template Management

### Email Templates

- **HTML Templates**: Support for custom HTML email design
- **Responsive Design**: Mobile-friendly email layouts
- **Variable Substitution**: Dynamic content insertion
- **Pre-built Templates**: Ready-to-use templates for common use cases

```typescript
// Template example - verification email
const verificationTemplate = `
  <html>
    <body>
      <h2>Welcome to DeesseJS!</h2>
      <p>Please verify your email address to complete your registration:</p>
      <a href="{{verificationUrl}}">Verify Your Email</a>
      <p>Verification code: {{code}}</p>
      <p>This link will expire in {{expirationMinutes}} minutes.</p>
    </body>
  </html>
`
```

## Configuration Options

### Common Configuration

```typescript
interface EmailConfig {
  strategy: 'js-package' | 'resend' | 'smtp' | 'custom';
  provider: string;
  options: {
    from: string;
    templates?: Record<string, string>;
    debug?: boolean;
    analytics?: boolean;
    tracking?: boolean;
    retryAttempts?: number;
    timeout?: number;
  };
  envSpecific: {
    development: {
      provider?: string;
      options?: any;
    };
    production: {
      provider?: string;
      options?: any;
    };
  };
}
```

## Security Considerations

- **Token Security**: Secure, random token generation
- **Rate Limiting**: Prevention of email spam attacks
- **Expiration**: Automatic token and code expiration
- **Error Handling**: Graceful handling of email delivery failures
- **Logging**: Comprehensive email activity logging

## Integration with Authentication

The email system seamlessly integrates with the Better Auth integration:

```typescript
// Email hooks in authentication flow
import { auth } from '@deessejs/auth';

auth.on('user.registered', async (user) => {
  await sendEmail('verification', {
    to: user.email,
    data: {
      verificationUrl: generateVerificationLink(user.id),
      code: user.verificationCode
    }
  });
});

auth.on('password.reset.requested', async (user) => {
  await sendEmail('passwordReset', {
    to: user.email,
    data: {
      resetUrl: generatePasswordResetLink(user.resetToken),
      expiresAt: user.resetExpires
    }
  });
});
```