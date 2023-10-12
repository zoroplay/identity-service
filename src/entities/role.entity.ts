import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'roles' })
export class Role {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 300, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    description: string;

    @Column()
    isActive: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

}