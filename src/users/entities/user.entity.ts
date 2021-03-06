import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Article } from '../../articles/entities/article.entity';
import { salt, sign } from '../utils/password';

@Entity()
@ObjectType()
export class User {
  @Field(() => String, { description: 'Id field' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Name field' })
  @Column({ length: 50 })
  name: string;

  @Field(() => String, { description: 'Username field' })
  @Column({ length: 50, unique: true })
  username: string;

  @Field(() => String, { description: 'Email field' })
  @Column({ length: 50, unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Field(() => [Article], { description: 'Articles field' })
  @OneToMany(() => Article, (article: Article) => article.user, {
    nullable: false,
  })
  articles: Article[];

  @Field(() => GraphQLISODateTime, { description: 'createdAt field' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { description: 'updatedAt field' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  hashPasswordCreate(): void {
    const generatedSalt = salt(parseInt(process.env.HASH_SALT_ROUNDS));
    this.password = sign(this.password, generatedSalt);
  }

  @BeforeUpdate()
  hashPasswordUpdate(): void {
    if (this.password) {
      const generatedSalt = salt(parseInt(process.env.HASH_SALT_ROUNDS));
      this.password = sign(this.password, generatedSalt);
    }
  }
}
