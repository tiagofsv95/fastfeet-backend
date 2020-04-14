import * as Yup from 'yup';

import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Notification from '../schemas/Notification';

import NewOrderMail from '../jobs/NewOrderMail';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      signature_id: Yup.number(),
      product: Yup.string().required(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const recipientExists = await Recipient.findOne({
      where: { id: recipient_id },
    });

    if (!recipientExists) {
      return res.status(401).json({ error: 'Recipíent does not exists' });
    }

    const deliverymanExists = await Deliveryman.findOne({
      where: { id: deliveryman_id },
    });

    if (!deliverymanExists) {
      return res.status(401).json({ error: 'Deliveryman does not exists' });
    }

    const order = await Order.create(req.body);

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    const recipient = await Recipient.findByPk(recipient_id);

    /**
     * Notify delivery
     */

    await Notification.create({
      content: `Olá ${deliveryman.name}. Você tem uma nova entrega para ${recipient.name}.`,
      deliveryman: deliveryman_id,
    });

    await Queue.add(NewOrderMail.key, { deliveryman, recipient, order });

    return res.json(order);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const oders = await Order.findAll({
      where: { canceled_at: null },
      order: ['created_at'],
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
      ],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Recipient,
          as: 'recipient',
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
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(oders);
  }

  async update(req, res) {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    const { recipient_id, deliveryman_id, product } = req.body;

    if (!order) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    if (order.start_date) {
      return res
        .status(403)
        .json({ error: 'It is not possible to update a order in progress' });
    }

    if (order.end_date) {
      return res
        .status(403)
        .json({ error: 'It is not possible to delete a completed order' });
    }

    order.recipient_id = recipient_id;
    order.deliveryman_id = deliveryman_id;
    order.product = product;

    await order.save();

    return res.json(order);
  }

  async delete(req, res) {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
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

export default new OrderController();
