import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import OrderController from './app/controllers/OrderController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveriedController from './app/controllers/DeliveriedController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';
import OrderProblems from './app/controllers/OrderProblems';
import StartDeliveryController from './app/controllers/StartDeliveryController';
import EndDeliveryController from './app/controllers/EndDeliveryController';
import NotificationController from './app/controllers/NotificationController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/delivery/:id', DeliveryController.index);
routes.get('/delivery/:id/deliveries', DeliveriedController.index);

routes.post('/delivery/:id/problems', DeliveryProblemsController.store);
routes.get('/delivery/:id/problems', OrderProblems.index);

routes.post('/end_delivery/:id', EndDeliveryController.store);
routes.post('/start_delivery/:id', StartDeliveryController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/deliverymans', DeliverymanController.index);
routes.post('/deliverymans', DeliverymanController.store);
routes.put('/deliverymans/:id', DeliverymanController.update);
routes.delete('/deliverymans/:id', DeliverymanController.delete);

routes.get('/orders', OrderController.index);
routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

routes.get('/notifications/:id', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.get('/deliveryproblems', DeliveryProblemsController.index);
routes.delete('/delivery/:id/cancel', DeliveryProblemsController.delete);

export default routes;
