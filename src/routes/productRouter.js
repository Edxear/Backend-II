import CustomRouter from '../utils/customRouter.js';
import { uploader } from '../utils/multerUtil.js';
import { productController } from '../controllers/productController.js';

const custom = new CustomRouter();

custom.get('/', ['PUBLIC'], productController.getAll);
custom.get('/:pid', ['PUBLIC'], productController.getById);
custom.post('/', ['admin'], uploader.array('thumbnails', 3), productController.create);
custom.put('/:pid', ['admin'], uploader.array('thumbnails', 3), productController.update);
custom.delete('/:pid', ['admin'], productController.remove);

export default custom.getRouter();
