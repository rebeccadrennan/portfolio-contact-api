process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'https://www.rebeccadrennan.co.uk';
process.env.RESEND_API_KEY = 're_test_key';
process.env.CONTACT_TO_EMAIL = 'owner@example.com';

import request from 'supertest';

import app from '../src/app';

// Mock the email service so no real email API calls are made
jest.mock('../src/services/email.service', () => ({
  sendContactEmail: jest.fn().mockResolvedValue(undefined),
}));

import { sendContactEmail } from '../src/services/email.service';

const mockedSendContactEmail = jest.mocked(sendContactEmail);

const validBody = {
  name: 'Rebecca Drennan',
  email: 'person@example.com',
  subject: 'Job opportunity',
  message: 'Hello Rebecca, I would love to chat about a role.',
};

describe('POST /api/contact', () => {
  beforeEach(() => {
    mockedSendContactEmail.mockClear();
  });

  // ─── Success ──────────────────────────────────────────────────────────────

  it('returns 200 and success:true for a valid request', async () => {
    const res = await request(app).post('/api/contact').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Message sent successfully.');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(mockedSendContactEmail).toHaveBeenCalledTimes(1);
    expect(mockedSendContactEmail).toHaveBeenCalledWith({
      name: validBody.name,
      email: validBody.email,
      subject: validBody.subject,
      message: validBody.message,
    });
  });

  it('trims whitespace from inputs before sending', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validBody, name: '  Rebecca  ', subject: '  Job  ' });

    expect(res.status).toBe(200);
    const callArg = mockedSendContactEmail.mock.calls[0][0];
    expect(callArg.name).toBe('Rebecca');
    expect(callArg.subject).toBe('Job');
  });

  // ─── Missing Fields ───────────────────────────────────────────────────────

  it('returns 422 when name is missing', async () => {
    const body = { ...validBody };
    delete body.name;
    const res = await request(app).post('/api/contact').send(body);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Please check the form fields.');
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'name' })])
    );
    expect(mockedSendContactEmail).not.toHaveBeenCalled();
  });

  it('returns 422 when email is missing', async () => {
    const body = { ...validBody };
    delete body.email;
    const res = await request(app).post('/api/contact').send(body);

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })])
    );
  });

  it('returns 422 when subject is missing', async () => {
    const body = { ...validBody };
    delete body.subject;
    const res = await request(app).post('/api/contact').send(body);

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'subject' })])
    );
  });

  it('returns 422 when message is missing', async () => {
    const body = { ...validBody };
    delete body.message;
    const res = await request(app).post('/api/contact').send(body);

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'message' })])
    );
  });

  it('returns 422 when all fields are missing', async () => {
    const res = await request(app).post('/api/contact').send({});

    expect(res.status).toBe(422);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(4);
  });

  // ─── Invalid Email ────────────────────────────────────────────────────────

  it('returns 422 for an invalid email address', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })])
    );
  });

  // ─── Message Too Short ────────────────────────────────────────────────────

  it('returns 422 when message is fewer than 10 characters', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validBody, message: 'Hi' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'message' })])
    );
  });

  // ─── Field Length Limits ──────────────────────────────────────────────────

  it('returns 422 when name exceeds 100 characters', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validBody, name: 'A'.repeat(101) });

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'name' })])
    );
  });

  it('returns 422 when message exceeds 2000 characters', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validBody, message: 'A'.repeat(2001) });

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'message' })])
    );
  });

  // ─── Injection Rejection ─────────────────────────────────────────────────

  it('returns 422 when name contains HTML tags', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validBody, name: '<script>alert(1)</script>' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'name' })])
    );
  });

  it('returns 422 when message contains a javascript: URL', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validBody, message: 'Click here: javascript:alert(1) for details.' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'message' })])
    );
  });

  // ─── Email Service Failure ────────────────────────────────────────────────

  it('returns 500 when the email service throws', async () => {
    mockedSendContactEmail.mockRejectedValueOnce(new Error('Email API request failed'));

    const res = await request(app).post('/api/contact').send(validBody);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.requestId).toBeTruthy();
  });

  // ─── CORS ───────────────────────────────────────────────────────────────────

  it('OPTIONS /api/contact allows preflight from https://www.rebeccadrennan.co.uk', async () => {
    const res = await request(app)
      .options('/api/contact')
      .set('Origin', 'https://www.rebeccadrennan.co.uk')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('https://www.rebeccadrennan.co.uk');
    expect(res.headers['access-control-allow-methods']).toContain('GET');
    expect(res.headers['access-control-allow-methods']).toContain('POST');
    expect(res.headers['access-control-allow-methods']).toContain('OPTIONS');
    expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
  });

  it('OPTIONS /api/contact allows preflight from https://rebeccadrennan.co.uk', async () => {
    const res = await request(app)
      .options('/api/contact')
      .set('Origin', 'https://rebeccadrennan.co.uk')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('https://rebeccadrennan.co.uk');
  });

  it('rejects OPTIONS preflight from an unknown origin', async () => {
    const res = await request(app)
      .options('/api/contact')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  // ─── Service Metadata & Health Check ─────────────────────────────────────

  it('GET / returns API metadata and links', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('portfolio-contact-api');
    expect(res.body.docs).toBe('/docs');
    expect(res.body.openApi).toBe('/openapi.json');
    expect(res.body.health).toBe('/health');
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('portfolio-contact-api');
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.environment).toBe('test');
    expect(typeof res.body.uptimeSeconds).toBe('number');
    expect(res.body.startedAt).toBeTruthy();
    expect(res.body.timestamp).toBeTruthy();
  });

  it('GET /openapi.json returns OpenAPI document', async () => {
    const res = await request(app).get('/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.1.0');
    expect(res.body.paths['/api/contact']).toBeDefined();
  });

  it('GET /docs returns HTML docs page', async () => {
    const res = await request(app).get('/docs');
    expect(res.status).toBe(200);
    expect(res.type).toMatch(/html/);
    expect(res.text).toContain('/docs/swagger-initializer.js');
  });

  // ─── 404 ──────────────────────────────────────────────────────────────────

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
