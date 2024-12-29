import { Inject, Injectable } from '@nestjs/common';
import { app, auth } from 'firebase-admin';
import Auth = auth.Auth;

@Injectable()
export class FirebaseService {
  #db: FirebaseFirestore.Firestore;
  #collection: FirebaseFirestore.CollectionReference;
  #auth: Auth;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.#db = firebaseApp.firestore();

    this.#auth = firebaseApp.auth();
  }

  async getCurrentUser(userSessionId: string) {
    const result = await this.#auth.verifyIdToken(userSessionId);

    return result;
  }
}
