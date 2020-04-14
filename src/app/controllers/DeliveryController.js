// import { startOfDay, endOfDay, parseISO } from 'date-fns';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveryController {
  async index(req, res) {
    const { id } = req.params;
    const { page = 1 } = req.query;

    const checkDeliveryman = await Deliveryman.findOne({
      where: { id },
    });

    if (!checkDeliveryman) {
      return res.status(401).json({ error: 'Deliveryman not found' });
    }

    const deliverymanOrder = await Order.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: null,
      },
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

    return res.json(deliverymanOrder);
  }
}

export default new DeliveryController();
