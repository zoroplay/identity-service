import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { CustomersService } from './customers.service';
import { CUSTOMER_SERVICE, CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @GrpcMethod(CUSTOMER_SERVICE, 'createCustomers')
  createCustomers(createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @GrpcMethod(CUSTOMER_SERVICE, 'updateCustomer')
  updateCustomer(updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(updateCustomerDto);
  }

  @GrpcMethod(CUSTOMER_SERVICE, 'deleteCustomer')
  deleteCustomer(createCustomerDto: CreateCustomerDto) {
    return this.customersService.remove(createCustomerDto);
  }
}
