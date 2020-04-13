import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      cep: Yup.number().required().positive().integer(),
      address: Yup.string().required(),
      address_number: Yup.number().required().positive().integer(),
      address_complement: Yup.string(),
      address_city: Yup.string().required(),
      address_state: Yup.string().required(),
    });

    /* const userExists = await Recipient.findOne({
      where: { name: req.body.name },
    });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    } */

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, name } = await Recipient.create(req.body);

    return res.json({ id, name });
  }

  async index(req, res) {
    const recipients = await Recipient.findAll({
      attributes: [
        'id',
        'name',
        'cep',
        'address',
        'address_number',
        'address_complement',
        'address_city',
        'address_state',
      ],
    });

    return res.json(recipients);
  }

  async update(req, res) {
    return res.json({ ok: true });
  }

  async delete(req, res) {
    return res.json({ ok: true });
  }
}

export default new RecipientController();
