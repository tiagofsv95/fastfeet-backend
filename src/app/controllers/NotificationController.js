import Notification from '../schemas/Notification';
import Deliveryman from '../models/Deliveryman';

class NotificationController {
  async index(req, res) {
    const { id } = req.params;
    const { page = 1 } = req.query;

    const checkDeliveryman = await Deliveryman.findOne({
      where: { id },
    });

    if (!checkDeliveryman) {
      return res.status(401).json({ error: 'Deliveryman not found' });
    }

    const notifications = await Notification.find({
      deliveryman: id,
    })
      .sort({ createdAt: -1 })
      .limit((page - 2) * 20);

    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
