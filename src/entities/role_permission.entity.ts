import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'role_permissions' })
export class Permission {

    @ManyToOne(() => Role, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @ManyToOne(() => Permission)
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;

}