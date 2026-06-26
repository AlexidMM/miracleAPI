import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  create(createContactDto: CreateContactDto) {
    const newContact = this.contactRepository.create(createContactDto);
    return this.contactRepository.save(newContact);
  }

  findAll() {
    // Los ordenamos para que el más nuevo salga primero
    return this.contactRepository.find({ order: { createdAt: 'DESC' } });
  }
}
