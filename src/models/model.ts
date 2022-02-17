import {Entity, PrimaryGeneratedColumn, Column, createConnection, Connection, Repository, ManyToMany, JoinTable} from 'typeorm';

@Entity()
export class Pizza {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column('text')
  description: string;

  @Column()
  price: number;
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  totalCost: number;

  @ManyToMany(type => Pizza) @JoinTable() 
  pizzas: Pizza[];
}

let connection:Connection;

export async function getPizzaRepository(): Promise<Repository<Pizza>> {
  if (connection===undefined) {
    connection = await createConnection({
      type: 'sqlite',
      database: 'myangularapp',
      synchronize: true,
      entities: [
        Pizza,
        Order
      ],
    });
  }

  return connection.getRepository(Pizza);
}