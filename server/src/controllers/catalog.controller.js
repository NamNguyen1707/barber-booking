const repo = require('../repositories/catalog.repository');
const slots = require('../services/slots.service');

exports.services = async (req, res) => res.json(await repo.getServices());
exports.barbers = async (req, res) => res.json(await repo.getBarbers());
exports.slots = async (req, res) => res.json(await slots.getFreeSlots(req.query));