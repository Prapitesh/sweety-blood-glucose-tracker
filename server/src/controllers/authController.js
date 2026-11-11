import * as authService from '../services/authService.js';

export async function register(req, res) {
  const user = await authService.register(req.body);
  const token = authService.createToken(user);
  res.status(201).json({ user, token });
}

export async function login(req, res) {
  const user = await authService.login(req.body);
  const token = authService.createToken(user);
  res.json({ user, token });
}
