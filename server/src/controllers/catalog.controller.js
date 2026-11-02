const repo = require('../repositories/catalog.repository');
const slots = require('../services/slots.service');

exports.listServices = async (req, res) => res.json(await repo.listServices());
exports.listBarbers = async (req, res) => res.json(await repo.listBarbers());
exports.getSlots = async (req, res) => res.json(await slots.getSlots(req.query));
