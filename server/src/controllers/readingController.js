import * as service from "../services/readingService.js";

export async function list(req, res) {
  res.json(await service.listReadings(req.user.id, req.query));
}
export async function create(req, res) {
  res.status(201).json({ reading: await service.createReading(req.user.id, req.body) });
}
export async function update(req, res) {
  res.json({ reading: await service.updateReading(req.user.id, req.params.id, req.body) });
}
export async function remove(req, res) {
  await service.deleteReading(req.user.id, req.params.id);
  res.status(204).send();
}
export async function reports(req, res) {
  res.json(await service.getReports(req.user.id, req.query.date));
}
