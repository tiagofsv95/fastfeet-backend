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
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const {
      name,
      cep,
      address,
      address_number,
      address_complement,
      address_city,
      address_state,
    } = req.body;

    const recipientUpdated = await Recipient.update(
      {
        name,
        cep,
        address,
        address_number,
        address_complement,
        address_city,
        address_state,
      },
      {
        where: { id },
        returning: true,
        plain: true,
      }
    );

    return res.json(recipientUpdated[1]);
  }

  async delete(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    await Recipient.destroy(id);

    return res.status(204).send();
  }
}

export default new RecipientController();
