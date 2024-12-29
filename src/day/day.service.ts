import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class DayService {
  constructor(private firebase: FirebaseService) {}

  getCurrentUser(authorization: string) {
    const [type, token] = authorization.split(' ');
    console.log(token);
    this.firebase.getCurrentUser(token);
  }
}
