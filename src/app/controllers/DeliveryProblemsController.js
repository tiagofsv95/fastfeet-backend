import * as Yup from 'yup';

import DeliveryProblems from '../models/DeliveryProblems';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Notification from '../schemas/Notification';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const { description } = req.body;

    const orderExists = await Order.findOne({
      where: { id },
    });

    if (!orderExists) {
      return res.status(401).json({ error: 'Order does not exists' });
    }

    const deliveryProblem = await DeliveryProblems.create({
      description,
      delivery_id: id,
    });

    return res.json(deliveryProblem);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveryProblem = await DeliveryProblems.findAll({
      order: ['created_at'],
      attributes: ['id', 'delivery_id', 'description'],
      limit: 20,
      offset: (page - 1) * 20,
      // include: [
      //   {
      //     model: Order,
      //     as: 'delivery',
      //     attributes: ['id', 'product'],
      //   },
      // ],
    });

    return res.json(deliveryProblem);
  }

  async list(req, res) {
    const { id } = req.params;
    const { page = 1 } = req.query;

    const deliveryProblem = await DeliveryProblems.findAll({
      where: { delivery_id: id },
      order: ['created_at'],
      attributes: ['id', 'delivery_id', 'description'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product'],
        },
      ],
    });

    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryProblem = await DeliveryProblems.findByPk(id);

    if (!deliveryProblem) {
      return res
        .status(400)
        .json({ error: 'Delivery problem does not exists' });
    }

    const order = await Order.findByPk(deliveryProblem.delivery_id, {
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'recipient_id',
        'deliveryman_id',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!order) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    if (order.end_date) {
      return res
        .status(403)
        .json({ error: 'It is not possible to delete a completed order' });
    }

    order.canceled_at = new Date();

    await order.save();

    await Notification.create({
      content: `Olá ${order.deliveryman.name}. Sua entrega para ${order.recipient.name} foi canelada. Para mais detalhes acesse seu email.`,
      deliveryman: order.deliveryman_id,
    });

    await Queue.add(CancellationMail.key, { order });

    return res.json(order);
  }
}

export default new DeliveryProblemsController();
