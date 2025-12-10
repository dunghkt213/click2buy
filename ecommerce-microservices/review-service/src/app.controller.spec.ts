import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { userInfo } from 'os';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockAppService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: mockAppService },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 🧪 CREATE
  it('should create a review', async () => {
    const dto = { productId: 'p1', userId: 'u1', rating: 5 };
    const result = { success: true, data: { ...dto, _id: '1' } };
    mockAppService.create.mockResolvedValue(result);

    const response = await appController.create({ dto }, userInfo);
    expect(response).toEqual(result);
    expect(mockAppService.create).toHaveBeenCalledWith(dto);
  });

  // 🧪 FIND ALL
  it('should return all reviews', async () => {
    const result = { success: true, data: [{ _id: '1', rating: 5 }] };
    mockAppService.findAll.mockResolvedValue(result);

    const response = await appController.findAll({ q: {} });
    expect(response).toEqual(result);
    expect(mockAppService.findAll).toHaveBeenCalledWith({});
  });

  // 🧪 FIND ONE
  it('should return one review', async () => {
    const result = { success: true, data: { _id: '1', rating: 4 } };
    mockAppService.findOne.mockResolvedValue(result);

    const response = await appController.findOne({ id: '1' });
    expect(response).toEqual(result);
    expect(mockAppService.findOne).toHaveBeenCalledWith('1');
  });

  // 🧪 UPDATE
  it('should update a review', async () => {
    const dto = { rating: 4 };
    const result = { success: true, data: { _id: '1', rating: 4 } };
    mockAppService.update.mockResolvedValue(result);

    const response = await appController.update({ id: '1', dto }, userInfo);
    expect(response).toEqual(result);
    expect(mockAppService.update).toHaveBeenCalledWith('1', dto);
  });

  // 🧪 REMOVE
  it('should remove a review', async () => {
    const result = { success: true, message: 'Review deleted successfully' };
    mockAppService.remove.mockResolvedValue(result);

    const response = await appController.remove({ id: '1' }, userInfo);
    expect(response).toEqual(result);
    expect(mockAppService.remove).toHaveBeenCalledWith('1');
  });
});
