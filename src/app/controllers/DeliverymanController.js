import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      avatar_id: Yup.number(),
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

    const { id, name, email, avatar_id } = await Deliveryman.create(req.body);

    return res.json({ id, name, email, avatar_id });
  }

  async index(req, res) {
    const deliverymans = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymans);
  }

  async update(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const { name, email, avatar_id } = req.body;

    const deliverymanUpdated = await Deliveryman.update(
      {
        name,
        email,
        avatar_id,
      },
      {
        where: { id },
        returning: true,
        plain: true,
      }
    );

    return res.json(deliverymanUpdated[1]);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    await Deliveryman.destroy(id);

    return res.status(204).send();
  }
}

export default new DeliverymanController();
