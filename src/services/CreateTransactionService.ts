// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    let categoryExist = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExist) {
      categoryExist = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryExist);
    }

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total - value < 0) {
        throw new AppError(
          "You can't create an outcome that are greater than your total",
        );
      }
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      category: categoryExist,
      type,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
